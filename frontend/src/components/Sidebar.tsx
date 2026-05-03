'use client';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Clock, FileText, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const { logout } = useAuth();
  const pathname = usePathname();

  const navs = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Timesheet', path: '/timesheet', icon: Clock },
    { name: 'Payslips', path: '/payslip', icon: FileText },
    { name: 'Employers', path: '/profile', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col min-h-screen fixed left-0 top-0 z-50 transition-colors">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-black text-zinc-900 dark:text-white font-display uppercase italic tracking-tighter"
          >
            Time<span className="text-racing-red">Tracker</span>
          </motion.h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4 px-4">Menu</p>
          {navs.map((nav, i) => {
            const isActive = pathname === nav.path;
            return (
              <motion.div
                key={nav.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={nav.path} className={`group flex items-center gap-3 px-4 py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all duration-200 ${isActive ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-[inset_4px_0_0_0_#E10600]' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-white'}`}>
                  <nav.icon className={`w-5 h-5 ${isActive ? 'text-racing-red' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-racing-red transition-colors'}`} /> 
                  {nav.name}
                </Link>
              </motion.div>
            )
          })}
        </nav>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex flex-col gap-4">
          <div className="flex justify-between items-center px-4">
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Theme</span>
            <ThemeToggle />
          </div>
          <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg font-bold uppercase tracking-wider text-sm transition-all">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40">
        <h1 className="text-xl font-black text-zinc-900 dark:text-white font-display uppercase italic tracking-tighter">
          Time<span className="text-racing-red">Tracker</span>
        </h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button onClick={logout} className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex justify-around p-2 pb-safe z-50 transition-colors">
        {navs.map((nav) => {
          const isActive = pathname === nav.path;
          return (
            <Link key={nav.path} href={nav.path} className={`flex flex-col items-center p-2 rounded-lg transition-all ${isActive ? 'text-racing-red' : 'text-zinc-400 dark:text-zinc-500'}`}>
              <nav.icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{nav.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  );
}
