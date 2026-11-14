import { describe, it, expect } from 'vitest';
import { createRational } from './rational';
import {
  DeterministicPRNG,
  simulateFiniteExperiment,
  calculateEmpiricalEventFrequency,
} from './simulation';

describe('Unified Reproducible PRNG Simulation Engine', () => {
  const q4 = createRational(1n, 4n);
  const outcomes = ['HH', 'HT', 'TH', 'TT'];
  const masses = [q4, q4, q4, q4];

  it('guarantees exact reproducibility with fixed seed (Mulberry32)', () => {
    const sim1 = simulateFiniteExperiment(outcomes, masses, 500, 12345);
    const sim2 = simulateFiniteExperiment(outcomes, masses, 500, 12345);

    expect(sim1.status).toBe('valid');
    expect(sim2.status).toBe('valid');
    expect(sim1.value?.outcomeCounts).toEqual(sim2.value?.outcomeCounts);
    expect(sim1.value?.outcomeFrequencies).toEqual(sim2.value?.outcomeFrequencies);
    expect(sim1.value?.samplesPreview).toEqual(sim2.value?.samplesPreview);
  });

  it('produces different sequences for distinct seeds', () => {
    const simA = simulateFiniteExperiment(outcomes, masses, 200, 111);
    const simB = simulateFiniteExperiment(outcomes, masses, 200, 999);

    expect(simA.value?.samplesPreview).not.toEqual(simB.value?.samplesPreview);
  });

  it('evaluates empirical event frequency consistent with theoretical probability', () => {
    // Event A = {HH, HT} with P(A) = 0.5
    const sim = simulateFiniteExperiment(outcomes, masses, 5000, 42).value!;
    const empFreq = calculateEmpiricalEventFrequency(sim, ['HH', 'HT']);

    expect(empFreq).toBeGreaterThan(0.47);
    expect(empFreq).toBeLessThan(0.53);
  });

  it('validates input boundaries with E-RUN-COUNT and E-SEED-FORMAT', () => {
    const badCount = simulateFiniteExperiment(outcomes, masses, 0);
    expect(badCount.status).toBe('invalid_configuration');
    expect(badCount.error_code).toBe('E-RUN-COUNT');

    const badSeed = simulateFiniteExperiment(outcomes, masses, 100, NaN);
    expect(badSeed.status).toBe('invalid_configuration');
    expect(badSeed.error_code).toBe('E-SEED-FORMAT');
  });

  it('verifies PRNG sequence uniformity directly', () => {
    const rng = new DeterministicPRNG(1);
    const n = 1000;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const u = rng.next();
      expect(u).toBeGreaterThanOrEqual(0);
      expect(u).toBeLessThan(1);
      sum += u;
    }
    const mean = sum / n;
    expect(mean).toBeGreaterThan(0.46);
    expect(mean).toBeLessThan(0.54);
  });
});
