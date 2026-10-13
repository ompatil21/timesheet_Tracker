'use client';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Clock, CalendarDays, FileText, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ScrapbookDefs, Flower } from '@/components/scrapbook';

export default function Sidebar() {
  const { logout } = useAuth();
  const pathname = usePathname();

  const navs = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Timesheet', path: '/timesheet', icon: Clock },
    { name: 'Calendar', path: '/calendar', icon: CalendarDays },
    { name: 'Payslips', path: '/payslip', icon: FileText },
    { name: 'Employers', path: '/profile', icon: Settings },
  ];

  return (
    <>
      {/* Torn-edge filters for every app page */}
      <ScrapbookDefs />

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-paper-dark/60 border-r-2 border-dashed border-ink/25 hidden md:flex flex-col min-h-screen fixed left-0 top-0 z-50">
        <div className="px-7 pt-7 pb-5">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-note text-3xl leading-[1.05] tracking-wide text-ink"
          >
            Time<br /><span className="pl-4">Tracker</span>
          </motion.h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <p className="sb-link inline-block font-note text-lg tracking-widest text-ink mb-3 ml-3">MENU:</p>
          {navs.map((nav, i) => {
            const isActive = pathname === nav.path;
            return (
              <motion.div
                key={nav.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={nav.path}
                  className={`group flex items-center gap-3 px-4 py-2 font-note text-xl transition-all duration-200 ${isActive ? 'bg-tape text-ink shadow-sm -rotate-1' : 'text-ink-soft hover:text-ink hover:translate-x-1'}`}
                >
                  <nav.icon className="w-5 h-5" strokeWidth={1.75} />
                  {nav.name}
                </Link>
              </motion.div>
            )
          })}
        </nav>
        <Flower className="mx-auto h-44 text-ink/70" />
        <div className="p-4">
          <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-2 font-note text-xl text-stamp hover:translate-x-1 transition-transform">
            <LogOut className="w-5 h-5" strokeWidth={1.75} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-paper/90 backdrop-blur-md border-b-2 border-dashed border-ink/25 sticky top-0 z-40">
        <h1 className="font-note text-2xl tracking-wide text-ink">Time Tracker</h1>
        <button onClick={logout} aria-label="Sign out" className="p-3 -mr-2 text-ink-soft hover:text-stamp transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-md border-t-2 border-dashed border-ink/25 flex justify-around p-2 pb-safe z-50">
        {navs.map((nav) => {
          const isActive = pathname === nav.path;
          return (
            <Link key={nav.path} href={nav.path} className={`flex flex-col items-center px-2 py-1 transition-all ${isActive ? 'text-ink bg-tape -rotate-2' : 'text-ink-faint'}`}>
              <nav.icon className="w-6 h-6" strokeWidth={1.75} />
              <span className="font-note text-sm">{nav.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  );
}
