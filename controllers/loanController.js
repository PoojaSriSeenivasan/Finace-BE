const Loan = require("../models/LoanModel");

exports.applyLoan = async (req, res) => {
  const { loanType, amount, phone, email, pincode } = req.body;
  if (!loanType || !amount || !phone || !email || !pincode) return res.status(400).json({ message: 'All fields required' });

  await new Loan({ loanType, amount, phone, email, pincode, userId: req.userId }).save();
  res.status(201).json({ message: 'Loan applied' });
};

exports.getAllLoans = async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const loans = await Loan.find().populate('userId', 'name email phone');
  res.json(loans);
};
