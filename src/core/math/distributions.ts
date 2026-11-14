/**
 * Deterministic Parameterized Distribution Engine:
 * CAL-DIST-001 (Bernoulli), CAL-DIST-002 (Binomial),
 * CAL-DIST-003 (Poisson), CAL-DIST-004 (Geometric)
 * Conforms to A-004 v0.2 §5.1, §5.2 and A-003 v0.4 §3.6
 */

import {
  Rational,
  createRational,
  parseRational,
  addRational,
  subRational,
  mulRational,
  divRational,
  compareRational,
  rationalToString,
  rationalToLatex,
  rationalToDecimal,
} from './rational';
import { CalculationResult, CalculationId } from './types';
import { CALCULATION_ENGINE_VERSION } from './events';

export type DistributionType = 'bernoulli' | 'binomial' | 'geometric' | 'poisson';

export interface BernoulliDistribution {
  readonly type: 'bernoulli';
  readonly p: Rational;
}

export interface BinomialDistribution {
  readonly type: 'binomial';
  readonly n: number;
  readonly p: Rational;
}

export interface GeometricDistribution {
  readonly type: 'geometric';
  readonly p: Rational; // Support begins at 1 per transcript convention
}

export interface PoissonDistribution {
  readonly type: 'poisson';
  readonly lambda: number;
}

export type ParameterizedDistribution =
  | BernoulliDistribution
  | BinomialDistribution
  | GeometricDistribution
  | PoissonDistribution;

export interface DistributionMoments {
  readonly mean: number;
  readonly variance: number;
  readonly exactMean?: Rational;
  readonly exactVariance?: Rational;
  readonly displayMean: string;
  readonly displayVariance: string;
}

export interface DisplayTablePoint {
  readonly x: number;
  readonly mass: number;
  readonly exactMass?: Rational;
  readonly cdf: number;
  readonly exactCdf?: Rational;
}

export interface DisplayTableResult {
  readonly points: readonly DisplayTablePoint[];
  readonly omittedTailMass: number;
  readonly isTruncated: boolean;
  readonly tailBoundDescription?: string;
}

export interface SimulationResult {
  readonly sampleCount: number;
  readonly seed: number;
  readonly frequencies: Readonly<Record<number, { count: number; frequency: number }>>;
  readonly empiricalMean: number;
  readonly empiricalVariance: number;
  readonly samplesPreview: readonly number[];
}

/**
 * BigInt Exponentiation
 */
function bigintPow(base: bigint, exp: bigint): bigint {
  if (exp === 0n) return 1n;
  let res = 1n;
  let b = base;
  let e = exp;
  while (e > 0n) {
    if (e % 2n === 1n) res *= b;
    b *= b;
    e /= 2n;
  }
  return res;
}

/**
 * BigInt Binomial Coefficient C(n, k)
 */
function binomialCoeff(n: bigint, k: bigint): bigint {
  if (k < 0n || k > n) return 0n;
  if (k === 0n || k === n) return 1n;
  let kEff = k;
  if (kEff > n / 2n) kEff = n - kEff;
  let res = 1n;
  for (let i = 1n; i <= kEff; i++) {
    res = (res * (n - i + 1n)) / i;
  }
  return res;
}

/**
 * Log Factorial sum ln(k!)
 */
function logFactorial(k: number): number {
  if (k <= 1) return 0;
  let sum = 0;
  for (let i = 2; i <= k; i++) {
    sum += Math.log(i);
  }
  return sum;
}

// -------------------------------------------------------------
// Distribution Factory & Validation Functions
// -------------------------------------------------------------

