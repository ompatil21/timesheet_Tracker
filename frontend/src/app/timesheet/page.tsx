'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, X, AlertTriangle } from 'lucide-react';

export default function Timesheet() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [client, setClient] = useState('');
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [isPublicHoliday, setIsPublicHoliday] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    fetchData();
  }, [user, loading, router]);

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
    if (!client || !date || !hours) {
      setError('Missing timesheet data');
      return;
    }
    
    try {
      const payload = {
        client,
        date,
        hours: parseFloat(hours),
        notes,
        isPublicHoliday
      };

      if (editingId) {
        await api.put(`/timelogs/${editingId}`, payload);
      } else {
        await api.post('/timelogs', payload);
      }

      setHours('');
      setNotes('');
      setIsPublicHoliday(false);
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
    setNotes(log.notes || '');
    setIsPublicHoliday(log.isPublicHoliday || false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this timesheet?')) {
      try {
        await api.delete(`/timelogs/${id}`);
        if (editingId === id) {
          setEditingId(null);
          setHours('');
          setNotes('');
          setIsPublicHoliday(false);
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
                    setIsPublicHoliday(false);
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
                <form onSubmit={handleAddOrUpdate} className="space-y-5">
                  {!client && editingId && (
                     <div className="flex items-center text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 p-3 border border-amber-200 dark:border-amber-900 rounded shadow-sm mb-4">
                       <AlertTriangle className="w-4 h-4 mr-2" /> Original employer was deleted. Please select a new one.
                     </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Employer</label>
                    <select
                      required
                      className="block w-full border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-white focus:border-racing-red transition-all shadow-sm"
                      value={client} onChange={(e) => setClient(e.target.value)}
                    >
                      <option value="" disabled>Select Employer</option>
                      {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Date</label>
                    <input
                      type="date" required
                      className="block w-full border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-white focus:border-racing-red transition-all shadow-sm"
                      value={date} onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Hours Worked</label>
                    <input
                      type="number" step="0.01" min="0" required
                      className="block w-full border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-white focus:border-racing-red transition-all font-display font-bold shadow-sm"
                      placeholder="e.g. 8.25"
                      value={hours} onChange={(e) => setHours(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center mt-4 p-3 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-950/50">
                    <input
                      id="holiday-checkbox"
                      type="checkbox"
                      className="w-4 h-4 text-racing-red bg-white border-zinc-300 rounded focus:ring-racing-red dark:focus:ring-racing-red dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600"
                      checked={isPublicHoliday}
                      onChange={(e) => setIsPublicHoliday(e.target.checked)}
                    />
                    <label htmlFor="holiday-checkbox" className="ml-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest cursor-pointer">
                      Is Public Holiday
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 mt-4">Notes</label>
                    <textarea
                      className="block w-full border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-white focus:border-racing-red transition-all shadow-sm"
                      rows={2}
                      value={notes} onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className={`clip-slant-btn w-full mt-4 px-4 py-4 text-sm font-bold tracking-widest uppercase text-white transition-all shadow-md ${editingId ? 'bg-amber-500 hover:bg-amber-600 hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-racing-red hover:bg-red-700 hover:shadow-neon-red'}`}
                  >
                    {editingId ? 'Update Entry' : 'Submit Entry'}
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
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-sm">{log.client?.name || 'Unknown Client'}</p>
                          {log.isPublicHoliday && <span className="text-[9px] font-black uppercase tracking-widest bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">Holiday</span>}
                        </div>
                        <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase mt-1">{new Date(log.date).toLocaleDateString()} {log.notes && `| ${log.notes}`}</p>
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
