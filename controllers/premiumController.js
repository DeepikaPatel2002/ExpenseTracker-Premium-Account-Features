

const User = require('../models/User');
const Expense = require('../models/Expense');
const { Parser } = require('json2csv');

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.findAll({
      attributes: ['username', 'totalExpense'],
      order: [['totalExpense', 'DESC']]
    });
    res.status(200).json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    const fields = ['id', 'amount', 'description', 'category', 'createdAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(expenses.map(e => e.toJSON()));

    res.header('Content-Type', 'text/csv');
    res.attachment('expenses_report.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
};


// const User = require('../models/User');

// exports.getLeaderboard = async (req, res) => {
//   try {

//     const leaderboard = await User.findAll({
//       attributes: ['id', 'username', 'totalExpense'],
//       order: [['totalExpense', 'DESC']]
//     });

//     res.status(200).json(leaderboard);

//   } catch (err) {
//     console.log(err);

//     res.status(500).json({
//       error: 'Failed to fetch leaderboard'
//     });
//   }
// };