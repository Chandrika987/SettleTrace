import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Panel, PanelHeader } from '../ui/Panel';
import { Amount } from '../ui/Amount';
import type { FinancialEvent } from '../../types';

const SOURCE_LABEL: Record<FinancialEvent['source'], string> = {
  processor: 'Processor',
  bank: 'Bank',
  ledger: 'Ledger',
  system: 'RazorRecon'
};

const TONE_MARK: Record<NonNullable<FinancialEvent['tone']>, string> = {
  neutral: 'border-ink-400 bg-surface',
  pos: 'border-pos bg-pos',
  warn: 'border-warn bg-warn',
  crit: 'border-crit bg-crit'
};

export function EventTimeline({ events }: {events: FinancialEvent[];}) {
  const [openId, setOpenId] = useState<string | null>(events[events.length - 1]?.id ?? null);

  return (
    <Panel className="bg-surface shadow-panel border-line rounded-md">
      <PanelHeader
        eyebrow="FINANCIAL EVENT TIMELINE"
        title="Reconstructed Value Flow"
        subtitle="Processor advices, bank statement credits, and ledger posting events." />
      
      <ol className="relative px-4 py-4">
        <span className="absolute left-[26px] top-6 bottom-6 w-px bg-line" aria-hidden />
        {events.map((e) => {
          const open = openId === e.id;
          const tone = e.tone ?? 'neutral';
          return (
            <li key={e.id} className="relative pl-8">
              <span
                className={twMerge(
                  'absolute left-[22px] top-[9px] h-2 w-2 -translate-x-1/2 rounded-full border',
                  TONE_MARK[tone]
                )}
                aria-hidden />
              
              <button
                type="button"
                onClick={() => setOpenId(open ? null : e.id)}
                aria-expanded={open}
                className="group flex w-full items-start gap-3 py-2 text-left">
                
                <span className="tnum w-[92px] shrink-0 font-mono text-2xs uppercase tracking-label text-ink-400 font-medium">
                  {e.time}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[13px] font-semibold text-ink-50">{e.label}</span>
                    <span className="font-mono text-2xs uppercase tracking-label text-cyan-400 font-medium">
                      {SOURCE_LABEL[e.source]}
                    </span>
                  </span>
                  <span className="mt-0.5 block font-mono text-2xs text-ink-400">{e.day}</span>
                </span>
                {e.amount != null ?
                <Amount
                  value={e.amount}
                  signed={e.amount > 0}
                  className="shrink-0 text-xs font-semibold text-white" /> :

                null}
                <ChevronDownIcon
                  className={twMerge(
                    'mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400 transition-transform duration-200 ease-out group-hover:text-white',
                    open && 'rotate-180'
                  )}
                  aria-hidden />
                
              </button>
              <AnimatePresence initial={false}>
                {open ?
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                  className="overflow-hidden">
                  
                    <p className="border-l-2 border-line/60 pb-3 pl-3 pt-1 text-xs leading-5 text-ink-300">
                      {e.detail}
                    </p>
                  </motion.div> :
                null}
              </AnimatePresence>
            </li>);

        })}
      </ol>
    </Panel>);

}