'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid,
} from 'recharts';

interface WeeklyChartProps {
  data: { day: string; hours: number; revenue?: number }[];
  todayIndex?: number; // 0=Mon … 6=Sun, -1=no highlight
}

const INK = '#1F1B16';
const INK_SOFT = '#5B5348';

function fmtHours(h: number) {
  if (h === 0) return '0h';
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
    <div className="sb-grid border border-ink/20 p-4 shadow-lg min-w-[148px] -rotate-1">
      <p className="font-note text-base text-ink-soft mb-2">{label}</p>
      <div className="space-y-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-ink-soft">Hours</p>
          <p className="text-xl font-bold text-ink tabular-nums">
            {fmtHours(hours)}
          </p>
        </div>
        {revenue > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-ink-soft">Earned</p>
            <p className="text-xl font-bold text-moss tabular-nums">
              ${revenue.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WeeklyChart({ data, todayIndex = -1 }: WeeklyChartProps) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 4, left: -28, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid
            strokeDasharray="2 5"
            stroke="rgba(31, 27, 22, 0.2)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            axisLine={{ stroke: INK, strokeWidth: 1.5 }}
            tickLine={false}
            tick={{ fill: INK_SOFT, fontSize: 11, fontWeight: 700 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: INK_SOFT, fontSize: 11, fontWeight: 700 }}
            tickFormatter={(v) => v === 0 ? '' : `${v}h`}
            width={36}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(31, 27, 22, 0.05)' } as any}
          />
          <Bar dataKey="hours" radius={[2, 2, 0, 0]} maxBarSize={48} stroke={INK} strokeWidth={1.5} animationBegin={0} animationDuration={600} animationEasing="ease-out">
            {data.map((entry, i) => {
              const isToday   = i === todayIndex;
              const hasHours  = entry.hours > 0;
              let fill: string;
              if (!hasHours)      fill = 'transparent';
              else if (isToday)   fill = '#B4472E';
              else                fill = INK;
              return <Cell key={`cell-${i}`} fill={fill} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
