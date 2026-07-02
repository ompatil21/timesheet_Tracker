'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { AppPageLoader, InlineLoader } from '@/components/LoadingStates';
import { SyncStatus, SyncStatusBadge, formatSyncTime } from '@/components/HumanforceSync';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RefreshCw, CalendarClock, AlertTriangle } from 'lucide-react';

interface Shift {
  _id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
}

interface TimeLog {
  _id: string;
  date: string;
  hours: number;
  startTime?: string;
  finishTime?: string;
  client?: { name: string };
}

// Local-date key for real timestamps (shifts)
const localKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Timelog dates are stored as UTC midnight, so key them by their UTC date
const logKey = (iso: string) => iso.slice(0, 10);

const shiftHours = (s: Shift) => (new Date(s.end).getTime() - new Date(s.start).getTime()) / 3600000;

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export default function CalendarPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // 6-week grid starting on the Monday before (or on) the 1st of the month
  const gridStart = useMemo(() => {
    const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const day = first.getDay();
    const back = day === 0 ? 6 : day - 1;
    first.setDate(first.getDate() - back);
    return first;
  }, [viewDate]);

  const gridDays = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => {
        const d = new Date(gridStart);
        d.setDate(gridStart.getDate() + i);
        return d;
      }),
    [gridStart]
  );

  const fetchAll = useCallback(async () => {
    const from = new Date(gridStart);
    const to = new Date(gridStart);
    to.setDate(to.getDate() + 42);
    try {
      const [shiftsRes, logsRes, statusRes] = await Promise.all([
        api.get(`/sync/shifts?from=${from.toISOString()}&to=${to.toISOString()}`),
        api.get('/timelogs'),
        api.get('/sync'),
      ]);
      setShifts(shiftsRes.data);
      setLogs(logsRes.data);
      setSyncStatus(statusRes.data);
    } catch {
      console.error('Failed to fetch calendar data');
    } finally {
      setIsDataLoading(false);
    }
  }, [gridStart]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    setIsDataLoading(true);
    fetchAll();
  }, [user, loading, router, fetchAll]);

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      await api.post('/sync/now');
    } catch {
      // status refresh below surfaces the failure state
    } finally {
      await fetchAll();
      setSyncing(false);
    }
  };

  const shiftsByDay = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    shifts.forEach((s) => {
      const key = localKey(new Date(s.start));
      (map[key] = map[key] || []).push(s);
    });
    Object.values(map).forEach((list) => list.sort((a, b) => a.start.localeCompare(b.start)));
    return map;
  }, [shifts]);

  const logsByDay = useMemo(() => {
    const map: Record<string, TimeLog[]> = {};
    logs.forEach((l) => {
      const key = logKey(l.date);
      (map[key] = map[key] || []).push(l);
    });
    return map;
  }, [logs]);

  const monthTotals = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    let scheduled = 0;
    let logged = 0;
    shifts.forEach((s) => {
      const d = new Date(s.start);
      if (d.getFullYear() === y && d.getMonth() === m) scheduled += shiftHours(s);
    });
    logs.forEach((l) => {
      const [ly, lm] = l.date.slice(0, 10).split('-').map(Number);
      if (ly === y && lm - 1 === m) logged += l.hours;
    });
    return { scheduled, logged };
  }, [shifts, logs, viewDate]);

  const today = new Date();
  const todayKey = localKey(today);
  const monthLabel = viewDate.toLocaleDateString([], { month: 'long', year: 'numeric' });

  if (loading || !user) return <AppPageLoader label="Loading calendar" />;

  return (
    <div className="min-h-screen bg-carbon md:pl-64 pb-20 md:pb-0 text-zinc-900 dark:text-white transition-colors">
      <Sidebar />
      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <h2 className="text-4xl font-black font-display uppercase tracking-tight italic">
              Roster <span className="text-racing-red">Calendar</span>
            </h2>
            <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold mt-2">
              Humanforce shifts vs logged hours
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <SyncStatusBadge status={syncStatus} />
            {syncStatus?.configured && (
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={syncing}
                className="px-4 py-2 text-xs font-bold tracking-widest uppercase text-white bg-racing-red hover:bg-red-700 transition-all shadow-md clip-slant-btn disabled:opacity-60"
              >
                {syncing ? <InlineLoader label="Syncing" /> : (
                  <span className="inline-flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5" /> Sync Now</span>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {syncStatus && !syncStatus.configured && (
          <div className="mb-8 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 p-8 text-center">
            <CalendarClock className="w-8 h-8 mx-auto text-zinc-400 mb-3" />
            <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">No roster connected</p>
            <p className="text-sm text-zinc-500 mb-4">Paste your Humanforce calendar link to see scheduled shifts here.</p>
            <Link
              href="/profile"
              className="inline-block px-6 py-3 text-xs font-bold tracking-widest uppercase text-white bg-racing-red hover:bg-red-700 transition-all shadow-md clip-slant-btn"
            >
              Connect in Employers → Integrations
            </Link>
          </div>
        )}

        {syncStatus?.configured && syncStatus.lastSyncStatus === 'failed' && (
          <div className="mb-8 rounded p-4 text-sm font-medium border bg-red-100 dark:bg-red-950/50 border-racing-red text-red-700 dark:text-red-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Humanforce sync failed — check your link in Employers → Integrations. Showing last synced data from {formatSyncTime(syncStatus.lastSyncAt)}.
          </div>
        )}

        {/* Month navigation + totals */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
              className="p-2 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-racing-red hover:border-racing-red transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-zinc-300 dark:border-zinc-700 rounded text-zinc-600 dark:text-zinc-300 hover:border-racing-red hover:text-racing-red transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
              className="p-2 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-racing-red hover:border-racing-red transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <h3 className="text-xl font-black font-display uppercase tracking-wider ml-3">{monthLabel}</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Scheduled</p>
              <p className="text-2xl font-black font-display text-racing-red">{monthTotals.scheduled.toFixed(1)}<span className="text-xs text-zinc-500 ml-1">HRS</span></p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Logged</p>
              <p className="text-2xl font-black font-display text-green-600 dark:text-green-500">{monthTotals.logged.toFixed(1)}<span className="text-xs text-zinc-500 ml-1">HRS</span></p>
            </div>
          </div>
        </motion.div>

        {/* Calendar grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isDataLoading ? 0.5 : 1 }}
          className="bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden backdrop-blur-sm"
        >
          <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="p-2 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {gridDays.map((day) => {
              const key = localKey(day);
              const inMonth = day.getMonth() === viewDate.getMonth();
              const isToday = key === todayKey;
              const dayShifts = shiftsByDay[key] || [];
              const dayLogs = logsByDay[key] || [];
              const loggedTotal = dayLogs.reduce((sum, l) => sum + l.hours, 0);

              return (
                <div
                  key={key}
                  className={`min-h-[76px] md:min-h-[104px] border-b border-r border-zinc-100 dark:border-zinc-800/60 p-1.5 md:p-2 ${inMonth ? '' : 'opacity-40'} ${isToday ? 'bg-red-50/60 dark:bg-red-950/20' : ''}`}
                >
                  <p className={`text-[11px] font-bold mb-1 ${isToday ? 'text-racing-red' : 'text-zinc-400'}`}>
                    {day.getDate()}
                  </p>
                  <div className="space-y-1">
                    {dayShifts.map((s) => (
                      <div
                        key={s._id}
                        title={`${s.title}${s.location ? ` @ ${s.location}` : ''} · ${fmtTime(s.start)}–${fmtTime(s.end)} (${shiftHours(s).toFixed(1)}h)`}
                        className="px-1.5 py-1 rounded bg-red-50 dark:bg-red-950/40 border-l-2 border-racing-red text-[9px] md:text-[10px] leading-tight"
                      >
                        <p className="font-bold text-zinc-800 dark:text-zinc-100 truncate hidden md:block">{s.title}</p>
                        <p className="text-zinc-500 dark:text-zinc-400 truncate">{fmtTime(s.start)}–{fmtTime(s.end)}</p>
                      </div>
                    ))}
                    {loggedTotal > 0 && (
                      <div
                        title={dayLogs.map((l) => `${l.client?.name || 'Logged'}: ${l.hours}h`).join(', ')}
                        className="px-1.5 py-1 rounded bg-green-50 dark:bg-green-950/40 border-l-2 border-green-500 text-[9px] md:text-[10px] leading-tight"
                      >
                        <p className="font-bold text-green-700 dark:text-green-400 truncate">✓ {loggedTotal.toFixed(1)}h logged</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 justify-center">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <span className="w-3 h-3 rounded bg-red-50 dark:bg-red-950/40 border-l-2 border-racing-red inline-block" /> Scheduled shift
          </span>
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <span className="w-3 h-3 rounded bg-green-50 dark:bg-green-950/40 border-l-2 border-green-500 inline-block" /> Logged hours
          </span>
        </div>
      </main>
    </div>
  );
}
