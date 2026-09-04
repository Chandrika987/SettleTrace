import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ApprovalCase, AuditEntry, Settlement, SettlementStatus } from '../types';
import { settlements as seedSettlements } from '../data/settlements';
import { approvalCases as seedApprovals } from '../data/approvals';
import { auditTrail as seedAudit } from '../data/audit';
import { setDecisionInStore } from '../services/settlementService';
import { recordAuditEntry } from '../services/auditService';

export type Decision = 'approved' | 'investigating' | 'rejected';

interface ReconApi {
  settlements: Settlement[];
  approvals: ApprovalCase[];
  audit: AuditEntry[];
  decisionFor: (settlementId: string) => Decision | undefined;
  decide: (args: {
    settlementId: string;
    decision: Decision;
    amount: number;
    recommendation: string;
    actor?: string;
  }) => void;
}

const ReconContext = createContext<ReconApi | null>(null);

export function useRecon(): ReconApi {
  const ctx = useContext(ReconContext);
  if (!ctx) throw new Error('useRecon must be used inside ReconProvider');
  return ctx;
}

const STATUS_BY_DECISION: Record<Decision, SettlementStatus> = {
  approved: 'approved',
  investigating: 'investigating',
  rejected: 'investigating'
};

const DECISION_LABEL: Record<Decision, string> = {
  approved: 'Approved reconciliation',
  investigating: 'Sent for investigation',
  rejected: 'Rejected recommendation'
};

let auditSeq = 558300;

export function ReconProvider({ children }: { children: React.ReactNode; }) {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [resolvedApprovals, setResolvedApprovals] = useState<string[]>([]);
  const [extraAudit, setExtraAudit] = useState<AuditEntry[]>([]);

  const decide = useCallback<ReconApi['decide']>(
    ({ settlementId, decision, amount, recommendation, actor = 'Anusha Rangan' }) => {
      setDecisions((prev) => ({ ...prev, [settlementId]: decision }));
      setResolvedApprovals((prev) => [...prev, settlementId]);
      
      // Update central service store for state consistency across non-context queries
      setDecisionInStore(settlementId, decision);

      auditSeq += 1;
      const stamp = new Date();
      const hh = String(stamp.getHours()).padStart(2, '0');
      const mm = String(stamp.getMinutes()).padStart(2, '0');
      const ss = String(stamp.getSeconds()).padStart(2, '0');
      const newAuditItem: AuditEntry = {
        id: `AUD_${auditSeq}`,
        timestamp: `30 Aug 2026 ${hh}:${mm}:${ss}`,
        actor,
        actorType: 'human',
        action: DECISION_LABEL[decision],
        object: settlementId,
        previousState: 'Anomaly — awaiting approval',
        newState:
          decision === 'approved'
            ? 'Approved — journal queued'
            : decision === 'rejected'
            ? 'Rejected — returned to investigation'
            : 'Under manual investigation',
        aiRecommendation: recommendation,
        humanDecision:
          decision === 'approved'
            ? `Approved ₹${amount.toLocaleString('en-IN')}`
            : decision === 'rejected'
            ? 'Rejected — recommendation not accepted'
            : 'Escalated for manual investigation',
        hash: Math.random().toString(16).slice(2, 8) + '…' + Math.random().toString(16).slice(2, 6)
      };

      setExtraAudit((prev) => [newAuditItem, ...prev]);
      recordAuditEntry(newAuditItem);
    },
    []
  );

  const value = useMemo<ReconApi>(() => {
    const merged = seedSettlements.map((s) =>
      decisions[s.id] ? { ...s, status: STATUS_BY_DECISION[decisions[s.id]] } : s
    );
    return {
      settlements: merged,
      approvals: seedApprovals.filter((a) => !resolvedApprovals.includes(a.settlementId)),
      audit: [...extraAudit, ...seedAudit],
      decisionFor: (id: string) => decisions[id],
      decide
    };
  }, [decisions, resolvedApprovals, extraAudit, decide]);

  return <ReconContext.Provider value={value}>{children}</ReconContext.Provider>;
}