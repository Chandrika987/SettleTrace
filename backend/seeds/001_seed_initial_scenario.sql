-- Initial Deterministic Financial Seed Scenario for SettleTrace

-- 1. Merchant
INSERT INTO merchants (id, merchant_id, name, email)
VALUES ('00000000-0000-0000-0000-000000000001', 'MERCH_DEMO_01', 'Acme E-Commerce Pvt Ltd', 'finance@acme.com')
ON CONFLICT (merchant_id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Payment (₹4,86,160.00)
INSERT INTO payments (id, payment_id, merchant_id, amount, currency, status, payment_method, captured_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'PAY_20260901_001',
  '00000000-0000-0000-0000-000000000001',
  486160.00,
  'INR',
  'CAPTURED',
  'UPI',
  '2026-09-01 10:30:00+05:30'
)
ON CONFLICT (payment_id) DO NOTHING;

-- 3. Refund (₹3,730.00)
INSERT INTO refunds (id, refund_id, payment_id, merchant_id, amount, currency, status, reason, processed_at)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'RFD_20260902_001',
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  3730.00,
  'INR',
  'PROCESSED',
  'Customer Return',
  '2026-09-02 14:15:00+05:30'
)
ON CONFLICT (refund_id) DO NOTHING;

-- 4. Settlement (Gross: ₹4,86,160, Deductions: ₹3,730, Expected Net: ₹4,82,430)
INSERT INTO settlements (id, settlement_id, merchant_id, gross_amount, deductions_amount, net_amount, currency, status, settled_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'SETTLE_20260903_001',
  '00000000-0000-0000-0000-000000000001',
  486160.00,
  3730.00,
  482430.00,
  'INR',
  'SETTLED',
  '2026-09-03 18:00:00+05:30'
)
ON CONFLICT (settlement_id) DO NOTHING;

-- 5. Settlement Line Items (3 items)
INSERT INTO settlement_line_items (id, settlement_id, entity_type, entity_id, amount, fee_amount, tax_amount, currency, description)
VALUES 
(
  '44444444-4444-4444-4444-444444444441',
  '33333333-3333-3333-3333-333333333333',
  'PAYMENT',
  '11111111-1111-1111-1111-111111111111',
  486160.00,
  0.00,
  0.00,
  'INR',
  'Payment PAY_20260901_001 Gross Settlement Credit'
),
(
  '44444444-4444-4444-4444-444444444442',
  '33333333-3333-3333-3333-333333333333',
  'REFUND',
  '22222222-2222-2222-2222-222222222222',
  -3730.00,
  0.00,
  0.00,
  'INR',
  'Refund RFD_20260902_001 Settlement Deduction'
),
(
  '44444444-4444-4444-4444-444444444443',
  '33333333-3333-3333-3333-333333333333',
  'FEE',
  NULL,
  0.00,
  0.00,
  0.00,
  'INR',
  'Standard Gateway Settlement Fee Waiver'
)
ON CONFLICT (id) DO NOTHING;

-- 6. Bank Transaction (Bank Credit: ₹4,78,700.00)
INSERT INTO bank_transactions (id, bank_transaction_id, merchant_id, amount, currency, transaction_type, reference_number, utr_number, posted_at)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'BANK_TXN_20260904_001',
  '00000000-0000-0000-0000-000000000001',
  478700.00,
  'INR',
  'CREDIT',
  'SETTLE_20260903_001',
  'UTR998877665544',
  '2026-09-04 09:00:00+05:30'
)
ON CONFLICT (bank_transaction_id) DO NOTHING;

-- 7. Ledger Entry (Merchant settlement receivable)
INSERT INTO ledger_entries (id, entry_id, merchant_id, account_type, debit_amount, credit_amount, currency, description, posted_at)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  'LEDGER_20260904_001',
  '00000000-0000-0000-0000-000000000001',
  'BANK_RECEIVABLE',
  478700.00,
  0.00,
  'INR',
  'Bank settlement credit posting for UTR998877665544',
  '2026-09-04 09:15:00+05:30'
)
ON CONFLICT (entry_id) DO NOTHING;

-- Data Sources entry
INSERT INTO data_sources (id, name, source_type, status, last_synced_at)
VALUES 
('77777777-7777-7777-7777-777777777771', 'Razorpay Gateway', 'GATEWAY_API', 'ACTIVE', '2026-09-04 10:00:00+05:30'),
('77777777-7777-7777-7777-777777777772', 'HDFC Bank Feed', 'BANK_STATEMENT', 'ACTIVE', '2026-09-04 10:00:00+05:30')
ON CONFLICT (id) DO NOTHING;
