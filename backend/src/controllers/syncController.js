const SyncConfig = require('../models/SyncConfig');
const Shift = require('../models/Shift');
const { encrypt } = require('../utils/encryption');
const { normalizeIcsUrl, fetchAndParseIcs, syncUser } = require('../services/humanforceSync');

// Recognisable but non-sensitive preview of a stored link: host + truncated
// path, never the query string (the token lives there)
const buildUrlHint = (url) => {
  const parsed = new URL(url);
  const path = parsed.pathname.length > 24 ? `${parsed.pathname.slice(0, 21)}…` : parsed.pathname;
  return `${parsed.host}${path}`;
};

const toStatusJson = (config) => ({
  configured: !!config,
  urlHint: config?.urlHint || null,
  lastSyncAt: config?.lastSyncAt || null,
  lastSyncStatus: config?.lastSyncStatus || 'never',
  lastSyncError: config?.lastSyncError || null,
  lastShiftCount: config?.lastShiftCount || 0,
});

// @desc    Get sync status for the logged-in user
// @route   GET /api/sync
// @access  Private
const getSyncStatus = async (req, res) => {
  const config = await SyncConfig.findOne({ user: req.user.id });
  res.status(200).json(toStatusJson(config));
};

// @desc    Test a calendar link without saving it
// @route   POST /api/sync/test
// @access  Private
const testConnection = async (req, res) => {
  try {
    const url = normalizeIcsUrl(req.body.url);
    const shifts = await fetchAndParseIcs(url);
    const starts = shifts.map((s) => s.start.getTime());
    res.status(200).json({
      ok: true,
      shiftCount: shifts.length,
      earliest: starts.length ? new Date(Math.min(...starts)) : null,
      latest: starts.length ? new Date(Math.max(...starts)) : null,
    });
  } catch (err) {
    res.status(400).json({ ok: false, message: err.message });
  }
};

// @desc    Save (or replace) the Humanforce link, then sync immediately
// @route   PUT /api/sync
// @access  Private
const saveSyncConfig = async (req, res) => {
  let url;
  try {
    url = normalizeIcsUrl(req.body.url);
    // Verify the link actually works before storing it
    await fetchAndParseIcs(url);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  const config = await SyncConfig.findOneAndUpdate(
    { user: req.user.id },
    {
      user: req.user.id,
      provider: 'humanforce',
      icsUrlEncrypted: encrypt(url),
      urlHint: buildUrlHint(url),
      lastSyncStatus: 'never',
      lastSyncError: undefined,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const result = await syncUser(config);
  if (!result.ok) {
    return res.status(502).json({ message: `Link saved but first sync failed: ${result.error}` });
  }
  res.status(200).json(toStatusJson(config));
};

// @desc    Manually trigger a sync now
// @route   POST /api/sync/now
// @access  Private
const syncNow = async (req, res) => {
  const config = await SyncConfig.findOne({ user: req.user.id });
  if (!config) {
    return res.status(404).json({ message: 'No Humanforce link saved yet' });
  }
  const result = await syncUser(config);
  if (!result.ok) {
    return res.status(502).json({ ...toStatusJson(config), message: result.error });
  }
  res.status(200).json(toStatusJson(config));
};

// @desc    Remove the link and all synced shifts
// @route   DELETE /api/sync
// @access  Private
const deleteSyncConfig = async (req, res) => {
  await SyncConfig.deleteOne({ user: req.user.id });
  await Shift.deleteMany({ user: req.user.id, source: 'humanforce' });
  res.status(200).json({ message: 'Humanforce sync disconnected' });
};

// @desc    List synced shifts (optionally within ?from=&to= ISO range)
// @route   GET /api/sync/shifts
// @access  Private
const getShifts = async (req, res) => {
  const query = { user: req.user.id };
  const { from, to } = req.query;
  if (from || to) {
    query.start = {};
    if (from) {
      const d = new Date(String(from));
      if (isNaN(d.getTime())) {
        res.status(400);
        throw new Error('Invalid "from" date');
      }
      query.start.$gte = d;
    }
    if (to) {
      const d = new Date(String(to));
      if (isNaN(d.getTime())) {
        res.status(400);
        throw new Error('Invalid "to" date');
      }
      query.start.$lte = d;
    }
  }
  const shifts = await Shift.find(query).sort({ start: 1 });
  res.status(200).json(shifts);
};

module.exports = {
  getSyncStatus,
  testConnection,
  saveSyncConfig,
  syncNow,
  deleteSyncConfig,
  getShifts,
};
