import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChevronRightIcon, PlugZapIcon, RefreshCwIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel, PanelHeader } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { ErrorState, InlineSpinner } from '../components/ui/States';
import { Tag } from '../components/ui/StatusBadge';
import { getDataSources, getPipelineStages, type PipelineStage } from '../services/dataSourceService';
import { useToast } from '../contexts/ToastContext';
import { formatPct } from '../utils/format';
import type { DataSource } from '../types';

const STATUS_TAG = {
  connected: { tone: 'pos' as const, label: 'Connected' },
  degraded: { tone: 'warn' as const, label: 'Degraded' },
  error: { tone: 'crit' as const, label: 'Error' },
  syncing: { tone: 'accent' as const, label: 'Syncing' }
};

export function DataSources() {
  const { notify } = useToast();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getDataSources(),
      getPipelineStages(),
    ]).then(([sources, stages]) => {
      if (!isMounted) return;
      setDataSources(sources);
      setPipelineStages(stages);
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  function resync(source: DataSource) {
    setSyncing(source.id);
    window.setTimeout(() => {
      setSyncing(null);
      notify({
        title: `${source.name} re-synced`,
        detail: 'Ingestion completed. Reconciliation will re-run against the refreshed records.'
      });
    }, 1400);
  }

  if (loading) {
    return (
      <div className="px-5 py-6 lg:px-7 font-mono text-xs text-ink-300">
        Loading data sources...
      </div>
    );
  }

  const degraded = dataSources.filter((s) => s.status === 'degraded' || s.status === 'error');

  return (
    <div>
      <PageHeader
        eyebrow="Data sources"
        title="Ingestion & coverage"
        subtitle="Reconciliation is only as trustworthy as its inputs. Coverage shows how much of each source is matched."
        right={
          <Button variant="primary">
            <PlugZapIcon className="h-3 w-3" aria-hidden />
            Connect source
          </Button>
        }
      />

      <div className="space-y-4 px-5 py-5 lg:px-7 lg:py-6">
        {degraded.length ? (
          <ErrorState
            title={`${degraded[0].name} is degraded`}
            message={`Last successful ingestion at ${degraded[0].lastSync}. ${degraded[0].errors} advice rows failed schema validation — 17.7% of this source is currently unmatched.`}
            onRetry={() => resync(degraded[0])}
          />
        ) : null}

        <Panel>
          <PanelHeader
            eyebrow="Pipeline"
            title="Ingest → Normalise → Match → Detect → Propose → Approve"
            subtitle="Volume and health at each stage of the reconciliation pipeline, last 24 hours."
          />

          <div className="rr-scroll overflow-x-auto px-4 py-5">
            <ol className="flex min-w-[820px] items-stretch">
              {pipelineStages.map((stage, i) => (
                <li key={stage.id} className="flex flex-1 items-stretch">
                  {i > 0 ? (
                    <div className="flex w-8 shrink-0 items-center justify-center">
                      <ChevronRightIcon className="h-3.5 w-3.5 text-ink-300" aria-hidden />
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1 border border-line bg-surface px-3 pb-3 pt-0">
                    <span
                      className={twMerge(
                        '-mx-3 mb-2.5 block h-[3px]',
                        stage.status === 'warn' ? 'bg-warn' : 'bg-pos'
                      )}
                      aria-hidden
                    />

                    <div className="font-mono text-2xs uppercase tracking-label text-ink-400 font-medium">
                      Step {i + 1}
                    </div>
                    <div className="mt-1 text-[13px] font-semibold text-ink-50">{stage.label}</div>
                    <div className="mt-0.5 truncate text-xs text-ink-400">{stage.detail}</div>
                    <div className="tnum mt-2 font-mono text-xs text-white font-semibold">{stage.volume}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Panel>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {dataSources.map((s) => {
            const tag = STATUS_TAG[s.status];
            const isSyncing = syncing === s.id || s.status === 'syncing';
            return (
              <Panel key={s.id} className="bg-surface shadow-panel border-line rounded-md">
                <PanelHeader
                  title={s.name}
                  subtitle={s.kind}
                  right={
                    isSyncing ? (
                      <InlineSpinner label="Syncing" />
                    ) : (
                      <Tag tone={tag.tone} dot>
                        {tag.label}
                      </Tag>
                    )
                  }
                />

                <dl className="grid grid-cols-2 divide-x divide-y divide-hairline border-b border-hairline bg-surface-sub/30">
                  <Cell label="Last sync" value={s.lastSync} />
                  <Cell label="Cadence" value={s.cadence} />
                  <Cell label="Records processed" value={s.records.toLocaleString('en-IN')} mono />
                  <Cell
                    label="Errors"
                    value={String(s.errors)}
                    mono
                    tone={s.errors ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}
                  />
                </dl>
                <div className="px-4 py-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-2xs uppercase tracking-label text-ink-400 font-medium">
                      Reconciliation coverage
                    </span>
                    <span
                      className={twMerge(
                        'tnum font-mono text-xs font-semibold',
                        s.coverage >= 95 ? 'text-emerald-400' : s.coverage >= 90 ? 'text-amber-400' : 'text-red-400'
                      )}
                    >
                      {formatPct(s.coverage)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-hairline rounded-full overflow-hidden">
                    <div
                      className={twMerge(
                        'h-full transition-[width] duration-300 ease-out',
                        s.coverage >= 95 ? 'bg-emerald-400' : s.coverage >= 90 ? 'bg-amber-400' : 'bg-red-400'
                      )}
                      style={{ width: `${s.coverage}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-3">
                    <span className="font-mono text-2xs uppercase tracking-label text-ink-400">
                      {s.authMode}
                    </span>
                    <Button onClick={() => resync(s)} disabled={isSyncing}>
                      <RefreshCwIcon className="h-3 w-3" aria-hidden />
                      Re-sync now
                    </Button>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  mono,
  tone = 'text-white font-medium'
}: { label: string; value: string; mono?: boolean; tone?: string }) {
  return (
    <div className="px-4 py-2.5">
      <dt className="font-mono text-2xs uppercase tracking-label text-ink-400 font-medium">{label}</dt>
      <dd className={twMerge('mt-0.5 text-xs', mono && 'tnum font-mono', tone)}>{value}</dd>
    </div>
  );
}