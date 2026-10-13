'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// Each slot carries both the Recharts SVG fill and the equivalent Tailwind classes
const PALETTE = [
  { fill: '#1F1B16', dot: 'bg-[#1F1B16]', text: 'text-[#1F1B16]' },
  { fill: '#B4472E', dot: 'bg-[#B4472E]', text: 'text-[#B4472E]' },
  { fill: '#5F6B3A', dot: 'bg-[#5F6B3A]', text: 'text-[#5F6B3A]' },
  { fill: '#CFA77F', dot: 'bg-[#CFA77F]', text: 'text-[#8A6A45]' },
  { fill: '#E5A4C3', dot: 'bg-[#E5A4C3]', text: 'text-[#A8527C]' },
] as const;

interface Datum {
  name: string;
  value: number;
  fill: string;
  dot: string;
  text: string;
}

function withPalette(data: { name: string; value: number }[]): Datum[] {
  return data.map((d, i) => ({ ...d, ...PALETTE[i % PALETTE.length] }));
}

function CustomTooltip({ active, payload, total }: any) {
  if (!active || !payload?.length) return null;
  const entry: Datum = payload[0]?.payload;
  const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';

  return (
    <div className="sb-grid border border-ink/20 p-4 shadow-lg min-w-[160px] rotate-1">
      <div className="flex items-center gap-2 mb-2">
        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${entry.dot}`} />
        <p className="font-note text-base text-ink-soft truncate">{entry.name}</p>
      </div>
      <p className={`text-xl font-bold tabular-nums ${entry.text}`}>
        ${entry.value.toFixed(2)}
      </p>
      <p className="text-[11px] font-bold uppercase tracking-widest text-ink-soft mt-1">
        {pct}% of total
      </p>
    </div>
  );
}

export default function RevenueChart({ data }: { data: { name: string; value: number }[] }) {
  const total   = data.reduce((s, d) => s + d.value, 0);
  const colored = withPalette(data);

  if (data.length === 0) {
    return (
      <div className="h-52 flex items-center justify-center">
        <p className="font-hand text-3xl text-ink-faint -rotate-2">nothing earned yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Donut + centre label */}
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={colored}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={colored.length > 1 ? 3 : 0}
              dataKey="value"
              stroke="#FAF8F2"
              strokeWidth={2}
              animationBegin={0}
              animationDuration={700}
              animationEasing="ease-out"
            >
              {colored.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.fill} />
              ))}
            </Pie>
            {/* zIndex keeps the tooltip above the centre label overlaid on the donut */}
            <Tooltip wrapperStyle={{ zIndex: 20 }} content={(props: any) => <CustomTooltip {...props} total={total} />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Centre label, absolutely positioned over the donut hole */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="font-note text-base text-ink-soft">Total</p>
          <p className="text-lg font-bold tabular-nums text-ink">
            ${total.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1 px-1">
        {colored.map((entry) => {
          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
          return (
            <div key={entry.name} className="flex items-center justify-between gap-3 border-b border-dashed border-ink/20 py-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${entry.dot}`} />
                <span className="font-note text-lg text-ink truncate">
                  {entry.name}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-xs font-bold tabular-nums">
                <span className="text-ink-soft">{pct}%</span>
                <span className={entry.text}>
                  ${entry.value.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
