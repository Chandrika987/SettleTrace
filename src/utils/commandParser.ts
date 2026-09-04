import type { AnomalyCategory, Settlement } from '../types';
import { settlements as seedSettlements } from '../data/settlements';
import { merchantNames as seedMerchants } from '../data/merchants';
import { CATEGORY_LABEL } from '../data/taxonomy';

export const TODAY = '2026-08-30';
const WEEK_START = '2026-08-24';
const MONTH_START = '2026-08-01';

export interface QueryFilters {
  merchant?: string;
  processor?: string;
  status?: Settlement['status'];
  category?: AnomalyCategory;
  minAmount?: number;
  range?: 'today' | 'week' | 'month';
  varianceOnly?: boolean;
}

export interface ParsedQuery {
  raw: string;
  intent: 'investigate' | 'search' | 'navigate';
  settlementId?: string;
  route?: string;
  routeLabel?: string;
  filters: QueryFilters;
  chips: { label: string; value: string }[];
  results: Settlement[];
  summary: string;
}

const CATEGORY_KEYWORDS: { re: RegExp; category: AnomalyCategory }[] = [
  { re: /\bfee\b|fee variance|gateway fee/i, category: 'fee_variance' },
  { re: /timing|cut-?off|delayed|late/i, category: 'timing_mismatch' },
  { re: /missing|not credited|never (arrived|received)/i, category: 'missing_settlement' },
  { re: /duplicate|double/i, category: 'duplicate_transaction' },
  { re: /refund/i, category: 'refund_mismatch' },
  { re: /chargeback|dispute/i, category: 'chargeback_mismatch' },
  { re: /currency|fx|forex|conversion/i, category: 'currency_variance' },
  { re: /unexplained|unknown|unattributed/i, category: 'unknown' }
];

const ROUTE_KEYWORDS: { re: RegExp; route: string; label: string }[] = [
  { re: /approval|approve queue|awaiting approval|authoris/i, route: '/approvals', label: 'Approval Queue' },
  { re: /audit|who (approved|changed)|immutable/i, route: '/audit', label: 'Audit Trail' },
  { re: /analytics|reconciliation rate|resolution time|false positive/i, route: '/analytics', label: 'Analytics' },
  { re: /data source|connector|sync|ingest/i, route: '/sources', label: 'Data Sources' },
  { re: /lineage|where did (this |the )?money go|explorer|drill/i, route: '/explorer', label: 'Settlement Explorer' },
  { re: /anomaly intelligence|risk matrix|anomalies today/i, route: '/anomalies', label: 'Anomaly Intelligence' },
  { re: /threshold|rule|settings|role/i, route: '/settings', label: 'Settings' }
];

function parseAmount(q: string): number | undefined {
  const m = q.match(/(?:above|over|greater than|more than|>)\s*₹?\s*([\d,.]+)\s*(l(?:akh)?|cr(?:ore)?|k)?/i);
  if (!m) return undefined;
  const base = Number(m[1].replace(/,/g, ''));
  if (Number.isNaN(base)) return undefined;
  const unit = (m[2] ?? '').toLowerCase();
  if (unit.startsWith('l')) return base * 1_00_000;
  if (unit.startsWith('c')) return base * 1_00_00_000;
  if (unit === 'k') return base * 1_000;
  return base;
}

export function applyFilters(rows: Settlement[], f: QueryFilters): Settlement[] {
  return rows.filter((s) => {
    if (f.merchant && s.merchant !== f.merchant) return false;
    if (f.processor && s.processor !== f.processor) return false;
    if (f.status && s.status !== f.status) return false;
    if (f.category && s.category !== f.category) return false;
    if (f.varianceOnly && s.variance === 0) return false;
    if (f.minAmount != null && Math.abs(s.variance) < f.minAmount) return false;
    if (f.range === 'today' && s.date !== TODAY) return false;
    if (f.range === 'week' && s.date < WEEK_START) return false;
    if (f.range === 'month' && s.date < MONTH_START) return false;
    return true;
  });
}

