'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, { _id: data._id, name: data.name, email: data.email });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(135deg,#020202_0%,#101014_52%,#020202_100%)] pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20 pointer-events-none" />

      {/* Toast Notification */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-red-500/10 border border-red-500/30 backdrop-blur-xl text-red-200 px-6 py-4 rounded-2xl shadow-2xl flex items-start gap-4 pointer-events-auto"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-red-400 mb-1">Authentication Error</h4>
                <p className="text-xs text-red-200/80">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10 w-full max-w-7xl p-8 lg:p-16 flex flex-col lg:flex-row items-center justify-between pointer-events-none min-h-screen">
        
        {/* Left Side: Headline overlaying the 3D shape */}
        <div className="w-full lg:w-1/2 mb-12 lg:mb-0 pointer-events-auto pt-20 lg:pt-0">
          <motion.div initial={false} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: 'easeOut' }}>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/50 mb-6 flex items-center gap-4">
              <span className="w-12 h-[1px] bg-white/50"></span>
              EDITION '26
            </p>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mix-blend-difference mb-8">
              NEXT GEN<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-pink-500 italic">TRACKING.</span>
            </h1>
            <p className="text-lg text-white/40 max-w-md font-light leading-relaxed mix-blend-difference">
              High-precision time tracking and dynamic revenue analysis. Engineered for perfection.
            </p>
          </motion.div>
        </div>

        {/* Right Side: The Form Card */}
        <motion.div 
          initial={false} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          className="w-full lg:w-[450px] bg-white/[0.02] backdrop-blur-[40px] border border-white/10 p-10 lg:p-12 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] pointer-events-auto relative overflow-hidden"
        >
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-tight mb-2">Access Portal</h2>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-10">Sign in to your workspace</p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2 group">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 group-focus-within:text-blue-400 transition-colors">Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="w-full bg-transparent border-b border-white/10 pb-4 text-xl text-white placeholder-white/20 focus:outline-none focus:border-blue-400 transition-colors rounded-none"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 group-focus-within:text-pink-500 transition-colors">Password</label>
                <input 
                  type="password" 
                  required 
                  className="w-full bg-transparent border-b border-white/10 pb-4 text-xl text-white placeholder-white/20 focus:outline-none focus:border-pink-500 transition-colors rounded-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="w-full relative group overflow-hidden rounded-full bg-white text-black py-4 px-8 flex items-center justify-between mt-12 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                <span className="font-bold uppercase tracking-widest text-sm relative z-10">Initialize</span>
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center group-hover:bg-blue-500 transition-colors relative z-10">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-xs text-white/40 uppercase tracking-widest">
                No account? <Link href="/register" className="text-white hover:text-blue-400 transition-colors border-b border-white/20 hover:border-blue-400 pb-1">Register</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
