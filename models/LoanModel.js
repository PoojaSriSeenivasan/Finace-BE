const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  businessType: String,
  phone: String,
  pincode: String,
  address: String,
  category: { type: String, enum: ['Secured Loan', 'Unsecured Loan', 'Machinery Loan'] },
  amount: { type: Number, max: 1000000 },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);
