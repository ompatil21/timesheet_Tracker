const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.post('/register', asyncHandler(registerUser));
router.post('/login', asyncHandler(authUser));
router.route('/profile').get(protect, asyncHandler(getUserProfile));

module.exports = router;
