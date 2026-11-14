/**
 * Deterministic Operations: CAL-COND-001 and CAL-COND-002
 * Conforms to A-004 v0.2 §5.1 and Shared Contracts v0.2
 */

import {
  Rational,
  createRational,
  addRational,
  mulRational,
  divRational,
  compareRational,
  rationalToString,
  rationalToLatex,
} from './rational';
import { CalculationResult } from './types';
import { CALCULATION_ENGINE_VERSION } from './events';

/**
 * CAL-COND-001: P(A | B) = P(A ∩ B) / P(B)
 * Preconditions: P(B) > 0; if P(B) == 0, returns 'undefined' with 'E-COND-ZERO'
 */
export function calculateConditionalProbability(
  probIntersection: Rational,
  probConditioning: Rational
): CalculationResult<Rational> {
  const zero = createRational(0n);
  const one = createRational(1n);

  // Validate probability range [0, 1]
  if (
    compareRational(probIntersection, zero) < 0 ||
    compareRational(probIntersection, one) > 0 ||
    compareRational(probConditioning, zero) < 0 ||
    compareRational(probConditioning, one) > 0
  ) {
    return {
      calculation_id: 'CAL-COND-001',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-PROB-RANGE',
      message: 'Probabilities must be in the range [0, 1].',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Precondition: P(A ∩ B) <= P(B)
  if (compareRational(probIntersection, probConditioning) > 0) {
    return {
      calculation_id: 'CAL-COND-001',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-PROB-RANGE',
      message: 'Joint probability P(A ∩ B) cannot exceed conditioning probability P(B).',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // If P(B) == 0, undefined with E-COND-ZERO
  if (compareRational(probConditioning, zero) === 0) {
    return {
      calculation_id: 'CAL-COND-001',
      status: 'undefined',
      precision: 'exact',
      value: null,
      error_code: 'E-COND-ZERO',
      message: 'Conditioning event has probability zero; conditional probability is undefined.',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const result = divRational(probIntersection, probConditioning);

  return {
    calculation_id: 'CAL-COND-001',
    status: 'valid',
    precision: 'exact',
    value: result,
    exact_rational: result,
    display_value: rationalToString(result),
    latex_value: rationalToLatex(result),
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

export interface BayesInputPartition {
  readonly name: string;
  readonly prior: Rational;
  readonly likelihood: Rational; // P(Evidence | PartitionItem)
}

export interface BayesResult {
  readonly evidenceTotalProbability: CalculationResult<Rational>;
  readonly posteriorProbability: CalculationResult<Rational>;
  readonly jointProbabilities: readonly { name: string; joint: Rational }[];
}

/**
 * CAL-COND-002: Law of Total Probability & Bayes' Rule
 * For a finite partition {B_i}, P(A) = sum_i P(A | B_i) * P(B_i)
 * Posterior P(B_j | A) = (P(A | B_j) * P(B_j)) / P(A)
 */
export function calculateBayesRule(
  partition: readonly BayesInputPartition[],
  targetIndex: number
): BayesResult {
  const zero = createRational(0n);
  const one = createRational(1n);

  let priorSum = zero;
  const jointList: { name: string; joint: Rational }[] = [];

  for (const item of partition) {
    priorSum = addRational(priorSum, item.prior);
    const joint = mulRational(item.prior, item.likelihood);
    jointList.push({ name: item.name, joint });
  }

  // Check valid partition sum
  if (compareRational(priorSum, one) !== 0) {
    const errResult: CalculationResult<Rational> = {
      calculation_id: 'CAL-COND-002',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-PROB-SUM',
      message: `Priors must sum to 1. Current sum is ${rationalToString(priorSum)}.`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
    return {
      evidenceTotalProbability: errResult,
      posteriorProbability: errResult,
      jointProbabilities: jointList,
    };
  }

  // Total probability of evidence P(A) = sum_i P(A ∩ B_i)
  let totalEvidenceProb = zero;
  for (const item of jointList) {
    totalEvidenceProb = addRational(totalEvidenceProb, item.joint);
  }

  const evidenceResult: CalculationResult<Rational> = {
    calculation_id: 'CAL-COND-002',
    status: 'valid',
    precision: 'exact',
    value: totalEvidenceProb,
    exact_rational: totalEvidenceProb,
    display_value: rationalToString(totalEvidenceProb),
    latex_value: rationalToLatex(totalEvidenceProb),
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };

  // Target joint
  const targetJoint = jointList[targetIndex]?.joint ?? zero;

  // Posterior P(B_target | A)
  const posteriorResult = calculateConditionalProbability(targetJoint, totalEvidenceProb);

  return {
    evidenceTotalProbability: evidenceResult,
    posteriorProbability: {
      ...posteriorResult,
      calculation_id: 'CAL-COND-002',
    },
    jointProbabilities: jointList,
  };
}
