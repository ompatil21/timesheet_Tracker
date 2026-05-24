'use client';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, TrendingUp, Shield, Clock, BarChart3, Smartphone } from 'lucide-react';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800/50 bg-zinc-950/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-5 sm:py-6">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl sm:text-2xl font-black text-white font-display uppercase italic tracking-tighter"
          >
            Time<span className="text-racing-red bg-gradient-to-r from-racing-red to-orange-500 bg-clip-text text-transparent">Tracker</span>
          </motion.h1>
          <nav className="flex items-center gap-2 sm:gap-4">
            <motion.a
              whileHover={{ y: -2 }}
              href="/login"
              className="px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors duration-300 relative group min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              Login
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-racing-red to-orange-500 group-hover:w-full transition-all duration-300"></span>
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              href="/register"
              className="px-4 sm:px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-gradient-to-r from-racing-red to-orange-500 rounded-lg shadow-lg shadow-racing-red/50 hover:shadow-racing-red/80 transition-all duration-300 min-h-[44px] flex items-center justify-center"
            >
              Get Started
            </motion.a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <motion.div
          variants={containerVariants}
          initial={false}
          animate="visible"
          className="grid grid-cols-1 gap-8 md:gap-12 md:grid-cols-2 items-center"
        >
          {/* Left - Hero Copy */}
          <motion.div variants={itemVariants} className="space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <motion.span
                variants={itemVariants}
                className="inline-block px-3 py-1.5 bg-racing-red/20 border border-racing-red/50 rounded-full text-xs font-bold uppercase tracking-widest text-racing-red"
              >
                ✨ Next-Gen Time Intelligence
              </motion.span>
              <motion.h2
                variants={itemVariants}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight"
              >
                Own Your{' '}
                <span className="bg-gradient-to-r from-racing-red via-orange-500 to-racing-red bg-clip-text text-transparent">
                  Earnings
                </span>
              </motion.h2>
            </div>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg md:text-xl text-zinc-400 leading-relaxed max-w-xl"
            >
              Real-time insights into your income. Zero guesswork. Just precision analytics that put you in control of every hour and every dollar.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4"
            >
              <motion.a
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-racing-red to-orange-500 text-white font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-racing-red/50 hover:shadow-racing-red/80 transition-all duration-300 group min-h-[48px] text-sm sm:text-base"
              >
                Start Free <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border-2 border-zinc-700 text-white font-bold uppercase tracking-widest rounded-lg hover:border-racing-red hover:text-racing-red transition-all duration-300 min-h-[48px] text-sm sm:text-base"
              >
                Sign In
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-4 sm:gap-6 pt-6 sm:pt-8"
            >
              <div className="space-y-2">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-racing-red">10K+</p>
                <p className="text-xs sm:text-sm text-zinc-400">Active Earners</p>
              </div>
              <div className="space-y-2">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-racing-red">$50M+</p>
                <p className="text-xs sm:text-sm text-zinc-400">Tracked Income</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Dashboard Preview */}
          <motion.div
            variants={itemVariants}
            className="relative hidden md:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-racing-red/20 to-orange-500/20 rounded-2xl blur-3xl"></div>
            <motion.div
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-xl rounded-2xl border border-zinc-800/50 p-5 sm:p-6 md:p-8 space-y-6"
            >
              {/* Dashboard Header */}
              <div className="flex items-center justify-between pb-6 border-b border-zinc-800/30">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">This Week Performance</p>
                  <p className="mt-3 text-3xl sm:text-4xl md:text-5xl font-black text-white">
                    38.5 <span className="text-base sm:text-lg text-zinc-400 font-bold">HRS</span>
                  </p>
                </div>
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-xs font-bold uppercase tracking-widest text-emerald-400"
                >
                  ● Live
                </motion.span>
              </div>

              {/* Mini Chart */}
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  {[7.5, 8, 6.5, 8.5, 8].map((hours, index) => (
                    <div key={index} className="flex h-20 sm:h-24 flex-col justify-end">
                      <motion.div
                        initial={false}
                        animate={{ height: `${(hours / 9) * 100}%`, opacity: 1 }}
                        transition={{ delay: 0.4 + index * 0.08, duration: 0.6, ease: 'easeOut' }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-racing-red to-orange-500 shadow-lg shadow-racing-red/50"
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-5 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4">
                <div className="bg-zinc-900/60 rounded-lg p-2 sm:p-3 border border-zinc-800/50 space-y-2">
                  <Zap className="h-4 w-4 text-racing-red" />
                  <p className="text-[9px] sm:text-[10px] text-zinc-400">Velocity</p>
                  <p className="text-xs sm:text-sm font-black text-white">Peak 8.5h</p>
                </div>
                <div className="bg-zinc-900/60 rounded-lg p-2 sm:p-3 border border-zinc-800/50 space-y-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <p className="text-[9px] sm:text-[10px] text-zinc-400">Earnings</p>
                  <p className="text-xs sm:text-sm font-black text-white">$1,246</p>
                </div>
                <div className="bg-zinc-900/60 rounded-lg p-2 sm:p-3 border border-zinc-800/50 space-y-2">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <p className="text-[9px] sm:text-[10px] text-zinc-400">Verified</p>
                  <p className="text-xs sm:text-sm font-black text-white">100%</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-3 sm:space-y-4 text-center mb-12 sm:mb-16"
        >
          <span className="inline-block px-3 py-1.5 bg-racing-red/20 border border-racing-red/50 rounded-full text-xs font-bold uppercase tracking-widest text-racing-red">
            What You Get
          </span>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black px-4">Built for{' '}
            <span className="bg-gradient-to-r from-racing-red to-orange-500 bg-clip-text text-transparent">
              Modern Earners
            </span>
          </h3>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
        >
          <FeatureCard
            icon={Zap}
            title="Instant Sync"
            description="Log hours in seconds. See real-time earnings updates with zero delay."
          />
          <FeatureCard
            icon={TrendingUp}
            title="Revenue Intelligence"
            description="Predictive analytics show your monthly trajectory before month-end."
          />
          <FeatureCard
            icon={Shield}
            title="Payslip Verification"
            description="AI-powered validation catches discrepancies your employer might miss."
          />
          <FeatureCard
            icon={Clock}
            title="Smart Scheduling"
            description="Optimize when you work based on historical performance patterns."
          />
          <FeatureCard
            icon={BarChart3}
            title="Advanced Analytics"
            description="Deep insights into hourly rates, peak earning times, and trends."
          />
          <FeatureCard
            icon={Smartphone}
            title="Mobile Native"
            description="Full functionality on-the-go. Track from anywhere, anytime."
          />
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-racing-red/10 via-orange-500/10 to-racing-red/10 border border-racing-red/20 rounded-2xl p-8 sm:p-12 md:p-16 text-center space-y-6 sm:space-y-8 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-racing-red/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10 space-y-3 sm:space-y-4">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black px-2">Ready to Reclaim Your Data?</h3>
            <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto px-2">
              Join thousands who've taken control of their earnings. No credit card required. Start tracking in 60 seconds.
            </p>
          </div>
          <motion.a
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            href="/register"
            className="relative z-10 inline-flex items-center gap-2 px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-racing-red to-orange-500 text-white font-black uppercase tracking-widest rounded-lg shadow-xl shadow-racing-red/50 hover:shadow-racing-red/80 transition-all duration-300 group text-base sm:text-lg min-h-[48px]"
          >
            Launch Dashboard <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 bg-zinc-950/40 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-zinc-400">
          <p>© 2026 TimeTracker. Precision. Transparency. Control.</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: typeof Clock; title: string; description: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 300, damping: 30 },
        },
      }}
      whileHover={{ y: -8 }}
      className="group relative bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 backdrop-blur-xl rounded-xl border border-zinc-800/50 p-5 sm:p-8 hover:border-racing-red/50 transition-all duration-300 space-y-4 min-h-full flex flex-col"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-racing-red/0 to-orange-500/0 group-hover:from-racing-red/5 group-hover:to-orange-500/5 rounded-xl transition-all duration-300"></div>
      <div className="relative z-10 space-y-4 flex-1 flex flex-col">
        <div className="p-2.5 sm:p-3 bg-gradient-to-br from-racing-red/20 to-orange-500/20 rounded-lg w-fit">
          <Icon className="h-5 sm:h-6 w-5 sm:w-6 text-racing-red" />
        </div>
        <div className="space-y-2 flex-1 flex flex-col">
          <h4 className="text-base sm:text-lg font-bold text-white">{title}</h4>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
