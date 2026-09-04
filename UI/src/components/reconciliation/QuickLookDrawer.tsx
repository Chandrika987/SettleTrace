import { useNavigate } from 'react-router-dom';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Amount } from '../ui/Amount';
import { ConfidenceMeter } from '../ui/Confidence';
import { SeverityBadge, StatusBadge, Tag } from '../ui/StatusBadge';
import { getInvestigationSync as getInvestigation } from '../../services/investigationService';
import { formatDate, formatINR } from '../../utils/format';
import type { Settlement } from '../../types';

interface QuickLookDrawerProps {
  settlement: Settlement | null;
  onClose: () => void;
}

export function QuickLookDrawer({ settlement, onClose }: QuickLookDrawerProps) {
  const navigate = useNavigate();
  const inv = settlement ? getInvestigation(settlement.id) : undefined;

  return (
    <Drawer
      open={Boolean(settlement && inv)}
      onClose={onClose}
      width="max-w-xl"
      eyebrow="Quick look"
      title={settlement ? `${settlement.id} · ${settlement.merchant}` : ''}
      footer={
      settlement ?
      <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-2xs uppercase tracking-label text-ink-400">
              Full evidence, timeline and approval live in the workspace
            </span>
            <div className="flex items-center gap-2">
              <Button size="md" onClick={onClose}>
                Close
              </Button>
              <Button
            size="md"
            variant="primary"
            onClick={() => navigate(`/investigation/${settlement.id}`)}>
            
                Open investigation
              </Button>
            </div>
          </div> :
      null
      }>
      
      {settlement && inv ?
      <div className="divide-y divide-hairline">
          <div className="flex flex-wrap items-center gap-2 px-5 py-3.5">
            <StatusBadge status={settlement.status} />
            <SeverityBadge severity={settlement.severity} />
            <Tag tone={settlement.category === 'unknown' ? 'warn' : 'neutral'}>
              {inv.categoryLabel}
            </Tag>
            <span className="tnum ml-auto font-mono text-2xs uppercase tracking-label text-ink-400">
              {formatDate(settlement.date)} · {settlement.processor}
            </span>
          </div>

          <div className="grid grid-cols-3 divide-x divide-hairline">
            <Cell label="Expected" value={formatINR(settlement.expected)} />
            <Cell
            label="Bank amount"
            value={settlement.received === 0 ? 'not credited' : formatINR(settlement.received)} />
          
            <div className="bg-crit-soft/50 px-4 py-3">
              <div className="font-mono text-2xs uppercase tracking-label text-crit">Variance</div>
              <Amount
              value={settlement.variance}
              variance
              className="mt-1.5 block text-base font-semibold" />
            
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="font-mono text-2xs uppercase tracking-label text-ink-400">Finding</div>
            <p className="mt-1.5 text-[13px] leading-5 text-ink-900">{inv.finding}</p>
            <div className="mt-3 font-mono text-2xs uppercase tracking-label text-ink-400">
              Probable cause
            </div>
            <p className="mt-1 text-[13px] font-medium leading-5 text-ink-900">
              {inv.probableCause}
            </p>
          </div>

          <div className="px-5 py-4">
            <ConfidenceMeter
            value={inv.confidence}
            caption={`${inv.evidence.length} evidence items · recommended action: ${inv.recommendedAction.toLowerCase()}`} />
          
          </div>

          <ul className="px-5 py-4">
            {inv.evidence.slice(0, 4).map((e) =>
          <li key={e.label} className="flex items-baseline justify-between gap-4 py-1.5">
                <span className="text-xs text-ink-500">{e.label}</span>
                <span className="tnum text-right font-mono text-xs text-ink-900">{e.value}</span>
              </li>
          )}
          </ul>
        </div> :
      null}
    </Drawer>);

}

function Cell({ label, value }: {label: string;value: string;}) {
  return (
    <div className="px-4 py-3">
      <div className="font-mono text-2xs uppercase tracking-label text-ink-400">{label}</div>
      <div className="tnum mt-1.5 font-mono text-base font-semibold text-ink-900">{value}</div>
    </div>);

}