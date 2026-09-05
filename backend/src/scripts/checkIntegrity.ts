import { pool } from '../config/db';

const checks: { name: string; sql: string }[] = [
  {
    name: 'refund_orphans',
    sql: 'SELECT COUNT(*)::int AS count FROM refunds r LEFT JOIN payments p ON p.id = r.payment_id WHERE p.id IS NULL',
  },
  {
    name: 'chargeback_orphans',
    sql: 'SELECT COUNT(*)::int AS count FROM chargebacks c LEFT JOIN payments p ON p.id = c.payment_id WHERE p.id IS NULL',
  },
  {
    name: 'settlement_orphans',
    sql: 'SELECT COUNT(*)::int AS count FROM settlements s LEFT JOIN merchants m ON m.id = s.merchant_id WHERE m.id IS NULL',
  },
  {
    name: 'line_item_orphans',
    sql: 'SELECT COUNT(*)::int AS count FROM settlement_line_items sli LEFT JOIN settlements s ON s.id = sli.settlement_id WHERE s.id IS NULL',
  },
  {
    name: 'bank_orphans',
    sql: 'SELECT COUNT(*)::int AS count FROM bank_transactions b LEFT JOIN merchants m ON m.id = b.merchant_id WHERE m.id IS NULL',
  },
  {
    name: 'ledger_orphans',
    sql: 'SELECT COUNT(*)::int AS count FROM ledger_entries l LEFT JOIN merchants m ON m.id = l.merchant_id WHERE m.id IS NULL',
  },
  {
    name: 'synthetic_payments_seed_42',
    sql: "SELECT COUNT(*)::int AS count FROM payments WHERE payment_id LIKE 'PAY_SYNTH_42_%'",
  },
];

const run = async (): Promise<void> => {
  try {
    console.log('\nSETTLETRACE DATA INTEGRITY CHECKS');
    console.log('--------------------------------');

    for (const check of checks) {
      const result = await pool.query<{ count: number }>(check.sql);
      console.log(`${check.name}: ${result.rows[0].count}`);
    }
  } catch (error) {
    console.error('Integrity checks failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
