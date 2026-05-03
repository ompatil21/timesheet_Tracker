'use client';
import { motion } from 'framer-motion';
import ThreeScene from '@/components/ThreeScene';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden transition-colors">
      {/* Dynamic 3D Background */}
      <ThreeScene />

      {/* Ambient Glows */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-10 left-10 w-96 h-96 bg-racing-red blur-[100px] rounded-full z-0"
      ></motion.div>
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.15 }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        className="absolute bottom-10 right-10 w-96 h-96 bg-red-900 blur-[120px] rounded-full z-0"
      ></motion.div>

      {/* Main Glass Panel */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 w-full max-w-5xl items-center justify-center flex flex-col text-center space-y-8 bg-white/60 dark:bg-zinc-900/40 p-12 rounded-2xl border border-white/20 dark:border-zinc-800/50 backdrop-blur-xl shadow-2xl"
      >
        <h1 className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white font-display tracking-tighter uppercase italic drop-shadow-[0_0_15px_rgba(225,6,0,0.2)]">
          Time<span className="text-racing-red">Tracker</span>
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl font-light tracking-wide">
          Track your hours, automatically calculate your pay, and validate your payslips with high-performance precision.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 mt-12 w-full justify-center">
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/login" 
            className="clip-slant-btn px-10 py-4 bg-racing-red text-white font-bold tracking-widest uppercase hover:bg-red-700 hover:shadow-neon-red transition-all duration-200"
          >
            Start Engine (Login)
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/register" 
            className="clip-slant-btn px-10 py-4 bg-zinc-200 dark:bg-transparent text-zinc-800 dark:text-zinc-300 font-bold tracking-widest uppercase border border-zinc-300 dark:border-zinc-700 hover:border-racing-red hover:text-white hover:bg-zinc-900 transition-all duration-200 shadow-sm"
          >
            Register
          </motion.a>
        </div>
      </motion.div>
    </main>
  );
}
