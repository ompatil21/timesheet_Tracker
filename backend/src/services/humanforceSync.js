const ical = require('node-ical');
const Shift = require('../models/Shift');
const SyncConfig = require('../models/SyncConfig');
const { decrypt } = require('../utils/encryption');

const FETCH_TIMEOUT_MS = 20000;
const MAX_FEED_BYTES = 5 * 1024 * 1024; // a real roster feed is a few KB
const MAX_FEED_EVENTS = 1000;
const MAX_TITLE_LEN = 200;
const MAX_LOCATION_LEN = 300;

// Hosts a feed may live on. Suffix match (host equals, or ends with ".<suffix>").
// Extend via HF_ALLOWED_HOSTS (comma-separated) if a tenant uses another domain.
const DEFAULT_ALLOWED_HOSTS = [
  'humanforce.com',
  'humanforce.com.au',
  'humanforcecloud.com',
  'humanforcecloud.com.au',
];

const getAllowedHosts = () => {
  const extra = (process.env.HF_ALLOWED_HOSTS || '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  return [...DEFAULT_ALLOWED_HOSTS, ...extra];
};

// Convert webcal(s):// to https:// and validate the result is a usable feed URL.
// Throws with a user-readable message on anything invalid.
const normalizeIcsUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('Please provide a calendar link');
  }
  // The feed link is a bearer credential — never allow plaintext transport
  let url = rawUrl.trim().replace(/^(webcal|webcals|http):\/\//i, 'https://');

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('That does not look like a valid URL');
  }
  if (parsed.protocol !== 'https:') {
    throw new Error('Link must be a webcal:// or https:// URL');
  }

  const host = parsed.hostname.toLowerCase();

  // Defense in depth: refuse obvious loopback/private hosts even though the
  // allowlist below should never match them
  const privatePatterns = [
    /^localhost$/, /^127\./, /^0\.0\.0\.0$/, /^10\./, /^192\.168\./,
    /^172\.(1[6-9]|2\d|3[01])\./, /^169\.254\./, /^\[?::1\]?$/, /\.local$/,
  ];
  if (privatePatterns.some((p) => p.test(host))) {
    throw new Error('Links to private/local addresses are not allowed');
  }

  const allowed = getAllowedHosts();
  if (!allowed.some((suffix) => host === suffix || host.endsWith(`.${suffix}`))) {
    throw new Error(
      `"${host}" is not a recognised Humanforce domain. If your roster lives on a different domain, add it to HF_ALLOWED_HOSTS in the backend .env`
    );
  }

  return url;
};

// Fetch the feed ourselves (rather than via node-ical) so we control redirects,
// response size, and can sanity-check the payload before parsing.
const fetchFeedText = async (url) => {
  let res;
  try {
    res = await fetch(url, {
      redirect: 'error',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { 'User-Agent': 'TimeTracker-HumanforceSync/1.0', Accept: 'text/calendar, text/plain' },
    });
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new Error('Calendar feed timed out — Humanforce may be slow, try again');
    }
    const cause = err.cause?.message || '';
    if (/redirect/i.test(cause) || /redirect/i.test(err.message)) {
      throw new Error('The feed URL redirected elsewhere — paste the final calendar URL directly');
    }
    throw new Error(`Could not fetch calendar feed${cause ? `: ${cause}` : ''}`);
  }

  if (!res.ok) {
    throw new Error(`Calendar feed returned HTTP ${res.status}`);
  }

  const declared = parseInt(res.headers.get('content-length') || '0', 10);
  if (declared > MAX_FEED_BYTES) {
    throw new Error('Calendar feed is too large');
  }

  let received = 0;
  const chunks = [];
  for await (const chunk of res.body) {
    received += chunk.length;
    if (received > MAX_FEED_BYTES) {
      throw new Error('Calendar feed is too large');
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
};

// Humanforce writes shift times as "floating" local times (no Z, no TZID) and
// names the roster's zone once, in X-WR-TIMEZONE. node-ical reads floating
// times in the server's own zone, so on a UTC host every shift lands hours
// off (and evening shifts on the wrong day). Returns null if the feed names
// no usable zone, in which case times are left as node-ical parsed them.
const getFeedTimeZone = (text) => {
  const match = text.match(/^X-WR-TIMEZONE:(.+)$/m);
  if (!match) return null;
  const timeZone = match[1].trim();
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return timeZone;
  } catch {
    return null;
  }
};

// Offset of timeZone from UTC at the given instant, in ms (positive = ahead)
const zoneOffsetMs = (instantMs, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
  }).formatToParts(new Date(instantMs));
  const p = Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]));
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(instantMs / 1000) * 1000;
};

// Re-read a floating time's wall-clock digits as a time in timeZone
const floatingToUtc = (date, timeZone) => {
  // node-ical built this Date from the digits in the server's zone, so the
  // local getters hand the original digits back
  const wall = Date.UTC(
    date.getFullYear(), date.getMonth(), date.getDate(),
    date.getHours(), date.getMinutes(), date.getSeconds()
  );
  const guess = wall - zoneOffsetMs(wall, timeZone);
  // Second pass settles times near a daylight-saving change
  return new Date(wall - zoneOffsetMs(guess, timeZone));
};

