import { twMerge } from 'tailwind-merge';
import { clamp } from '../../utils/format';

function toneFor(value: number) {
  if (value >= 90) return { text: 'text-pos', bar: 'bg-pos', track: 'bg-pos-line' };
  if (value >= 75) return { text: 'text-accent-600', bar: 'bg-accent', track: 'bg-accent-line' };
  return { text: 'text-warn', bar: 'bg-warn', track: 'bg-warn-line' };
}

export function ConfidenceBar({
  value,
  showValue = true,
  className,
  width = 'w-16'





}: {value: number;showValue?: boolean;className?: string;width?: string;}) {
  const t = toneFor(value);
  return (
    <div className={twMerge('flex items-center gap-2', className)}>
      <div
        className={twMerge('h-1 overflow-hidden bg-hairline', width)}
        role="img"
        aria-label={`Confidence ${value}%`}>
        
        <div className={twMerge('h-full', t.bar)} style={{ width: `${clamp(value, 0, 100)}%` }} />
      </div>
      {showValue ?
      <span className={twMerge('tnum font-mono text-xs font-medium', t.text)}>{value}%</span> :
      null}
    </div>);

}

/** Segmented confidence read-out — 20 ticks, terminal-style. */
export function ConfidenceMeter({
  value,
  label = 'Confidence',
  caption




}: {value: number;label?: string;caption?: string;}) {
  const t = toneFor(value);
  const filled = Math.round(clamp(value, 0, 100) / 100 * 20);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-2xs uppercase tracking-label text-ink-400">{label}</span>
        <span className={twMerge('tnum font-mono text-2xl font-semibold leading-none', t.text)}>
          {value}
          <span className="text-base">%</span>
        </span>
      </div>
      <div className="mt-2.5 flex gap-[3px]" aria-hidden>
        {Array.from({ length: 20 }).map((_, i) =>
        <div
          key={i}
          className={twMerge('h-4 flex-1', i < filled ? t.bar : 'bg-hairline')}
          style={i < filled ? { opacity: 0.45 + i / 20 * 0.55 } : undefined} />

        )}
      </div>
      {caption ? <p className="mt-2 text-xs leading-4 text-ink-500">{caption}</p> : null}
    </div>);

}