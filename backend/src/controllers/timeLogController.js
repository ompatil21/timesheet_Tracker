const TimeLog = require('../models/TimeLog');
const Client = require('../models/Client');

// Helper to calculate revenue split
const calculateRevenue = (dateString, hours, client, isPublicHoliday) => {
  const date = new Date(dateString);
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  const earnedOrdinary = hours * client.ordinaryRate;
  const loadingPct = client.casualLoading || 0;
  const earnedCasual = hours * (client.ordinaryRate * (loadingPct / 100));
  
  const standardPay = earnedOrdinary + earnedCasual;
  let earnedRevenue = 0;
  
  if (isPublicHoliday && client.holidayRate) {
    earnedRevenue = hours * client.holidayRate;
  } else if (day === 0 && client.sundayRate) {
    earnedRevenue = hours * client.sundayRate;
  } else if (day === 6 && client.saturdayRate) {
    earnedRevenue = hours * client.saturdayRate;
  } else {
    // Standard weekday or fallback if penalty rate not defined
    earnedRevenue = standardPay;
  }
  
  return { earnedOrdinary, earnedCasual, earnedRevenue };
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
  const { client, date, hours, notes, isPublicHoliday } = req.body;

  if (!client || !date || hours === undefined) {
    res.status(400);
    throw new Error('Please add all fields');
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

  const { earnedOrdinary, earnedCasual, earnedRevenue } = calculateRevenue(date, hours, clientDoc, isPublicHoliday);

  const timeLog = await TimeLog.create({
    client,
    date,
    hours,
    notes,
    isPublicHoliday: isPublicHoliday || false,
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

  const { client, date, hours, notes, isPublicHoliday } = req.body;
  
  // Re-calculate revenue if fields changed
  let earnedOrdinary = timeLog.earnedOrdinary;
  let earnedCasual = timeLog.earnedCasual;
  let earnedRevenue = timeLog.earnedRevenue;
  
  if (client || date || hours !== undefined || isPublicHoliday !== undefined) {
    const clientToUse = client || timeLog.client;
    const clientDoc = await Client.findById(clientToUse);
    const dateToUse = date || timeLog.date;
    const hoursToUse = hours !== undefined ? hours : timeLog.hours;
    const holidayToUse = isPublicHoliday !== undefined ? isPublicHoliday : timeLog.isPublicHoliday;
    
    const calculated = calculateRevenue(dateToUse, hoursToUse, clientDoc, holidayToUse);
    earnedOrdinary = calculated.earnedOrdinary;
    earnedCasual = calculated.earnedCasual;
    earnedRevenue = calculated.earnedRevenue;
  }

  const updatedLog = await TimeLog.findByIdAndUpdate(
    req.params.id, 
    { ...req.body, earnedOrdinary, earnedCasual, earnedRevenue }, 
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
