// Render's free tier spins the service down after 15 min without inbound
// traffic, and the next request then waits ~30-60s for a cold start. Pinging
// our own public URL keeps the instance warm. Render injects
// RENDER_EXTERNAL_URL, so this is a no-op locally and on other hosts unless
// KEEP_ALIVE_URL is set explicitly.
const KEEP_ALIVE_URL = (process.env.KEEP_ALIVE_URL || process.env.RENDER_EXTERNAL_URL || '').replace(/\/+$/, '');

// Must stay under Render's 15 min idle window.
const intervalMinutes = Math.min(14, Math.max(1, parseInt(process.env.KEEP_ALIVE_INTERVAL_MINUTES, 10) || 10));
const KEEP_ALIVE_INTERVAL_MS = intervalMinutes * 60 * 1000;
const PING_TIMEOUT_MS = 10 * 1000;

const ping = async () => {
  try {
    const res = await fetch(`${KEEP_ALIVE_URL}/health`, { signal: AbortSignal.timeout(PING_TIMEOUT_MS) });
    if (!res.ok) console.error(`[keep-alive] ping returned ${res.status}`);
  } catch (err) {
    console.error('[keep-alive] ping failed:', err.message);
  }
};

const startKeepAlive = () => {
  if (!KEEP_ALIVE_URL) return;
  const timer = setInterval(ping, KEEP_ALIVE_INTERVAL_MS);
  timer.unref(); // never keep the process alive just for the pinger
  console.log(`[keep-alive] pinging ${KEEP_ALIVE_URL}/health every ${intervalMinutes} min`);
};

module.exports = { startKeepAlive };
