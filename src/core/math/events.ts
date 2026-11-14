/**
 * Deterministic Operations: CAL-EVENT-001 and CAL-EVENT-002
 * Conforms to A-004 v0.2 §5.1
 */

import {
  Rational,
  createRational,
  addRational,
  compareRational,
  rationalToString,
  rationalToLatex,
} from './rational';
import {
  CalculationResult,
  ErrorCode,
  FiniteSampleSpace,
  SetOperation,
} from './types';

export const CALCULATION_ENGINE_VERSION = '0.2.0';

export interface ValidationResult {
  readonly valid: boolean;
  readonly error_code?: ErrorCode;
  readonly message?: string;
}

/**
 * Validates a finite sample space probability assignment.
 */
export function validateSampleSpace(space: FiniteSampleSpace): ValidationResult {
  if (space.outcomes.length === 0) {
    return {
      valid: false,
      error_code: 'E-PROB-SUM',
      message: 'Sample space must contain at least one outcome.',
    };
  }

  // Check unique outcomes
  const uniqueOutcomes = new Set(space.outcomes);
  if (uniqueOutcomes.size !== space.outcomes.length) {
    return {
      valid: false,
      error_code: 'E-SUPPORT-DUPLICATE',
      message: 'Outcomes in sample space must be unique.',
    };
  }

  if (space.masses.length !== space.outcomes.length) {
    return {
      valid: false,
      error_code: 'E-MAPPING-INCOMPLETE',
      message: 'Each outcome must have an assigned probability mass.',
    };
  }

  const zero = createRational(0n);
  const one = createRational(1n);
  let sum = zero;

  for (const mass of space.masses) {
    if (compareRational(mass, zero) < 0 || compareRational(mass, one) > 0) {
      return {
        valid: false,
        error_code: 'E-PROB-RANGE',
        message: 'Each probability mass must be in the range [0, 1].',
      };
    }
    sum = addRational(sum, mass);
  }

  if (compareRational(sum, one) !== 0) {
    return {
      valid: false,
      error_code: 'E-PROB-SUM',
      message: `Probability masses must sum to 1. Current sum is ${rationalToString(sum)}.`,
    };
  }

  return { valid: true };
}

/**
 * CAL-EVENT-001: P(A) = sum_{omega in A} p(omega)
 */
export function calculateEventProbability(
  space: FiniteSampleSpace,
  event: readonly string[]
): CalculationResult<Rational> {
  const spaceVal = validateSampleSpace(space);
  if (!spaceVal.valid) {
    return {
      calculation_id: 'CAL-EVENT-001',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: spaceVal.error_code,
      message: spaceVal.message,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const outcomeMap = new Map<string, Rational>();
  for (let i = 0; i < space.outcomes.length; i++) {
    outcomeMap.set(space.outcomes[i], space.masses[i]);
  }

  // Verify A is a subset of Omega
  const eventSet = new Set(event);
  for (const item of eventSet) {
    if (!outcomeMap.has(item)) {
      return {
        calculation_id: 'CAL-EVENT-001',
        status: 'invalid_configuration',
        precision: 'exact',
        value: null,
        error_code: 'E-EVENT-OUTSIDE-SPACE',
        message: `Outcome "${item}" is not in the sample space.`,
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
    }
  }

  let totalProb = createRational(0n);
  for (const item of eventSet) {
    const mass = outcomeMap.get(item)!;
    totalProb = addRational(totalProb, mass);
  }

  return {
    calculation_id: 'CAL-EVENT-001',
    status: 'valid',
    precision: 'exact',
    value: totalProb,
    exact_rational: totalProb,
    display_value: rationalToString(totalProb),
    latex_value: rationalToLatex(totalProb),
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

export interface SetOperationResult {
  readonly resultEvent: readonly string[];
  readonly probabilityResult: CalculationResult<Rational>;
}

/**
 * CAL-EVENT-002: Set operations on events and their resulting probability
 */
export function calculateEventOperation(
  space: FiniteSampleSpace,
  eventA: readonly string[],
  eventB: readonly string[],
  operation: SetOperation
): SetOperationResult {
  const setA = new Set(eventA);
  const setB = new Set(eventB);
  const spaceSet = new Set(space.outcomes);

  let resultSet: Set<string>;

  switch (operation) {
    case 'union':
      resultSet = new Set([...setA, ...setB]);
      break;
    case 'intersection':
      resultSet = new Set([...setA].filter((x) => setB.has(x)));
      break;
    case 'complement':
      resultSet = new Set([...spaceSet].filter((x) => !setA.has(x)));
      break;
    case 'difference':
      resultSet = new Set([...setA].filter((x) => !setB.has(x)));
      break;
  }

  // Keep outcomes in original sample space order
  const orderedResult = space.outcomes.filter((x) => resultSet.has(x));
  const prob = calculateEventProbability(space, orderedResult);

  return {
    resultEvent: orderedResult,
    probabilityResult: {
      ...prob,
      calculation_id: 'CAL-EVENT-002',
    },
  };
}
