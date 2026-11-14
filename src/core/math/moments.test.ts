import { describe, it, expect } from 'vitest';
import {
  getSourceMoments,
  calculateTransformedMoments,
  calculateMarkovBound,
  calculateChebyshevBound,
  calculateJensenBound,
  simulateMoments,
} from './moments';

describe('Deterministic Moments & Transformations Engine (A-004 compliance)', () => {
  describe('CAL-MOM-001 & CAL-MOM-002: Theoretical Moments', () => {
    it('computes exact moments for Bernoulli(0.5)', () => {
      const res = getSourceMoments({ type: 'bernoulli', p: 0.5 });
      expect(res.status).toBe('valid');
      expect(res.value?.mean).toBe(0.5);
      expect(res.value?.variance).toBe(0.25);
      expect(res.value?.sd).toBe(0.5);
      expect(res.value?.eX2).toBe(0.5);
      expect(res.value?.isNonNegative).toBe(true);
    });

    it('computes exact moments for Binomial(10, 0.4)', () => {
      const res = getSourceMoments({ type: 'binomial', n: 10, p: 0.4 });
      expect(res.status).toBe('valid');
      expect(res.value?.mean).toBeCloseTo(4.0);
      expect(res.value?.variance).toBeCloseTo(2.4);
      expect(res.value?.eX2).toBeCloseTo(2.4 + 16.0);
    });

    it('computes exact moments for Geometric(0.25) with transcript support k >= 1', () => {
      const res = getSourceMoments({ type: 'geometric', p: 0.25 });
      expect(res.status).toBe('valid');
      expect(res.value?.mean).toBe(4.0); // 1 / p
      expect(res.value?.variance).toBe(12.0); // (1 - p) / p^2 = 0.75 / 0.0625 = 12
    });

    it('computes moments for Uniform(2, 8)', () => {
      const res = getSourceMoments({ type: 'uniform', a: 2, b: 8 });
      expect(res.status).toBe('valid');
      expect(res.value?.mean).toBe(5.0);
      expect(res.value?.variance).toBeCloseTo(36 / 12); // (8-2)^2 / 12 = 3.0
      expect(res.value?.isNonNegative).toBe(true);
    });

    it('computes moments for Exponential(lambda = 2)', () => {
      const res = getSourceMoments({ type: 'exponential', lambda: 2 });
      expect(res.status).toBe('valid');
      expect(res.value?.mean).toBe(0.5);
      expect(res.value?.variance).toBe(0.25);
      expect(res.value?.eX2).toBe(0.5);
    });

    it('computes moments for Gaussian(mu = 5, sigma = 2)', () => {
      const res = getSourceMoments({ type: 'gaussian', mu: 5, sigma: 2 });
      expect(res.status).toBe('valid');
      expect(res.value?.mean).toBe(5.0);
      expect(res.value?.variance).toBe(4.0);
      expect(res.value?.isNonNegative).toBe(false);
    });

    it('enforces parameter domain constraints with stable error codes', () => {
      const negP = getSourceMoments({ type: 'bernoulli', p: -0.1 });
      expect(negP.status).toBe('invalid_configuration');
      expect(negP.error_code).toBe('E-PARAM-DOMAIN');

      const invUniform = getSourceMoments({ type: 'uniform', a: 5, b: 2 });
      expect(invUniform.status).toBe('invalid_configuration');
      expect(invUniform.error_code).toBe('E-BOUNDS-ORDER');

      const negSigma = getSourceMoments({ type: 'gaussian', mu: 0, sigma: -1 });
      expect(negSigma.status).toBe('invalid_configuration');
      expect(negSigma.error_code).toBe('E-PARAM-DOMAIN');
    });
  });

  describe('CAL-TRANS-001: Transformations of Random Variables', () => {
    it('computes affine transformation moments E[3X + 4] and Var(3X + 4)', () => {
      const res = calculateTransformedMoments(
        { type: 'bernoulli', p: 0.5 },
        { type: 'affine', affineA: 3, affineB: 4 }
      );
      expect(res.status).toBe('valid');
      // E[3X + 4] = 3(0.5) + 4 = 5.5
      expect(res.value?.transformedMoments.mean).toBe(5.5);
      // Var(3X + 4) = 3^2 * Var(X) = 9 * 0.25 = 2.25
      expect(res.value?.transformedMoments.variance).toBe(2.25);
      expect(res.value?.transformedMoments.sd).toBe(1.5);
    });

    it('computes square transformation Y = X^2 for Uniform(0, 2)', () => {
      const res = calculateTransformedMoments(
        { type: 'uniform', a: 0, b: 2 },
        { type: 'square' }
      );
      expect(res.status).toBe('valid');
      // For Uniform(0, 2): E[X] = 1, Var(X) = 4/12 = 1/3.
      // E[Y] = E[X^2] = Var(X) + (E[X])^2 = 1/3 + 1 = 4/3.
      expect(res.value?.transformedMoments.mean).toBeCloseTo(4 / 3);
      // E[X^4] = (2^5 - 0) / (5*2) = 32 / 10 = 3.2.
      // Var(Y) = 3.2 - (4/3)^2 = 3.2 - 1.7777... = 1.4222...
      expect(res.value?.transformedMoments.variance).toBeCloseTo(3.2 - (16 / 9));
    });
  });

  describe('CAL-INEQ-001: Markov Inequality', () => {
    it('verifies P(X >= a) <= E[X] / a for Exponential(lambda = 1)', () => {
      // E[X] = 1. Let a = 2. Markov bound = 1 / 2 = 0.5.
      // True P(X >= 2) = e^-2 ≈ 0.1353 <= 0.5.
      const res = calculateMarkovBound({ type: 'exponential', lambda: 1 }, 2);
      expect(res.status).toBe('valid');
      expect(res.value?.isPreconditionSatisfied).toBe(true);
      expect(res.value?.markovBound).toBe(0.5);
      expect(res.value?.trueProbability).toBeCloseTo(Math.exp(-2));
      expect(res.value?.boundSatisfied).toBe(true);
    });

    it('rejects Gaussian distributions due to negative support precondition', () => {
      const res = calculateMarkovBound({ type: 'gaussian', mu: 2, sigma: 1 }, 1);
      expect(res.status).toBe('invalid_configuration');
      expect(res.error_code).toBe('E-PARAM-DOMAIN');
      expect(res.message).toContain('Markov inequality requires a non-negative random variable');
    });

    it('rejects non-positive threshold a <= 0', () => {
      const res = calculateMarkovBound({ type: 'exponential', lambda: 1 }, 0);
      expect(res.status).toBe('invalid_configuration');
      expect(res.error_code).toBe('E-PARAM-DOMAIN');
    });
  });

  describe('CAL-INEQ-002: Chebyshev Inequality', () => {
    it('verifies P(|X - mu| >= k*sigma) <= 1/k^2 for Gaussian(0, 1)', () => {
      // mu = 0, sigma = 1. Let threshold a = 2 (k = 2).
      // Chebyshev bound = 1 / 2^2 = 0.25.
      // True P(|X| >= 2) ≈ 0.0455 <= 0.25.
      const res = calculateChebyshevBound({ type: 'gaussian', mu: 0, sigma: 1 }, 2);
      expect(res.status).toBe('valid');
      expect(res.value?.chebyshevBound).toBe(0.25);
      expect(res.value?.kStandardDeviations).toBe(2);
      expect(res.value?.trueProbability).toBeLessThan(0.05);
      expect(res.value?.boundSatisfied).toBe(true);
    });

    it('verifies Chebyshev for Uniform(0, 10)', () => {
      // mu = 5, Var = 100/12 = 8.333. a = 4.
      // Chebyshev bound = 8.333 / 16 ≈ 0.5208.
      // True P(|X - 5| >= 4) = P(X <= 1 or X >= 9) = 0.1 + 0.1 = 0.2 <= 0.5208.
      const res = calculateChebyshevBound({ type: 'uniform', a: 0, b: 10 }, 4);
      expect(res.status).toBe('valid');
      expect(res.value?.chebyshevBound).toBeCloseTo(8.3333 / 16, 3);
      expect(res.value?.trueProbability).toBeCloseTo(0.2, 3);
      expect(res.value?.boundSatisfied).toBe(true);
    });
  });

  describe('CAL-INEQ-003: Jensen Inequality', () => {
    it('verifies E[X^2] >= (E[X])^2 with gap equal to Var(X)', () => {
      const res = calculateJensenBound({ type: 'uniform', a: 0, b: 6 }, 'square');
      expect(res.status).toBe('valid');
      // E[X] = 3, phi(E[X]) = 9.
      // Var(X) = 36 / 12 = 3. E[X^2] = 9 + 3 = 12.
      // Gap = 12 - 9 = 3 = Var(X).
      expect(res.value?.phiOfExpectation).toBe(9);
      expect(res.value?.expectationOfPhi).toBe(12);
      expect(res.value?.jensenGap).toBe(3);
      expect(res.value?.boundSatisfied).toBe(true);
    });

    it('verifies E[e^X] >= e^(E[X]) for Gaussian(0, 1)', () => {
      const res = calculateJensenBound({ type: 'gaussian', mu: 0, sigma: 1 }, 'exponential');
      expect(res.status).toBe('valid');
      // phi(E[X]) = e^0 = 1.
      // E[e^X] = exp(0 + 1/2) = e^0.5 ≈ 1.6487.
      // Gap > 0.
      expect(res.value?.phiOfExpectation).toBe(1);
      expect(res.value?.expectationOfPhi).toBeCloseTo(Math.exp(0.5));
      expect(res.value?.jensenGap).toBeGreaterThan(0);
      expect(res.value?.boundSatisfied).toBe(true);
    });
  });

  describe('Simulation & Empirical Estimation (CAL-SIM-001 / M15)', () => {
    it('reproduces empirical sample moments deterministically with a fixed seed', () => {
      const sim1 = simulateMoments(
        { type: 'uniform', a: 0, b: 10 },
        { type: 'affine', affineA: 2, affineB: 1 },
        1000,
        12345,
        7,
        3
      );
      const sim2 = simulateMoments(
        { type: 'uniform', a: 0, b: 10 },
        { type: 'affine', affineA: 2, affineB: 1 },
        1000,
        12345,
        7,
        3
      );

      expect(sim1.empiricalMeanX).toBe(sim2.empiricalMeanX);
      expect(sim1.empiricalMeanY).toBe(sim2.empiricalMeanY);
      expect(sim1.empiricalVarY).toBe(sim2.empiricalVarY);
      expect(sim1.empiricalMarkovProb).toBe(sim2.empiricalMarkovProb);

      // Verify convergence toward theoretical: E[X] = 5, E[Y] = 11
      expect(sim1.empiricalMeanX).toBeGreaterThan(4.7);
      expect(sim1.empiricalMeanX).toBeLessThan(5.3);
      expect(sim1.empiricalMeanY).toBeGreaterThan(10.4);
      expect(sim1.empiricalMeanY).toBeLessThan(11.6);
    });
  });
});
