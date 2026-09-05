import { query } from '../config/db';
import { fromPaisa, toPaisa } from '../utils/moneyUtils';

export type ReconciliationStatus = 'MATCHED' | 'VARIANCE' | 'PARTIAL' | 'MISSING' | 'DUPLICATE';

export interface PaymentRecord {
  id: string;
  payment_id: string;
  merchant_id?: string;
  amount: string | number;
  status: string;
}

export interface RefundRecord {
  id: string;
  refund_id: string;
  payment_id: string;
  merchant_id?: string;
  amount: string | number;
  status: string;
}

export interface ChargebackRecord {
  id: string;
  chargeback_id: string;
  payment_id: string;
  merchant_id?: string;
  amount: string | number;
  status: string;
}

export interface SettlementRecord {
  id: string;
  settlement_id: string;
  merchant_id?: string;
  gross_amount: string | number;
  deductions_amount: string | number;
  net_amount: string | number;
  status: string;
}

export interface SettlementLineItemRecord {
  id: string;
  settlement_id: string;
  entity_type: string;
  amount: string | number;
  fee_amount: string | number;
  tax_amount: string | number;
}

export interface BankTransactionRecord {
  id: string;
  bank_transaction_id: string;
  merchant_id?: string;
  amount: string | number;
  transaction_type: string;
  utr_number?: string;
  reference_number?: string;
}

export interface LedgerEntryRecord {
  id: string;
  entry_id: string;
  merchant_id?: string;
  account_type: string;
  debit_amount: string | number;
  credit_amount: string | number;
}

export interface ReconciliationEvidence {
  paymentIds: string[];
  refundIds: string[];
  chargebackIds: string[];
  settlementIds: string[];
  settlementLineItemIds: string[];
  bankTransactionIds: string[];
  ledgerEntryIds: string[];
}

export interface ReconciliationCaseResult {
  caseId: string;
  merchantId: string;
  merchantName: string;
  currency: string;
  paymentAmount: string;
  refundAmount: string;
  chargebackAmount: string;
  feeAmount: string;
  adjustmentAmount: string;
  expectedAmount: string;
  actualAmount: string;
  variance: string;
  status: ReconciliationStatus;
  lineItemsValid: boolean;
  settlementLineItemsTotal: string;
  evidence: ReconciliationEvidence;
}

/**
 * Pure deterministic calculation engine for financial reconciliation.
 * Formula:
 *   Expected Settlement = Payments - Refunds - Chargebacks - Fees + Adjustments
 *   Variance = Expected Settlement - Actual Bank Credit
 */
