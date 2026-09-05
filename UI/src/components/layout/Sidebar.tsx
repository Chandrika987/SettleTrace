import { NavLink } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import {
  ActivityIcon,
  BarChart3Icon,
  DatabaseIcon,
  GaugeIcon,
  GitBranchIcon,
  ScaleIcon,
  ScrollTextIcon,
  SearchCheckIcon,
  SettingsIcon,
  ShieldCheckIcon } from
'lucide-react';
import { useRecon } from '../../contexts/ReconContext';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{className?: string;}>;
  badge?: 'anomalies' | 'approvals';
  end?: boolean;
}

const GROUPS: {label: string;items: NavItem[];}[] = [
{
  label: 'CONTROL',
  items: [
  { to: '/', label: 'Overview', icon: GaugeIcon, end: true },
  { to: '/reconciliation', label: 'Reconciliation', icon: ScaleIcon },
  { to: '/anomalies', label: 'Anomalies', icon: ActivityIcon, badge: 'anomalies' }]

},
{
  label: 'INVESTIGATE',
  items: [
  { to: '/explorer', label: 'Settlement Explorer', icon: GitBranchIcon },
  { to: '/investigation/SET_104821', label: 'Investigation Workspace', icon: SearchCheckIcon },
  { to: '/approvals', label: 'Approval Queue', icon: ShieldCheckIcon, badge: 'approvals' }]

},
{ label: 'INTELLIGENCE', items: [{ to: '/analytics', label: 'Analytics', icon: BarChart3Icon }] },
{
  label: 'SYSTEM',
  items: [
  { to: '/datasources', label: 'Data Sources', icon: DatabaseIcon },
  { to: '/audit', label: 'Audit Trail', icon: ScrollTextIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon }]

}];


export function Sidebar({ onNavigate }: {onNavigate?: () => void;}) {
  const { approvals, settlements } = useRecon();
  const anomalyCount = settlements.filter(
    (s) => s.status === 'anomaly' || s.status === 'investigating'
  ).length;

  const counts = { anomalies: anomalyCount, approvals: approvals.length };

  return (
    <div className="rr-scroll-dark flex h-full w-full flex-col overflow-y-auto bg-canvas text-ink-300 border-r border-line shadow-panel">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded border border-cyan-400/40 bg-cyan-400/10">
          <span className="font-mono text-xs font-bold leading-none text-cyan-400">S</span>
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-bold tracking-tight text-white flex items-center gap-1.5">
            SettleTrace
            <span className="rounded bg-cyan-400/10 border border-cyan-400/30 px-1 py-0.2 font-mono text-[9px] text-cyan-400 uppercase font-semibold">Buildathon</span>
          </div>
          <div className="font-mono text-2xs uppercase tracking-label text-ink-400">
            Settlement Intelligence
          </div>
        </div>
      </div>

      <div className="mx-4 mb-3 border-t border-line" />

      <nav className="flex-1 px-2 pb-4" aria-label="Primary">
        {GROUPS.map((group) =>
        <div key={group.label} className="mb-4">
            <div className="px-2 pb-1.5 font-mono text-2xs uppercase tracking-label text-ink-400 font-semibold">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
              const Icon = item.icon;
              const badge = item.badge ? counts[item.badge] : undefined;
              return (
                <li key={item.to}>
                    <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                    twMerge(
                      'group relative flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] transition-all duration-150 ease-out rounded-md font-medium',
                      isActive ?
                      'bg-surface-elevated text-white border border-line/60 shadow-sm' :
                      'text-ink-300 hover:bg-surface-sub hover:text-white'
                    )
                    }>
                    
                      {({ isActive }) =>
                    <>
                          <span
                        className={twMerge(
                          'absolute inset-y-1.5 left-0 w-[3px] rounded-r-full transition-colors',
                          isActive ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-transparent'
                        )}
                        aria-hidden />
                      
                          <Icon className={twMerge('h-4 w-4 shrink-0 transition-colors', isActive ? 'text-cyan-400' : 'text-ink-400 group-hover:text-ink-200')} aria-hidden />
                          <span className="truncate">{item.label}</span>
                          {badge ?
                      <span
                        className={twMerge(
                          'tnum ml-auto min-w-[20px] rounded px-1.5 py-0.5 text-center font-mono text-2xs font-semibold',
                          item.badge === 'approvals' ?
                          'bg-warn-soft text-amber-400 border border-warn-line' :
                          'bg-crit-soft text-red-400 border border-crit-line'
                        )}>
                        
                              {badge}
                            </span> :
                      null}
                        </>
                    }
                    </NavLink>
                  </li>);

            })}
            </ul>
          </div>
        )}
      </nav>

      <div className="mt-auto border-t border-line px-4 py-2.5 bg-surface/50">
        <div className="flex items-center gap-2 font-mono text-2xs text-ink-400">
          <span className="h-1.5 w-1.5 rounded-full bg-pos animate-pulse" />
          <span>Ledger Engine Sync: Live</span>
        </div>
      </div>
      <div className="flex items-center gap-2.5 border-t border-line px-4 py-3 bg-surface">
        <div className="flex h-7 w-7 items-center justify-center rounded border border-brand/30 bg-brand/10 font-mono text-2xs font-semibold text-brand">
          AR
        </div>
        <div className="min-w-0 leading-tight">
          <div className="truncate text-xs font-semibold text-ink-100">Anusha Rangan</div>
          <div className="truncate font-mono text-2xs uppercase tracking-label text-ink-400">
            Controller · Approver L2
          </div>
        </div>
      </div>
    </div>);

}
