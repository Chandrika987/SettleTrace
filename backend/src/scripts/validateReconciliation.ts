import { evaluateMerchantReconciliation } from '../services/reconciliationService';
import { formatCurrency } from '../utils/moneyUtils';
import { pool } from '../config/db';

const runValidation = async (): Promise<void> => {
  try {
    console.log('\n==================================================');
    console.log('SETTLETRACE RECONCILIATION VALIDATION');
    console.log('==================================================\n');

    const result = await evaluateMerchantReconciliation('MERCH_DEMO_01');

    console.log(`Merchant:            ${result.merchantName} (${result.merchantId})`);
    console.log(`Currency:            ${result.currency}`);
    console.log(`Settlement IDs:      ${result.evidence.settlementIds.join(', ') || 'N/A'}`);
    console.log(`Bank Txn IDs:        ${result.evidence.bankTransactionIds.join(', ') || 'N/A'}`);
    console.log('--------------------------------------------------');
    console.log(`Payment:             ${formatCurrency(result.paymentAmount, result.currency)}`);
    console.log(`Refunds:             ${formatCurrency(result.refundAmount, result.currency)}`);
    console.log(`Expected settlement: ${formatCurrency(result.expectedAmount, result.currency)}`);
    console.log(`Bank credit:         ${formatCurrency(result.actualAmount, result.currency)}`);
    console.log('--------------------------------------------------');
    console.log(`Variance:            ${formatCurrency(result.variance, result.currency)}`);
    console.log('--------------------------------------------------');
    console.log(`Line Items Valid:    ${result.lineItemsValid ? 'PASSED (Total matches settlement net)' : 'FAILED'}`);
    console.log(`Status:              ${result.status}`);
    console.log('==================================================\n');

    console.log('Structured Result Payload:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Reconciliation validation failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

runValidation();
