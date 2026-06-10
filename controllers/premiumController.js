



const User = require('../models/User');

exports.getLeaderboard = async (req, res) => {
  try {

    const leaderboard = await User.findAll({
      attributes: ['id', 'username', 'totalExpense'],
      order: [['totalExpense', 'DESC']]
    });

    res.status(200).json(leaderboard);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: 'Failed to fetch leaderboard'
    });
  }
};