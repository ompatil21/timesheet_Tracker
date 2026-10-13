'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { checkPublicHoliday } from '@/lib/holidays';
import Sidebar from '@/components/Sidebar';
import { Scribble } from '@/components/scrapbook';
import { AppPageLoader, FormPanelSkeleton, InlineLoader, ListSkeleton } from '@/components/LoadingStates';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, X, AlertTriangle, Clock, Coffee, ArrowRight, Calendar, Briefcase, MessageSquare, CheckCircle2, Gift } from 'lucide-react';

export default function Timesheet() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [timeFilter, setTimeFilter] = useState<'week' | 'lastWeek' | 'month'>('week');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [client, setClient] = useState('');
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [startTime, setStartTime] = useState('');
  const [finishTime, setFinishTime] = useState('');
  const [breakMinutes, setBreakMinutes] = useState('');
  const [useTimeInput, setUseTimeInput] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSupervisorShift, setIsSupervisorShift] = useState(false);
  const [error, setError] = useState('');
  const [detectedHoliday, setDetectedHoliday] = useState<{ isHoliday: boolean; name?: string }>({ isHoliday: false });

  // Calculate hours from start and finish times
  const calculateHoursWorked = (start: string, finish: string, breakMins: number = 0): number | null => {
    if (!start || !finish) return null;

    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = finish.split(':').map(Number);

    let startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;

    // Handle case where finish time is next day
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }

    const totalMinutes = endMinutes - startMinutes - (breakMins || 0);
    const calculatedHours = parseFloat((totalMinutes / 60).toFixed(2));
    return calculatedHours > 0 ? calculatedHours : null;
  };

  const calculatedHours = useTimeInput && startTime && finishTime ? calculateHoursWorked(startTime, finishTime, parseInt(breakMinutes) || 0) : null;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user, loading, router]);

  // Check for public holidays when date changes
  useEffect(() => {
    if (date) {
      const holiday = checkPublicHoliday(date);
      setDetectedHoliday(holiday);
    }
  }, [date]);

  const fetchData = async (showSkeleton = true) => {
    if (showSkeleton) setIsDataLoading(true);
    try {
      const [clientRes, logRes] = await Promise.all([
        api.get('/clients'),
        api.get('/timelogs')
      ]);
      setClients(clientRes.data);
      setLogs(logRes.data);
      if (clientRes.data.length > 0 && !editingId) setClient(clientRes.data[0]._id);
      if (!editingId && !date) setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !date || !calculatedHours && !hours) {
      setError('Missing timesheet data');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedClient = clients.find((c: any) => c._id === client);
      const payload: any = {
        client,
        date,
        notes,
        isPublicHoliday: detectedHoliday.isHoliday,
        isSupervisorShift: !!(selectedClient?.supervisorRate && isSupervisorShift),
      };

      if (useTimeInput && startTime && finishTime) {
        payload.startTime = startTime;
        payload.finishTime = finishTime;
        payload.breakMinutes = parseInt(breakMinutes) || 0;
      } else {
        payload.hours = parseFloat(hours);
      }

      if (editingId) {
        await api.put(`/timelogs/${editingId}`, payload);
      } else {
        await api.post('/timelogs', payload);
      }

      setHours('');
      setStartTime('');
      setFinishTime('');
      setBreakMinutes('');
      setUseTimeInput(false);
      setNotes('');
      setIsSupervisorShift(false);
      setEditingId(null);
      setError('');
      await fetchData(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process timesheet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (log: any) => {
    setEditingId(log._id);
    setClient(log.client?._id || '');
    setDate(new Date(log.date).toISOString().split('T')[0]);
    setHours(log.hours.toString());
    setStartTime(log.startTime || '');
    setFinishTime(log.finishTime || '');
    setBreakMinutes(log.breakMinutes?.toString() || '');
    setUseTimeInput(!!(log.startTime && log.finishTime));
    setNotes(log.notes || '');
    setIsSupervisorShift(log.isSupervisorShift || false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this timesheet?')) {
      setDeletingId(id);
      try {
        await api.delete(`/timelogs/${id}`);
        if (editingId === id) {
          setEditingId(null);
          setHours('');
          setStartTime('');
          setFinishTime('');
          setBreakMinutes('');
          setUseTimeInput(false);
          setNotes('');
        }
        await fetchData(false);
      } catch (err) {
        console.error('Failed to delete');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filteredLogs = (() => {
    const now = new Date();
    let start: Date, end: Date;
    if (timeFilter === 'week') {
      const d = now.getDay(); const diff = d === 0 ? 6 : d - 1;
      start = new Date(now); start.setDate(now.getDate() - diff); start.setHours(0,0,0,0);
      end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
    } else if (timeFilter === 'lastWeek') {
      const d = now.getDay(); const diff = d === 0 ? 13 : d + 6;
      start = new Date(now); start.setDate(now.getDate() - diff); start.setHours(0,0,0,0);
      end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    return logs.filter(l => { const d = new Date(l.date); return d >= start && d <= end; });
  })();

  if (loading || !user) return <AppPageLoader label="Loading timesheet" />;

  return (
    <div className="min-h-screen sb-page md:pl-64 pb-20 md:pb-0 text-zinc-900 transition-colors">
      <Sidebar />
      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h2 className="font-hand font-bold text-6xl leading-none">
            Log <span className="text-racing-red">Timesheet</span>
          </h2>
          <Scribble className="mt-1 h-3 w-44 text-ink" />
          <p className="font-note text-xl text-ink-soft mt-2">Track your daily hours</p>
        </motion.div>

        {isDataLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <FormPanelSkeleton />
            </div>
            <div className="lg:col-span-2">
              <h3 className="font-note text-2xl text-ink mb-4">Timesheet History</h3>
              <ListSkeleton rows={8} />
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-white/80 rounded-xl shadow-lg border overflow-hidden lg:col-span-1 h-fit backdrop-blur-sm transition-colors ${editingId ? 'border-amber-500' : 'border-zinc-200'}`}
          >
            <div className="p-6 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center transition-colors">
              <h3 className={`text-sm font-bold uppercase tracking-widest ${editingId ? 'text-amber-500' : 'text-zinc-700'}`}>
                {editingId ? 'Edit Entry' : 'New Entry'}
              </h3>
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setHours('');
                    setNotes('');
                  }}
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-900 uppercase tracking-widest flex items-center"
                >
                  <X className="w-4 h-4 mr-1" /> Cancel Edit
                </button>
              )}
            </div>
            <div className="p-6">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 rounded bg-red-100 border border-racing-red p-4 text-sm text-red-700 font-medium"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {clients.length === 0 ? (
                <div className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 p-4 border border-amber-200 rounded shadow-sm">
                  Assign an employer in settings first.
                </div>
              ) : (
                <form onSubmit={handleAddOrUpdate} className="space-y-6">
                  {!client && editingId && (
                    <div className="flex items-center text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 p-3 border border-amber-200 rounded shadow-sm mb-4">
                      <AlertTriangle className="w-4 h-4 mr-2" /> Original employer was deleted. Please select a new one.
                    </div>
                  )}

                  {/* Step 1: Employer & Date */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 bg-paper-white p-5 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="sb-sketch w-9 h-9 font-hand font-bold text-2xl text-ink flex items-center justify-center">1</div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-600">Setup</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Briefcase className="w-4 h-4" /> Employer
                        </label>
                        <select
                          required
                          className="block w-full border-zinc-300 bg-white px-4 py-3 text-base md:text-sm text-zinc-900 focus:border-racing-red focus:ring-2 focus:ring-racing-red/20 transition-all shadow-sm rounded-lg font-semibold"
                          value={client} onChange={(e) => setClient(e.target.value)}
                        >
                          <option value="" disabled>Select...</option>
                          {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> Date
                        </label>
                        <input
                          type="date" required
                          className="block w-full border-zinc-300 bg-white px-4 py-3 text-base md:text-sm text-zinc-900 focus:border-racing-red focus:ring-2 focus:ring-racing-red/20 transition-all shadow-sm rounded-lg font-semibold"
                          value={date} onChange={(e) => setDate(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Holiday Detection Badge */}
                    <AnimatePresence>
                      {detectedHoliday.isHoliday && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="relative overflow-hidden bg-tape p-4 shadow-md -rotate-1"
                        >
                          {/* Animated background shimmer */}
                          <motion.div
                            animate={{ x: ['0%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white to-transparent"
                          />

                          <div className="relative z-10 flex items-center gap-3">
                            <Gift className="w-5 h-5 text-ink flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-note text-lg text-ink">🎉 Public holiday detected</p>
                              <p className="text-xs text-ink-soft font-bold mt-0.5">{detectedHoliday.name}: special rates will apply</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Supervisor shift toggle — only shown when selected client has a supervisorRate */}
                  {clients.find((c: any) => c._id === client)?.supervisorRate && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 rounded-xl border border-amber-200 bg-amber-50/50"
                    >
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Supervisor Shift</p>
                        <p className="text-[11px] text-amber-600 mt-0.5 font-medium">
                          Base ${clients.find((c: any) => c._id === client)?.supervisorRate}/hr instead of ${clients.find((c: any) => c._id === client)?.ordinaryRate}/hr
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsSupervisorShift(v => !v)}
                        className={`relative w-12 h-6 rounded-full transition-colors after:absolute after:-inset-3 after:content-[''] ${isSupervisorShift ? 'bg-amber-500' : 'bg-zinc-300'}`}
                        aria-label="Toggle supervisor shift"
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isSupervisorShift ? 'translate-x-6' : ''}`} />
                      </button>
                    </motion.div>
                  )}

                  {/* Step 2: Time Input Mode */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="sb-sketch w-9 h-9 font-hand font-bold text-2xl text-ink flex items-center justify-center">2</div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-600">Track Hours</h4>
                    </div>

                    {/* Time Mode Selector */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setUseTimeInput(false)}
                        className={`p-4 rounded-xl border-2 transition-all font-bold uppercase tracking-widest text-xs flex flex-col items-center justify-center gap-2 ${!useTimeInput
                          ? 'bg-racing-red/10 border-racing-red text-racing-red shadow-lg shadow-racing-red/20'
                          : 'bg-white border-zinc-300 text-zinc-600 hover:border-racing-red/50'
                          }`}
                      >
                        <Clock className="w-5 h-5" />
                        Manual Entry
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setUseTimeInput(true)}
                        className={`p-4 rounded-xl border-2 transition-all font-bold uppercase tracking-widest text-xs flex flex-col items-center justify-center gap-2 ${useTimeInput
                          ? 'bg-racing-red/10 border-racing-red text-racing-red shadow-lg shadow-racing-red/20'
                          : 'bg-white border-zinc-300 text-zinc-600 hover:border-racing-red/50'
                          }`}
                      >
                        <ArrowRight className="w-5 h-5" />
                        Start to Finish
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Time Input Section */}
                  <AnimatePresence mode="wait">
                    {useTimeInput ? (
                      <motion.div
                        key="time-mode"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4 bg-paper-dark/50 p-5 border-2 border-dashed border-ink/25"
                      >
                        {/* Start & Finish Times */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-zinc-600 uppercase tracking-widest mb-2">Start</label>
                              <input
                                type="time" required
                                className="block w-full border-2 border-zinc-300 bg-white px-4 py-3 text-base md:text-sm text-zinc-900 focus:border-racing-red focus:ring-2 focus:ring-racing-red/20 transition-all shadow-sm rounded-lg font-mono font-bold text-center"
                                value={startTime} onChange={(e) => setStartTime(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-zinc-600 uppercase tracking-widest mb-2">Finish</label>
                              <input
                                type="time" required
                                className="block w-full border-2 border-zinc-300 bg-white px-4 py-3 text-base md:text-sm text-zinc-900 focus:border-racing-red focus:ring-2 focus:ring-racing-red/20 transition-all shadow-sm rounded-lg font-mono font-bold text-center"
                                value={finishTime} onChange={(e) => setFinishTime(e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Time Visual Indicator */}
                          {startTime && finishTime && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-zinc-200 font-mono font-bold text-sm text-zinc-700"
                            >
                              <span>{startTime}</span>
                              <ArrowRight className="w-4 h-4 text-racing-red" />
                              <span>{finishTime}</span>
                            </motion.div>
                          )}
                        </div>

                        {/* Break Duration */}
                        <div>
                          <label className="block text-xs font-bold text-zinc-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Coffee className="w-4 h-4" /> Break Duration (Optional)
                          </label>
                          <div className="relative">
                            <input
                              type="number" min="0" max="480"
                              className="block w-full border-2 border-zinc-300 bg-white px-4 py-3 text-base md:text-sm text-zinc-900 focus:border-racing-red focus:ring-2 focus:ring-racing-red/20 transition-all shadow-sm rounded-lg font-mono font-bold pl-4"
                              placeholder="Minutes"
                              value={breakMinutes} onChange={(e) => setBreakMinutes(e.target.value)}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 pointer-events-none">min</span>
                          </div>
                        </div>

                        {/* Calculated Hours Display */}
                        {calculatedHours !== null && (
                          <motion.div
                            key="hours-display"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative overflow-hidden rounded-xl bg-moss shadow-lg p-6 mt-4"
                          >
                            {/* Animated background */}
                            <div className="absolute inset-0 opacity-10">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                              />
                            </div>

                            <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                              <div className="text-xs font-bold uppercase tracking-widest text-green-100">Calculated Hours</div>
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                className="font-bold font-display text-5xl text-white drop-shadow-lg"
                              >
                                {calculatedHours}
                                <span className="text-2xl ml-2">hrs</span>
                              </motion.div>
                              <div className="text-xs font-bold text-green-100 mt-2">
                                {breakMinutes && parseInt(breakMinutes) > 0 && `(${breakMinutes}m break)`}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="manual-mode"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-paper-dark/50 p-5 border-2 border-dashed border-ink/25"
                      >
                        <label className="block text-xs font-bold text-zinc-600 uppercase tracking-widest mb-3">Hours Worked</label>
                        <div className="relative">
                          <input
                            type="number" step="0.25" min="0" max="24" required
                            className="block w-full border-2 border-zinc-300 bg-white px-4 py-4 text-zinc-900 focus:border-racing-red focus:ring-2 focus:ring-racing-red/20 transition-all shadow-sm rounded-lg font-mono font-black text-center text-2xl"
                            placeholder="0.0"
                            value={hours} onChange={(e) => setHours(e.target.value)}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500 pointer-events-none">hrs</span>
                        </div>

                        {/* Hours Visual Indicator */}
                        {hours && (
                          <motion.div
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            className="mt-4 h-2 bg-zinc-200 rounded-full overflow-hidden"
                            style={{ originX: 0 }}
                          >
                            <motion.div
                              layoutId="hours-progress"
                              className="h-full bg-ink rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((parseFloat(hours) / 24) * 100, 100)}%` }}
                            />
                          </motion.div>
                        )}
                        {hours && (
                          <div className="mt-2 text-xs text-zinc-600 font-semibold">
                            {parseFloat(hours) > 12 && '⚠️ Over 12 hours '}
                            {parseFloat(hours) >= 8 && parseFloat(hours) <= 12 && '✓ Standard workday'}
                            {parseFloat(hours) < 8 && '📝 Partial day'}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Step 3: Notes */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4 bg-paper-white p-5 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="sb-sketch w-9 h-9 font-hand font-bold text-2xl text-ink flex items-center justify-center">3</div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-600">Notes</h4>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Add Notes (Optional)
                      </label>
                      <textarea
                        className="block w-full border-2 border-zinc-300 bg-white px-4 py-3 text-base md:text-sm text-zinc-900 focus:border-racing-red focus:ring-2 focus:ring-racing-red/20 transition-all shadow-sm rounded-lg resize-none"
                        rows={3}
                        placeholder="Add any relevant notes about this entry..."
                        value={notes} onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98, y: 0 }}
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-sm text-white transition-all shadow-lg flex items-center justify-center gap-3 ${editingId
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-ink hover:bg-zinc-800'
                      } disabled:cursor-wait disabled:opacity-70`}
                  >
                    {isSubmitting ? (
                      <InlineLoader label={editingId ? 'Updating Entry' : 'Logging Entry'} />
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        {editingId ? 'Update Entry' : 'Log Entry'}
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="font-note text-2xl text-ink">
                Timesheet History
                <span className="ml-2 text-zinc-400 font-normal normal-case tracking-normal">({filteredLogs.length} entries)</span>
              </h3>
              <div className="flex bg-zinc-200 p-1 rounded-lg border border-zinc-300 shadow-sm w-fit">
                {(['week', 'lastWeek', 'month'] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTimeFilter(f)}
                    className={`px-3 py-3 sm:py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-md transition-all ${timeFilter === f ? 'bg-white text-racing-red shadow-sm border border-zinc-300' : 'text-zinc-500 hover:text-zinc-700'}`}
                  >
                    {f === 'week' ? 'This Week' : f === 'lastWeek' ? 'Last Week' : 'This Month'}
                  </button>
                ))}
              </div>
            </div>
            <div className="sb-card overflow-hidden">
              <ul className="divide-y divide-zinc-100">
                <AnimatePresence>
                  {filteredLogs.map((log, index) => (
                    <motion.li
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      key={log._id}
                      className={`p-5 hover:bg-zinc-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${editingId === log._id ? 'bg-amber-50' : ''}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-zinc-900 uppercase tracking-wider text-sm">{log.client?.name || 'Unknown Client'}</p>
                          {log.isPublicHoliday && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="font-note text-sm bg-tape text-ink px-2 shadow-sm -rotate-2"
                            >
                              🎉 {detectedHoliday.name || 'Holiday'}
                            </motion.span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase mt-1">{new Date(log.date).toLocaleDateString()}</p>

                        {/* Time details if available */}
                        {log.startTime && log.finishTime && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-3 mt-2 text-xs text-zinc-600 font-mono font-semibold"
                          >
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{log.startTime}</span>
                            </div>
                            <span className="text-zinc-400">→</span>
                            <span>{log.finishTime}</span>
                            {log.breakMinutes > 0 && (
                              <>
                                <span className="text-zinc-400">·</span>
                                <div className="flex items-center gap-1">
                                  <Coffee className="w-3 h-3" />
                                  <span>{log.breakMinutes}m break</span>
                                </div>
                              </>
                            )}
                          </motion.div>
                        )}

                        {log.notes && (
                          <p className="text-xs text-zinc-500 italic mt-2 truncate">{log.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <p className="font-bold font-display text-2xl text-zinc-900 group-hover:text-racing-red transition-colors">{log.hours}</p>
                          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">HRS</p>
                        </div>
                        <div className="w-px h-8 bg-zinc-200 hidden sm:block"></div>

                        <div className="hidden md:block min-w-[80px] text-right">
                          <p className="text-xs font-bold text-zinc-600">${log.earnedOrdinary?.toFixed(2) || '0.00'}</p>
                          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Ordinary</p>
                        </div>
                        {log.earnedCasual > 0 && (
                          <div className="hidden md:block min-w-[60px] text-right">
                            <p className="text-xs font-bold text-amber-600">${log.earnedCasual?.toFixed(2) || '0.00'}</p>
                            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Casual</p>
                          </div>
                        )}

                        <div className="min-w-[80px]">
                          <p className="font-bold font-display text-lg text-green-600">${log.earnedRevenue?.toFixed(2) || '0.00'}</p>
                          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Total</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity ml-2 border-l border-zinc-200 pl-4">
                          <button onClick={() => handleEdit(log)} aria-label="Edit entry" className="p-2 bg-zinc-100 rounded text-zinc-500 hover:text-amber-500 transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button disabled={deletingId === log._id} onClick={() => handleDelete(log._id)} aria-label="Delete entry" className="p-2 bg-zinc-100 rounded text-zinc-500 hover:text-racing-red transition-colors disabled:cursor-wait disabled:opacity-60 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 inline-flex items-center justify-center">
                            {deletingId === log._id ? <InlineLoader label="" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
                {filteredLogs.length === 0 && (
                  <li className="p-10 text-center text-zinc-500 font-bold uppercase tracking-widest text-sm">
                    {logs.length === 0 ? 'No time logged yet.' : 'No entries for this period.'}
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        </div>
        )}
      </main>
    </div>
  );
}
