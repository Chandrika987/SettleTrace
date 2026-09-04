import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from 'lucide-react';
import type { OverviewMetrics } from '../../utils/metrics';
import { formatCompactINR, formatINR, formatPct } from '../../utils/format';

interface Secondary {
  label: string;
  value: string;
  note: string;
  tone: 'neutral' | 'pos' | 'warn' | 'crit';
  to?: string;
}

const TONE_TEXT = {
  neutral: 'text-ink-200',
  pos: 'text-pos',
  warn: 'text-warn',
  crit: 'text-crit'
};

export function HeroSummary({ m }: {m: OverviewMetrics;}) {
  const secondary: Secondary[] = [
  {
    label: 'RECONCILED',
    value: formatCompactINR(m.reconciled),
    note: `${formatPct(m.reconciledPct)} of volume`,
    tone: 'pos',
    to: '/reconciliation?status=reconciled'
  },
  {
    label: 'AT RISK',
    value: formatINR(m.atRisk),
    note: 'net variance under review',
    tone: 'crit',
    to: '/anomalies'
  },
  {
    label: 'PENDING',
    value: formatCompactINR(m.unreconciled),
    note: 'open settlements in cycle',
    tone: 'warn',
    to: '/reconciliation?variance=1'
  },
  {
    label: 'ANOMALIES',
    value: `${m.anomalies} items`,
    note: 'requires human review',
    tone: 'warn',
    to: '/approvals'
  }];


  return (
    <section className="border border-line bg-surface shadow-panel rounded-md overflow-hidden relative">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="rr-grid-bg relative border-b border-line px-5 py-6 lg:border-b-0 lg:border-r lg:px-8 lg:py-8">
          <div className="relative z-10">
            <div className="flex items-center gap-2 font-mono text-2xs uppercase tracking-label text-cyan-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Settlements Monitored
              <span className="h-1 w-1 rounded-full bg-ink-500" aria-hidden />
              30 Aug 2026
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-1">
              <span className="tnum font-mono text-[44px] font-bold leading-none tracking-tight text-white sm:text-[56px]">
                {formatCompactINR(m.volume)}
              </span>
              <span className="inline-flex items-center gap-1 pb-1.5 font-mono text-xs font-semibold text-pos">
                <ArrowUpRightIcon className="h-4 w-4" aria-hidden />
                4.2% vs. prior period
              </span>
            </div>
            <p className="mt-3.5 max-w-md text-[13px] leading-6 text-ink-300">
              {m.settlementCount} settlement batches spanning{' '}
              <span className="tnum font-mono text-white font-semibold">
                {m.txnCount.toLocaleString('en-IN')}
              </span>{' '}
              transactions across 4 processors and 4 bank accounts.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line/60 pt-4">
              <Stat label="Match rate" value="96.9%" />
              <Stat label="Auto-resolved" value="85.4%" />
              <Stat label="Avg. resolution" value="4.2 hrs" />
              <Stat label="Sources live" value="6 / 6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 bg-surface-sub/40">
          {secondary.map((s, i) => {
            const body =
            <>
                <div className="font-mono text-2xs uppercase tracking-label text-ink-400 font-medium">
                  {s.label}
                </div>
                <div
                className={`tnum mt-2 font-mono text-2xl font-bold leading-none sm:text-[28px] ${TONE_TEXT[s.tone]}`}>
                
                  {s.value}
                </div>
                <div className="mt-1.5 text-xs leading-5 text-ink-400">{s.note}</div>
              </>;

            const border = `${i % 2 === 0 ? 'border-r' : ''} ${i < 2 ? 'border-b' : ''} border-line`;
            return s.to ?
            <Link
              key={s.label}
              to={s.to}
              className={`group px-5 py-4 transition-all duration-150 ease-out hover:bg-surface-elevated lg:px-6 lg:py-6 ${border}`}>
              
                {body}
                <span className="mt-3 inline-flex items-center gap-1 font-mono text-2xs uppercase tracking-label text-ink-400 transition-colors duration-150 ease-out group-hover:text-cyan-400">
                  Inspect
                  <ArrowUpRightIcon className="h-3 w-3" aria-hidden />
                </span>
              </Link> :

            <div key={s.label} className={`px-5 py-4 lg:px-6 lg:py-6 ${border}`}>
                {body}
              </div>;

          })}
        </div>
      </div>
    </section>);

}

function Stat({ label, value }: {label: string;value: string;}) {
  return (
    <div>
      <div className="font-mono text-2xs uppercase tracking-label text-ink-400">{label}</div>
      <div className="tnum mt-1 font-mono text-[15px] font-semibold text-white">{value}</div>
    </div>);

}