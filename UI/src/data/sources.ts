import type { DataSource } from '../types';

export const dataSources: DataSource[] = [
{
  id: 'SRC_RZP',
  name: 'Razorpay',
  kind: 'Payment processor · Settlement API',
  status: 'connected',
  lastSync: '30 Aug 2026, 16:42 IST · 3 min ago',
  records: 418240,
  errors: 0,
  coverage: 99.4,
  cadence: 'Every 15 minutes',
  authMode: 'OAuth 2.0 · key rotated 12 Aug 2026'
},
{
  id: 'SRC_HDFC',
  name: 'Bank Statement',
  kind: 'HDFC Bank · MT940 + API',
  status: 'connected',
  lastSync: '30 Aug 2026, 16:30 IST · 15 min ago',
  records: 96118,
  errors: 2,
  coverage: 97.1,
  cadence: 'Every 30 minutes',
  authMode: 'Corporate API · IP allow-list'
},
{
  id: 'SRC_LEDGER',
  name: 'Accounting Ledger',
  kind: 'Tally Prime · Journal sync',
  status: 'connected',
  lastSync: '30 Aug 2026, 16:00 IST · 45 min ago',
  records: 204882,
  errors: 0,
  coverage: 98.8,
  cadence: 'Hourly',
  authMode: 'Service account · read/write'
},
{
  id: 'SRC_CSV',
  name: 'Settlement CSV',
  kind: 'SFTP drop · processor advice files',
  status: 'degraded',
  lastSync: '30 Aug 2026, 11:05 IST · 5 hr ago',
  records: 12406,
  errors: 14,
  coverage: 82.3,
  cadence: 'Daily, 11:00 IST',
  authMode: 'SFTP key · expires 18 Sep 2026'
},
{
  id: 'SRC_PAYU',
  name: 'PayU',
  kind: 'Payment processor · Settlement API',
  status: 'connected',
  lastSync: '30 Aug 2026, 16:38 IST · 7 min ago',
  records: 187330,
  errors: 1,
  coverage: 96.2,
  cadence: 'Every 15 minutes',
  authMode: 'API key · rotated 02 Jul 2026'
},
{
  id: 'SRC_CF',
  name: 'Cashfree',
  kind: 'Payment processor · Settlement API',
  status: 'syncing',
  lastSync: 'In progress · started 16:44 IST',
  records: 144902,
  errors: 0,
  coverage: 95.5,
  cadence: 'Every 15 minutes',
  authMode: 'OAuth 2.0 · key rotated 01 Aug 2026'
}];


export const pipelineStages = [
{ id: 'ingest', label: 'Ingest', detail: '6 connectors', volume: '1.06 M records / 24h', status: 'ok' as const },
{ id: 'normalise', label: 'Normalise', detail: 'Schema + currency', volume: '1.06 M mapped', status: 'ok' as const },
{ id: 'match', label: 'Match', detail: 'Deterministic + fuzzy', volume: '99.1% matched', status: 'ok' as const },
{ id: 'detect', label: 'Detect', detail: '14 rules · 6 models', volume: '12 anomalies open', status: 'warn' as const },
{ id: 'propose', label: 'Propose', detail: 'Journal drafting', volume: '9 proposals ready', status: 'ok' as const },
{ id: 'approve', label: 'Approve', detail: 'Human authorisation', volume: '12 awaiting', status: 'warn' as const }];