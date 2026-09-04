import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Panel, PanelHeader } from '../ui/Panel';
import { formatCompactINR, formatPct } from '../../utils/format';
import { settlementHealthSeries } from '../../services/analyticsService';
import type { OverviewMetrics } from '../../utils/metrics';

interface Band {
  key: string;
  label: string;
  amount: number;
  pct: number;
  bar: string;
  text: string;
  border: string;
}

export function SettlementHealth({ m }: {m: OverviewMetrics;}) {
  const expected = m.volume;
  const anomalous = m.atRisk;
  const pending = m.unreconciled - m.atRisk;
  const reconciled = expected - m.unreconciled;

  const bands: Band[] = [
  {
    key: 'reconciled',
    label: 'Reconciled',
    amount: reconciled,
    pct: reconciled / expected * 100,
    bar: 'bg-pos',
    text: 'text-pos',
    border: 'border-pos'
  },
  {
    key: 'pending',
    label: 'Pending match',
    amount: pending,
    pct: pending / expected * 100,
    bar: 'bg-warn',
    text: 'text-warn',
    border: 'border-warn'
  },
  {
    key: 'anomalous',
    label: 'Anomalous',
    amount: anomalous,
    pct: anomalous / expected * 100,
    bar: 'bg-crit',
    text: 'text-crit',
    border: 'border-crit'
  }];


  return (
    <Panel className="flex h-full flex-col bg-surface shadow-panel border-line rounded-xl overflow-hidden">
      <PanelHeader
        eyebrow="Settlement health"
        title="Expected vs. settled position"
        subtitle="Composition of today's expected settlement value, by reconciliation state."
        right={
        <span className="tnum font-mono text-2xs uppercase tracking-label text-ink-400">
            Expected {formatCompactINR(expected)}
          </span>
        } />
      

      <div className="px-5 py-5">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-ink-900 border border-line shadow-inner" role="img" aria-label="Settlement composition">
          {bands.map((b) =>
          <div
            key={b.key}
            className={`${b.bar} relative h-full transition-all duration-700 ease-out`}
            style={{ width: `${Math.max(b.pct, 0.6)}%`, boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2)' }}
            title={`${b.label} — ${formatCompactINR(b.amount)}`} />

          )}
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
          {bands.map((b) =>
          <div key={b.key} className={`border-l-2 pl-3 ${b.border}`}>
              <div className={`${b.text} flex items-baseline gap-2`}>
                <dt className="font-mono text-2xs uppercase tracking-label opacity-90">{b.label}</dt>
                <span className="tnum font-mono text-[10px]">{formatPct(b.pct, 2)}</span>
              </div>
              <dd className="tnum mt-1 font-mono text-[17px] font-semibold text-white">
                {formatCompactINR(b.amount)}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="mt-auto border-t border-line bg-ink-900/30 px-3 pb-4 pt-4">
        <div className="px-3 pb-3 font-mono text-2xs uppercase tracking-label text-ink-500">
          Reconciled share · last 7 days
        </div>
        <div className="h-[140px] px-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={settlementHealthSeries} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="reconFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1f2937" vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#1f2937' }}
                tickLine={false} />
              
              <YAxis
                domain={[85, 100]}
                tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={(v: number) => `${v}%`} />
              
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B1020',
                  border: '1px solid #1f2937',
                  borderRadius: 6,
                  fontSize: 12,
                  fontFamily: 'JetBrains Mono',
                  color: '#f3f4f6',
                  boxShadow: '0 12px 40px -8px rgba(0,0,0,0.5)'
                }}
                formatter={(v: number) => [`${v}%`, 'Reconciled']} />
              
              <Area
                type="monotone"
                dataKey="reconciled"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#reconFill)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: '#10b981' }} />
              
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Panel>);

}