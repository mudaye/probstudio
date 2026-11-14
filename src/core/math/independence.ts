/**
/**
 * Deterministic Operations: CAL-IND-001, CAL-IND-002, CAL-IND-003
 * Conforms to A-004 v0.2 §5.1 and Shared Contracts v0.2
 */

import {
  Rational,
  createRational,
  mulRational,
  subRational,
  compareRational,
} from './rational';
import {
  FiniteSampleSpace,
  CalculationResult,
} from './types';
import {
  calculateEventProbability,
  calculateEventOperation,
  CALCULATION_ENGINE_VERSION,
} from './events';
import { calculateConditionalProbability } from './conditional';

export interface PairwiseIndependenceResult {
  readonly calculation_id: 'CAL-IND-001';
  readonly status: 'valid' | 'invalid_configuration';
  readonly isIndependent: boolean;
  readonly probA: Rational;
  readonly probB: Rational;
  readonly probIntersection: Rational;
  readonly probProduct: Rational;
  readonly difference: Rational; // P(A ∩ B) - P(A)P(B)
  readonly condProbAGivenB: CalculationResult<Rational> | null;
  readonly calculation_engine_version: string;
}

export interface SubsetIndependenceCheck {
  readonly eventNames: readonly string[];
  readonly jointProb: Rational;
  readonly productProb: Rational;
  readonly difference: Rational;
  readonly isSatisfied: boolean;
}

export interface MutualIndependenceResult {
  readonly calculation_id: 'CAL-IND-002';
  readonly status: 'valid' | 'invalid_configuration';
  readonly isMutuallyIndependent: boolean;
  readonly isPairwiseIndependent: boolean;
  readonly checks: readonly SubsetIndependenceCheck[];
  readonly message: string;
  readonly calculation_engine_version: string;
}

export interface ConditionalIndependenceResult {
  readonly calculation_id: 'CAL-IND-003';
  readonly status: 'valid' | 'undefined' | 'invalid_configuration';
  readonly error_code?: string;
  readonly message?: string;
  readonly isConditionallyIndependent: boolean | null;
  readonly probC: Rational;
  readonly probAGivenC: CalculationResult<Rational>;
  readonly probBGivenC: CalculationResult<Rational>;
  readonly probIntersectionGivenC: CalculationResult<Rational>;
  readonly condProduct: Rational | null;
  readonly difference: Rational | null;
  readonly calculation_engine_version: string;
}

/**
 * CAL-IND-001: Pairwise Independence between events A and B
 * A and B are independent iff P(A ∩ B) = P(A)P(B)
 */
