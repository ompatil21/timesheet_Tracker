const { syncAllUsers } = require('../services/humanforceSync');

// Humanforce refreshes its feed every 5-15 min; polling every 15 min is plenty.
const SYNC_INTERVAL_MS = 15 * 60 * 1000;
const STARTUP_DELAY_MS = 10 * 1000;

let isRunning = false;

const runScheduledSync = async () => {
  if (isRunning) return; // never let interval firings overlap a slow pass
  isRunning = true;
  try {
    const results = await syncAllUsers();
    if (results.total > 0) {
      console.log(`[humanforce-sync] synced ${results.succeeded}/${results.total} feeds${results.failed ? ` (${results.failed} failed)` : ''}`);
    }
  } catch (err) {
    console.error('[humanforce-sync] scheduler run failed:', err.message);
  } finally {
    isRunning = false;
  }
};

const startSyncScheduler = () => {
  // Small delay so the DB connection is up before the first pass
  setTimeout(runScheduledSync, STARTUP_DELAY_MS);
  const timer = setInterval(runScheduledSync, SYNC_INTERVAL_MS);
  timer.unref(); // never keep the process alive just for the scheduler
  console.log(`[humanforce-sync] scheduler started (every ${SYNC_INTERVAL_MS / 60000} min)`);
};

module.exports = { startSyncScheduler };
