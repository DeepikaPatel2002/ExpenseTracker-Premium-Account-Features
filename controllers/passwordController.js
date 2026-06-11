


const User = require('../models/User');
const transporter = require('../config/mailer');

exports.forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: 'This is a dummy password reset email from Expense Tracker.'
    });

    res.status(200).json({
      message: 'Reset email sent successfully'
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Failed to send email'
    });
  }
};