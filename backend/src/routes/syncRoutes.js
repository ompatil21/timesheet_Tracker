const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  getSyncStatus,
  testConnection,
  saveSyncConfig,
  syncNow,
  deleteSyncConfig,
  getShifts,
} = require('../controllers/syncController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// Endpoints below trigger outbound fetches of user-supplied URLs — keep a
// tight per-user budget so the server can't be used as a request cannon.
// Runs after `protect`, so req.user is always set.
const outboundLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user.id,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many sync requests — try again in a few minutes' },
});

router.route('/')
  .get(protect, asyncHandler(getSyncStatus))
  .put(protect, outboundLimiter, asyncHandler(saveSyncConfig))
  .delete(protect, asyncHandler(deleteSyncConfig));

router.post('/test', protect, outboundLimiter, asyncHandler(testConnection));
router.post('/now', protect, outboundLimiter, asyncHandler(syncNow));
router.get('/shifts', protect, asyncHandler(getShifts));

module.exports = router;
