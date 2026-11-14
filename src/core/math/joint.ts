/**
 * Deterministic Operations for Joint and Bivariate Distributions
 * Conforms to A-004 v0.2 §5.1, §5.3 and A-003 v0.4 §4.3 (PL-09)
 * (CAL-JOINT-001, CAL-JOINT-002, CAL-JOINT-003, CAL-JOINT-004, CAL-JOINT-005, CAL-JOINT-006)
 */

import {
  Rational,
  createRational,
  parseRational,
  addRational,
  mulRational,
  subRational,
  rationalToDecimal,
  compareRational,
} from './rational';
import { CalculationResult } from './types';
import { CALCULATION_ENGINE_VERSION } from './events';
import { DeterministicPRNG } from './simulation';

export type JointModelType = 'discrete' | 'continuous_triangular';

export interface DiscreteJointTable {
  readonly xSupport: readonly number[];
  readonly ySupport: readonly number[];
  readonly masses: readonly (readonly Rational[])[];
}

export interface DiscreteJointResult {
  readonly table: DiscreteJointTable;
  readonly xMarginals: readonly Rational[];
  readonly yMarginals: readonly Rational[];
  readonly totalMass: Rational;
  readonly isNormalized: boolean;
}

export interface RectangleBounds {
  readonly xMin: number;
  readonly xMax: number;
  readonly yMin: number;
  readonly yMax: number;
}

export interface RectangleQueryResult {
  readonly bounds: RectangleBounds;
  readonly probability: number;
  readonly exactRational?: Rational;
  readonly includedPairsCount?: number;
}

export interface ContinuousTriangularResult {
  readonly densityValue: number; // 2.0 on 0 < x < y < 1
  readonly xPdfFormula: string; // f_X(x) = 2(1 - x)
  readonly yPdfFormula: string; // f_Y(y) = 2y
  readonly totalIntegral: number; // 1.0
}

export interface BoundaryEventQueryResult {
  readonly thresholdC: number;
  readonly probability: number; // (1 - c)^2 for 0 <= c <= 1
  readonly formula: string;
}

export interface JointIndependenceResult {
  readonly isIndependent: boolean;
  readonly modelType: JointModelType;
  readonly explanation: string;
  readonly maxDiscrepancy: number;
  readonly comparisonMatrix?: readonly (readonly {
    readonly x: number;
    readonly y: number;
    readonly jointProb: number;
    readonly productProb: number;
    readonly diff: number;
  }[])[];
}

export interface BivariateSample {
  readonly x: number;
  readonly y: number;
}

export interface JointSimulationResult {
  readonly runCount: number;
  readonly seed: number;
  readonly samplesPreview: readonly BivariateSample[];
  readonly empiricalRectangleProb?: number;
  readonly empiricalBoundaryProb?: number;
  readonly empiricalCellCounts?: readonly (readonly number[])[];
}

/**
 * Creates and validates a discrete 2D joint mass table (CAL-JOINT-001)
 */
