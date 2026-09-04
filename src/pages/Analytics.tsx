import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { twMerge } from 'tailwind-merge';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel, PanelHeader } from '../components/ui/Panel';
import {
  analyticsKpis,
  getAnalyticsData,
  merchantExposure,
  reconciliationRate,
  recoveryImpact,
  resolutionTime
} from '../services/analyticsService';
import { formatCompactINR } from '../utils/format';

type AnalyticsKpi = (typeof analyticsKpis)[number];
type MerchantExposure = (typeof merchantExposure)[number];
type RecoveryImpact = (typeof recoveryImpact)[number];
type ReconciliationRatePoint = (typeof reconciliationRate)[number];
type ResolutionTimeBucket = (typeof resolutionTime)[number];

const RANGES = ['7 days', '14 days', '30 days', '90 days'];

const tooltipStyle = {
  backgroundColor: '#0F172A',
  border: '1px solid #334155',
  borderRadius: 6,
  fontSize: 12,
  fontFamily: 'JetBrains Mono',
  color: '#F8FAFC',
  boxShadow: '0 12px 30px -5px rgba(0,0,0,0.8)'
};

const axisTick = { fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' };

export function Analytics() {
  const [range, setRange] = useState('14 days');
  const [kpis, setKpis] = useState<AnalyticsKpi[]>([]);
  const [exposure, setExposure] = useState<MerchantExposure[]>([]);
  const [impact, setImpact] = useState<RecoveryImpact[]>([]);
  const [reconRate, setReconRate] = useState<ReconciliationRatePoint[]>([]);
  const [resolutionTime, setResolutionTime] = useState<ResolutionTimeBucket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getAnalyticsData().then((data) => {
      if (!isMounted) return;
      setKpis(data.analyticsKpis);
      setExposure(data.merchantExposure);
      setImpact(data.recoveryImpact);
      setReconRate(data.reconciliationRate);
      setResolutionTime(data.resolutionTime);
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="px-5 py-6 lg:px-7 font-mono text-xs text-ink-300">
        Loading analytics...
      </div>
    );
  }

  const points = range === '7 days' ? reconRate.slice(-7) : reconRate;

  return (
    <div>
      <PageHeader
        eyebrow="Analytics"
        title="Control effectiveness"
        subtitle="Every chart answers a finance question: are we closing faster, catching more, and recovering money?"
        right={
          <div className="flex border border-line bg-surface rounded-md overflow-hidden" role="group" aria-label="Time range">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                aria-pressed={range === r}
                className={twMerge(
                  'h-7 px-2.5 font-mono text-2xs uppercase tracking-label transition-colors duration-150 ease-out',
                  range === r
                    ? 'bg-brand text-white font-medium'
                    : 'text-ink-400 hover:bg-surface-hover hover:text-white'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-2 divide-x divide-y divide-hairline border border-line bg-canvas/40 sm:grid-cols-3 xl:grid-cols-6 xl:divide-y-0">
          {kpis.map((k) => (
            <div key={k.label} className="px-4 py-3">
              <div className="font-mono text-2xs uppercase tracking-label text-ink-500">
                {k.label}
              </div>
              <div className="tnum mt-1.5 font-mono text-lg font-semibold leading-none text-ink-50">
                {k.value}
              </div>
              <div
                className={twMerge(
                  'tnum mt-1.5 font-mono text-2xs',
                  k.tone === 'pos' ? 'text-emerald-400 font-medium' : 'text-ink-400'
                )}
              >
                {k.delta}
              </div>
              <div className="mt-1 text-2xs leading-4 text-ink-400">{k.note}</div>
            </div>
          ))}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 px-5 py-5 lg:px-7 lg:py-6 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            eyebrow="Throughput"
            title="Are we closing the settlement book without humans?"
            subtitle="Reconciliation rate against the share resolved with no human touch."
          />

          <div className="h-[262px] px-2 py-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 6, right: 14, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" tick={axisTick} axisLine={{ stroke: '#334155' }} tickLine={false} />
                <YAxis
                  domain={[70, 100]}
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  tickFormatter={(v: number) => `${v}%`}
                />

                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
                <Legend
                  verticalAlign="top"
                  align="left"
                  height={26}
                  iconType="plainline"
                  iconSize={14}
                  wrapperStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#94A3B8', paddingLeft: 30 }}
                />

                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Reconciliation rate"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: '#10B981' }}
                />

                <Line
                  type="monotone"
                  dataKey="auto"
                  name="Auto-resolved share"
                  stroke="#0C66E4"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: '#0C66E4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Cycle time"
            title="Where does human review cost us the most time?"
            subtitle="Hours from detection to posted journal, by root cause."
          />

          <div className="h-[262px] px-2 py-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={resolutionTime}
                layout="vertical"
                margin={{ top: 6, right: 20, left: 26, bottom: 0 }}
                barCategoryGap="26%"
              >
                <CartesianGrid stroke="#1E293B" horizontal={false} />
                <XAxis
                  type="number"
                  tick={axisTick}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}h`}
                />

                <YAxis
                  type="category"
                  dataKey="bucket"
                  tick={{ fill: '#CBD5E1', fontSize: 11, fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                  width={106}
                />

                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => `${v} hrs`}
                />

                <Legend
                  verticalAlign="top"
                  align="left"
                  height={26}
                  iconType="square"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#94A3B8', paddingLeft: 132 }}
                />

                <Bar dataKey="ai" name="Machine-resolved" fill="#0C66E4" radius={[0, 2, 2, 0]} />
                <Bar dataKey="human" name="Human-reviewed" fill="#F59E0B" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Recovery"
            title="How much money did reconciliation bring back?"
            subtitle="Recovered adjustments against amounts written off, by month."
          />

          <div className="h-[262px] px-2 py-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={impact} margin={{ top: 6, right: 14, left: 4, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid stroke="#1E293B" vertical={false} />
                <XAxis dataKey="month" tick={axisTick} axisLine={{ stroke: '#334155' }} tickLine={false} />
                <YAxis
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  width={62}
                  tickFormatter={(v: number) => formatCompactINR(v)}
                />

                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => formatCompactINR(v)}
                />

                <Legend
                  verticalAlign="top"
                  align="left"
                  height={26}
                  iconType="square"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#94A3B8', paddingLeft: 46 }}
                />

                <Bar dataKey="recovered" name="Recovered" fill="#10B981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="written" name="Written off" fill="#EF4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Concentration"
            title="Which merchants carry the exposure?"
            subtitle="Open variance by merchant — where to focus the processor conversation."
          />

          <div className="h-[262px] px-2 py-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...exposure].sort((a, b) => b.exposure - a.exposure)}
                layout="vertical"
                margin={{ top: 6, right: 26, left: 20, bottom: 0 }}
                barCategoryGap="24%"
              >
                <CartesianGrid stroke="#1E293B" horizontal={false} />
                <XAxis
                  type="number"
                  tick={axisTick}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                  tickFormatter={(v: number) => formatCompactINR(v)}
                />

                <YAxis
                  type="category"
                  dataKey="merchant"
                  tick={{ fill: '#CBD5E1', fontSize: 11, fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                  width={82}
                />

                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => formatCompactINR(v)}
                />

                <Bar dataKey="exposure" name="Open exposure" radius={[0, 2, 2, 0]}>
                  {exposure.map((m) => (
                    <Cell
                      key={m.merchant}
                      fill={m.exposure > 200000 ? '#EF4444' : m.exposure > 50000 ? '#F59E0B' : '#475569'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="border-t border-hairline px-4 py-3 text-xs leading-5 text-ink-400">
            Two merchants — HomeKart and LoomLane — hold 72% of open exposure. Both settle through
            processors flagged for recurring shortfalls.
          </div>
        </Panel>
      </div>
    </div>
  );
}