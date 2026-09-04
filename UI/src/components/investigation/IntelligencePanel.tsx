import { CircleDotIcon, QuoteIcon } from 'lucide-react';
import { Panel, PanelHeader } from '../ui/Panel';
import { ConfidenceMeter } from '../ui/Confidence';
import { Amount } from '../ui/Amount';
import { Tag } from '../ui/StatusBadge';
import type { Investigation } from '../../types';

const WEIGHT_LABEL = {
  strong: 'Strong',
  supporting: 'Supporting',
  contextual: 'Context'
};

const WEIGHT_TONE = {
  strong: 'bg-accent shadow-[0_0_8px_rgba(6,182,212,0.6)]',
  supporting: 'bg-accent/60',
  contextual: 'bg-ink-600'
};

export function IntelligencePanel({ inv }: {inv: Investigation;}) {
  return (
    <Panel className="bg-surface border-line shadow-panel rounded-md h-full flex flex-col">
      <PanelHeader
        eyebrow="INVESTIGATION INTELLIGENCE"
        title="AI Evidence Engine"
        subtitle="Machine-generated analysis. The recommendation is advisory until authorized by a Controller."
        right={<Tag tone="accent" mono>Engine v4.2</Tag>} />
      

      <div className="divide-y divide-line flex-1 overflow-y-auto">
        <Block label="FINDING SUMMARY">
          <p className="text-[13px] leading-6 text-white font-medium">{inv.finding}</p>
        </Block>

        <Block label="ROOT CAUSE & ATTRIBUTION">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold text-white">{inv.probableCause}</span>
            <Tag tone="neutral">{inv.categoryLabel}</Tag>
          </div>
          {inv.alternates.length ?
          <ul className="mt-3 space-y-1.5 border-t border-line/60 pt-2.5">
              {inv.alternates.map((a) =>
            <li key={a.cause} className="flex items-center gap-2 text-xs text-ink-400">
                  <CircleDotIcon className="h-3.5 w-3.5 shrink-0 text-cyan-400" aria-hidden />
                  <span className="flex-1 text-ink-300">{a.cause}</span>
                  <span className="tnum font-mono text-2xs text-cyan-400 bg-surface-sub px-1.5 py-0.5 rounded font-semibold">{a.confidence}%</span>
                </li>
            )}
            </ul> :
          null}
        </Block>

        <Block label={`EVIDENCE BASE (${inv.evidence.length} ITEMS)`}>
          <ul className="space-y-2.5">
            {inv.evidence.map((e) =>
            <li key={e.label} className="grid grid-cols-[3px_minmax(0,1fr)] gap-3 bg-surface-sub/50 px-3.5 py-2.5 rounded border border-line/60">
                <span className={`${WEIGHT_TONE[e.weight]} block h-full rounded-full`} aria-hidden />
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="text-xs text-ink-300 font-medium">{e.label}</span>
                    <span className="font-mono text-2xs uppercase tracking-label text-cyan-400 font-semibold">
                      {WEIGHT_LABEL[e.weight]}
                    </span>
                  </div>
                  <div className="tnum mt-1 font-mono text-[13px] text-white font-semibold">{e.value}</div>
                </div>
              </li>
            )}
          </ul>
        </Block>

        <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] sm:divide-x sm:divide-y-0">
          <div className="px-5 py-5">
            <ConfidenceMeter
              value={inv.confidence}
              caption={
              inv.confidence >= 75 ?
              'Above 75% auto-proposal threshold — journal entry drafted.' :
              'Below 75% threshold — requires manual review.'
              } />
            
          </div>
          <div className="px-5 py-5">
            <div className="font-mono text-2xs uppercase tracking-label text-ink-400 font-semibold">
              Financial Impact
            </div>
            <Amount
              value={inv.impact}
              className="mt-2 block text-2xl font-bold leading-none text-red-400 tracking-tight" />
            
            <div className="mt-4 border-t border-line pt-3">
              <div className="font-mono text-2xs uppercase tracking-label text-ink-400 font-semibold">
                Recommended Action
              </div>
              <p className="mt-1 text-[13px] font-bold leading-5 text-cyan-400">
                {inv.recommendedAction}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface-sub/60 px-5 py-5 rounded-b-md border-t border-line">
          <div className="flex items-start gap-3">
            <QuoteIcon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400 opacity-80" aria-hidden />
            <div>
              <div className="font-mono text-2xs uppercase tracking-label text-ink-400 font-semibold">
                Why this matters
              </div>
              <p className="mt-1.5 text-[13px] leading-5 text-ink-200">{inv.whyItMatters}</p>
              <p className="mt-2 text-xs leading-5 text-ink-400">
                {inv.systemic ?
                'Pattern detection flags this as potentially systemic — review processor rate schedule.' :
                'No matching pattern across last 90 days of settlements for this merchant.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Panel>);

}

function Block({ label, children }: {label: string;children: React.ReactNode;}) {
  return (
    <div className="px-5 py-5">
      <div className="mb-3 font-mono text-2xs uppercase tracking-label text-ink-500">{label}</div>
      {children}
    </div>);

}