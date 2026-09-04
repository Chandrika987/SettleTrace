import { twMerge } from 'tailwind-merge';
import { AlertTriangleIcon, CheckIcon, XIcon } from 'lucide-react';
import { STAGE_LABEL, type LineageChain } from '../../services/lineageService';
import { formatCompactINR, formatINR } from '../../utils/format';
import type { LineageNode } from '../../types';

const STATUS_STYLE = {
  ok: {
    node: 'border-line bg-surface',
    rule: 'bg-pos',
    text: 'text-ink-50',
    icon: CheckIcon,
    iconTone: 'text-pos'
  },
  variance: {
    node: 'border-crit-line bg-crit-soft/60',
    rule: 'bg-crit',
    text: 'text-crit',
    icon: AlertTriangleIcon,
    iconTone: 'text-crit'
  },
  missing: {
    node: 'border-warn-line bg-warn-soft/60',
    rule: 'bg-warn',
    text: 'text-warn',
    icon: XIcon,
    iconTone: 'text-warn'
  }
};

interface LineageGraphProps {
  chain: LineageChain;
  activeId: string | null;
  onSelect: (node: LineageNode) => void;
}

export function LineageGraph({ chain, activeId, onSelect }: LineageGraphProps) {
  return (
    <div className="rr-scroll overflow-x-auto px-4 py-5">
      <ol className="flex min-w-[880px] items-stretch gap-0">
        {chain.nodes.map((node, i) => {
          const style = STATUS_STYLE[node.status];
          const Icon = style.icon;
          const prev = chain.nodes[i - 1];
          const delta = prev ? node.amount - prev.amount : 0;
          const active = activeId === node.id;
          return (
            <li key={node.id} className="flex flex-1 items-stretch">
              {i > 0 ?
              <div className="flex w-16 shrink-0 flex-col items-center justify-center px-1">
                  <div
                  className={twMerge(
                    'h-px w-full',
                    delta === 0 ? 'bg-line' : node.status === 'ok' ? 'bg-line' : 'bg-crit'
                  )}
                  aria-hidden />
                
                  {delta !== 0 ?
                <span
                  className={twMerge(
                    'tnum mt-1.5 whitespace-nowrap font-mono text-2xs',
                    node.status === 'ok' ? 'text-ink-400' : 'text-crit font-medium'
                  )}>
                  
                      {formatINR(delta)}
                    </span> :

                <span className="mt-1.5 font-mono text-2xs text-pos font-medium">match</span>
                }
                </div> :
              null}

              <button
                type="button"
                onClick={() => onSelect(node)}
                aria-pressed={active}
                className={twMerge(
                  'flex min-w-0 flex-1 flex-col rounded-md border px-3.5 pb-3.5 pt-0 text-left transition-all duration-150 ease-out hover:border-brand-line hover:bg-surface-hover',
                  style.node,
                  active && 'border-brand ring-2 ring-brand/40 bg-brand-soft/40'
                )}>
                
                <span className={twMerge('-mx-3.5 mb-2.5 h-[3px] rounded-t-md', style.rule)} aria-hidden />
                <span className="flex items-center justify-between gap-2">
                  <span className="font-mono text-2xs uppercase tracking-label text-ink-400 font-medium">
                    {STAGE_LABEL[node.stage]}
                  </span>
                  <Icon className={twMerge('h-3.5 w-3.5 shrink-0', style.iconTone)} aria-hidden />
                </span>
                <span className="mt-1.5 truncate text-[13px] font-semibold text-ink-50">
                  {node.label}
                </span>
                <span className="mt-0.5 truncate font-mono text-2xs text-ink-400">{node.sub}</span>
                <span className={twMerge('tnum mt-2.5 font-mono text-sm font-semibold', style.text)}>
                  {node.amount === 0 ? 'not received' : formatCompactINR(node.amount)}
                </span>
              </button>
            </li>);

        })}
      </ol>

      <p className="mt-4 flex items-start gap-2 border-t border-hairline pt-3 text-xs leading-5 text-ink-300">
        <AlertTriangleIcon
          className={twMerge('mt-0.5 h-3.5 w-3.5 shrink-0', chain.breakAt ? 'text-crit' : 'text-pos')}
          aria-hidden />
        
        {chain.note}
      </p>
    </div>);

}