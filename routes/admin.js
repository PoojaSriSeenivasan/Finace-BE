const express = require('express');
const User = require("../models/UserModel");
const transporter = require('../config/email');

const router = express.Router();

// Approve User
router.post('/approve/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Send approval email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your Account is Approved",
      text: `Hi ${user.name},\n\nYour account has been approved.\n\nRegards,\nAdmin`
    });

    res.json({ message: 'User approved and email sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
