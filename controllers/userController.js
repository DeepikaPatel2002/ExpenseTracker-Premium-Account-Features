

// require('dotenv').config();
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const User = require('../models/User');


// exports.signup = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     const hash = await bcrypt.hash(password, 10);
//     const user = await User.create({ username, email, password: hash });
//     res.json(user);
//   } 
//   catch (err) {
//      console.error("Signup error:", err);
//     res.status(500).json({ error: 'Signup failed' });
//   }
// };


// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ where: { email } });
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(401).json({ error: 'Invalid password' });

//     // Debug to confirm secret
//     console.log("Login secret:", process.env.JWT_SECRET);

//     // Use the same secret as middleware
//     const token = jwt.sign(
//       { userId: user.id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     // 🔹 Add this line before sending response
//     console.log("Sending token to client:", token);

//     // Send token to frontend
//     res.json({ token });
//   } 
//   catch (err) {
//     console.error("Login error:", err.message);
//     res.status(500).json({ error: 'Login failed' });
//   }
// };





// require('dotenv').config();
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const User = require('../models/User');

// // const bcrypt = require('bcrypt');
// // const jwt = require('jsonwebtoken');
// // const User = require('../models/User');

// // Signup
// exports.signup = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     const hash = await bcrypt.hash(password, 10);
//     const user = await User.create({ username, email, password: hash });
//     res.json({ message: 'Signup successful', user });
//   } catch (err) {
//     res.status(500).json({ error: 'Signup failed' });
//   }
// };


// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ where: { email } });
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

//     //  generate token with userId
//     const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ error: 'Login failed' });
//   }
// };









//chatGPT
require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            isPremiumUser: user.isPremiumUser || false
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

// Signup
// exports.signup = async (req, res) => {
//     try {
//         const { username, email, password } = req.body;

//         if (!username || !email || !password) {
//             return res.status(400).json({
//                 message: 'All fields are required'
//             });
//         }

//         const existingUser = await User.findOne({
//             where: { email }
//         });

//         if (existingUser) {
//             return res.status(400).json({
//                 message: 'User already exists'
//             });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         await User.create({
//             username,
//             email,
//             password: hashedPassword
//         });

//         res.status(201).json({
//             message: 'Signup successful'
//         });

//     } catch (err) {
//         console.error(err);

//         res.status(500).json({
//             message: 'Signup failed'
//         });
//     }
// };



exports.signup = async (req, res) => {
  try {
    console.log("Signup Request Body:", req.body);

    const { username, email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hash
    });

    console.log("User Created:", user.id);

    res.status(201).json({
      message: "Signup successful"
    });

  } catch (err) {

    console.error("========== SIGNUP ERROR ==========");
    console.error(err);
    console.error("==================================");

    res.status(500).json({
      error: err.message
    });
  }
};

exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and Password are required'
            });
        }

        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid password'
            });
        }

        const token = generateToken(user);

        res.status(200).json({
            message: 'Login successful',
            token,
            username: user.username
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: 'Login failed'
        });
    }
};