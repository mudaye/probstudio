/**
 * Probability Revision Studio - Multivariate, Conditioning & Transformations Engine
 *
 * Implements deterministic operations for Part 3 advanced modules:
 * - CAL-COND-DIST-001: Continuous conditional density and probability queries.
 * - CAL-COMM-001: Binary communication signaling channel under additive noise & mixture densities.
 * - CAL-COMM-002: Deterministic bitstream simulation through noisy channel.
 * - CAL-JACOBIAN-001: 2D linear transformation and Jacobian determinant calculations.
 *
 * Source Grounding: Review of Basic Probability 3 (Chapters 6, 7, 9, 10)
 */

import { CalculationResult } from './types';
import { DeterministicPRNG } from './simulation';
import { standardNormalCdf } from './continuous';

export const MULTIVARIATE_ENGINE_VERSION = '0.1.0';

export interface TriangularConditionalResult {
  givenAxis: 'X' | 'Y';
  givenValue: number;
  marginalDensityAtGiven: number;
  conditionalSupport: [number, number];
  conditionalDensityValue: number; // constant uniform density over support
  queryCutoff: number;
  queryDirection: 'greater' | 'less';
  theoreticalProbability: number;
  formulaLatex: string;
}

export interface CommunicationChannelConfig {
  bit0Voltage: number; // e.g. 0
  bit1Voltage: number; // e.g. 5
  priorBit1: number; // P(X = 1), default 0.5
  noiseType: 'gaussian' | 'uniform';
  noiseParam: number; // standard deviation sigma > 0 for Gaussian, half-width w > 0 for Uniform
  threshold: number; // decision boundary tau, e.g. 2.5
}

export interface CommunicationChannelResult {
  config: CommunicationChannelConfig;
  theoreticalFalseAlarm: number; // P(Y > tau | X = 0)
  theoreticalMiss: number; // P(Y <= tau | X = 1)
  theoreticalDetection: number; // P(Y > tau | X = 1) = 1 - P_Miss
  theoreticalBitErrorRate: number; // (1 - p1)*P_FA + p1*P_Miss
  optimalThreshold: number; // midpoint under equal priors
  mixtureDensityAtThreshold: number;
}

export interface ChannelSimulationResult {
  sampleCount: number;
  seed: number;
  empiricalBitErrorRate: number;
  empiricalFalseAlarm: number;
  empiricalMiss: number;
  empiricalDetection: number;
  transmittedBits: number[]; // sample preview
  receivedVoltages: number[]; // sample preview
  decisions: number[]; // sample preview
}

export interface JacobianTransformResult {
  matrixA: [[number, number], [number, number]];
  determinantA: number;
  inverseMatrix: [[number, number], [number, number]];
  jacobianDeterminant: number; // det(A^-1)
  absJacobianDeterminant: number; // |det(J)|
  areaScalingFactor: number; // |det(A)|
  transformedUnitSquareVertices: Array<[number, number]>;
}

/**
 * Normalizes standard normal CDF approximation error function
 */
function normalCdf(x: number, mean: number, sigma: number): number {
  if (sigma <= 0) return x >= mean ? 1 : 0;
  return standardNormalCdf((x - mean) / sigma);
}

/**
 * CAL-COND-DIST-001: Evaluates conditional density and probability in triangular model f(x, y) = 2 on 0 < x < y < 1.
 * Given X = x0 (0 < x0 < 1), Y | X=x0 is Uniform(x0, 1).
 * Given Y = y0 (0 < y0 < 1), X | Y=y0 is Uniform(0, y0).
 */
