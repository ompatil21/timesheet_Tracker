const mongoose = require('mongoose');

// One per user: their Humanforce calendar subscription link + sync health.
const syncConfigSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true,
    },
    provider: {
      type: String,
      default: 'humanforce',
    },
    // AES-256-GCM encrypted ICS URL (iv:tag:ciphertext hex)
    icsUrlEncrypted: {
      type: String,
      required: true,
    },
    // Non-sensitive hint shown in the UI so the user can recognise the saved link
    urlHint: {
      type: String,
    },
    lastSyncAt: {
      type: Date,
    },
    lastSyncStatus: {
      type: String,
      enum: ['never', 'success', 'failed'],
      default: 'never',
    },
    lastSyncError: {
      type: String,
    },
    lastShiftCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SyncConfig', syncConfigSchema);
