export interface Merchant {
  id: string;
  merchant_id: string;
  name: string;
  email?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Payment {
  id: string;
  payment_id: string;
  merchant_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  captured_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Refund {
  id: string;
  refund_id: string;
  payment_id: string;
  merchant_id: string;
  amount: number;
  currency: string;
  status: string;
  reason?: string;
  processed_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Settlement {
  id: string;
  settlement_id: string;
  merchant_id: string;
  gross_amount: number;
  deductions_amount: number;
  net_amount: number;
  currency: string;
  status: string;
  settled_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface BankTransaction {
  id: string;
  bank_transaction_id: string;
  merchant_id: string;
  amount: number;
  currency: string;
  transaction_type: string;
  reference_number?: string;
  utr_number?: string;
  posted_at: Date;
  created_at: Date;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  database: 'connected' | 'disconnected';
  timestamp: string;
}
