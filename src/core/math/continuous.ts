/**
 * Deterministic Continuous Distribution Engine:
 * CAL-CONT-001 (Uniform), CAL-CONT-002 (Exponential),
 * CAL-CONT-003 (Gaussian / Normal), CAL-CONT-004 (Continuous Interval Probability)
 * Conforms to A-004 v0.2 §5.1, §5.2 and A-003 v0.4 §4.1
 */

import { CalculationResult } from './types';
import { CALCULATION_ENGINE_VERSION } from './events';
import { DeterministicPRNG } from './simulation';

export type ContinuousDistributionType = 'uniform' | 'exponential' | 'gaussian';

export interface UniformDistribution {
  readonly type: 'uniform';
  readonly a: number;
  readonly b: number;
}

export interface ExponentialDistribution {
  readonly type: 'exponential';
  readonly lambda: number;
}

export interface GaussianDistribution {
  readonly type: 'gaussian';
  readonly mu: number;
  readonly sigma: number;
}

export type ContinuousDistribution =
  | UniformDistribution
  | ExponentialDistribution
  | GaussianDistribution;

export interface ContinuousMoments {
  readonly mean: number;
  readonly variance: number;
  readonly stdDev: number;
  readonly displayMean: string;
  readonly displayVariance: string;
}

export interface DensityCurvePoint {
  readonly x: number;
  readonly density: number;
  readonly cdf: number;
}

export interface ContinuousIntervalResult {
  readonly lower: number;
  readonly upper: number;
  readonly probability: number;
  readonly displayProbability: string;
  readonly endpointNote: string;
}

export interface HistogramBin {
  readonly binStart: number;
  readonly binEnd: number;
  readonly midPoint: number;
  readonly count: number;
  readonly empiricalDensity: number;
}

export interface ContinuousSimulationResult {
  readonly sampleCount: number;
  readonly seed: number;
  readonly empiricalMean: number;
  readonly empiricalVariance: number;
  readonly bins: readonly HistogramBin[];
  readonly samplesPreview: readonly number[];
}

/**
 * High-precision numerical evaluation of the Error Function erf(x)
 * Based on Abramowitz & Stegun 7.1.26 (Maximum error < 1.5e-7)
 */
export function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);

  // Constants
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * absX);
  const poly = ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  const y = 1.0 - poly * Math.exp(-absX * absX);

  return sign * y;
}

/**
 * Standard Normal Cumulative Distribution Function Φ(z)
 */
export function standardNormalCdf(z: number): number {
  return 0.5 * (1.0 + erf(z / Math.SQRT2));
}

// -------------------------------------------------------------
// Factory & Validation Functions
// -------------------------------------------------------------