export const calculateReconciliation = (
  caseId: string,
  merchantId: string,
  merchantName: string,
  payments: PaymentRecord[],
  refunds: RefundRecord[],
  chargebacks: ChargebackRecord[],
  settlements: SettlementRecord[],
  lineItems: SettlementLineItemRecord[],
  bankTransactions: BankTransactionRecord[],
  ledgerEntries: LedgerEntryRecord[] = [],
  currency = 'INR'
): ReconciliationCaseResult => {
  const evidence: ReconciliationEvidence = {
    paymentIds: payments.map((p) => p.payment_id),
    refundIds: refunds.map((r) => r.refund_id),
    chargebackIds: chargebacks.map((c) => c.chargeback_id),
    settlementIds: settlements.map((s) => s.settlement_id),
    settlementLineItemIds: lineItems.map((l) => l.id),
    bankTransactionIds: bankTransactions.map((b) => b.bank_transaction_id),
    ledgerEntryIds: ledgerEntries.map((l) => l.entry_id),
  };

  // Check DUPLICATE condition: repeated source identifiers for the same financial event.
  const utrs = bankTransactions.map((b) => b.utr_number).filter(Boolean);
  const paymentIds = payments.map((p) => p.payment_id);
  const settlementIdsForDupes = settlements.map((s) => s.settlement_id);
  const bankIds = bankTransactions.map((b) => b.bank_transaction_id);
  const isDuplicate =
    (utrs.length > 1 && new Set(utrs).size < utrs.length) ||
    (paymentIds.length > 1 && new Set(paymentIds).size < paymentIds.length) ||
    (settlementIdsForDupes.length > 1 && new Set(settlementIdsForDupes).size < settlementIdsForDupes.length) ||
    (bankIds.length > 1 && new Set(bankIds).size < bankIds.length);

  // 1. Calculate Gross Payments Captured
  let totalPaymentsPaisa = 0n;
  for (const p of payments) {
    if (p.status.toUpperCase() === 'CAPTURED') {
      totalPaymentsPaisa += toPaisa(p.amount);
    }
  }

  // 2. Calculate Refunds Processed
  let totalRefundsPaisa = 0n;
  for (const r of refunds) {
    if (r.status.toUpperCase() === 'PROCESSED') {
      totalRefundsPaisa += toPaisa(r.amount);
    }
  }

  // 3. Calculate Chargebacks Filed
  let totalChargebacksPaisa = 0n;
  for (const c of chargebacks) {
    totalChargebacksPaisa += toPaisa(c.amount);
  }

  // 4. Calculate Fees and Adjustments from Line Items
  let totalFeesPaisa = 0n;
  let totalAdjustmentsPaisa = 0n;
  let settlementLineItemsTotalPaisa = 0n;

  for (const item of lineItems) {
    const itemAmountPaisa = toPaisa(item.amount);
    const feePaisa = toPaisa(item.fee_amount || 0);
    const taxPaisa = toPaisa(item.tax_amount || 0);

    totalFeesPaisa += feePaisa + taxPaisa;
    settlementLineItemsTotalPaisa += itemAmountPaisa - feePaisa - taxPaisa;

    if (item.entity_type.toUpperCase() === 'ADJUSTMENT') {
      totalAdjustmentsPaisa += itemAmountPaisa;
    }
  }

  // 5. Compute Expected Settlement Amount
  const expectedPaisa =
    totalPaymentsPaisa - totalRefundsPaisa - totalChargebacksPaisa - totalFeesPaisa + totalAdjustmentsPaisa;

  // 6. Compute Actual Bank Credit Amount
  let actualBankCreditPaisa = 0n;
  let isPartialFlagged = false;
  for (const bt of bankTransactions) {
    if (bt.transaction_type.toUpperCase().includes('CREDIT')) {
      actualBankCreditPaisa += toPaisa(bt.amount);
    }
    if (bt.transaction_type.toUpperCase() === 'PARTIAL_CREDIT') {
      isPartialFlagged = true;
    }
  }

  const activeSettlement = settlements[0];
  if (activeSettlement && activeSettlement.status.toUpperCase() === 'PARTIAL') {
    isPartialFlagged = true;
  }

  // 7. Line items internal validation against active settlement net amount
  const expectedNetPaisa = activeSettlement ? toPaisa(activeSettlement.net_amount) : 0n;
  const lineItemsValid = lineItems.length === 0 || settlementLineItemsTotalPaisa === expectedNetPaisa;

  // 8. Calculate Variance
  const variancePaisa = expectedPaisa - actualBankCreditPaisa;

  // 9. Determine Deterministic Reconciliation Status
  let status: ReconciliationStatus;

  if (isDuplicate) {
    status = 'DUPLICATE';
  } else if (bankTransactions.length === 0 || settlements.length === 0) {
    status = 'MISSING';
  } else if (variancePaisa === 0n) {
    status = 'MATCHED';
  } else if (isPartialFlagged) {
    status = 'PARTIAL';
  } else {
    status = 'VARIANCE';
  }

  return {
    caseId,
    merchantId,
    merchantName,
    currency,
    paymentAmount: fromPaisa(totalPaymentsPaisa),
    refundAmount: fromPaisa(totalRefundsPaisa),
    chargebackAmount: fromPaisa(totalChargebacksPaisa),
    feeAmount: fromPaisa(totalFeesPaisa),
    adjustmentAmount: fromPaisa(totalAdjustmentsPaisa),
    expectedAmount: fromPaisa(expectedPaisa),
    actualAmount: fromPaisa(actualBankCreditPaisa),
    variance: fromPaisa(variancePaisa),
    status,
    lineItemsValid,
    settlementLineItemsTotal: fromPaisa(settlementLineItemsTotalPaisa),
    evidence,
  };
};

/**
 * Reconciles financial records for a specific merchant from PostgreSQL.
 */
