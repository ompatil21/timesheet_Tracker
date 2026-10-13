'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { Scrap, Tape, Scribble, Star, Ring, Tick } from '@/components/scrapbook';
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

  // The day whose details are written out on the note beside the month page
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const dayNoteRef = useRef<HTMLDivElement>(null);

  const goToMonth = (year: number, month: number) => {
    setViewDate(new Date(year, month, 1));
    const isThisMonth = year === today.getFullYear() && month === today.getMonth();
    setSelectedKey(isThisMonth ? todayKey : localKey(new Date(year, month, 1)));
  };

  const selectDay = (key: string) => {
    setSelectedKey(key);
    // On a phone the note sits below the month page, so bring it into view
    requestAnimationFrame(() => dayNoteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  };

  const [selYear, selMonth, selDate] = selectedKey.split('-').map(Number);
  const selectedDay = new Date(selYear, selMonth - 1, selDate);
  const selectedShifts = shiftsByDay[selectedKey] || [];
  const selectedLogs = logsByDay[selectedKey] || [];
  const selectedScheduled = selectedShifts.reduce((sum, s) => sum + shiftHours(s), 0);
  const selectedLogged = selectedLogs.reduce((sum, l) => sum + l.hours, 0);
  const selectedIsPast = selectedKey < todayKey;

  // One-line comparison of the roster against what was logged for that day
  let verdict: { text: string; tone: 'good' | 'warn' | 'plain' } | null = null;
  if (selectedShifts.length > 0 && selectedLogs.length > 0) {
    const diff = selectedLogged - selectedScheduled;
    verdict = Math.abs(diff) < 0.25
      ? { text: 'Matches the roster', tone: 'good' }
      : { text: `${Math.abs(diff).toFixed(1)}h ${diff > 0 ? 'more' : 'less'} than rostered`, tone: 'plain' };
  } else if (selectedShifts.length > 0) {
    verdict = selectedIsPast ? { text: 'Not logged', tone: 'warn' } : { text: 'Coming up', tone: 'plain' };
  } else if (selectedLogs.length > 0) {
    verdict = { text: 'Logged, not on the roster', tone: 'plain' };
  }

  const upcoming = shifts
    .filter((s) => new Date(s.start).getTime() >= today.getTime())
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 4);

  if (loading || !user) return <AppPageLoader label="Loading calendar" />;

  return (
    <div className="min-h-screen sb-page md:pl-64 pb-20 md:pb-0 text-ink">
      <Sidebar />
      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <h2 className="font-hand font-bold text-6xl leading-none">
              Roster <span className="text-stamp">Calendar</span>
            </h2>
            <Scribble className="mt-1 h-3 w-44 text-ink" />
            <p className="font-note text-xl text-ink-soft mt-2">
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
                className="px-4 py-2 min-h-[44px] sm:min-h-0 text-xs font-bold tracking-widest uppercase text-white bg-ink hover:bg-zinc-800 transition-all shadow-md disabled:opacity-60"
              >
                {syncing ? <InlineLoader label="Syncing" /> : (
                  <span className="inline-flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5" /> Sync Now</span>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {syncStatus && !syncStatus.configured && (
          <div className="mb-10 border-2 border-dashed border-ink/30 p-8 text-center">
            <CalendarClock className="w-8 h-8 mx-auto text-ink-faint mb-3" strokeWidth={1.75} />
            <p className="font-hand font-bold text-3xl mb-1">No roster connected</p>
            <p className="font-note text-lg text-ink-soft mb-4">Paste your Humanforce calendar link to see scheduled shifts here.</p>
            <Link
              href="/profile"
              className="inline-block px-6 py-3 text-xs font-bold tracking-widest uppercase text-white bg-ink hover:bg-zinc-800 transition-all shadow-md"
            >
              Connect in Employers → Integrations
            </Link>
          </div>
        )}

        {syncStatus?.configured && syncStatus.lastSyncStatus === 'failed' && (
          <div className="mb-10 p-4 font-note text-lg border-2 border-stamp text-stamp bg-paper-white flex items-center gap-2 -rotate-[0.5deg]">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            Humanforce sync failed. Check your link in Employers, under Integrations. Showing last synced data from {formatSyncTime(syncStatus.lastSyncAt)}.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-12 items-start">

          {/* Month page: every day is a tappable date with pen marks on it */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: isDataLoading ? 0.5 : 1, y: 0 }}
            className="relative lg:col-span-7 -mx-2 sm:mx-0"
          >
            <Tape className="-top-3 left-8 -rotate-3" />
            <Tape className="-top-3 right-8 rotate-2" />
            <Scrap paper="white" edge="rough" className="px-2 sm:px-8 pt-9 pb-6">
              <div className="flex items-center justify-between px-2 sm:px-0">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => goToMonth(viewDate.getFullYear(), viewDate.getMonth() - 1)}
                  className="h-11 w-11 inline-flex items-center justify-center text-ink-soft hover:text-stamp transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                  <h3 className="font-hand font-bold text-4xl sm:text-5xl leading-none">{monthLabel}</h3>
                  <button
                    type="button"
                    onClick={() => goToMonth(today.getFullYear(), today.getMonth())}
                    className="sb-link mt-1 py-1 font-note text-base text-ink-soft hover:text-stamp hover:border-stamp transition-colors"
                  >
                    back to today
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => goToMonth(viewDate.getFullYear(), viewDate.getMonth() + 1)}
                  className="h-11 w-11 inline-flex items-center justify-center text-ink-soft hover:text-stamp transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-7 border-b-2 border-dashed border-ink/25 pb-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div key={d} className="text-center font-note text-base text-ink-soft">
                    {d}
                  </div>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7">
                {gridDays.map((day) => {
                  const key = localKey(day);
                  const inMonth = day.getMonth() === viewDate.getMonth();
                  const isToday = key === todayKey;
                  const isSelected = key === selectedKey;
                  const dayShifts = shiftsByDay[key] || [];
                  const loggedTotal = (logsByDay[key] || []).reduce((sum, l) => sum + l.hours, 0);
                  const scheduledTotal = dayShifts.reduce((sum, s) => sum + shiftHours(s), 0);
                  const notLogged = dayShifts.length > 0 && loggedTotal === 0 && key < todayKey;
                  const summary = [
                    dayShifts.length > 0 ? `${scheduledTotal.toFixed(1)} hours rostered` : '',
                    loggedTotal > 0 ? `${loggedTotal.toFixed(1)} hours logged` : '',
                  ].filter(Boolean).join(', ');

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => selectDay(key)}
                      aria-pressed={isSelected}
                      aria-label={`${day.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}${summary ? `, ${summary}` : ''}`}
                      className={`relative flex min-h-[52px] sm:min-h-[72px] flex-col items-center justify-center gap-0.5 transition-all ${inMonth ? '' : 'opacity-35'} ${isSelected ? 'bg-tape shadow-sm -rotate-2' : 'hover:bg-tape/40'}`}
                    >
                      <span className={`relative inline-flex h-8 w-8 items-center justify-center font-note text-xl sm:text-2xl ${isToday ? 'font-bold text-stamp' : ''}`}>
                        {day.getDate()}
                        {dayShifts.length > 0 && <Ring className="pointer-events-none absolute -inset-1.5 text-ink" />}
                      </span>
                      <span className="flex h-3.5 items-center gap-0.5">
                        {loggedTotal > 0 && <Tick className="h-3.5 w-3.5 text-moss" />}
                        {notLogged && <span className="font-hand text-xl font-bold leading-none text-stamp">?</span>}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Key + month totals */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t-2 border-dashed border-ink/25 px-2 pt-4 font-note text-base text-ink-soft sm:px-0">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                  <span className="inline-flex items-center gap-2">
                    <span className="relative inline-block h-5 w-5"><Ring className="absolute inset-0 text-ink" /></span> rostered
                  </span>
                  <span className="inline-flex items-center gap-1.5"><Tick className="h-4 w-4 text-moss" /> logged</span>
                  <span className="inline-flex items-center gap-1.5"><span className="font-hand text-xl font-bold leading-none text-stamp">?</span> not logged</span>
                </div>
                <p className="text-ink">
                  <span className="font-type font-bold text-stamp">{monthTotals.scheduled.toFixed(1)}h</span> rostered,{' '}
                  <span className="font-type font-bold text-moss">{monthTotals.logged.toFixed(1)}h</span> logged
                </p>
              </div>
            </Scrap>
          </motion.div>

          <div className="lg:col-span-5 space-y-12">

            {/* Day note: the selected date written out in full */}
            <motion.div
              ref={dayNoteRef}
              key={selectedKey}
              initial={{ opacity: 0, rotate: 3 }}
              animate={{ opacity: 1, rotate: 1 }}
              transition={{ duration: 0.25 }}
              className="relative scroll-mb-24"
            >
              <Star className="absolute -top-9 right-3 h-9 w-9 text-ink" />
              <div className="sb-lined px-6 pt-4 pb-6 shadow-lg font-note text-xl">
                <p className="font-hand font-bold text-[2rem] leading-8">
                  {selectedDay.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                  {selectedKey === todayKey && <span className="ml-2 font-note text-lg font-normal text-stamp">today</span>}
                </p>

                {selectedShifts.length === 0 && selectedLogs.length === 0 && (
                  <p className="text-ink-faint">Nothing rostered or logged.</p>
                )}

                {selectedShifts.length > 0 && (
                  <>
                    <p className="sb-link mt-8 inline-block tracking-widest leading-6">ROSTERED:</p>
                    <ul>
                      {selectedShifts.map((s) => (
                        <li key={s._id}>
                          <span className="flex items-baseline justify-between gap-3">
                            <span>{fmtTime(s.start)} to {fmtTime(s.end)}</span>
                            <span className="font-type text-base font-bold text-stamp">{shiftHours(s).toFixed(1)}h</span>
                          </span>
                          <span className="block text-ink-soft">{s.title}{s.location ? ` at ${s.location}` : ''}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {selectedLogs.length > 0 && (
                  <>
                    <p className="sb-link mt-8 inline-block tracking-widest leading-6">LOGGED:</p>
                    <ul>
                      {selectedLogs.map((l) => (
                        <li key={l._id} className="flex items-baseline justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-2">
                            <Tick className="h-4 w-4 shrink-0 text-moss" />
                            <span className="truncate">
                              {l.client?.name || 'Logged'}
                              {l.startTime && l.finishTime ? `, ${l.startTime} to ${l.finishTime}` : ''}
                            </span>
                          </span>
                          <span className="font-type text-base font-bold text-moss">{l.hours.toFixed(1)}h</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {verdict && (
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-3 leading-8">
                    <span className={`sb-sketch -rotate-2 px-3 ${verdict.tone === 'good' ? 'border-moss text-moss' : verdict.tone === 'warn' ? 'border-stamp text-stamp' : ''}`}>
                      {verdict.text}
                    </span>
                    {verdict.tone === 'warn' && (
                      <Link href="/timesheet" className="sb-link hover:text-stamp hover:border-stamp transition-colors">
                        Log these hours
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Coming up: the next few shifts, readable without tapping around */}
            {upcoming.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="relative -rotate-1"
              >
                <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-2 !w-24" />
                <div className="sb-grid px-6 pt-7 pb-5 shadow-md">
                  <h3 className="font-hand font-bold text-3xl leading-none">Coming up</h3>
                  <ul className="mt-3">
                    {upcoming.map((s) => {
                      const start = new Date(s.start);
                      return (
                        <li key={s._id} className="border-b border-dashed border-ink/25 last:border-0">
                          <button
                            type="button"
                            onClick={() => {
                              setViewDate(new Date(start.getFullYear(), start.getMonth(), 1));
                              selectDay(localKey(start));
                            }}
                            className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:text-stamp transition-colors"
                          >
                            <span className="min-w-0">
                              <span className="block font-note text-xl leading-tight">
                                {start.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}, {fmtTime(s.start)} to {fmtTime(s.end)}
                              </span>
                              <span className="block truncate font-note text-base text-ink-soft">{s.title}{s.location ? ` at ${s.location}` : ''}</span>
                            </span>
                            <span className="font-type text-sm font-bold">{shiftHours(s).toFixed(1)}h</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
