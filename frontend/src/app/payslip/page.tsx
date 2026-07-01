'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { AppPageLoader, FormPanelSkeleton, InlineLoader, ListSkeleton } from '@/components/LoadingStates';
import { UploadCloud, CheckCircle, AlertTriangle, FileText, Activity, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PayslipValidation() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payslips, setPayslips] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [file, setFile] = useState<File | null>(null);
  const [client, setClient] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [scanStep, setScanStep] = useState(0); // For animation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [diagnostics, setDiagnostics] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user, loading, router]);

  const fetchData = async (showSkeleton = true) => {
    if (showSkeleton) setIsDataLoading(true);
    try {
      const [psRes, clRes] = await Promise.all([
        api.get('/payslips'),
        api.get('/clients')
      ]);
      setPayslips(psRes.data);
      setClients(clRes.data);
      if (clRes.data.length > 0) setClient(clRes.data[0]._id);
      
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      // Fix timezone offset for Australia
      const getLocalISODate = (date: Date) => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
      };
      
      setStartDate(getLocalISODate(lastWeek));
      setEndDate(getLocalISODate(today));
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF payslip.');
      return;
    }
    if (!client || !startDate || !endDate) {
      setError('Please select an employer and date range.');
      return;
    }

    setUploading(true);
    setScanStep(1);
    setError('');
    setSuccessMsg('');
    setDiagnostics(null);

    const formData = new FormData();
    formData.append('payslip', file);
    formData.append('client', client);
    formData.append('periodStart', startDate);
    formData.append('periodEnd', endDate);

    try {
      // Simulate scanning steps for visual effect
      setTimeout(() => setScanStep(2), 800);
      setTimeout(() => setScanStep(3), 1600);
      
      const res = await api.post('/payslips', formData);
      
      setTimeout(() => {
        setUploading(false);
        setDiagnostics(res.data);
        const hasAllowances = res.data.extractedAllowances > 0;
        const comparedGross = hasAllowances ? res.data.timeBasedGross : res.data.extractedGross;
        if (res.data.match) {
          setSuccessMsg(
            hasAllowances
              ? `Perfect Match! Time-based pay $${comparedGross.toFixed(2)} + allowances $${res.data.extractedAllowances.toFixed(2)} = gross $${res.data.extractedGross.toFixed(2)}`
              : `Perfect Match! Expected $${res.data.expectedPay.toFixed(2)}, Found $${res.data.extractedGross.toFixed(2)}`
          );
        } else {
          setError(
            hasAllowances
              ? `Discrepancy Found! Expected $${res.data.expectedPay.toFixed(2)}, Time-based pay $${comparedGross.toFixed(2)}. Difference: $${res.data.difference.toFixed(2)} (excludes $${res.data.extractedAllowances.toFixed(2)} in allowances)`
              : `Discrepancy Found! Expected $${res.data.expectedPay.toFixed(2)}, Found $${res.data.extractedGross.toFixed(2)}. Difference: $${res.data.difference.toFixed(2)}`
          );
        }
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchData(false);
      }, 2400);
      
    } catch (err: any) {
      setUploading(false);
      setScanStep(0);
      setError(err.response?.data?.message || 'Analysis failed. Please check the file and try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this scan history?')) {
      setDeletingId(id);
      try {
        await api.delete(`/payslips/${id}`);
        await fetchData(false);
      } catch (err) {
        console.error('Failed to delete payslip');
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading || !user) return <AppPageLoader label="Loading payslips" />;

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
            Payslip <span className="text-racing-red">Engine</span>
          </h2>
          <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold mt-2">AI-Powered extraction and discrepancy detection</p>
        </motion.div>

        {isDataLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <FormPanelSkeleton />
            </div>
            <div className="lg:col-span-2">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Historical Scans</h3>
              <ListSkeleton rows={4} />
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className={`bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-lg border overflow-hidden backdrop-blur-sm transition-all duration-500 ${uploading ? 'border-racing-red shadow-[0_0_30px_rgba(220,38,38,0.2)]' : 'border-zinc-200 dark:border-zinc-800'}`}>
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center">
                  <Activity className={`w-4 h-4 mr-2 ${uploading ? 'text-racing-red animate-pulse' : 'text-zinc-400'}`} />
                  {uploading ? 'Analysis in Progress...' : 'Configure Scan'}
                </h3>
              </div>
              
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {error && !uploading && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 rounded bg-red-100 dark:bg-red-950/50 border border-racing-red p-4 text-xs font-bold uppercase tracking-widest text-red-700 dark:text-red-400">
                      <AlertTriangle className="w-4 h-4 mb-2" />
                      {error}
                    </motion.div>
                  )}
                  {successMsg && !uploading && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 rounded bg-green-50 dark:bg-green-950/30 border border-green-500 dark:border-green-900 p-4 text-xs font-bold uppercase tracking-widest text-green-700 dark:text-green-400">
                      <CheckCircle className="w-4 h-4 mb-2" />
                      {successMsg}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Target Employer</label>
                    <select
                      required disabled={uploading}
                      className="block w-full border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-white focus:border-racing-red transition-all shadow-sm disabled:opacity-50"
                      value={client} onChange={(e) => setClient(e.target.value)}
                    >
                      {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Start Date</label>
                      <input
                        type="date" required disabled={uploading}
                        className="block w-full border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-white focus:border-racing-red transition-all shadow-sm disabled:opacity-50"
                        value={startDate} onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">End Date</label>
                      <input
                        type="date" required disabled={uploading}
                        className="block w-full border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-white focus:border-racing-red transition-all shadow-sm disabled:opacity-50"
                        value={endDate} onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Hidden file input — triggered by the label below */}
                  <input
                    id="payslip-file-input"
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    disabled={uploading}
                    className="sr-only"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  />

                  <label
                    htmlFor="payslip-file-input"
                    className={`mt-6 flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 text-center transition-all relative overflow-hidden select-none
                      ${uploading
                        ? 'border-racing-red bg-red-50/10 dark:bg-red-900/10 cursor-wait'
                        : file
                          ? 'border-green-500 bg-green-50/10 dark:bg-green-900/10 cursor-pointer hover:border-green-400'
                          : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/50 cursor-pointer hover:border-racing-red hover:bg-zinc-100 dark:hover:bg-zinc-900/80'
                      }`}
                  >
                    {uploading && (
                      <motion.div
                        initial={{ top: '-10%' }}
                        animate={{ top: '110%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        className="absolute left-0 right-0 h-1 bg-racing-red shadow-[0_0_15px_rgba(220,38,38,0.8)]"
                      />
                    )}

                    {file && !uploading ? (
                      <FileText className="w-10 h-10 text-green-500" />
                    ) : (
                      <UploadCloud className={`w-10 h-10 transition-colors ${uploading ? 'text-racing-red animate-pulse' : 'text-zinc-400'}`} />
                    )}

                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-300">
                        {uploading ? 'Extracting text…' : file ? file.name : 'Click anywhere to upload PDF'}
                      </p>
                      {!uploading && !file && (
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">PDF only · Max 5 MB</p>
                      )}
                      {file && !uploading && (
                        <p className="text-[10px] text-green-500 uppercase tracking-widest mt-1 font-bold">
                          {(file.size / 1024).toFixed(0)} KB · Click to change
                        </p>
                      )}
                    </div>
                  </label>

                  {uploading && (
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className={scanStep >= 1 ? 'text-racing-red' : 'text-zinc-500'}>1. Validation</span>
                        <span className={scanStep >= 2 ? 'text-racing-red' : 'text-zinc-500'}>2. OCR Scan</span>
                        <span className={scanStep >= 3 ? 'text-racing-red' : 'text-zinc-500'}>3. Calculation</span>
                      </div>
                      <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-racing-red"
                          initial={{ width: '0%' }}
                          animate={{ width: scanStep === 1 ? '33%' : scanStep === 2 ? '66%' : '100%' }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: uploading ? 1 : 1.02 }}
                    whileTap={{ scale: uploading ? 1 : 0.98 }}
                    type="submit"
                    disabled={!file || uploading}
                    className="clip-slant-btn mt-4 w-full py-4 bg-racing-red text-xs font-bold tracking-widest uppercase text-white hover:bg-red-700 hover:shadow-neon-red disabled:opacity-50 disabled:hover:shadow-none transition-all shadow-md"
                  >
                    {uploading ? 'Processing Data...' : 'Run Diagnostics Engine'}
                  </motion.button>
                </form>
              </div>
            </div>
            
            {diagnostics && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 p-6 text-white font-mono text-xs overflow-hidden"
              >
                <div className="flex items-center mb-4 text-zinc-400">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  SYSTEM_LOG_OUTPUT
                </div>
                <div className="space-y-2 opacity-80">
                  <p>{'>'} MATCH_STATUS: {diagnostics.match ? 'SUCCESS' : 'FAILED'}</p>
                  <p>{'>'} TOLERANCE_RULE: +/- 0.05 ACTV</p>
                  <p>{'>'} APP_EXPECTED (TIME-BASED): ${diagnostics.expectedPay.toFixed(2)}</p>
                  <p>{'>'} PDF_GROSS_TOTAL: ${diagnostics.extractedGross.toFixed(2)}</p>
                  {diagnostics.extractedAllowances > 0 && (
                    <>
                      <p className="text-yellow-400">{'>'} PDF_ALLOWANCES_DETECTED: ${diagnostics.extractedAllowances.toFixed(2)}</p>
                      <p className="text-yellow-400">{'>'} PDF_TIME_BASED_GROSS: ${diagnostics.timeBasedGross.toFixed(2)}</p>
                    </>
                  )}
                  {diagnostics.extractedNett != null && <p>{'>'} PDF_NET: ${diagnostics.extractedNett.toFixed(2)}</p>}
                  {diagnostics.extractedTax != null && <p>{'>'} PDF_TAX: ${diagnostics.extractedTax.toFixed(2)}</p>}
                  <p>{'>'} DELTA: ${diagnostics.difference.toFixed(2)}</p>
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Historical Scans</h3>
            <div className="space-y-4">
              <AnimatePresence>
                {payslips.map((ps, i) => {
                  const isMatch = ps.status === 'match';
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={ps._id} 
                      className={`bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-lg border-l-4 ${isMatch ? 'border-green-500' : 'border-racing-red'} p-6 relative overflow-hidden backdrop-blur-sm group`}
                    >
                      <div className={`absolute top-0 right-0 w-40 h-40 opacity-[0.03] dark:opacity-10 blur-[60px] ${isMatch ? 'bg-green-500' : 'bg-racing-red'}`}></div>
                      
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                            {ps.client?.name || 'Unknown Employer'} | {new Date(ps.periodStart).toLocaleDateString()} - {new Date(ps.periodEnd).toLocaleDateString()}
                          </p>
                          <h4 className="font-black text-zinc-900 dark:text-white font-display text-xl tracking-wide">
                            Gross: ${ps.paidAmount?.toFixed(2) || '0.00'}
                          </h4>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {!isMatch ? (
                            <div className="flex items-center text-racing-red bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest shadow-sm">
                              <AlertTriangle className="w-4 h-4 mr-2" /> Discrepancy
                            </div>
                          ) : (
                            <div className="flex items-center text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest shadow-sm">
                              <CheckCircle className="w-4 h-4 mr-2" /> Match Confirmed
                            </div>
                          )}
                          <button disabled={deletingId === ps._id} onClick={() => handleDelete(ps._id)} className="p-1.5 opacity-0 group-hover:opacity-100 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-400 hover:text-racing-red transition-all disabled:cursor-wait disabled:opacity-60">
                            {deletingId === ps._id ? <InlineLoader label="" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 relative z-10 shadow-inner">
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Tracked Hours</p>
                          <p className="text-3xl font-black font-display text-zinc-900 dark:text-white">{ps.paidHours}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Scanner Status</p>
                          <p className={`text-xl font-black font-display mt-2 ${isMatch ? 'text-green-600 dark:text-green-500' : 'text-racing-red'}`}>
                            {isMatch ? 'VERIFIED' : 'FAILED'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {payslips.length === 0 && (
                <div className="bg-white/50 dark:bg-zinc-900/50 p-10 text-center text-zinc-500 font-bold uppercase tracking-widest text-sm rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                  No payslips analyzed yet.
                </div>
              )}
            </div>
          </motion.div>
        </div>
        )}
      </main>
    </div>
  );
}
