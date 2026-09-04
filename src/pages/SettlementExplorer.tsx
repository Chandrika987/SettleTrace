import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { SearchCheckIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel, PanelHeader } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { LineageGraph } from '../components/explorer/LineageGraph';
import { STAGE_LABEL, getLineageChains, type LineageChain } from '../services/lineageService';
import { formatCompactINR, formatINR } from '../utils/format';
import type { LineageNode } from '../types';
import { useRecon } from '../contexts/ReconContext';
import { StatusBadge } from '../components/ui/StatusBadge';

export function SettlementExplorer() {
  const [lineageChains, setLineageChains] = useState<LineageChain[]>([]);
  const [chainId, setChainId] = useState<string>('');
  const [node, setNode] = useState<LineageNode | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { settlements } = useRecon();

  useEffect(() => {
    let isMounted = true;
    getLineageChains().then((chains) => {
      if (!isMounted) return;
      setLineageChains(chains);
      if (chains.length > 0 && !chainId) {
        setChainId(chains[0].settlementId);
      }
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [chainId]);

  if (loading || lineageChains.length === 0) {
    return (
      <div className="px-5 py-6 lg:px-7 font-mono text-xs text-ink-300">
        Loading lineage graph...
      </div>
    );
  }

  const chain = lineageChains.find((c) => c.settlementId === chainId) ?? lineageChains[0];
  const settlement = settlements.find((s) => s.id === chain.settlementId);
  const first = chain.nodes[0];
  const last = chain.nodes[chain.nodes.length - 1];
  const leakage = first.amount - last.amount;

  return (
    <div>
      <PageHeader
        eyebrow="Settlement explorer"
        title="Where did this money go?"
        subtitle="Follow value from merchant capture to ledger entry. Every hop shows what was taken out and what remains unmatched."
        right={
          settlement ? (
            <Button variant="primary" onClick={() => navigate(`/investigation/${settlement.id}`)}>
              <SearchCheckIcon className="h-3 w-3" aria-hidden />
              Open investigation
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-4 px-5 py-5 lg:px-7 lg:py-6 xl:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <Panel className="h-fit">
          <PanelHeader eyebrow="Trace" title="Select a settlement chain" />
          <ul className="divide-y divide-hairline">
            {lineageChains.map((c) => {
              const active = c.settlementId === chainId;
              const broken = Boolean(c.breakAt);
              return (
                <li key={c.settlementId}>
                  <button
                    type="button"
                    onClick={() => {
                      setChainId(c.settlementId);
                      setNode(null);
                    }}
                    className={twMerge(
                      'w-full px-4 py-3 text-left transition-colors duration-150 ease-out hover:bg-surface-hover',
                      active && 'bg-brand-soft/60 border-l-2 border-brand hover:bg-brand-soft/80'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="tnum font-mono text-xs font-semibold text-white">{c.settlementId}</span>
                      <span
                        className={twMerge(
                          'h-1.5 w-1.5 rounded-full',
                          broken ? 'bg-crit' : 'bg-pos'
                        )}
                        aria-hidden
                      />
                    </div>
                    <div className="mt-0.5 text-xs text-ink-300 font-medium">{c.merchant}</div>
                    <div className="tnum mt-1 font-mono text-2xs text-ink-400">
                      {broken ? `break at ${STAGE_LABEL[c.breakAt!].toLowerCase()}` : 'fully matched'}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader
              eyebrow="Financial lineage"
              title={`${chain.merchant} · ${chain.settlementId}`}
              subtitle="Merchant → Payment → Transaction → Settlement → Bank credit → Ledger entry"
              right={settlement ? <StatusBadge status={settlement.status} /> : null}
            />

            <div className="grid grid-cols-2 divide-x divide-hairline border-b border-hairline bg-canvas/40 lg:grid-cols-4">
              <Metric label="Captured" value={formatCompactINR(first.amount)} />
              <Metric label="Reached ledger" value={last.amount ? formatCompactINR(last.amount) : '—'} />
              <Metric
                label="Deducted en route"
                value={formatINR(-leakage)}
                tone={leakage > 0 ? 'text-crit font-semibold' : 'text-white'}
              />
              <Metric
                label="Hops verified"
                value={`${chain.nodes.filter((n) => n.status === 'ok').length} / ${chain.nodes.length}`}
                tone={chain.breakAt ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}
              />
            </div>
            <LineageGraph chain={chain} activeId={node?.id ?? null} onSelect={setNode} />
          </Panel>

          <Panel>
            <PanelHeader
              eyebrow="Node detail"
              title={node ? `${STAGE_LABEL[node.stage]} · ${node.label}` : 'Select a node in the chain'}
              subtitle={
                node
                  ? 'Source record as ingested, before any reconciliation adjustment.'
                  : 'Click any stage above to inspect the underlying source record.'
              }
            />

            {node ? (
              <dl className="grid grid-cols-1 divide-y divide-hairline sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="divide-y divide-hairline">
                  <Fact label="Record ID" value={node.id} mono />
                  <Fact label="Stage" value={STAGE_LABEL[node.stage]} />
                  <Fact label="Reference" value={node.sub} mono />
                </div>
                <div className="divide-y divide-hairline">
                  <Fact
                    label="Amount"
                    value={node.amount ? formatINR(node.amount, { decimals: true }) : 'Not received'}
                    mono
                  />
                  <Fact
                    label="Match status"
                    value={
                      node.status === 'ok'
                        ? 'Matched to adjacent stages'
                        : node.status === 'variance'
                        ? 'Variance against previous stage'
                        : 'No matching record found'
                    }
                  />
                  <Fact
                    label="Source system"
                    value={
                      node.stage === 'bank'
                        ? 'Bank statement (MT940)'
                        : node.stage === 'ledger'
                        ? 'Tally Prime'
                        : 'Processor settlement API'
                    }
                  />
                </div>
              </dl>
            ) : (
              <div className="px-4 py-8 text-center text-xs text-ink-400">No node selected.</div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone = 'text-white' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="px-4 py-2.5">
      <div className="font-mono text-2xs uppercase tracking-label text-ink-400 font-medium">{label}</div>
      <div className={`tnum mt-0.5 font-mono text-sm font-semibold ${tone}`}>{value}</div>
    </div>
  );
}

function Fact({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-2.5 bg-surface">
      <dt className="font-mono text-2xs uppercase tracking-label text-ink-400 font-medium">{label}</dt>
      <dd className={`text-right text-xs text-ink-50 ${mono ? 'tnum font-mono' : 'font-medium'}`}>{value}</dd>
    </div>
  );
}