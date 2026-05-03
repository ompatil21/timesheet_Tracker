'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';

const COLORS = ['#E10600', '#22c55e', '#3b82f6', '#eab308', '#a855f7'];

export default function RevenueChart({ data }: { data: any[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || !theme;

  return (
    <div className="h-64 w-full mt-4 relative flex justify-center items-center">
      {data.length === 0 ? (
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest absolute">No Revenue Data</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#18181b' : '#ffffff',
                borderColor: isDark ? '#27272a' : '#e4e4e7',
                borderRadius: '8px',
                color: isDark ? '#fff' : '#000',
                fontWeight: 'bold',
                fontSize: '12px',
                textTransform: 'uppercase'
              }}
              formatter={(value: any) => {
                if (typeof value === 'number') {
                  return [`$${value.toFixed(2)}`, 'Revenue'];
                }
                return ['$0.00', 'Revenue'];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
