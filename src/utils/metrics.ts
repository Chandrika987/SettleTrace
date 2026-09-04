import type { Settlement } from '../types';

export interface OverviewMetrics {
  volume: number;
  reconciled: number;
  unreconciled: number;
  atRisk: number;
  anomalies: number;
  pendingApprovals: number;
  settlementCount: number;
  txnCount: number;
  reconciledPct: number;
  anomalousPct: number;
  pendingPct: number;
}

export function computeOverview(
settlements: Settlement[],
pendingApprovals: number)
: OverviewMetrics {
  const volume = settlements.reduce((a, s) => a + s.expected, 0);
  const reconciled = settlements.
  filter((s) => s.status === 'reconciled' || s.status === 'approved').
  reduce((a, s) => a + s.expected, 0);
  const open = settlements.filter((s) => s.status === 'anomaly' || s.status === 'investigating');
  const unreconciled = open.reduce((a, s) => a + s.expected, 0);
  const atRisk = open.reduce((a, s) => a + Math.abs(s.variance), 0);
  const pending = settlements.
  filter((s) => s.status === 'pending').
  reduce((a, s) => a + s.expected, 0);
  return {
    volume,
    reconciled,
    unreconciled,
    atRisk,
    anomalies: open.length,
    pendingApprovals,
    settlementCount: settlements.length,
    txnCount: settlements.reduce((a, s) => a + s.txnCount, 0),
    reconciledPct: reconciled / volume * 100,
    anomalousPct: unreconciled / volume * 100,
    pendingPct: pending / volume * 100
  };
}