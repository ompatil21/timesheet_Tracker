'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

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
  'Start / finish times', 'Export to CSV', 'Multi-client',
];

const LOG_ENTRIES = [
  { client: 'Acme Corp', task: 'UI redesign', duration: '3h 20m', live: true },
  { client: 'Studio Seven', task: 'API integration', duration: '1h 45m', live: false },
  { client: 'Freelance Blog', task: 'Content review', duration: '0h 55m', live: false },
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
    n: '01',
    title: 'Log your hours',
    body: 'Start a timer or log manually. Add the client, task, and rate. Takes under 10 seconds.',
  },
  {
    n: '02',
    title: 'Verify your payslip',
    body: 'Upload your payslip and compare it against your tracked hours. Discrepancies surface automatically.',
  },
  {
    n: '03',
    title: "Know what you're owed",
    body: "See a running total of earnings, export reports, and go into every payment conversation with facts.",
  },
];

export default function Home() {
  const time = useClock();

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F2EB] overflow-x-hidden">

      {/* ── Header ── */}
      <header className="border-b border-[#1E1E1E]">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <span className="font-display text-xl font-black uppercase italic tracking-tighter text-[#F5F2EB]">
            Time<span className="text-volt">Tracker</span>
          </span>
          <nav className="flex items-center gap-6">
            <a
              href="/login"
              className="text-sm text-[#5A5A5A] hover:text-[#F5F2EB] transition-colors duration-200"
            >
              Log in
            </a>
            <a
              href="/register"
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-md bg-volt text-[#0A0A0A] hover:brightness-110 transition-all duration-200"
            >
              Start free <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </nav>
        </div>
      </header>

      {/* ── Marquee strip ── */}
      <div className="bg-[#0D0D0D] border-b border-[#1E1E1E] overflow-hidden py-3">
        <div className="flex animate-marquee whitespace-nowrap will-change-transform">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-4 mx-8 text-[11px] font-bold uppercase tracking-widest text-volt"
            >
              {item}
              <span className="text-[#2A2A2A]">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-28 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

        {/* Left — copy */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#5A5A5A] border border-[#1E1E1E] px-3.5 py-1.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full inline-block bg-volt" />
            For freelancers
          </div>

          <h1 className="font-heading text-[clamp(3rem,8vw,5.5rem)] font-bold leading-[0.93] tracking-tight text-[#F5F2EB]">
            Your time,<br />
            <span className="text-volt">your invoice.</span>
          </h1>

          <p className="text-lg leading-relaxed max-w-md text-[#6B6B6B]">
            Stop guessing what you&apos;re owed. Log hours as you work,
            verify your payslip against what you actually tracked,
            and spot discrepancies before they cost you.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="/register"
              className="flex items-center gap-2 px-7 py-3.5 font-bold rounded-md bg-volt text-[#0A0A0A] hover:brightness-110 transition-all duration-200 group"
            >
              Start tracking free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </motion.a>
            <a
              href="/login"
              className="flex items-center gap-2 px-7 py-3.5 font-bold rounded-md border border-[#1E1E1E] text-[#F5F2EB] hover:border-[#2E2E2E] transition-colors duration-200"
            >
              Sign in
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-1">
            {['No credit card', 'Cancel any time', 'Export your data'].map(item => (
              <div key={item} className="flex items-center gap-1.5 text-xs text-[#5A5A5A]">
                <Check className="h-3.5 w-3.5 text-volt" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — live clock widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* subtle lime rim glow */}
          <div className="absolute -inset-px rounded-2xl pointer-events-none bg-gradient-to-br from-volt/[12%] to-transparent" />

          <div className="relative rounded-2xl p-8 space-y-6 bg-[#111111] border border-[#1E1E1E]">

            {/* header row */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#5A5A5A]">
                Active session
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-volt">
                <span className="h-1.5 w-1.5 rounded-full inline-block animate-pulse bg-volt" />
                Tracking
              </span>
            </div>

            {/* live clock */}
            <div>
              <p className="font-mono text-[clamp(3rem,9vw,4.5rem)] font-black leading-none tracking-tighter tabular-nums text-[#F5F2EB]">
                {time || '00:00:00'}
              </p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-[#5A5A5A]">
                Time today
              </p>
            </div>

            <div className="h-px bg-[#1E1E1E]" />

            {/* log entries */}
            <div className="space-y-1">
              {LOG_ENTRIES.map((entry, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between py-2.5 ${i < LOG_ENTRIES.length - 1 ? 'border-b border-[#181818]' : ''}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-[#F5F2EB]">{entry.client}</p>
                    <p className="text-xs text-[#5A5A5A]">{entry.task}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-[#F5F2EB]">{entry.duration}</p>
                    {entry.live && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-volt">
                        live
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* earnings row */}
            <div className="flex items-center justify-between rounded-xl px-5 py-4 bg-[#0D0D0D] border border-[#1E1E1E]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#5A5A5A]">
                  Est. this week
                </p>
                <p className="mt-1 text-2xl font-black tabular-nums font-heading text-volt">
                  $1,247.50
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#5A5A5A]">
                  Logged
                </p>
                <p className="mt-1 text-2xl font-black tabular-nums font-heading text-[#F5F2EB]">
                  28.5h
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t border-[#1E1E1E] bg-[#0D0D0D]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-14 text-[#5A5A5A]">
            How it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="border border-[#1E1E1E] rounded-xl p-8 hover:bg-[#111111] transition-colors duration-200 cursor-default"
              >
                <span className="text-xs font-black tracking-widest text-volt">
                  {step.n}
                </span>
                <h3 className="mt-5 text-xl font-bold font-heading text-[#F5F2EB]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5A5A5A]">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features bento ── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-[#5A5A5A]">
          Features
        </p>
        <h2 className="font-heading text-[clamp(2rem,5vw,3.25rem)] font-bold leading-tight mb-12 text-[#F5F2EB]">
          Built around<br />how you actually work.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

          {/* Wide — payslip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-1 sm:col-span-2 bg-[#111111] border border-[#1E1E1E] rounded-xl p-8 flex flex-col justify-between min-h-[220px] hover:border-[#2A2A2A] transition-colors duration-200"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-volt">
                Payslip verification
              </p>
              <h3 className="text-2xl font-bold font-heading text-[#F5F2EB]">
                Upload a payslip. See the truth.
              </h3>
              <p className="mt-3 text-sm leading-relaxed max-w-sm text-[#5A5A5A]">
                Compare your actual tracked hours against what your employer reported — line by line. No more end-of-month surprises.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-volt/10 border border-volt/20 text-volt">
                PDF / CSV
              </span>
              <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-[#1A1A1A] border border-[#252525] text-[#5A5A5A]">
                Auto-matched
              </span>
            </div>
          </motion.div>

          {/* Clients */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-8 hover:border-[#2A2A2A] transition-colors duration-200"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-volt">
              Clients
            </p>
            <h3 className="text-xl font-bold font-heading text-[#F5F2EB]">
              Track by client, not just by hour.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#5A5A5A]">
              Break down earnings per project and know your most valuable relationships at a glance.
            </p>
          </motion.div>

          {/* Reports */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-8 hover:border-[#2A2A2A] transition-colors duration-200"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-volt">
              Reports
            </p>
            <h3 className="text-xl font-bold font-heading text-[#F5F2EB]">
              Weekly & monthly breakdowns.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#5A5A5A]">
              Export to CSV or PDF. Take your data anywhere — your records stay yours.
            </p>
          </motion.div>

          {/* Earnings forecast — wide + mini chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-1 sm:col-span-2 bg-[#0D0D0D] border border-[#1E1E1E] rounded-xl p-8 hover:border-[#2A2A2A] transition-colors duration-200"
          >
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-volt">
              Earnings forecast
            </p>
            <h3 className="text-xl font-bold font-heading text-[#F5F2EB]">
              See where the month is headed.
            </h3>
            <p className="mt-2 text-sm leading-relaxed max-w-md text-[#5A5A5A]">
              Based on your current pace and contracted hours, we project your month-end total so you&apos;re never caught short.
            </p>

            {/* bar chart — heights are dynamic, inline style is unavoidable here */}
            <div className="mt-6 flex items-end gap-1.5 h-16">
              {FORECAST_BARS.map((bar, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${bar.filled ? 'bg-volt' : 'bg-volt/25'}`}
                  style={{ height: `${bar.h}%` }}
                />
              ))}
              <div className="self-center ml-1 text-xs font-black text-volt">+12%</div>
            </div>
            <div className="mt-1.5 flex gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#3A3A3A]">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="flex-1 text-center">{d}</div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-[#1E1E1E]">
        <div className="mx-auto max-w-7xl px-6 py-24 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div>
            <h2 className="font-heading text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-tight text-[#F5F2EB]">
              Start tracking.<br />
              <span className="text-volt">Stop guessing.</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed max-w-sm text-[#5A5A5A]">
              Free to start. No credit card. Your data is yours — export it any time.
            </p>
          </div>
          <div className="shrink-0">
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              href="/register"
              className="flex items-center justify-center gap-2 px-9 py-4 font-black text-lg rounded-md bg-volt text-[#0A0A0A] hover:brightness-110 transition-all duration-200 group"
            >
              Get started free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </motion.a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1E1E1E] bg-[#0A0A0A]">
        <div className="mx-auto max-w-7xl px-6 py-8 flex items-center justify-between">
          <span className="font-display text-sm font-black uppercase italic tracking-tighter text-[#2A2A2A]">
            TimeTracker
          </span>
          <p className="text-xs text-[#3A3A3A]">
            © 2026. Your time, your terms.
          </p>
        </div>
      </footer>
    </main>
  );
}
