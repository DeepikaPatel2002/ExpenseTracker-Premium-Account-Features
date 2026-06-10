


require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (user) => {

    console.log("User passed to token:", user);

    return jwt.sign(
        {
            userId: user.id,
            isPremiumUser: user.isPremiumUser || false
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};
  

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

console.log("User from DB:", user);

        const token = generateToken(user);

        res.status(200).json({
            message: 'Login successful',
            token,
            username: user.username
        });

    }
    
    catch (err) {
  console.log("========== LOGIN ERROR ==========");
  console.log(err);
  console.log("Message:", err.message);
  console.log("===============================");

  res.status(500).json({
    error: err.message
  });
}

};

exports.upgradeToPremium = async (req, res) => {
  try {
    req.user.isPremiumUser = true;
    await req.user.save();
    res.json({ message: 'User upgraded to premium successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upgrade user' });
  }
};
