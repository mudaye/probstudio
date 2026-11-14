/**
 * Central Limit Theorem (CLT) & Sums of IID Variables Computation Engine
 * Conforms to A-004 v0.2, A-003 v0.4, and Module M15/M21 curriculum.
 */

import { DeterministicPRNG } from './simulation';
import { CalculationResult } from './types';
import { CALCULATION_ENGINE_VERSION } from './events';

export type CltBaseDistributionType =
  | 'uniform'
  | 'exponential'
  | 'bernoulli'
  | 'die'
  | 'bimodal';

export interface CltBaseDistributionConfig {
  type: CltBaseDistributionType;
  // Uniform [a, b]
  uniformA?: number;
  uniformB?: number;
  // Exponential lambda
  expLambda?: number;
  // Bernoulli p
  bernoulliP?: number;
}

export interface CltTheoreticalMoments {
  baseMean: number;
  baseVariance: number;
  baseStdDev: number;
  sumMean: number;
  sumVariance: number;
  sumStdDev: number;
  standardizedMean: number; // exactly 0
  standardizedVariance: number; // exactly 1
}

export interface CltHistogramBin {
  x0: number;
  x1: number;
  midpoint: number;
  count: number;
  empiricalDensity: number;
  gaussianDensity: number;
}

export interface CltSimulationResult {
  sampleSizeN: number;
  trialCount: number;
  seed: number;
  moments: CltTheoreticalMoments;
  empiricalMeanZ: number;
  empiricalVarianceZ: number;
  empiricalStdDevZ: number;
  bins: CltHistogramBin[];
  maxDensityError: number;
  samplesPreview: number[]; // First few standardized Z values
}

export interface DiscretePmfPoint {
  x: number;
  p: number;
}

/**
 * Standard Normal PDF phi(z) = (1 / sqrt(2*pi)) * exp(-z^2 / 2)
 */
export function standardNormalPdf(z: number): number {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
}

/**
 * Computes exact theoretical mean, variance and standard deviation for base distribution.
 */
export function getBaseDistributionMoments(
  config: CltBaseDistributionConfig
): { mean: number; variance: number; stdDev: number; isDiscrete: boolean; discretePmf?: DiscretePmfPoint[] } {
  switch (config.type) {
    case 'uniform': {
      const a = config.uniformA ?? 0;
      const b = config.uniformB ?? 1;
      const mean = (a + b) / 2;
      const variance = Math.pow(b - a, 2) / 12;
      return { mean, variance, stdDev: Math.sqrt(variance), isDiscrete: false };
    }
    case 'exponential': {
      const lambda = config.expLambda ?? 1;
      const mean = 1 / lambda;
      const variance = 1 / (lambda * lambda);
      return { mean, variance, stdDev: Math.sqrt(variance), isDiscrete: false };
    }
    case 'bernoulli': {
      const p = config.bernoulliP ?? 0.5;
      const mean = p;
      const variance = p * (1 - p);
      const discretePmf: DiscretePmfPoint[] = [
        { x: 0, p: 1 - p },
        { x: 1, p },
      ];
      return { mean, variance, stdDev: Math.sqrt(variance), isDiscrete: true, discretePmf };
    }
    case 'die': {
      // Fair 6-sided die: {1, 2, 3, 4, 5, 6} with p = 1/6
      const mean = 3.5;
      const variance = 35 / 12; // ~2.9166667
      const discretePmf: DiscretePmfPoint[] = [
        { x: 1, p: 1 / 6 },
        { x: 2, p: 1 / 6 },
        { x: 3, p: 1 / 6 },
        { x: 4, p: 1 / 6 },
        { x: 5, p: 1 / 6 },
        { x: 6, p: 1 / 6 },
      ];
      return { mean, variance, stdDev: Math.sqrt(variance), isDiscrete: true, discretePmf };
    }
    case 'bimodal': {
      // Equal mixture of two points: X = -2 (p=0.5) and X = 2 (p=0.5)
      // Mean = 0, E[X^2] = 4, Var = 4
      const mean = 0;
      const variance = 4;
      const discretePmf: DiscretePmfPoint[] = [
        { x: -2, p: 0.5 },
        { x: 2, p: 0.5 },
      ];
      return { mean, variance, stdDev: Math.sqrt(variance), isDiscrete: true, discretePmf };
    }
    default:
      throw new Error(`Unsupported base distribution: ${(config as any).type}`);
  }
}

