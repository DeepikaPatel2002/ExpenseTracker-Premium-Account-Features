


const User = require('../models/User');
const transporter = require('../config/mailer');
const ForgotPasswordRequest = require('../models/ForgotPasswordRequest');
const bcrypt = require('bcryptjs');

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
 const request = await ForgotPasswordRequest.create({
  userId: user.id,
  isActive: true
});

console.log("Reset Request Created:", request.id);

   const resetLink =
  `http://localhost:4000/password/resetpassword/${request.id}`;

await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: 'Reset Your Password',
  html: `
    <h2>Password Reset</h2>

    <p>Click the link below to reset your password:</p>

    <a href="${resetLink}">
      Reset Password
    </a>
  `
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



exports.resetPassword = async (req, res) => {
  try {

    const requestId = req.params.id;

    const request = await ForgotPasswordRequest.findOne({
      where: {
        id: requestId,
        isActive: true
      }
    });

    if (!request) {
      return res.status(404).send('Invalid or expired reset link');
    }

    res.send(`
  <html>
    <body>
      <h2>Reset Password</h2>

      <form action="/password/updatepassword/${requestId}" method="POST">

        <input
          type="password"
          name="newPassword"
          placeholder="Enter New Password"
          required
        />

        <button type="submit">
          Update Password
        </button>

      </form>

    </body>
  </html>
`);

  } catch (err) {
    console.log(err);

    res.status(500).send('Server Error');
  }
};
     



exports.updatePassword = async (req, res) => {
  try {

    const requestId = req.params.id;
    const { newPassword } = req.body;

    const request = await ForgotPasswordRequest.findOne({
      where: {
        id: requestId,
        isActive: true
      }
    });

    if (!request) {
      return res.status(404).send('Invalid or expired reset link');
    }

    const user = await User.findByPk(request.userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    request.isActive = false;
    await request.save();

    res.send('Password updated successfully. You can now login.');

  } catch (err) {

    console.log(err);

    res.status(500).send('Failed to update password');
  }
};