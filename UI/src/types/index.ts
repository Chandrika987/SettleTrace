export type SettlementStatus = 'reconciled' | 'anomaly' | 'pending' | 'investigating' | 'approved';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type AnomalyCategory =
'fee_variance' |
'timing_mismatch' |
'missing_settlement' |
'duplicate_transaction' |
'refund_mismatch' |
'chargeback_mismatch' |
'currency_variance' |
'unknown';

export interface Merchant {
  id: string;
  name: string;
  category: string;
  mcc: string;
  gstin: string;
  onboarded: string;
}

export interface Settlement {
  id: string;
  processor: 'Razorpay' | 'PayU' | 'Cashfree' | 'HDFC Payment Gateway';
  merchantId: string;
  merchant: string;
  date: string;
  utr: string;
  bankAccount: string;
  batch: string;
  expected: number;
  received: number;
  variance: number;
  status: SettlementStatus;
  confidence: number;
  category: AnomalyCategory;
  severity: Severity;
  txnCount: number;
  feePct: number;
  currency: 'INR';
  owner?: string;
}

export interface FinancialEvent {
  id: string;
  time: string;
  day: string;
  label: string;
  amount?: number;
  detail: string;
  source: 'processor' | 'bank' | 'ledger' | 'system';
  tone?: 'neutral' | 'pos' | 'warn' | 'crit';
}

export interface Evidence {
  label: string;
  value: string;
  weight: 'strong' | 'supporting' | 'contextual';
}

export interface Investigation {
  settlementId: string;
  finding: string;
  probableCause: string;
  categoryLabel: string;
  evidence: Evidence[];
  confidence: number;
  impact: number;
  recommendedAction: string;
  whyItMatters: string;
  systemic: boolean;
  events: FinancialEvent[];
  proposal: {line: string;account: string;debit?: number;credit?: number;}[];
  alternates: {cause: string;confidence: number;}[];
}

export interface ApprovalCase {
  id: string;
  settlementId: string;
  merchant: string;
  amount: number;
  category: AnomalyCategory;
  confidence: number;
  recommendedAction: string;
  evidenceCount: number;
  ageHours: number;
  severity: Severity;
  urgency: 'breach' | 'today' | 'this_week';
  requiresDualApproval: boolean;
  raisedBy: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorType: 'ai' | 'human' | 'system';
  action: string;
  object: string;
  previousState: string;
  newState: string;
  aiRecommendation: string;
  humanDecision: string;
  hash: string;
}

export interface DataSource {
  id: string;
  name: string;
  kind: string;
  status: 'connected' | 'degraded' | 'error' | 'syncing';
  lastSync: string;
  records: number;
  errors: number;
  coverage: number;
  cadence: string;
  authMode: string;
}

export interface LineageNode {
  id: string;
  stage: 'merchant' | 'payment' | 'transaction' | 'settlement' | 'bank' | 'ledger';
  label: string;
  sub: string;
  amount: number;
  status: 'ok' | 'variance' | 'missing';
}