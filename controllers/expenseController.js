

const Expense = require('../models/Expense');
const User = require('../models/User');
const { GoogleGenAI } = require("@google/genai");

// Add expense with AI categorization
exports.addExpense = async (req, res) => {
  try {
    const { amount, description } = req.body;

    let category = "Uncategorized";
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: `Suggest one category for this expense: ${description}` }]}]
      });

      console.log("Gemini raw response:", JSON.stringify(response, null, 2));

      // Improved parser
      const candidateText = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText) {
        category = candidateText.replace(/Category:\s*/i, "").trim();
      } else {
        category = "Uncategorized";
      }

      console.log("AI suggested category:", category);
    } catch (err) {
      console.error("AI categorization failed:", err);
    }

    const expense = await Expense.create({
      amount,
      description,
      category,
      userId: req.user.id
    });

    req.user.totalExpense += Number(amount);
    await req.user.save();

    res.json({
      message: "Expense added successfully",
      expense,
      totalExpense: req.user.totalExpense
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add expense" });
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