/**
 * Convolves two discrete PMFs: (P * Q)(x) = sum_y P(y) * Q(x - y)
 */
export function convolveDiscretePmfs(
  pmf1: readonly DiscretePmfPoint[],
  pmf2: readonly DiscretePmfPoint[]
): DiscretePmfPoint[] {
  const sumMap = new Map<number, number>();

  for (const pt1 of pmf1) {
    for (const pt2 of pmf2) {
      const sumVal = Math.round((pt1.x + pt2.x) * 1e6) / 1e6; // avoid float rounding jitter
      const currP = sumMap.get(sumVal) ?? 0;
      sumMap.set(sumVal, currP + pt1.p * pt2.p);
    }
  }

  const result: DiscretePmfPoint[] = [];
  for (const [x, p] of sumMap.entries()) {
    if (p > 1e-12) {
      result.push({ x, p });
    }
  }

  result.sort((a, b) => a.x - b.x);
  return result;
}

/**
 * Computes exact PMF of S_n for discrete distributions using repeated convolution.
 */
export function computeDiscreteSumPmf(
  basePmf: readonly DiscretePmfPoint[],
  n: number
): CalculationResult<DiscretePmfPoint[]> {
  if (n < 1 || n > 50 || !Number.isInteger(n)) {
    return {
      calculation_id: 'CAL-CLT-002',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-PARAM-DOMAIN',
      message: 'Sample size n must be an integer between 1 and 50.',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  let currentPmf: DiscretePmfPoint[] = [...basePmf];
  for (let i = 2; i <= n; i++) {
    currentPmf = convolveDiscretePmfs(currentPmf, basePmf);
  }

  return {
    calculation_id: 'CAL-CLT-002',
    status: 'valid',
    precision: 'exact',
    value: currentPmf,
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

/**
 * Samples a single draw from the base distribution using the PRNG.
 */
function sampleBase(config: CltBaseDistributionConfig, prng: DeterministicPRNG): number {
  switch (config.type) {
    case 'uniform': {
      const a = config.uniformA ?? 0;
      const b = config.uniformB ?? 1;
      return a + (b - a) * prng.next();
    }
    case 'exponential': {
      const lambda = config.expLambda ?? 1;
      const u = Math.max(1e-15, prng.next());
      return -Math.log(u) / lambda;
    }
    case 'bernoulli': {
      const p = config.bernoulliP ?? 0.5;
      return prng.next() < p ? 1 : 0;
    }
    case 'die': {
      return Math.floor(prng.next() * 6) + 1;
    }
    case 'bimodal': {
      return prng.next() < 0.5 ? -2 : 2;
    }
    default:
      return 0;
  }
}

/**
 * Simulates Central Limit Theorem convergence:
 * Draws `trialCount` independent sums S_n = sum_{i=1}^n X_i,
 * standardizes Z_n = (S_n - n*mu) / (sigma * sqrt(n)),
 * and bins into a histogram overlaid with standard normal N(0,1).
 */
export function simulateClt(
  config: CltBaseDistributionConfig,
  sampleSizeN: number,
  trialCount: number,
  seed = 42
): CalculationResult<CltSimulationResult> {
  // 1. Validation
  if (!Number.isInteger(sampleSizeN) || sampleSizeN < 1 || sampleSizeN > 50) {
    return {
      calculation_id: 'CAL-CLT-001',
      status: 'invalid_configuration',
      precision: 'empirical',
      value: null,
      error_code: 'E-PARAM-DOMAIN',
      message: 'Sample size n must be an integer between 1 and 50.',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  if (!Number.isInteger(trialCount) || trialCount < 10 || trialCount > 50000) {
    return {
      calculation_id: 'CAL-CLT-001',
      status: 'invalid_configuration',
      precision: 'empirical',
      value: null,
      error_code: 'E-RUN-COUNT',
      message: 'Trial count must be an integer between 10 and 50,000.',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  if (config.type === 'uniform') {
    const a = config.uniformA ?? 0;
    const b = config.uniformB ?? 1;
    if (a >= b) {
      return {
        calculation_id: 'CAL-CLT-001',
        status: 'invalid_configuration',
        precision: 'empirical',
        value: null,
        error_code: 'E-BOUNDS-ORDER',
        message: 'Uniform lower bound a must be strictly less than upper bound b.',
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
    }
  }

  if (config.type === 'exponential') {
    const lambda = config.expLambda ?? 1;
    if (lambda <= 0) {
      return {
        calculation_id: 'CAL-CLT-001',
        status: 'invalid_configuration',
        precision: 'empirical',
        value: null,
        error_code: 'E-PARAM-DOMAIN',
        message: 'Exponential rate parameter lambda must be strictly positive.',
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
    }
  }

  if (config.type === 'bernoulli') {
    const p = config.bernoulliP ?? 0.5;
    if (p <= 0 || p >= 1) {
      return {
        calculation_id: 'CAL-CLT-001',
        status: 'invalid_configuration',
        precision: 'empirical',
        value: null,
        error_code: 'E-PROB-RANGE',
        message: 'Bernoulli parameter p must be in (0, 1) for non-degenerate variance.',
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
    }
  }

  // 2. Theoretical Moments
  const baseMoments = getBaseDistributionMoments(config);
  const sumMean = sampleSizeN * baseMoments.mean;
  const sumVariance = sampleSizeN * baseMoments.variance;
  const sumStdDev = Math.sqrt(sumVariance);

  const moments: CltTheoreticalMoments = {
    baseMean: baseMoments.mean,
    baseVariance: baseMoments.variance,
    baseStdDev: baseMoments.stdDev,
    sumMean,
    sumVariance,
    sumStdDev,
    standardizedMean: 0,
    standardizedVariance: 1,
  };

  // 3. Monte Carlo Simulation
  const prng = new DeterministicPRNG(seed);
  const zSamples: number[] = new Array(trialCount);
  let sumZ = 0;
  let sumZ2 = 0;

  for (let t = 0; t < trialCount; t++) {
    let s = 0;
    for (let i = 0; i < sampleSizeN; i++) {
      s += sampleBase(config, prng);
    }
    const z = (s - sumMean) / sumStdDev;
    zSamples[t] = z;
    sumZ += z;
    sumZ2 += z * z;
  }

  const empiricalMeanZ = sumZ / trialCount;
  const empiricalVarianceZ = Math.max(0, sumZ2 / trialCount - empiricalMeanZ * empiricalMeanZ);
  const empiricalStdDevZ = Math.sqrt(empiricalVarianceZ);

  // 4. Histogram Bins (range [-3.6, +3.6] across 24 bins, width = 0.3)
  const minZ = -3.6;
  const maxZ = 3.6;
  const numBins = 24;
  const binWidth = (maxZ - minZ) / numBins;

  const binCounts = new Array(numBins).fill(0);
  for (let t = 0; t < trialCount; t++) {
    const z = zSamples[t];
    if (z >= minZ && z < maxZ) {
      const bIdx = Math.floor((z - minZ) / binWidth);
      if (bIdx >= 0 && bIdx < numBins) {
        binCounts[bIdx]++;
      }
    } else if (z < minZ) {
      binCounts[0]++; // underflow in leftmost bin
    } else {
      binCounts[numBins - 1]++; // overflow in rightmost bin
    }
  }

  let maxDensityError = 0;
  const bins: CltHistogramBin[] = [];

  for (let i = 0; i < numBins; i++) {
    const x0 = minZ + i * binWidth;
    const x1 = x0 + binWidth;
    const midpoint = (x0 + x1) / 2;
    const count = binCounts[i];
    const empiricalDensity = count / (trialCount * binWidth);
    const gaussianDensity = standardNormalPdf(midpoint);
    const err = Math.abs(empiricalDensity - gaussianDensity);
    if (err > maxDensityError) {
      maxDensityError = err;
    }

    bins.push({
      x0,
      x1,
      midpoint,
      count,
      empiricalDensity,
      gaussianDensity,
    });
  }

  return {
    calculation_id: 'CAL-CLT-001',
    status: 'valid',
    precision: 'empirical',
    value: {
      sampleSizeN,
      trialCount,
      seed,
      moments,
      empiricalMeanZ,
      empiricalVarianceZ,
      empiricalStdDevZ,
      bins,
      maxDensityError,
      samplesPreview: zSamples.slice(0, 10),
    },
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}
