import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, GitBranchIcon, ScrollTextIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel, PanelHeader } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/States';
import { SeverityBadge, StatusBadge, Tag } from '../components/ui/StatusBadge';
import { VarianceCompare } from '../components/investigation/VarianceCompare';
import { EventTimeline } from '../components/investigation/EventTimeline';
import { IntelligencePanel } from '../components/investigation/IntelligencePanel';
import { ReconciliationProposal } from '../components/investigation/ReconciliationProposal';
import { useRecon } from '../contexts/ReconContext';
import { getInvestigation } from '../services/investigationService';
import { getMerchants } from '../services/merchantService';
import { formatDate, formatINR } from '../utils/format';
import type { Investigation as InvestigationType, Merchant } from '../types';

export function Investigation() {
  const { settlementId = '' } = useParams();
  const { settlements, audit } = useRecon();
  const navigate = useNavigate();

  const settlement = settlements.find((s) => s.id === settlementId);
  const [inv, setInv] = useState<InvestigationType | undefined>(undefined);
  const [merchant, setMerchant] = useState<Merchant | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getInvestigation(settlementId),
      getMerchants(),
    ]).then(([invData, merchantList]) => {
      if (!isMounted) return;
      setInv(invData);
      if (settlement) {
        setMerchant(merchantList.find((m) => m.id === settlement.merchantId));
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [settlementId, settlement]);

  if (!settlement || (!inv && !loading)) {
    return (
      <div className="px-5 py-6 lg:px-7">
        <Panel>
          <EmptyState
            title="Settlement not found"
            message={`No settlement matches "${settlementId}". It may have been archived, or the identifier is mistyped.`}
            action={{ label: 'Back to reconciliation', onClick: () => navigate('/reconciliation') }}
          />
        </Panel>
      </div>
    );
  }

  if (loading || !inv) {
    return (
      <div className="px-5 py-6 lg:px-7 font-mono text-xs text-ink-300">
        Loading investigation workspace...
      </div>
    );
  }

  const related = audit.filter((a) => a.object.includes(settlement.id)).slice(0, 4);
  const siblings = settlements
    .filter(
      (s) =>
        s.id !== settlement.id &&
        (s.merchant === settlement.merchant || s.category === settlement.category) &&
        s.variance !== 0
    )
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        eyebrow="Settlement investigation"
        title={`Settlement #${settlement.id.replace('_', '-')}`}
        subtitle={`${settlement.merchant} · ${settlement.processor} · settled ${formatDate(
          settlement.date
        )} · batch ${settlement.batch}`}
        right={
          <>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeftIcon className="h-3 w-3" aria-hidden />
              Back
            </Button>
            <Button onClick={() => navigate('/explorer')}>
              <GitBranchIcon className="h-3 w-3" aria-hidden />
              Trace lineage
            </Button>
            <Button variant="primary" onClick={() => navigate('/approvals')}>
              Approval queue
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border border-line bg-canvas/50 px-4 py-3">
          <div>
            <div className="font-mono text-2xs uppercase tracking-label text-ink-400">
              Amount at risk
            </div>
            <div className="tnum mt-1 font-mono text-2xl font-semibold leading-none text-crit">
              {formatINR(inv.impact)}
            </div>
          </div>
          <div className="h-9 w-px bg-line" aria-hidden />
          <div>
            <div className="font-mono text-2xs uppercase tracking-label text-ink-400">Status</div>
            <div className="mt-1.5 flex items-center gap-2">
              <StatusBadge status={settlement.status} />
              <SeverityBadge severity={settlement.severity} />
            </div>
          </div>
          <div className="h-9 w-px bg-line" aria-hidden />
          <div>
            <div className="font-mono text-2xs uppercase tracking-label text-ink-400">
              Classified as
            </div>
            <div className="mt-1.5">
              <Tag tone={settlement.category === 'unknown' ? 'warn' : 'neutral'}>
                {inv.categoryLabel}
              </Tag>
            </div>
          </div>
          <div className="h-9 w-px bg-line" aria-hidden />
          <div>
            <div className="font-mono text-2xs uppercase tracking-label text-ink-400 font-medium">Owner</div>
            <div className="mt-1 text-[13px] text-ink-50 font-medium">
              {settlement.owner ?? 'Unassigned'}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 border border-brand-line bg-brand-soft px-3 py-1.5 rounded-sm">
            <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
            <span className="font-mono text-2xs uppercase tracking-label text-brand font-semibold">
              AI Evidence Verified · Auditable
            </span>
          </div>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 px-5 py-5 lg:px-7 lg:py-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* LEFT: Timeline & Proposal */}
        <div className="space-y-5">
          <EventTimeline events={inv.events} />
          <ReconciliationProposal inv={inv} />
          <Panel>
            <PanelHeader
              eyebrow="Audit"
              title="Actions on this case"
              right={
                <Link
                  to="/audit"
                  className="inline-flex items-center gap-1 font-mono text-2xs uppercase tracking-label text-brand font-medium transition-colors duration-150 ease-out hover:text-white"
                >
                  <ScrollTextIcon className="h-3 w-3" aria-hidden />
                  Full trail
                </Link>
              }
            />
            <ul className="divide-y divide-hairline">
              {related.length ? (
                related.map((a) => (
                  <li key={a.id} className="px-4 py-2.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-xs font-semibold text-ink-50">{a.action}</span>
                      <span className="tnum shrink-0 font-mono text-2xs text-ink-400">
                        {a.timestamp}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-300">
                      {a.actor} · {a.newState}
                    </p>
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-xs text-ink-400">
                  No decisions recorded on this case yet.
                </li>
              )}
            </ul>
          </Panel>
        </div>

        {/* CENTER: Expected vs Received & Metadata */}
        <div className="space-y-5">
          <VarianceCompare settlement={settlement} />
          <Panel>
            <PanelHeader eyebrow="Case facts" title="Settlement metadata" />
            <dl className="grid grid-cols-2 gap-px bg-hairline border-t border-hairline">
              <Fact label="Settlement ID" value={settlement.id} mono />
              <Fact label="Batch" value={settlement.batch} mono />
              <Fact label="Bank reference" value={settlement.utr} mono />
              <Fact label="Bank account" value={settlement.bankAccount} />
              <Fact label="Merchant" value={`${settlement.merchant} · ${settlement.merchantId}`} />
              <Fact label="MCC / GSTIN" value={`${merchant?.mcc ?? '—'} · ${merchant?.gstin ?? '—'}`} mono />
              <Fact label="Transactions" value={settlement.txnCount.toLocaleString('en-IN')} mono />
              <Fact label="Effective fee" value={`${settlement.feePct.toFixed(1)}%`} mono />
            </dl>
          </Panel>
          <Panel>
            <PanelHeader
              eyebrow="Pattern context"
              title="Related open variances"
              subtitle="Same merchant or same root cause."
            />
            <ul className="divide-y divide-hairline">
              {siblings.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/investigation/${s.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 ease-out hover:bg-surface-hover"
                  >
                    <span className="tnum font-mono text-xs text-ink-50 font-medium">{s.id}</span>
                    <span className="truncate text-xs text-ink-300">{s.merchant}</span>
                    <span className="tnum ml-auto font-mono text-xs text-crit font-semibold">
                      {formatINR(s.variance)}
                    </span>
                    <span className="tnum font-mono text-2xs text-ink-400 font-medium">{s.confidence}%</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* RIGHT: AI Investigation Intelligence Panel */}
        <div className="space-y-5 h-full">
          <IntelligencePanel inv={inv} />
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-surface px-4 py-3 flex flex-col justify-center">
      <dt className="font-mono text-2xs uppercase tracking-label text-ink-400 mb-1 font-medium">{label}</dt>
      <dd className={`text-[13px] text-ink-50 ${mono ? 'tnum font-mono' : 'font-semibold'}`}>{value}</dd>
    </div>
  );
}