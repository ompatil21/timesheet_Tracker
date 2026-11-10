const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const rateLimit = require('express-rate-limit');

// Spam protection: cap new accounts per IP, on top of the general auth limiter.
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: parseInt(process.env.SIGNUP_RATE_LIMIT_MAX, 10) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many sign-ups from this network. Please try again later.' },
});

router.post('/register', signupLimiter, asyncHandler(registerUser));
router.post('/login', asyncHandler(authUser));
router.route('/profile').get(protect, asyncHandler(getUserProfile));

module.exports = router;
