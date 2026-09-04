import { useMemo, useState } from 'react';
import { ArrowRightIcon, DownloadIcon, LockIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { FilterBar, type FilterDef } from '../components/ui/FilterBar';
import { ActorTag } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/States';
import { useRecon } from '../contexts/ReconContext';
import { useToast } from '../contexts/ToastContext';

const FILTERS: FilterDef[] = [
{ id: 'actor', label: 'Actor', options: ['All actors', 'AI', 'Human', 'System'] },
{
  id: 'action',
  label: 'Action',
  options: ['All actions', 'Detected', 'Approved', 'Rejected', 'Posted', 'Updated']
},
{ id: 'day', label: 'Date', options: ['All dates', '30 Aug 2026', '29 Aug 2026', '28 Aug 2026'] }];


const DEFAULTS = { actor: 'All actors', action: 'All actions', day: 'All dates' };

export function AuditTrail() {
  const { audit } = useRecon();
  const { notify } = useToast();
  const [filters, setFilters] = useState<Record<string, string>>({ ...DEFAULTS });

  const rows = useMemo(
    () =>
    audit.filter((a) => {
      if (filters.actor !== 'All actors' && a.actorType !== filters.actor.toLowerCase())
      return false;
      if (filters.action !== 'All actions' && !a.action.startsWith(filters.action)) return false;
      if (filters.day !== 'All dates' && !a.timestamp.startsWith(filters.day)) return false;
      return true;
    }),
    [audit, filters]
  );

  return (
    <div>
      <PageHeader
        eyebrow="Audit trail"
        title="Immutable decision record"
        subtitle="Every detection, recommendation and human decision, append-only and hash-chained."
        right={
        <>
            <Button
            onClick={() =>
            notify({
              title: 'Audit export queued',
              detail: 'Signed CSV with hash chain will be available in Downloads.',
              tone: 'info'
            })
            }>
            
              <DownloadIcon className="h-3 w-3" aria-hidden />
              Export signed log
            </Button>
            <span className="inline-flex h-7 items-center gap-1.5 border border-pos-line bg-pos-soft px-2 font-mono text-2xs uppercase tracking-label text-pos">
              <LockIcon className="h-3 w-3" aria-hidden />
              Chain verified · 16:44 IST
            </span>
          </>
        } />
      

      <div className="px-5 py-5 lg:px-7 lg:py-6">
        <Panel>
          <FilterBar
            filters={FILTERS}
            value={filters}
            onChange={(id, next) => setFilters((p) => ({ ...p, [id]: next }))}
            onReset={() => setFilters({ ...DEFAULTS })}
            right={
            <span className="tnum font-mono text-2xs uppercase tracking-label text-ink-400">
                {rows.length} entries · append-only
              </span>
            } />
          

          {rows.length === 0 ?
          <EmptyState
            title="No entries for this filter"
            message="The audit log is append-only — entries are never removed. Widen the filter to see history."
            action={{ label: 'Reset filters', onClick: () => setFilters({ ...DEFAULTS }) }} /> :


          <div className="rr-scroll overflow-x-auto">
              <table className="w-full min-w-[1180px] border-collapse text-[13px]">
                <thead>
                  <tr className="border-b border-line bg-canvas/70">
                    {[
                  'Timestamp',
                  'Actor',
                  'Action',
                  'Object',
                  'State transition',
                  'AI recommendation',
                  'Human decision',
                  'Hash'].
                  map((h) =>
                  <th
                    key={h}
                    scope="col"
                    className="whitespace-nowrap px-4 py-2 text-left font-mono text-2xs font-medium uppercase tracking-label text-ink-400">
                    
                        {h}
                      </th>
                  )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) =>
                <tr key={a.id} className="border-b border-hairline align-top hover:bg-surface-hover/60 transition-colors">
                      <td className="rr-cell tnum whitespace-nowrap px-4 font-mono text-xs text-ink-300">
                        {a.timestamp}
                      </td>
                      <td className="rr-cell px-4">
                        <div className="flex items-center gap-2">
                          <ActorTag type={a.actorType} />
                          <span className="whitespace-nowrap text-xs text-ink-200 font-medium">{a.actor}</span>
                        </div>
                      </td>
                      <td className="rr-cell whitespace-nowrap px-4 text-ink-50 font-medium">{a.action}</td>
                      <td className="rr-cell tnum whitespace-nowrap px-4 font-mono text-xs text-ink-200">
                        {a.object}
                      </td>
                      <td className="rr-cell px-4">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-ink-400">{a.previousState}</span>
                          <ArrowRightIcon className="h-3 w-3 shrink-0 text-brand" aria-hidden />
                          <span className="font-semibold text-white">{a.newState}</span>
                        </div>
                      </td>
                      <td className="rr-cell px-4 text-xs text-ink-300">{a.aiRecommendation}</td>
                      <td className="rr-cell px-4 text-xs">
                        <span
                      className={
                      a.humanDecision === '—' ? 'text-ink-500' : 'font-medium text-white'
                      }>
                      
                          {a.humanDecision}
                        </span>
                      </td>
                      <td className="rr-cell tnum whitespace-nowrap px-4 font-mono text-2xs text-ink-400">
                        {a.hash}
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          }

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line bg-canvas px-4 py-3">
            <span className="font-mono text-2xs uppercase tracking-label text-ink-400">
              Retention · 7 years
            </span>
            <span className="font-mono text-2xs uppercase tracking-label text-ink-400">
              Storage · WORM, append-only
            </span>
            <span className="font-mono text-2xs uppercase tracking-label text-ink-400">
              Hash · SHA-256 chained per entry
            </span>
            <span className="ml-auto font-mono text-2xs uppercase tracking-label text-pos">
              No gaps detected in 14,882 entries
            </span>
          </div>
        </Panel>
      </div>
    </div>);

}