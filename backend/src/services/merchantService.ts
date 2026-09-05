import { query } from '../config/db';

export interface ApiMerchant {
  id: string;
  merchantId: string;
  name: string;
  email?: string;
  createdAt: string;
}

export const getMerchants = async (): Promise<ApiMerchant[]> => {
  const result = await query<{
    id: string;
    merchant_id: string;
    name: string;
    email?: string;
    created_at: Date;
  }>(
    `SELECT id, merchant_id, name, email, created_at
     FROM merchants
     ORDER BY name ASC;`
  );

  return result.rows.map((merchant) => ({
    id: merchant.id,
    merchantId: merchant.merchant_id,
    name: merchant.name,
    email: merchant.email,
    createdAt: merchant.created_at.toISOString(),
  }));
};
