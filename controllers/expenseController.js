const Expense = require('../models/Expense');

// Add expense
exports.addExpense = async (req, res) => {
  try {
    const { amount, description, category } = req.body;
    const expense = await Expense.create({
      amount,
      description,
      category,
      userId: req.user.id   //  FIXED: use id not userId
    });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add expense' });
  }
};

// Get all expenses for logged-in user
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } }); //  FIXED
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {

    const expense = await Expense.findOne({
   where: {
      id: req.params.id,
      userId: req.user.id
   }
});

if (!expense) {
   return res.status(404).json({
      error: 'Expense not found'
   });
}

await expense.destroy();


    // const expense = await Expense.findByPk(req.params.id);

    // if (!expense)
    //    return res.status(404).json({ error: 'Expense not found' });

    // await expense.destroy();

    res.json({ message: 'Expense deleted successfully' });
  }
   catch (err) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};


