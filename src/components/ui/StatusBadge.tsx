import { twMerge } from 'tailwind-merge';
import type { AnomalyCategory, Severity, SettlementStatus } from '../../types';
import { CATEGORY_LABEL, SEVERITY_LABEL, STATUS_LABEL } from '../../data/taxonomy';

type Tone = 'neutral' | 'pos' | 'warn' | 'crit' | 'accent';

const TONE: Record<Tone, string> = {
  neutral: 'bg-surface-hover text-ink-300 border-line',
  pos: 'bg-pos-soft text-emerald-400 border-pos-line',
  warn: 'bg-warn-soft text-amber-400 border-warn-line',
  crit: 'bg-crit-soft text-red-400 border-crit-line',
  accent: 'bg-brand-soft text-blue-400 border-brand-line'
};

const DOT: Record<Tone, string> = {
  neutral: 'bg-ink-400',
  pos: 'bg-pos',
  warn: 'bg-warn',
  crit: 'bg-crit',
  accent: 'bg-brand'
};

export const STATUS_TONE: Record<SettlementStatus, Tone> = {
  reconciled: 'pos',
  approved: 'accent',
  anomaly: 'crit',
  investigating: 'warn',
  pending: 'neutral'
};

export const SEVERITY_TONE: Record<Severity, Tone> = {
  critical: 'crit',
  high: 'crit',
  medium: 'warn',
  low: 'neutral'
};

interface TagProps {
  children: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
  mono?: boolean;
}

export function Tag({ children, tone = 'neutral', dot = false, className, mono }: TagProps) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 border px-1.5 py-0.5 text-2xs font-medium leading-4 rounded-sm',
        mono && 'font-mono uppercase tracking-label',
        TONE[tone],
        className
      )}>
      
      {dot ? <span className={twMerge('h-1.5 w-1.5 rounded-full', DOT[tone])} aria-hidden /> : null}
      {children}
    </span>);

}

export function StatusBadge({ status, className }: {status: SettlementStatus;className?: string;}) {
  return (
    <Tag tone={STATUS_TONE[status]} dot className={className}>
      {STATUS_LABEL[status]}
    </Tag>);

}

export function SeverityBadge({ severity, className }: {severity: Severity;className?: string;}) {
  return (
    <Tag tone={SEVERITY_TONE[severity]} mono className={className}>
      {SEVERITY_LABEL[severity]}
    </Tag>);

}

export function CategoryTag({
  category,
  className



}: {category: AnomalyCategory;className?: string;}) {
  return (
    <Tag tone={category === 'unknown' ? 'warn' : 'neutral'} className={className}>
      {CATEGORY_LABEL[category]}
    </Tag>);

}

export function ActorTag({ type }: {type: 'ai' | 'human' | 'system';}) {
  const map = {
    ai: { tone: 'accent' as Tone, label: 'AI' },
    human: { tone: 'pos' as Tone, label: 'Human' },
    system: { tone: 'neutral' as Tone, label: 'System' }
  };
  return (
    <Tag tone={map[type].tone} mono>
      {map[type].label}
    </Tag>);

}