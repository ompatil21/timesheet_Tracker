'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { checkPublicHoliday } from '@/lib/holidays';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, X, AlertTriangle, Clock, Coffee, ArrowRight, Calendar, Briefcase, MessageSquare, CheckCircle2, Gift } from 'lucide-react';

export default function Timesheet() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [client, setClient] = useState('');
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [startTime, setStartTime] = useState('');
  const [finishTime, setFinishTime] = useState('');
  const [breakMinutes, setBreakMinutes] = useState('');
  const [useTimeInput, setUseTimeInput] = useState(false);
  const [notes, setNotes] = useState('');
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
    if (!loading && !user) router.push('/login');
    fetchData();
  }, [user, loading, router]);

  // Check for public holidays when date changes
  useEffect(() => {
    if (date) {
      const holiday = checkPublicHoliday(date);
      setDetectedHoliday(holiday);
    }
  }, [date]);

  const fetchData = async () => {
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
    }
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !date || !calculatedHours && !hours) {
      setError('Missing timesheet data');
      return;
    }

    try {
      const payload: any = {
        client,
        date,
        notes,
        isPublicHoliday: detectedHoliday.isHoliday // Auto-include detected holiday
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
      setEditingId(null);
      setError('');
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process timesheet');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this timesheet?')) {
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
        fetchData();
      } catch (err) {
        console.error('Failed to delete');
      }
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-carbon md:pl-64 pb-20 md:pb-0 text-zinc-900 dark:text-white transition-colors">
      <Sidebar />
      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6"
        >
          <h2 className="text-4xl font-black font-display uppercase tracking-tight italic">
            Log <span className="text-racing-red">Timesheet</span>
          </h2>
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold mt-2">Track your daily hours</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-lg border overflow-hidden lg:col-span-1 h-fit backdrop-blur-sm transition-colors ${editingId ? 'border-amber-500' : 'border-zinc-200 dark:border-zinc-800'}`}
          >
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex justify-between items-center transition-colors">
              <h3 className={`text-sm font-bold uppercase tracking-widest ${editingId ? 'text-amber-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                {editingId ? 'Edit Entry' : 'New Entry'}
              </h3>
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setHours('');
                    setNotes('');
                  }}
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white uppercase tracking-widest flex items-center"
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
                    className="mb-6 rounded bg-red-100 dark:bg-red-950/50 border border-racing-red p-4 text-sm text-red-700 dark:text-red-200 font-medium"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {clients.length === 0 ? (
                <div className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-900 rounded shadow-sm">
                  Assign an employer in settings first.
                </div>
              ) : (
                <form onSubmit={handleAddOrUpdate} className="space-y-6">
                  {!client && editingId && (
                    <div className="flex items-center text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 p-3 border border-amber-200 dark:border-amber-900 rounded shadow-sm mb-4">
                      <AlertTriangle className="w-4 h-4 mr-2" /> Original employer was deleted. Please select a new one.
                    </div>
                  )}

                  {/* Step 1: Employer & Date */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900/50 dark:to-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-racing-red/20 text-racing-red font-black flex items-center justify-center text-sm">1</div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Setup</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Briefcase className="w-4 h-4" /> Employer
                        </label>
                        <select
                          required
                          className="block w-full border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white focus:border-racing-red focus:ring-2 focus:ring-racing-red/20 transition-all shadow-sm rounded-lg font-semibold"
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
                          className="block w-full border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white focus:border-racing-red focus:ring-2 focus:ring-racing-red/20 transition-all shadow-sm rounded-lg font-semibold"
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
                          className="relative overflow-hidden rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 p-4 shadow-lg shadow-amber-500/30"
                        >
                          {/* Animated background shimmer */}
                          <motion.div
                            animate={{ x: ['0%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white to-transparent"
                          />

                          <div className="relative z-10 flex items-center gap-3">
                            <Gift className="w-5 h-5 text-white flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-black text-sm text-white uppercase tracking-widest">🎉 Public Holiday Detected</p>
                              <p className="text-xs text-orange-50 font-bold mt-0.5">{detectedHoliday.name} - Special rates will apply</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Step 2: Time Input Mode */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-racing-red/20 text-racing-red font-black flex items-center justify-center text-sm">2</div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Track Hours</h4>
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
                            : 'bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-racing-red/50'
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
                            : 'bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-racing-red/50'
                          }`}
                      >
                        <ArrowRight className="w-5 h-5" />
                        Start → Finish
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
                        className="space-y-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-5 rounded-xl border-2 border-blue-200/50 dark:border-blue-900/30"
                      >
                        {/* Start & Finish Times */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-2">Start</label>
                              <input
                                type="time" required
                                className="block w-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white focus:border-racing-red focus:ring-2 focus:ring-racing-red/20 transition-all shadow-sm rounded-lg font-mono font-bold text-center"
                                value={startTime} onChange={(e) => setStartTime(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-2">Finish</label>
                              <input
                                type="time" required
                                className="block w-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white focus:border-racing-red focus:ring-2 focus:ring-racing-red/20 transition-all shadow-sm rounded-lg font-mono font-bold text-center"
                                value={finishTime} onChange={(e) => setFinishTime(e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Time Visual Indicator */}
                          {startTime && finishTime && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono font-bold text-sm text-zinc-700 dark:text-zinc-300"
                            >
                              <span>{startTime}</span>
                              <ArrowRight className="w-4 h-4 text-racing-red" />
                              <span>{finishTime}</span>
                            </motion.div>
                          )}
                        </div>

                        {/* Break Duration */}
                        <div>
                          <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Coffee className="w-4 h-4" /> Break Duration (Optional)
                          </label>
                          <div className="relative">
                            <input
                              type="number" min="0" max="480"
                              className="block w-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white focus:border-racing-red focus:ring-2 focus:ring-racing-red/20 transition-all shadow-sm rounded-lg font-mono font-bold pl-4"
                              placeholder="Minutes"
                              value={breakMinutes} onChange={(e) => setBreakMinutes(e.target.value)}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 dark:text-zinc-400 pointer-events-none">min</span>
                          </div>
                        </div>

                        {/* Calculated Hours Display */}
                        {calculatedHours !== null && (
                          <motion.div
                            key="hours-display"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30 p-6 mt-4"
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
                                className="font-black font-display text-5xl text-white drop-shadow-lg"
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
                        className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-5 rounded-xl border-2 border-purple-200/50 dark:border-purple-900/30"
                      >
                        <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-3">Hours Worked</label>
                        <div className="relative">
                          <input
                            type="number" step="0.25" min="0" max="24" required
                            className="block w-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-4 text-sm text-zinc-900 dark:text-white focus:border-racing-red focus:ring-2 focus:ring-racing-red/20 transition-all shadow-sm rounded-lg font-mono font-black text-center text-2xl"
                            placeholder="0.0"
                            value={hours} onChange={(e) => setHours(e.target.value)}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500 dark:text-zinc-400 pointer-events-none">hrs</span>
                        </div>

                        {/* Hours Visual Indicator */}
                        {hours && (
                          <motion.div
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            className="mt-4 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden"
                            style={{ originX: 0 }}
                          >
                            <motion.div
                              layoutId="hours-progress"
                              className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((parseFloat(hours) / 24) * 100, 100)}%` }}
                            />
                          </motion.div>
                        )}
                        {hours && (
                          <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
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
                    className="space-y-4 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900/50 dark:to-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-racing-red/20 text-racing-red font-black flex items-center justify-center text-sm">3</div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Notes</h4>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Add Notes (Optional)
                      </label>
                      <textarea
                        className="block w-full border-2 border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-white focus:border-racing-red focus:ring-2 focus:ring-racing-red/20 transition-all shadow-sm rounded-lg resize-none"
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
                    className={`w-full py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-sm text-white transition-all shadow-lg flex items-center justify-center gap-3 ${editingId
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg hover:shadow-amber-500/40'
                        : 'bg-gradient-to-r from-racing-red to-red-600 hover:shadow-lg hover:shadow-racing-red/40'
                      }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {editingId ? 'Update Entry' : 'Log Entry'}
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
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Timesheet History</h3>
            <div className="bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden backdrop-blur-sm">
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <AnimatePresence>
                  {logs.map((log, index) => (
                    <motion.li
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      key={log._id}
                      className={`p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${editingId === log._id ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-sm">{log.client?.name || 'Unknown Client'}</p>
                          {log.isPublicHoliday && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2 py-1 rounded-full border-2 border-amber-300/50 shadow-md"
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
                            className="flex items-center gap-3 mt-2 text-xs text-zinc-600 dark:text-zinc-400 font-mono font-semibold"
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
                          <p className="font-black font-display text-2xl text-zinc-900 dark:text-white group-hover:text-racing-red transition-colors">{log.hours}</p>
                          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">HRS</p>
                        </div>
                        <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>

                        <div className="hidden md:block min-w-[80px] text-right">
                          <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">${log.earnedOrdinary?.toFixed(2) || '0.00'}</p>
                          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Ordinary</p>
                        </div>
                        {log.earnedCasual > 0 && (
                          <div className="hidden md:block min-w-[60px] text-right">
                            <p className="text-xs font-bold text-amber-600 dark:text-amber-500">${log.earnedCasual?.toFixed(2) || '0.00'}</p>
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Casual</p>
                          </div>
                        )}

                        <div className="min-w-[80px]">
                          <p className="font-black font-display text-lg text-green-600 dark:text-green-500">${log.earnedRevenue?.toFixed(2) || '0.00'}</p>
                          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Total</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity ml-2 border-l border-zinc-200 dark:border-zinc-800 pl-4">
                          <button onClick={() => handleEdit(log)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500 hover:text-amber-500 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(log._id)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500 hover:text-racing-red transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
                {logs.length === 0 && (
                  <li className="p-10 text-center text-zinc-500 font-bold uppercase tracking-widest text-sm">No time logged yet.</li>
                )}
              </ul>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
