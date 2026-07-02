const express = require('express');
const router = express.Router();
const { getClients, createClient, updateClient, deleteClient } = require('../controllers/clientController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.route('/').get(protect, asyncHandler(getClients)).post(protect, asyncHandler(createClient));
router.route('/:id').put(protect, asyncHandler(updateClient)).delete(protect, asyncHandler(deleteClient));

module.exports = router;
