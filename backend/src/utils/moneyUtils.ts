/**
 * Fixed-precision monetary calculation utilities for SettleTrace.
 * Converts monetary decimal values to BigInt integer paisa (1 INR = 100 paisa)
 * to avoid JavaScript floating point arithmetic errors.
 */

export const toPaisa = (amount: number | string): bigint => {
  const str = typeof amount === 'number' ? amount.toFixed(2) : String(amount);
  const parts = str.trim().split('.');
  const rupees = BigInt(parts[0] || '0');
  const rawPaisa = (parts[1] || '00').padEnd(2, '0').slice(0, 2);
  const paisa = BigInt(rawPaisa);

  if (rupees < 0n) {
    return rupees * 100n - paisa;
  }
  return rupees * 100n + paisa;
};

export const fromPaisa = (paisa: bigint): string => {
  const isNegative = paisa < 0n;
  const absPaisa = isNegative ? -paisa : paisa;
  const rupees = absPaisa / 100n;
  const remainder = absPaisa % 100n;
  const remainderStr = remainder.toString().padStart(2, '0');
  
  return `${isNegative ? '-' : ''}${rupees.toString()}.${remainderStr}`;
};

export const addMoney = (a: number | string, b: number | string): string => {
  return fromPaisa(toPaisa(a) + toPaisa(b));
};

export const subtractMoney = (a: number | string, b: number | string): string => {
  return fromPaisa(toPaisa(a) - toPaisa(b));
};

export const formatCurrency = (amount: number | string, currency = 'INR'): string => {
  const numStr = typeof amount === 'number' ? amount.toFixed(2) : String(amount);
  const val = parseFloat(numStr);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

  return currency === 'INR' ? `₹${formatted}` : `${currency} ${formatted}`;
};
