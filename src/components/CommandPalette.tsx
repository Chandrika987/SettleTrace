import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, CornerDownLeftIcon, SearchIcon, SparklesIcon } from 'lucide-react';
import {
  filtersToSearchParams,
  parseQuery,
  type ParsedQuery } from
'../utils/commandParser';
import { Amount } from './ui/Amount';
import { StatusBadge } from './ui/StatusBadge';
import { ConfidenceBar } from './ui/Confidence';
import { formatDateShort } from '../utils/format';
import { InlineSpinner } from './ui/States';

import { useRecon } from '../contexts/ReconContext';
import { getMerchantNames } from '../services/merchantService';

const SUGGESTIONS = [
  'Show me all unexplained settlement differences above ₹50,000 this week',
  'Why is settlement SET_104821 different?',
  'HomeKart fee variance this month',
  'Missing settlements today',
  'What is awaiting approval?'
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { settlements } = useRecon();
  const [value, setValue] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedQuery | null>(null);
  const [merchantNames, setMerchantNames] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMerchantNames().then(setMerchantNames);
  }, []);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(t);
    }
    setValue('');
    setParsed(null);
    setParsing(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!value.trim()) {
      setParsed(null);
      setParsing(false);
      return;
    }
    setParsing(true);
    const t = window.setTimeout(() => {
      setParsed(parseQuery(value, settlements, merchantNames));
      setParsing(false);
    }, 260);
    return () => window.clearTimeout(t);
  }, [value, settlements, merchantNames]);

  const results = useMemo(() => parsed?.results.slice(0, 6) ?? [], [parsed]);

  function run(target?: ParsedQuery | null) {
    const p = target ?? parsed;
    if (!p) return;
    if (p.intent === 'investigate' && p.settlementId) {
      navigate(`/investigation/${p.settlementId}`);
    } else if (p.intent === 'navigate' && p.route) {
      navigate(p.route);
    } else {
      const qs = filtersToSearchParams(p.filters);
      navigate(`/reconciliation${qs ? `?${qs}` : ''}`);
    }
    onClose();
  }

  return (
    <AnimatePresence>
      {open ?
      <div
        className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[8vh]"
        role="dialog"
        aria-modal="true"
        aria-label="Financial search">
        
          <motion.div
          className="absolute inset-0 bg-ink-950/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          onClick={onClose} />
        
          <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.985 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-2xl border border-line bg-surface shadow-pop">
          
            <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
              <SearchIcon className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
              <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') run();
              }}
              placeholder="Ask a financial question or search settlements…"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
              aria-label="Financial search query" />
            
              <span className="hidden font-mono text-2xs uppercase tracking-label text-ink-400 sm:inline">
                Financial search
              </span>
            </div>

            {!value.trim() ?
          <div className="px-4 py-3">
                <div className="font-mono text-2xs uppercase tracking-label text-ink-400">
                  Try
                </div>
                <ul className="mt-2 space-y-0.5">
                  {SUGGESTIONS.map((s) =>
              <li key={s}>
                      <button
                  type="button"
                  onClick={() => setValue(s)}
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-[13px] text-ink-700 transition-colors duration-150 ease-out hover:bg-canvas">
                  
                        <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                        <span className="truncate">{s}</span>
                      </button>
                    </li>
              )}
                </ul>
              </div> :

          <div className="max-h-[62vh] overflow-y-auto rr-scroll">
                <div className="border-b border-hairline bg-canvas/60 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-2xs uppercase tracking-label text-ink-400">
                      Interpreted as
                    </span>
                    {parsing ? <InlineSpinner label="Parsing" /> : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {parsing && !parsed ?
                <div className="h-5 w-40 animate-pulse bg-hairline" /> :
                parsed?.chips.length ?
                parsed.chips.map((c) =>
                <span
                  key={c.label + c.value}
                  className="inline-flex items-center gap-1.5 border border-accent-line bg-accent-soft px-1.5 py-0.5 text-2xs text-accent-600">
                  
                          <span className="font-mono uppercase tracking-label text-accent/70">
                            {c.label}
                          </span>
                          <span className="font-medium">{c.value}</span>
                        </span>
                ) :

                <span className="text-xs text-ink-500">No filters detected yet.</span>
                }
                  </div>
                  {parsed ?
              <p className="mt-2 text-xs leading-4 text-ink-500">{parsed.summary}</p> :
              null}
                </div>

                {parsed && parsed.intent !== 'navigate' && results.length > 0 ?
            <ul>
                    {results.map((s) =>
              <li key={s.id}>
                        <button
                  type="button"
                  onClick={() => {
                    navigate(`/investigation/${s.id}`);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 border-b border-hairline px-4 py-2.5 text-left transition-colors duration-150 ease-out hover:bg-canvas">
                  
                          <span className="tnum w-[92px] shrink-0 font-mono text-xs text-ink-900">
                            {s.id}
                          </span>
                          <span className="w-24 shrink-0 truncate text-[13px] text-ink-700">
                            {s.merchant}
                          </span>
                          <span className="hidden w-20 shrink-0 font-mono text-2xs uppercase tracking-label text-ink-400 sm:inline">
                            {formatDateShort(s.date)}
                          </span>
                          <Amount value={s.variance} variance className="w-24 shrink-0 text-right text-xs" />
                          <span className="ml-auto hidden shrink-0 sm:block">
                            <ConfidenceBar value={s.confidence} width="w-10" />
                          </span>
                          <StatusBadge status={s.status} className="shrink-0" />
                        </button>
                      </li>
              )}
                  </ul> :
            null}

                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="font-mono text-2xs uppercase tracking-label text-ink-400">
                    {parsed?.intent === 'investigate' ?
                'Opens investigation workspace' :
                parsed?.intent === 'navigate' ?
                `Opens ${parsed.routeLabel}` :
                'Applies filters in Reconciliation'}
                  </span>
                  <button
                type="button"
                onClick={() => run()}
                disabled={!parsed}
                className="inline-flex h-7 items-center gap-1.5 border border-ink-900 bg-ink-900 px-2.5 text-xs font-medium text-white transition-colors duration-150 ease-out hover:bg-ink-800 disabled:opacity-40">
                
                    Run query
                    <CornerDownLeftIcon className="h-3 w-3" aria-hidden />
                  </button>
                </div>
              </div>
          }

            <div className="flex items-center gap-3 border-t border-line bg-canvas px-4 py-2">
              <span className="font-mono text-2xs uppercase tracking-label text-ink-400">
                Natural language → filters → evidence
              </span>
              <ArrowRightIcon className="h-3 w-3 text-ink-300" aria-hidden />
              <span className="font-mono text-2xs uppercase tracking-label text-ink-400">
                Esc to dismiss
              </span>
            </div>
          </motion.div>
        </div> :
      null}
    </AnimatePresence>);

}