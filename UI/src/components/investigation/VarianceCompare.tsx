import { MinusIcon } from 'lucide-react';
import { Panel, PanelHeader } from '../ui/Panel';
import { formatINR, formatPct } from '../../utils/format';
import type { Settlement } from '../../types';

export function VarianceCompare({ settlement }: {settlement: Settlement;}) {
  const diff = settlement.expected - settlement.received;
  const pct = diff / settlement.expected * 100;

  return (
    <Panel className="bg-surface shadow-panel border-line rounded-md overflow-hidden">
      <PanelHeader
        eyebrow="DOMINANT FINANCIAL COMPARISON"
        title="Expected Payout vs. Bank Credit"
        subtitle={`Processor settlement batch file compared against ${settlement.bankAccount}.`}
        right={
        <span className="tnum font-mono text-2xs uppercase tracking-label text-ink-400 font-medium">
            {settlement.utr === '—' ? 'No UTR issued' : `UTR ${settlement.utr}`}
          </span>
        } />
      
      <div className="grid grid-cols-1 divide-y divide-line lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)] lg:divide-x lg:divide-y-0">
        <Side
          label="EXPECTED"
          source="Razorpay Settlement File"
          value={settlement.expected}
          note={`${settlement.txnCount.toLocaleString('en-IN')} transactions · fee ${formatPct(
            settlement.feePct
          )}`} />
        
        <Side
          label="RECEIVED"
          source={settlement.bankAccount}
          value={settlement.received}
          note={
          settlement.received === 0 ?
          'No credit traced in bank statement' :
          'Single credit matched by UTR'
          }
          tone="text-white" />
        
        <div className="bg-crit-soft/40 px-6 py-6 border-l-2 border-crit relative overflow-hidden flex flex-col justify-center">
          <div className="flex items-center gap-1.5 font-mono text-2xs uppercase tracking-label text-crit font-bold">
            <MinusIcon className="h-3.5 w-3.5" aria-hidden />
            VARIANCE
          </div>
          <div className="tnum mt-2 font-mono text-[36px] font-bold leading-none text-crit sm:text-[44px] tracking-tight">
            -{formatINR(diff)}
          </div>
          <div className="tnum mt-2 font-mono text-[13px] font-semibold text-crit/90">
            {formatPct(pct, 2)} of expected payout
          </div>
          <div className="mt-3 border-t border-crit-line/40 pt-2.5 text-xs leading-5 text-ink-300 font-medium">
            Amount at risk until authorized by Controller.
          </div>
        </div>
      </div>
    </Panel>);

}

function Side({
  label,
  source,
  value,
  note,
  tone = 'text-white'
}: {label: string;source: string;value: number;note: string;tone?: string;}) {
  return (
    <div className="px-6 py-6 bg-surface-sub/30 flex flex-col justify-center">
      <div className="font-mono text-2xs uppercase tracking-label text-ink-400 font-semibold">{label}</div>
      <div className={`tnum mt-2 font-mono text-[30px] font-bold leading-none sm:text-[36px] ${tone} tracking-tight`}>
        {value === 0 ? '₹0' : formatINR(value)}
      </div>
      <div className="mt-2 text-xs font-semibold text-white">{source}</div>
      <div className="mt-3 border-t border-line/60 pt-2.5 text-xs leading-5 text-ink-400">
        {note}
      </div>
    </div>);
}