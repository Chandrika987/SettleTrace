
interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, right, children }: PageHeaderProps) {
  return (
    <header className="border-b border-line bg-surface px-5 py-4 lg:px-7 lg:py-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ?
          <div className="font-mono text-2xs uppercase tracking-label text-ink-500">{eyebrow}</div> :
          null}
          <h1 className="mt-1 text-xl font-semibold leading-7 tracking-[-0.01em] text-ink-50 lg:text-[24px] lg:leading-8">
            {title}
          </h1>
          {subtitle ? <p className="mt-1 text-[13px] leading-5 text-ink-400">{subtitle}</p> : null}
        </div>
        {right ? <div className="flex flex-wrap items-center gap-2">{right}</div> : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </header>);

}