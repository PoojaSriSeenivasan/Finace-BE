const express = require('express');
const Loan = require('../models/LoanModel');
const User = require('../models/UserModel');
const auth = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');

const router = express.Router();

// 📌 Loan Apply (User)
router.post('/', auth(['user']), async (req, res) => {
  try {
    const { name, businessType, phone, pincode, address, category, amount } = req.body;

    // Validate required fields
    if (!name || !businessType || !phone || !pincode || !address || !category || !amount) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Validate amount limit
    if (amount > 1000000) {
      return res.status(400).json({ success: false, message: 'Loan amount cannot exceed 1,000,000' });
    }

    // Validate category
    const validCategories = ['Secured Loan', 'Unsecured Loan', 'Machinery Loan'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid loan category' });
    }

    const loan = new Loan({
      userId: req.user.id,
      name,
      businessType,
      phone,
      pincode,
      address,
      category,
      amount
    });

    await loan.save();
    res.status(201).json({ success: true, message: 'Loan application submitted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📌 Get All Loans (Admin)
router.get('/all', auth(['admin']), async (req, res) => {
  try {
    const loans = await Loan.find().populate('userId', 'name email');
    res.json({ success: true, loans });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📌 Approve Loan
router.put('/:id/approve', auth(['admin']), async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true }
    );

    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    const user = await User.findById(loan.userId);

    // Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Loan Approval',
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #28a745;">Congratulations, ${user.name}!</h2>
      <p>Your loan application has been <strong style="color: green;">approved</strong>.</p>
      <p>We’re excited to work with you. Our team will contact you soon for the next steps.</p>
      <br/>
      <p style="font-size: 14px; color: #555;">If you have any questions, please contact us at <a href="tel:9876543210">9876543210</a>.</p>
      <p style="font-size: 12px; color: #777;">Thank you for choosing us!</p>
    </div>
  `
    });

    res.json({ success: true, message: 'Loan approved and email sent' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📌 Reject Loan
// 📌 Reject Loan
router.put('/:id/reject', auth(['admin']), async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected' },
      { new: true }
    );

    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    const user = await User.findById(loan.userId);

    // Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Loan Rejection Notice',
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #dc3545;">Hello ${user.name},</h2>
      <p>We regret to inform you that your loan application has been <strong style="color: red;">rejected</strong>.</p>
      <p>For more information, please contact us at:</p>
      <p style="font-size: 16px; font-weight: bold;"><a href="tel:9876543210">9876543210</a></p>
      <br/>
      <p style="font-size: 12px; color: #777;">Thank you for your interest in our services.</p>
    </div>
  `
    });

    res.json({ success: true, message: 'Loan rejected and email sent' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📌 Delete Loan
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const loan = await Loan.findByIdAndDelete(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    res.json({ success: true, message: 'Loan deleted successfully' });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