export function calculatePairwiseIndependence(
  space: FiniteSampleSpace,
  eventA: readonly string[],
  eventB: readonly string[]
): PairwiseIndependenceResult {
  const pA = calculateEventProbability(space, eventA).value;
  const pB = calculateEventProbability(space, eventB).value;

  if (!pA || !pB) {
    const zero = createRational(0n);
    return {
      calculation_id: 'CAL-IND-001',
      status: 'invalid_configuration',
      isIndependent: false,
      probA: zero,
      probB: zero,
      probIntersection: zero,
      probProduct: zero,
      difference: zero,
      condProbAGivenB: null,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const intersectionResult = calculateEventOperation(space, eventA, eventB, 'intersection');
  const pIntersection = intersectionResult.probabilityResult.value ?? createRational(0n);
  const pProduct = mulRational(pA, pB);
  const diff = subRational(pIntersection, pProduct);
  const isIndependent = compareRational(diff, createRational(0n)) === 0;

  // Evaluate P(A | B) if P(B) > 0
  let condProb: CalculationResult<Rational> | null = null;
  if (compareRational(pB, createRational(0n)) > 0) {
    condProb = calculateConditionalProbability(pIntersection, pB);
  }

  return {
    calculation_id: 'CAL-IND-001',
    status: 'valid',
    isIndependent,
    probA: pA,
    probB: pB,
    probIntersection: pIntersection,
    probProduct: pProduct,
    difference: diff,
    condProbAGivenB: condProb,
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

/**
 * CAL-IND-002: Mutual (Total) Independence for a collection of named events
 * Requires P(∩_{i ∈ S} A_i) = ∏_{i ∈ S} P(A_i) for every non-empty subset S with |S| >= 2
 */
export function calculateMutualIndependence(
  space: FiniteSampleSpace,
  events: readonly { readonly name: string; readonly outcomes: readonly string[] }[]
): MutualIndependenceResult {
  const n = events.length;
  if (n < 2) {
    return {
      calculation_id: 'CAL-IND-002',
      status: 'invalid_configuration',
      isMutuallyIndependent: false,
      isPairwiseIndependent: false,
      checks: [],
      message: 'Mutual independence requires at least 2 events.',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const checks: SubsetIndependenceCheck[] = [];
  let allPairwiseSatisfied = true;
  let allSubsetsSatisfied = true;

  // Precompute individual probabilities
  const individualProbs: Rational[] = [];
  for (const ev of events) {
    const prob = calculateEventProbability(space, ev.outcomes).value;
    if (!prob) {
      return {
        calculation_id: 'CAL-IND-002',
        status: 'invalid_configuration',
        isMutuallyIndependent: false,
        isPairwiseIndependent: false,
        checks: [],
        message: 'Invalid sample space or event configuration.',
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
    }
    individualProbs.push(prob);
  }

  // Iterate over all subsets of size k from 2 to n
  const totalSubsets = 1 << n;
  for (let mask = 1; mask < totalSubsets; mask++) {
    const indices: number[] = [];
    for (let bit = 0; bit < n; bit++) {
      if ((mask & (1 << bit)) !== 0) {
        indices.push(bit);
      }
    }

    if (indices.length < 2) continue; // only size >= 2

    // Compute joint outcomes (intersection)
    let jointOutcomes = [...events[indices[0]].outcomes];
    for (let i = 1; i < indices.length; i++) {
      const nextOutcomes = events[indices[i]].outcomes;
      jointOutcomes = jointOutcomes.filter((x) => nextOutcomes.includes(x));
    }

    const jointProb = calculateEventProbability(space, jointOutcomes).value ?? createRational(0n);

    // Compute product of marginals
    let productProb = individualProbs[indices[0]];
    for (let i = 1; i < indices.length; i++) {
      productProb = mulRational(productProb, individualProbs[indices[i]]);
    }

    const diff = subRational(jointProb, productProb);
    const isSatisfied = compareRational(diff, createRational(0n)) === 0;

    if (!isSatisfied) {
      allSubsetsSatisfied = false;
      if (indices.length === 2) {
        allPairwiseSatisfied = false;
      }
    }

    checks.push({
      eventNames: indices.map((i) => events[i].name),
      jointProb,
      productProb,
      difference: diff,
      isSatisfied,
    });
  }

  let message = 'All sub-family intersection product conditions are satisfied.';
  if (!allSubsetsSatisfied) {
    if (allPairwiseSatisfied) {
      message = 'Events are pairwise independent, but NOT mutually independent (higher-order intersection fails product rule).';
    } else {
      message = 'Events fail independence criteria.';
    }
  }

  return {
    calculation_id: 'CAL-IND-002',
    status: 'valid',
    isMutuallyIndependent: allSubsetsSatisfied,
    isPairwiseIndependent: allPairwiseSatisfied,
    checks,
    message,
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

/**
 * CAL-IND-003: Conditional Independence of A and B given C
 * A and B are conditionally independent given C iff P(A ∩ B | C) = P(A | C)P(B | C)
 * Precondition: P(C) > 0. If P(C) == 0, returns 'undefined' with 'E-COND-ZERO'
 */
export function calculateConditionalIndependence(
  space: FiniteSampleSpace,
  eventA: readonly string[],
  eventB: readonly string[],
  eventC: readonly string[]
): ConditionalIndependenceResult {
  const pC = calculateEventProbability(space, eventC).value;
  const zero = createRational(0n);

  if (!pC) {
    return {
      calculation_id: 'CAL-IND-003',
      status: 'invalid_configuration',
      error_code: 'E-PROB-INVALID',
      message: 'Invalid sample space or conditioning event.',
      isConditionallyIndependent: null,
      probC: zero,
      probAGivenC: {
        calculation_id: 'CAL-COND-001',
        status: 'invalid_configuration',
        precision: 'exact',
        value: null,
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      },
      probBGivenC: {
        calculation_id: 'CAL-COND-001',
        status: 'invalid_configuration',
        precision: 'exact',
        value: null,
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      },
      probIntersectionGivenC: {
        calculation_id: 'CAL-COND-001',
        status: 'invalid_configuration',
        precision: 'exact',
        value: null,
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      },
      condProduct: null,
      difference: null,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Precondition check: P(C) > 0
  if (compareRational(pC, zero) === 0) {
    const undefResult: CalculationResult<Rational> = {
      calculation_id: 'CAL-COND-001',
      status: 'undefined',
      precision: 'exact',
      value: null,
      error_code: 'E-COND-ZERO',
      message: 'Conditioning event has probability zero; conditional independence is undefined.',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };

    return {
      calculation_id: 'CAL-IND-003',
      status: 'undefined',
      error_code: 'E-COND-ZERO',
      message: 'Conditioning event has probability zero; conditional independence is undefined.',
      isConditionallyIndependent: null,
      probC: pC,
      probAGivenC: undefResult,
      probBGivenC: undefResult,
      probIntersectionGivenC: undefResult,
      condProduct: null,
      difference: null,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Intersections
  const aIntersectC = eventA.filter((x) => eventC.includes(x));
  const bIntersectC = eventB.filter((x) => eventC.includes(x));
  const aIntersectBIntersectC = eventA.filter((x) => eventB.includes(x) && eventC.includes(x));

  const pAIntersectC = calculateEventProbability(space, aIntersectC).value ?? zero;
  const pBIntersectC = calculateEventProbability(space, bIntersectC).value ?? zero;
  const pABIntersectC = calculateEventProbability(space, aIntersectBIntersectC).value ?? zero;

  const probAGivenC = calculateConditionalProbability(pAIntersectC, pC);
  const probBGivenC = calculateConditionalProbability(pBIntersectC, pC);
  const probIntersectionGivenC = calculateConditionalProbability(pABIntersectC, pC);

  if (
    probAGivenC.status !== 'valid' ||
    probBGivenC.status !== 'valid' ||
    probIntersectionGivenC.status !== 'valid' ||
    !probAGivenC.exact_rational ||
    !probBGivenC.exact_rational ||
    !probIntersectionGivenC.exact_rational
  ) {
    return {
      calculation_id: 'CAL-IND-003',
      status: 'invalid_configuration',
      isConditionallyIndependent: null,
      probC: pC,
      probAGivenC,
      probBGivenC,
      probIntersectionGivenC,
      condProduct: null,
      difference: null,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const condProduct = mulRational(probAGivenC.exact_rational, probBGivenC.exact_rational);
  const diff = subRational(probIntersectionGivenC.exact_rational, condProduct);
  const isConditionallyIndependent = compareRational(diff, zero) === 0;

  return {
    calculation_id: 'CAL-IND-003',
    status: 'valid',
    isConditionallyIndependent,
    probC: pC,
    probAGivenC,
    probBGivenC,
    probIntersectionGivenC,
    condProduct,
    difference: diff,
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}
