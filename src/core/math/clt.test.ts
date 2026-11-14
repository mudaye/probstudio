import { describe, it, expect } from 'vitest';
import {
  simulateClt,
  computeDiscreteSumPmf,
  getBaseDistributionMoments,
  standardNormalPdf,
} from './clt';

describe('CLT & Sums of IID Variables Computation (CAL-CLT-001, CAL-CLT-002)', () => {
  it('computes exact base distribution moments correctly', () => {
    // Uniform [0, 1]
    const u = getBaseDistributionMoments({ type: 'uniform', uniformA: 0, uniformB: 1 });
    expect(u.mean).toBeCloseTo(0.5);
    expect(u.variance).toBeCloseTo(1 / 12);

    // Exponential lambda = 2
    const exp = getBaseDistributionMoments({ type: 'exponential', expLambda: 2 });
    expect(exp.mean).toBeCloseTo(0.5);
    expect(exp.variance).toBeCloseTo(0.25);

    // Bernoulli p = 0.5
    const b = getBaseDistributionMoments({ type: 'bernoulli', bernoulliP: 0.5 });
    expect(b.mean).toBeCloseTo(0.5);
    expect(b.variance).toBeCloseTo(0.25);

    // Fair Die
    const die = getBaseDistributionMoments({ type: 'die' });
    expect(die.mean).toBeCloseTo(3.5);
    expect(die.variance).toBeCloseTo(35 / 12);
  });

  it('evaluates standard normal density phi(0) = 1/sqrt(2*pi)', () => {
    const phi0 = standardNormalPdf(0);
    expect(phi0).toBeCloseTo(0.39894228, 5);
  });

  it('performs discrete PMF convolution for Bernoulli sum (Binomial)', () => {
    const base = [
      { x: 0, p: 0.5 },
      { x: 1, p: 0.5 },
    ];
    // n = 2: sum in {0, 1, 2} with probs {0.25, 0.5, 0.25}
    const res = computeDiscreteSumPmf(base, 2);
    expect(res.status).toBe('valid');
    expect(res.value).toBeDefined();
    const pmf = res.value!;
    expect(pmf).toHaveLength(3);
    expect(pmf[0]).toEqual({ x: 0, p: 0.25 });
    expect(pmf[1]).toEqual({ x: 1, p: 0.5 });
    expect(pmf[2]).toEqual({ x: 2, p: 0.25 });
  });

  it('runs deterministic CLT Monte Carlo simulation and validates convergence moments', () => {
    const sim = simulateClt(
      { type: 'uniform', uniformA: 0, uniformB: 1 },
      12, // n = 12 uniform sum has Var(S_12) = 12 * (1/12) = 1
      1000,
      12345
    );

    expect(sim.status).toBe('valid');
    expect(sim.value).toBeDefined();
    const val = sim.value!;

    // Theoretical sum moments
    expect(val.moments.sumMean).toBeCloseTo(6);
    expect(val.moments.sumVariance).toBeCloseTo(1);

    // Standardized sum moments should be close to 0 and 1
    expect(val.empiricalMeanZ).toBeCloseTo(0, 1);
    expect(val.empiricalVarianceZ).toBeGreaterThan(0.85);
    expect(val.empiricalVarianceZ).toBeLessThan(1.15);

    // Check histogram structure
    expect(val.bins.length).toBe(24);
    const totalCount = val.bins.reduce((acc, b) => acc + b.count, 0);
    expect(totalCount).toBe(1000);
  });

  it('enforces normative error codes on invalid CLT inputs', () => {
    // E-PARAM-DOMAIN for invalid sample size n = 0
    const errN = simulateClt({ type: 'uniform' }, 0, 500);
    expect(errN.status).toBe('invalid_configuration');
    expect(errN.error_code).toBe('E-PARAM-DOMAIN');

    // E-RUN-COUNT for trial count < 10
    const errTrials = simulateClt({ type: 'uniform' }, 5, 2);
    expect(errTrials.status).toBe('invalid_configuration');
    expect(errTrials.error_code).toBe('E-RUN-COUNT');

    // E-BOUNDS-ORDER for uniform a >= b
    const errBounds = simulateClt({ type: 'uniform', uniformA: 5, uniformB: 2 }, 5, 500);
    expect(errBounds.status).toBe('invalid_configuration');
    expect(errBounds.error_code).toBe('E-BOUNDS-ORDER');

    // E-PROB-RANGE for Bernoulli p outside (0, 1)
    const errBern = simulateClt({ type: 'bernoulli', bernoulliP: 1.5 }, 5, 500);
    expect(errBern.status).toBe('invalid_configuration');
    expect(errBern.error_code).toBe('E-PROB-RANGE');
  });
});
