import { useNavigate } from 'react-router-dom';
import { Panel, PanelHeader } from '../ui/Panel';
import { CATEGORY_LABEL, CATEGORY_ORDER } from '../../data/taxonomy';
import { formatCompactINR } from '../../utils/format';
import type { AnomalyCategory, Settlement } from '../../types';

const CATEGORY_NOTE: Record<AnomalyCategory, string> = {
  fee_variance: 'Effective fee outside the contracted band',
  timing_mismatch: 'Credit expected in a later settlement window',
  missing_settlement: 'Batch generated, no bank credit traced',
  duplicate_transaction: 'Same capture settled more than once',
  refund_mismatch: 'Refund netted at one source only',
  chargeback_mismatch: 'Dispute debit withheld from payout',
  currency_variance: 'FX applied at a different reference rate',
  unknown: 'No cause attributable from available evidence'
};

export function CategoryBoard({ rows }: {rows: Settlement[];}) {
  const navigate = useNavigate();
  const grouped = CATEGORY_ORDER.map((category) => {
    const items = rows.filter((r) => r.category === category);
    return {
      category,
      count: items.length,
      exposure: items.reduce((a, r) => a + Math.abs(r.variance), 0),
      avgConfidence: items.length ?
      Math.round(items.reduce((a, r) => a + r.confidence, 0) / items.length) :
      0
    };
  }).sort((a, b) => b.exposure - a.exposure);

  const max = Math.max(...grouped.map((g) => g.exposure), 1);

  return (
    <Panel>
      <PanelHeader
        eyebrow="Classification"
        title="Anomalies by root-cause category"
        subtitle="Ranked by exposure, not by count — one missing settlement outweighs ten fee rounding breaks." />
      
      <ul className="divide-y divide-hairline">
        {grouped.map((g) => {
          const disabled = g.count === 0;
          return (
            <li key={g.category}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => navigate(`/reconciliation?category=${g.category}&variance=1`)}
                className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 text-left transition-colors duration-150 ease-out hover:bg-canvas disabled:cursor-default disabled:opacity-45 disabled:hover:bg-transparent sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto]">
                
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-ink-50">
                      {CATEGORY_LABEL[g.category]}
                    </span>
                    <span className="tnum font-mono text-xs text-ink-400 font-medium">({g.count})</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink-400">
                    {CATEGORY_NOTE[g.category]}
                  </p>
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                  <div className="h-1.5 flex-1 bg-hairline rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-[width] duration-300 ease-out ${
                      g.category === 'unknown' ? 'bg-amber-400' : 'bg-cyan-400'}`
                      }
                      style={{ width: `${g.exposure / max * 100}%` }} />
                    
                  </div>
                  <span className="tnum w-14 shrink-0 text-right font-mono text-2xs text-ink-400 font-medium">
                    {g.avgConfidence ? `${g.avgConfidence}%` : '—'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="tnum font-mono text-[14px] font-bold text-white">
                    {g.exposure ? formatCompactINR(g.exposure) : '—'}
                  </span>
                  <div className="font-mono text-2xs uppercase tracking-label text-ink-400 transition-colors duration-150 ease-out group-hover:text-cyan-400">
                    {disabled ? 'clear' : 'filter →'}
                  </div>
                </div>
              </button>
            </li>);

        })}
      </ul>
    </Panel>);

}