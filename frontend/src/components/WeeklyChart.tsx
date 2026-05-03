'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from 'next-themes';

export default function WeeklyChart({ data }: { data: any[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || !theme;
  
  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: isDark ? '#71717a' : '#a1a1aa', fontSize: 10, fontWeight: 'bold' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: isDark ? '#71717a' : '#a1a1aa', fontSize: 10 }} 
          />
          <Tooltip 
            cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            contentStyle={{ 
              backgroundColor: isDark ? '#18181b' : '#ffffff', 
              borderColor: isDark ? '#27272a' : '#e4e4e7',
              borderRadius: '8px',
              color: isDark ? '#fff' : '#000',
              fontWeight: 'bold',
              fontSize: '12px',
              textTransform: 'uppercase'
            }}
          />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.hours > 0 ? '#E10600' : (isDark ? '#27272a' : '#e4e4e7')} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