export function createUniform(
  a: number,
  b: number
): CalculationResult<UniformDistribution> {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return {
      calculation_id: 'CAL-CONT-001',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-NONFINITE-INPUT',
      message: 'Bounds a and b must be finite real numbers.',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Precondition: a < b (bounds order violation if a >= b)
  if (a >= b) {
    return {
      calculation_id: 'CAL-CONT-001',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-BOUNDS-ORDER',
      message: `Upper bound b (${b}) must strictly exceed lower bound a (${a}).`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  return {
    calculation_id: 'CAL-CONT-001',
    status: 'valid',
    precision: 'exact',
    value: { type: 'uniform', a, b },
    display_value: `Uniform(a=${a}, b=${b})`,
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

export function createExponential(
  lambda: number
): CalculationResult<ExponentialDistribution> {
  if (!Number.isFinite(lambda)) {
    return {
      calculation_id: 'CAL-CONT-002',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-NONFINITE-INPUT',
      message: 'Rate parameter λ must be a finite real number.',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Precondition: λ > 0
  if (lambda <= 0) {
    return {
      calculation_id: 'CAL-CONT-002',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-PARAM-DOMAIN',
      message: `Rate parameter λ (${lambda}) must be strictly positive (λ > 0).`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  return {
    calculation_id: 'CAL-CONT-002',
    status: 'valid',
    precision: 'exact',
    value: { type: 'exponential', lambda },
    display_value: `Exponential(λ=${lambda})`,
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

export function createGaussian(
  mu: number,
  sigma: number
): CalculationResult<GaussianDistribution> {
  if (!Number.isFinite(mu) || !Number.isFinite(sigma)) {
    return {
      calculation_id: 'CAL-CONT-003',
      status: 'invalid_configuration',
      precision: 'approximate',
      value: null,
      error_code: 'E-NONFINITE-INPUT',
      message: 'Parameters μ and σ must be finite real numbers.',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Precondition: σ > 0
  if (sigma <= 0) {
    return {
      calculation_id: 'CAL-CONT-003',
      status: 'invalid_configuration',
      precision: 'approximate',
      value: null,
      error_code: 'E-PARAM-DOMAIN',
      message: `Standard deviation σ (${sigma}) must be strictly positive (σ > 0).`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  return {
    calculation_id: 'CAL-CONT-003',
    status: 'valid',
    precision: 'approximate',
    value: { type: 'gaussian', mu, sigma },
    display_value: `Normal(μ=${mu}, σ=${sigma})`,
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

// -------------------------------------------------------------
// PDF and CDF Evaluation
// -------------------------------------------------------------

/**
 * Evaluates probability density function f_X(x)
 * Crucial note: f(x) is density, NOT point probability!
 */
export function evaluatePdf(dist: ContinuousDistribution, x: number): number {
  switch (dist.type) {
    case 'uniform': {
      if (x >= dist.a && x <= dist.b) {
        return 1.0 / (dist.b - dist.a);
      }
      return 0.0;
    }
    case 'exponential': {
      if (x < 0) return 0.0;
      return dist.lambda * Math.exp(-dist.lambda * x);
    }
    case 'gaussian': {
      const z = (x - dist.mu) / dist.sigma;
      const factor = 1.0 / (dist.sigma * Math.sqrt(2.0 * Math.PI));
      return factor * Math.exp(-0.5 * z * z);
    }
  }
}

/**
 * Evaluates continuous cumulative distribution function F_X(x) = P(X <= x)
 */
export function evaluateContinuousCdf(dist: ContinuousDistribution, x: number): number {
  switch (dist.type) {
    case 'uniform': {
      if (x < dist.a) return 0.0;
      if (x > dist.b) return 1.0;
      return (x - dist.a) / (dist.b - dist.a);
    }
    case 'exponential': {
      if (x <= 0) return 0.0;
      return 1.0 - Math.exp(-dist.lambda * x);
    }
    case 'gaussian': {
      const z = (x - dist.mu) / dist.sigma;
      return standardNormalCdf(z);
    }
  }
}

// -------------------------------------------------------------
// Interval Integration & Endpoint Invariance (CAL-CONT-004)
// -------------------------------------------------------------

/**
 * CAL-CONT-004: Evaluate P(lower <= X <= upper) = F(upper) - F(lower)
 * Demonstrates continuous endpoint equivalence:
 * P([a, b]) = P((a, b]) = P([a, b)) = P((a, b))
 */
export function calculateContinuousIntervalProbability(
  dist: ContinuousDistribution,
  lower: number,
  upper: number
): CalculationResult<ContinuousIntervalResult> {
  if (!Number.isFinite(lower) || !Number.isFinite(upper)) {
    return {
      calculation_id: 'CAL-CONT-004',
      status: 'invalid_configuration',
      precision: dist.type === 'gaussian' ? 'approximate' : 'exact',
      value: null,
      error_code: 'E-NONFINITE-INPUT',
      message: 'Interval bounds must be finite numbers.',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  if (lower > upper) {
    return {
      calculation_id: 'CAL-CONT-004',
      status: 'invalid_configuration',
      precision: dist.type === 'gaussian' ? 'approximate' : 'exact',
      value: null,
      error_code: 'E-BOUNDS-ORDER',
      message: `Interval lower bound (${lower}) cannot exceed upper bound (${upper}).`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const fUpper = evaluateContinuousCdf(dist, upper);
  const fLower = evaluateContinuousCdf(dist, lower);
  const probability = Math.max(0.0, Math.min(1.0, fUpper - fLower));

  const result: ContinuousIntervalResult = {
    lower,
    upper,
    probability,
    displayProbability: probability.toFixed(6),
    endpointNote:
      'In continuous probability, P(a ≤ X ≤ b) = P(a < X < b) because point probability P(X = x) = 0 for any single point.',
  };

  return {
    calculation_id: 'CAL-CONT-004',
    status: 'valid',
    precision: dist.type === 'gaussian' ? 'approximate' : 'exact',
    value: result,
    display_value: probability.toFixed(6),
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

// -------------------------------------------------------------
// Theoretical Moments
// -------------------------------------------------------------

export function getContinuousMoments(dist: ContinuousDistribution): ContinuousMoments {
  switch (dist.type) {
    case 'uniform': {
      const mean = (dist.a + dist.b) / 2.0;
      const variance = Math.pow(dist.b - dist.a, 2) / 12.0;
      return {
        mean,
        variance,
        stdDev: Math.sqrt(variance),
        displayMean: mean.toFixed(4),
        displayVariance: variance.toFixed(4),
      };
    }
    case 'exponential': {
      const mean = 1.0 / dist.lambda;
      const variance = 1.0 / Math.pow(dist.lambda, 2);
      return {
        mean,
        variance,
        stdDev: Math.sqrt(variance),
        displayMean: mean.toFixed(4),
        displayVariance: variance.toFixed(4),
      };
    }
    case 'gaussian': {
      const variance = Math.pow(dist.sigma, 2);
      return {
        mean: dist.mu,
        variance,
        stdDev: dist.sigma,
        displayMean: dist.mu.toFixed(4),
        displayVariance: variance.toFixed(4),
      };
    }
  }
}

// -------------------------------------------------------------
// Density Curve Generator for Plotting
// -------------------------------------------------------------

export function getContinuousDensityCurve(
  dist: ContinuousDistribution,
  numPoints = 120
): { xMin: number; xMax: number; points: readonly DensityCurvePoint[] } {
  let xMin = 0;
  let xMax = 1;

  switch (dist.type) {
    case 'uniform': {
      const width = dist.b - dist.a;
      xMin = dist.a - 0.2 * width;
      xMax = dist.b + 0.2 * width;
      break;
    }
    case 'exponential': {
      xMin = 0;
      xMax = Math.max(5.0 / dist.lambda, 4.0);
      break;
    }
    case 'gaussian': {
      xMin = dist.mu - 3.8 * dist.sigma;
      xMax = dist.mu + 3.8 * dist.sigma;
      break;
    }
  }

  const step = (xMax - xMin) / (numPoints - 1);
  const points: DensityCurvePoint[] = [];

  for (let i = 0; i < numPoints; i++) {
    const x = xMin + i * step;
    points.push({
      x,
      density: evaluatePdf(dist, x),
      cdf: evaluateContinuousCdf(dist, x),
    });
  }

  return { xMin, xMax, points };
}

// -------------------------------------------------------------
// Deterministic Continuous PRNG Simulation
// -------------------------------------------------------------

export function simulateContinuousDistribution(
  dist: ContinuousDistribution,
  sampleCount: number,
  seed = 42,
  numBins = 24
): CalculationResult<ContinuousSimulationResult> {
  if (!Number.isInteger(sampleCount) || sampleCount < 1 || sampleCount > 100000) {
    return {
      calculation_id: 'CAL-CONT-001',
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
      calculation_id: 'CAL-CONT-001',
      status: 'invalid_configuration',
      precision: 'empirical',
      value: null,
      error_code: 'E-SEED-FORMAT',
      message: 'Seed must be a valid finite number.',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const rng = new DeterministicPRNG(seed);
  const samples: number[] = new Array(sampleCount);
  let sum = 0;
  let sumSq = 0;

  for (let i = 0; i < sampleCount; i++) {
    let s = 0;
    switch (dist.type) {
      case 'uniform': {
        const u = rng.next();
        s = dist.a + u * (dist.b - dist.a);
        break;
      }
      case 'exponential': {
        // Inversion method: X = -ln(1 - u) / lambda
        const u = Math.min(0.999999999, rng.next());
        s = -Math.log(1.0 - u) / dist.lambda;
        break;
      }
      case 'gaussian': {
        // Box-Muller transform
        const u1 = Math.max(1e-12, rng.next());
        const u2 = rng.next();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        s = dist.mu + dist.sigma * z0;
        break;
      }
    }

    samples[i] = s;
    sum += s;
    sumSq += s * s;
  }

  const empiricalMean = sum / sampleCount;
  const empiricalVariance =
    sampleCount > 1
      ? (sumSq - (sum * sum) / sampleCount) / (sampleCount - 1)
      : 0;

  // Determine bin range
  let { xMin, xMax } = getContinuousDensityCurve(dist);
  if (dist.type === 'exponential') {
    xMin = 0;
  }
  const binWidth = (xMax - xMin) / numBins;
  const binCounts = new Array(numBins).fill(0);

  for (let i = 0; i < sampleCount; i++) {
    const s = samples[i];
    if (s >= xMin && s <= xMax) {
      const bIdx = Math.min(numBins - 1, Math.floor((s - xMin) / binWidth));
      binCounts[bIdx]++;
    }
  }

  const bins: HistogramBin[] = [];
  for (let b = 0; b < numBins; b++) {
    const bStart = xMin + b * binWidth;
    const bEnd = bStart + binWidth;
    const count = binCounts[b];
    // Density = relative frequency / binWidth
    const empiricalDensity = (count / sampleCount) / binWidth;
    bins.push({
      binStart: bStart,
      binEnd: bEnd,
      midPoint: bStart + binWidth / 2,
      count,
      empiricalDensity,
    });
  }

  return {
    calculation_id:
      dist.type === 'uniform'
        ? 'CAL-CONT-001'
        : dist.type === 'exponential'
        ? 'CAL-CONT-002'
        : 'CAL-CONT-003',
    status: 'valid',
    precision: 'empirical',
    value: {
      sampleCount,
      seed,
      empiricalMean,
      empiricalVariance,
      bins,
      samplesPreview: samples.slice(0, 20),
    },
    display_value: `Simulated N=${sampleCount}, mean=${empiricalMean.toFixed(4)}, var=${empiricalVariance.toFixed(4)}`,
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}
