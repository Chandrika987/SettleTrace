import { useNavigate } from 'react-router-dom';
import { CommandIcon, DownloadIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { HeroSummary } from '../components/overview/HeroSummary';
import { SettlementHealth } from '../components/overview/SettlementHealth';
import { MoneyFlow } from '../components/overview/MoneyFlow';
import { LiveExceptions } from '../components/overview/LiveExceptions';
import { InvestigationQueue } from '../components/overview/InvestigationQueue';
import { useRecon } from '../contexts/ReconContext';
import { computeOverview } from '../utils/metrics';
import { useToast } from '../contexts/ToastContext';

export function Overview() {
  const { settlements, approvals } = useRecon();
  const metrics = computeOverview(settlements, approvals.length);
  const open = settlements.filter((s) => s.status === 'anomaly' || s.status === 'investigating');
  const navigate = useNavigate();
  const { notify } = useToast();

  return (
    <div>
      <PageHeader
        eyebrow="Settlement control center"
        title="Know where every rupee landed."
        subtitle="Reconciliation state, exposure and open investigations across every processor, bank and ledger."
        right={
        <>
            <Button
            onClick={() =>
            notify({
              title: 'Control report queued',
              detail: 'Daily settlement position · PDF + XLSX will land in your inbox.',
              tone: 'info'
            })
            }>
            
              <DownloadIcon className="h-3 w-3" aria-hidden />
              Export position
            </Button>
            <Button variant="primary" onClick={() => navigate('/approvals')}>
              Review {approvals.length} approvals
            </Button>
          </>
        } />
      

      <div className="space-y-4 px-5 py-5 lg:px-7 lg:py-6">
        <HeroSummary m={metrics} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <SettlementHealth m={metrics} />
          <InvestigationQueue />
        </div>

        <MoneyFlow />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <LiveExceptions rows={open} />
          <section className="border border-line bg-surface p-5 shadow-panel rounded-md">
            <div className="font-mono text-2xs uppercase tracking-label text-ink-400 font-medium">
              Financial Intelligence Search
            </div>
            <h2 className="mt-1.5 text-[15px] font-semibold leading-6 text-ink-50">
              Ask the settlement book a question
            </h2>
            <p className="mt-1.5 text-[13px] leading-5 text-ink-300">
              Type a question in plain language. RazorRecon converts it into filters, applies them to
              the ledger and shows the evidence behind every match.
            </p>
            <ul className="mt-4 space-y-2">
              {[
              'Show me all unexplained settlement differences above ₹50,000 this week',
              'Why is settlement SET_104821 different?',
              'HomeKart fee variance this month'].
              map((q) =>
              <li
                key={q}
                onClick={() => navigate('/reconciliation?variance=1')}
                className="rounded-sm border border-line bg-canvas/60 px-3 py-2 font-mono text-xs leading-5 text-ink-200 transition-all cursor-pointer hover:border-brand-line hover:bg-brand-soft/20 hover:text-white">
                
                  {q}
                </li>
              )}
            </ul>
            <div className="mt-5 flex items-center gap-1.5 font-mono text-2xs uppercase tracking-label text-ink-400">
              Press
              <span className="inline-flex items-center gap-0.5 rounded border border-line bg-surface-hover px-1.5 py-0.5 text-ink-200 shadow-sm font-medium">
                <CommandIcon className="h-3 w-3" aria-hidden />K
              </span>
              anywhere to trigger AI search
            </div>
          </section>
        </div>
      </div>
    </div>);

}