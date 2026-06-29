'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts';

interface WeeklyChartProps {
  data: { day: string; hours: number; revenue?: number }[];
  todayIndex?: number; // 0=Mon … 6=Sun, -1=no highlight
}

function fmtHours(h: number) {
  if (h === 0) return '—';
  const hrs  = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const hours   = payload[0]?.value ?? 0;
  const revenue = payload[0]?.payload?.revenue ?? 0;

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-4 shadow-2xl min-w-[148px]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A5A] mb-3">{label}</p>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A5A]">Hours</p>
          <p className="font-heading text-xl font-black text-[#F5F2EB] tabular-nums mt-0.5">
            {fmtHours(hours)}
          </p>
        </div>
        {revenue > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A5A]">Earned</p>
            <p className="font-heading text-xl font-black text-volt tabular-nums mt-0.5">
              ${revenue.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WeeklyChart({ data, todayIndex = -1 }: WeeklyChartProps) {
  const maxHours = Math.max(...data.map(d => d.hours), 1);

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 4, left: -28, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid
            strokeDasharray="0"
            stroke="#1E1E1E"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#5A5A5A', fontSize: 10, fontWeight: 700, letterSpacing: 1 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#5A5A5A', fontSize: 10, fontWeight: 700 }}
            tickFormatter={(v) => v === 0 ? '' : `${v}h`}
            width={36}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(200, 241, 53, 0.04)', radius: 6 } as any}
          />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={48} animationBegin={0} animationDuration={600} animationEasing="ease-out">
            {data.map((entry, i) => {
              const isToday   = i === todayIndex;
              const hasHours  = entry.hours > 0;
              let fill: string;
              if (!hasHours)      fill = '#1E1E1E';
              else if (isToday)   fill = '#C8F135';
              else                fill = 'rgba(200, 241, 53, 0.55)';
              return <Cell key={`cell-${i}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
