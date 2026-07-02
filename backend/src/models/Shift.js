const mongoose = require('mongoose');

// A scheduled shift pulled from the user's Humanforce ICS feed (read-only mirror).
const shiftSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // ICS VEVENT UID — stable identifier used for upserts
    uid: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: 'Shift',
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
    },
    source: {
      type: String,
      default: 'humanforce',
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

shiftSchema.index({ user: 1, uid: 1 }, { unique: true });
shiftSchema.index({ user: 1, start: 1 });

module.exports = mongoose.model('Shift', shiftSchema);
