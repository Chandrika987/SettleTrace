import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2Icon, ShieldAlertIcon } from 'lucide-react';
import { Panel, PanelHeader } from '../ui/Panel';
import { Button } from '../ui/Button';
import { Amount } from '../ui/Amount';
import { Tag } from '../ui/StatusBadge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useRecon, type Decision } from '../../contexts/ReconContext';
import { useToast } from '../../contexts/ToastContext';
import { formatINR } from '../../utils/format';
import type { Investigation } from '../../types';

const DIALOG: Record<Decision, {title: string;confirm: string;variant: 'approve' | 'primary' | 'danger';}> = {
  approved: { title: 'Authorise this reconciliation', confirm: 'Approve & post journal', variant: 'approve' },
  investigating: { title: 'Send for manual investigation', confirm: 'Send for investigation', variant: 'primary' },
  rejected: { title: 'Reject this recommendation', confirm: 'Reject recommendation', variant: 'danger' }
};

export function ReconciliationProposal({ inv }: {inv: Investigation;}) {
  const { decide, decisionFor } = useRecon();
  const { notify } = useToast();
  const [pending, setPending] = useState<Decision | null>(null);
  const decision = decisionFor(inv.settlementId);

  function confirm() {
    if (!pending) return;
    decide({
      settlementId: inv.settlementId,
      decision: pending,
      amount: inv.impact,
      recommendation: inv.recommendedAction
    });
    notify({
      title:
      pending === 'approved' ?
      `Reconciliation approved · ${formatINR(inv.impact)}` :
      pending === 'rejected' ?
      'Recommendation rejected' :
      'Sent for manual investigation',
      detail:
      pending === 'approved' ?
      `Journal posted against ${inv.settlementId}. Entry recorded in the audit trail under your name.` :
      `${inv.settlementId} reassigned. The decision and its reason are recorded in the audit trail.`,
      tone: pending === 'approved' ? 'success' : 'warn'
    });
    setPending(null);
  }

  const locked = Boolean(decision);

  return (
    <Panel className="bg-surface shadow-panel border-line rounded-md">
      <PanelHeader
        eyebrow="RECONCILIATION PROPOSAL"
        title="Draft Journal Entry"
        subtitle="Auto-drafted by AI Engine. Requires explicit human authorization before posting to ledger."
        right={
          <div className="flex items-center gap-2">
            <span className="tnum font-mono text-xs font-bold text-cyan-400 border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 rounded-sm">
              {inv.confidence}% Confidence
            </span>
            {decision === 'approved' ? (
              <Tag tone="pos" dot>Approved · Posted</Tag>
            ) : decision ? (
              <Tag tone="warn" dot>{decision === 'rejected' ? 'Rejected' : 'Under Investigation'}</Tag>
            ) : (
              <Tag tone="warn" dot>Awaiting Approval</Tag>
            )}
          </div>
        } />
      

      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-hairline bg-canvas/60">
            <th scope="col" className="px-4 py-2 text-left font-mono text-2xs uppercase tracking-label text-ink-400">
              Entry
            </th>
            <th scope="col" className="px-4 py-2 text-left font-mono text-2xs uppercase tracking-label text-ink-400">
              Account
            </th>
            <th scope="col" className="px-4 py-2 text-right font-mono text-2xs uppercase tracking-label text-ink-400">
              Debit
            </th>
            <th scope="col" className="px-4 py-2 text-right font-mono text-2xs uppercase tracking-label text-ink-400">
              Credit
            </th>
          </tr>
        </thead>
        <tbody>
          {inv.proposal.map((line) =>
          <tr key={line.account} className="border-b border-hairline hover:bg-surface-hover/50 transition-colors">
              <td className="rr-cell px-4 font-mono text-2xs uppercase tracking-label text-ink-400 font-medium">
                {line.line}
              </td>
              <td className="rr-cell px-4 text-ink-50 font-medium">{line.account}</td>
              <td className="rr-cell px-4 text-right">
                {line.debit ? <Amount value={line.debit} decimals /> : <span className="text-ink-500">—</span>}
              </td>
              <td className="rr-cell px-4 text-right">
                {line.credit ? <Amount value={line.credit} decimals /> : <span className="text-ink-500">—</span>}
              </td>
            </tr>
          )}
          <tr className="bg-surface-hover/80 font-medium">
            <td className="rr-cell px-4 font-mono text-2xs uppercase tracking-label text-ink-300" colSpan={2}>
              Balanced Entry
            </td>
            <td className="rr-cell px-4 text-right">
              <Amount value={inv.impact} decimals className="font-semibold text-white" />
            </td>
            <td className="rr-cell px-4 text-right">
              <Amount value={inv.impact} decimals className="font-semibold text-white" />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 bg-surface/50">
        <div className="flex items-start gap-2 text-xs leading-4 text-ink-400">
          <ShieldAlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
          <span>
            {inv.impact >= 100000 ?
            'Above ₹1,00,000 — dual approval required (Controller + Head of Finance).' :
            'Within your single-approver limit of ₹1,00,000.'}
          </span>
        </div>
        {locked ?
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="inline-flex items-center gap-2 border border-pos-line bg-pos-soft px-3 py-1.5 text-xs text-emerald-400 rounded-sm font-medium">
          
            <CheckCircle2Icon className="h-3.5 w-3.5" aria-hidden />
            Decision recorded by Anusha Rangan · logged to audit trail
          </motion.div> :

        <div className="flex flex-wrap items-center gap-2">
            <Button size="md" variant="approve" onClick={() => setPending('approved')}>
              Approve reconciliation
            </Button>
            <Button size="md" onClick={() => setPending('investigating')}>
              Send for investigation
            </Button>
            <Button size="md" variant="danger" onClick={() => setPending('rejected')}>
              Reject
            </Button>
          </div>
        }
      </div>

      <ConfirmDialog
        open={pending !== null}
        eyebrow={`${inv.settlementId} · ${formatINR(inv.impact)}`}
        title={pending ? DIALOG[pending].title : ''}
        confirmLabel={pending ? DIALOG[pending].confirm : ''}
        confirmVariant={pending ? DIALOG[pending].variant : 'primary'}
        onCancel={() => setPending(null)}
        onConfirm={confirm}
        body={
        pending === 'approved' ?
        <>
              <p className="text-ink-300">
                You are authorising a journal entry of{' '}
                <span className="tnum font-mono font-semibold text-white">
                  {formatINR(inv.impact, { decimals: true })}
                </span>{' '}
                against <span className="font-mono text-white">{inv.settlementId}</span>.
              </p>
              <ul className="mt-3 space-y-1.5 border-t border-hairline pt-3 text-xs text-ink-500">
                <li>Posts to the accounting ledger on the next sync (hourly).</li>
                <li>Recorded immutably in the audit trail under your name.</li>
                <li>Reversal requires a second approver.</li>
              </ul>
            </> :
        pending === 'rejected' ?
        <p>
              The recommendation will be discarded and the anomaly returned to the investigation
              backlog. The engine records the rejection as negative training signal.
            </p> :

        <p>
              The case moves to manual investigation and stays on the approval queue as an open item.
              The drafted entry is retained but will not post.
            </p>

        } />
      
    </Panel>);

}