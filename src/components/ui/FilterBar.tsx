import { ChevronDownIcon, XIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface FilterDef {
  id: string;
  label: string;
  options: string[];
}

interface FilterBarProps {
  filters: FilterDef[];
  value: Record<string, string>;
  onChange: (id: string, next: string) => void;
  onReset: () => void;
  right?: React.ReactNode;
}

export function FilterBar({ filters, value, onChange, onReset, right }: FilterBarProps) {
  const activeCount = filters.filter((f) => value[f.id] && value[f.id] !== f.options[0]).length;
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-canvas/60 px-3 py-2">
      {filters.map((f) => {
        const active = value[f.id] && value[f.id] !== f.options[0];
        return (
          <label key={f.id} className="relative">
            <span className="sr-only">{f.label}</span>
            <select
              value={value[f.id] ?? f.options[0]}
              onChange={(e) => onChange(f.id, e.target.value)}
              className={twMerge(
                'h-7 cursor-pointer appearance-none rounded-sm border bg-surface pl-2.5 pr-6 text-xs font-medium text-ink-200 transition-colors duration-150 ease-out hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                active ? 'border-brand-line bg-brand-soft text-brand font-semibold' : 'border-line'
              )}>
              
              {f.options.map((o) =>
              <option key={o} value={o} className="bg-surface text-ink-100 py-1">
                  {o === f.options[0] ? `${f.label}: ${o}` : o}
                </option>
              )}
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-400"
              aria-hidden />
            
          </label>);

      })}
      {activeCount > 0 ?
      <button
        type="button"
        onClick={onReset}
        className="ml-1 inline-flex h-7 items-center gap-1 rounded-sm px-1.5 font-mono text-2xs uppercase tracking-label text-ink-400 transition-colors duration-150 ease-out hover:text-white">
        
          <XIcon className="h-3 w-3" aria-hidden />
          Clear {activeCount}
        </button> :
      null}
      {right ? <div className="ml-auto flex items-center gap-2">{right}</div> : null}
    </div>);

}