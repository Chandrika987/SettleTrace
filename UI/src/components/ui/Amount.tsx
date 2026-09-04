import { twMerge } from 'tailwind-merge';
import { formatINR } from '../../utils/format';

interface AmountProps {
  value: number;
  className?: string;
  signed?: boolean;
  decimals?: boolean;
  /** Color by sign — negative variance reads critical, positive excess reads amber. */
  variance?: boolean;
}

export function Amount({ value, className, signed, decimals, variance }: AmountProps) {
  const tone = !variance ?
  'text-ink-50' :
  value === 0 ?
  'text-ink-500' :
  value < 0 ?
  'text-crit' :
  'text-warn';
  return (
    <span className={twMerge('tnum font-mono', tone, className)}>
      {value === 0 && variance ? '₹0' : formatINR(value, { sign: signed, decimals })}
    </span>);

}