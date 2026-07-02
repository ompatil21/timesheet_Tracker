'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { InlineLoader } from '@/components/LoadingStates';
import { motion } from 'framer-motion';
import { CalendarClock, CheckCircle2, AlertTriangle, Link2, Unplug, RefreshCw } from 'lucide-react';

export interface SyncStatus {
  configured: boolean;
  urlHint: string | null;
  lastSyncAt: string | null;
  lastSyncStatus: 'never' | 'success' | 'failed';
  lastSyncError: string | null;
  lastShiftCount: number;
}

export function formatSyncTime(iso: string | null) {
  if (!iso) return 'never';
  const d = new Date(iso);
  const diffMin = Math.round((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  return d.toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function SyncStatusBadge({ status }: { status: SyncStatus | null }) {
  if (!status || !status.configured) return null;
  if (status.lastSyncStatus === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
        <AlertTriangle className="w-3 h-3" /> Sync failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-500 border border-green-200 dark:border-green-900 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
      <CheckCircle2 className="w-3 h-3" /> Synced {formatSyncTime(status.lastSyncAt)}
    </span>
  );
}

export default function HumanforceSync({ onSynced }: { onSynced?: () => void }) {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [url, setUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get('/sync');
      setStatus(data);
    } catch {
      console.error('Failed to fetch sync status');
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleTest = async () => {
    if (!url.trim()) return;
    setTesting(true);
    setMessage(null);
    try {
      const { data } = await api.post('/sync/test', { url });
      const range = data.earliest
        ? ` (${new Date(data.earliest).toLocaleDateString()} – ${new Date(data.latest).toLocaleDateString()})`
        : '';
      setMessage({ kind: 'ok', text: `Connection OK — found ${data.shiftCount} shift${data.shiftCount === 1 ? '' : 's'}${range}` });
    } catch (err: any) {
      setMessage({ kind: 'error', text: err.response?.data?.message || 'Test failed — check the link' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await api.put('/sync', { url });
      setStatus(data);
      setUrl('');
      setMessage({ kind: 'ok', text: `Link saved — ${data.lastShiftCount} shift${data.lastShiftCount === 1 ? '' : 's'} synced` });
      onSynced?.();
    } catch (err: any) {
      setMessage({ kind: 'error', text: err.response?.data?.message || 'Failed to save link' });
      // The link may have been saved even if the first sync failed — refresh status
      await fetchStatus();
    } finally {
      setSaving(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const { data } = await api.post('/sync/now');
      setStatus(data);
      setMessage({ kind: 'ok', text: `Synced — ${data.lastShiftCount} shift${data.lastShiftCount === 1 ? '' : 's'} in feed` });
      onSynced?.();
    } catch (err: any) {
      setMessage({ kind: 'error', text: err.response?.data?.message || 'Sync failed' });
      await fetchStatus();
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Humanforce? This removes the saved link and all synced shifts.')) return;
    setDisconnecting(true);
    setMessage(null);
    try {
      await api.delete('/sync');
      setStatus({ configured: false, urlHint: null, lastSyncAt: null, lastSyncStatus: 'never', lastSyncError: null, lastShiftCount: 0 });
      setMessage({ kind: 'ok', text: 'Humanforce disconnected' });
      onSynced?.();
    } catch {
      setMessage({ kind: 'error', text: 'Failed to disconnect' });
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden backdrop-blur-sm transition-colors"
    >
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-wrap justify-between items-center gap-3 transition-colors">
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-racing-red" /> Humanforce Roster Sync
        </h3>
        <SyncStatusBadge status={status} />
      </div>

      <div className="p-6 space-y-5">
        {message && (
          <div className={`rounded p-4 text-sm font-medium border ${message.kind === 'ok'
            ? 'bg-green-50 dark:bg-green-950/40 border-green-300 dark:border-green-900 text-green-700 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-950/50 border-racing-red text-red-700 dark:text-red-200'}`}>
            {message.text}
          </div>
        )}

        {status?.configured && status.lastSyncStatus === 'failed' && (
          <div className="rounded p-4 text-sm font-medium border bg-red-100 dark:bg-red-950/50 border-racing-red text-red-700 dark:text-red-200">
            Humanforce sync failed — check your link.{status.lastSyncError ? ` (${status.lastSyncError})` : ''}
          </div>
        )}

        {status?.configured ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Connected feed</p>
              <p className="text-sm font-display font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-zinc-400" /> {status.urlHint}
              </p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">
                {status.lastShiftCount} shifts in feed · auto-syncs every 15 min · last sync {formatSyncTime(status.lastSyncAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={syncing}
                className="px-5 py-3 text-xs font-bold tracking-widest uppercase text-white bg-racing-red hover:bg-red-700 transition-all shadow-md clip-slant-btn disabled:opacity-60"
              >
                {syncing ? <InlineLoader label="Syncing" /> : (
                  <span className="inline-flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Sync Now</span>
                )}
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="px-5 py-3 text-xs font-bold tracking-widest uppercase text-zinc-500 hover:text-racing-red border border-zinc-300 dark:border-zinc-700 rounded transition-colors disabled:opacity-60"
              >
                {disconnecting ? <InlineLoader label="" /> : (
                  <span className="inline-flex items-center gap-2"><Unplug className="w-4 h-4" /> Disconnect</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Calendar subscription link
              </label>
              <input
                type="text"
                required
                placeholder="webcal://….humanforce.com/…/calendar.ics"
                className="block w-full border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-700 focus:border-racing-red transition-all shadow-sm"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-2">
                In Humanforce: Profile → Calendar Feed → copy the subscription URL. Stored encrypted; shifts sync automatically every 15 min.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !url.trim()}
                className="px-6 py-3 text-xs font-bold tracking-widest uppercase text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded hover:border-racing-red hover:text-racing-red transition-colors disabled:opacity-50"
              >
                {testing ? <InlineLoader label="Testing" /> : 'Test Connection'}
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={saving || !url.trim()}
                className="clip-slant-btn px-8 py-3 text-xs font-bold tracking-widest uppercase text-white bg-racing-red hover:bg-red-700 hover:shadow-neon-red transition-all shadow-md disabled:opacity-60"
              >
                {saving ? <InlineLoader label="Saving & Syncing" /> : 'Save & Sync'}
              </motion.button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}
