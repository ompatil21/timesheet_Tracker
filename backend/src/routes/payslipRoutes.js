const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadPayslip, getPayslips, deletePayslip } = require('../controllers/payslipController');
const { protect } = require('../middleware/auth');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

router.route('/')
  .get(protect, getPayslips)
  .post(protect, upload.single('payslip'), uploadPayslip);

router.route('/:id')
  .delete(protect, deletePayslip);

module.exports = router;
