

const Expense = require('../models/Expense');
const User = require('../models/User');
const { GoogleGenAI } = require("@google/genai");



// Add expense with AI categorization
const sequelize = require('../config/db'); // IMPORTANT

exports.addExpense = async (req, res) => {
  const t = await sequelize.transaction(); // 1. START TRANSACTION

  try {
    const { amount, description } = req.body;

    let category = "Uncategorized";


try {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{
      role: "user",
      parts: [{
        text: `Return ONLY ONE WORD category for this expense: ${description}`
      }]
    }]
  });

  console.log("FULL AI RESPONSE:", JSON.stringify(response, null, 2));

  category =
    response.text ||
    response.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Uncategorized";

  if (category.includes("\n")) {
    category = category.split("\n")[0];
  }

  category = category.replace(/[^a-zA-Z]/g, "").trim();

} catch (err) {
  console.error("AI failed:", err);
}


    // 2. CREATE EXPENSE inside transaction
    const expense = await Expense.create({
      amount,
      description,
      category,
      userId: req.user.id
    }, { transaction: t });

    // 3. UPDATE USER inside transaction
    req.user.totalExpense += Number(amount);
    await req.user.save({ transaction: t });

    // 4. COMMIT if everything succeeds
    await t.commit();

    return res.json({
      message: "Expense added successfully",
      expense,
      totalExpense: req.user.totalExpense
    });

  } catch (err) {

    // 5. ROLLBACK if anything fails
    await t.rollback();

    console.error("Transaction failed:", err);

    return res.status(500).json({
      error: "Failed to add expense (rolled back)"
    });
  }
};



// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    req.user.totalExpense = Math.max(0, req.user.totalExpense - Number(expense.amount));
    await req.user.save();

    await expense.destroy();

    res.json({ 
      message: 'Expense deleted successfully', 
      totalExpense: req.user.totalExpense 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};
