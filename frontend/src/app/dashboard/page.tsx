'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import { AppPageLoader, MetricCardSkeleton } from '@/components/LoadingStates';
import { motion, animate } from 'framer-motion';
import Link from 'next/link';
import WeeklyChart from '@/components/WeeklyChart';
import RevenueChart from '@/components/RevenueChart';
import { SyncStatus, SyncStatusBadge } from '@/components/HumanforceSync';
import { CalendarClock } from 'lucide-react';
import { Scrap, Tape, Scribble, Smiley } from '@/components/scrapbook';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [timeRange, setTimeRange] = useState<'week' | 'lastWeek' | 'month'>('week');
  const [allLogs, setAllLogs] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [scheduledHours, setScheduledHours] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [stats, setStats] = useState({ totalHours: 0, totalPay: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  // Animated counters
  const [displayHours, setDisplayHours] = useState('0.0');
  const [displayPay, setDisplayPay] = useState('0.00');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    
    const fetchStats = async () => {
      setIsDataLoading(true);
      try {
        const { data } = await api.get('/timelogs');
        setAllLogs(data);
      } catch (err) {
        console.error('Failed to fetch stats');
      } finally {
        setIsDataLoading(false);
      }
      // Humanforce data is optional — never block the dashboard on it
      try {
        const [shiftsRes, statusRes] = await Promise.all([
          api.get('/sync/shifts'),
          api.get('/sync'),
        ]);
        setShifts(shiftsRes.data);
        setSyncStatus(statusRes.data);
      } catch (err) {
        console.error('Failed to fetch sync data');
      }
    };

    fetchStats();
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
    } else if (timeRange === 'lastWeek') {
      const currentDay = now.getDay();
      const daysToLastMonday = currentDay === 0 ? 13 : currentDay + 6;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - daysToLastMonday);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }

    const filteredLogs = allLogs.filter((log: any) => {
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate <= endDate;
    });

    let totalHours = 0;
    let totalPay = 0;
    
    // Prepare Chart Data
    let wData: any[] = [];
    if (timeRange === 'week' || timeRange === 'lastWeek') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      wData = days.map(day => ({ day, hours: 0, revenue: 0 }));

      filteredLogs.forEach((log: any) => {
        const logDate = new Date(log.date);
        let dayIndex = logDate.getDay() - 1;
        if (dayIndex === -1) dayIndex = 6;
        wData[dayIndex].hours += log.hours;
        wData[dayIndex].revenue += log.earnedRevenue || 0;
      });
    } else {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
      wData = weeks.map(day => ({ day, hours: 0, revenue: 0 }));

      filteredLogs.forEach((log: any) => {
        const logDate = new Date(log.date);
        const dayOfMonth = logDate.getDate();
        const weekIndex = Math.floor((dayOfMonth - 1) / 7);
        if (wData[weekIndex]) {
          wData[weekIndex].hours += log.hours;
          wData[weekIndex].revenue += log.earnedRevenue || 0;
        }
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

    // Scheduled hours from Humanforce shifts within the same range
    const scheduled = shifts.reduce((sum: number, s: any) => {
      const start = new Date(s.start);
      if (start < startDate || start > endDate) return sum;
      return sum + (new Date(s.end).getTime() - start.getTime()) / 3600000;
    }, 0);
    setScheduledHours(scheduled);

  }, [timeRange, allLogs, shifts]);

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

  if (loading || !user) return <AppPageLoader label="Opening your notebook" />;

  const rangeLabel = timeRange === 'week' ? 'This week' : timeRange === 'lastWeek' ? 'Last week' : 'This month';
  const ranges = [
    { id: 'week', label: 'This week' },
    { id: 'lastWeek', label: 'Last week' },
    { id: 'month', label: 'This month' },
  ] as const;

  return (
    <div className="min-h-screen sb-page md:pl-64 pb-20 md:pb-0 text-ink overflow-hidden">
      <Sidebar />
      <main className="p-6 md:p-10 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 relative z-20"
        >
          <div>
            <h2 className="font-note text-xl text-ink-soft">hello again,</h2>
            <h1 className="font-hand font-bold text-6xl md:text-7xl leading-none">
              {user.name}
            </h1>
            <Scribble className="mt-1 h-3 w-48 text-ink" />
          </div>

          {/* Time Range Toggle */}
          <div className="flex items-center gap-2 font-note text-lg">
            {ranges.map(range => (
              <button
                key={range.id}
                type="button"
                onClick={() => setTimeRange(range.id)}
                className={`px-3 sm:px-4 py-2.5 sm:py-1 whitespace-nowrap transition-all ${timeRange === range.id ? 'bg-tape text-ink shadow-sm -rotate-2' : 'text-ink-soft hover:text-ink'}`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Humanforce scheduled vs logged */}
        {syncStatus?.configured && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10 relative z-20"
          >
            <Link
              href="/calendar"
              className="sb-grid flex flex-wrap items-center justify-between gap-4 px-6 py-4 shadow-md rotate-[0.4deg] hover:rotate-0 transition-transform group"
            >
              <div className="flex items-center gap-4">
                <CalendarClock className="w-5 h-5 text-ink" strokeWidth={1.75} />
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-note text-lg text-ink-soft">{rangeLabel}:</span>
                  <span className="font-bold text-lg">
                    <span className="text-stamp">{scheduledHours.toFixed(1)}</span>
                    <span className="text-xs text-ink-soft uppercase mx-1">hrs scheduled</span>
                    <span className="font-note text-ink-faint mx-1">vs</span>
                    <span className="text-moss">{stats.totalHours.toFixed(1)}</span>
                    <span className="text-xs text-ink-soft uppercase ml-1">hrs logged</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {syncStatus.lastSyncStatus === 'failed' ? (
                  <span className="font-note text-lg text-stamp">
                    Humanforce sync failed. Check your link.
                  </span>
                ) : (
                  <SyncStatusBadge status={syncStatus} />
                )}
                <span className="sb-link font-note text-lg group-hover:text-stamp group-hover:border-stamp transition-colors">
                  View calendar
                </span>
              </div>
            </Link>
          </motion.div>
        )}

        {isDataLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-20">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <Tape className="-top-3 left-10 -rotate-3" />
            <Scrap paper="kraft" className="h-full p-8 pt-10">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-note text-xl text-ink/80">{rangeLabel}&apos;s time</h3>
                <span className="sb-sketch font-note px-3 text-ink">live</span>
              </div>
              <div className="flex items-baseline gap-3 mb-6">
                <p className="font-hand font-bold text-6xl sm:text-7xl leading-none text-ink tabular-nums">
                  {displayHours}
                </p>
                <span className="font-note text-2xl text-ink/70">hrs</span>
              </div>

              <div className="border-t-2 border-dashed border-ink/30 pt-4">
                <h4 className="font-note text-lg text-ink/70 mb-2">
                  {timeRange === 'month' ? 'week by week' : 'day by day'}
                </h4>
                <WeeklyChart
                  data={chartData}
                  todayIndex={timeRange === 'week' ? (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; })() : -1}
                />
              </div>
            </Scrap>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, rotate: 3 }}
            animate={{ opacity: 1, y: 0, rotate: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <Smiley className="absolute -right-5 -top-7 z-10 h-16 w-16 rotate-12 drop-shadow-sm" />
            <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
            <Scrap paper="white" edge="rough" className="h-full p-8 pt-10">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-note text-xl text-ink-soft">{rangeLabel}&apos;s earnings</h3>
                <span className="sb-sketch font-note px-3 border-moss text-moss">projected</span>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-hand font-bold text-4xl sm:text-5xl text-moss">$</span>
                <p className="font-hand font-bold text-6xl sm:text-7xl leading-none text-ink tabular-nums">
                  {displayPay}
                </p>
              </div>

              <div className="border-t-2 border-dashed border-ink/30 pt-4">
                <h4 className="font-note text-lg text-ink-soft mb-2">
                  where it came from
                </h4>
                <RevenueChart data={revenueData} />
              </div>
            </Scrap>
          </motion.div>
        </div>
        )}
      </main>
    </div>
  );
}
