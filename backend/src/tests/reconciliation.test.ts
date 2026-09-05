import assert from 'assert';
import { calculateReconciliation } from '../services/reconciliationService';
import { addMoney, subtractMoney, toPaisa, fromPaisa } from '../utils/moneyUtils';

console.log('\n==================================================');
console.log('RUNNING RECONCILIATION CALCULATION UNIT TESTS');
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

// 1. Seeded Scenario Test
runTest('Seeded Scenario: ₹4,86,160 - ₹3,730 expected ₹4,82,430 vs ₹4,78,700 bank credit', () => {
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
    [{ id: 'b1', bank_transaction_id: 'BANK_TXN_20260904_001', amount: '478700.00', transaction_type: 'CREDIT', utr_number: 'UTR998877665544' }],
    [{ id: 'l1', entry_id: 'LEDGER_20260904_001', account_type: 'BANK_RECEIVABLE', debit_amount: '478700.00', credit_amount: '0.00' }]
  );

  assert.strictEqual(result.paymentAmount, '486160.00');
  assert.strictEqual(result.refundAmount, '3730.00');
  assert.strictEqual(result.expectedAmount, '482430.00');
  assert.strictEqual(result.actualAmount, '478700.00');
  assert.strictEqual(result.variance, '3730.00');
  assert.strictEqual(result.status, 'VARIANCE');
  assert.strictEqual(result.lineItemsValid, true);
});

// 2. Clean Zero-Variance Scenario Test
runTest('Clean Scenario: ₹1,00,000 - ₹5,000 expected ₹95,000 vs ₹95,000 bank credit', () => {
  const result = calculateReconciliation(
    'CASE_CLEAN_01',
    'MERCH_CLEAN_01',
    'Clean Merchant Ltd',
    [{ id: 'p2', payment_id: 'PAY_100', amount: '100000.00', status: 'CAPTURED' }],
    [{ id: 'r2', refund_id: 'RFD_100', payment_id: 'p2', amount: '5000.00', status: 'PROCESSED' }],
    [],
    [{ id: 's2', settlement_id: 'SETTLE_100', gross_amount: '100000.00', deductions_amount: '5000.00', net_amount: '95000.00', status: 'SETTLED' }],
    [
      { id: 'li3', settlement_id: 's2', entity_type: 'PAYMENT', amount: '100000.00', fee_amount: '0.00', tax_amount: '0.00' },
      { id: 'li4', settlement_id: 's2', entity_type: 'REFUND', amount: '-5000.00', fee_amount: '0.00', tax_amount: '0.00' },
    ],
    [{ id: 'b2', bank_transaction_id: 'BANK_TXN_100', amount: '95000.00', transaction_type: 'CREDIT' }],
    []
  );

  assert.strictEqual(result.paymentAmount, '100000.00');
  assert.strictEqual(result.refundAmount, '5000.00');
  assert.strictEqual(result.expectedAmount, '95000.00');
  assert.strictEqual(result.actualAmount, '95000.00');
  assert.strictEqual(result.variance, '0.00');
  assert.strictEqual(result.status, 'MATCHED');
  assert.strictEqual(result.lineItemsValid, true);
});

// 3. Money Precision Test
runTest('Money Precision: Fixed decimal operations avoid floating point inaccuracies', () => {
  assert.strictEqual(addMoney('0.10', '0.20'), '0.30');
  assert.strictEqual(subtractMoney('482430.00', '478700.00'), '3730.00');
  assert.strictEqual(toPaisa('486160.55'), 48616055n);
  assert.strictEqual(fromPaisa(48616055n), '486160.55');
});

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.\n`);
