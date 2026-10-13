'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { ScrapbookDefs, Scrap, Tape, Scribble, Star, Heart, Smiley, CheckBox, Flower } from '@/components/scrapbook';

const FEATURES = [
  'Log hours as you work',
  'See weekly and monthly earnings',
  'Check every payslip against your hours',
];

const STATS = [
  { value: '28.5h', label: 'logged this week' },
  { value: '$1,247', label: 'est. earnings' },
  { value: '3', label: 'active clients' },
];

const fieldClass =
  'w-full bg-transparent border-0 border-b-2 border-ink/40 px-1 py-2 font-note text-xl text-ink placeholder:text-ink-faint/70 focus:border-ink focus:shadow-none';

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
    <div className="min-h-screen sb-page text-ink flex overflow-hidden">
      <ScrapbookDefs />

      {/* ── Left: collage panel ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 border-r-2 border-dashed border-ink/25">

        <Link href="/" className="font-note text-2xl leading-[1.05] tracking-wide w-fit">
          Time<br /><span className="pl-3">Tracker</span>
        </Link>

        <div className="relative max-w-lg mx-auto w-full">
          <Flower className="absolute -left-16 top-6 h-64 text-ink" />

          {/* Kraft headline */}
          <div className="relative -rotate-2 ml-10">
            <Tape className="-top-3 left-1/3 -rotate-2 !w-36" />
            <Scrap paper="kraft" className="px-9 pt-12 pb-10">
              <h1 className="font-hand font-bold text-6xl leading-[0.95]">
                Your time,<br />your invoice.
              </h1>
              <Scribble className="mt-2 h-4 w-56 text-ink" />
              <p className="mt-6 text-sm leading-relaxed text-ink/80 max-w-xs">
                Stop guessing what you&apos;re owed. Log hours as you work, verify your payslip, and spot discrepancies before they cost you.
              </p>
            </Scrap>
          </div>

          {/* Lined checklist */}
          <div className="relative -mt-6 ml-auto w-72 rotate-3">
            <Star className="absolute -top-12 -right-4 h-10 w-10 text-ink" />
            <div className="sb-lined px-6 pt-4 pb-5 shadow-lg font-note text-xl">
              <p className="sb-link inline-block tracking-widest">WHAT YOU GET:</p>
              <ul>
                {FEATURES.map(text => (
                  <li key={text} className="flex items-start gap-2">
                    <CheckBox checked className="mt-1 h-6 w-6 shrink-0 overflow-visible" />
                    {text}
                  </li>
                ))}
              </ul>
              <Heart className="ml-auto h-7 w-7" />
            </div>
          </div>

          {/* Graph-paper snapshot */}
          <div className="sb-grid relative -mt-4 ml-4 w-fit -rotate-2 px-6 py-4 shadow-md">
            <div className="flex gap-7">
              {STATS.map(stat => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                  <p className="font-note text-base text-ink-soft">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="font-note text-lg text-ink-soft">© 2026 Time Tracker. Your time, your terms.</p>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex-1 flex flex-col">

        {/* Mobile header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-dashed border-ink/25 lg:hidden">
          <Link href="/" className="py-2 font-note text-2xl tracking-wide">Time Tracker</Link>
          <Link href="/register" className="sb-link py-2 font-note text-lg">Sign up</Link>
        </div>

        {/* Error note */}
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -12, rotate: -3 }}
                animate={{ opacity: 1, y: 0, rotate: -1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-paper-white border-2 border-stamp text-stamp px-5 py-3 shadow-lg flex items-start gap-3 pointer-events-auto"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="font-note text-lg leading-snug">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: 0.5 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[420px]"
          >
            <Smiley className="absolute -right-6 -top-8 z-10 h-16 w-16 rotate-12 drop-shadow-sm" />
            <Tape className="-top-3 left-10 -rotate-3" />
            <Scrap paper="white" edge="rough" className="px-8 sm:px-10 pt-12 pb-10">
              <h2 className="font-hand font-bold text-5xl leading-none">Welcome back</h2>
              <p className="mt-2 font-note text-lg text-ink-soft">Sign in to your Time Tracker account</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-ink-soft">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className={fieldClass}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-ink-soft">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className={fieldClass}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ rotate: -1, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group block w-full font-note text-xl uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Scrap paper="ink" edge="rough" className="flex items-center justify-center gap-3 px-6 py-3 text-paper">
                    {loading ? 'Signing in…' : 'Sign in'}
                    {!loading && (
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </Scrap>
                </motion.button>
              </form>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex-1 border-t-2 border-dashed border-ink/25" />
                <span className="font-note text-lg text-ink-soft">new here?</span>
                <div className="flex-1 border-t-2 border-dashed border-ink/25" />
              </div>

              <Link
                href="/register"
                className="sb-sketch mt-6 block w-full px-6 py-2.5 text-center font-note text-xl hover:bg-tape/60 transition-colors"
              >
                Create a free account
              </Link>
            </Scrap>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