export const evaluateMerchantReconciliation = async (
  merchantCodeOrId: string
): Promise<ReconciliationCaseResult> => {
  const merchantRes = await query<{ id: string; merchant_id: string; name: string }>(
    `SELECT id, merchant_id, name FROM merchants WHERE merchant_id = $1 OR id::text = $1 LIMIT 1;`,
    [merchantCodeOrId]
  );

  if (merchantRes.rows.length === 0) {
    throw new Error(`Merchant '${merchantCodeOrId}' not found.`);
  }

  const merchant = merchantRes.rows[0];

  const paymentsRes = await query<PaymentRecord>(
    `SELECT id, payment_id, amount, status FROM payments WHERE merchant_id = $1;`,
    [merchant.id]
  );

  const refundsRes = await query<RefundRecord>(
    `SELECT id, refund_id, payment_id, amount, status FROM refunds WHERE merchant_id = $1;`,
    [merchant.id]
  );

  const chargebacksRes = await query<ChargebackRecord>(
    `SELECT id, chargeback_id, payment_id, amount, status FROM chargebacks WHERE merchant_id = $1;`,
    [merchant.id]
  );

  const settlementsRes = await query<SettlementRecord>(
    `SELECT id, settlement_id, gross_amount, deductions_amount, net_amount, status FROM settlements WHERE merchant_id = $1;`,
    [merchant.id]
  );

  const settlementIds = settlementsRes.rows.map((s) => s.id);
  let lineItems: SettlementLineItemRecord[] = [];
  if (settlementIds.length > 0) {
    const lineItemsRes = await query<SettlementLineItemRecord>(
      `SELECT id, settlement_id, entity_type, amount, fee_amount, tax_amount FROM settlement_line_items WHERE settlement_id = ANY($1);`,
      [settlementIds]
    );
    lineItems = lineItemsRes.rows;
  }

  const bankTxnsRes = await query<BankTransactionRecord>(
    `SELECT id, bank_transaction_id, amount, transaction_type, utr_number, reference_number FROM bank_transactions WHERE merchant_id = $1;`,
    [merchant.id]
  );

  const ledgerRes = await query<LedgerEntryRecord>(
    `SELECT id, entry_id, account_type, debit_amount, credit_amount FROM ledger_entries WHERE merchant_id = $1;`,
    [merchant.id]
  );

  return calculateReconciliation(
    `CASE_${merchant.merchant_id}`,
    merchant.merchant_id,
    merchant.name,
    paymentsRes.rows,
    refundsRes.rows,
    chargebacksRes.rows,
    settlementsRes.rows,
    lineItems,
    bankTxnsRes.rows,
    ledgerRes.rows
  );
};

/**
 * Reconciles individual payment/settlement cases across all merchants in PostgreSQL and measures performance.
 */
export const reconcileAllCases = async (): Promise<{
  results: ReconciliationCaseResult[];
  processedCount: number;
  durationMs: number;
  throughputPerSec: number;
}> => {
  const startTime = Date.now();

  const paymentsRes = await query<{
    id: string;
    payment_id: string;
    merchant_id: string;
    merchant_code: string;
    merchant_name: string;
    amount: string;
    status: string;
  }>(`
    SELECT p.id, p.payment_id, p.merchant_id, m.merchant_id as merchant_code, m.name as merchant_name, p.amount, p.status
    FROM payments p
    JOIN merchants m ON p.merchant_id = m.id
    ORDER BY p.created_at ASC;
  `);

  const results: ReconciliationCaseResult[] = [];

  for (const pay of paymentsRes.rows) {
    const refundsRes = await query<RefundRecord>(
      `SELECT id, refund_id, payment_id, amount, status FROM refunds WHERE payment_id = $1;`,
      [pay.id]
    );

    const chargebacksRes = await query<ChargebackRecord>(
      `SELECT id, chargeback_id, payment_id, amount, status FROM chargebacks WHERE payment_id = $1;`,
      [pay.id]
    );

    const settlementsRes = await query<SettlementRecord>(
      `SELECT DISTINCT s.id, s.settlement_id, s.gross_amount, s.deductions_amount, s.net_amount, s.status
       FROM settlements s
       LEFT JOIN settlement_line_items sli ON sli.settlement_id = s.id
       WHERE sli.entity_id = $1 OR s.settlement_id = $2;`,
      [pay.id, pay.payment_id.replace('PAY_', 'SETTLE_')]
    );

    const settlementIds = settlementsRes.rows.map((s) => s.id);
    const settlementCodes = settlementsRes.rows.map((s) => s.settlement_id);

    let lineItems: SettlementLineItemRecord[] = [];
    if (settlementIds.length > 0) {
      const lineItemsRes = await query<SettlementLineItemRecord>(
        `SELECT id, settlement_id, entity_type, amount, fee_amount, tax_amount FROM settlement_line_items WHERE settlement_id = ANY($1) OR entity_id = $2;`,
        [settlementIds, pay.id]
      );
      lineItems = lineItemsRes.rows;
    }

    const utrSuffix = pay.payment_id.replace('PAY_', 'UTR_');
    const bankTxnsRes = await query<BankTransactionRecord>(
      `SELECT id, bank_transaction_id, amount, transaction_type, utr_number, reference_number FROM bank_transactions 
       WHERE reference_number = ANY($1) OR utr_number = $2 OR (merchant_id = $3 AND reference_number = $4);`,
      [
        settlementCodes.length > 0 ? settlementCodes : [pay.payment_id.replace('PAY_', 'SETTLE_')],
        utrSuffix,
        pay.merchant_id,
        pay.payment_id.replace('PAY_', 'SETTLE_'),
      ]
    );

    const ledgerEvidenceTokens = [
      pay.payment_id.replace('PAY_', ''),
      ...bankTxnsRes.rows.map((b) => b.utr_number).filter((v): v is string => Boolean(v)),
      ...bankTxnsRes.rows.map((b) => b.reference_number).filter((v): v is string => Boolean(v)),
    ];
    const ledgerRes = await query<LedgerEntryRecord>(
      `SELECT id, entry_id, account_type, debit_amount, credit_amount
       FROM ledger_entries
       WHERE merchant_id = $1
         AND EXISTS (
           SELECT 1
           FROM unnest($2::text[]) AS token(value)
           WHERE entry_id ILIKE '%' || token.value || '%'
              OR COALESCE(description, '') ILIKE '%' || token.value || '%'
         );`,
      [pay.merchant_id, ledgerEvidenceTokens]
    );

    const caseRes = calculateReconciliation(
      `CASE_${pay.payment_id}`,
      pay.merchant_code,
      pay.merchant_name,
      [pay],
      refundsRes.rows,
      chargebacksRes.rows,
      settlementsRes.rows,
      lineItems,
      bankTxnsRes.rows,
      ledgerRes.rows
    );

    results.push(caseRes);
  }

  const durationMs = Date.now() - startTime;
  const processedCount = results.length;
  const throughputPerSec = durationMs > 0 ? Math.round((processedCount / durationMs) * 1000) : processedCount * 1000;

  return {
    results,
    processedCount,
    durationMs,
    throughputPerSec,
  };
};

