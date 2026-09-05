import assert from 'assert';
import { calculateReconciliation } from '../services/reconciliationService';
import { addMoney, subtractMoney } from '../utils/moneyUtils';

console.log('\n==================================================');
console.log('RUNNING RECONCILIATION ENGINE UNIT TESTS');
console.log('==================================================\n');

let passedTests = 0;
let totalTests = 0;

const runTest = (name: string, fn: () => void) => {
  totalTests++;
  try {
    fn();
    console.log(`✓ [PASS] ${name}`);
    passedTests++;
  } catch (error: any) {
    console.error(`✗ [FAIL] ${name}`);
    console.error(`  Error: ${error.message}`);
    process.exitCode = 1;
  }
};

// 1. MATCHED Case
runTest('MATCHED: Payment ₹100,000 - Refund ₹5,000 = Expected ₹95,000 vs Bank Credit ₹95,000', () => {
  const result = calculateReconciliation(
    'CASE_MATCHED_01',
    'M01',
    'Matched Merchant',
    [{ id: 'p1', payment_id: 'PAY_M1', amount: '100000.00', status: 'CAPTURED' }],
    [{ id: 'r1', refund_id: 'RFD_M1', payment_id: 'p1', amount: '5000.00', status: 'PROCESSED' }],
    [],
    [{ id: 's1', settlement_id: 'SETTLE_M1', gross_amount: '100000.00', deductions_amount: '5000.00', net_amount: '95000.00', status: 'SETTLED' }],
    [
      { id: 'li1', settlement_id: 's1', entity_type: 'PAYMENT', amount: '100000.00', fee_amount: '0.00', tax_amount: '0.00' },
      { id: 'li2', settlement_id: 's1', entity_type: 'REFUND', amount: '-5000.00', fee_amount: '0.00', tax_amount: '0.00' },
    ],
    [{ id: 'b1', bank_transaction_id: 'BANK_M1', amount: '95000.00', transaction_type: 'CREDIT', utr_number: 'UTR_M1' }]
  );

  assert.strictEqual(result.expectedAmount, '95000.00');
  assert.strictEqual(result.actualAmount, '95000.00');
  assert.strictEqual(result.variance, '0.00');
  assert.strictEqual(result.status, 'MATCHED');
  assert.strictEqual(result.lineItemsValid, true);
});

// 2. VARIANCE Case
runTest('VARIANCE: Payment ₹100,000 - Fee ₹3,000 = Expected ₹97,000 vs Bank Credit ₹94,000 (Variance ₹3,000)', () => {
  const result = calculateReconciliation(
    'CASE_VARIANCE_01',
    'M02',
    'Variance Merchant',
    [{ id: 'p2', payment_id: 'PAY_V1', amount: '100000.00', status: 'CAPTURED' }],
    [],
    [],
    [{ id: 's2', settlement_id: 'SETTLE_V1', gross_amount: '100000.00', deductions_amount: '3000.00', net_amount: '97000.00', status: 'SETTLED' }],
    [{ id: 'li3', settlement_id: 's2', entity_type: 'FEE', amount: '97000.00', fee_amount: '3000.00', tax_amount: '0.00' }],
    [{ id: 'b2', bank_transaction_id: 'BANK_V1', amount: '94000.00', transaction_type: 'CREDIT', utr_number: 'UTR_V1' }]
  );

  assert.strictEqual(result.expectedAmount, '97000.00');
  assert.strictEqual(result.actualAmount, '94000.00');
  assert.strictEqual(result.variance, '3000.00');
  assert.strictEqual(result.status, 'VARIANCE');
});

