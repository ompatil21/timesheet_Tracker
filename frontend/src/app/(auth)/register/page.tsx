'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertCircle, CheckCircle2, Check } from 'lucide-react';
import api from '@/lib/axios';

const PROOF_ITEMS = ['No credit card', 'Cancel any time', 'Export your data'];

const TESTIMONIAL = {
  quote: "I was getting shortchanged $300 a month and didn't know it. TimeTracker showed me exactly where the gap was on my first payslip check.",
  author: 'Sarah K.',
  role: 'Senior UX designer, freelance',
};

const LOG_ENTRIES = [
  { client: 'Acme Corp',      task: 'UI redesign',    duration: '3h 20m', live: true  },
  { client: 'Studio Seven',   task: 'API integration', duration: '1h 45m', live: false },
  { client: 'Freelance Blog', task: 'Content review',  duration: '0h 55m', live: false },
];

export default function Register() {
  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState('');
  const [loading,         setLoading]         = useState(false);
  const { login } = useAuth();
  const router    = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      login(data.token, { _id: data._id, name: data.name, email: data.email });
      setSuccess('Account created! Taking you to your dashboard…');
      setTimeout(() => router.push('/dashboard'), 1400);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F2EB] flex overflow-hidden">

      {/* ── Left: form panel ── */}
      <div className="flex-1 flex flex-col">

        {/* Mobile header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E1E1E] lg:hidden">
          <Link href="/" className="font-display text-xl font-black uppercase italic tracking-tighter text-[#F5F2EB]">
            Time<span className="text-volt">Tracker</span>
          </Link>
          <Link href="/login" className="text-sm text-[#5A5A5A] hover:text-[#F5F2EB] transition-colors">
            Sign in
          </Link>
        </div>

        {/* Toast notifications */}
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#111111] border border-red-500/25 px-5 py-4 rounded-xl shadow-2xl flex items-start gap-3 pointer-events-auto"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-[#A0A0A0]">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#111111] border border-volt/25 px-5 py-4 rounded-xl shadow-2xl flex items-start gap-3 pointer-events-auto"
              >
                <CheckCircle2 className="w-4 h-4 text-volt shrink-0 mt-0.5" />
                <p className="text-sm text-[#A0A0A0]">{success}</p>
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
            className="w-full max-w-[420px] space-y-8"
          >
            {/* Heading */}
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-[#F5F2EB]">Create your account</h2>
              <p className="mt-1.5 text-sm text-[#5A5A5A]">Free forever. No credit card required.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-[#5A5A5A]">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  className="w-full bg-[#111111] border border-[#1E1E1E] rounded-lg px-4 py-3 text-sm text-[#F5F2EB] placeholder-[#3A3A3A] transition-colors duration-150 focus:outline-none focus:border-volt/50 focus:[box-shadow:0_0_0_3px_rgba(200,241,53,0.08)]"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#5A5A5A]">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    className="w-full bg-[#111111] border border-[#1E1E1E] rounded-lg px-4 py-3 text-sm text-[#F5F2EB] placeholder-[#3A3A3A] transition-colors duration-150 focus:outline-none focus:border-volt/50 focus:[box-shadow:0_0_0_3px_rgba(200,241,53,0.08)]"
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-[#5A5A5A]">
                    Confirm
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    className="w-full bg-[#111111] border border-[#1E1E1E] rounded-lg px-4 py-3 text-sm text-[#F5F2EB] placeholder-[#3A3A3A] transition-colors duration-150 focus:outline-none focus:border-volt/50 focus:[box-shadow:0_0_0_3px_rgba(200,241,53,0.08)]"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 font-bold rounded-lg bg-volt text-[#0A0A0A] hover:brightness-110 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
              >
                {loading ? 'Creating account…' : 'Start tracking free'}
                {!loading && (
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                )}
              </motion.button>
            </form>

            {/* Trust */}
            <div className="flex flex-wrap items-center gap-5">
              {PROOF_ITEMS.map(item => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-[#5A5A5A]">
                  <Check className="h-3.5 w-3.5 text-volt" />
                  {item}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-[#1E1E1E]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#3A3A3A]">have an account?</span>
              <div className="h-px flex-1 bg-[#1E1E1E]" />
            </div>

            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 font-bold text-sm rounded-lg border border-[#1E1E1E] text-[#F5F2EB] hover:border-[#2E2E2E] hover:bg-[#111111] transition-all duration-150"
            >
              Sign in instead
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Right: brand panel ── */}
      <div className="hidden lg:flex lg:w-[48%] flex-col justify-between p-12 border-l border-[#1E1E1E] bg-[#0D0D0D]">

        {/* Logo */}
        <Link href="/" className="font-display text-xl font-black uppercase italic tracking-tighter text-[#F5F2EB] w-fit self-end">
          Time<span className="text-volt">Tracker</span>
        </Link>

        {/* Centre content */}
        <div className="space-y-8 max-w-md ml-auto">

          {/* Testimonial */}
          <div className="rounded-xl border border-[#1E1E1E] bg-[#111111] p-6 space-y-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-3.5 w-3.5 fill-volt" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-[#A0A0A0]">
              &ldquo;{TESTIMONIAL.quote}&rdquo;
            </p>
            <div>
              <p className="text-sm font-bold text-[#F5F2EB]">{TESTIMONIAL.author}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#5A5A5A]">{TESTIMONIAL.role}</p>
            </div>
          </div>

          {/* Live log widget */}
          <div className="rounded-xl border border-[#1E1E1E] bg-[#111111] p-6">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#5A5A5A]">Active session</span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-volt">
                <span className="h-1.5 w-1.5 rounded-full bg-volt animate-pulse inline-block" />
                Tracking
              </span>
            </div>
            <div className="space-y-0.5">
              {LOG_ENTRIES.map((entry, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between py-3 ${i < LOG_ENTRIES.length - 1 ? 'border-b border-[#181818]' : ''}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-[#F5F2EB]">{entry.client}</p>
                    <p className="text-xs text-[#5A5A5A]">{entry.task}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-[#F5F2EB]">{entry.duration}</p>
                    {entry.live && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-volt">live</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-lg px-4 py-3.5 bg-[#0D0D0D] border border-[#1E1E1E]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A5A]">Est. this week</p>
                <p className="mt-0.5 text-xl font-black tabular-nums font-heading text-volt">$1,247.50</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A5A]">Logged</p>
                <p className="mt-0.5 text-xl font-black tabular-nums font-heading text-[#F5F2EB]">28.5h</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#3A3A3A] text-right">© 2026 TimeTracker — Your time, your terms.</p>
      </div>
    </div>
  );
}
