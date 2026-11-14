/**
 * Deterministic Operations for Moments, Transformations, and Probability Inequalities
 * Conforms to A-004 v0.2 and A-003 v0.4 (CAL-TRANS-001, CAL-MOM-001, CAL-MOM-002, CAL-INEQ-001/002/003)
 */

import { CalculationResult } from './types';
import { CALCULATION_ENGINE_VERSION } from './events';
import { DeterministicPRNG } from './simulation';
import { evaluateContinuousCdf } from './continuous';

export type TransformationType = 'identity' | 'affine' | 'square';

export interface TransformationConfig {
  type: TransformationType;
  affineA?: number; // default 1
  affineB?: number; // default 0
}

export type SourceModelType =
  | 'bernoulli'
  | 'binomial'
  | 'geometric'
  | 'poisson'
  | 'uniform'
  | 'exponential'
  | 'gaussian';

export interface SourceModelConfig {
  type: SourceModelType;
  p?: number;
  n?: number;
  lambda?: number;
  a?: number;
  b?: number;
  mu?: number;
  sigma?: number;
}

export interface TheoreticalMoments {
  mean: number;
  variance: number;
  sd: number;
  eX2: number; // E[X^2]
  isNonNegative: boolean;
  supportDescription: string;
}

export interface TransformedMomentsResult {
  sourceMoments: TheoreticalMoments;
  transformedMoments: {
    mean: number;
    variance: number;
    sd: number;
    eY2: number;
  };
  transformationFormula: string;
  expectationFormula: string;
  varianceFormula: string;
}

export interface MarkovResult {
  thresholdA: number;
  isPreconditionSatisfied: boolean;
  preconditionMessage?: string;
  expectedValue: number;
  markovBound: number; // E[X] / a
  trueProbability: number;
  boundSatisfied: boolean; // trueProbability <= markovBound
}

export interface ChebyshevResult {
  thresholdA: number;
  kStandardDeviations: number; // a / sigma
  mean: number;
  variance: number;
  sd: number;
  chebyshevBound: number; // Var(X) / a^2
  trueProbability: number;
  boundSatisfied: boolean; // trueProbability <= chebyshevBound
}

export interface JensenResult {
  convexFunction: 'square' | 'exponential';
  convexFormula: string;
  phiOfExpectation: number; // phi(E[X])
  expectationOfPhi: number; // E[phi(X)]
  jensenGap: number; // E[phi(X)] - phi(E[X]) >= 0
  boundSatisfied: boolean;
}

export interface EmpiricalMomentsResult {
  runCount: number;
  seed: number;
  empiricalMeanX: number;
  empiricalVarX: number;
  empiricalMeanY: number;
  empiricalVarY: number;
  empiricalMarkovProb?: number;
  empiricalChebyshevProb?: number;
}

/**
 * Validates and computes source theoretical moments (CAL-MOM-001, CAL-MOM-002)
 */
