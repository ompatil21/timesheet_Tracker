const Payslip = require('../models/Payslip');
const TimeLog = require('../models/TimeLog');
const pdfParse = require('pdf-parse');

// @desc    Get user's payslips
// @route   GET /api/payslips
// @access  Private
const getPayslips = async (req, res) => {
  try {
    const payslips = await Payslip.find({ user: req.user._id }).populate('client', ['name']).sort({ periodStart: -1 });
    res.json(payslips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload and parse a new payslip
// @route   POST /api/payslips
// @access  Private
const uploadPayslip = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file provided.' });
    }

    const { periodStart, periodEnd, client } = req.body;
    
    if (!periodStart || !periodEnd || !client) {
        return res.status(400).json({ message: 'Please provide employer and date range.' });
    }

    // 1. Fetch Expected Logs
    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    end.setHours(23, 59, 59, 999);

    // Duplicate Check
    const existingPayslip = await Payslip.findOne({
      user: req.user._id,
      client: client,
      periodStart: start,
      periodEnd: end
    });

    if (existingPayslip) {
      return res.status(400).json({ message: 'A payslip scan for this exact employer and date range has already been recorded.' });
    }

    const timeLogs = await TimeLog.find({
      user: req.user._id,
      client: client,
      date: { $gte: start, $lte: end }
    });

    if (timeLogs.length === 0) {
      return res.status(400).json({ message: 'No timesheets logged for this date range. Cannot validate.' });
    }

    let expectedHours = 0;
    let expectedPay = 0;

    timeLogs.forEach(log => {
      expectedHours += log.hours;
      expectedPay += log.earnedRevenue;
    });

    // 2. Parse the PDF buffer
    const data = await pdfParse(req.file.buffer);
    let pdfText = data.text;
    
    // Check if empty
    if (!pdfText || pdfText.trim().length === 0) {
        return res.status(400).json({ message: 'No readable text found. Scanned images are not currently supported.' });
    }

    // Clean text for regex matching
    pdfText = pdfText.replace(/\s+/g, ' ');

    // 3. Smart Regex Extraction
    let extractedGross = null;
    let extractedNett = null;
    let extractedTax = null;

    // Look for GROSS followed by numbers
    const grossMatch = pdfText.match(/GROSS\s+\$?\s*([\d,\.]+)/i) || pdfText.match(/TOTAL\s+PAY\s+\$?\s*([\d,\.]+)/i);
    if (grossMatch) extractedGross = parseFloat(grossMatch[1].replace(/,/g, ''));

    // Look for NETT or NET PAY
    const nettMatch = pdfText.match(/NETT\s+\$?\s*([\d,\.]+)/i) || pdfText.match(/NET\s+PAY\s+\$?\s*([\d,\.]+)/i);
    if (nettMatch) extractedNett = parseFloat(nettMatch[1].replace(/,/g, ''));

    // Look for TAX
    const taxMatch = pdfText.match(/TAX\s+\$?\s*([\d,\.]+)/i);
    if (taxMatch) extractedTax = parseFloat(taxMatch[1].replace(/,/g, ''));

    // If we couldn't extract the gross pay, we cannot validate
    if (extractedGross === null) {
      return res.status(400).json({ message: 'Could not automatically find the Gross Pay amount in this PDF. Please check the file.' });
    }

    // 4. Comparison Logic (With $0.05 Tolerance)
    const difference = Math.abs(expectedPay - extractedGross);
    const isMatch = difference <= 0.05;

    // Create record
    const payslip = new Payslip({
      user: req.user._id,
      client,
      periodStart: start,
      periodEnd: end,
      paidHours: expectedHours,
      paidAmount: extractedGross,
      status: isMatch ? 'match' : 'mismatch',
      fileUrl: 'memory' // Since we don't save to disk
    });

    const savedPayslip = await payslip.save();
    
    res.status(201).json({
      message: 'Payslip parsed successfully',
      match: isMatch,
      expectedPay,
      expectedHours,
      extractedGross,
      extractedNett,
      extractedTax,
      difference,
      payslip: savedPayslip,
    });

  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to process PDF' });
  }
};

// @desc    Delete payslip
// @route   DELETE /api/payslips/:id
// @access  Private
const deletePayslip = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id);

    if (!payslip) {
      return res.status(404).json({ message: 'Payslip not found' });
    }

    if (payslip.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await payslip.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadPayslip, getPayslips, deletePayslip };
