
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// exports.authenticate = async (req, res, next) => {
//   try {
//     const authHeader = req.header('Authorization');
//     if (!authHeader) return res.status(401).json({ error: 'Token missing' });

//     console.log("Auth header received:", authHeader);

//     const token = authHeader.split(' ')[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     console.log("Decoded token:", decoded); //  Debug print

//     const user = await User.findByPk(decoded.userId); //  must match payload key
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     req.user = user;
//     next();
//   } catch (err) {
//     console.error("Auth error:", err.message);
//     res.status(401).json({ error: 'Unauthorized' });
//   }
// };




















const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = async (req, res, next) => {
    try {

        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({
                error: 'Token missing'
            });
        }

        let token;

        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else {
            token = authHeader;
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findByPk(
            decoded.userId
        );

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        req.user = user;

        next();

    } catch (err) {

        console.error(err);

        res.status(401).json({
            error: 'Unauthorized'
        });
    }
};