// 3. PARTIAL Case
runTest('PARTIAL: Expected ₹100,000 vs Bank Credit ₹70,000', () => {
  const result = calculateReconciliation(
    'CASE_PARTIAL_01',
    'M03',
    'Partial Merchant',
    [{ id: 'p3', payment_id: 'PAY_P1', amount: '100000.00', status: 'CAPTURED' }],
    [],
    [],
    [{ id: 's3', settlement_id: 'SETTLE_P1', gross_amount: '100000.00', deductions_amount: '0.00', net_amount: '100000.00', status: 'PARTIAL' }],
    [{ id: 'li4', settlement_id: 's3', entity_type: 'PAYMENT', amount: '100000.00', fee_amount: '0.00', tax_amount: '0.00' }],
    [{ id: 'b3', bank_transaction_id: 'BANK_P1', amount: '70000.00', transaction_type: 'CREDIT', utr_number: 'UTR_P1' }]
  );

  assert.strictEqual(result.expectedAmount, '100000.00');
  assert.strictEqual(result.actualAmount, '70000.00');
  assert.strictEqual(result.variance, '30000.00');
  assert.strictEqual(result.status, 'PARTIAL');
});

// 4. MISSING Case
runTest('MISSING: Expected ₹100,000 with missing bank transaction', () => {
  const result = calculateReconciliation(
    'CASE_MISSING_01',
    'M04',
    'Missing Merchant',
    [{ id: 'p4', payment_id: 'PAY_MIS1', amount: '100000.00', status: 'CAPTURED' }],
    [],
    [],
    [],
    [],
    []
  );

  assert.strictEqual(result.expectedAmount, '100000.00');
  assert.strictEqual(result.actualAmount, '0.00');
  assert.strictEqual(result.status, 'MISSING');
});

// 5. DUPLICATE Case
runTest('DUPLICATE: Duplicate UTR reference in bank transactions', () => {
  const result = calculateReconciliation(
    'CASE_DUP_01',
    'M05',
    'Duplicate Merchant',
    [{ id: 'p5', payment_id: 'PAY_DUP1', amount: '50000.00', status: 'CAPTURED' }],
    [],
    [],
    [{ id: 's5', settlement_id: 'SETTLE_D1', gross_amount: '50000.00', deductions_amount: '0.00', net_amount: '50000.00', status: 'SETTLED' }],
    [],
    [
      { id: 'b5a', bank_transaction_id: 'BANK_D1', amount: '50000.00', transaction_type: 'CREDIT', utr_number: 'UTR_DUP_999' },
      { id: 'b5b', bank_transaction_id: 'BANK_D2', amount: '50000.00', transaction_type: 'CREDIT', utr_number: 'UTR_DUP_999' },
    ]
  );

  assert.strictEqual(result.status, 'DUPLICATE');
});

// 6. Milestone 5B Regression Test
runTest('Milestone 5B Regression: Payment ₹486,160 - Refund ₹3,730 vs Bank Credit ₹478,700', () => {
  const result = calculateReconciliation(
    'CASE_M5B',
    'MERCH_DEMO_01',
    'Acme E-Commerce Pvt Ltd',
    [{ id: 'p1', payment_id: 'PAY_20260901_001', amount: '486160.00', status: 'CAPTURED' }],
    [{ id: 'r1', refund_id: 'RFD_20260902_001', payment_id: 'p1', amount: '3730.00', status: 'PROCESSED' }],
    [],
    [{ id: 's1', settlement_id: 'SETTLE_20260903_001', gross_amount: '486160.00', deductions_amount: '3730.00', net_amount: '482430.00', status: 'SETTLED' }],
    [
      { id: 'li1', settlement_id: 's1', entity_type: 'PAYMENT', amount: '486160.00', fee_amount: '0.00', tax_amount: '0.00' },
      { id: 'li2', settlement_id: 's1', entity_type: 'REFUND', amount: '-3730.00', fee_amount: '0.00', tax_amount: '0.00' },
    ],
    [{ id: 'b1', bank_transaction_id: 'BANK_TXN_20260904_001', amount: '478700.00', transaction_type: 'CREDIT', utr_number: 'UTR998877665544' }]
  );

  assert.strictEqual(result.paymentAmount, '486160.00');
  assert.strictEqual(result.refundAmount, '3730.00');
  assert.strictEqual(result.expectedAmount, '482430.00');
  assert.strictEqual(result.actualAmount, '478700.00');
  assert.strictEqual(result.variance, '3730.00');
  assert.strictEqual(result.status, 'VARIANCE');
  assert.deepStrictEqual(result.evidence.paymentIds, ['PAY_20260901_001']);
});

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.\n`);
