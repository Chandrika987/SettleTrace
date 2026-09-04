import { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { SkeletonRows } from './States';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  width?: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => number | string;
  headClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  activeKey?: string | null;
  loading?: boolean;
  empty?: React.ReactNode;
  initialSort?: {key: string;dir: 'asc' | 'desc';};
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  activeKey,
  loading,
  empty,
  initialSort,
  className
}: DataTableProps<T>) {
  const [sort, setSort] = useState(initialSort ?? null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [rows, sort, columns]);

  function toggle(key: string) {
    setSort((prev) =>
    prev && prev.key === key ?
    { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } :
    { key, dir: 'desc' }
    );
  }

  if (loading) return <SkeletonRows rows={8} cols={columns.length} />;
  if (!rows.length && empty) return <>{empty}</>;

  return (
    <div className={twMerge('rr-scroll overflow-x-auto', className)}>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-line bg-surface/90 sticky top-0 z-10 backdrop-blur-sm">
            {columns.map((col) => {
              const sortable = Boolean(col.sortValue);
              const active = sort?.key === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  style={col.width ? { width: col.width } : undefined}
                  className={twMerge(
                    'whitespace-nowrap px-4 py-2.5 font-mono text-2xs font-medium uppercase tracking-label text-ink-400',
                    col.align === 'right' ? 'text-right' : 'text-left',
                    col.headClassName
                  )}>
                  
                  {sortable ?
                  <button
                    type="button"
                    onClick={() => toggle(col.key)}
                    className={twMerge(
                      'inline-flex items-center gap-1 uppercase tracking-label transition-colors duration-150 ease-out hover:text-white',
                      active ? 'text-white font-semibold' : 'text-ink-400',
                      col.align === 'right' && 'flex-row-reverse'
                    )}
                    aria-label={`Sort by ${col.header}`}>
                    
                      {col.header}
                      {active ?
                    sort!.dir === 'asc' ?
                    <ArrowUpIcon className="h-3 w-3 text-brand" aria-hidden /> :

                    <ArrowDownIcon className="h-3 w-3 text-brand" aria-hidden /> :

                    null}
                    </button> :

                  col.header
                  }
                </th>);

            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const key = rowKey(row);
            const isActive = activeKey === key;
            return (
              <tr
                key={key}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                onRowClick ?
                (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRowClick(row);
                  }
                } :
                undefined
                }
                className={twMerge(
                  'border-b border-hairline transition-colors duration-150 ease-out',
                  onRowClick &&
                  'cursor-pointer hover:bg-surface-hover focus:outline-none focus-visible:bg-brand-soft',
                  isActive && 'bg-brand-soft/60 hover:bg-brand-soft/80'
                )}>
                
                {columns.map((col) =>
                <td
                  key={col.key}
                  className={twMerge(
                    'rr-cell whitespace-nowrap px-4 align-middle text-ink-300',
                    col.align === 'right' && 'text-right',
                    isActive && 'text-white font-medium',
                    col.cellClassName
                  )}>
                  
                    {col.cell(row)}
                  </td>
                )}
              </tr>);

          })}
        </tbody>
      </table>
    </div>);

}