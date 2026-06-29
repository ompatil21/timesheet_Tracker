const TimeLog = require('../models/TimeLog');
const Client = require('../models/Client');

// Helper to calculate hours from start and finish times
const calculateHoursWorked = (startTime, finishTime, breakMinutes = 0) => {
  if (!startTime || !finishTime) return null;
  
  // Parse time strings in HH:MM format
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = finishTime.split(':').map(Number);
  
  // Convert to minutes
  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;
  
  // Handle case where finish time is next day (after midnight)
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }
  
  // Calculate total minutes worked
  const totalMinutes = endMinutes - startMinutes - (breakMinutes || 0);
  
  // Convert back to hours with decimal precision
  return parseFloat((totalMinutes / 60).toFixed(2));
};

// Helper to calculate revenue split
// isSupervisorShift: use client.supervisorRate as the base instead of ordinaryRate (if set)
const calculateRevenue = (dateString, hours, client, isPublicHoliday, isSupervisorShift = false) => {
  const date = new Date(dateString);
  // Use UTC day so rate selection is consistent with how dates are stored (UTC midnight)
  const day = date.getUTCDay(); // 0 = Sunday, 6 = Saturday

  // Choose base rate: supervisor rate when flagged and available, otherwise ordinary rate
  const baseRate = (isSupervisorShift && client.supervisorRate) ? client.supervisorRate : client.ordinaryRate;
  const loadingPct = client.casualLoading || 0;

  const earnedOrdinary = hours * baseRate;
  const earnedCasual = hours * (baseRate * (loadingPct / 100));
  const weekdayPay = earnedOrdinary + earnedCasual; // base × (1 + loading%)

  // Derive penalty rates from base if not explicitly set on the client
  const satRate  = client.saturdayRate  ?? baseRate * (1 + loadingPct / 100) * (50 / 25 ); // not ideal fallback
  const sunRate  = client.sundayRate    ?? baseRate * (1 + loadingPct / 100) * (75 / 25 );
  const holRate  = client.holidayRate   ?? baseRate * (1 + loadingPct / 100) * (125 / 25);

  // For supervisor shifts on weekends/holidays, scale the stored flat rates by the ratio
  // of supervisor base to ordinary base so the correct penalty amount is used
  const scale = (isSupervisorShift && client.supervisorRate && client.ordinaryRate)
    ? client.supervisorRate / client.ordinaryRate
    : 1;

  let earnedRevenue = 0;
  if (isPublicHoliday) {
    earnedRevenue = hours * holRate * scale;
  } else if (day === 0) {
    earnedRevenue = hours * sunRate * scale;
  } else if (day === 6) {
    earnedRevenue = hours * satRate * scale;
  } else {
    earnedRevenue = weekdayPay;
  }

  return { earnedOrdinary, earnedCasual, earnedRevenue: parseFloat(earnedRevenue.toFixed(2)) };
};

// @desc    Get timelogs
// @route   GET /api/timelogs
// @access  Private
const getTimeLogs = async (req, res) => {
  const timeLogs = await TimeLog.find({ user: req.user.id })
    .populate('client', ['name', 'ordinaryRate', 'casualLoading', 'saturdayRate', 'sundayRate', 'holidayRate'])
    .sort({ date: -1 });
  res.status(200).json(timeLogs);
};

// @desc    Create timelog
// @route   POST /api/timelogs
// @access  Private
const createTimeLog = async (req, res) => {
  const { client, date, hours, startTime, finishTime, breakMinutes, notes, isPublicHoliday, isSupervisorShift } = req.body;

  // Calculate hours if start and finish times provided
  let finalHours = hours;
  if (startTime && finishTime) {
    finalHours = calculateHoursWorked(startTime, finishTime, breakMinutes || 0);
    if (!finalHours || finalHours <= 0) {
      res.status(400);
      throw new Error('Invalid start or finish time');
    }
  } else if (!hours || hours <= 0) {
    res.status(400);
    throw new Error('Please provide hours or start/finish times');
  }

  if (!client || !date) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  const clientDoc = await Client.findById(client);
  if (!clientDoc) {
    res.status(404);
    throw new Error('Employer not found');
  }

  if (clientDoc.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to log time for this employer');
  }

  const supervisorShift = !!(isSupervisorShift && clientDoc.supervisorRate);
  const { earnedOrdinary, earnedCasual, earnedRevenue } = calculateRevenue(date, finalHours, clientDoc, isPublicHoliday, supervisorShift);

  const timeLog = await TimeLog.create({
    client,
    date,
    startTime: startTime || undefined,
    finishTime: finishTime || undefined,
    breakMinutes: breakMinutes || 0,
    hours: finalHours,
    notes,
    isPublicHoliday: isPublicHoliday || false,
    isSupervisorShift: supervisorShift,
    earnedOrdinary,
    earnedCasual,
    earnedRevenue,
    user: req.user.id,
  });

  const populatedLog = await TimeLog.findById(timeLog._id).populate('client', ['name']);
  res.status(201).json(populatedLog);
};

