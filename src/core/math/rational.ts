/**
 * Exact rational number representation and arithmetic.
 * Ensures deterministic exact evaluation without binary floating-point drift.
 */

export interface Rational {
  readonly num: bigint;
  readonly den: bigint;
}

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function createRational(num: bigint | number, den: bigint | number = 1n): Rational {
  let n = typeof num === 'number' ? BigInt(Math.trunc(num)) : num;
  let d = typeof den === 'number' ? BigInt(Math.trunc(den)) : den;

  if (d === 0n) {
    throw new Error('Division by zero in Rational');
  }

  if (d < 0n) {
    n = -n;
    d = -d;
  }

  const g = gcd(n, d);
  return {
    num: n / g,
    den: d / g,
  };
}

export function parseRational(input: string): Rational | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Check fraction syntax "a/b"
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length !== 2) return null;
    const nStr = parts[0].trim();
    const dStr = parts[1].trim();
    if (!/^-?\d+$/.test(nStr) || !/^-?\d+$/.test(dStr)) return null;
    try {
      const d = BigInt(dStr);
      if (d === 0n) return null;
      return createRational(BigInt(nStr), d);
    } catch {
      return null;
    }
  }

  // Check decimal syntax "12.345"
  if (trimmed.includes('.')) {
    if (!/^-?\d+\.\d+$/.test(trimmed)) return null;
    const isNegative = trimmed.startsWith('-');
    const clean = isNegative ? trimmed.slice(1) : trimmed;
    const [whole, frac] = clean.split('.');
    const den = 10n ** BigInt(frac.length);
    const num = BigInt(whole) * den + BigInt(frac);
    return createRational(isNegative ? -num : num, den);
  }

  // Check integer syntax
  if (/^-?\d+$/.test(trimmed)) {
    try {
      return createRational(BigInt(trimmed), 1n);
    } catch {
      return null;
    }
  }

  return null;
}

export function addRational(a: Rational, b: Rational): Rational {
  return createRational(a.num * b.den + b.num * a.den, a.den * b.den);
}

export function subRational(a: Rational, b: Rational): Rational {
  return createRational(a.num * b.den - b.num * a.den, a.den * b.den);
}

export function mulRational(a: Rational, b: Rational): Rational {
  return createRational(a.num * b.num, a.den * b.den);
}

export function divRational(a: Rational, b: Rational): Rational {
  if (b.num === 0n) {
    throw new Error('Division by zero');
  }
  return createRational(a.num * b.den, a.den * b.num);
}

export function compareRational(a: Rational, b: Rational): number {
  const diff = a.num * b.den - b.num * a.den;
  if (diff < 0n) return -1;
  if (diff > 0n) return 1;
  return 0;
}

export function isRationalZero(r: Rational): boolean {
  return r.num === 0n;
}

// Plural convenience aliases
export const addRationals = addRational;
export const subRationals = subRational;
export const subtractRationals = subRational;
export const mulRationals = mulRational;
export const multiplyRationals = mulRational;
export const divRationals = divRational;
export const divideRationals = divRational;
export const compareRationals = compareRational;


export function rationalToDecimal(r: Rational, precision?: number): number {
  const val = Number(r.num) / Number(r.den);
  if (precision !== undefined) {
    const factor = 10 ** precision;
    return Math.round(val * factor) / factor;
  }
  return val;
}

export function rationalToDecimalString(r: Rational, maxDecimals = 6): string {
  const sign = r.num < 0n ? '-' : '';
  const n = r.num < 0n ? -r.num : r.num;
  const whole = n / r.den;
  let rem = n % r.den;

  if (rem === 0n) {
    return `${sign}${whole}`;
  }

  let decimals = '';
  for (let i = 0; i < maxDecimals && rem !== 0n; i++) {
    rem *= 10n;
    decimals += (rem / r.den).toString();
    rem %= r.den;
  }

  return `${sign}${whole}.${decimals}`;
}

export function rationalToString(r: Rational): string {
  if (r.den === 1n) {
    return r.num.toString();
  }
  return `${r.num}/${r.den}`;
}

export function rationalToLatex(r: Rational): string {
  if (r.den === 1n) {
    return r.num.toString();
  }
  const sign = r.num < 0n ? '-' : '';
  const n = r.num < 0n ? -r.num : r.num;
  return `${sign}\\frac{${n}}{${r.den}}`;
}
