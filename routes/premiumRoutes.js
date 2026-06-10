


const express = require('express');
const router = express.Router();

const premiumController = require('../controllers/premiumController');
const auth = require('../middleware/auth');

router.get(
  '/leaderboard',
  auth.authenticate,
  premiumController.getLeaderboard
);

module.exports = router;