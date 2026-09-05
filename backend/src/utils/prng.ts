/**
 * Lightweight seedable Pseudo-Random Number Generator (PRNG) using Mulberry32 algorithm.
 * Guarantees deterministic, reproducible random sequences across runs when a seed is provided.
 */

export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /**
   * Returns a pseudo-random floating-point number in range [0, 1)
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a pseudo-random integer in range [min, max] inclusive
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Returns a pseudo-random float rounded to 2 decimal places in range [min, max]
   */
  nextFloat(min: number, max: number): number {
    const val = this.next() * (max - min) + min;
    return Math.round(val * 100) / 100;
  }

  /**
   * Selects an item from an array deterministically
   */
  pick<T>(array: T[]): T {
    const idx = this.nextInt(0, array.length - 1);
    return array[idx];
  }
}
