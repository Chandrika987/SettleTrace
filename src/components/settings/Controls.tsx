import { twMerge } from 'tailwind-merge';

export function SettingRow({
  label,
  hint,
  children




}: {label: string;hint?: string;children: React.ReactNode;}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline px-4 py-3.5 last:border-b-0">
      <div className="min-w-0 max-w-md">
        <div className="text-[13px] font-medium text-ink-900">{label}</div>
        {hint ? <p className="mt-0.5 text-xs leading-4 text-ink-500">{hint}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-3">{children}</div>
    </div>);

}

export function Toggle({
  checked,
  onChange,
  label




}: {checked: boolean;onChange: (next: boolean) => void;label: string;}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={twMerge(
        'relative h-5 w-9 border transition-colors duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        checked ? 'border-accent bg-accent' : 'border-line bg-canvas'
      )}>
      
      <span
        className={twMerge(
          'absolute top-[2px] h-3.5 w-3.5 bg-surface transition-transform duration-150 ease-out',
          checked ? 'translate-x-[19px]' : 'translate-x-[2px]'
        )}
        aria-hidden />
      
    </button>);

}

export function NumberField({
  value,
  onChange,
  suffix,
  prefix,
  label,
  width = 'w-28'







}: {value: string;onChange: (next: string) => void;suffix?: string;prefix?: string;label: string;width?: string;}) {
  return (
    <label className={twMerge('flex items-center border border-line bg-surface px-2', width)}>
      <span className="sr-only">{label}</span>
      {prefix ? <span className="font-mono text-xs text-ink-400">{prefix}</span> : null}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        className="tnum h-7 min-w-0 flex-1 bg-transparent px-1 font-mono text-xs text-ink-900 focus:outline-none" />
      
      {suffix ? <span className="font-mono text-2xs text-ink-400">{suffix}</span> : null}
    </label>);

}

export function Slider({
  value,
  onChange,
  min,
  max,
  label






}: {value: number;onChange: (next: number) => void;min: number;max: number;label: string;}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-36 cursor-pointer appearance-none bg-hairline accent-accent"
        style={{
          background: `linear-gradient(to right, #4f46e5 ${(value - min) / (max - min) * 100}%, #efeeea ${(value - min) / (max - min) * 100}%)`
        }} />
      
      <span className="tnum w-10 text-right font-mono text-xs font-medium text-ink-900">
        {value}%
      </span>
    </div>);

}

export function SelectField({
  value,
  onChange,
  options,
  label





}: {value: string;onChange: (next: string) => void;options: string[];label: string;}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 cursor-pointer border border-line bg-surface px-2 text-xs text-ink-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
        
        {options.map((o) =>
        <option key={o} value={o}>
            {o}
          </option>
        )}
      </select>
    </label>);

}