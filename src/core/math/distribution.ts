/**
/**
 * Deterministic Operations: CAL-PMF-001, CAL-CDF-001, CAL-CDF-002
 * Conforms to A-004 v0.2 §5.1 and Shared Contracts v0.2
 */

import {
  Rational,
  createRational,
  addRational,
  compareRational,
  rationalToString,
  rationalToLatex,
} from './rational';
import { CalculationResult } from './types';
import { CALCULATION_ENGINE_VERSION } from './events';

export interface DiscreteSupportPoint {
  readonly x: number;
  readonly mass: Rational;
  readonly cdfValue: Rational; // F(x) = P(X <= x)
  readonly leftLimit: Rational; // F(x-) = P(X < x)
  readonly jumpSize: Rational; // F(x) - F(x-) = mass
}

export interface DiscreteDistribution {
  readonly points: readonly DiscreteSupportPoint[];
  readonly totalMass: Rational;
  readonly isValid: boolean;
}

export interface IntervalProbabilityResult {
  readonly intervalLabel: string;
  readonly a: number;
  readonly b: number;
  readonly includeLeft: boolean;
  readonly includeRight: boolean;
  readonly probability: Rational;
  readonly includedPoints: readonly number[];
}

/**
 * Validates and sorts a finite discrete distribution on real support points.
 * Ensures support points are unique and masses sum to 1.
 */
export function createDiscreteDistribution(
  support: readonly { x: number; mass: Rational }[]
): CalculationResult<DiscreteDistribution> {
  const zero = createRational(0n);
  const one = createRational(1n);

  if (support.length === 0) {
    return {
      calculation_id: 'CAL-PMF-001',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-NONFINITE-INPUT',
      message: 'Distribution must have at least one support point.',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Check valid non-negative masses
  for (const pt of support) {
    if (compareRational(pt.mass, zero) < 0 || compareRational(pt.mass, one) > 0) {
      return {
        calculation_id: 'CAL-PMF-001',
        status: 'invalid_configuration',
        precision: 'exact',
        value: null,
        error_code: 'E-PROB-RANGE',
        message: `Point mass at x=${pt.x} is outside [0, 1].`,
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
    }
  }

  // Sort by x ascending
  const sorted = [...support].sort((p1, p2) => p1.x - p2.x);

  // Check unique support values
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].x === sorted[i + 1].x) {
      return {
        calculation_id: 'CAL-PMF-001',
        status: 'invalid_configuration',
        precision: 'exact',
        value: null,
        error_code: 'E-SUPPORT-DUPLICATE',
        message: `Duplicate support point x=${sorted[i].x}. Support points must be distinct.`,
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
    }
  }

  // Accumulate CDF
  let runningCdf = zero;
  const points: DiscreteSupportPoint[] = [];

  for (const pt of sorted) {
    const leftLimit = runningCdf;
    runningCdf = addRational(runningCdf, pt.mass);
    points.push({
      x: pt.x,
      mass: pt.mass,
      leftLimit,
      cdfValue: runningCdf,
      jumpSize: pt.mass,
    });
  }

  // Check sum == 1
  if (compareRational(runningCdf, one) !== 0) {
    return {
      calculation_id: 'CAL-PMF-001',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-PROB-SUM',
      message: `Masses must sum to 1. Current sum is ${rationalToString(runningCdf)}.`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const dist: DiscreteDistribution = {
    points,
    totalMass: runningCdf,
    isValid: true,
  };

  return {
    calculation_id: 'CAL-PMF-001',
    status: 'valid',
    precision: 'exact',
    value: dist,
    display_value: `${points.length} support points`,
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

/**
 * CAL-CDF-001: Evaluate F(queryX) = P(X <= queryX)
 */
export function evaluateCdf(
  dist: DiscreteDistribution,
  queryX: number
): { cdfValue: Rational; leftLimit: Rational } {
  const zero = createRational(0n);
  const one = createRational(1n);

  if (dist.points.length === 0) {
    return { cdfValue: zero, leftLimit: zero };
  }

  // If queryX < lowest support point, F(x) = 0
  if (queryX < dist.points[0].x) {
    return { cdfValue: zero, leftLimit: zero };
  }

  // If queryX >= highest support point, F(x) = 1
  if (queryX >= dist.points[dist.points.length - 1].x) {
    // Check if queryX == highest support point
    const last = dist.points[dist.points.length - 1];
    if (queryX === last.x) {
      return { cdfValue: one, leftLimit: last.leftLimit };
    }
    return { cdfValue: one, leftLimit: one };
  }

  // Binary or linear scan
  for (let i = 0; i < dist.points.length; i++) {
    const pt = dist.points[i];
    if (queryX === pt.x) {
      return { cdfValue: pt.cdfValue, leftLimit: pt.leftLimit };
    }
    if (queryX < pt.x) {
      // In plateau between points[i-1] and points[i]
      const prevCdf = dist.points[i - 1].cdfValue;
      return { cdfValue: prevCdf, leftLimit: prevCdf };
    }
  }

  return { cdfValue: one, leftLimit: one };
}

/**
 * CAL-CDF-002: Evaluate Interval Probability with selectable endpoint inclusions
 * P(X in I) where I is [a, b], (a, b], [a, b), or (a, b).
 * Precondition: a <= b. Reversed bounds (a > b) return status 'invalid_configuration' with 'E-BOUNDS-ORDER'.
 * Empty valid interval (e.g. (a, a)) returns valid 0.
 */
export function calculateIntervalProbability(
  dist: DiscreteDistribution,
  a: number,
  b: number,
  includeLeft: boolean,
  includeRight: boolean
): CalculationResult<IntervalProbabilityResult> {
  // Precondition check: a <= b
  if (a > b) {
    return {
      calculation_id: 'CAL-CDF-002',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-BOUNDS-ORDER',
      message: `Interval lower bound a (${a}) cannot exceed upper bound b (${b}).`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const zero = createRational(0n);
  let totalIntervalMass = zero;
  const includedPoints: number[] = [];

  for (const pt of dist.points) {
    const satisfiesLeft = includeLeft ? pt.x >= a : pt.x > a;
    const satisfiesRight = includeRight ? pt.x <= b : pt.x < b;

    if (satisfiesLeft && satisfiesRight) {
      totalIntervalMass = addRational(totalIntervalMass, pt.mass);
      includedPoints.push(pt.x);
    }
  }

  const leftBracket = includeLeft ? '[' : '(';
  const rightBracket = includeRight ? ']' : ')';
  const intervalLabel = `${leftBracket}${a}, ${b}${rightBracket}`;

  const result: IntervalProbabilityResult = {
    intervalLabel,
    a,
    b,
    includeLeft,
    includeRight,
    probability: totalIntervalMass,
    includedPoints,
  };

  return {
    calculation_id: 'CAL-CDF-002',
    status: 'valid',
    precision: 'exact',
    value: result,
    display_value: rationalToString(totalIntervalMass),
    latex_value: rationalToLatex(totalIntervalMass),
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}