export function calculateTriangularConditionalDensity(
  givenAxis: 'X' | 'Y',
  givenValue: number,
  queryCutoff: number,
  queryDirection: 'greater' | 'less' = 'greater'
): CalculationResult<TriangularConditionalResult> {
  // Validate domain (conditioning event must have non-zero marginal density)
  if (givenValue <= 0 || givenValue >= 1 || !Number.isFinite(givenValue)) {
    return {
      status: 'undefined',
      calculation_id: 'CAL-COND-DIST-001',
      calculation_engine_version: MULTIVARIATE_ENGINE_VERSION,
      precision: 'exact',
      value: null,
      error_code: 'E-COND-ZERO',
      message: `Conditioning on ${givenAxis} = ${givenValue} has zero marginal density outside (0, 1).`,
    };
  }

  let marginalDensity: number;
  let support: [number, number];
  let condDensity: number;
  let prob: number;
  let formulaLatex: string;

  if (givenAxis === 'X') {
    // f_X(x0) = 2(1 - x0)
    marginalDensity = 2 * (1 - givenValue);
    support = [givenValue, 1];
    const span = 1 - givenValue;
    condDensity = 1 / span; // Uniform(x0, 1)

    if (queryDirection === 'greater') {
      if (queryCutoff <= givenValue) {
        prob = 1;
      } else if (queryCutoff >= 1) {
        prob = 0;
      } else {
        prob = (1 - queryCutoff) / span;
      }
      formulaLatex = `f_{Y|X}(y|${givenValue.toFixed(2)}) = \\frac{2}{2(1 - ${givenValue.toFixed(2)})} = \\frac{1}{${span.toFixed(2)}} \\implies P(Y > ${queryCutoff.toFixed(2)} \\mid X = ${givenValue.toFixed(2)}) = ${prob.toFixed(4)}`;
    } else {
      if (queryCutoff <= givenValue) {
        prob = 0;
      } else if (queryCutoff >= 1) {
        prob = 1;
      } else {
        prob = (queryCutoff - givenValue) / span;
      }
      formulaLatex = `f_{Y|X}(y|${givenValue.toFixed(2)}) = \\frac{1}{${span.toFixed(2)}} \\implies P(Y \\le ${queryCutoff.toFixed(2)} \\mid X = ${givenValue.toFixed(2)}) = ${prob.toFixed(4)}`;
    }
  } else {
    // Given Y = y0. f_Y(y0) = 2*y0. X | Y=y0 is Uniform(0, y0).
    marginalDensity = 2 * givenValue;
    support = [0, givenValue];
    const span = givenValue;
    condDensity = 1 / span; // Uniform(0, y0)

    if (queryDirection === 'greater') {
      if (queryCutoff <= 0) {
        prob = 1;
      } else if (queryCutoff >= givenValue) {
        prob = 0;
      } else {
        prob = (givenValue - queryCutoff) / span;
      }
      formulaLatex = `f_{X|Y}(x|${givenValue.toFixed(2)}) = \\frac{2}{2(${givenValue.toFixed(2)})} = \\frac{1}{${span.toFixed(2)}} \\implies P(X > ${queryCutoff.toFixed(2)} \\mid Y = ${givenValue.toFixed(2)}) = ${prob.toFixed(4)}`;
    } else {
      if (queryCutoff <= 0) {
        prob = 0;
      } else if (queryCutoff >= givenValue) {
        prob = 1;
      } else {
        prob = queryCutoff / span;
      }
      formulaLatex = `f_{X|Y}(x|${givenValue.toFixed(2)}) = \\frac{1}{${span.toFixed(2)}} \\implies P(X \\le ${queryCutoff.toFixed(2)} \\mid Y = ${givenValue.toFixed(2)}) = ${prob.toFixed(4)}`;
    }
  }

  return {
    status: 'valid',
    calculation_id: 'CAL-COND-DIST-001',
    calculation_engine_version: MULTIVARIATE_ENGINE_VERSION,
    precision: 'exact',
    value: {
      givenAxis,
      givenValue,
      marginalDensityAtGiven: marginalDensity,
      conditionalSupport: support,
      conditionalDensityValue: condDensity,
      queryCutoff,
      queryDirection,
      theoreticalProbability: prob,
      formulaLatex,
    },
  };
}

/**
 * CAL-COMM-001: Evaluates theoretical error rates and mixture densities for binary signaling.
 */
