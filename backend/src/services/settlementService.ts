import { query } from '../config/db';

export interface SettlementListQuery {
  merchantId?: string;
  currency?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface ApiSettlement {
  id: string;
  settlementId: string;
  merchantId: string;
  merchantCode: string;
  merchantName: string;
  grossAmount: string;
  deductionsAmount: string;
  netAmount: string;
  currency: string;
  status: string;
  settledAt: string;
}

export interface SettlementListResponse {
  items: ApiSettlement[];
  total: number;
}

const mapSettlement = (row: {
  id: string;
  settlement_id: string;
  merchant_id: string;
  merchant_code: string;
  merchant_name: string;
  gross_amount: string;
  deductions_amount: string;
  net_amount: string;
  currency: string;
  status: string;
  settled_at: Date;
}): ApiSettlement => ({
  id: row.id,
  settlementId: row.settlement_id,
  merchantId: row.merchant_id,
  merchantCode: row.merchant_code,
  merchantName: row.merchant_name,
  grossAmount: row.gross_amount,
  deductionsAmount: row.deductions_amount,
  netAmount: row.net_amount,
  currency: row.currency,
  status: row.status,
  settledAt: row.settled_at.toISOString(),
});

export const getSettlements = async (
  filters: SettlementListQuery = {}
): Promise<SettlementListResponse> => {
  const limit = Math.max(filters.limit ?? 100, 0);
  const offset = Math.max(filters.offset ?? 0, 0);
  const result = await query<{
    id: string;
    settlement_id: string;
    merchant_id: string;
    merchant_code: string;
    merchant_name: string;
    gross_amount: string;
    deductions_amount: string;
    net_amount: string;
    currency: string;
    status: string;
    settled_at: Date;
    total_count: string;
  }>(
    `SELECT s.id, s.settlement_id, s.merchant_id, m.merchant_id as merchant_code, m.name as merchant_name,
            s.gross_amount, s.deductions_amount, s.net_amount, s.currency, s.status, s.settled_at,
            COUNT(*) OVER() AS total_count
     FROM settlements s
     JOIN merchants m ON m.id = s.merchant_id
     WHERE ($1::text IS NULL OR m.merchant_id = $1 OR s.merchant_id::text = $1)
       AND ($2::text IS NULL OR s.currency = $2)
       AND ($3::text IS NULL OR s.status = $3)
     ORDER BY s.settled_at DESC
     LIMIT $4 OFFSET $5;`,
    [filters.merchantId ?? null, filters.currency ?? null, filters.status ?? null, limit, offset]
  );

  return {
    items: result.rows.map(mapSettlement),
    total: result.rows[0] ? Number(result.rows[0].total_count) : 0,
  };
};

export interface SettlementDetail {
  settlement: ApiSettlement;
  lineItems: unknown[];
  bankTransactions: unknown[];
  ledgerEntries: unknown[];
}

export const getSettlementDetail = async (id: string): Promise<SettlementDetail | null> => {
  const settlements = await query<{
    id: string;
    settlement_id: string;
    merchant_id: string;
    merchant_code: string;
    merchant_name: string;
    gross_amount: string;
    deductions_amount: string;
    net_amount: string;
    currency: string;
    status: string;
    settled_at: Date;
  }>(
    `SELECT s.id, s.settlement_id, s.merchant_id, m.merchant_id as merchant_code, m.name as merchant_name,
            s.gross_amount, s.deductions_amount, s.net_amount, s.currency, s.status, s.settled_at
     FROM settlements s
     JOIN merchants m ON m.id = s.merchant_id
     WHERE s.id::text = $1 OR s.settlement_id = $1
     LIMIT 1;`,
    [id]
  );

  if (settlements.rows.length === 0) return null;

  const settlementRow = settlements.rows[0];
  const lineItems = await query(
    `SELECT id, settlement_id, entity_type, entity_id, amount, fee_amount, tax_amount, currency, description, created_at
     FROM settlement_line_items
     WHERE settlement_id = $1
     ORDER BY created_at ASC;`,
    [settlementRow.id]
  );
  const bankTransactions = await query(
    `SELECT id, bank_transaction_id, merchant_id, amount, currency, transaction_type, reference_number, utr_number, posted_at
     FROM bank_transactions
     WHERE reference_number = $1
     ORDER BY posted_at ASC;`,
    [settlementRow.settlement_id]
  );
  const tokens = [
    settlementRow.settlement_id,
    ...bankTransactions.rows.map((b) => b.utr_number).filter((v): v is string => Boolean(v)),
  ];
  const ledgerEntries = await query(
    `SELECT id, entry_id, merchant_id, account_type, debit_amount, credit_amount, currency, description, posted_at
     FROM ledger_entries
     WHERE merchant_id = $1
       AND EXISTS (
         SELECT 1
         FROM unnest($2::text[]) AS token(value)
         WHERE entry_id ILIKE '%' || token.value || '%'
            OR COALESCE(description, '') ILIKE '%' || token.value || '%'
       )
     ORDER BY posted_at ASC;`,
    [settlementRow.merchant_id, tokens]
  );

  return {
    settlement: mapSettlement(settlementRow),
    lineItems: lineItems.rows,
    bankTransactions: bankTransactions.rows,
    ledgerEntries: ledgerEntries.rows,
  };
};
