import { pool } from '../config/db';
import { fromPaisa } from './moneyUtils';
import { SeededRandom } from './prng';

export interface GeneratorOptions {
  seed?: number;
  merchantCount?: number;
  paymentCount?: number;
}

export interface SyntheticDatasetSummary {
  seed: number;
  merchantCount: number;
  paymentCount: number;
  refundCount: number;
  chargebackCount: number;
  settlementCount: number;
  lineItemCount: number;
  bankTransactionCount: number;
  ledgerEntryCount: number;
  caseDistribution: Record<string, number>;
}

type CasePattern = 'MATCHED' | 'VARIANCE' | 'PARTIAL' | 'MISSING' | 'DUPLICATE';

const BASE_TIME_MS = Date.UTC(2026, 8, 1, 4, 30, 0);
const DAY_MS = 24 * 60 * 60 * 1000;

const timestampFor = (caseNumber: number, offsetDays: number): string => {
  return new Date(BASE_TIME_MS + (caseNumber + offsetDays) * DAY_MS).toISOString();
};

const patternFor = (caseNumber: number): CasePattern => {
  const slot = caseNumber % 20;
  if (slot <= 9) return 'MATCHED';
  if (slot <= 12) return 'VARIANCE';
  if (slot <= 14) return 'PARTIAL';
  if (slot <= 16) return 'MISSING';
  return 'DUPLICATE';
};

const positivePart = (amount: bigint, divisor: bigint): bigint => {
  const value = amount / divisor;
  return value > 0n ? value : 0n;
};

