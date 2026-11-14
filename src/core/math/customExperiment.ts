/**
 * Custom Finite Probability Experiment Engine
 * Conforms to A-004 v0.2, A-003 v0.4 §1.2 & §5, and A-005 v0.2.
 */

import {
  Rational,
  createRational,
  addRationals,
  subtractRationals,
  multiplyRationals,
  divideRationals,
  isRationalZero,
  compareRationals,
  rationalToDecimal,
  rationalToString,
  rationalToLatex,
  parseRational,
} from './rational';
import { CalculationResult } from './types';
import { CALCULATION_ENGINE_VERSION } from './events';

export interface CustomOutcomeInput {
  name: string;
  massStr: string;
}

export interface CustomRandomVariableInput {
  name: string; // e.g. "X"
  mapping: Record<string, string>; // outcomeName -> value string
}

export interface CustomPmfPoint {
  val: Rational;
  valDecimal: number;
  valLatex: string;
  mass: Rational;
  massDecimal: number;
  massLatex: string;
}

export interface CustomCdfStep {
  x: Rational;
  xDecimal: number;
  fx: Rational;
  fxDecimal: number;
}

export interface CustomExperimentAnalysis {
  isValid: boolean;
  errorCode?: import('./types').ErrorCode;
  errorMessage?: string;
  sampleSpaceTotalMass: Rational;
  isNormalized: boolean;
  repairEligible: boolean;
  repairedMassesPreview?: { outcome: string; oldMass: Rational; newMass: Rational }[];

  // Induced RV analysis (if RV defined)
  inducedPmf?: CustomPmfPoint[];
  cdfSteps?: CustomCdfStep[];
  expectation?: {
    rational: Rational;
    decimal: number;
    latex: string;
  };
  variance?: {
    rational: Rational;
    decimal: number;
    latex: string;
  };
  stdDev?: number;

  // Event calculations
  eventAProb?: Rational;
  eventBProb?: Rational;
  intersectionProb?: Rational;
  unionProb?: Rational;
  conditionalAGivenB?: {
    defined: boolean;
    rational?: Rational;
    latex?: string;
    errorCode?: import('./types').ErrorCode;
  };
}

/**
 * Validates, checks normalization repair eligibility, and analyzes a custom finite probability space.
 */
