import { AlertTriangleIcon, InboxIcon, RotateCwIcon } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  title,
  message,
  action
}: {title: string;message: string;action?: {label: string;onClick: () => void;};}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-10 w-10 items-center justify-center border border-line bg-surface-hover rounded-md shadow-sm">
        <InboxIcon className="h-5 w-5 text-ink-400" aria-hidden />
      </div>
      <h3 className="mt-3 text-[14px] font-semibold text-ink-50">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-5 text-ink-400">{message}</p>
      {action ?
      <Button className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button> :
      null}
    </div>);

}

export function ErrorState({
  title = 'Source unavailable',
  message,
  onRetry
}: {title?: string;message: string;onRetry?: () => void;}) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 border border-crit-line bg-crit-soft/60 px-4 py-3 rounded-md">
      
      <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-crit" aria-hidden />
      <div className="min-w-0">
        <h3 className="text-[13px] font-semibold text-crit">{title}</h3>
        <p className="mt-0.5 text-xs leading-5 text-ink-300">{message}</p>
      </div>
      {onRetry ?
      <Button className="ml-auto" onClick={onRetry}>
          <RotateCwIcon className="h-3 w-3" aria-hidden />
          Retry sync
        </Button> :
      null}
    </div>);

}

export function SkeletonRows({ rows = 6, cols = 6 }: {rows?: number;cols?: number;}) {
  return (
    <div aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, r) =>
      <div key={r} className="flex items-center gap-4 border-b border-hairline px-4 py-3">
          {Array.from({ length: cols }).map((_, c) =>
        <div
          key={c}
          className="h-2.5 animate-pulse bg-hairline"
          style={{ width: `${[18, 12, 14, 12, 10, 16][c % 6]}%`, animationDelay: `${r * 60}ms` }} />

        )}
        </div>
      )}
    </div>);

}

export function InlineSpinner({ label }: {label: string;}) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-label text-ink-400">
      <span className="h-3 w-3 animate-spin rounded-full border border-ink-300 border-t-accent" aria-hidden />
      {label}
    </span>);

}