// @desc    Update timelog
// @route   PUT /api/timelogs/:id
// @access  Private
const updateTimeLog = async (req, res) => {
  const timeLog = await TimeLog.findById(req.params.id);

  if (!timeLog) {
    res.status(404);
    throw new Error('Timesheet entry not found');
  }

  if (timeLog.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const { client, date, hours, startTime, finishTime, breakMinutes, notes, isPublicHoliday, isSupervisorShift } = req.body;
  
  // Calculate hours if start and finish times provided
  let finalHours = hours !== undefined ? hours : timeLog.hours;
  if (startTime && finishTime) {
    finalHours = calculateHoursWorked(startTime, finishTime, breakMinutes || 0);
    if (!finalHours || finalHours <= 0) {
      res.status(400);
      throw new Error('Invalid start or finish time');
    }
  }
  
  // Re-calculate revenue if any relevant field changed
  let earnedOrdinary = timeLog.earnedOrdinary;
  let earnedCasual = timeLog.earnedCasual;
  let earnedRevenue = timeLog.earnedRevenue;
  let resolvedSupervisorShift = timeLog.isSupervisorShift;

  if (client || date || hours !== undefined || startTime || finishTime || isPublicHoliday !== undefined || isSupervisorShift !== undefined) {
    const clientDoc = await Client.findById(client || timeLog.client);
    const dateToUse = date || timeLog.date;
    const holidayToUse = isPublicHoliday !== undefined ? isPublicHoliday : timeLog.isPublicHoliday;
    resolvedSupervisorShift = isSupervisorShift !== undefined
      ? !!(isSupervisorShift && clientDoc.supervisorRate)
      : timeLog.isSupervisorShift;

    const calculated = calculateRevenue(dateToUse, finalHours, clientDoc, holidayToUse, resolvedSupervisorShift);
    earnedOrdinary = calculated.earnedOrdinary;
    earnedCasual = calculated.earnedCasual;
    earnedRevenue = calculated.earnedRevenue;
  }

  const updatedLog = await TimeLog.findByIdAndUpdate(
    req.params.id,
    {
      client: client || timeLog.client,
      date: date || timeLog.date,
      startTime: startTime !== undefined ? startTime : timeLog.startTime,
      finishTime: finishTime !== undefined ? finishTime : timeLog.finishTime,
      breakMinutes: breakMinutes !== undefined ? breakMinutes : (timeLog.breakMinutes || 0),
      hours: finalHours,
      notes: notes !== undefined ? notes : timeLog.notes,
      isPublicHoliday: isPublicHoliday !== undefined ? isPublicHoliday : timeLog.isPublicHoliday,
      isSupervisorShift: resolvedSupervisorShift,
      earnedOrdinary,
      earnedCasual,
      earnedRevenue,
    },
    { new: true }
  ).populate('client', ['name']);

  res.status(200).json(updatedLog);
};

// @desc    Delete timelog
// @route   DELETE /api/timelogs/:id
// @access  Private
const deleteTimeLog = async (req, res) => {
  const timeLog = await TimeLog.findById(req.params.id);

  if (!timeLog) {
    res.status(404);
    throw new Error('Timesheet entry not found');
  }

  if (timeLog.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await timeLog.deleteOne();

  res.status(200).json({ id: req.params.id });
};

module.exports = {
  getTimeLogs,
  createTimeLog,
  updateTimeLog,
  deleteTimeLog,
};
