'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertCircle, Clock, BarChart3, Shield, Check } from 'lucide-react';
import api from '@/lib/axios';

const FEATURES = [
  { icon: Clock,     text: 'Log hours as you work — manual or live timer' },
  { icon: BarChart3, text: 'Weekly & monthly earnings breakdown per client' },
  { icon: Shield,    text: 'Payslip verification with a full evidence trail' },
];

const PROOF_ITEMS = ['No credit card', 'Cancel any time', 'Export your data'];

const STATS = [
  { value: '28.5h', label: 'Logged this week' },
  { value: '$1,247', label: 'Est. earnings' },
  { value: '3', label: 'Active clients' },
];

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }  = useAuth();
  const router     = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, { _id: data._id, name: data.name, email: data.email });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F2EB] flex overflow-hidden">

      {/* ── Left: brand panel ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 border-r border-[#1E1E1E] bg-[#0D0D0D]">

        {/* Logo */}
        <Link href="/" className="font-display text-xl font-black uppercase italic tracking-tighter text-[#F5F2EB] w-fit">
          Time<span className="text-volt">Tracker</span>
        </Link>

        {/* Centre content */}
        <div className="space-y-10 max-w-md">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#5A5A5A] border border-[#1E1E1E] px-3.5 py-1.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-volt animate-pulse inline-block" />
              For freelancers
            </div>

            <h1 className="font-heading text-[clamp(2.5rem,3.5vw,3.5rem)] font-bold leading-[0.93] tracking-tight">
              Your time,<br />
              <span className="text-volt">your invoice.</span>
            </h1>

            <p className="text-base leading-relaxed text-[#6B6B6B]">
              Stop guessing what you&apos;re owed. Log hours as you work, verify your payslip, and spot discrepancies before they cost you.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-volt/10 border border-volt/20 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-volt" />
                </div>
                <span className="text-sm text-[#A0A0A0]">{text}</span>
              </div>
            ))}
          </div>

          {/* Live snapshot widget */}
          <div className="rounded-xl border border-[#1E1E1E] bg-[#111111] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#5A5A5A]">Live snapshot</span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-volt">
                <span className="h-1.5 w-1.5 rounded-full bg-volt animate-pulse inline-block" />
                Tracking
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {STATS.map(stat => (
                <div key={stat.label}>
                  <p className="font-heading text-2xl font-black tabular-nums text-[#F5F2EB]">{stat.value}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[#5A5A5A]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-5">
            {PROOF_ITEMS.map(item => (
              <div key={item} className="flex items-center gap-1.5 text-xs text-[#5A5A5A]">
                <Check className="h-3.5 w-3.5 text-volt" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-[#3A3A3A]">© 2026 TimeTracker — Your time, your terms.</p>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex-1 flex flex-col">

        {/* Mobile header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E1E1E] lg:hidden">
          <Link href="/" className="font-display text-xl font-black uppercase italic tracking-tighter text-[#F5F2EB]">
            Time<span className="text-volt">Tracker</span>
          </Link>
          <Link href="/register" className="text-sm text-[#5A5A5A] hover:text-[#F5F2EB] transition-colors">
            Sign up
          </Link>
        </div>

        {/* Error toast */}
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#111111] border border-red-500/25 text-[#F5F2EB] px-5 py-4 rounded-xl shadow-2xl flex items-start gap-3 pointer-events-auto"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-[#A0A0A0]">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[400px] space-y-8"
          >
            {/* Heading */}
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-[#F5F2EB]">Welcome back</h2>
              <p className="mt-1.5 text-sm text-[#5A5A5A]">Sign in to your TimeTracker account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#5A5A5A]">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full bg-[#111111] border border-[#1E1E1E] rounded-lg px-4 py-3 text-sm text-[#F5F2EB] placeholder-[#3A3A3A] transition-colors duration-150 focus:outline-none focus:border-volt/50 focus:[box-shadow:0_0_0_3px_rgba(200,241,53,0.08)]"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#5A5A5A]">
                  Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#111111] border border-[#1E1E1E] rounded-lg px-4 py-3 text-sm text-[#F5F2EB] placeholder-[#3A3A3A] transition-colors duration-150 focus:outline-none focus:border-volt/50 focus:[box-shadow:0_0_0_3px_rgba(200,241,53,0.08)]"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 font-bold rounded-lg bg-volt text-[#0A0A0A] hover:brightness-110 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
              >
                {loading ? 'Signing in…' : 'Sign in'}
                {!loading && (
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-[#1E1E1E]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#3A3A3A]">new here?</span>
              <div className="h-px flex-1 bg-[#1E1E1E]" />
            </div>

            {/* Switch to register */}
            <Link
              href="/register"
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 font-bold text-sm rounded-lg border border-[#1E1E1E] text-[#F5F2EB] hover:border-[#2E2E2E] hover:bg-[#111111] transition-all duration-150"
            >
              Create a free account
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