export interface ReconciliationListQuery {
  status?: ReconciliationStatus;
  merchantId?: string;
  currency?: string;
  limit?: number;
  offset?: number;
}

export interface ReconciliationListResponse {
  items: ReconciliationCaseResult[];
  total: number;
}

export const getReconciliationCases = async (
  filters: ReconciliationListQuery = {}
): Promise<ReconciliationListResponse> => {
  const { results } = await reconcileAllCases();
  const filtered = results.filter((result) => {
    if (filters.status && result.status !== filters.status) return false;
    if (filters.merchantId && result.merchantId !== filters.merchantId) return false;
    if (filters.currency && result.currency !== filters.currency) return false;
    return true;
  });

  const offset = Math.max(filters.offset ?? 0, 0);
  const limit = Math.max(filters.limit ?? filtered.length, 0);
  return {
    items: filtered.slice(offset, offset + limit),
    total: filtered.length,
  };
};

export interface ReconciliationSummary {
  totalCases: number;
  matchedCases: number;
  varianceCases: number;
  partialCases: number;
  missingCases: number;
  duplicateCases: number;
  totalExpectedAmount: string;
  totalActualAmount: string;
  totalVariance: string;
}

export const getReconciliationSummary = async (): Promise<ReconciliationSummary> => {
  const { results } = await reconcileAllCases();
  const counts: Record<ReconciliationStatus, number> = {
    MATCHED: 0,
    VARIANCE: 0,
    PARTIAL: 0,
    MISSING: 0,
    DUPLICATE: 0,
  };

  let expected = 0n;
  let actual = 0n;
  let variance = 0n;
  for (const result of results) {
    counts[result.status]++;
    expected += toPaisa(result.expectedAmount);
    actual += toPaisa(result.actualAmount);
    variance += toPaisa(result.variance);
  }

  return {
    totalCases: results.length,
    matchedCases: counts.MATCHED,
    varianceCases: counts.VARIANCE,
    partialCases: counts.PARTIAL,
    missingCases: counts.MISSING,
    duplicateCases: counts.DUPLICATE,
    totalExpectedAmount: fromPaisa(expected),
    totalActualAmount: fromPaisa(actual),
    totalVariance: fromPaisa(variance),
  };
};

export interface ReconciliationCaseDetail {
  result: ReconciliationCaseResult;
  records: {
    payments: PaymentRecord[];
    refunds: RefundRecord[];
    chargebacks: ChargebackRecord[];
    settlements: SettlementRecord[];
    settlementLineItems: SettlementLineItemRecord[];
    bankTransactions: BankTransactionRecord[];
    ledgerEntries: LedgerEntryRecord[];
  };
}

