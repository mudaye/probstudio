/**
 * Deterministic Operations: CAL-RV-001
 * Conforms to A-004 v0.2 §5.1 and Shared Contracts v0.2
 */

import {
  Rational,
  createRational,
  addRational,
  compareRational,
} from './rational';
import {
  FiniteSampleSpace,
  CalculationResult,
} from './types';
import { CALCULATION_ENGINE_VERSION } from './events';

export interface PmfPoint {
  readonly value: number;
  readonly label: string;
  readonly mass: Rational;
  readonly preimages: readonly string[];
}

export interface InducedDistributionResult {
  readonly distinctValues: readonly number[];
  readonly pmf: readonly PmfPoint[];
  readonly totalMass: Rational;
  readonly isComplete: boolean;
}

/**
 * CAL-RV-001: For each image value x, P(X = x) = sum_{omega: X(omega) = x} p(omega)
 * Preconditions: Every outcome in the sample space must have a valid finite numerical mapping.
 * Missing or non-finite mappings return invalid_configuration with E-MAPPING-INCOMPLETE.
 */
export function calculateInducedDistribution(
  space: FiniteSampleSpace,
  mapping: Record<string, number | string | null | undefined>
): CalculationResult<InducedDistributionResult> {
  const zero = createRational(0n);
  const one = createRational(1n);

  // Validate mapping completeness
  const missingOutcomes: string[] = [];
  const parsedMapping: Map<string, number> = new Map();

  for (const outcome of space.outcomes) {
    const rawVal = mapping[outcome];
    if (rawVal === undefined || rawVal === null || rawVal === '') {
      missingOutcomes.push(outcome);
      continue;
    }

    const numVal = typeof rawVal === 'number' ? rawVal : Number(rawVal);
    if (!Number.isFinite(numVal)) {
      missingOutcomes.push(outcome);
      continue;
    }

    parsedMapping.set(outcome, numVal);
  }

  if (missingOutcomes.length > 0) {
    return {
      calculation_id: 'CAL-RV-001',
      status: 'invalid_configuration',
      precision: 'exact',
      value: null,
      error_code: 'E-MAPPING-INCOMPLETE',
      message: `Mapping is incomplete or non-finite for outcome(s): ${missingOutcomes.join(', ')}.`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Aggregate probabilities by distinct mapped value x
  const groupedPreimages = new Map<number, string[]>();
  const groupedMasses = new Map<number, Rational>();

  for (let i = 0; i < space.outcomes.length; i++) {
    const outcome = space.outcomes[i];
    const mass = space.masses[i];
    const val = parsedMapping.get(outcome)!;

    if (!groupedPreimages.has(val)) {
      groupedPreimages.set(val, []);
      groupedMasses.set(val, zero);
    }

    groupedPreimages.get(val)!.push(outcome);
    groupedMasses.set(val, addRational(groupedMasses.get(val)!, mass));
  }

  // Sort distinct values in ascending order
  const distinctValues = Array.from(groupedMasses.keys()).sort((a, b) => a - b);

  let totalMass = zero;
  const pmf: PmfPoint[] = [];

  for (const val of distinctValues) {
    const mass = groupedMasses.get(val)!;
    totalMass = addRational(totalMass, mass);
    pmf.push({
      value: val,
      label: val.toString(),
      mass,
      preimages: groupedPreimages.get(val)!,
    });
  }

  const isNormalized = compareRational(totalMass, one) === 0;

  const result: InducedDistributionResult = {
    distinctValues,
    pmf,
    totalMass,
    isComplete: isNormalized,
  };

  return {
    calculation_id: 'CAL-RV-001',
    status: 'valid',
    precision: 'exact',
    value: result,
    display_value: `${distinctValues.length} distinct values`,
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}
