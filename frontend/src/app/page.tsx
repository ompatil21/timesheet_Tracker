'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import {
  ScrapbookDefs, Scrap, Tape, Flower, Star, Scribble, Arrow, Splat, Heart, Smiley, CheckBox, Rule,
} from '@/components/scrapbook';

function useClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toTimeString().slice(0, 8));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const MARQUEE_ITEMS = [
  'Time logging', 'Payslip verification', 'Client tracking',
  'Break time', 'Weekly reports', 'Invoice generation',
  'Hourly rates', 'Dispute evidence', 'Earnings forecast',
  'Start and finish times', 'Export to CSV', 'Multiple clients',
];

const LOG_ENTRIES = [
  { client: 'Acme Corp', task: 'UI redesign', duration: '3h 20m', live: true },
  { client: 'Studio Seven', task: 'API integration', duration: '1h 45m', live: false },
  { client: 'Freelance Blog', task: 'Content review', duration: '0h 55m', live: false },
];

const TODO = [
  { text: 'Log Monday’s shift', done: true },
  { text: 'Upload payslip', done: true },
  { text: 'Check the hours', done: true },
  { text: 'Ask about the $42', done: false },
];

const FORECAST_BARS = [
  { h: 55, filled: true },
  { h: 70, filled: true },
  { h: 78, filled: true },
  { h: 82, filled: true },
  { h: 68, filled: true },
  { h: 88, filled: false },
  { h: 94, filled: false },
];

const STEPS = [
  {
    n: '1',
    title: 'Log your hours',
    body: 'Start a timer or log manually. Add the client, task, and rate. Takes under 10 seconds.',
    rotate: '-rotate-2',
    paper: 'white',
  },
  {
    n: '2',
    title: 'Verify your payslip',
    body: 'Upload your payslip and compare it against your tracked hours. Discrepancies surface automatically.',
    rotate: 'rotate-1',
    paper: 'kraft',
  },
  {
    n: '3',
    title: "Know what you're owed",
    body: 'See a running total of earnings, export reports, and go into every payment conversation with facts.',
    rotate: '-rotate-1',
    paper: 'white',
  },
] as const;

const ease = [0.16, 1, 0.3, 1] as const;