export function calculateCommunicationChannel(
  config: CommunicationChannelConfig
): CalculationResult<CommunicationChannelResult> {
  const { bit0Voltage, bit1Voltage, priorBit1, noiseType, noiseParam, threshold } = config;

  if (priorBit1 < 0 || priorBit1 > 1 || !Number.isFinite(priorBit1)) {
    return {
      status: 'invalid_configuration',
      calculation_id: 'CAL-COMM-001',
      calculation_engine_version: MULTIVARIATE_ENGINE_VERSION,
      precision: 'exact',
      value: null,
      error_code: 'E-PROB-RANGE',
      message: 'Prior probability must be between 0 and 1.',
    };
  }

  if (noiseParam <= 0 || !Number.isFinite(noiseParam)) {
    return {
      status: 'invalid_configuration',
      calculation_id: 'CAL-COMM-001',
      calculation_engine_version: MULTIVARIATE_ENGINE_VERSION,
      precision: 'exact',
      value: null,
      error_code: 'E-PARAM-DOMAIN',
      message: 'Noise parameter (sigma or half-width) must be strictly positive.',
    };
  }

  let pFA = 0;
  let pMiss = 0;
  let mixAtThreshold = 0;

  if (noiseType === 'gaussian') {
    const sigma = noiseParam;
    // P_FA = P(Y > tau | X = 0) = 1 - Phi((tau - v0)/sigma)
    pFA = 1 - normalCdf(threshold, bit0Voltage, sigma);
    // P_Miss = P(Y <= tau | X = 1) = Phi((tau - v1)/sigma)
    pMiss = normalCdf(threshold, bit1Voltage, sigma);

    // Mixture density f_Y(tau)
    const f0 = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(threshold - bit0Voltage, 2) / (2 * sigma * sigma));
    const f1 = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(threshold - bit1Voltage, 2) / (2 * sigma * sigma));
    mixAtThreshold = (1 - priorBit1) * f0 + priorBit1 * f1;
  } else {
    // Uniform noise in [-w, w]
    const w = noiseParam;
    // Y | X = 0 in [v0 - w, v0 + w]
    if (threshold >= bit0Voltage + w) {
      pFA = 0;
    } else if (threshold <= bit0Voltage - w) {
      pFA = 1;
    } else {
      pFA = (bit0Voltage + w - threshold) / (2 * w);
    }

    // Y | X = 1 in [v1 - w, v1 + w]
    if (threshold >= bit1Voltage + w) {
      pMiss = 1;
    } else if (threshold <= bit1Voltage - w) {
      pMiss = 0;
    } else {
      pMiss = (threshold - (bit1Voltage - w)) / (2 * w);
    }

    const f0 = Math.abs(threshold - bit0Voltage) <= w ? 1 / (2 * w) : 0;
    const f1 = Math.abs(threshold - bit1Voltage) <= w ? 1 / (2 * w) : 0;
    mixAtThreshold = (1 - priorBit1) * f0 + priorBit1 * f1;
  }

  const pDet = 1 - pMiss;
  const ber = (1 - priorBit1) * pFA + priorBit1 * pMiss;
  const optimalThreshold = (bit0Voltage + bit1Voltage) / 2;

  return {
    status: 'valid',
    calculation_id: 'CAL-COMM-001',
    calculation_engine_version: MULTIVARIATE_ENGINE_VERSION,
    precision: 'approximate',
    value: {
      config,
      theoreticalFalseAlarm: pFA,
      theoreticalMiss: pMiss,
      theoreticalDetection: pDet,
      theoreticalBitErrorRate: ber,
      optimalThreshold,
      mixtureDensityAtThreshold: mixAtThreshold,
    },
  };
}

/**
 * CAL-COMM-002: Deterministic PRNG simulation of bitstream transmission through noisy channel.
 */
