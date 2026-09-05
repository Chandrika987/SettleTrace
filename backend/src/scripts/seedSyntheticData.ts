import { generateSyntheticDataset } from '../utils/syntheticDataGenerator';
import { pool } from '../config/db';

const runSeedScript = async (): Promise<void> => {
  try {
    console.log('\n==================================================');
    console.log('SETTLETRACE SYNTHETIC DATASET GENERATOR');
    console.log('==================================================\n');

    const summary = await generateSyntheticDataset({
      seed: 42,
      merchantCount: 3,
      paymentCount: 100,
    });

    console.log(`Dataset seed:          ${summary.seed}`);
    console.log(`Merchants:             ${summary.merchantCount}`);
    console.log(`Payments:              ${summary.paymentCount}`);
    console.log(`Refunds:               ${summary.refundCount}`);
    console.log(`Chargebacks:           ${summary.chargebackCount}`);
    console.log(`Settlements:           ${summary.settlementCount}`);
    console.log(`Settlement Line Items: ${summary.lineItemCount}`);
    console.log(`Bank Transactions:     ${summary.bankTransactionCount}`);
    console.log(`Ledger Entries:        ${summary.ledgerEntryCount}`);
    console.log('--------------------------------------------------');
    console.log('Injected Cases Generated:');
    for (const [key, count] of Object.entries(summary.caseDistribution)) {
      console.log(`  ${key.padEnd(20)}: ${count}`);
    }
    console.log('==================================================\n');
  } catch (error) {
    console.error('Failed to generate synthetic dataset:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

runSeedScript();
