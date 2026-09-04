import { Link } from 'react-router-dom';
import { Panel, PanelHeader } from '../ui/Panel';
import { formatINR } from '../../utils/format';

const rows = [
{ label: 'Auto-resolved by evidence', count: 41, tone: 'bg-pos', text: 'text-pos' },
{ label: 'Proposal drafted · awaiting human', count: 9, tone: 'bg-accent', text: 'text-accent-600' },
{ label: 'Escalated · insufficient evidence', count: 3, tone: 'bg-warn', text: 'text-warn' }];


export function InvestigationQueue() {
  const total = rows.reduce((a, r) => a + r.count, 0);
  return (
    <Panel className="flex h-full flex-col">
      <PanelHeader
        eyebrow="AI investigation queue"
        title="Machine work vs. human authority"
        subtitle="Last 24 hours of automated investigations." />
      
      <div className="px-4 py-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="tnum font-mono text-3xl font-semibold leading-none text-ink-900">
              {total}
            </div>
            <div className="mt-1.5 font-mono text-2xs uppercase tracking-label text-ink-400">
              cases investigated
            </div>
          </div>
          <div className="text-right">
            <div className="tnum font-mono text-xl font-semibold leading-none text-pos">77.4%</div>
            <div className="mt-1.5 font-mono text-2xs uppercase tracking-label text-ink-400">
              closed without a human
            </div>
          </div>
        </div>

        <ul className="mt-4 space-y-2.5">
          {rows.map((r) =>
          <li key={r.label}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-ink-600">{r.label}</span>
                <span className={`tnum font-mono text-xs font-medium ${r.text}`}>{r.count}</span>
              </div>
              <div className="mt-1 h-1.5 w-full bg-hairline">
                <div
                className={`h-full ${r.tone} transition-[width] duration-300 ease-out`}
                style={{ width: `${r.count / total * 100}%`, opacity: 0.9 }} />
              
              </div>
            </li>
          )}
        </ul>
      </div>

      <div className="mt-auto border-t border-hairline px-4 py-3">
        <p className="text-xs leading-5 text-ink-500">
          Humans authorised{' '}
          <span className="tnum font-mono text-ink-800">{formatINR(184620)}</span> of adjustments
          today. Nothing posts to the ledger without a named approver.
        </p>
        <Link
          to="/approvals"
          className="mt-2 inline-flex font-mono text-2xs uppercase tracking-label text-accent-600 transition-colors duration-150 ease-out hover:text-accent">
          
          Open approval queue →
        </Link>
      </div>
    </Panel>);

}