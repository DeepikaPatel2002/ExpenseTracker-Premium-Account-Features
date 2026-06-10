const User = require('../models/User');
const Expense = require('../models/Expense');
const sequelize = require('../config/db');  
const { Parser } = require('json2csv');

exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.findAll({
      attributes: [
        'id',
        'username',
        [sequelize.fn('SUM', sequelize.col('expenses.amount')), 'totalExpense']
      ],
      include: [{ model: Expense, attributes: [] }],
      group: ['User.id'],
      order: [[sequelize.literal('totalExpense'), 'DESC']]
    });

    //  Debug log: check what data is coming back
    console.log(JSON.stringify(leaderboard, null, 2));

    res.status(200).json(leaderboard);
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