export function createBernoulli(
  pInput: Rational | number | string
): CalculationResult<BernoulliDistribution> {
  const p = typeof pInput === 'object' && 'num' in pInput ? pInput : (typeof pInput === 'string' ? parseRational(pInput) : parseRational(String(pInput)));
  if (!p) {
    return {
      calculation_id: 'CAL-DIST-001',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-PARAM-DOMAIN',
      message: 'Parameter p must be a valid rational or decimal in [0, 1].',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const zero = createRational(0n);
  const one = createRational(1n);

  if (compareRational(p, zero) < 0 || compareRational(p, one) > 0) {
    return {
      calculation_id: 'CAL-DIST-001',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-PARAM-DOMAIN',
      message: `Parameter p=${rationalToString(p)} is outside valid probability domain [0, 1].`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  return {
    calculation_id: 'CAL-DIST-001',
    status: 'valid',
    precision: 'exact',
    value: { type: 'bernoulli', p },
    display_value: `Bernoulli(p=${rationalToString(p)})`,
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

export function createBinomial(
  n: number,
  pInput: Rational | number | string
): CalculationResult<BinomialDistribution> {
  if (!Number.isInteger(n) || n < 0) {
    return {
      calculation_id: 'CAL-DIST-002',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-PARAM-DOMAIN',
      message: `Trial count n=${n} must be a non-negative integer.`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Engine scale ceiling per A-004 §5.2
  if (n > 10000) {
    return {
      calculation_id: 'CAL-DIST-002',
      status: 'unsupported',
      precision: 'exact',
      value: null,
      error_code: 'E-UNSUPPORTED-SCALE',
      message: `Trial count n=${n} exceeds engine ceiling of 10000.`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const p = typeof pInput === 'object' && 'num' in pInput ? pInput : (typeof pInput === 'string' ? parseRational(pInput) : parseRational(String(pInput)));
  if (!p) {
    return {
      calculation_id: 'CAL-DIST-002',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-PARAM-DOMAIN',
      message: 'Parameter p must be a valid rational or decimal in [0, 1].',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const zero = createRational(0n);
  const one = createRational(1n);

  if (compareRational(p, zero) < 0 || compareRational(p, one) > 0) {
    return {
      calculation_id: 'CAL-DIST-002',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-PARAM-DOMAIN',
      message: `Parameter p=${rationalToString(p)} is outside valid probability domain [0, 1].`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  return {
    calculation_id: 'CAL-DIST-002',
    status: 'valid',
    precision: n <= 1000 ? 'exact' : 'approximate',
    value: { type: 'binomial', n, p },
    display_value: `Binomial(n=${n}, p=${rationalToString(p)})`,
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

export function createGeometric(
  pInput: Rational | number | string
): CalculationResult<GeometricDistribution> {
  const p = typeof pInput === 'object' && 'num' in pInput ? pInput : (typeof pInput === 'string' ? parseRational(pInput) : parseRational(String(pInput)));
  if (!p) {
    return {
      calculation_id: 'CAL-DIST-004',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-PARAM-DOMAIN',
      message: 'Parameter p must be a valid rational or decimal in (0, 1].',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const zero = createRational(0n);
  const one = createRational(1n);

  // Geometric requires 0 < p <= 1 (if p=0, waiting time is undefined/infinite)
  if (compareRational(p, zero) <= 0 || compareRational(p, one) > 0) {
    return {
      calculation_id: 'CAL-DIST-004',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-PARAM-DOMAIN',
      message: `Parameter p=${rationalToString(p)} is outside valid domain (0, 1] for Geometric distribution.`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  return {
    calculation_id: 'CAL-DIST-004',
    status: 'valid',
    precision: 'exact',
    value: { type: 'geometric', p },
    display_value: `Geometric(p=${rationalToString(p)}) [support starts at 1]`,
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

export function createPoisson(
  lambdaInput: number | string
): CalculationResult<PoissonDistribution> {
  const lambda = typeof lambdaInput === 'string' ? Number(lambdaInput) : lambdaInput;
  if (!Number.isFinite(lambda) || lambda < 0) {
    return {
      calculation_id: 'CAL-DIST-003',
      status: 'invalid_configuration',
      precision: 'approximate',
      value: null,
      error_code: 'E-PARAM-DOMAIN',
      message: `Rate parameter λ=${lambdaInput} must be a non-negative finite real number.`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Engine scale ceiling per A-004 §5.2
  if (lambda > 1000) {
    return {
      calculation_id: 'CAL-DIST-003',
      status: 'unsupported',
      precision: 'approximate',
      value: null,
      error_code: 'E-UNSUPPORTED-SCALE',
      message: `Rate parameter λ=${lambda} exceeds engine ceiling of 1000.`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  return {
    calculation_id: 'CAL-DIST-003',
    status: 'valid',
    precision: 'approximate',
    value: { type: 'poisson', lambda },
    display_value: `Poisson(λ=${lambda})`,
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

// -------------------------------------------------------------
// PMF Operations (CAL-DIST-001 - CAL-DIST-004)
// -------------------------------------------------------------

/**
 * CAL-DIST-001: Bernoulli PMF: P(X=k)
 * Support {0, 1}. P(X=1) = p, P(X=0) = 1-p. Out-of-support returns valid 0.
 */
export function calculateBernoulliPmf(
  dist: BernoulliDistribution,
  k: number
): CalculationResult<Rational> {
  const zero = createRational(0n);
  const one = createRational(1n);

  if (k === 1) {
    return {
      calculation_id: 'CAL-DIST-001',
      status: 'valid',
      precision: 'exact',
      value: dist.p,
      exact_rational: dist.p,
      display_value: rationalToString(dist.p),
      latex_value: rationalToLatex(dist.p),
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  if (k === 0) {
    const q = subRational(one, dist.p);
    return {
      calculation_id: 'CAL-DIST-001',
      status: 'valid',
      precision: 'exact',
      value: q,
      exact_rational: q,
      display_value: rationalToString(q),
      latex_value: rationalToLatex(q),
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Out of support point query returns valid zero per A-004
  return {
    calculation_id: 'CAL-DIST-001',
    status: 'valid',
    precision: 'exact',
    value: zero,
    exact_rational: zero,
    display_value: '0',
    latex_value: '0',
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

/**
 * CAL-DIST-002: Binomial PMF: P(X=k) = C(n, k) p^k (1-p)^(n-k)
 * Support {0, 1, ..., n}. Out-of-support returns valid 0.
 * Exact rational arithmetic when n <= 1000.
 */
export function calculateBinomialPmf(
  dist: BinomialDistribution,
  k: number
): CalculationResult<Rational> {
  const zero = createRational(0n);

  if (!Number.isInteger(k) || k < 0 || k > dist.n) {
    return {
      calculation_id: 'CAL-DIST-002',
      status: 'valid',
      precision: 'exact',
      value: zero,
      exact_rational: zero,
      display_value: '0',
      latex_value: '0',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const nBig = BigInt(dist.n);
  const kBig = BigInt(k);
  const comb = binomialCoeff(nBig, kBig);

  // Exact rational calculation
  const a = dist.p.num;
  const b = dist.p.den;
  const bMinusA = b - a;

  // P(X=k) = comb * a^k * (b-a)^(n-k) / b^n
  const numFactor = comb * bigintPow(a, kBig) * bigintPow(bMinusA, nBig - kBig);
  const denFactor = bigintPow(b, nBig);

  const mass = createRational(numFactor, denFactor);

  return {
    calculation_id: 'CAL-DIST-002',
    status: 'valid',
    precision: dist.n <= 1000 ? 'exact' : 'approximate',
    value: mass,
    exact_rational: mass,
    display_value: rationalToString(mass),
    latex_value: rationalToLatex(mass),
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

/**
 * CAL-DIST-004: Geometric PMF: P(X=k) = (1-p)^(k-1) p
 * Support starts at 1: {1, 2, ...} per transcript convention.
 * Out-of-support (k < 1 or non-integer) returns valid 0.
 */
export function calculateGeometricPmf(
  dist: GeometricDistribution,
  k: number
): CalculationResult<Rational> {
  const zero = createRational(0n);

  if (!Number.isInteger(k) || k < 1) {
    return {
      calculation_id: 'CAL-DIST-004',
      status: 'valid',
      precision: 'exact',
      value: zero,
      exact_rational: zero,
      display_value: '0',
      latex_value: '0',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const a = dist.p.num;
  const b = dist.p.den;
  const bMinusA = b - a;
  const kMinus1 = BigInt(k - 1);
  const kBig = BigInt(k);

  // P(X=k) = (b-a)^(k-1) * a / b^k
  const num = bigintPow(bMinusA, kMinus1) * a;
  const den = bigintPow(b, kBig);
  const mass = createRational(num, den);

  return {
    calculation_id: 'CAL-DIST-004',
    status: 'valid',
    precision: 'exact',
    value: mass,
    exact_rational: mass,
    display_value: rationalToString(mass),
    latex_value: rationalToLatex(mass),
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

/**
 * CAL-DIST-003: Poisson PMF: P(X=k) = e^(-λ) λ^k / k!
 * Support {0, 1, 2, ...}. Out-of-support returns valid 0.
 * Marked approximate per A-004 §5.1 golden vector.
 */
export function calculatePoissonPmf(
  dist: PoissonDistribution,
  k: number
): CalculationResult<number> {
  if (!Number.isInteger(k) || k < 0) {
    return {
      calculation_id: 'CAL-DIST-003',
      status: 'valid',
      precision: 'approximate',
      value: 0,
      display_value: '0',
      latex_value: '0',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  if (dist.lambda === 0) {
    const val = k === 0 ? 1 : 0;
    return {
      calculation_id: 'CAL-DIST-003',
      status: 'valid',
      precision: 'approximate',
      value: val,
      display_value: String(val),
      latex_value: String(val),
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Stable log-space calculation: ln P(X=k) = k*ln(λ) - λ - ln(k!)
  const logP = k * Math.log(dist.lambda) - dist.lambda - logFactorial(k);
  const mass = logP < -700 ? 0 : Math.exp(logP);

  return {
    calculation_id: 'CAL-DIST-003',
    status: 'valid',
    precision: 'approximate',
    value: mass,
    display_value: mass.toFixed(6),
    latex_value: mass.toFixed(6),
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

// -------------------------------------------------------------
// Analytical CDF Operations
// -------------------------------------------------------------

export function calculateBernoulliCdf(
  dist: BernoulliDistribution,
  x: number
): CalculationResult<Rational> {
  const zero = createRational(0n);
  const one = createRational(1n);

  if (x < 0) {
    return {
      calculation_id: 'CAL-DIST-001',
      status: 'valid',
      precision: 'exact',
      value: zero,
      exact_rational: zero,
      display_value: '0',
      latex_value: '0',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  if (x < 1) {
    const q = subRational(one, dist.p);
    return {
      calculation_id: 'CAL-DIST-001',
      status: 'valid',
      precision: 'exact',
      value: q,
      exact_rational: q,
      display_value: rationalToString(q),
      latex_value: rationalToLatex(q),
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  return {
    calculation_id: 'CAL-DIST-001',
    status: 'valid',
    precision: 'exact',
    value: one,
    exact_rational: one,
    display_value: '1',
    latex_value: '1',
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

export function calculateBinomialCdf(
  dist: BinomialDistribution,
  x: number
): CalculationResult<Rational> {
  const zero = createRational(0n);
  const one = createRational(1n);

  if (x < 0) {
    return {
      calculation_id: 'CAL-DIST-002',
      status: 'valid',
      precision: 'exact',
      value: zero,
      exact_rational: zero,
      display_value: '0',
      latex_value: '0',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  if (x >= dist.n) {
    return {
      calculation_id: 'CAL-DIST-002',
      status: 'valid',
      precision: 'exact',
      value: one,
      exact_rational: one,
      display_value: '1',
      latex_value: '1',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const kMax = Math.floor(x);
  let total = zero;
  for (let k = 0; k <= kMax; k++) {
    const pmfRes = calculateBinomialPmf(dist, k);
    if (pmfRes.value) {
      total = addRational(total, pmfRes.value);
    }
  }

  return {
    calculation_id: 'CAL-DIST-002',
    status: 'valid',
    precision: 'exact',
    value: total,
    exact_rational: total,
    display_value: rationalToString(total),
    latex_value: rationalToLatex(total),
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

export function calculateGeometricCdf(
  dist: GeometricDistribution,
  x: number
): CalculationResult<Rational> {
  const zero = createRational(0n);

  // Geometric support starts at 1: for x < 1, F(x) = 0
  if (x < 1) {
    return {
      calculation_id: 'CAL-DIST-004',
      status: 'valid',
      precision: 'exact',
      value: zero,
      exact_rational: zero,
      display_value: '0',
      latex_value: '0',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const k = BigInt(Math.floor(x));
  const a = dist.p.num;
  const b = dist.p.den;
  const bMinusA = b - a;

  // F(k) = 1 - (1-p)^k = (b^k - (b-a)^k) / b^k
  const num = bigintPow(b, k) - bigintPow(bMinusA, k);
  const den = bigintPow(b, k);
  const cdf = createRational(num, den);

  return {
    calculation_id: 'CAL-DIST-004',
    status: 'valid',
    precision: 'exact',
    value: cdf,
    exact_rational: cdf,
    display_value: rationalToString(cdf),
    latex_value: rationalToLatex(cdf),
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

export function calculatePoissonCdf(
  dist: PoissonDistribution,
  x: number
): CalculationResult<number> {
  if (x < 0) {
    return {
      calculation_id: 'CAL-DIST-003',
      status: 'valid',
      precision: 'approximate',
      value: 0,
      display_value: '0',
      latex_value: '0',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const kMax = Math.floor(x);
  let sum = 0;
  for (let k = 0; k <= kMax; k++) {
    const pmfRes = calculatePoissonPmf(dist, k);
    if (pmfRes.value !== null) {
      sum += pmfRes.value;
    }
  }

  const cdfVal = Math.min(1, sum);
  return {
    calculation_id: 'CAL-DIST-003',
    status: 'valid',
    precision: 'approximate',
    value: cdfVal,
    display_value: cdfVal.toFixed(6),
    latex_value: cdfVal.toFixed(6),
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

// -------------------------------------------------------------
// Theoretical Moments (Mean & Variance)
// -------------------------------------------------------------

export function getDistributionMoments(dist: ParameterizedDistribution): DistributionMoments {
  const one = createRational(1n);

  switch (dist.type) {
    case 'bernoulli': {
      // E[X] = p, Var(X) = p(1-p)
      const q = subRational(one, dist.p);
      const variance = mulRational(dist.p, q);
      return {
        mean: rationalToDecimal(dist.p),
        variance: rationalToDecimal(variance),
        exactMean: dist.p,
        exactVariance: variance,
        displayMean: rationalToString(dist.p),
        displayVariance: rationalToString(variance),
      };
    }
    case 'binomial': {
      // E[X] = np, Var(X) = np(1-p)
      const nRat = createRational(BigInt(dist.n));
      const mean = mulRational(nRat, dist.p);
      const q = subRational(one, dist.p);
      const variance = mulRational(mean, q);
      return {
        mean: rationalToDecimal(mean),
        variance: rationalToDecimal(variance),
        exactMean: mean,
        exactVariance: variance,
        displayMean: rationalToString(mean),
        displayVariance: rationalToString(variance),
      };
    }
    case 'geometric': {
      // Support starts at 1: E[X] = 1/p, Var(X) = (1-p)/p^2
      const mean = divRational(one, dist.p);
      const q = subRational(one, dist.p);
      const pSquared = mulRational(dist.p, dist.p);
      const variance = divRational(q, pSquared);
      return {
        mean: rationalToDecimal(mean),
        variance: rationalToDecimal(variance),
        exactMean: mean,
        exactVariance: variance,
        displayMean: rationalToString(mean),
        displayVariance: rationalToString(variance),
      };
    }
    case 'poisson': {
      // E[X] = λ, Var(X) = λ
      return {
        mean: dist.lambda,
        variance: dist.lambda,
        displayMean: String(dist.lambda),
        displayVariance: String(dist.lambda),
      };
    }
  }
}

// -------------------------------------------------------------
// Display Table Generation & Truncated Tail Support (A-004 §5.2)
// -------------------------------------------------------------

export function getDistributionDisplayTable(
  dist: ParameterizedDistribution,
  maxPoints = 50
): DisplayTableResult {
  const points: DisplayTablePoint[] = [];

  switch (dist.type) {
    case 'bernoulli': {
      const p0 = calculateBernoulliPmf(dist, 0).value!;
      const p1 = calculateBernoulliPmf(dist, 1).value!;
      const cdf0 = p0;
      const cdf1 = createRational(1n);

      points.push({
        x: 0,
        mass: rationalToDecimal(p0),
        exactMass: p0,
        cdf: rationalToDecimal(cdf0),
        exactCdf: cdf0,
      });
      points.push({
        x: 1,
        mass: rationalToDecimal(p1),
        exactMass: p1,
        cdf: 1,
        exactCdf: cdf1,
      });

      return {
        points,
        omittedTailMass: 0,
        isTruncated: false,
      };
    }

    case 'binomial': {
      const n = dist.n;
      let cumRat = createRational(0n);
      const displayCount = Math.min(n + 1, maxPoints);

      for (let k = 0; k < displayCount; k++) {
        const pmf = calculateBinomialPmf(dist, k).value!;
        cumRat = addRational(cumRat, pmf);
        points.push({
          x: k,
          mass: rationalToDecimal(pmf),
          exactMass: pmf,
          cdf: rationalToDecimal(cumRat),
          exactCdf: cumRat,
        });
      }

      const isTruncated = displayCount <= n;
      const omittedTailMass = isTruncated
        ? Math.max(0, 1 - rationalToDecimal(cumRat))
        : 0;

      return {
        points,
        omittedTailMass,
        isTruncated,
        tailBoundDescription: isTruncated
          ? `P(X > ${displayCount - 1}) ≈ ${omittedTailMass.toFixed(6)}`
          : undefined,
      };
    }

    case 'geometric': {
      // Support begins at 1
      const pDec = rationalToDecimal(dist.p);
      // Determine cutoff where omitted tail (1-p)^k < 1e-4
      let kCutoff = Math.ceil(Math.log(1e-4) / Math.log(1 - pDec));
      if (!Number.isFinite(kCutoff) || kCutoff < 10) kCutoff = 10;
      if (kCutoff > maxPoints) kCutoff = maxPoints;

      let cumRat = createRational(0n);
      for (let k = 1; k <= kCutoff; k++) {
        const pmf = calculateGeometricPmf(dist, k).value!;
        cumRat = addRational(cumRat, pmf);
        points.push({
          x: k,
          mass: rationalToDecimal(pmf),
          exactMass: pmf,
          cdf: rationalToDecimal(cumRat),
          exactCdf: cumRat,
        });
      }

      const omittedTailMass = Math.max(0, 1 - rationalToDecimal(cumRat));
      return {
        points,
        omittedTailMass,
        isTruncated: true,
        tailBoundDescription: `Omitted tail P(X > ${kCutoff}) = (1 - p)^${kCutoff} ≈ ${omittedTailMass.toFixed(6)}`,
      };
    }

    case 'poisson': {
      // Support begins at 0
      const lambda = dist.lambda;
      const stdDev = Math.sqrt(lambda);
      let kCutoff = Math.ceil(lambda + 4 * stdDev + 3);
      if (kCutoff < 10) kCutoff = 10;
      if (kCutoff > maxPoints) kCutoff = maxPoints;

      let cumMass = 0;
      for (let k = 0; k <= kCutoff; k++) {
        const pmf = calculatePoissonPmf(dist, k).value!;
        cumMass += pmf;
        points.push({
          x: k,
          mass: pmf,
          cdf: Math.min(1, cumMass),
        });
      }

      const omittedTailMass = Math.max(0, 1 - cumMass);
      return {
        points,
        omittedTailMass,
        isTruncated: omittedTailMass > 1e-6,
        tailBoundDescription:
          omittedTailMass > 1e-6
            ? `Omitted tail P(X > ${kCutoff}) ≈ ${omittedTailMass.toFixed(6)}`
            : undefined,
      };
    }
  }
}

// -------------------------------------------------------------
// Deterministic Pseudorandom Simulation Engine
// -------------------------------------------------------------

/**
 * Seedable Mulberry32 PRNG (32-bit integer state)
 */
export class DeterministicPRNG {
  private s: number;

  constructor(seed: number) {
    this.s = seed >>> 0;
  }

  next(): number {
    this.s = (this.s + 0x6d2b79f5) | 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

/**
 * Generate N pseudorandom samples for a given distribution with reproducible seed.
 */
export function simulateDistribution(
  dist: ParameterizedDistribution,
  sampleCount: number,
  seed = 42
): CalculationResult<SimulationResult> {
  if (!Number.isInteger(sampleCount) || sampleCount < 1 || sampleCount > 100000) {
    return {
      calculation_id: 'CAL-DIST-001',
      status: 'invalid_configuration',
      precision: 'empirical',
      value: null,
      error_code: 'E-RUN-COUNT',
      message: `Sample count N=${sampleCount} must be an integer between 1 and 100,000.`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  if (!Number.isFinite(seed)) {
    return {
      calculation_id: 'CAL-DIST-001',
      status: 'invalid_configuration',
      precision: 'empirical',
      value: null,
      error_code: 'E-SEED-FORMAT',
      message: `Seed must be a valid finite number.`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const rng = new DeterministicPRNG(seed);
  const counts: Record<number, number> = {};
  const samplesPreview: number[] = [];
  let sum = 0;
  let sumSq = 0;

  for (let i = 0; i < sampleCount; i++) {
    let sample = 0;

    switch (dist.type) {
      case 'bernoulli': {
        const p = rationalToDecimal(dist.p);
        sample = rng.next() < p ? 1 : 0;
        break;
      }
      case 'binomial': {
        const p = rationalToDecimal(dist.p);
        let successes = 0;
        for (let t = 0; t < dist.n; t++) {
          if (rng.next() < p) successes++;
        }
        sample = successes;
        break;
      }
      case 'geometric': {
        // Number of trials until first success (support starts at 1)
        const p = rationalToDecimal(dist.p);
        if (p >= 1) {
          sample = 1;
        } else {
          // Inversion method: floor(ln(1 - u) / ln(1 - p)) + 1
          const u = rng.next();
          sample = Math.floor(Math.log(1 - u) / Math.log(1 - p)) + 1;
          if (sample < 1) sample = 1;
        }
        break;
      }
      case 'poisson': {
        const lambda = dist.lambda;
        if (lambda === 0) {
          sample = 0;
        } else if (lambda < 30) {
          // Knuth's algorithm
          const L = Math.exp(-lambda);
          let k = 0;
          let prod = 1;
          do {
            k++;
            prod *= rng.next();
          } while (prod > L);
          sample = k - 1;
        } else {
          // Gaussian approximation for large lambda
          const u1 = Math.max(1e-10, rng.next());
          const u2 = rng.next();
          const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
          sample = Math.max(0, Math.round(lambda + Math.sqrt(lambda) * z0));
        }
        break;
      }
    }

    counts[sample] = (counts[sample] || 0) + 1;
    sum += sample;
    sumSq += sample * sample;

    if (i < 20) {
      samplesPreview.push(sample);
    }
  }

  const empiricalMean = sum / sampleCount;
  const empiricalVariance =
    sampleCount > 1
      ? (sumSq - (sum * sum) / sampleCount) / (sampleCount - 1)
      : 0;

  const frequencies: Record<number, { count: number; frequency: number }> = {};
  for (const keyStr of Object.keys(counts)) {
    const k = Number(keyStr);
    frequencies[k] = {
      count: counts[k],
      frequency: counts[k] / sampleCount,
    };
  }

  const calcId: CalculationId =
    dist.type === 'bernoulli'
      ? 'CAL-DIST-001'
      : dist.type === 'binomial'
      ? 'CAL-DIST-002'
      : dist.type === 'geometric'
      ? 'CAL-DIST-004'
      : 'CAL-DIST-003';

  return {
    calculation_id: calcId,
    status: 'valid',
    precision: 'empirical',
    value: {
      sampleCount,
      seed,
      frequencies,
      empiricalMean,
      empiricalVariance,
      samplesPreview,
    },
    display_value: `Simulated N=${sampleCount}, mean=${empiricalMean.toFixed(4)}, var=${empiricalVariance.toFixed(4)}`,
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}
