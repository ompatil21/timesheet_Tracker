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
    // Parse as UTC dates so filtering is consistent with how logs are stored (UTC midnight)
    const start = new Date(periodStart);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(periodEnd);
    end.setUTCHours(23, 59, 59, 999);

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

    // Match GROSS but NOT GROSS followed by "EARNINGS" or "PAY" labels elsewhere —
    // try most-specific patterns first, then fall back to looser ones.
    // Each pattern looks for the label then the first dollar amount (skipping optional $ sign).
    const extractAmount = (text, ...patterns) => {
      for (const pattern of patterns) {
        const m = text.match(pattern);
        if (m) return parseFloat(m[1].replace(/,/g, ''));
      }
      return null;
    };

    extractedGross = extractAmount(
      pdfText,
      /GROSS\s+PAY\s+\$?\s*([\d,\.]+)/i,
      /GROSS\s+EARNINGS\s+\$?\s*([\d,\.]+)/i,
      /TOTAL\s+GROSS\s+\$?\s*([\d,\.]+)/i,
      /TOTAL\s+EARNINGS\s+\$?\s*([\d,\.]+)/i,
      /TOTAL\s+PAY\s+\$?\s*([\d,\.]+)/i,
      // Plain GROSS — must NOT be followed by letters (avoids matching "GROSS TAXABLE" etc.)
      /\bGROSS\b\s+\$?\s*([\d,\.]+)/i,
    );

    extractedNett = extractAmount(
      pdfText,
      /NET\s+INCOME\s+\$?\s*([\d,\.]+)/i,
      /NET\s+PAY\s+\$?\s*([\d,\.]+)/i,
      /\bNETT?\b\s+\$?\s*([\d,\.]+)/i,
    );

    // TAX must not match TAXABLE — require end-of-word boundary
    extractedTax = extractAmount(
      pdfText,
      /\bTAX\b\s+\$?\s*([\d,\.]+)/i,
      /INCOME\s+TAX\s+\$?\s*([\d,\.]+)/i,
    );

    // Extract allowances included in gross (e.g. Late Shift Allowance on ADP payslips).
    // We look for the Pre/Post Tax Allows/Deds summary amounts — these are non-time-based
    // payments already baked into the gross figure.
    let extractedAllowances = 0;
    const preTaxAllow = pdfText.match(/pre\s+tax\s+allows?\/deds?\s+\$?\s*([\d,\.]+)/i);
    if (preTaxAllow) extractedAllowances += parseFloat(preTaxAllow[1].replace(/,/g, ''));
    const postTaxAllow = pdfText.match(/post\s+tax\s+allows?\/deds?\s+\$?\s*([\d,\.]+)/i);
    if (postTaxAllow) extractedAllowances += parseFloat(postTaxAllow[1].replace(/,/g, ''));
    extractedAllowances = parseFloat(extractedAllowances.toFixed(2));

    // Time-based gross = what the employer paid purely for hours worked
    const timeBasedGross = parseFloat((extractedGross - extractedAllowances).toFixed(2));

    // If we couldn't extract the gross pay, we cannot validate
    if (extractedGross === null) {
      return res.status(400).json({ message: 'Could not automatically find the Gross Pay amount in this PDF. Please check the file.' });
    }

    // 4. Comparison: match expectedPay (hours × rate) against time-based gross only
    const difference = parseFloat(Math.abs(expectedPay - timeBasedGross).toFixed(2));
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
      fileUrl: 'memory'
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
      extractedAllowances,
      timeBasedGross,
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
