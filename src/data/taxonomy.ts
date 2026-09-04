import type { AnomalyCategory, Severity, SettlementStatus } from '../types';

export const CATEGORY_LABEL: Record<AnomalyCategory, string> = {
  fee_variance: 'Fee variance',
  timing_mismatch: 'Timing mismatch',
  missing_settlement: 'Missing settlement',
  duplicate_transaction: 'Duplicate transaction',
  refund_mismatch: 'Refund mismatch',
  chargeback_mismatch: 'Chargeback mismatch',
  currency_variance: 'Currency variance',
  unknown: 'Unknown variance'
};

export const CATEGORY_ORDER: AnomalyCategory[] = [
'fee_variance',
'timing_mismatch',
'missing_settlement',
'duplicate_transaction',
'refund_mismatch',
'chargeback_mismatch',
'currency_variance',
'unknown'];


export const STATUS_LABEL: Record<SettlementStatus, string> = {
  reconciled: 'Reconciled',
  anomaly: 'Anomaly',
  pending: 'Pending',
  investigating: 'Investigating',
  approved: 'Approved'
};

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

export const PROCESSORS = ['Razorpay', 'PayU', 'Cashfree', 'HDFC Payment Gateway'] as const;

export const BANK_ACCOUNTS = [
'HDFC ••4471 — Settlement',
'ICICI ••8802 — Nodal',
'Axis ••1190 — Collections',
'Kotak ••6634 — Payouts'];