import { twMerge } from 'tailwind-merge';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'approve';
type Size = 'sm' | 'md';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand text-white border-brand hover:bg-brand-600 active:bg-brand-600 shadow-sm',
  approve: 'bg-pos text-white border-pos hover:bg-emerald-600 active:bg-emerald-700 shadow-sm',
  secondary: 'bg-surface-hover text-ink-100 border-line hover:border-slate-500 hover:text-white active:bg-canvas',
  ghost: 'bg-transparent text-ink-300 border-transparent hover:bg-surface-hover hover:text-white',
  danger: 'bg-crit-soft text-crit border-crit-line hover:bg-crit/20'
};

const SIZE: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5 rounded-sm',
  md: 'h-9 px-3.5 text-[13px] gap-2 rounded-md'
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = 'secondary',
  size = 'sm',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={twMerge(
        'inline-flex items-center justify-center border font-medium transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-45',
        VARIANT[variant],
        SIZE[size],
        className
      )}
      {...rest}>
      
      {children}
    </button>);

}