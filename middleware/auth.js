const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ error: 'Token missing' });

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired, please login again' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

exports.requirePremium = (req, res, next) => {
  if (!req.user.isPremiumUser) {
    return res.status(403).json({ error: 'Premium membership required' });
  }
  next();
};

// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// exports.authenticate = async (req, res, next) => {
//   try {

//     const authHeader = req.header('Authorization');

//     console.log("Authorization Header:", authHeader);

//     if (!authHeader) {
//       return res.status(401).json({
//         error: 'Token missing'
//       });
//     }

//     let token;

//     if (authHeader.startsWith('Bearer ')) {
//       token = authHeader.split(' ')[1];
//     } else {
//       token = authHeader;
//     }

//     console.log("JWT Secret Exists:", !!process.env.JWT_SECRET);
//     console.log("Token:", token);

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET
//     );

//     console.log("Decoded Token:", decoded);

//     const user = await User.findByPk(decoded.userId);

//     console.log("User Found:", user ? user.id : "No User");

//     if (!user) {
//       return res.status(404).json({
//         error: 'User not found'
//       });
//     }

//     req.user = user;

//     next();

//   } catch (err) {

//     console.log("========== AUTH ERROR ==========");
//     console.log(err);
//     console.log("Message:", err.message);
//     console.log("===============================");

//     res.status(401).json({
//       error: 'Unauthorized'
//     });
//   }
// };