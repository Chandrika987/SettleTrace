import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { CategoryBoard } from '../components/anomaly/CategoryBoard';
import { AnomalyTrend } from '../components/anomaly/AnomalyTrend';
import { RiskMatrix } from '../components/anomaly/RiskMatrix';
import { useRecon } from '../contexts/ReconContext';
import { formatCompactINR, formatINR } from '../utils/format';

export function AnomalyIntelligence() {
  const { settlements } = useRecon();
  const navigate = useNavigate();
  const open = settlements.filter((s) => s.status === 'anomaly' || s.status === 'investigating');
  const exposure = open.reduce((a, s) => a + Math.abs(s.variance), 0);
  const unattributed = open.filter((s) => s.category === 'unknown');
  const highConfidence = open.filter((s) => s.confidence >= 90);

  return (
    <div>
      <PageHeader
        eyebrow="ANOMALY INTELLIGENCE"
        title="Where the money doesn't behave as expected."
        subtitle="Automatic detection and evidence-backed attribution. High-impact / low-confidence cases stand out for human investigation."
        right={
        <>
            <Button onClick={() => navigate('/reconciliation?variance=1')}>
              View in reconciliation
            </Button>
            <Button variant="primary" onClick={() => navigate('/approvals')}>
              Approval queue
            </Button>
          </>
        }>
        
        <div className="grid grid-cols-2 divide-x divide-line border border-line bg-surface/50 lg:grid-cols-4 rounded-md overflow-hidden">
          <Metric label="Exposure under review" value={formatCompactINR(exposure)} tone="text-red-400" />
          <Metric
            label="Largest single variance"
            value={formatINR(open.reduce((a, s) => Math.max(a, Math.abs(s.variance)), 0))}
            tone="text-red-400" />
          
          <Metric
            label="Unattributed cause"
            value={`${unattributed.length} cases · ${formatCompactINR(
              unattributed.reduce((a, s) => a + Math.abs(s.variance), 0)
            )}`}
            tone="text-amber-400" />
          
          <Metric
            label="Ready to auto-propose"
            value={`${highConfidence.length} cases ≥ 90%`}
            tone="text-emerald-400" />
          
        </div>
      </PageHeader>

      <div className="space-y-4 px-5 py-5 lg:px-7 lg:py-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <AnomalyTrend />
          <RiskMatrix rows={open} />
        </div>
        <CategoryBoard rows={open} />
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