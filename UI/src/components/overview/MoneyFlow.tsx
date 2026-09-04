import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import { Panel, PanelHeader } from '../ui/Panel';
import { formatINR } from '../../utils/format';

interface Stage {
  id: string;
  label: string;
  sub: string;
  amount: number;
  count: string;
  state: 'ok' | 'stuck' | 'variance';
}

interface Hop {
  delta: number;
  label: string;
  state: 'ok' | 'stuck' | 'variance';
}

const stages: Stage[] = [
{ id: 'processor', label: 'Razorpay', sub: 'Captures confirmed', amount: 482430, count: '1,420 transactions · 10:31 AM', state: 'ok' },
{ id: 'settlement', label: 'Settlement', sub: 'Batch SET_104821', amount: 482430, count: '1 batch generated · 11:02 AM', state: 'ok' },
{ id: 'bank', label: 'Bank Credit', sub: 'HDFC Bank · MT940', amount: 478700, count: 'Credited 31 Aug · UTR_9921', state: 'variance' },
{ id: 'ledger', label: 'Ledger Entry', sub: 'Tally Prime', amount: 478700, count: 'Pending authorisation', state: 'stuck' }];


const hops: Hop[] = [
{ delta: 0, label: 'Batch matched 100%', state: 'ok' },
{ delta: -3730, label: '⚠ Fee Variance (-₹3,730)', state: 'variance' },
{ delta: -248000, label: '⚠ Awaiting Journal Approval', state: 'stuck' }];


const STATE_STYLE = {
  ok: { rule: 'bg-pos shadow-[0_0_8px_rgba(34,197,94,0.5)]', text: 'text-pos', chip: 'border-pos-line/50 bg-pos-soft text-pos' },
  stuck: { rule: 'bg-warn shadow-[0_0_12px_rgba(245,158,11,0.5)]', text: 'text-warn', chip: 'border-warn-line/50 bg-warn-soft text-warn font-semibold' },
  variance: { rule: 'bg-crit shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse', text: 'text-crit', chip: 'border-crit-line/60 bg-crit-soft text-crit font-bold' }
};

export function MoneyFlow() {
  return (
    <Panel className="bg-surface shadow-panel border-line rounded-md">
      <PanelHeader
        eyebrow="Money flow lineage"
        title="Razorpay → Settlement → Bank → Ledger"
        subtitle="End-to-end rupee tracking. Visual interruptions highlight exact breakdown points."
        right={
        <Link
          to="/explorer"
          className="inline-flex items-center gap-1 font-mono text-2xs uppercase tracking-label text-cyan-400 transition-colors duration-150 ease-out hover:text-white">
          
            Full Lineage Graph
            <ChevronRightIcon className="h-3 w-3" aria-hidden />
          </Link>
        } />
      
      <div className="px-5 py-6">
        <ol className="grid grid-cols-1 gap-y-6 lg:grid-cols-[repeat(4,minmax(0,1fr))] lg:gap-y-0 relative">
          <div className="hidden lg:block absolute top-[1px] left-0 right-5 h-[2px] bg-line" aria-hidden />
          
          {stages.map((stage, i) => {
            const style = STATE_STYLE[stage.state];
            const hop = hops[i];
            return (
              <li key={stage.id} className="relative lg:pr-5">
                <div className={`h-[3px] w-full rounded-full ${style.rule} relative z-10`} aria-hidden />
                <div className="pt-3">
                  <div className="font-mono text-2xs uppercase tracking-label text-ink-400 font-semibold">
                    Stage {i + 1}
                  </div>
                  <div className="mt-1.5 text-[14px] font-bold text-white">{stage.label}</div>
                  <div className="text-xs text-ink-400 font-medium">{stage.sub}</div>
                  <div className="tnum mt-3 font-mono text-[20px] font-bold text-white">
                    {formatINR(stage.amount)}
                  </div>
                  <div className="tnum mt-1 font-mono text-2xs text-ink-400">{stage.count}</div>
                </div>
                {hop && hop.delta !== 0 ?
                <div className="mt-3 flex items-center gap-2 lg:absolute lg:-right-3 lg:top-[44px] lg:mt-0 lg:block z-20">
                    <span
                    className={`tnum inline-flex items-center rounded border px-2 py-0.5 font-mono text-2xs ${STATE_STYLE[hop.state].chip}`}>
                    
                      {hop.label}
                    </span>
                  </div> :
                null}
              </li>);

          })}
        </ol>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-4">
          <Legend tone="text-pos" label="Flow reconciled" />
          <Legend tone="text-warn" label="Pending authorisation" />
          <Legend tone="text-crit" label="Variance interrupted" />
          <Link
            to="/reconciliation?variance=1"
            className="ml-auto font-mono text-2xs uppercase tracking-label text-cyan-400 transition-colors duration-150 ease-out hover:text-white">
            
            Inspect active break · SET_104821 (-₹3,730)
          </Link>
        </div>
      </div>
    </Panel>);

}

function Legend({ tone, label }: {tone: string;label: string;}) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-ink-400 font-medium">
      <span className={`h-1.5 w-1.5 rounded-full ${tone.replace('text-', 'bg-')} shadow-[0_0_6px_currentColor]`} aria-hidden />
      {label}
    </span>);

}