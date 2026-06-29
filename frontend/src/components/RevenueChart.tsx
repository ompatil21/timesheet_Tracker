'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// Each slot carries both the Recharts SVG fill and the equivalent Tailwind classes
const PALETTE = [
  { fill: '#C8F135', dot: 'bg-[#C8F135]', text: 'text-[#C8F135]' },
  { fill: '#38BDF8', dot: 'bg-[#38BDF8]', text: 'text-[#38BDF8]' },
  { fill: '#FB923C', dot: 'bg-[#FB923C]', text: 'text-[#FB923C]' },
  { fill: '#A78BFA', dot: 'bg-[#A78BFA]', text: 'text-[#A78BFA]' },
  { fill: '#F472B6', dot: 'bg-[#F472B6]', text: 'text-[#F472B6]' },
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
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-xl p-4 shadow-2xl min-w-[160px]">
      <div className="flex items-center gap-2 mb-3">
        <span className={`h-2 w-2 rounded-full shrink-0 ${entry.dot}`} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A5A] truncate">{entry.name}</p>
      </div>
      <p className={`font-heading text-xl font-black tabular-nums ${entry.text}`}>
        ${entry.value.toFixed(2)}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A5A] mt-1">
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
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#3A3A3A]">No revenue data</p>
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
              stroke="none"
              animationBegin={0}
              animationDuration={700}
              animationEasing="ease-out"
            >
              {colored.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={(props: any) => <CustomTooltip {...props} total={total} />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Centre label — absolutely positioned over the donut hole */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A5A]">Total</p>
          <p className="font-heading text-xl font-black tabular-nums text-[#F5F2EB] mt-0.5">
            ${total.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 px-1">
        {colored.map((entry) => {
          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
          return (
            <div key={entry.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`h-2 w-2 rounded-full shrink-0 ${entry.dot}`} />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#5A5A5A] truncate">
                  {entry.name}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] font-bold tabular-nums text-[#5A5A5A]">{pct}%</span>
                <span className={`text-[11px] font-bold tabular-nums ${entry.text}`}>
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
