'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';
import { ScrapbookDefs, Scrap, Tape, Star, Arrow, Smiley, CheckBox } from '@/components/scrapbook';

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

const fieldClass =
  'w-full bg-transparent border-0 border-b-2 border-ink/40 px-1 py-2 font-note text-xl text-ink placeholder:text-ink-faint/70 focus:border-ink focus:shadow-none';
const labelClass = 'text-xs font-bold uppercase tracking-widest text-ink-soft';

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
    <div className="min-h-screen sb-page text-ink flex overflow-hidden">
      <ScrapbookDefs />

      {/* ── Left: form panel ── */}
      <div className="flex-1 flex flex-col">

        {/* Mobile header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-dashed border-ink/25 lg:hidden">
          <Link href="/" className="py-2 font-note text-2xl tracking-wide">Time Tracker</Link>
          <Link href="/login" className="sb-link py-2 font-note text-lg">Sign in</Link>
        </div>

        {/* Error / success notes */}
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none">
          <AnimatePresence>
            {error && (
              <motion.div
                key="error"
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
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -12, rotate: 3 }}
                animate={{ opacity: 1, y: 0, rotate: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-paper-white border-2 border-moss text-moss px-5 py-3 shadow-lg flex items-start gap-3 pointer-events-auto"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="font-note text-lg leading-snug">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Centered form */}
        <div className="flex-1 flex items-center justify-center px-6 py-14">
          <motion.div
            initial={{ opacity: 0, y: 16, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: -0.5 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[440px]"
          >
            <Smiley className="absolute -left-6 -top-8 z-10 h-16 w-16 -rotate-12 drop-shadow-sm" />
            <Tape className="-top-3 right-10 rotate-3" />
            <Scrap paper="white" edge="rough" className="px-8 sm:px-10 pt-12 pb-9">
              <h2 className="font-hand font-bold text-5xl leading-none">Create your account</h2>
              <p className="mt-2 font-note text-lg text-ink-soft">
                Already have one?{' '}
                <Link href="/login" className="sb-link text-ink hover:text-stamp hover:border-stamp transition-colors">Sign in</Link>
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <label htmlFor="name" className={labelClass}>Full name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    autoComplete="name"
                    className={fieldClass}
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>Email address</label>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="password" className={labelClass}>Password</label>
                    <input
                      id="password"
                      type="password"
                      required
                      autoComplete="new-password"
                      className={fieldClass}
                      placeholder="6+ characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className={labelClass}>Confirm</label>
                    <input
                      id="confirm-password"
                      type="password"
                      required
                      autoComplete="new-password"
                      className={fieldClass}
                      placeholder="Repeat it"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ rotate: 1, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group block w-full font-note text-xl uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Scrap paper="ink" edge="rough" className="flex items-center justify-center gap-3 px-6 py-3 text-paper">
                    {loading ? 'Creating account…' : 'Start tracking free'}
                    {!loading && (
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </Scrap>
                </motion.button>
              </form>

              {/* Trust */}
              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-1 font-note text-lg text-ink-soft">
                {PROOF_ITEMS.map(item => (
                  <li key={item} className="flex items-center gap-1.5">
                    <CheckBox checked className="h-5 w-5 shrink-0 overflow-visible" />
                    {item}
                  </li>
                ))}
              </ul>
            </Scrap>
          </motion.div>
        </div>
      </div>

      {/* ── Right: collage panel ── */}
      <div className="hidden lg:flex lg:w-[48%] flex-col justify-between p-12 border-l-2 border-dashed border-ink/25">

        <Link href="/" className="font-note text-2xl leading-[1.05] tracking-wide w-fit self-end text-right">
          Time<br /><span className="pr-3">Tracker</span>
        </Link>

        <div className="relative max-w-md mx-auto w-full">
          {/* Testimonial on graph paper */}
          <div className="relative rotate-2">
            <Tape className="-top-3 left-8 -rotate-6 !w-28" />
            <Star className="absolute -top-12 right-2 h-10 w-10 text-ink" />
            <div className="sb-grid px-7 pt-8 pb-6 shadow-lg">
              <p className="font-hand text-3xl leading-tight">
                &ldquo;{TESTIMONIAL.quote}&rdquo;
              </p>
              <p className="mt-4 font-note text-lg">{TESTIMONIAL.author}</p>
              <p className="font-note text-base text-ink-soft">{TESTIMONIAL.role}</p>
            </div>
          </div>

          <Arrow className="absolute -left-10 top-1/2 h-20 w-16 -scale-x-100 text-ink" />

          {/* Timesheet scrap */}
          <div className="relative -mt-3 ml-10 -rotate-2">
            <Tape className="-top-3 right-10 rotate-2 !w-28" />
            <Scrap paper="kraft" className="px-7 pt-9 pb-7">
              <div className="flex items-baseline justify-between">
                <span className="font-note text-xl">Today&apos;s log</span>
                <span className="sb-sketch font-note px-3">tracking</span>
              </div>
              <ul className="mt-3 text-sm">
                {LOG_ENTRIES.map(entry => (
                  <li key={entry.client} className="flex items-baseline justify-between gap-3 border-b border-dashed border-ink/30 py-2">
                    <span>
                      <span className="font-bold">{entry.client}</span>
                      <span className="block text-xs text-ink/70">{entry.task}</span>
                    </span>
                    <span className="text-right font-bold tabular-nums">
                      {entry.duration}
                      {entry.live && <span className="block font-note font-normal text-stamp">live</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="font-note text-base text-ink/70">est. this week</p>
                  <p className="font-hand text-4xl font-bold leading-none">$1,247.50</p>
                </div>
                <div className="text-right">
                  <p className="font-note text-base text-ink/70">logged</p>
                  <p className="font-hand text-4xl font-bold leading-none">28.5h</p>
                </div>
              </div>
            </Scrap>
          </div>
        </div>

        <p className="font-note text-lg text-ink-soft text-right">© 2026 Time Tracker. Your time, your terms.</p>
      </div>
    </div>
  );
}