export function getSourceMoments(
  config: SourceModelConfig
): CalculationResult<TheoreticalMoments> {
  switch (config.type) {
    case 'bernoulli': {
      const p = config.p ?? 0.5;
      if (p < 0 || p > 1 || !Number.isFinite(p)) {
        return {
          calculation_id: 'CAL-MOM-001',
          status: 'invalid_configuration',
          error_code: 'E-PARAM-DOMAIN',
          message: 'Bernoulli parameter p must be in [0, 1].',
          precision: 'exact',
          value: null,
          calculation_engine_version: CALCULATION_ENGINE_VERSION,
        };
      }
      const mean = p;
      const variance = p * (1 - p);
      return {
        calculation_id: 'CAL-MOM-001',
        status: 'valid',
        precision: 'exact',
        value: {
          mean,
          variance,
          sd: Math.sqrt(variance),
          eX2: p,
          isNonNegative: true,
          supportDescription: '{0, 1}',
        },
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
    }

    case 'binomial': {
      const n = config.n ?? 10;
      const p = config.p ?? 0.5;
      if (n < 0 || !Number.isInteger(n) || p < 0 || p > 1) {
        return {
          calculation_id: 'CAL-MOM-001',
          status: 'invalid_configuration',
          error_code: 'E-PARAM-DOMAIN',
          message: 'Binomial requires integer n >= 0 and p in [0, 1].',
          precision: 'exact',
          value: null,
          calculation_engine_version: CALCULATION_ENGINE_VERSION,
        };
      }
      const mean = n * p;
      const variance = n * p * (1 - p);
      const eX2 = variance + mean * mean;
      return {
        calculation_id: 'CAL-MOM-001',
        status: 'valid',
        precision: 'exact',
        value: {
          mean,
          variance,
          sd: Math.sqrt(variance),
          eX2,
          isNonNegative: true,
          supportDescription: `{0, 1, ..., ${n}}`,
        },
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
    }

    case 'geometric': {
      const p = config.p ?? 0.5;
      if (p <= 0 || p > 1) {
        return {
          calculation_id: 'CAL-MOM-001',
          status: 'invalid_configuration',
          error_code: 'E-PARAM-DOMAIN',
          message: 'Geometric parameter p must be in (0, 1].',
          precision: 'exact',
          value: null,
          calculation_engine_version: CALCULATION_ENGINE_VERSION,
        };
      }
      // Transcript convention: support {1, 2, ...}
      const mean = 1 / p;
      const variance = (1 - p) / (p * p);
      const eX2 = variance + mean * mean;
      return {
        calculation_id: 'CAL-MOM-001',
        status: 'valid',
        precision: 'exact',
        value: {
          mean,
          variance,
          sd: Math.sqrt(variance),
          eX2,
          isNonNegative: true,
          supportDescription: '{1, 2, ...}',
        },
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
    }

    case 'poisson': {
      const lambda = config.lambda ?? 1;
      if (lambda <= 0 || !Number.isFinite(lambda)) {
        return {
          calculation_id: 'CAL-MOM-001',
          status: 'invalid_configuration',
          error_code: 'E-PARAM-DOMAIN',
          message: 'Poisson rate lambda must be positive (lambda > 0).',
          precision: 'approximate',
          value: null,
          calculation_engine_version: CALCULATION_ENGINE_VERSION,
        };
      }
      const mean = lambda;
      const variance = lambda;
      const eX2 = variance + mean * mean;
      return {
        calculation_id: 'CAL-MOM-001',
        status: 'valid',
        precision: 'approximate',
        value: {
          mean,
          variance,
          sd: Math.sqrt(variance),
          eX2,
          isNonNegative: true,
          supportDescription: '{0, 1, 2, ...}',
        },
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
    }

    case 'uniform': {
      const a = config.a ?? 0;
      const b = config.b ?? 1;
      if (a >= b || !Number.isFinite(a) || !Number.isFinite(b)) {
        return {
          calculation_id: 'CAL-MOM-001',
          status: 'invalid_configuration',
          error_code: 'E-BOUNDS-ORDER',
          message: 'Uniform bounds require a < b.',
          precision: 'exact',
          value: null,
          calculation_engine_version: CALCULATION_ENGINE_VERSION,
        };
      }
      const mean = (a + b) / 2;
      const variance = Math.pow(b - a, 2) / 12;
      const eX2 = (a * a + a * b + b * b) / 3;
      return {
        calculation_id: 'CAL-MOM-001',
        status: 'valid',
        precision: 'exact',
        value: {
          mean,
          variance,
          sd: Math.sqrt(variance),
          eX2,
          isNonNegative: a >= 0,
          supportDescription: `[${a}, ${b}]`,
        },
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
    }

    case 'exponential': {
      const lambda = config.lambda ?? 1;
      if (lambda <= 0 || !Number.isFinite(lambda)) {
        return {
          calculation_id: 'CAL-MOM-001',
          status: 'invalid_configuration',
          error_code: 'E-PARAM-DOMAIN',
          message: 'Exponential parameter lambda must be positive.',
          precision: 'exact',
          value: null,
          calculation_engine_version: CALCULATION_ENGINE_VERSION,
        };
      }
      const mean = 1 / lambda;
      const variance = 1 / (lambda * lambda);
      const eX2 = 2 / (lambda * lambda);
      return {
        calculation_id: 'CAL-MOM-001',
        status: 'valid',
        precision: 'exact',
        value: {
          mean,
          variance,
          sd: Math.sqrt(variance),
          eX2,
          isNonNegative: true,
          supportDescription: '[0, ∞)',
        },
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
    }

    case 'gaussian': {
      const mu = config.mu ?? 0;
      const sigma = config.sigma ?? 1;
      if (sigma <= 0 || !Number.isFinite(sigma)) {
        return {
          calculation_id: 'CAL-MOM-001',
          status: 'invalid_configuration',
          error_code: 'E-PARAM-DOMAIN',
          message: 'Gaussian standard deviation sigma must be positive.',
          precision: 'exact',
          value: null,
          calculation_engine_version: CALCULATION_ENGINE_VERSION,
        };
      }
      const mean = mu;
      const variance = sigma * sigma;
      const eX2 = mu * mu + variance;
      return {
        calculation_id: 'CAL-MOM-001',
        status: 'valid',
        precision: 'exact',
        value: {
          mean,
          variance,
          sd: sigma,
          eX2,
          isNonNegative: false,
          supportDescription: '(-∞, ∞)',
        },
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
    }

    default:
      return {
        calculation_id: 'CAL-MOM-001',
        status: 'unsupported',
        error_code: 'E-UNSUPPORTED-MODEL',
        message: 'Unsupported distribution model.',
        precision: 'exact',
        value: null,
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
  }
}

/**
 * Calculates transformed moments for Y = g(X) (CAL-TRANS-001, CAL-MOM-001, CAL-MOM-002)
 */
export function calculateTransformedMoments(
  sourceConfig: SourceModelConfig,
  transform: TransformationConfig
): CalculationResult<TransformedMomentsResult> {
  const sourceRes = getSourceMoments(sourceConfig);
  if (sourceRes.status !== 'valid' || !sourceRes.value) {
    return {
      calculation_id: 'CAL-TRANS-001',
      status: sourceRes.status,
      error_code: sourceRes.error_code,
      message: sourceRes.message,
      precision: sourceRes.precision,
      value: null,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const src = sourceRes.value;
  let meanY = 0;
  let varY = 0;
  let eY2 = 0;
  let formula = 'Y = X';
  let expFormula = 'E[Y] = E[X]';
  let varFormula = 'Var(Y) = Var(X)';

  if (transform.type === 'identity') {
    meanY = src.mean;
    varY = src.variance;
    eY2 = src.eX2;
    formula = 'Y = X';
    expFormula = 'E[Y] = E[X]';
    varFormula = 'Var(Y) = Var(X)';
  } else if (transform.type === 'affine') {
    const a = transform.affineA ?? 1;
    const b = transform.affineB ?? 0;
    meanY = a * src.mean + b;
    varY = a * a * src.variance;
    eY2 = varY + meanY * meanY;
    formula = `Y = ${a === 1 ? '' : a === -1 ? '-' : a}X ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}`;
    expFormula = `E[Y] = ${a}E[X] + ${b}`;
    varFormula = `Var(Y) = (${a})^2 Var(X) = ${a * a} Var(X)`;
  } else if (transform.type === 'square') {
    formula = 'Y = X^2';
    meanY = src.eX2; // E[Y] = E[X^2]
    expFormula = 'E[Y] = E[X^2] = Var(X) + (E[X])^2';

    // Compute Var(Y) = E[Y^2] - (E[Y])^2 = E[X^4] - (E[X^2])^2
    let eX4 = 0;
    switch (sourceConfig.type) {
      case 'bernoulli': {
        // For Bernoulli, X^4 = X^2 = X, so E[X^4] = E[X] = p
        eX4 = src.mean;
        varY = eX4 - meanY * meanY;
        eY2 = eX4;
        break;
      }
      case 'uniform': {
        const a = sourceConfig.a ?? 0;
        const b = sourceConfig.b ?? 1;
        // E[X^4] = (b^5 - a^5) / (5*(b - a))
        eX4 = (Math.pow(b, 5) - Math.pow(a, 5)) / (5 * (b - a));
        varY = Math.max(0, eX4 - meanY * meanY);
        eY2 = eX4;
        break;
      }
      case 'exponential': {
        const lambda = sourceConfig.lambda ?? 1;
        // E[X^4] = 4! / lambda^4 = 24 / lambda^4
        eX4 = 24 / Math.pow(lambda, 4);
        varY = 20 / Math.pow(lambda, 4);
        eY2 = eX4;
        break;
      }
      case 'gaussian': {
        const mu = sourceConfig.mu ?? 0;
        const s = sourceConfig.sigma ?? 1;
        // E[X^4] = mu^4 + 6*mu^2*s^2 + 3*s^4
        eX4 = Math.pow(mu, 4) + 6 * mu * mu * s * s + 3 * Math.pow(s, 4);
        varY = 2 * Math.pow(s, 4) + 4 * mu * mu * s * s;
        eY2 = eX4;
        break;
      }
      case 'binomial': {
        // Compute discrete sum for E[X^4]
        const n = sourceConfig.n ?? 10;
        const p = sourceConfig.p ?? 0.5;
        let sumX4 = 0;
        for (let k = 0; k <= n; k++) {
          const prob = computeBinomialPmf(n, p, k);
          sumX4 += Math.pow(k, 4) * prob;
        }
        eX4 = sumX4;
        varY = Math.max(0, eX4 - meanY * meanY);
        eY2 = eX4;
        break;
      }
      case 'geometric': {
        const p = sourceConfig.p ?? 0.5;
        // Truncate sum at tail with probability < 1e-9
        let sumX4 = 0;
        const kMax = Math.min(200, Math.ceil(Math.log(1e-9) / Math.log(1 - p)));
        for (let k = 1; k <= kMax; k++) {
          const prob = computeGeometricPmf(p, k);
          sumX4 += Math.pow(k, 4) * prob;
        }
        eX4 = sumX4;
        varY = Math.max(0, eX4 - meanY * meanY);
        eY2 = eX4;
        break;
      }
      case 'poisson': {
        const lambda = sourceConfig.lambda ?? 1;
        // E[X^4] for Poisson: lambda^4 + 6 lambda^3 + 7 lambda^2 + lambda
        eX4 =
          Math.pow(lambda, 4) +
          6 * Math.pow(lambda, 3) +
          7 * Math.pow(lambda, 2) +
          lambda;
        varY = Math.max(0, eX4 - meanY * meanY);
        eY2 = eX4;
        break;
      }
    }
    varFormula = 'Var(Y) = E[X^4] - (E[X^2])^2';
  }

  return {
    calculation_id: 'CAL-TRANS-001',
    status: 'valid',
    precision: sourceRes.precision,
    value: {
      sourceMoments: src,
      transformedMoments: {
        mean: meanY,
        variance: varY,
        sd: Math.sqrt(varY),
        eY2,
      },
      transformationFormula: formula,
      expectationFormula: expFormula,
      varianceFormula: varFormula,
    },
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

/**
 * Calculates Markov's inequality: P(X >= a) <= E[X] / a (CAL-INEQ-001)
 * Precondition: X >= 0 and a > 0.
 */
export function calculateMarkovBound(
  sourceConfig: SourceModelConfig,
  thresholdA: number
): CalculationResult<MarkovResult> {
  if (thresholdA <= 0 || !Number.isFinite(thresholdA)) {
    return {
      calculation_id: 'CAL-INEQ-001',
      status: 'invalid_configuration',
      error_code: 'E-PARAM-DOMAIN',
      message: 'Markov threshold a must be strictly positive (a > 0).',
      precision: 'approximate',
      value: null,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const momentsRes = getSourceMoments(sourceConfig);
  if (momentsRes.status !== 'valid' || !momentsRes.value) {
    return {
      calculation_id: 'CAL-INEQ-001',
      status: momentsRes.status,
      error_code: momentsRes.error_code,
      message: momentsRes.message,
      precision: 'approximate',
      value: null,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const src = momentsRes.value;
  if (!src.isNonNegative) {
    return {
      calculation_id: 'CAL-INEQ-001',
      status: 'invalid_configuration',
      error_code: 'E-PARAM-DOMAIN',
      message:
        'Markov inequality requires a non-negative random variable (X >= 0). The selected distribution allows negative values.',
      precision: 'approximate',
      value: null,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const markovBound = Math.min(1, src.mean / thresholdA);
  const trueProb = calculateTrueTailProbability(sourceConfig, thresholdA);

  return {
    calculation_id: 'CAL-INEQ-001',
    status: 'valid',
    precision: momentsRes.precision,
    value: {
      thresholdA,
      isPreconditionSatisfied: true,
      expectedValue: src.mean,
      markovBound,
      trueProbability: trueProb,
      boundSatisfied: trueProb <= markovBound + 1e-7,
    },
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

/**
 * Calculates Chebyshev's inequality: P(|X - mu| >= a) <= Var(X) / a^2 (CAL-INEQ-002)
 * Precondition: a > 0.
 */
export function calculateChebyshevBound(
  sourceConfig: SourceModelConfig,
  thresholdA: number
): CalculationResult<ChebyshevResult> {
  if (thresholdA <= 0 || !Number.isFinite(thresholdA)) {
    return {
      calculation_id: 'CAL-INEQ-002',
      status: 'invalid_configuration',
      error_code: 'E-PARAM-DOMAIN',
      message: 'Chebyshev threshold a must be strictly positive (a > 0).',
      precision: 'approximate',
      value: null,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const momentsRes = getSourceMoments(sourceConfig);
  if (momentsRes.status !== 'valid' || !momentsRes.value) {
    return {
      calculation_id: 'CAL-INEQ-002',
      status: momentsRes.status,
      error_code: momentsRes.error_code,
      message: momentsRes.message,
      precision: 'approximate',
      value: null,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const src = momentsRes.value;
  const chebyshevBound = Math.min(1, src.variance / (thresholdA * thresholdA));
  const kStd = thresholdA / src.sd;

  // True probability P(|X - mu| >= a) = P(X <= mu - a) + P(X >= mu + a)
  const lowerVal = src.mean - thresholdA;
  const upperVal = src.mean + thresholdA;
  const cdfLower = calculateTrueCdf(sourceConfig, lowerVal);
  const cdfUpper = calculateTrueCdf(sourceConfig, upperVal - 1e-9);
  const trueProb = Math.max(0, Math.min(1, cdfLower + (1 - cdfUpper)));

  return {
    calculation_id: 'CAL-INEQ-002',
    status: 'valid',
    precision: momentsRes.precision,
    value: {
      thresholdA,
      kStandardDeviations: kStd,
      mean: src.mean,
      variance: src.variance,
      sd: src.sd,
      chebyshevBound,
      trueProbability: trueProb,
      boundSatisfied: trueProb <= chebyshevBound + 1e-7,
    },
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

/**
 * Calculates Jensen's inequality for convex function phi: phi(E[X]) <= E[phi(X)] (CAL-INEQ-003)
 */
export function calculateJensenBound(
  sourceConfig: SourceModelConfig,
  convexFunc: 'square' | 'exponential'
): CalculationResult<JensenResult> {
  const momentsRes = getSourceMoments(sourceConfig);
  if (momentsRes.status !== 'valid' || !momentsRes.value) {
    return {
      calculation_id: 'CAL-INEQ-003',
      status: momentsRes.status,
      error_code: momentsRes.error_code,
      message: momentsRes.message,
      precision: 'approximate',
      value: null,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const src = momentsRes.value;

  if (convexFunc === 'square') {
    const phiOfExp = src.mean * src.mean;
    const expOfPhi = src.eX2; // E[X^2]
    const gap = expOfPhi - phiOfExp; // equals Var(X) >= 0

    return {
      calculation_id: 'CAL-INEQ-003',
      status: 'valid',
      precision: momentsRes.precision,
      value: {
        convexFunction: 'square',
        convexFormula: 'φ(t) = t^2',
        phiOfExpectation: phiOfExp,
        expectationOfPhi: expOfPhi,
        jensenGap: gap,
        boundSatisfied: gap >= -1e-9,
      },
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  } else {
    // phi(t) = e^t
    const phiOfExp = Math.exp(src.mean);
    let expOfPhi = 0;

    switch (sourceConfig.type) {
      case 'bernoulli': {
        const p = sourceConfig.p ?? 0.5;
        expOfPhi = 1 - p + p * Math.E;
        break;
      }
      case 'gaussian': {
        const mu = sourceConfig.mu ?? 0;
        const s = sourceConfig.sigma ?? 1;
        expOfPhi = Math.exp(mu + (s * s) / 2);
        break;
      }
      case 'uniform': {
        const a = sourceConfig.a ?? 0;
        const b = sourceConfig.b ?? 1;
        expOfPhi = (Math.exp(b) - Math.exp(a)) / (b - a);
        break;
      }
      case 'exponential': {
        const lambda = sourceConfig.lambda ?? 1;
        if (lambda <= 1) {
          return {
            calculation_id: 'CAL-INEQ-003',
            status: 'invalid_configuration',
            error_code: 'E-PARAM-DOMAIN',
            message: 'MGF of Exponential(lambda) at t=1 requires lambda > 1 to be finite.',
            precision: 'approximate',
            value: null,
            calculation_engine_version: CALCULATION_ENGINE_VERSION,
          };
        }
        expOfPhi = lambda / (lambda - 1);
        break;
      }
      case 'poisson': {
        const lambda = sourceConfig.lambda ?? 1;
        expOfPhi = Math.exp(lambda * (Math.E - 1));
        break;
      }
      default: {
        // General discrete approximation for binomial/geometric
        const phiOfExpApprox = Math.exp(src.mean);
        expOfPhi = phiOfExpApprox * Math.exp(src.variance / 2); // Taylor 2nd order approximation
        break;
      }
    }

    const gap = expOfPhi - phiOfExp;

    return {
      calculation_id: 'CAL-INEQ-003',
      status: 'valid',
      precision: 'approximate',
      value: {
        convexFunction: 'exponential',
        convexFormula: 'φ(t) = e^t',
        phiOfExpectation: phiOfExp,
        expectationOfPhi: expOfPhi,
        jensenGap: gap,
        boundSatisfied: gap >= -1e-7,
      },
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }
}

/**
 * Simulates random samples and computes empirical moments, transforms, and tail counts
 */
export function simulateMoments(
  sourceConfig: SourceModelConfig,
  transform: TransformationConfig,
  runCount: number,
  seed: number,
  thresholdMarkov?: number,
  thresholdChebyshev?: number
): EmpiricalMomentsResult {
  const prng = new DeterministicPRNG(seed);
  const momentsRes = getSourceMoments(sourceConfig);
  const mu = momentsRes.value?.mean ?? 0;

  let sumX = 0;
  let sumX2 = 0;
  let sumY = 0;
  let sumY2 = 0;
  let countMarkov = 0;
  let countChebyshev = 0;

  const a = transform.affineA ?? 1;
  const b = transform.affineB ?? 0;

  for (let i = 0; i < runCount; i++) {
    const x = sampleFromSource(sourceConfig, prng);
    let y = x;
    if (transform.type === 'affine') {
      y = a * x + b;
    } else if (transform.type === 'square') {
      y = x * x;
    }

    sumX += x;
    sumX2 += x * x;
    sumY += y;
    sumY2 += y * y;

    if (thresholdMarkov !== undefined && x >= thresholdMarkov) {
      countMarkov++;
    }
    if (thresholdChebyshev !== undefined && Math.abs(x - mu) >= thresholdChebyshev) {
      countChebyshev++;
    }
  }

  const meanX = sumX / runCount;
  const varX = Math.max(0, sumX2 / runCount - meanX * meanX);
  const meanY = sumY / runCount;
  const varY = Math.max(0, sumY2 / runCount - meanY * meanY);

  return {
    runCount,
    seed,
    empiricalMeanX: meanX,
    empiricalVarX: varX,
    empiricalMeanY: meanY,
    empiricalVarY: varY,
    empiricalMarkovProb: thresholdMarkov !== undefined ? countMarkov / runCount : undefined,
    empiricalChebyshevProb: thresholdChebyshev !== undefined ? countChebyshev / runCount : undefined,
  };
}

/**
 * Internal helper to draw a single sample from a source distribution
 */
function sampleFromSource(config: SourceModelConfig, prng: DeterministicPRNG): number {
  switch (config.type) {
    case 'bernoulli': {
      const p = config.p ?? 0.5;
      return prng.next() < p ? 1 : 0;
    }
    case 'binomial': {
      const n = config.n ?? 10;
      const p = config.p ?? 0.5;
      let count = 0;
      for (let i = 0; i < n; i++) {
        if (prng.next() < p) count++;
      }
      return count;
    }
    case 'geometric': {
      const p = config.p ?? 0.5;
      const u = Math.max(1e-12, prng.next());
      return Math.floor(Math.log(u) / Math.log(1 - p)) + 1;
    }
    case 'poisson': {
      const lambda = config.lambda ?? 1;
      const L = Math.exp(-lambda);
      let k = 0;
      let p = 1;
      do {
        k++;
        p *= prng.next();
      } while (p > L && k < 1000);
      return k - 1;
    }
    case 'uniform': {
      const a = config.a ?? 0;
      const b = config.b ?? 1;
      return a + prng.next() * (b - a);
    }
    case 'exponential': {
      const lambda = config.lambda ?? 1;
      const u = Math.max(1e-12, prng.next());
      return -Math.log(u) / lambda;
    }
    case 'gaussian': {
      const mu = config.mu ?? 0;
      const sigma = config.sigma ?? 1;
      // Box-Muller transform
      const u1 = Math.max(1e-12, prng.next());
      const u2 = prng.next();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      return mu + z0 * sigma;
    }
    default:
      return 0;
  }
}

/**
 * Discrete PMF calculation helpers for moments and tail sums
 */
function computeBinomialPmf(n: number, p: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let coeff = 1;
  const kEff = Math.min(k, n - k);
  for (let i = 1; i <= kEff; i++) {
    coeff = (coeff * (n - i + 1)) / i;
  }
  return coeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function computeGeometricPmf(p: number, k: number): number {
  if (k < 1) return 0;
  return Math.pow(1 - p, k - 1) * p;
}

function computePoissonPmf(lambda: number, k: number): number {
  if (k < 0) return 0;
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 1; i <= k; i++) {
    logP -= Math.log(i);
  }
  return Math.exp(logP);
}

/**
 * Internal helper to compute true tail probability P(X >= a)
 */
function calculateTrueTailProbability(config: SourceModelConfig, thresholdA: number): number {
  switch (config.type) {
    case 'bernoulli': {
      const p = config.p ?? 0.5;
      if (thresholdA <= 0) return 1;
      if (thresholdA <= 1) return p;
      return 0;
    }
    case 'binomial': {
      const n = config.n ?? 10;
      const p = config.p ?? 0.5;
      let prob = 0;
      const start = Math.max(0, Math.ceil(thresholdA));
      for (let k = start; k <= n; k++) {
        prob += computeBinomialPmf(n, p, k);
      }
      return Math.min(1, Math.max(0, prob));
    }
    case 'geometric': {
      const p = config.p ?? 0.5;
      if (thresholdA <= 1) return 1;
      const k = Math.ceil(thresholdA);
      return Math.pow(1 - p, k - 1);
    }
    case 'poisson': {
      const lambda = config.lambda ?? 1;
      let cdf = 0;
      const end = Math.floor(thresholdA - 1e-9);
      for (let k = 0; k <= Math.min(100, end); k++) {
        cdf += computePoissonPmf(lambda, k);
      }
      return Math.max(0, 1 - cdf);
    }
    case 'exponential': {
      const lambda = config.lambda ?? 1;
      if (thresholdA <= 0) return 1;
      return Math.exp(-lambda * thresholdA);
    }
    case 'uniform': {
      const a = config.a ?? 0;
      const b = config.b ?? 1;
      if (thresholdA <= a) return 1;
      if (thresholdA >= b) return 0;
      return (b - thresholdA) / (b - a);
    }
    default:
      return 0;
  }
}

/**
 * Internal helper to compute true CDF F(x) = P(X <= x)
 */
function calculateTrueCdf(config: SourceModelConfig, x: number): number {
  switch (config.type) {
    case 'bernoulli': {
      const p = config.p ?? 0.5;
      if (x < 0) return 0;
      if (x < 1) return 1 - p;
      return 1;
    }
    case 'binomial': {
      const n = config.n ?? 10;
      const p = config.p ?? 0.5;
      if (x < 0) return 0;
      if (x >= n) return 1;
      let sum = 0;
      for (let k = 0; k <= Math.floor(x); k++) {
        sum += computeBinomialPmf(n, p, k);
      }
      return Math.min(1, sum);
    }
    case 'geometric': {
      const p = config.p ?? 0.5;
      if (x < 1) return 0;
      const k = Math.floor(x);
      return 1 - Math.pow(1 - p, k);
    }
    case 'poisson': {
      const lambda = config.lambda ?? 1;
      if (x < 0) return 0;
      let sum = 0;
      for (let k = 0; k <= Math.floor(x); k++) {
        sum += computePoissonPmf(lambda, k);
      }
      return Math.min(1, sum);
    }
    case 'uniform': {
      const a = config.a ?? 0;
      const b = config.b ?? 1;
      if (x <= a) return 0;
      if (x >= b) return 1;
      return (x - a) / (b - a);
    }
    case 'exponential': {
      const lambda = config.lambda ?? 1;
      if (x <= 0) return 0;
      return 1 - Math.exp(-lambda * x);
    }
    case 'gaussian': {
      const mu = config.mu ?? 0;
      const sigma = config.sigma ?? 1;
      return evaluateContinuousCdf({ type: 'gaussian', mu, sigma }, x);
    }
    default:
      return 0;
  }
}
