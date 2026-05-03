const express = require('express');
const router = express.Router();
const { getTimeLogs, createTimeLog, updateTimeLog, deleteTimeLog } = require('../controllers/timelogController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getTimeLogs).post(protect, createTimeLog);
router.route('/:id').put(protect, updateTimeLog).delete(protect, deleteTimeLog);

module.exports = router;
