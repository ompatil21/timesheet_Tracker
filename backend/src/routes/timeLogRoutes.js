const express = require('express');
const router = express.Router();
const { getTimeLogs, createTimeLog, updateTimeLog, deleteTimeLog } = require('../controllers/timeLogController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.route('/').get(protect, asyncHandler(getTimeLogs)).post(protect, asyncHandler(createTimeLog));
router.route('/:id').put(protect, asyncHandler(updateTimeLog)).delete(protect, asyncHandler(deleteTimeLog));

module.exports = router;