// Parse ICS text into normalized shift objects.
const parseIcsText = (text) => {
  // An expired/broken link often returns an HTML login page with HTTP 200 —
  // it parses to zero events, which must not be mistaken for an empty roster
  if (!text.includes('BEGIN:VCALENDAR')) {
    throw new Error('The link did not return a calendar feed — it may have expired, try generating a new one in Humanforce');
  }

  const feedTimeZone = getFeedTimeZone(text);
  // node-ical tags times that carried a Z or TZID with .tz; floating ones have none
  const toInstant = (value) =>
    feedTimeZone && !value.tz ? floatingToUtc(new Date(value), feedTimeZone) : new Date(value);

  let data;
  try {
    data = ical.sync.parseICS(text);
  } catch (err) {
    throw new Error(`Could not parse calendar feed: ${err.message}`);
  }

  const shifts = [];
  for (const key of Object.keys(data)) {
    const ev = data[key];
    if (ev.type !== 'VEVENT' || !ev.start) continue;
    // All-day entries (leave, availability) are not shifts and would count as 24h
    if (ev.datetype === 'date') continue;
    if ((ev.status || '').toString().toUpperCase() === 'CANCELLED') continue;

    const start = toInstant(ev.start);
    // Feeds occasionally omit DTEND; treat as zero-length rather than dropping
    const end = ev.end ? toInstant(ev.end) : toInstant(ev.start);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

    shifts.push({
      uid: (ev.uid || `${start.toISOString()}-${ev.summary || 'shift'}`).toString().slice(0, 500),
      title: (ev.summary || 'Shift').toString().trim().slice(0, MAX_TITLE_LEN),
      start,
      end,
      location: ev.location ? ev.location.toString().trim().slice(0, MAX_LOCATION_LEN) : undefined,
    });

    if (shifts.length > MAX_FEED_EVENTS) {
      throw new Error('Calendar feed contains too many events');
    }
  }
  return shifts;
};

// Fetch an ICS feed and return normalized shift objects.
const fetchAndParseIcs = async (url) => parseIcsText(await fetchFeedText(url));

// One sync per user at a time — "Sync now" clicks and the scheduler can
// otherwise interleave and race on config.save()/upserts
const activeSyncs = new Set();

// Sync one user's feed. Never throws — records success/failure on the SyncConfig.
// On failure existing shifts are left untouched.
const syncUser = async (config) => {
  const lockKey = String(config.user);
  if (activeSyncs.has(lockKey)) {
    return { ok: false, error: 'A sync is already running — try again in a moment', skipped: true };
  }
  activeSyncs.add(lockKey);

  const now = new Date();
  try {
    let url;
    try {
      url = decrypt(config.icsUrlEncrypted);
    } catch {
      throw new Error('Stored link could not be decrypted — the server encryption key may have changed. Please re-save your Humanforce link.');
    }
    const shifts = await fetchAndParseIcs(url);

    if (shifts.length > 0) {
      await Shift.bulkWrite(
        shifts.map((s) => ({
          updateOne: {
            filter: { user: config.user, uid: s.uid },
            update: {
              $set: {
                title: s.title,
                start: s.start,
                end: s.end,
                location: s.location,
                source: 'humanforce',
                lastSeenAt: now,
              },
            },
            upsert: true,
          },
        }))
      );
    }

    // Remove future shifts that disappeared from the feed (cancelled/unpublished).
    // Past shifts are kept as history even once they roll out of the feed window.
    // Guard: a single empty-but-valid response never wipes the roster — only a
    // second consecutive empty sync does (lastShiftCount is 0 by then).
    const feedWentEmpty = shifts.length === 0 && (config.lastShiftCount || 0) > 0;
    if (!feedWentEmpty) {
      const feedUids = shifts.map((s) => s.uid);
      await Shift.deleteMany({
        user: config.user,
        source: 'humanforce',
        start: { $gte: now },
        uid: { $nin: feedUids },
      });
    }

    config.lastSyncAt = now;
    config.lastSyncStatus = 'success';
    config.lastSyncError = undefined;
    config.lastShiftCount = shifts.length;
    await config.save();
    return { ok: true, shiftCount: shifts.length };
  } catch (err) {
    config.lastSyncAt = now;
    config.lastSyncStatus = 'failed';
    config.lastSyncError = err.message;
    await config.save().catch(() => {});
    return { ok: false, error: err.message };
  } finally {
    activeSyncs.delete(lockKey);
  }
};

// Sync every stored config sequentially; one bad feed never affects the others.
const syncAllUsers = async () => {
  const configs = await SyncConfig.find({});
  const results = { total: configs.length, succeeded: 0, failed: 0 };
  for (const config of configs) {
    const res = await syncUser(config);
    if (res.ok) results.succeeded += 1;
    else results.failed += 1;
  }
  return results;
};

module.exports = { normalizeIcsUrl, parseIcsText, fetchAndParseIcs, syncUser, syncAllUsers };
