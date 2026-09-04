import type { Merchant } from '../types';
import { merchants, merchantNames } from '../data/merchants';

export async function getMerchants(): Promise<Merchant[]> {
  return merchants;
}

export async function getMerchantNames(): Promise<string[]> {
  return merchantNames;
}