export function simulateCommunicationChannel(
  config: CommunicationChannelConfig,
  sampleCount: number = 2000,
  seed: number = 42
): CalculationResult<ChannelSimulationResult> {
  const prng = new DeterministicPRNG(seed);
  const transmittedBits: number[] = [];
  const receivedVoltages: number[] = [];
  const decisions: number[] = [];

  let bitErrors = 0;
  let falseAlarms = 0;
  let zerosTransmitted = 0;
  let misses = 0;
  let onesTransmitted = 0;

  for (let i = 0; i < sampleCount; i++) {
    // Sample bit
    const uBit = prng.next();
    const bit = uBit < (1 - config.priorBit1) ? 0 : 1;
    const voltage = bit === 0 ? config.bit0Voltage : config.bit1Voltage;

    // Sample noise
    let noise = 0;
    if (config.noiseType === 'gaussian') {
      // Box-Muller transform
      const u1 = Math.max(1e-12, prng.next());
      const u2 = prng.next();
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      noise = z0 * config.noiseParam;
    } else {
      // Uniform(-w, w)
      noise = (prng.next() * 2 - 1) * config.noiseParam;
    }

    const received = voltage + noise;
    const decision = received > config.threshold ? 1 : 0;

    if (bit === 0) {
      zerosTransmitted++;
      if (decision === 1) {
        falseAlarms++;
        bitErrors++;
      }
    } else {
      onesTransmitted++;
      if (decision === 0) {
        misses++;
        bitErrors++;
      }
    }

    if (i < 50) {
      transmittedBits.push(bit);
      receivedVoltages.push(received);
      decisions.push(decision);
    }
  }

  const empiricalBER = bitErrors / sampleCount;
  const empiricalFA = zerosTransmitted > 0 ? falseAlarms / zerosTransmitted : 0;
  const empiricalMiss = onesTransmitted > 0 ? misses / onesTransmitted : 0;
  const empiricalDet = 1 - empiricalMiss;

  return {
    status: 'valid',
    calculation_id: 'CAL-COMM-002',
    calculation_engine_version: MULTIVARIATE_ENGINE_VERSION,
    precision: 'empirical',
    value: {
      sampleCount,
      seed,
      empiricalBitErrorRate: empiricalBER,
      empiricalFalseAlarm: empiricalFA,
      empiricalMiss: empiricalMiss,
      empiricalDetection: empiricalDet,
      transmittedBits,
      receivedVoltages,
      decisions,
    },
  };
}

/**
 * CAL-JACOBIAN-001: Evaluates 2D linear transformation matrix and Jacobian determinant.
 * [Y1; Y2] = A * [X1; X2]
 * [X1; X2] = A^-1 * [Y1; Y2]
 * J = A^-1, det(J) = 1 / det(A)
 */
export function calculateJacobianLinearTransform(
  a11: number,
  a12: number,
  a21: number,
  a22: number
): CalculationResult<JacobianTransformResult> {
  const detA = a11 * a22 - a12 * a21;

  if (Math.abs(detA) < 1e-12 || !Number.isFinite(detA)) {
    return {
      status: 'invalid_configuration',
      calculation_id: 'CAL-JACOBIAN-001',
      calculation_engine_version: MULTIVARIATE_ENGINE_VERSION,
      precision: 'exact',
      value: null,
      error_code: 'E-NONFINITE-INPUT',
      message: 'Transformation matrix is singular (determinant is 0). Non-invertible transform.',
    };
  }

  // Inverse matrix A^-1
  const inv11 = a22 / detA;
  const inv12 = -a12 / detA;
  const inv21 = -a21 / detA;
  const inv22 = a11 / detA;

  const jacobianDet = 1 / detA;
  const absJacobianDet = Math.abs(jacobianDet);
  const areaScaling = Math.abs(detA);

  // Unit square in X space: (0,0), (1,0), (1,1), (0,1)
  // Transformed vertices in Y space: A * [x; y]
  const v00: [number, number] = [0, 0];
  const v10: [number, number] = [a11, a21];
  const v11: [number, number] = [a11 + a12, a21 + a22];
  const v01: [number, number] = [a12, a22];

  return {
    status: 'valid',
    calculation_id: 'CAL-JACOBIAN-001',
    calculation_engine_version: MULTIVARIATE_ENGINE_VERSION,
    precision: 'exact',
    value: {
      matrixA: [
        [a11, a12],
        [a21, a22],
      ],
      determinantA: detA,
      inverseMatrix: [
        [inv11, inv12],
        [inv21, inv22],
      ],
      jacobianDeterminant: jacobianDet,
      absJacobianDeterminant: absJacobianDet,
      areaScalingFactor: areaScaling,
      transformedUnitSquareVertices: [v00, v10, v11, v01],
    },
  };
}