export const getReconciliationCaseDetail = async (
  caseId: string
): Promise<ReconciliationCaseDetail | null> => {
  const paymentId = caseId.startsWith('CASE_') ? caseId.slice(5) : caseId;
  const paymentsRes = await query<{
    id: string;
    payment_id: string;
    merchant_id: string;
    merchant_code: string;
    merchant_name: string;
    amount: string;
    status: string;
  }>(
    `SELECT p.id, p.payment_id, p.merchant_id, m.merchant_id as merchant_code, m.name as merchant_name, p.amount, p.status
     FROM payments p
     JOIN merchants m ON p.merchant_id = m.id
     WHERE p.payment_id = $1
     LIMIT 1;`,
    [paymentId]
  );

  if (paymentsRes.rows.length === 0) return null;

  const pay = paymentsRes.rows[0];
  const refundsRes = await query<RefundRecord>(
    `SELECT id, refund_id, payment_id, amount, status FROM refunds WHERE payment_id = $1;`,
    [pay.id]
  );
  const chargebacksRes = await query<ChargebackRecord>(
    `SELECT id, chargeback_id, payment_id, amount, status FROM chargebacks WHERE payment_id = $1;`,
    [pay.id]
  );
  const settlementsRes = await query<SettlementRecord>(
    `SELECT DISTINCT s.id, s.settlement_id, s.gross_amount, s.deductions_amount, s.net_amount, s.status
     FROM settlements s
     LEFT JOIN settlement_line_items sli ON sli.settlement_id = s.id
     WHERE sli.entity_id = $1 OR s.settlement_id = $2;`,
    [pay.id, pay.payment_id.replace('PAY_', 'SETTLE_')]
  );

  const settlementIds = settlementsRes.rows.map((s) => s.id);
  let lineItems: SettlementLineItemRecord[] = [];
  if (settlementIds.length > 0) {
    const lineItemsRes = await query<SettlementLineItemRecord>(
      `SELECT id, settlement_id, entity_type, amount, fee_amount, tax_amount FROM settlement_line_items WHERE settlement_id = ANY($1) OR entity_id = $2;`,
      [settlementIds, pay.id]
    );
    lineItems = lineItemsRes.rows;
  }

  const settlementCodes = settlementsRes.rows.map((s) => s.settlement_id);
  const bankTxnsRes = await query<BankTransactionRecord>(
    `SELECT id, bank_transaction_id, amount, transaction_type, utr_number, reference_number
     FROM bank_transactions
     WHERE reference_number = ANY($1) OR utr_number = $2 OR (merchant_id = $3 AND reference_number = $4);`,
    [
      settlementCodes.length > 0 ? settlementCodes : [pay.payment_id.replace('PAY_', 'SETTLE_')],
      pay.payment_id.replace('PAY_', 'UTR_'),
      pay.merchant_id,
      pay.payment_id.replace('PAY_', 'SETTLE_'),
    ]
  );

  const ledgerEvidenceTokens = [
    pay.payment_id.replace('PAY_', ''),
    ...bankTxnsRes.rows.map((b) => b.utr_number).filter((v): v is string => Boolean(v)),
    ...bankTxnsRes.rows.map((b) => b.reference_number).filter((v): v is string => Boolean(v)),
  ];
  const ledgerRes = await query<LedgerEntryRecord>(
    `SELECT id, entry_id, account_type, debit_amount, credit_amount
     FROM ledger_entries
     WHERE merchant_id = $1
       AND EXISTS (
         SELECT 1
         FROM unnest($2::text[]) AS token(value)
         WHERE entry_id ILIKE '%' || token.value || '%'
            OR COALESCE(description, '') ILIKE '%' || token.value || '%'
       );`,
    [pay.merchant_id, ledgerEvidenceTokens]
  );

  const result = calculateReconciliation(
    `CASE_${pay.payment_id}`,
    pay.merchant_code,
    pay.merchant_name,
    [pay],
    refundsRes.rows,
    chargebacksRes.rows,
    settlementsRes.rows,
    lineItems,
    bankTxnsRes.rows,
    ledgerRes.rows
  );

  return {
    result,
    records: {
      payments: [pay],
      refunds: refundsRes.rows,
      chargebacks: chargebacksRes.rows,
      settlements: settlementsRes.rows,
      settlementLineItems: lineItems,
      bankTransactions: bankTxnsRes.rows,
      ledgerEntries: ledgerRes.rows,
    },
  };
};
