import { useNavigate } from 'react-router-dom';
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis } from
'recharts';
import { Panel, PanelHeader } from '../ui/Panel';
import { formatCompactINR } from '../../utils/format';
import type { Settlement } from '../../types';
import { CATEGORY_LABEL } from '../../data/taxonomy';

interface Point {
  x: number;
  y: number;
  id: string;
  merchant: string;
  category: string;
  impact: number;
}

export function RiskMatrix({ rows }: {rows: Settlement[];}) {
  const navigate = useNavigate();

  const points: Point[] = rows.map((s) => ({
    x: Math.max(Math.abs(s.variance), 500),
    y: s.confidence,
    id: s.id,
    merchant: s.merchant,
    category: CATEGORY_LABEL[s.category],
    impact: Math.abs(s.variance)
  }));

  const buckets = [
  { name: 'High Impact / Low Confidence (Human Action Required)', color: '#ef4444', filter: (p: Point) => p.x >= 50000 && p.y < 75 },
  { name: 'High Impact / High Confidence (Auto-Propose)', color: '#f59e0b', filter: (p: Point) => p.x >= 50000 && p.y >= 75 },
  { name: 'Low Impact / Low Confidence (Human Audit)', color: '#818cf8', filter: (p: Point) => p.x < 50000 && p.y < 75 },
  { name: 'Low Impact / High Confidence (Auto-Resolved)', color: '#22c55e', filter: (p: Point) => p.x < 50000 && p.y >= 75 }];


  return (
    <Panel className="flex h-full flex-col bg-surface border-line shadow-panel rounded-md overflow-hidden">
      <PanelHeader
        eyebrow="FINANCIAL RISK RADAR"
        title="Financial Impact vs AI Confidence Matrix"
        subtitle="X-axis: Rupee Impact · Y-axis: Confidence %. High-impact / low-confidence cases require human investigation." />
      
      <div className="flex-1 px-3 py-4 relative">
        <div className="h-[280px] relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 14, left: 4, bottom: 6 }}>
              <CartesianGrid stroke="#263247" strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name="Financial Impact"
                scale="log"
                domain={[500, 500000]}
                tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#263247' }}
                tickLine={false}
                tickFormatter={(v: number) => formatCompactINR(v)}
                label={{
                  value: 'FINANCIAL IMPACT (₹)',
                  position: 'insideBottomRight',
                  offset: -2,
                  style: { fill: '#64748B', fontSize: 9, fontFamily: 'JetBrains Mono', letterSpacing: '0.06em' }
                }} />
              
              <YAxis
                type="number"
                dataKey="y"
                name="Confidence"
                domain={[50, 100]}
                tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(v: number) => `${v}%`}
                label={{
                  value: 'CONFIDENCE',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: '#64748B', fontSize: 9, fontFamily: 'JetBrains Mono', letterSpacing: '0.06em' }
                }} />
              
              <ZAxis range={[120, 320]} dataKey="impact" />
              <ReferenceLine x={50000} stroke="#22D3EE" strokeDasharray="4 4" strokeOpacity={0.4} />
              <ReferenceLine y={75} stroke="#22D3EE" strokeDasharray="4 4" strokeOpacity={0.4} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3', stroke: '#64748B' }}
                contentStyle={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}
                content={({ payload }) => {
                  const p = payload?.[0]?.payload as Point | undefined;
                  if (!p) return null;
                  return (
                    <div className="border border-line bg-surface-elevated px-4 py-3 shadow-pop rounded-md relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400" />
                      <div className="tnum font-mono text-[13px] font-bold text-white pl-2">{p.id}</div>
                      <div className="mt-1 text-xs text-ink-300 pl-2">
                        {p.merchant} · {p.category}
                      </div>
                      <div className="tnum mt-1.5 font-mono text-xs text-red-400 pl-2 font-semibold">
                        {formatCompactINR(p.impact)} impact · {p.y}% confidence
                      </div>
                      <div className="mt-2 font-mono text-2xs uppercase tracking-label text-cyan-400 pl-2 flex items-center gap-1">
                        Click to open investigation →
                      </div>
                    </div>);

                }} />
              
              {buckets.map((b) =>
              <Scatter
                key={b.name}
                name={b.name}
                data={points.filter(b.filter)}
                fill={b.color}
                fillOpacity={0.9}
                shape="circle"
                onClick={(p: unknown) => {
                  const point = (p as {payload?: Point;})?.payload;
                  if (point) navigate(`/investigation/${point.id}`);
                }}
                className="cursor-pointer transition-all hover:scale-125" />

              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line bg-surface-sub/30 px-5 py-3.5">
        {buckets.map((b) =>
        <div key={b.name} className="flex items-center gap-2 text-xs leading-4 text-ink-300 font-medium">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: b.color }} aria-hidden />
            {b.name}
          </div>
        )}
      </div>
    </Panel>);

}