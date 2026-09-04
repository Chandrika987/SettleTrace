import { AnimatePresence } from 'framer-motion';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel, PanelHeader } from '../components/ui/Panel';
import { EmptyState } from '../components/ui/States';
import { ApprovalRow } from '../components/approvals/ApprovalRow';
import { useRecon } from '../contexts/ReconContext';
import { formatCompactINR, formatINR } from '../utils/format';
import type { ApprovalCase } from '../types';

const GROUPS: {
  id: ApprovalCase['urgency'];
  title: string;
  subtitle: string;
  accent: string;
}[] = [
{
  id: 'breach',
  title: 'CRITICAL — SLA Breached / Dual Approval Required',
  subtitle: 'Open beyond 24h window or above ₹1,00,000 threshold requiring multi-person sign-off.',
  accent: 'bg-red-500'
},
{
  id: 'today',
  title: 'HIGH — Due Today in Settlement Cycle',
  subtitle: 'Generated in current batch cycle with AI drafted journal entry awaiting sign-off.',
  accent: 'bg-amber-500'
},
{
  id: 'this_week',
  title: 'MEDIUM — Standard Approval Queue',
  subtitle: 'Normal priority variances scheduled for review after clearing critical items.',
  accent: 'bg-cyan-400'
}];


export function ApprovalQueue() {
  const { approvals } = useRecon();
  const total = approvals.reduce((a, c) => a + c.amount, 0);
  const dual = approvals.filter((c) => c.requiresDualApproval);
  const lowConfidence = approvals.filter((c) => c.confidence < 75);

  return (
    <div>
      <PageHeader
        eyebrow="Approval queue"
        title="Human authorisation"
        subtitle="The engine proposes entries and shows its evidence. A named person authorises every rupee that moves.">
        
        <div className="grid grid-cols-2 divide-x divide-hairline border border-line bg-canvas/50 lg:grid-cols-4 rounded-md overflow-hidden">
          <Metric label="Awaiting authorisation" value={String(approvals.length)} tone="text-white" />
          <Metric label="Value pending" value={formatCompactINR(total)} tone="text-amber-400" />
          <Metric label="Needs dual approval" value={`${dual.length} cases`} tone="text-brand" />
          <Metric
            label="Below AI threshold"
            value={`${lowConfidence.length} manual`}
            tone="text-red-400" />
          
        </div>
      </PageHeader>

      <div className="space-y-4 px-5 py-5 lg:px-7 lg:py-6">
        {approvals.length === 0 ?
        <Panel>
            <EmptyState
            title="Queue clear"
            message="Every proposed reconciliation has been authorised or returned for investigation. New cases appear here within seconds of detection." />
          
          </Panel> :

        GROUPS.map((g) => {
          const cases = approvals.filter((c) => c.urgency === g.id);
          if (!cases.length) return null;
          const groupValue = cases.reduce((a, c) => a + c.amount, 0);
          return (
            <Panel key={g.id}>
                <div className={`h-[3px] w-full ${g.accent}`} aria-hidden />
                <PanelHeader
                title={g.title}
                subtitle={g.subtitle}
                right={
                <span className="tnum font-mono text-2xs uppercase tracking-label text-ink-300 font-medium">
                      {cases.length} cases · {formatINR(groupValue)}
                    </span>
                } />
              
                <ul>
                  <AnimatePresence initial={false}>
                    {cases.map((c, i) =>
                  <ApprovalRow key={c.id} c={c} index={i} />
                  )}
                  </AnimatePresence>
                </ul>
              </Panel>);

        })
        }
      </div>
    </div>);

}

function Metric({ label, value, tone }: {label: string;value: string;tone: string;}) {
  return (
    <div className="px-4 py-3">
      <div className="font-mono text-2xs uppercase tracking-label text-ink-400 font-medium">{label}</div>
      <div className={`tnum mt-1 font-mono text-[15px] font-semibold ${tone}`}>{value}</div>
    </div>);

}