export function analyzeCustomExperiment(
  outcomes: readonly CustomOutcomeInput[],
  activeRv?: CustomRandomVariableInput,
  eventAOutcomes?: readonly string[],
  eventBOutcomes?: readonly string[]
): CalculationResult<CustomExperimentAnalysis> {
  if (outcomes.length === 0) {
    return {
      calculation_id: 'CAL-CUSTOM-EXP-001',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-NONFINITE-INPUT',
      message: 'Sample space must have at least one outcome.',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Check unique outcome names
  const outcomeNames = new Set<string>();
  for (const o of outcomes) {
    const trimmed = o.name.trim();
    if (!trimmed) {
      return {
        calculation_id: 'CAL-CUSTOM-EXP-001',
        status: 'invalid_configuration',
        precision: 'exact',
        value: null,
        error_code: 'E-NONFINITE-INPUT',
        message: 'Outcome names cannot be empty.',
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
    }
    if (outcomeNames.has(trimmed)) {
      return {
        calculation_id: 'CAL-CUSTOM-EXP-001',
        status: 'invalid_configuration',
        precision: 'exact',
        value: null,
        error_code: 'E-SUPPORT-DUPLICATE',
        message: `Duplicate outcome name "${trimmed}" detected in sample space.`,
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
    }
    outcomeNames.add(trimmed);
  }

  // Parse masses
  const parsedMasses: { name: string; mass: Rational }[] = [];
  let sumMass = createRational(0n, 1n);
  let hasNegative = false;

  for (const o of outcomes) {
    const r = parseRational(o.massStr);
    if (!r) {
      return {
        calculation_id: 'CAL-CUSTOM-EXP-001',
        status: 'invalid_configuration',
        precision: 'exact',
        value: null,
        error_code: 'E-NONFINITE-INPUT',
        message: `Mass for outcome "${o.name}" ("${o.massStr}") is not a valid fraction or decimal.`,
        calculation_engine_version: CALCULATION_ENGINE_VERSION,
      };
    }
    if (r.num < 0n) {
      hasNegative = true;
    }
    parsedMasses.push({ name: o.name.trim(), mass: r });
    sumMass = addRationals(sumMass, r);
  }

  if (hasNegative) {
    return {
      calculation_id: 'CAL-CUSTOM-EXP-001',
      status: 'invalid_configuration',
      precision: 'exact',
      value: {
        isValid: false,
        errorCode: 'E-PROB-RANGE',
        errorMessage: 'Probabilities must be non-negative.',
        sampleSpaceTotalMass: sumMass,
        isNormalized: false,
        repairEligible: false,
      },
      error_code: 'E-PROB-RANGE',
      message: 'Probability masses cannot be negative.',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  const isNormalized = compareRationals(sumMass, createRational(1n, 1n)) === 0;
  const isZeroSum = isRationalZero(sumMass);
  const repairEligible = !isNormalized && !hasNegative && !isZeroSum && sumMass.num > 0n;

  // Prepare repair preview if eligible
  let repairedMassesPreview: { outcome: string; oldMass: Rational; newMass: Rational }[] | undefined;
  if (repairEligible) {
    repairedMassesPreview = parsedMasses.map((p) => {
      const newMass = divideRationals(p.mass, sumMass);
      return {
        outcome: p.name,
        oldMass: p.mass,
        newMass,
      };
    });
  }

  // If not normalized, return partial analysis showing repair option
  if (!isNormalized) {
    return {
      calculation_id: 'CAL-CUSTOM-EXP-001',
      status: 'invalid_configuration',
      precision: 'exact',
      value: {
        isValid: false,
        errorCode: 'E-PROB-SUM',
        errorMessage: `Total probability mass sums to ${rationalToString(sumMass)} (not 1).`,
        sampleSpaceTotalMass: sumMass,
        isNormalized: false,
        repairEligible,
        repairedMassesPreview,
      },
      error_code: 'E-PROB-SUM',
      message: `Total probability mass sums to ${rationalToString(sumMass)} (not 1).`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Mass map for fast lookup
  const massMap = new Map<string, Rational>();
  for (const p of parsedMasses) {
    massMap.set(p.name, p.mass);
  }

  // Induced Random Variable (CAL-RV-001, CAL-CDF-001, CAL-MOM-001, CAL-MOM-002)
  let inducedPmf: CustomPmfPoint[] | undefined;
  let cdfSteps: CustomCdfStep[] | undefined;
  let expectation: { rational: Rational; decimal: number; latex: string } | undefined;
  let variance: { rational: Rational; decimal: number; latex: string } | undefined;
  let stdDev: number | undefined;

  if (activeRv && activeRv.mapping) {
    const valMap = new Map<string, { val: Rational; mass: Rational }>();

    for (const [outcomeName, mass] of massMap.entries()) {
      const rawValStr = activeRv.mapping[outcomeName];
      if (rawValStr === undefined || rawValStr.trim() === '') {
        return {
          calculation_id: 'CAL-CUSTOM-EXP-001',
          status: 'invalid_configuration',
          precision: 'exact',
          value: null,
          error_code: 'E-MAPPING-INCOMPLETE',
          message: `Mapping for outcome "${outcomeName}" is missing in random variable ${activeRv.name}.`,
          calculation_engine_version: CALCULATION_ENGINE_VERSION,
        };
      }
      const parsedVal = parseRational(rawValStr);
      if (!parsedVal) {
        return {
          calculation_id: 'CAL-CUSTOM-EXP-001',
          status: 'invalid_configuration',
          precision: 'exact',
          value: null,
          error_code: 'E-NONFINITE-INPUT',
          message: `Mapping value "${rawValStr}" for outcome "${outcomeName}" is not a valid number or fraction.`,
          calculation_engine_version: CALCULATION_ENGINE_VERSION,
        };
      }

      // Group by distinct image value
      const key = rationalToString(parsedVal);
      const existing = valMap.get(key);
      if (existing) {
        valMap.set(key, { val: parsedVal, mass: addRationals(existing.mass, mass) });
      } else {
        valMap.set(key, { val: parsedVal, mass });
      }
    }

    const pmfList = Array.from(valMap.values()).sort((a, b) => compareRationals(a.val, b.val));
    inducedPmf = pmfList.map((pt) => ({
      val: pt.val,
      valDecimal: rationalToDecimal(pt.val),
      valLatex: rationalToLatex(pt.val),
      mass: pt.mass,
      massDecimal: rationalToDecimal(pt.mass),
      massLatex: rationalToLatex(pt.mass),
    }));

    // CDF Steps
    let accum = createRational(0n, 1n);
    cdfSteps = [];
    for (const pt of inducedPmf) {
      accum = addRationals(accum, pt.mass);
      cdfSteps.push({
        x: pt.val,
        xDecimal: rationalToDecimal(pt.val),
        fx: accum,
        fxDecimal: rationalToDecimal(accum),
      });
    }

    // Moments
    let expVal = createRational(0n, 1n);
    let expValSq = createRational(0n, 1n);
    for (const pt of inducedPmf) {
      const term1 = multiplyRationals(pt.val, pt.mass);
      expVal = addRationals(expVal, term1);

      const valSq = multiplyRationals(pt.val, pt.val);
      const term2 = multiplyRationals(valSq, pt.mass);
      expValSq = addRationals(expValSq, term2);
    }

    const expValSquared = multiplyRationals(expVal, expVal);
    const varVal = subtractRationals(expValSq, expValSquared);
    const varDec = Math.max(0, rationalToDecimal(varVal));

    expectation = {
      rational: expVal,
      decimal: rationalToDecimal(expVal),
      latex: rationalToLatex(expVal),
    };
    variance = {
      rational: varVal,
      decimal: varDec,
      latex: rationalToLatex(varVal),
    };
    stdDev = Math.sqrt(varDec);
  }

  // Event Probabilities (CAL-EVENT-001, CAL-COND-001)
  let eventAProb: Rational | undefined;
  let eventBProb: Rational | undefined;
  let intersectionProb: Rational | undefined;
  let unionProb: Rational | undefined;
  let conditionalAGivenB:
    | {
        defined: boolean;
        rational?: Rational;
        latex?: string;
        errorCode?: import('./types').ErrorCode;
      }
    | undefined;

  if (eventAOutcomes && eventBOutcomes) {
    const setA = new Set(eventAOutcomes);
    const setB = new Set(eventBOutcomes);

    // Verify all outcomes in events belong to Ω
    for (const a of setA) {
      if (!massMap.has(a)) {
        return {
          calculation_id: 'CAL-CUSTOM-EXP-001',
          status: 'invalid_configuration',
          precision: 'exact',
          value: null,
          error_code: 'E-EVENT-OUTSIDE-SPACE',
          message: `Event A contains outcome "${a}" which is outside sample space Ω.`,
          calculation_engine_version: CALCULATION_ENGINE_VERSION,
        };
      }
    }
    for (const b of setB) {
      if (!massMap.has(b)) {
        return {
          calculation_id: 'CAL-CUSTOM-EXP-001',
          status: 'invalid_configuration',
          precision: 'exact',
          value: null,
          error_code: 'E-EVENT-OUTSIDE-SPACE',
          message: `Event B contains outcome "${b}" which is outside sample space Ω.`,
          calculation_engine_version: CALCULATION_ENGINE_VERSION,
        };
      }
    }

    let pA = createRational(0n, 1n);
    let pB = createRational(0n, 1n);
    let pAB = createRational(0n, 1n);
    let pUnion = createRational(0n, 1n);

    for (const [name, mass] of massMap.entries()) {
      const inA = setA.has(name);
      const inB = setB.has(name);

      if (inA) pA = addRationals(pA, mass);
      if (inB) pB = addRationals(pB, mass);
      if (inA && inB) pAB = addRationals(pAB, mass);
      if (inA || inB) pUnion = addRationals(pUnion, mass);
    }

    eventAProb = pA;
    eventBProb = pB;
    intersectionProb = pAB;
    unionProb = pUnion;

    // Conditioning check (CAL-COND-001 & E-COND-ZERO)
    if (isRationalZero(pB)) {
      conditionalAGivenB = {
        defined: false,
        errorCode: 'E-COND-ZERO',
      };
    } else {
      const condProb = divideRationals(pAB, pB);
      conditionalAGivenB = {
        defined: true,
        rational: condProb,
        latex: rationalToLatex(condProb),
      };
    }
  }

  return {
    calculation_id: 'CAL-CUSTOM-EXP-001',
    status: 'valid',
    precision: 'exact',
    value: {
      isValid: true,
      sampleSpaceTotalMass: sumMass,
      isNormalized: true,
      repairEligible: false,
      inducedPmf,
      cdfSteps,
      expectation,
      variance,
      stdDev,
      eventAProb,
      eventBProb,
      intersectionProb,
      unionProb,
      conditionalAGivenB,
    },
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}