export function parseQuery(
  raw: string,
  settlementList: Settlement[] = seedSettlements,
  merchantList: string[] = seedMerchants
): ParsedQuery {
  const q = raw.trim();
  const chips: { label: string; value: string }[] = [];
  const filters: QueryFilters = {};

  const idMatch = q.match(/SET[_\-\s]?(\d{6})/i);
  if (idMatch) {
    const id = `SET_${idMatch[1]}`;
    const exists = settlementList.some((s) => s.id === id);
    if (exists) {
      return {
        raw: q,
        intent: 'investigate',
        settlementId: id,
        route: `/investigation/${id}`,
        routeLabel: 'Investigation Workspace',
        filters: {},
        chips: [{ label: 'Settlement', value: id }],
        results: settlementList.filter((s) => s.id === id),
        summary: `Open the investigation workspace for ${id}.`
      };
    }
  }

  const merchant = merchantList.find((m) => new RegExp(`\\b${m}\\b`, 'i').test(q));
  if (merchant) {
    filters.merchant = merchant;
    chips.push({ label: 'Merchant', value: merchant });
  }

  const processor = ['Razorpay', 'PayU', 'Cashfree', 'HDFC Payment Gateway'].find((p) =>
    new RegExp(p.split(' ')[0], 'i').test(q)
  ) as Settlement['processor'] | undefined;
  if (processor && !/^hdfc\s*••/.test(q)) {
    filters.processor = processor;
    chips.push({ label: 'Processor', value: processor });
  }

  const cat = CATEGORY_KEYWORDS.find((c) => c.re.test(q));
  if (cat) {
    filters.category = cat.category;
    chips.push({ label: 'Anomaly type', value: CATEGORY_LABEL[cat.category] });
  }

  if (/\breconciled\b/i.test(q)) {
    filters.status = 'reconciled';
    chips.push({ label: 'Status', value: 'Reconciled' });
  } else if (/\binvestigat(ing|ion)\b/i.test(q) && !cat) {
    filters.status = 'investigating';
    chips.push({ label: 'Status', value: 'Investigating' });
  } else if (/\banomal|discrepanc|variance|difference|mismatch|unexplained\b/i.test(q)) {
    filters.varianceOnly = true;
    chips.push({ label: 'Scope', value: 'Variance ≠ ₹0' });
  }

  const min = parseAmount(q);
  if (min != null) {
    filters.minAmount = min;
    chips.push({ label: 'Variance above', value: `₹${min.toLocaleString('en-IN')}` });
  }

  if (/\btoday\b/i.test(q)) {
    filters.range = 'today';
    chips.push({ label: 'Period', value: 'Today · 30 Aug 2026' });
  } else if (/this week|last 7|past week|7 days/i.test(q)) {
    filters.range = 'week';
    chips.push({ label: 'Period', value: '24–30 Aug 2026' });
  } else if (/this month|30 days|august/i.test(q)) {
    filters.range = 'month';
    chips.push({ label: 'Period', value: 'Aug 2026' });
  }

  const route = ROUTE_KEYWORDS.find((r) => r.re.test(q));
  const results = applyFilters(settlementList, filters);

  if (route && chips.length === 0) {
    return {
      raw: q,
      intent: 'navigate',
      route: route.route,
      routeLabel: route.label,
      filters,
      chips: [{ label: 'Destination', value: route.label }],
      results: [],
      summary: `Go to ${route.label}.`
    };
  }

  return {
    raw: q,
    intent: 'search',
    route: '/reconciliation',
    routeLabel: 'Reconciliation',
    filters,
    chips,
    results,
    summary: chips.length
      ? `${results.length} settlement${results.length === 1 ? '' : 's'} match this query.`
      : 'Add a merchant, amount, anomaly type or period to narrow the search.'
  };
}

export function filtersToSearchParams(f: QueryFilters): string {
  const p = new URLSearchParams();
  if (f.merchant) p.set('merchant', f.merchant);
  if (f.processor) p.set('processor', f.processor);
  if (f.status) p.set('status', f.status);
  if (f.category) p.set('category', f.category);
  if (f.minAmount != null) p.set('min', String(f.minAmount));
  if (f.range) p.set('range', f.range);
  if (f.varianceOnly) p.set('variance', '1');
  return p.toString();
}

export function searchParamsToFilters(p: URLSearchParams): QueryFilters {
  const f: QueryFilters = {};
  const merchant = p.get('merchant');
  const processor = p.get('processor');
  const status = p.get('status');
  const category = p.get('category');
  const min = p.get('min');
  const range = p.get('range');
  if (merchant) f.merchant = merchant;
  if (processor) f.processor = processor as Settlement['processor'];
  if (status) f.status = status as Settlement['status'];
  if (category) f.category = category as AnomalyCategory;
  if (min) f.minAmount = Number(min);
  if (range === 'today' || range === 'week' || range === 'month') f.range = range;
  if (p.get('variance') === '1') f.varianceOnly = true;
  return f;
}