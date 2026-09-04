import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileTextIcon, UsersIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { ConfidenceBar } from '../ui/Confidence';
import { SeverityBadge, Tag } from '../ui/StatusBadge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useRecon } from '../../contexts/ReconContext';
import { useToast } from '../../contexts/ToastContext';
import { CATEGORY_LABEL } from '../../data/taxonomy';
import { formatINR, relativeAge } from '../../utils/format';
import type { ApprovalCase } from '../../types';

export function ApprovalRow({ c, index }: {c: ApprovalCase;index: number;}) {
  const navigate = useNavigate();
  const { decide } = useRecon();
  const { notify } = useToast();
  const [confirming, setConfirming] = useState(false);
  const autoEligible = c.confidence >= 75;

  function approve() {
    decide({
      settlementId: c.settlementId,
      decision: 'approved',
      amount: c.amount,
      recommendation: c.recommendedAction
    });
    notify({
      title: `Approved · ${formatINR(c.amount)}`,
      detail: `${c.settlementId} reconciled. Recorded in the audit trail under your name.`
    });
    setConfirming(false);
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.24, delay: Math.min(index * 0.03, 0.12), ease: [0.23, 1, 0.32, 1] }}
      className="grid grid-cols-1 gap-4 border-b border-hairline px-4 py-4 transition-colors duration-150 ease-out hover:bg-canvas/60 lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)_minmax(0,220px)]">
      
      <div>
        <div className="tnum font-mono text-xl font-bold leading-none text-white">
          {formatINR(c.amount)}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <SeverityBadge severity={c.severity} />
          {c.requiresDualApproval ?
          <Tag tone="accent">
              <UsersIcon className="h-3 w-3" aria-hidden />
              Dual approval
            </Tag> :
          null}
        </div>
        <div className="tnum mt-2 font-mono text-2xs uppercase tracking-label text-ink-400 font-medium">
          {c.settlementId} · {c.merchant}
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-semibold text-ink-50">{CATEGORY_LABEL[c.category]}</span>
          <span className="font-mono text-2xs uppercase tracking-label text-ink-400">
            raised by {c.raisedBy}
          </span>
        </div>
        <p className="mt-1.5 text-[13px] leading-5 text-ink-300">
          <span className="font-mono text-2xs uppercase tracking-label text-ink-400 font-medium">
            Recommended
          </span>{' '}
          {c.recommendedAction}
          {!autoEligible ?
          <span className="ml-1.5 text-amber-400 font-medium">— confidence below auto-proposal threshold</span> :
          null}
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <ConfidenceBar value={c.confidence} width="w-20" />
          <span className="inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-label text-ink-400">
            <FileTextIcon className="h-3 w-3" aria-hidden />
            {c.evidenceCount} evidence items
          </span>
          <span className="tnum font-mono text-2xs uppercase tracking-label text-ink-400">
            Age {relativeAge(c.ageHours)}
          </span>
          {c.ageHours > 24 ?
          <Tag tone="crit" mono>
              SLA breached
            </Tag> :
          null}
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-2 lg:justify-end">
        {autoEligible ?
        <Button variant="approve" size="md" onClick={() => setConfirming(true)}>
            Approve
          </Button> :
        null}
        <Button
          size="md"
          variant={autoEligible ? 'secondary' : 'primary'}
          onClick={() => navigate(`/investigation/${c.settlementId}`)}>
          
          {autoEligible ? 'Open case' : 'Investigate'}
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        eyebrow={`${c.settlementId} · ${c.merchant}`}
        title="Authorise this reconciliation"
        confirmLabel="Approve & post journal"
        confirmVariant="approve"
        onCancel={() => setConfirming(false)}
        onConfirm={approve}
        body={
        <>
            <p className="text-ink-300">
              Approving books{' '}
              <span className="tnum font-mono font-semibold text-white">
                {formatINR(c.amount, { decimals: true })}
              </span>{' '}
              as <span className="font-semibold text-white">{c.recommendedAction.toLowerCase()}</span>
              , based on {c.evidenceCount} evidence items at {c.confidence}% confidence.
            </p>
            <ul className="mt-3 space-y-1.5 border-t border-hairline pt-3 text-xs text-ink-400">
              <li>Your name is attached permanently to this decision.</li>
              <li>The entry posts to the accounting ledger on the next hourly sync.</li>
              {c.requiresDualApproval ?
            <li className="text-amber-400 font-medium">A second approver is still required before posting.</li> :
            null}
            </ul>
          </>
        } />
      
    </motion.li>);

}