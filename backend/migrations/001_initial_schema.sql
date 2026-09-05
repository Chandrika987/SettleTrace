-- SettleTrace Core Financial Schema Migration 001

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Merchants
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_merchants_merchant_id ON merchants(merchant_id);

-- 2. Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id VARCHAR(100) UNIQUE NOT NULL,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50),
  captured_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_merchant_id ON payments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_captured_at ON payments(captured_at);

-- 3. Refunds
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  refund_id VARCHAR(100) UNIQUE NOT NULL,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status VARCHAR(50) NOT NULL,
  reason VARCHAR(255),
  processed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_merchant_id ON refunds(merchant_id);
CREATE INDEX IF NOT EXISTS idx_refunds_refund_id ON refunds(refund_id);

-- 4. Chargebacks
CREATE TABLE IF NOT EXISTS chargebacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chargeback_id VARCHAR(100) UNIQUE NOT NULL,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status VARCHAR(50) NOT NULL,
  reason_code VARCHAR(50),
  filed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chargebacks_payment_id ON chargebacks(payment_id);
CREATE INDEX IF NOT EXISTS idx_chargebacks_merchant_id ON chargebacks(merchant_id);

-- 5. Settlements
CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id VARCHAR(100) UNIQUE NOT NULL,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  gross_amount NUMERIC(15, 2) NOT NULL,
  deductions_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  net_amount NUMERIC(15, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status VARCHAR(50) NOT NULL,
  settled_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_settlements_merchant_id ON settlements(merchant_id);
CREATE INDEX IF NOT EXISTS idx_settlements_settlement_id ON settlements(settlement_id);

-- 6. Settlement Line Items
CREATE TABLE IF NOT EXISTS settlement_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  amount NUMERIC(15, 2) NOT NULL,
  fee_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  tax_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  description VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_settlement_line_items_settlement_id ON settlement_line_items(settlement_id);

-- 7. Bank Transactions
CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_transaction_id VARCHAR(100) UNIQUE NOT NULL,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  transaction_type VARCHAR(50) NOT NULL,
  reference_number VARCHAR(100),
  utr_number VARCHAR(100),
  posted_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bank_transactions_merchant_id ON bank_transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_utr_number ON bank_transactions(utr_number);

-- 8. Ledger Entries
CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id VARCHAR(100) UNIQUE NOT NULL,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  account_type VARCHAR(50) NOT NULL,
  debit_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  credit_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  description VARCHAR(255),
  posted_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_merchant_id ON ledger_entries(merchant_id);

-- 9. Reconciliation Cases
CREATE TABLE IF NOT EXISTS reconciliation_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number VARCHAR(100) UNIQUE NOT NULL,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
  discrepancy_amount NUMERIC(15, 2) DEFAULT 0.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_cases_merchant_id ON reconciliation_cases(merchant_id);

-- 10. Anomalies
CREATE TABLE IF NOT EXISTS anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anomaly_code VARCHAR(100) UNIQUE NOT NULL,
  case_id UUID REFERENCES reconciliation_cases(id) ON DELETE SET NULL,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  anomaly_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  impact_amount NUMERIC(15, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
  description TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_anomalies_case_id ON anomalies(case_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_merchant_id ON anomalies(merchant_id);

-- 11. Investigations
CREATE TABLE IF NOT EXISTS investigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_number VARCHAR(100) UNIQUE NOT NULL,
  case_id UUID NOT NULL REFERENCES reconciliation_cases(id) ON DELETE CASCADE,
  anomaly_id UUID REFERENCES anomalies(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_investigations_case_id ON investigations(case_id);

-- 12. Investigation Evidence
CREATE TABLE IF NOT EXISTS investigation_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
  evidence_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  source_entity VARCHAR(50),
  source_id UUID,
  data_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_investigation_evidence_investigation_id ON investigation_evidence(investigation_id);

-- 13. Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  confidence_score NUMERIC(5, 2),
  suggested_impact NUMERIC(15, 2),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recommendations_investigation_id ON recommendations(investigation_id);

-- 14. Approval Cases
CREATE TABLE IF NOT EXISTS approval_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id UUID REFERENCES recommendations(id) ON DELETE SET NULL,
  case_id UUID REFERENCES reconciliation_cases(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW',
  requested_by VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_approval_cases_recommendation_id ON approval_cases(recommendation_id);

-- 15. Approval Actions
CREATE TABLE IF NOT EXISTS approval_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_case_id UUID NOT NULL REFERENCES approval_cases(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  performed_by VARCHAR(255) NOT NULL,
  comments TEXT,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_approval_actions_case_id ON approval_actions(approval_case_id);

-- 16. Audit Events
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  actor VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON audit_events(entity_type, entity_id);

-- 17. Data Sources
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  source_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
