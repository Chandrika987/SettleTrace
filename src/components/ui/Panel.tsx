import { twMerge } from 'tailwind-merge';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'article';
}

export function Panel({ children, className, as = 'section' }: PanelProps) {
  const Tag = as;
  return (
    <Tag className={twMerge('border border-line bg-surface shadow-panel rounded-md overflow-hidden', className)}>{children}</Tag>);

}

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  eyebrow?: string;
  className?: string;
}

export function PanelHeader({ title, subtitle, right, eyebrow, className }: PanelHeaderProps) {
  return (
    <header
      className={twMerge(
        'flex flex-wrap items-start justify-between gap-3 border-b border-hairline px-4 py-3 bg-surface',
        className
      )}>
      
      <div className="min-w-0">
        {eyebrow ?
        <div className="mb-1 font-mono text-2xs uppercase tracking-label text-ink-500">{eyebrow}</div> :
        null}
        <h2 className="text-[14px] font-semibold leading-5 text-ink-50">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs leading-4 text-ink-400">{subtitle}</p> : null}
      </div>
      {right ? <div className="flex shrink-0 items-center gap-2">{right}</div> : null}
    </header>);

}

export function Label({ children, className }: {children: React.ReactNode;className?: string;}) {
  return (
    <span
      className={twMerge('font-mono text-2xs uppercase tracking-label text-ink-500', className)}>
      
      {children}
    </span>);

}