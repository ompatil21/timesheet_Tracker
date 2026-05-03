'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { Pencil, Trash2, X } from 'lucide-react';

interface Client {
  _id: string;
  name: string;
  ordinaryRate: number;
  casualLoading: number;
  saturdayRate: number;
  sundayRate: number;
  holidayRate: number;
}

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', ordinaryRate: '', casualLoading: '25', saturdayRate: '', sundayRate: '', holidayRate: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    fetchClients();
  }, [user, loading, router]);

  const fetchClients = async () => {
    try {
      const { data } = await api.get('/clients');
      setClients(data);
    } catch (err) {
      console.error('Failed to fetch clients');
    }
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/clients/${editingId}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      setFormData({ name: '', ordinaryRate: '', casualLoading: '25', saturdayRate: '', sundayRate: '', holidayRate: '' });
      setEditingId(null);
      setError('');
      fetchClients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed operation');
    }
  };

  const handleEdit = (c: Client) => {
    setEditingId(c._id);
    setFormData({
      name: c.name,
      ordinaryRate: c.ordinaryRate?.toString() || '',
      casualLoading: c.casualLoading?.toString() || '0',
      saturdayRate: c.saturdayRate?.toString() || '',
      sundayRate: c.sundayRate?.toString() || '',
      holidayRate: c.holidayRate?.toString() || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this employer? This will not affect existing historical timesheets.')) {
      try {
        await api.delete(`/clients/${id}`);
        if (editingId === id) {
          setEditingId(null);
          setFormData({ name: '', ordinaryRate: '', casualLoading: '25', saturdayRate: '', sundayRate: '', holidayRate: '' });
        }
        fetchClients();
      } catch (err) {
        console.error('Failed to delete');
      }
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-carbon md:pl-64 pb-20 md:pb-0 text-zinc-900 dark:text-white transition-colors">
      <Sidebar />
      <main className="p-6 md:p-10 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6"
        >
          <h2 className="text-4xl font-black font-display uppercase tracking-tight italic">
            Employers <span className="text-racing-red">&</span> Rates
          </h2>
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold mt-2">Manage your multi-tiered pay structures</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-12 backdrop-blur-sm transition-colors"
        >
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex justify-between items-center transition-colors">
            <h3 className={`text-sm font-bold uppercase tracking-widest ${editingId ? 'text-amber-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
              {editingId ? 'Edit Employer Rates' : 'Register New Employer'}
            </h3>
            {editingId && (
              <button 
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: '', ordinaryRate: '', casualLoading: '25', saturdayRate: '', sundayRate: '', holidayRate: '' });
                }}
                className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white uppercase tracking-widest flex items-center"
              >
                <X className="w-4 h-4 mr-1" /> Cancel Edit
              </button>
            )}
          </div>
          <div className="p-6">
            {error && <div className="mb-6 rounded bg-red-100 dark:bg-red-950/50 border border-racing-red p-4 text-sm text-red-700 dark:text-red-200 font-medium">{error}</div>}
            
            <form onSubmit={handleAddOrUpdate} className="flex flex-col gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Employer Name</label>
                <input
                  type="text" required
                  className="block w-full border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-700 focus:border-racing-red transition-all shadow-sm"
                  placeholder="e.g. Victorian Convention"
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Ordinary Rate ($)</label>
                  <input
                    type="number" step="0.01" required
                    className="block w-full border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-700 focus:border-racing-red transition-all font-display font-bold shadow-sm"
                    placeholder="25.89"
                    value={formData.ordinaryRate} onChange={(e) => setFormData({...formData, ordinaryRate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Casual Load (%)</label>
                  <input
                    type="number" step="1"
                    className="block w-full border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-700 focus:border-racing-red transition-all font-display font-bold shadow-sm"
                    placeholder="25"
                    value={formData.casualLoading} onChange={(e) => setFormData({...formData, casualLoading: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Saturday ($)</label>
                  <input
                    type="number" step="0.01"
                    className="block w-full border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-700 focus:border-racing-red transition-all font-display font-bold shadow-sm"
                    placeholder="Optional"
                    value={formData.saturdayRate} onChange={(e) => setFormData({...formData, saturdayRate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Sunday ($)</label>
                  <input
                    type="number" step="0.01"
                    className="block w-full border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-700 focus:border-racing-red transition-all font-display font-bold shadow-sm"
                    placeholder="Optional"
                    value={formData.sundayRate} onChange={(e) => setFormData({...formData, sundayRate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Holiday ($)</label>
                  <input
                    type="number" step="0.01"
                    className="block w-full border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-700 focus:border-racing-red transition-all font-display font-bold shadow-sm"
                    placeholder="Optional"
                    value={formData.holidayRate} onChange={(e) => setFormData({...formData, holidayRate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`clip-slant-btn px-10 py-4 text-sm font-bold tracking-widest uppercase text-white transition-all shadow-md ${editingId ? 'bg-amber-500 hover:bg-amber-600 hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-racing-red hover:bg-red-700 hover:shadow-neon-red'}`}
                >
                  {editingId ? 'Update Employer' : 'Register Employer'}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Active Employers</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clients.map(client => {
            const effectiveBase = client.ordinaryRate + (client.ordinaryRate * ((client.casualLoading || 0) / 100));
            return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={client._id} 
              className={`bg-white/80 dark:bg-zinc-900/80 p-6 rounded-xl shadow-sm border flex flex-col justify-between group transition-colors backdrop-blur-sm ${editingId === client._id ? 'border-amber-500' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-black text-xl text-zinc-900 dark:text-white uppercase tracking-wider">{client.name}</h4>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(client)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500 hover:text-amber-500 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(client._id)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500 hover:text-racing-red transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded border border-zinc-200 dark:border-zinc-800 text-center">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Base</p>
                  <p className="text-sm font-display font-black text-zinc-900 dark:text-white">${effectiveBase.toFixed(2)}</p>
                  <p className="text-[8px] text-zinc-400 uppercase tracking-widest mt-1">INC LOAD</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded border border-zinc-200 dark:border-zinc-800 text-center">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Sat</p>
                  <p className="text-sm font-display font-black text-zinc-900 dark:text-white">${client.saturdayRate}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded border border-zinc-200 dark:border-zinc-800 text-center">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Sun</p>
                  <p className="text-sm font-display font-black text-zinc-900 dark:text-white">${client.sundayRate}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950 p-2 rounded border border-zinc-200 dark:border-zinc-800 text-center">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Hol</p>
                  <p className="text-sm font-display font-black text-zinc-900 dark:text-white">${client.holidayRate}</p>
                </div>
              </div>
            </motion.div>
          )})}
          {clients.length === 0 && <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm col-span-full py-12 text-center border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl">No active employers</p>}
        </div>
      </main>
    </div>
  );
}
