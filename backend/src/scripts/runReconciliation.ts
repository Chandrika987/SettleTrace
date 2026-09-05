import { reconcileAllCases } from '../services/reconciliationService';
import { formatCurrency } from '../utils/moneyUtils';
import { pool } from '../config/db';

const runReconciliationBatch = async (): Promise<void> => {
  try {
    console.log('\n==================================================');
    console.log('SETTLETRACE RECONCILIATION RUN');
    console.log('==================================================\n');

    const benchmark = await reconcileAllCases();

    const statusCounts: Record<string, number> = {
      MATCHED: 0,
      VARIANCE: 0,
      PARTIAL: 0,
      MISSING: 0,
      DUPLICATE: 0,
    };

    for (const res of benchmark.results) {
      statusCounts[res.status] = (statusCounts[res.status] || 0) + 1;
    }

    console.log(`Financial Payment Cases Evaluated: ${benchmark.processedCount}`);
    console.log('--------------------------------------------------');
    console.log('Deterministic Reconciliation Results Breakdown:');
    for (const [status, count] of Object.entries(statusCounts)) {
      console.log(`  ${status.padEnd(12)}: ${count}`);
    }
    console.log('--------------------------------------------------');
    console.log(`Processing Duration:        ${benchmark.durationMs} ms`);
    console.log(`Throughput:                 ${benchmark.throughputPerSec} records/sec`);
    console.log('==================================================\n');

    console.log('Sample Reconciliation Payload (First 2 Cases):');
    console.log(JSON.stringify(benchmark.results.slice(0, 2), null, 2));
    console.log('\nReconciliation batch execution completed successfully.\n');
  } catch (error) {
    console.error('Reconciliation batch failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

runReconciliationBatch();
