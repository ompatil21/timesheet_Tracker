const mongoose = require('mongoose');

const timeLogSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Client',
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
    },
    hours: {
      type: Number,
      required: [true, 'Please add hours worked'],
    },
    notes: {
      type: String,
    },
    isPublicHoliday: {
      type: Boolean,
      default: false,
    },
    earnedOrdinary: {
      type: Number,
      required: true,
      default: 0,
    },
    earnedCasual: {
      type: Number,
      required: true,
      default: 0,
    },
    earnedRevenue: {
      type: Number,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TimeLog', timeLogSchema);