export default function Home() {
  const time = useClock();

  return (
    <main className="sb-page min-h-screen overflow-x-hidden font-type text-ink selection:bg-blush selection:text-ink">
      <ScrapbookDefs />

      {/* ── Header ── */}
      <header className="mx-auto max-w-6xl px-6 pt-6">
        <div className="flex items-center justify-between pb-4">
          <a href="/" className="font-note text-2xl leading-[1.05] tracking-wide">
            Time<br /><span className="pl-3">Tracker</span>
          </a>
          <nav className="flex items-center gap-6 font-note text-lg">
            <a href="/login" className="px-2 py-3 hover:text-stamp transition-colors duration-200">
              Log in
            </a>
            <a href="/register" className="group">
              <Scrap paper="ink" edge="rough" className="flex items-center gap-2 px-5 py-2 text-paper tracking-wider uppercase text-base">
                Start free <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Scrap>
            </a>
          </nav>
        </div>
        <Rule className="h-2 w-full text-ink" />
      </header>

      {/* ── Hero collage ── */}
      <section className="relative mx-auto max-w-6xl px-6 pt-14 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-12 items-center">

          <Flower className="hidden lg:block lg:col-span-1 h-72 text-ink justify-self-center" />

          {/* Kraft scrap — headline */}
          <motion.div
            initial={{ opacity: 0, y: 24, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={{ duration: 0.7, ease }}
            className="relative sm:col-span-2 lg:col-span-5"
          >
            <Tape className="-top-3 left-1/4 -rotate-2 !w-40" />
            <Scrap paper="kraft" className="px-8 sm:px-10 pt-14 pb-12">
              <h1 className="font-hand font-bold text-[clamp(3.25rem,7vw,4.75rem)] leading-[0.95]">
                Your time,<br />your invoice.
              </h1>
              <Scribble className="mt-2 h-4 w-64 max-w-full text-ink" />

              <p className="mt-7 max-w-sm text-[15px] leading-relaxed text-ink/80">
                Stop guessing what you&apos;re owed. Log hours as you work,
                verify your payslip against what you actually tracked,
                and spot discrepancies before they cost you.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-6 font-note text-lg uppercase tracking-wider">
                <motion.a whileHover={{ rotate: -1.5, scale: 1.03 }} whileTap={{ scale: 0.97 }} href="/register" className="group">
                  <Scrap paper="ink" edge="rough" className="flex items-center gap-3 px-6 py-2.5 text-paper">
                    Start tracking
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Scrap>
                </motion.a>
                <a href="/login" className="sb-link py-2 hover:text-stamp hover:border-stamp transition-colors duration-200">
                  Sign in
                </a>
              </div>
            </Scrap>
          </motion.div>

          {/* Polaroid — live clock */}
          <motion.div
            initial={{ opacity: 0, y: 24, rotate: 6 }}
            animate={{ opacity: 1, y: 0, rotate: 2 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="relative lg:col-span-3 justify-self-center w-full max-w-[17rem]"
          >
            <Smiley className="absolute -left-9 -top-8 z-10 h-20 w-20 -rotate-12 drop-shadow-sm" />
            <Tape className="-top-4 left-1/2 -translate-x-1/3 rotate-3" />
            <div className="sb-polaroid">
              <div className="bg-[#2B2823] px-4 py-9 text-center text-paper">
                <p className="text-[11px] uppercase tracking-[0.2em] text-paper/50">Time today</p>
                <p className="mt-3 text-[2.1rem] font-bold leading-none tabular-nums">
                  {time || '00:00:00'}
                </p>
                <p className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-tape">
                  <span className="h-1.5 w-1.5 rounded-full bg-tape animate-pulse" />
                  Tracking
                </p>
              </div>
              <p className="pt-2 pb-1 text-center font-hand text-2xl">today&apos;s shift</p>
            </div>
            <Arrow className="hidden lg:block absolute -bottom-14 right-0 h-20 w-16 text-ink" />
          </motion.div>

          {/* Lined note — checklist */}
          <motion.div
            initial={{ opacity: 0, y: 24, rotate: 8 }}
            animate={{ opacity: 1, y: 0, rotate: 4 }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
            className="relative lg:col-span-3 justify-self-center w-full max-w-[15rem]"
          >
            <Star className="absolute -top-16 right-6 h-12 w-12 text-ink" />
            <div className="sb-lined px-6 pt-4 pb-6 shadow-[2px_4px_10px_rgba(60,40,20,0.18)] font-note text-xl">
              <p className="sb-link inline-block tracking-widest">THIS WEEK:</p>
              <ul>
                {TODO.map(item => (
                  <li key={item.text} className="flex items-center gap-2">
                    <CheckBox checked={item.done} className="h-6 w-6 shrink-0 overflow-visible" />
                    {item.text}
                  </li>
                ))}
              </ul>
              <Heart className="ml-auto mt-1 h-7 w-7" />
            </div>
          </motion.div>
        </div>

        {/* Graph-paper note — weekly total */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease }}
          className="relative mx-auto mt-10 w-fit lg:absolute lg:bottom-6 lg:left-[46%] lg:mt-0 -rotate-2"
        >
          <div className="sb-grid px-6 py-4 shadow-[2px_3px_8px_rgba(60,40,20,0.18)] font-note text-lg leading-snug">
            <p>Est. this week: <span className="font-type font-bold">$1,247.50</span></p>
            <p>Logged so far: <span className="font-type font-bold">28.5h</span></p>
          </div>
          <Splat className="absolute -right-12 -top-6 h-12 w-12 text-ink" />
        </motion.div>
      </section>

      {/* ── Washi-tape marquee ── */}
      <div className="relative -mx-4 -rotate-1 overflow-hidden bg-tape/80 py-2.5 shadow-[0_2px_6px_rgba(60,40,20,0.15)]">
        <div className="flex animate-marquee whitespace-nowrap will-change-transform">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="mx-6 inline-flex items-center gap-12 font-note text-lg tracking-wide">
              {item}
              <span className="text-ink/40">✶</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="font-hand font-bold text-5xl">How it works</h2>
        <Scribble className="mt-1 h-3 w-44 text-ink" />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-10">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease }}
              className={`relative ${step.rotate}`}
            >
              <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-1 !w-24" />
              <Scrap paper={step.paper} className="h-full px-7 pt-10 pb-9">
                <span className="sb-sketch inline-flex h-11 w-11 items-center justify-center font-hand text-3xl font-bold">
                  {step.n}
                </span>
                <h3 className="mt-4 font-hand text-4xl font-bold leading-none">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/75">{step.body}</p>
              </Scrap>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Rule className="mb-16 h-2 w-full text-ink" />
        <p className="font-note text-lg uppercase tracking-[0.2em] text-ink-soft">Features</p>
        <h2 className="mt-1 font-hand font-bold text-[clamp(2.75rem,6vw,4rem)] leading-[0.95]">
          Built around<br />how you actually work.
        </h2>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {/* Wide — payslip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="relative sm:col-span-2 -rotate-1"
          >
            <Tape className="-top-3 left-10 -rotate-3" />
            <Scrap paper="kraft" className="h-full px-8 pt-11 pb-9">
              <p className="font-note uppercase tracking-[0.2em] text-ink/70">Payslip verification</p>
              <h3 className="mt-2 font-hand text-5xl font-bold leading-none">Upload a payslip. See the truth.</h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/80">
                Compare your actual tracked hours against what your employer reported, line by line. No more surprises at the end of the month.
              </p>
              <div className="mt-6 flex items-center gap-3 font-note">
                <span className="sb-sketch px-3 py-0.5">PDF / CSV</span>
                <span className="sb-sketch px-3 py-0.5 -rotate-2 border-stamp text-stamp">Auto matched</span>
              </div>
            </Scrap>
          </motion.div>

          {/* Clients */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="rotate-2"
          >
            <div className="sb-lined h-full px-7 pt-4 pb-8 shadow-[2px_4px_10px_rgba(60,40,20,0.18)]">
              <p className="font-note uppercase tracking-[0.2em] text-ink-soft">Clients</p>
              <h3 className="font-hand text-[2rem] font-bold leading-8">Track by client, not just by hour.</h3>
              <p className="font-note text-lg text-ink/80">
                Break down earnings per project and know your most valuable relationships at a glance.
              </p>
            </div>
          </motion.div>

          {/* Reports — recent log */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
            className="relative -rotate-2"
          >
            <Tape className="-top-3 right-8 rotate-6 !w-24" />
            <Scrap paper="white" edge="rough" className="h-full px-7 pt-9 pb-7">
              <p className="font-note uppercase tracking-[0.2em] text-ink-soft">Reports</p>
              <h3 className="mt-1 font-hand text-4xl font-bold leading-none">Weekly &amp; monthly breakdowns.</h3>
              <ul className="mt-5 text-sm">
                {LOG_ENTRIES.map(entry => (
                  <li key={entry.client} className="flex items-baseline justify-between gap-3 border-b border-dashed border-ink/25 py-2">
                    <span>
                      {entry.client}
                      {entry.live && <span className="ml-2 font-note text-stamp">live</span>}
                    </span>
                    <span className="font-bold tabular-nums">{entry.duration}</span>
                  </li>
                ))}
              </ul>
            </Scrap>
          </motion.div>

          {/* Earnings forecast — wide + mini chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12, ease }}
            className="sm:col-span-2 rotate-1"
          >
            <div className="sb-grid h-full px-8 py-8 shadow-[2px_4px_10px_rgba(60,40,20,0.18)]">
              <p className="font-note uppercase tracking-[0.2em] text-ink-soft">Earnings forecast</p>
              <h3 className="mt-1 font-hand text-4xl font-bold leading-none">See where the month is headed.</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/80">
                Based on your current pace and contracted hours, we project your total for the month so you&apos;re never caught short.
              </p>

              {/* bar chart — heights are dynamic, inline style is unavoidable here */}
              <div className="mt-6 flex items-end gap-2 h-20 border-b-2 border-ink">
                {FORECAST_BARS.map((bar, i) => (
                  <div
                    key={i}
                    className={`flex-1 border-2 border-b-0 border-ink ${bar.filled ? 'bg-ink' : 'bg-transparent border-dashed'}`}
                    style={{ height: `${bar.h}%` }}
                  />
                ))}
                <div className="self-center ml-2 font-hand text-3xl font-bold text-stamp -rotate-6">+12%</div>
              </div>
              <div className="mt-1 flex gap-2 pr-[4.25rem] font-note text-sm text-ink-soft">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} className="flex-1 text-center">{d}</div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="relative rotate-1">
          <Tape className="-top-3 left-12 -rotate-6" />
          <Tape className="-top-3 right-12 rotate-3" />
          <Scrap paper="kraft" className="px-8 sm:px-14 py-14 text-center">
            <h2 className="font-hand font-bold text-[clamp(3rem,7vw,4.5rem)] leading-[0.95]">
              Start tracking.<br />Stop guessing.
            </h2>
            <Scribble className="mx-auto mt-2 h-4 w-72 max-w-full text-ink" />
            <p className="mx-auto mt-6 max-w-sm text-[15px] leading-relaxed text-ink/80">
              Free to start. No credit card. Your data is yours. Export it any time.
            </p>
            <motion.a
              whileHover={{ rotate: -1.5, scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              href="/register"
              className="group mt-8 inline-block font-note text-xl uppercase tracking-wider"
            >
              <Scrap paper="ink" edge="rough" className="flex items-center gap-3 px-8 py-3 text-paper">
                Get started free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </Scrap>
            </motion.a>
          </Scrap>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mx-auto max-w-6xl px-6 pb-8">
        <Rule className="h-2 w-full text-ink" />
        <div className="flex items-center justify-between pt-5 font-note text-lg text-ink-soft">
          <span>Time Tracker</span>
          <p>© 2026. Your time, your terms.</p>
        </div>
      </footer>
    </main>
  );
}
