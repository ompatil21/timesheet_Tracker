const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  },
  periodStart: {
    type: Date,
    required: true,
  },
  periodEnd: {
    type: Date,
    required: true,
  },
  paidHours: {
    type: Number,
    required: true,
  },
  paidAmount: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['match', 'mismatch', 'error'],
    default: 'match'
  },
  fileUrl: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Payslip', payslipSchema);