export function createDiscreteJointTable(
  xSupport: readonly number[],
  ySupport: readonly number[],
  massInputs: readonly (readonly (Rational | number | string)[])[]
): CalculationResult<DiscreteJointResult> {
  if (xSupport.length === 0 || ySupport.length === 0) {
    return {
      calculation_id: 'CAL-JOINT-001',
      status: 'invalid_configuration',
      error_code: 'E-PARAM-DOMAIN',
      message: 'Support sets for X and Y must be non-empty.',
      precision: 'exact',
      value: null,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Parse masses to Rational
  const masses: Rational[][] = [];
  let totalMass = createRational(0n, 1n);

  for (let i = 0; i < xSupport.length; i++) {
    const row: Rational[] = [];
    const inputRow = massInputs[i] || [];
    for (let j = 0; j < ySupport.length; j++) {
      const val = inputRow[j];
      let r: Rational | null = null;
      if (val !== undefined && val !== null) {
        if (typeof val === 'object' && 'num' in val) {
          r = val;
        } else if (typeof val === 'number') {
          r = parseRational(val.toString());
        } else {
          r = parseRational(val);
        }
      }
      if (!r) {
        r = createRational(0n, 1n);
      }
      if (r.num < 0n) {
        return {
          calculation_id: 'CAL-JOINT-001',
          status: 'invalid_configuration',
          error_code: 'E-PROB-RANGE',
          message: `Joint probability mass at (${xSupport[i]}, ${ySupport[j]}) cannot be negative.`,
          precision: 'exact',
          value: null,
          calculation_engine_version: CALCULATION_ENGINE_VERSION,
        };
      }
      row.push(r);
      totalMass = addRational(totalMass, r);
    }
    masses.push(row);
  }

  // Calculate row marginals p_X(x) = sum_y p(x, y)
  const xMarginals: Rational[] = [];
  for (let i = 0; i < xSupport.length; i++) {
    let rowSum = createRational(0n, 1n);
    for (let j = 0; j < ySupport.length; j++) {
      rowSum = addRational(rowSum, masses[i][j]);
    }
    xMarginals.push(rowSum);
  }

  // Calculate col marginals p_Y(y) = sum_x p(x, y)
  const yMarginals: Rational[] = [];
  for (let j = 0; j < ySupport.length; j++) {
    let colSum = createRational(0n, 1n);
    for (let i = 0; i < xSupport.length; i++) {
      colSum = addRational(colSum, masses[i][j]);
    }
    yMarginals.push(colSum);
  }

  const isNormalized = totalMass.num === totalMass.den && totalMass.num === 1n;

  if (!isNormalized) {
    return {
      calculation_id: 'CAL-JOINT-001',
      status: 'invalid_configuration',
      error_code: 'E-PROB-SUM',
      message: `Total joint probability masses sum to ${rationalToDecimal(totalMass, 4)} instead of 1.`,
      precision: 'exact',
      value: {
        table: { xSupport, ySupport, masses },
        xMarginals,
        yMarginals,
        totalMass,
        isNormalized: false,
      },
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  return {
    calculation_id: 'CAL-JOINT-001',
    status: 'valid',
    precision: 'exact',
    value: {
      table: { xSupport, ySupport, masses },
      xMarginals,
      yMarginals,
      totalMass,
      isNormalized: true,
    },
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

/**
 * Calculates rectangle query probability P(xMin <= X <= xMax, yMin <= Y <= yMax) (CAL-JOINT-002)
 */
export function queryDiscreteRectangleProbability(
  table: DiscreteJointTable,
  bounds: RectangleBounds
): CalculationResult<RectangleQueryResult> {
  if (bounds.xMin > bounds.xMax || bounds.yMin > bounds.yMax) {
    return {
      calculation_id: 'CAL-JOINT-002',
      status: 'invalid_configuration',
      error_code: 'E-BOUNDS-ORDER',
      message: 'Lower rectangle bound cannot exceed upper rectangle bound.',
      precision: 'exact',
      value: null,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  let sum = createRational(0n, 1n);
  let pairCount = 0;

  for (let i = 0; i < table.xSupport.length; i++) {
    const x = table.xSupport[i];
    if (x >= bounds.xMin && x <= bounds.xMax) {
      for (let j = 0; j < table.ySupport.length; j++) {
        const y = table.ySupport[j];
        if (y >= bounds.yMin && y <= bounds.yMax) {
          sum = addRational(sum, table.masses[i][j]);
          pairCount++;
        }
      }
    }
  }

  return {
    calculation_id: 'CAL-JOINT-002',
    status: 'valid',
    precision: 'exact',
    value: {
      bounds,
      probability: rationalToDecimal(sum),
      exactRational: sum,
      includedPairsCount: pairCount,
    },
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

/**
 * Evaluates the continuous triangular joint distribution: f(x, y) = 2 on 0 < x < y < 1 (CAL-JOINT-003)
 */
export function getContinuousTriangularModel(): CalculationResult<ContinuousTriangularResult> {
  return {
    calculation_id: 'CAL-JOINT-003',
    status: 'valid',
    precision: 'exact',
    value: {
      densityValue: 2.0,
      xPdfFormula: 'f_X(x) = 2(1 - x) \\quad (0 < x < 1)',
      yPdfFormula: 'f_Y(y) = 2y \\quad (0 < y < 1)',
      totalIntegral: 1.0,
    },
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

/**
 * Evaluates the non-rectangular boundary event P(Y > X + c) for the triangular model (CAL-JOINT-004)
 * Source reference: Part 3, Chapter 4: P(Y > X + c) = (1 - c)^2 for 0 <= c <= 1.
 */
export function queryContinuousBoundaryEvent(
  thresholdC: number
): CalculationResult<BoundaryEventQueryResult> {
  let prob = 0;
  if (thresholdC <= 0) {
    prob = 1.0;
  } else if (thresholdC >= 1.0) {
    prob = 0.0;
  } else {
    // Area of upper triangle with vertices (0, c), (0, 1), (1-c, 1) is 0.5 * (1 - c)^2
    // Density = 2.0 -> Probability = 2 * 0.5 * (1 - c)^2 = (1 - c)^2.
    prob = Math.pow(1.0 - thresholdC, 2);
  }

  return {
    calculation_id: 'CAL-JOINT-004',
    status: 'valid',
    precision: 'exact',
    value: {
      thresholdC,
      probability: prob,
      formula: 'P(Y > X + c) = (1 - c)^2 \\quad (0 \\le c \\le 1)',
    },
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

/**
 * Evaluates continuous triangular model rectangle probability (CAL-JOINT-002)
 */
export function queryContinuousTriangularRectangle(
  bounds: RectangleBounds
): CalculationResult<RectangleQueryResult> {
  if (bounds.xMin > bounds.xMax || bounds.yMin > bounds.yMax) {
    return {
      calculation_id: 'CAL-JOINT-002',
      status: 'invalid_configuration',
      error_code: 'E-BOUNDS-ORDER',
      message: 'Lower rectangle bound cannot exceed upper rectangle bound.',
      precision: 'approximate',
      value: null,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Intersect [xMin, xMax] x [yMin, yMax] with 0 < x < y < 1.
  const x1 = Math.max(0, bounds.xMin);
  const x2 = Math.min(1, bounds.xMax);
  const y1 = Math.max(0, bounds.yMin);
  const y2 = Math.min(1, bounds.yMax);

  if (x1 >= x2 || y1 >= y2 || x1 >= y2) {
    return {
      calculation_id: 'CAL-JOINT-002',
      status: 'valid',
      precision: 'exact',
      value: { bounds, probability: 0 },
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Exact 2D integration of density 2 over the region {x1 <= x <= x2, y1 <= y <= y2, x < y}
  // For each x in [x1, x2], y ranges from max(y1, x) to y2 (if max(y1, x) < y2)
  // Integral = integral_{x1}^{min(x2, y2)} 2 * (y2 - max(y1, x)) dx
  const xUpper = Math.min(x2, y2);
  let integral = 0;

  if (x1 < xUpper) {
    if (xUpper <= y1) {
      // Throughout [x1, xUpper], x <= y1, so max(y1, x) = y1
      integral = 2 * (y2 - y1) * (xUpper - x1);
    } else if (x1 >= y1) {
      // Throughout [x1, xUpper], x >= y1, so max(y1, x) = x
      // integral_{x1}^{xUpper} 2*(y2 - x) dx = 2*y2*(xUpper - x1) - (xUpper^2 - x1^2)
      integral = 2 * y2 * (xUpper - x1) - (xUpper * xUpper - x1 * x1);
    } else {
      // Split at y1: [x1, y1] where max(y1, x) = y1, and [y1, xUpper] where max(y1, x) = x
      const part1 = 2 * (y2 - y1) * (y1 - x1);
      const part2 = 2 * y2 * (xUpper - y1) - (xUpper * xUpper - y1 * y1);
      integral = part1 + part2;
    }
  }

  const prob = Math.max(0, Math.min(1, integral));

  return {
    calculation_id: 'CAL-JOINT-002',
    status: 'valid',
    precision: 'exact',
    value: {
      bounds,
      probability: prob,
    },
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

/**
 * Checks independence between X and Y: p(x, y) = p_X(x) * p_Y(y) or f(x, y) = f_X(x) * f_Y(y) (CAL-JOINT-005)
 */
export function checkJointIndependence(
  model:
    | { type: 'discrete'; data: DiscreteJointResult }
    | { type: 'continuous_triangular' }
): CalculationResult<JointIndependenceResult> {
  if (model.type === 'continuous_triangular') {
    return {
      calculation_id: 'CAL-JOINT-005',
      status: 'valid',
      precision: 'exact',
      value: {
        isIndependent: false,
        modelType: 'continuous_triangular',
        explanation:
          'X and Y are dependent. The triangular support {0 < x < y < 1} is not a product set, and the product of marginals f_X(x)f_Y(y) = 4y(1 - x) does not equal the joint density f(x, y) = 2.',
        maxDiscrepancy: 1.0,
      },
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Discrete comparison
  const { table, xMarginals, yMarginals } = model.data;
  let isIndep = true;
  let maxDiff = 0;

  const compMatrix: {
    x: number;
    y: number;
    jointProb: number;
    productProb: number;
    diff: number;
  }[][] = [];

  for (let i = 0; i < table.xSupport.length; i++) {
    const row: {
      x: number;
      y: number;
      jointProb: number;
      productProb: number;
      diff: number;
    }[] = [];
    const px = xMarginals[i];

    for (let j = 0; j < table.ySupport.length; j++) {
      const py = yMarginals[j];
      const pxy = table.masses[i][j];
      const prod = mulRational(px, py);
      const diffRational = subRational(pxy, prod);
      const diffVal = Math.abs(rationalToDecimal(diffRational));

      if (diffVal > maxDiff) {
        maxDiff = diffVal;
      }
      if (compareRational(pxy, prod) !== 0) {
        isIndep = false;
      }

      row.push({
        x: table.xSupport[i],
        y: table.ySupport[j],
        jointProb: rationalToDecimal(pxy),
        productProb: rationalToDecimal(prod),
        diff: diffVal,
      });
    }
    compMatrix.push(row);
  }

  return {
    calculation_id: 'CAL-JOINT-005',
    status: 'valid',
    precision: 'exact',
    value: {
      isIndependent: isIndep,
      modelType: 'discrete',
      explanation: isIndep
        ? 'X and Y are independent: for every supported pair (x, y), p(x, y) = p_X(x) · p_Y(y).'
        : 'X and Y are dependent: there exists at least one pair where p(x, y) ≠ p_X(x) · p_Y(y).',
      maxDiscrepancy: maxDiff,
      comparisonMatrix: compMatrix,
    },
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

/**
 * Simulates paired random draws from discrete or continuous triangular models (CAL-JOINT-006)
 */
export function simulateJointDistribution(
  model:
    | { type: 'discrete'; data: DiscreteJointResult }
    | { type: 'continuous_triangular' },
  runCount: number,
  seed: number,
  rectangleQuery?: RectangleBounds,
  boundaryC?: number
): JointSimulationResult {
  const prng = new DeterministicPRNG(seed);
  const samples: BivariateSample[] = [];

  let rectCount = 0;
  let boundaryCount = 0;

  if (model.type === 'continuous_triangular') {
    for (let i = 0; i < runCount; i++) {
      // Order statistics of 2 i.i.d. Uniform(0,1) variables:
      // X = min(u1, u2), Y = max(u1, u2) gives exact density f(x, y) = 2 on 0 < x < y < 1!
      const u1 = prng.next();
      const u2 = prng.next();
      const x = Math.min(u1, u2);
      const y = Math.max(u1, u2);

      if (i < 50) {
        samples.push({ x, y });
      }

      if (
        rectangleQuery &&
        x >= rectangleQuery.xMin &&
        x <= rectangleQuery.xMax &&
        y >= rectangleQuery.yMin &&
        y <= rectangleQuery.yMax
      ) {
        rectCount++;
      }

      if (boundaryC !== undefined && y > x + boundaryC) {
        boundaryCount++;
      }
    }

    return {
      runCount,
      seed,
      samplesPreview: samples,
      empiricalRectangleProb: rectangleQuery ? rectCount / runCount : undefined,
      empiricalBoundaryProb: boundaryC !== undefined ? boundaryCount / runCount : undefined,
    };
  } else {
    // Discrete sampling
    const { table } = model.data;
    const flatPairs: { x: number; y: number; mass: number; i: number; j: number }[] = [];
    for (let i = 0; i < table.xSupport.length; i++) {
      for (let j = 0; j < table.ySupport.length; j++) {
        flatPairs.push({
          x: table.xSupport[i],
          y: table.ySupport[j],
          mass: rationalToDecimal(table.masses[i][j]),
          i,
          j,
        });
      }
    }

    const cellCounts: number[][] = table.xSupport.map(() =>
      table.ySupport.map(() => 0)
    );

    for (let s = 0; s < runCount; s++) {
      const u = prng.next();
      let acc = 0;
      let chosen = flatPairs[flatPairs.length - 1];

      for (const pair of flatPairs) {
        acc += pair.mass;
        if (u <= acc) {
          chosen = pair;
          break;
        }
      }

      cellCounts[chosen.i][chosen.j]++;

      if (s < 50) {
        samples.push({ x: chosen.x, y: chosen.y });
      }

      if (
        rectangleQuery &&
        chosen.x >= rectangleQuery.xMin &&
        chosen.x <= rectangleQuery.xMax &&
        chosen.y >= rectangleQuery.yMin &&
        chosen.y <= rectangleQuery.yMax
      ) {
        rectCount++;
      }
    }

    return {
      runCount,
      seed,
      samplesPreview: samples,
      empiricalRectangleProb: rectangleQuery ? rectCount / runCount : undefined,
      empiricalCellCounts: cellCounts,
    };
  }
}
