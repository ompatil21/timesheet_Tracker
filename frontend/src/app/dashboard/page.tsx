'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { motion, animate } from 'framer-motion';
import WeeklyChart from '@/components/WeeklyChart';
import RevenueChart from '@/components/RevenueChart';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'lastMonth'>('week');
  const [allLogs, setAllLogs] = useState<any[]>([]);

  const [stats, setStats] = useState({ totalHours: 0, totalPay: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  // Animated counters
  const [displayHours, setDisplayHours] = useState('0.0');
  const [displayPay, setDisplayPay] = useState('0.00');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/timelogs');
        setAllLogs(data);
      } catch (err) {
        console.error('Failed to fetch stats');
      }
    };

    if (user) fetchStats();
  }, [user, loading, router]);

  useEffect(() => {
    if (!allLogs) return;

    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    
    if (timeRange === 'week') {
      const currentDay = now.getDay();
      const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - daysToMonday);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (timeRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (timeRange === 'lastMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }

    const filteredLogs = allLogs.filter((log: any) => {
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate <= endDate;
    });

    let totalHours = 0;
    let totalPay = 0;
    
    // Prepare Chart Data
    let wData: any[] = [];
    if (timeRange === 'week') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      wData = days.map(day => ({ day, hours: 0 }));
      
      filteredLogs.forEach((log: any) => {
        const logDate = new Date(log.date);
        let dayIndex = logDate.getDay() - 1;
        if (dayIndex === -1) dayIndex = 6;
        wData[dayIndex].hours += log.hours;
      });
    } else {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
      wData = weeks.map(day => ({ day, hours: 0 }));
      
      filteredLogs.forEach((log: any) => {
        const logDate = new Date(log.date);
        const dayOfMonth = logDate.getDate();
        const weekIndex = Math.floor((dayOfMonth - 1) / 7);
        if (wData[weekIndex]) wData[weekIndex].hours += log.hours;
      });
    }

    const rMap: any = {};
    filteredLogs.forEach((log: any) => {
      totalHours += log.hours;
      const currentPay = log.earnedRevenue || 0;
      totalPay += currentPay;

      const clientName = log.client?.name || 'Unknown';
      if (!rMap[clientName]) rMap[clientName] = 0;
      rMap[clientName] += currentPay;
    });

    const rData = Object.keys(rMap).map(key => ({
      name: key,
      value: rMap[key]
    }));

    setStats({ totalHours, totalPay });
    setChartData(wData);
    setRevenueData(rData);

  }, [timeRange, allLogs]);

  useEffect(() => {
    const controlsHours = animate(0, stats.totalHours, {
      duration: 1.0,
      ease: "easeOut",
      onUpdate(value) { setDisplayHours(value.toFixed(1)); }
    });
    const controlsPay = animate(0, stats.totalPay, {
      duration: 1.0,
      ease: "easeOut",
      onUpdate(value) { setDisplayPay(value.toFixed(2)); }
    });
    return () => { controlsHours.stop(); controlsPay.stop(); };
  }, [stats]);

  if (loading || !user) return <div className="p-8 text-center min-h-screen bg-zinc-50 dark:bg-zinc-950 text-racing-red font-display animate-pulse uppercase tracking-widest transition-colors">Starting Engine...</div>;

  return (
    <div className="min-h-screen bg-carbon md:pl-64 pb-20 md:pb-0 text-zinc-900 dark:text-white transition-colors overflow-hidden">
      <Sidebar />
      <main className="p-6 md:p-10 max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6 gap-4 relative z-20"
        >
          <div>
            <h2 className="text-sm font-bold text-racing-red uppercase tracking-widest mb-1">Active User</h2>
            <h1 className="text-4xl md:text-5xl font-black font-display uppercase tracking-tight italic">
              {user.name}
            </h1>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="hidden sm:flex items-center justify-end gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-racing-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-racing-red"></span>
              </span>
              <span className="text-sm font-bold tracking-widest text-zinc-900 dark:text-white uppercase">ONLINE</span>
            </div>
            
            {/* Time Range Toggle */}
            <div className="flex bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-300 dark:border-zinc-700 shadow-sm">
              <button 
                onClick={() => setTimeRange('week')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${timeRange === 'week' ? 'bg-white dark:bg-zinc-950 text-racing-red shadow-sm border border-zinc-300 dark:border-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                This Week
              </button>
              <button 
                onClick={() => setTimeRange('month')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${timeRange === 'month' ? 'bg-white dark:bg-zinc-950 text-racing-red shadow-sm border border-zinc-300 dark:border-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                This Month
              </button>
              <button 
                onClick={() => setTimeRange('lastMonth')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${timeRange === 'lastMonth' ? 'bg-white dark:bg-zinc-950 text-racing-red shadow-sm border border-zinc-300 dark:border-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              >
                Last Month
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2, zIndex: 10 }}
            className="bg-white/60 dark:bg-zinc-900/40 p-8 rounded-xl shadow-2xl border border-white/20 dark:border-zinc-800/50 relative overflow-hidden group backdrop-blur-xl cursor-default transition-all duration-300"
            style={{ perspective: 1000 }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-racing-red opacity-10 blur-[80px] group-hover:opacity-20 transition-all"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                {timeRange === 'week' ? "This Week's Time" : timeRange === 'month' ? "This Month's Time" : "Last Month's Time"}
              </h3>
              <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">Live</span>
            </div>
            <div className="flex items-baseline gap-2 mb-6 relative z-10">
              <p className="text-7xl font-black font-display text-zinc-900 dark:text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                {displayHours}
              </p>
              <span className="text-xl text-zinc-500 font-bold uppercase tracking-widest">HRS</span>
            </div>
            
            <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 pt-4 relative z-10">
              <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">
                {timeRange === 'week' ? "Weekly Breakdown" : "Monthly Breakdown"}
              </h4>
              <WeeklyChart data={chartData} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2, zIndex: 10 }}
            className="bg-white/60 dark:bg-zinc-900/40 p-8 rounded-xl shadow-2xl border border-white/20 dark:border-zinc-800/50 relative overflow-hidden group backdrop-blur-xl cursor-default transition-all duration-300"
            style={{ perspective: 1000 }}
          >
            <div className="absolute top-0 left-0 w-48 h-48 bg-green-500 opacity-10 blur-[80px] group-hover:opacity-20 transition-all"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                {timeRange === 'week' ? "This Week's Revenue" : timeRange === 'month' ? "This Month's Revenue" : "Last Month's Revenue"}
              </h3>
              <span className="bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-500 border border-green-200 dark:border-green-900 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Projected</span>
            </div>
            <div className="flex items-baseline gap-2 mb-6 relative z-10">
              <span className="text-4xl text-green-500 dark:text-green-600 font-display font-black">$</span>
              <p className="text-7xl font-black font-display text-zinc-900 dark:text-white drop-shadow-[0_0_10px_rgba(0,255,0,0.3)] dark:drop-shadow-[0_0_10px_rgba(0,255,0,0.2)]">
                {displayPay}
              </p>
            </div>
            
            <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 pt-4 relative z-10">
              <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 text-center">
                {timeRange === 'week' ? "Weekly Sources" : "Monthly Sources"}
              </h4>
              <RevenueChart data={revenueData} />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
