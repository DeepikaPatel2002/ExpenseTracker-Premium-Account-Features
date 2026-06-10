
const User = require('../models/User');
const Expense = require('../models/Expense');

exports.showLeaderboard = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name'],
      include: [{ model: Expense, attributes: ['amount'] }]
    });

    const leaderboard = users.map(user => {
      const totalExpense = user.expenses.reduce((sum, e) => sum + e.amount, 0);
      return { name: user.name, totalExpense };
    });

    leaderboard.sort((a, b) => b.totalExpense - a.totalExpense);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
};
