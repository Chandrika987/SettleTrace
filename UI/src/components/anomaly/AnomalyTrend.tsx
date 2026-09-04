import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Panel, PanelHeader } from '../ui/Panel';
import { anomalyTrend } from '../../services/analyticsService';

const SERIES = [
  { key: 'fee', label: 'Fee variance', color: '#22D3EE' },
  { key: 'timing', label: 'Timing', color: '#F59E0B' },
  { key: 'refund', label: 'Refund', color: '#22C55E' },
  { key: 'chargeback', label: 'Chargeback', color: '#818CF8' },
  { key: 'missing', label: 'Missing', color: '#EF4444' },
  { key: 'unknown', label: 'Unknown', color: '#64748B' }
];

export function AnomalyTrend() {
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('30D');

  const filteredData = range === '7D' ? anomalyTrend.slice(-7) : anomalyTrend;

  return (
    <Panel className="flex h-full flex-col bg-surface border-line shadow-panel rounded-md">
      <PanelHeader
        eyebrow="DETECTION TREND"
        title="Anomalies Detected Over Time"
        subtitle="Stacked detection breakdown by root cause category."
        right={
          <div className="inline-flex rounded-sm border border-line bg-canvas p-0.5 font-mono text-2xs">
            {(['7D', '30D', '90D'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-2 py-0.5 font-semibold rounded-sm transition-all ${
                  range === r
                    ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
                    : 'text-ink-400 hover:text-white'
                }`}>
                {r}
              </button>
            ))}
          </div>
        } />
      
      <div className="flex-1 px-2 py-3">
        <div className="h-[268px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData} margin={{ top: 4, right: 10, left: -22, bottom: 0 }} barCategoryGap="24%">
              <CartesianGrid stroke="#263247" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#263247' }}
                tickLine={false}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={44} />
              
              <YAxis
                tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                width={44} />
              
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{
                  backgroundColor: '#0F1726',
                  border: '1px solid #263247',
                  borderRadius: 6,
                  fontSize: 12,
                  fontFamily: 'JetBrains Mono',
                  color: '#F4F7FB',
                  boxShadow: '0 12px 30px -5px rgba(0,0,0,0.8)'
                }} />
              
              <Legend
                verticalAlign="top"
                align="left"
                height={28}
                iconType="square"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#94A3B8', paddingLeft: 32 }} />
              
              {SERIES.map((s) =>
              <Bar key={s.key} dataKey={s.key} name={s.label} stackId="a" fill={s.color} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Panel>);

}