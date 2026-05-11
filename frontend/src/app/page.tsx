'use client';
import { motion } from 'framer-motion';
import ThreeScene from '@/components/ThreeScene';
import { ArrowRight, BarChart3, CheckCircle2, Clock, FileText } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-carbon text-zinc-900 dark:text-white relative overflow-hidden transition-colors">
      <ThreeScene />

      <header className="relative z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white font-display uppercase italic tracking-tighter">
            Time<span className="text-racing-red">Tracker</span>
          </h1>
          <nav className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-all"
            >
              Login
            </a>
            <a
              href="/register"
              className="clip-slant-btn bg-racing-red px-5 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-neon-red transition-all hover:bg-red-700"
            >
              Register
            </a>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10 md:grid-cols-[1.05fr_0.95fr] md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex min-h-[520px] flex-col justify-center border-b border-zinc-200 pb-8 dark:border-zinc-800 md:border-b-0 md:pb-0"
        >
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-racing-red">Time And Pay Control</p>
          <h2 className="font-display text-5xl font-black uppercase italic tracking-tight text-zinc-900 dark:text-white md:text-7xl">
            Track Work.
            <span className="block text-racing-red">Trust Pay.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-zinc-600 dark:text-zinc-300 md:text-lg">
            Log hours, calculate projected revenue, and compare payslips from one focused dashboard built for daily use.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="/login"
              className="clip-slant-btn inline-flex items-center justify-center gap-2 bg-racing-red px-8 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-neon-red transition-all hover:bg-red-700"
            >
              Login <ArrowRight className="h-4 w-4" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="/register"
              className="clip-slant-btn inline-flex items-center justify-center gap-2 border border-zinc-300 bg-white/80 px-8 py-4 text-sm font-bold uppercase tracking-widest text-zinc-800 shadow-sm transition-all hover:border-racing-red hover:text-racing-red dark:border-zinc-700 dark:bg-zinc-950/80 dark:text-zinc-300"
            >
              Create Account
            </motion.a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid content-center gap-6"
        >
          <div className="bg-white/70 dark:bg-zinc-900/60 rounded-xl shadow-2xl border border-white/30 dark:border-zinc-800/70 p-6 backdrop-blur-xl">
            <div className="mb-6 flex items-start justify-between border-b border-zinc-200/70 pb-5 dark:border-zinc-800">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">This Week</p>
                <p className="mt-2 font-display text-5xl font-black text-zinc-900 dark:text-white">
                  38.5<span className="ml-2 text-base font-bold tracking-widest text-zinc-500">HRS</span>
                </p>
              </div>
              <span className="rounded bg-zinc-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-racing-red border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800">
                Live
              </span>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {[7.5, 8, 6.5, 8.5, 8].map((hours, index) => (
                <div key={index} className="flex h-32 flex-col justify-end rounded bg-zinc-100 p-2 dark:bg-zinc-950">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(hours / 9) * 100}%` }}
                    transition={{ delay: 0.25 + index * 0.08, duration: 0.5 }}
                    className="rounded bg-racing-red shadow-neon-red"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-5 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FeatureCard icon={Clock} label="Fast Logs" value="Start To Finish" />
            <FeatureCard icon={BarChart3} label="Revenue" value="$1,246.50" />
            <FeatureCard icon={FileText} label="Payslips" value="Validated" />
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 border-t border-zinc-200 bg-white/60 px-6 py-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/60">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-3">
          {['Public holiday rates', 'Employer pay rules', 'Timesheet history'].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-300">
              <CheckCircle2 className="h-5 w-5 text-racing-red" />
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 p-5 shadow-lg backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mb-4 flex items-center justify-between">
        <Icon className="h-5 w-5 text-racing-red" />
        <span className="rounded bg-zinc-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">Ready</span>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="mt-1 text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}
