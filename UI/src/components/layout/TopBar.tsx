import { CommandIcon, MenuIcon, RefreshCwIcon, SearchIcon } from 'lucide-react';
import { useRecon } from '../../contexts/ReconContext';

interface TopBarProps {
  onOpenCommand: () => void;
  onOpenNav: () => void;
}

export function TopBar({ onOpenCommand, onOpenNav }: TopBarProps) {
  const { approvals } = useRecon();
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line bg-surface px-3 lg:px-5 shadow-panel">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="flex h-8 w-8 items-center justify-center rounded border border-line text-ink-400 transition-colors duration-150 ease-out hover:bg-surface-sub lg:hidden">
        
        <MenuIcon className="h-4 w-4" aria-hidden />
      </button>

      <button
        type="button"
        onClick={onOpenCommand}
        className="group flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md border border-line bg-canvas px-3 text-left transition-all duration-150 ease-out hover:border-cyan-400/50 hover:bg-surface-sub sm:max-w-xl">
        
        <SearchIcon className="h-3.5 w-3.5 shrink-0 text-ink-400 group-hover:text-cyan-400 transition-colors" aria-hidden />
        <span className="truncate text-xs text-ink-400 group-hover:text-white transition-colors">
          Ask financial search... <span className="text-ink-500 font-mono hidden md:inline">("Show unexplained differences above ₹50,000")</span>
        </span>
        <span className="ml-auto hidden items-center gap-0.5 rounded border border-line bg-surface-elevated px-1.5 py-0.5 font-mono text-2xs text-ink-300 sm:flex">
          <CommandIcon className="h-2.5 w-2.5" aria-hidden />K
        </span>
      </button>

      <div className="ml-auto hidden items-center gap-4 xl:flex">
        <div className="flex items-center gap-2 border-l border-line pl-4">
          <span className="h-1.5 w-1.5 rounded-full bg-pos shadow-[0_0_6px_rgba(34,197,94,0.6)]" aria-hidden />
          <span className="font-mono text-2xs uppercase tracking-label text-ink-300 font-medium">
            6 / 6 Sources Live
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-ink-400">
          <RefreshCwIcon className="h-3 w-3 text-cyan-400" aria-hidden />
          <span className="tnum font-mono text-2xs uppercase tracking-label text-ink-400">
            Synced 16:42 IST
          </span>
        </div>
        <div className="border-l border-line pl-4 font-mono text-2xs uppercase tracking-label text-ink-400">
          Period · 30 Aug 2026
        </div>
      </div>

      <div className="flex items-center gap-2 border-l border-line pl-3">
        <span className="tnum inline-flex h-6 items-center gap-1.5 rounded-sm border border-warn-line bg-warn-soft px-2 font-mono text-2xs uppercase tracking-label text-amber-400 font-semibold">
          {approvals.length} pending
        </span>
      </div>
    </header>);

}