export const generateSyntheticDataset = async (
  options: GeneratorOptions = {}
): Promise<SyntheticDatasetSummary> => {
  const seed = options.seed ?? 42;
  const merchantCount = options.merchantCount ?? 3;
  const targetPayments = options.paymentCount ?? 100;
  const prng = new SeededRandom(seed);
  const client = await pool.connect();

  try {
    console.log(
      `Generating synthetic financial dataset with seed=${seed}, merchants=${merchantCount}, targetPayments=${targetPayments}...`
    );

    await client.query('BEGIN');
    await client.query(`DELETE FROM merchants WHERE merchant_id LIKE 'MERCH_SYNTH_%';`);

    const merchantIds: { dbId: string; merchantId: string; name: string }[] = [];
    for (let i = 1; i <= merchantCount; i++) {
      const code = `MERCH_SYNTH_${String(i).padStart(2, '0')}`;
      const name = `Synthetic Merchant ${i} Pvt Ltd`;
      const email = `finance@synthmerchant${i}.com`;

      const res = await client.query<{ id: string }>(
        `INSERT INTO merchants (merchant_id, name, email)
         VALUES ($1, $2, $3)
         RETURNING id;`,
        [code, name, email]
      );

      merchantIds.push({ dbId: res.rows[0].id, merchantId: code, name });
    }

    let refundCount = 0;
    let chargebackCount = 0;
    let settlementCount = 0;
    let lineItemCount = 0;
    let bankTransactionCount = 0;
    let ledgerEntryCount = 0;

    const caseDistribution: Record<CasePattern, number> = {
      MATCHED: 0,
      VARIANCE: 0,
      PARTIAL: 0,
      MISSING: 0,
      DUPLICATE: 0,
    };

    for (let i = 1; i <= targetPayments; i++) {
      const merchant = merchantIds[(i - 1) % merchantIds.length];
      const pattern = patternFor(i);
      caseDistribution[pattern]++;

      const suffix = `${seed}_${String(i).padStart(4, '0')}`;
      const paymentCode = `PAY_SYNTH_${suffix}`;
      const settlementCode = `SETTLE_SYNTH_${suffix}`;
      const paymentAmountPaisa = BigInt(prng.nextInt(50_000, 15_000_000));
      const capturedAt = timestampFor(i, 0);

      const payRes = await client.query<{ id: string }>(
        `INSERT INTO payments (payment_id, merchant_id, amount, currency, status, payment_method, captured_at)
         VALUES ($1, $2, $3, 'INR', 'CAPTURED', $4, $5)
         RETURNING id;`,
        [paymentCode, merchant.dbId, fromPaisa(paymentAmountPaisa), prng.pick(['UPI', 'CARD', 'NETBANKING']), capturedAt]
      );
      const paymentDbId = payRes.rows[0].id;

      const hasRefund = i % 4 === 0 || pattern === 'VARIANCE';
      const hasFee = i % 3 === 0 || pattern === 'VARIANCE';
      const hasAdjustment = i % 10 === 0;
      const hasChargeback = i % 15 === 0 || pattern === 'DUPLICATE';

      let refundDbId: string | null = null;
      let chargebackDbId: string | null = null;
      const refundPaisa = hasRefund ? positivePart(paymentAmountPaisa, BigInt(prng.nextInt(8, 20))) : 0n;
      const feePaisa = hasFee ? positivePart(paymentAmountPaisa, BigInt(prng.nextInt(80, 160))) : 0n;
      const taxPaisa = feePaisa > 0n ? (feePaisa * 18n) / 100n : 0n;
      const chargebackPaisa = hasChargeback ? positivePart(paymentAmountPaisa, BigInt(prng.nextInt(15, 35))) : 0n;
      const adjustmentPaisa = hasAdjustment ? BigInt(prng.nextInt(-20_000, 20_000)) : 0n;

      if (refundPaisa > 0n) {
        const refundCode = `RFD_SYNTH_${suffix}`;
        const refundRes = await client.query<{ id: string }>(
          `INSERT INTO refunds (refund_id, payment_id, merchant_id, amount, currency, status, reason, processed_at)
           VALUES ($1, $2, $3, $4, 'INR', 'PROCESSED', 'Synthetic return', $5)
           RETURNING id;`,
          [refundCode, paymentDbId, merchant.dbId, fromPaisa(refundPaisa), timestampFor(i, 1)]
        );
        refundDbId = refundRes.rows[0].id;
        refundCount++;
      }

      if (chargebackPaisa > 0n) {
        const chargebackCode = `CB_SYNTH_${suffix}`;
        const chargebackRes = await client.query<{ id: string }>(
          `INSERT INTO chargebacks (chargeback_id, payment_id, merchant_id, amount, currency, status, reason_code, filed_at)
           VALUES ($1, $2, $3, $4, 'INR', 'FILED', 'CB_100', $5)
           RETURNING id;`,
          [chargebackCode, paymentDbId, merchant.dbId, fromPaisa(chargebackPaisa), timestampFor(i, 2)]
        );
        chargebackDbId = chargebackRes.rows[0].id;
        chargebackCount++;
      }

      const expectedPaisa =
        paymentAmountPaisa - refundPaisa - chargebackPaisa - feePaisa - taxPaisa + adjustmentPaisa;

      if (pattern === 'MISSING') {
        continue;
      }

      const settlementStatus = pattern === 'PARTIAL' ? 'PARTIAL' : 'SETTLED';
      const settlementRes = await client.query<{ id: string }>(
        `INSERT INTO settlements (settlement_id, merchant_id, gross_amount, deductions_amount, net_amount, currency, status, settled_at)
         VALUES ($1, $2, $3, $4, $5, 'INR', $6, $7)
         RETURNING id;`,
        [
          settlementCode,
          merchant.dbId,
          fromPaisa(paymentAmountPaisa),
          fromPaisa(refundPaisa + chargebackPaisa + feePaisa + taxPaisa),
          fromPaisa(expectedPaisa),
          settlementStatus,
          timestampFor(i, 3),
        ]
      );
      const settlementDbId = settlementRes.rows[0].id;
      settlementCount++;

      await client.query(
        `INSERT INTO settlement_line_items (settlement_id, entity_type, entity_id, amount, fee_amount, tax_amount, currency, description)
         VALUES ($1, 'PAYMENT', $2, $3, $4, $5, 'INR', 'Payment gross credit');`,
        [settlementDbId, paymentDbId, fromPaisa(paymentAmountPaisa), fromPaisa(feePaisa), fromPaisa(taxPaisa)]
      );
      lineItemCount++;

      if (refundPaisa > 0n) {
        await client.query(
          `INSERT INTO settlement_line_items (settlement_id, entity_type, entity_id, amount, fee_amount, tax_amount, currency, description)
           VALUES ($1, 'REFUND', $2, $3, 0.00, 0.00, 'INR', 'Refund deduction');`,
          [settlementDbId, refundDbId, fromPaisa(-refundPaisa)]
        );
        lineItemCount++;
      }

      if (chargebackPaisa > 0n) {
        await client.query(
          `INSERT INTO settlement_line_items (settlement_id, entity_type, entity_id, amount, fee_amount, tax_amount, currency, description)
           VALUES ($1, 'CHARGEBACK', $2, $3, 0.00, 0.00, 'INR', 'Chargeback deduction');`,
          [settlementDbId, chargebackDbId, fromPaisa(-chargebackPaisa)]
        );
        lineItemCount++;
      }

      if (adjustmentPaisa !== 0n) {
        await client.query(
          `INSERT INTO settlement_line_items (settlement_id, entity_type, entity_id, amount, fee_amount, tax_amount, currency, description)
           VALUES ($1, 'ADJUSTMENT', NULL, $2, 0.00, 0.00, 'INR', 'Settlement adjustment');`,
          [settlementDbId, fromPaisa(adjustmentPaisa)]
        );
        lineItemCount++;
      }

      let bankCreditPaisa = expectedPaisa;
      if (pattern === 'VARIANCE') {
        bankCreditPaisa = expectedPaisa - BigInt(prng.nextInt(500, 75_000));
      } else if (pattern === 'PARTIAL') {
        bankCreditPaisa = (expectedPaisa * BigInt(prng.nextInt(45, 80))) / 100n;
      }

      const utrCode = `UTR_SYNTH_${suffix}`;
      const bankTxnCode = `BANK_SYNTH_${suffix}`;
      const transactionType = pattern === 'PARTIAL' ? 'PARTIAL_CREDIT' : 'CREDIT';
      const bankPostedOffset = i % 12 === 0 ? 6 : 4;

      await client.query(
        `INSERT INTO bank_transactions (bank_transaction_id, merchant_id, amount, currency, transaction_type, reference_number, utr_number, posted_at)
         VALUES ($1, $2, $3, 'INR', $4, $5, $6, $7);`,
        [
          bankTxnCode,
          merchant.dbId,
          fromPaisa(bankCreditPaisa),
          transactionType,
          settlementCode,
          utrCode,
          timestampFor(i, bankPostedOffset),
        ]
      );
      bankTransactionCount++;

      if (pattern === 'DUPLICATE') {
        await client.query(
          `INSERT INTO bank_transactions (bank_transaction_id, merchant_id, amount, currency, transaction_type, reference_number, utr_number, posted_at)
           VALUES ($1, $2, $3, 'INR', 'CREDIT', $4, $5, $6);`,
          [
            `BANK_SYNTH_DUP_${suffix}`,
            merchant.dbId,
            fromPaisa(bankCreditPaisa),
            settlementCode,
            utrCode,
            timestampFor(i, bankPostedOffset),
          ]
        );
        bankTransactionCount++;
      }

      await client.query(
        `INSERT INTO ledger_entries (entry_id, merchant_id, account_type, debit_amount, credit_amount, currency, description, posted_at)
         VALUES ($1, $2, 'BANK_RECEIVABLE', $3, 0.00, 'INR', 'Synthetic ledger credit posting', $4);`,
        [`LEDGER_SYNTH_${suffix}`, merchant.dbId, fromPaisa(bankCreditPaisa), timestampFor(i, bankPostedOffset)]
      );
      ledgerEntryCount++;
    }

    await client.query('COMMIT');
    console.log('Synthetic financial dataset inserted successfully.');

    return {
      seed,
      merchantCount,
      paymentCount: targetPayments,
      refundCount,
      chargebackCount,
      settlementCount,
      lineItemCount,
      bankTransactionCount,
      ledgerEntryCount,
      caseDistribution,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Synthetic data generation failed:', error);
    throw error;
  } finally {
    client.release();
  }
};
