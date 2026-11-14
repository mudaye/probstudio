/**
 * Unified Reproducible PRNG Simulation Engine
 * Conforms to A-004 v0.2 §5.2 and A-003 v0.4 shared simulation contract
 */

import { Rational, rationalToDecimal } from './rational';
import { CalculationResult } from './types';
import { CALCULATION_ENGINE_VERSION } from './events';

/**
 * Seedable Mulberry32 32-bit PRNG
 * Produces deterministic pseudo-random numbers in [0, 1).
 */
export class DeterministicPRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

export interface FiniteExperimentSimulationResult {
  readonly sampleCount: number;
  readonly seed: number;
  readonly outcomeCounts: Readonly<Record<string, number>>;
  readonly outcomeFrequencies: Readonly<Record<string, number>>;
  readonly samplesPreview: readonly string[];
}

/**
 * Deterministically simulates N trials on a finite discrete sample space with given outcome masses.
 */
export function simulateFiniteExperiment(
  outcomes: readonly string[],
  masses: readonly Rational[],
  sampleCount: number,
  seed = 42
): CalculationResult<FiniteExperimentSimulationResult> {
  if (outcomes.length === 0 || outcomes.length !== masses.length) {
    return {
      calculation_id: 'CAL-EVENT-001',
      status: 'invalid_configuration',
      precision: 'empirical',
      value: null,
      error_code: 'E-NONFINITE-INPUT',
      message: 'Outcomes and masses arrays must be non-empty and of identical length.',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  if (!Number.isInteger(sampleCount) || sampleCount < 1 || sampleCount > 100000) {
    return {
      calculation_id: 'CAL-EVENT-001',
      status: 'invalid_configuration',
      precision: 'empirical',
      value: null,
      error_code: 'E-RUN-COUNT',
      message: `Sample count N=${sampleCount} must be an integer between 1 and 100,000.`,
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  if (!Number.isFinite(seed)) {
    return {
      calculation_id: 'CAL-EVENT-001',
      status: 'invalid_configuration',
      precision: 'empirical',
      value: null,
      error_code: 'E-SEED-FORMAT',
      message: 'Seed must be a valid finite number.',
      calculation_engine_version: CALCULATION_ENGINE_VERSION,
    };
  }

  // Pre-calculate cumulative cutoffs in [0, 1]
  const cumulativeCutoffs: number[] = [];
  let cum = 0;
  for (let i = 0; i < masses.length; i++) {
    cum += rationalToDecimal(masses[i]);
    cumulativeCutoffs.push(cum);
  }

  const rng = new DeterministicPRNG(seed);
  const counts: Record<string, number> = {};
  for (const o of outcomes) {
    counts[o] = 0;
  }
  const samplesPreview: string[] = [];

  for (let i = 0; i < sampleCount; i++) {
    const u = rng.next();
    let selectedIndex = outcomes.length - 1;
    for (let j = 0; j < cumulativeCutoffs.length; j++) {
      if (u <= cumulativeCutoffs[j]) {
        selectedIndex = j;
        break;
      }
    }
    const outcome = outcomes[selectedIndex];
    counts[outcome] = (counts[outcome] || 0) + 1;

    if (i < 20) {
      samplesPreview.push(outcome);
    }
  }

  const frequencies: Record<string, number> = {};
  for (const o of outcomes) {
    frequencies[o] = counts[o] / sampleCount;
  }

  return {
    calculation_id: 'CAL-EVENT-001',
    status: 'valid',
    precision: 'empirical',
    value: {
      sampleCount,
      seed,
      outcomeCounts: counts,
      outcomeFrequencies: frequencies,
      samplesPreview,
    },
    display_value: `Simulated N=${sampleCount}, seed=${seed}`,
    calculation_engine_version: CALCULATION_ENGINE_VERSION,
  };
}

/**
 * Calculates the empirical frequency of an event (set of outcomes) from simulation results.
 */
export function calculateEmpiricalEventFrequency(
  sim: FiniteExperimentSimulationResult,
  eventOutcomes: readonly string[]
): number {
  let count = 0;
  for (const outcome of eventOutcomes) {
    count += sim.outcomeCounts[outcome] || 0;
  }
  return count / sim.sampleCount;
}
