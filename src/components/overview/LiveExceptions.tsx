import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRightIcon } from 'lucide-react';
import { Panel, PanelHeader } from '../ui/Panel';
import { Amount } from '../ui/Amount';
import { ConfidenceBar } from '../ui/Confidence';
import { StatusBadge, Tag } from '../ui/StatusBadge';
import { CATEGORY_LABEL } from '../../data/taxonomy';
import { getInvestigationSync as getInvestigation } from '../../services/investigationService';
import { formatDateShort } from '../../utils/format';
import type { Settlement } from '../../types';

export function LiveExceptions({ rows }: {rows: Settlement[];}) {
  const navigate = useNavigate();
  const ranked = [...rows].
  sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance)).
  slice(0, 6);

  return (
    <Panel className="flex h-full flex-col">
      <PanelHeader
        eyebrow="Live exceptions"
        title="Highest-impact open anomalies"
        subtitle="Ranked by amount at risk. Every item carries a probable cause and evidence."
        right={
        <Link
          to="/anomalies"
          className="inline-flex items-center gap-1 font-mono text-2xs uppercase tracking-label text-accent-600 transition-colors duration-150 ease-out hover:text-accent">
          
            All anomalies
            <ChevronRightIcon className="h-3 w-3" aria-hidden />
          </Link>
        } />
      
      {ranked.length === 0 ?
      <div className="flex-1 px-4 py-10 text-center">
          <p className="text-[13px] font-semibold text-ink-900">No open exceptions</p>
          <p className="mt-1 text-xs leading-5 text-ink-500">
            Every settlement in the current period is matched or authorised. New anomalies surface
            here within seconds of detection.
          </p>
        </div> :
      null}
      <ul className="flex-1 divide-y divide-hairline">
        {ranked.map((s, i) => {
          const inv = getInvestigation(s.id);
          return (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}>
              
              <button
                type="button"
                onClick={() => navigate(`/investigation/${s.id}`)}
                className="group flex w-full items-start gap-4 px-4 py-3.5 text-left transition-colors duration-150 ease-out hover:bg-surface-elevated">
                
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <Amount
                      value={s.variance}
                      variance
                      className="text-lg font-bold tracking-tight" />
                    
                    <span className="text-[13px] font-semibold text-white">
                      {CATEGORY_LABEL[s.category]}
                    </span>
                    <Tag tone={s.category === 'unknown' ? 'warn' : 'neutral'}>
                      {s.received === 0 ? 'Missing Settlement' : 'Variance'}
                    </Tag>
                  </div>
                  <p className="mt-1 text-xs leading-4 text-ink-400">
                    <span className="font-mono text-ink-300 font-medium">{s.id}</span> · {s.merchant} ·{' '}
                    {s.processor} · {formatDateShort(s.date)}
                  </p>
                  <p className="mt-1.5 text-xs leading-4 text-ink-300">
                    <span className="font-mono text-2xs uppercase tracking-label text-ink-400 font-semibold">
                      Probable cause:
                    </span>{' '}
                    {inv?.probableCause}
                  </p>
                </div>
                <div className="flex w-[140px] shrink-0 flex-col items-end gap-2">
                  <StatusBadge status={s.status} />
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-cyan-400">{s.confidence}%</span>
                    <ConfidenceBar value={s.confidence} width="w-14" />
                  </div>
                  <span className="font-mono text-2xs uppercase tracking-label text-ink-400 transition-colors duration-150 ease-out group-hover:text-cyan-400">
                    Investigate →
                  </span>
                </div>
              </button>
            </motion.li>);

        })}
      </ul>
    </Panel>);

}