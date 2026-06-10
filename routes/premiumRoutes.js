const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const auth = require('../middleware/auth');

router.get('/showleaderboard', auth.authenticate, premiumController.showLeaderboard);

module.exports = router;
