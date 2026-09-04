import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRightIcon, DownloadIcon, EyeIcon, XIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { FilterBar, type FilterDef } from '../components/ui/FilterBar';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Amount } from '../components/ui/Amount';
import { ConfidenceBar } from '../components/ui/Confidence';
import { SeverityBadge, StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/States';
import { QuickLookDrawer } from '../components/reconciliation/QuickLookDrawer';
import { useRecon } from '../contexts/ReconContext';
import { getMerchantNames } from '../services/merchantService';
import { BANK_ACCOUNTS, PROCESSORS, STATUS_LABEL } from '../data/taxonomy';
import { formatCompactINR, formatDate, formatINR } from '../utils/format';
import type { Settlement } from '../types';
import { TODAY } from '../utils/commandParser';

export function Reconciliation() {
  const { settlements } = useRecon();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [merchantNames, setMerchantNames] = useState<string[]>([]);

  useEffect(() => {
    getMerchantNames().then(setMerchantNames);
  }, []);

  const batches = useMemo(
    () => Array.from(new Set(settlements.map((s) => s.batch))).sort().reverse(),
    [settlements]
  );

  const filtersDef: FilterDef[] = useMemo(
    () => [
      { id: 'date', label: 'Date', options: ['All dates', 'Today', 'Last 7 days', 'This month'] },
      { id: 'merchant', label: 'Merchant', options: ['All merchants', ...merchantNames] },
      { id: 'processor', label: 'Processor', options: ['All processors', ...PROCESSORS] },
      { id: 'bank', label: 'Bank account', options: ['All accounts', ...BANK_ACCOUNTS] },
      { id: 'batch', label: 'Batch', options: ['All batches', ...batches] },
      {
        id: 'status',
        label: 'Status',
        options: ['All statuses', 'Reconciled', 'Anomaly', 'Investigating', 'Approved']
      },
      { id: 'severity', label: 'Severity', options: ['All severities', 'Critical', 'High', 'Medium', 'Low'] }
    ],
    [merchantNames, batches]
  );

  const defaults = useMemo(
    () =>
      filtersDef.reduce<Record<string, string>>((acc, f) => {
        acc[f.id] = f.options[0];
        return acc;
      }, {}),
    [filtersDef]
  );

  const [filters, setFilters] = useState<Record<string, string>>(() => {
    const next = { ...defaults };
    const merchant = params.get('merchant');
    const processor = params.get('processor');
    const status = params.get('status');
    const range = params.get('range');
    if (merchant) next.merchant = merchant;
    if (processor) next.processor = processor;
    if (status) next.status = STATUS_LABEL[status as Settlement['status']] ?? next.status;
    if (range === 'today') next.date = 'Today';
    if (range === 'week') next.date = 'Last 7 days';
    if (range === 'month') next.date = 'This month';
    return next;
  });

  const [quickLook, setQuickLook] = useState<Settlement | null>(null);

  // Re-apply filters when a financial-search query lands on this screen.
  const paramKey = params.toString();
  useEffect(() => {
    const next = { ...defaults };
    const merchant = params.get('merchant');
    const processor = params.get('processor');
    const status = params.get('status');
    const range = params.get('range');
    if (merchant) next.merchant = merchant;
    if (processor) next.processor = processor;
    if (status) next.status = STATUS_LABEL[status as Settlement['status']] ?? next.status;
    if (range === 'today') next.date = 'Today';
    if (range === 'week') next.date = 'Last 7 days';
    if (range === 'month') next.date = 'This month';
    setFilters(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey, defaults]);

  const minAmount = params.get('min') ? Number(params.get('min')) : undefined;
  const categoryParam = params.get('category');
  const varianceOnly = params.get('variance') === '1';

  const rows = useMemo(() => {
    return settlements.filter((s) => {
      if (filters.merchant !== 'All merchants' && s.merchant !== filters.merchant) return false;
      if (filters.processor !== 'All processors' && s.processor !== filters.processor) return false;
      if (filters.bank !== 'All accounts' && s.bankAccount !== filters.bank) return false;
      if (filters.batch !== 'All batches' && s.batch !== filters.batch) return false;
      if (filters.status !== 'All statuses' && STATUS_LABEL[s.status] !== filters.status) return false;
      if (
      filters.severity !== 'All severities' &&
      s.severity !== filters.severity.toLowerCase())

      return false;
      if (filters.date === 'Today' && s.date !== TODAY) return false;
      if (filters.date === 'Last 7 days' && s.date < '2026-08-24') return false;
      if (filters.date === 'This month' && s.date < '2026-08-01') return false;
      if (categoryParam && s.category !== categoryParam) return false;
      if (varianceOnly && s.variance === 0) return false;
      if (minAmount != null && Math.abs(s.variance) < minAmount) return false;
      return true;
    });
  }, [settlements, filters, categoryParam, varianceOnly, minAmount]);

  const totals = useMemo(
    () => ({
      expected: rows.reduce((a, s) => a + s.expected, 0),
      received: rows.reduce((a, s) => a + s.received, 0),
      variance: rows.reduce((a, s) => a + s.variance, 0),
      open: rows.filter((s) => s.status === 'anomaly' || s.status === 'investigating').length
    }),
    [rows]
  );

  const columns: Column<Settlement>[] = [
  {
    key: 'id',
    header: 'Settlement ID',
    width: '124px',
    sortValue: (r) => r.id,
    cell: (r) => <span className="tnum font-mono text-xs text-ink-50 font-medium">{r.id}</span>
  },
  {
    key: 'merchant',
    header: 'Merchant',
    sortValue: (r) => r.merchant,
    cell: (r) =>
    <span>
          <span className="text-ink-50 font-medium">{r.merchant}</span>
          <span className="tnum ml-2 font-mono text-2xs text-ink-400">{r.merchantId}</span>
        </span>

  },
  {
    key: 'processor',
    header: 'Processor',
    sortValue: (r) => r.processor,
    cell: (r) => <span className="text-ink-300">{r.processor}</span>
  },
  {
    key: 'date',
    header: 'Settlement date',
    sortValue: (r) => r.date,
    cell: (r) => <span className="tnum font-mono text-xs text-ink-300">{formatDate(r.date)}</span>
  },
  {
    key: 'expected',
    header: 'Expected',
    align: 'right',
    sortValue: (r) => r.expected,
    cell: (r) => <Amount value={r.expected} className="text-[13px]" />
  },
  {
    key: 'received',
    header: 'Bank amount',
    align: 'right',
    sortValue: (r) => r.received,
    cell: (r) =>
    r.received === 0 ?
    <span className="font-mono text-xs text-crit font-medium">not credited</span> :

    <Amount value={r.received} className="text-[13px]" />

  },
  {
    key: 'variance',
    header: 'Variance',
    align: 'right',
    sortValue: (r) => Math.abs(r.variance),
    cell: (r) => <Amount value={r.variance} variance className="text-[13px] font-semibold" />
  },
  {
    key: 'status',
    header: 'Status',
    sortValue: (r) => r.status,
    cell: (r) => <StatusBadge status={r.status} />
  },
  {
    key: 'severity',
    header: 'Severity',
    sortValue: (r) => r.severity,
    cell: (r) => <SeverityBadge severity={r.severity} />
  },
  {
    key: 'confidence',
    header: 'Confidence',
    align: 'right',
    sortValue: (r) => r.confidence,
    cell: (r) => <ConfidenceBar value={r.confidence} className="justify-end" width="w-12" />
  },
  {
    key: 'action',
    header: 'Action',
    align: 'right',
    cell: (r) =>
    <span className="inline-flex items-center justify-end gap-2">
          <button
        type="button"
        aria-label={`Quick look at ${r.id}`}
        onClick={(e) => {
          e.stopPropagation();
          setQuickLook(r);
        }}
        className="inline-flex h-6 w-6 items-center justify-center rounded-sm border border-line text-ink-400 transition-colors duration-150 ease-out hover:border-brand-line hover:bg-brand-soft hover:text-brand">
        
            <EyeIcon className="h-3 w-3" aria-hidden />
          </button>
          <span className="inline-flex items-center gap-1 font-mono text-2xs uppercase tracking-label text-brand font-medium">
            {r.status === 'reconciled' ? 'View' : 'Investigate'}
            <ArrowRightIcon className="h-3 w-3" aria-hidden />
          </span>
        </span>

  }];


  function clearParamChips() {
    const next = new URLSearchParams(params);
    next.delete('min');
    next.delete('category');
    next.delete('variance');
    setParams(next, { replace: true });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Reconciliation"
        title="Settlement reconciliation"
        subtitle="Every expected payout matched against the bank credit and the ledger entry."
        right={
        <>
            <Button>
              <DownloadIcon className="h-3 w-3" aria-hidden />
              Export {rows.length} rows
            </Button>
            <Button variant="primary" onClick={() => navigate('/approvals')}>
              Approval queue
            </Button>
          </>
        } />
      

      <div className="px-5 py-5 lg:px-7 lg:py-6">
        <Panel>
          <FilterBar
            filters={filtersDef}
            value={filters}
            onChange={(id, next) => setFilters((p) => ({ ...p, [id]: next }))}
            onReset={() => setFilters({ ...defaults })}
            right={
            <span className="tnum font-mono text-2xs uppercase tracking-label text-ink-400">
                {rows.length} of {settlements.length} settlements
              </span>
            } />
          

          {minAmount != null || categoryParam || varianceOnly ?
          <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-brand-soft/40 px-3 py-2">
              <span className="font-mono text-2xs uppercase tracking-label text-brand font-medium">
                From financial search
              </span>
              {varianceOnly ? <Chip>Variance ≠ ₹0</Chip> : null}
              {categoryParam ? <Chip>{categoryParam.replace(/_/g, ' ')}</Chip> : null}
              {minAmount != null ? <Chip>Variance above {formatINR(minAmount)}</Chip> : null}
              <button
              type="button"
              onClick={clearParamChips}
              className="inline-flex items-center gap-1 font-mono text-2xs uppercase tracking-label text-ink-400 transition-colors duration-150 ease-out hover:text-white">
              
                <XIcon className="h-3 w-3" aria-hidden />
                Remove
              </button>
            </div> :
          null}

          <div className="grid grid-cols-2 divide-x divide-hairline border-b border-hairline bg-canvas/40 lg:grid-cols-4">
            <Total label="Expected" value={formatCompactINR(totals.expected)} />
            <Total label="Credited" value={formatCompactINR(totals.received)} />
            <Total
              label="Net variance"
              value={formatINR(totals.variance)}
              tone={totals.variance === 0 ? 'text-white' : 'text-crit'} />
            
            <Total
              label="Open items"
              value={String(totals.open)}
              tone={totals.open ? 'text-amber-400' : 'text-emerald-400'} />
            
          </div>

          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            onRowClick={(r) => navigate(`/investigation/${r.id}`)}
            initialSort={{ key: 'date', dir: 'desc' }}
            empty={
            <EmptyState
              title="No settlements match these filters"
              message="Widen the date range or clear a filter. Reconciliation only hides rows — nothing is ever deleted from the settlement book."
              action={{ label: 'Reset filters', onClick: () => setFilters({ ...defaults }) }} />

            } />
          
        </Panel>

        <p className="mt-3 font-mono text-2xs uppercase tracking-label text-ink-400">
          AI recommends · evidence explains · humans control · every action auditable
        </p>

        <QuickLookDrawer settlement={quickLook} onClose={() => setQuickLook(null)} />
      </div>
    </div>);

}

function Chip({ children }: {children: React.ReactNode;}) {
  return (
    <span className="border border-brand-line bg-surface px-1.5 py-0.5 text-2xs font-medium capitalize text-brand rounded-sm">
      {children}
    </span>);

}

function Total({ label, value, tone = 'text-white' }: {label: string;value: string;tone?: string;}) {
  return (
    <div className="px-4 py-2.5">
      <div className="font-mono text-2xs uppercase tracking-label text-ink-400 font-medium">{label}</div>
      <div className={`tnum mt-0.5 font-mono text-sm font-semibold ${tone}`}>{value}</div>
    </div>);

}