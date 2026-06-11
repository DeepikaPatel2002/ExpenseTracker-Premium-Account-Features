const express = require("express");
const router = express.Router();
const transporter = require("../config/mailer");

router.get("/test", async (req, res) => {
  console.log("MAIL ROUTE HIT"); 

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Email",
      text: "SMTP working"
    });

    console.log("EMAIL SENT:", info);

    res.json({ message: "Email sent successfully" });

  } catch (err) {
    console.error("EMAIL ERROR:", err);
    res.status(500).json({ error: "Email failed" });
  }
});

module.exports = router;