const mongoose = require('mongoose');

const clientSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add an employer name'],
    },
    ordinaryRate: {
      type: Number,
      required: [true, 'Please add an ordinary hourly rate'],
    },
    casualLoading: {
      type: Number,
      default: 0,
    },
    // Optional higher base rate for supervisor/senior shifts (e.g. Delaware North $26.70 vs $25.85)
    supervisorRate: {
      type: Number,
    },
    saturdayRate: {
      type: Number,
    },
    sundayRate: {
      type: Number,
    },
    holidayRate: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Client', clientSchema);
