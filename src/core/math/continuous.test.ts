import { describe, it, expect } from 'vitest';
import {
  createUniform,
  createExponential,
  createGaussian,
  evaluatePdf,
  evaluateContinuousCdf,
  calculateContinuousIntervalProbability,
  getContinuousMoments,
  standardNormalCdf,
  simulateContinuousDistribution,
} from './continuous';

describe('Deterministic Continuous Distribution Engine: CAL-CONT-001 - 004', () => {
  describe('CAL-CONT-001: Uniform Distribution', () => {
    it('creates valid Uniform(0, 1) and evaluates PDF and CDF', () => {
      const res = createUniform(0, 1);
      expect(res.status).toBe('valid');
      expect(res.value).toBeDefined();

      const dist = res.value!;
      // PDF
      expect(evaluatePdf(dist, 0.5)).toBe(1.0);
      expect(evaluatePdf(dist, -0.1)).toBe(0.0);
      expect(evaluatePdf(dist, 1.2)).toBe(0.0);

      // CDF
      expect(evaluateContinuousCdf(dist, -0.5)).toBe(0.0);
      expect(evaluateContinuousCdf(dist, 0.5)).toBe(0.5);
      expect(evaluateContinuousCdf(dist, 1.5)).toBe(1.0);
    });

    it('validates Uniform domain a < b with E-BOUNDS-ORDER', () => {
      const resEqual = createUniform(2, 2);
      expect(resEqual.status).toBe('invalid_configuration');
      expect(resEqual.error_code).toBe('E-BOUNDS-ORDER');

      const resReversed = createUniform(3, 1);
      expect(resReversed.status).toBe('invalid_configuration');
      expect(resReversed.error_code).toBe('E-BOUNDS-ORDER');
    });

    it('calculates theoretical moments for Uniform(2, 6)', () => {
      const dist = createUniform(2, 6).value!;
      const moments = getContinuousMoments(dist);
      // Mean = (2 + 6)/2 = 4
      expect(moments.mean).toBe(4.0);
      // Variance = (6 - 2)^2 / 12 = 16 / 12 = 4/3 ≈ 1.3333
      expect(moments.variance).toBeCloseTo(4 / 3, 4);
    });
  });

  describe('CAL-CONT-002: Exponential Distribution', () => {
    it('creates valid Exponential(2) and evaluates PDF and CDF', () => {
      const res = createExponential(2);
      expect(res.status).toBe('valid');

      const dist = res.value!;
      // f(0) = 2 * e^0 = 2.0
      expect(evaluatePdf(dist, 0)).toBe(2.0);
      // f(1) = 2 * e^(-2) ≈ 0.27067
      expect(evaluatePdf(dist, 1)).toBeCloseTo(2 * Math.exp(-2), 5);
      // f(-1) = 0
      expect(evaluatePdf(dist, -1)).toBe(0.0);

      // CDF: F(0) = 0, F(1) = 1 - e^(-2) ≈ 0.86466
      expect(evaluateContinuousCdf(dist, 0)).toBe(0.0);
      expect(evaluateContinuousCdf(dist, 1)).toBeCloseTo(1 - Math.exp(-2), 5);
    });

    it('enforces strictly positive rate λ > 0 with E-PARAM-DOMAIN', () => {
      const resZero = createExponential(0);
      expect(resZero.status).toBe('invalid_configuration');
      expect(resZero.error_code).toBe('E-PARAM-DOMAIN');

      const resNeg = createExponential(-1.5);
      expect(resNeg.status).toBe('invalid_configuration');
      expect(resNeg.error_code).toBe('E-PARAM-DOMAIN');
    });

    it('calculates theoretical moments for Exponential(λ = 0.5)', () => {
      const dist = createExponential(0.5).value!;
      const moments = getContinuousMoments(dist);
      // Mean = 1 / 0.5 = 2
      expect(moments.mean).toBe(2.0);
      // Variance = 1 / 0.5^2 = 4
      expect(moments.variance).toBe(4.0);
    });
  });

  describe('CAL-CONT-003: Gaussian (Normal) Distribution', () => {
    it('evaluates Standard Normal density and CDF symmetry', () => {
      const res = createGaussian(0, 1);
      expect(res.status).toBe('valid');

      const dist = res.value!;
      // Bell curve peak at μ = 0: 1 / sqrt(2*pi) ≈ 0.398942
      expect(evaluatePdf(dist, 0)).toBeCloseTo(1.0 / Math.sqrt(2 * Math.PI), 5);

      // Φ(0) = 0.5
      expect(standardNormalCdf(0)).toBeCloseTo(0.5, 5);
      expect(evaluateContinuousCdf(dist, 0)).toBeCloseTo(0.5, 5);

      // Φ(1.96) ≈ 0.9750
      expect(standardNormalCdf(1.96)).toBeCloseTo(0.975, 3);
      // Φ(-1.96) ≈ 0.0250 (symmetry)
      expect(standardNormalCdf(-1.96)).toBeCloseTo(0.025, 3);
    });

    it('enforces strictly positive standard deviation σ > 0 with E-PARAM-DOMAIN', () => {
      const resZero = createGaussian(0, 0);
      expect(resZero.status).toBe('invalid_configuration');
      expect(resZero.error_code).toBe('E-PARAM-DOMAIN');

      const resNeg = createGaussian(5, -2);
      expect(resNeg.status).toBe('invalid_configuration');
      expect(resNeg.error_code).toBe('E-PARAM-DOMAIN');
    });

    it('calculates theoretical moments for Gaussian(μ = 10, σ = 3)', () => {
      const dist = createGaussian(10, 3).value!;
      const moments = getContinuousMoments(dist);
      expect(moments.mean).toBe(10);
      expect(moments.variance).toBe(9);
      expect(moments.stdDev).toBe(3);
    });
  });

  describe('CAL-CONT-004: Continuous Interval Probability & Endpoint Invariance', () => {
    it('evaluates interval probability and documents endpoint equivalence', () => {
      const dist = createUniform(0, 10).value!;
      const res = calculateContinuousIntervalProbability(dist, 2, 5);

      expect(res.status).toBe('valid');
      expect(res.value?.probability).toBeCloseTo(0.3, 5); // (5 - 2)/10 = 0.3
      expect(res.value?.endpointNote).toContain('P(a ≤ X ≤ b) = P(a < X < b)');
    });

    it('detects inverted bounds with E-BOUNDS-ORDER', () => {
      const dist = createUniform(0, 1).value!;
      const res = calculateContinuousIntervalProbability(dist, 0.8, 0.2);

      expect(res.status).toBe('invalid_configuration');
      expect(res.error_code).toBe('E-BOUNDS-ORDER');
    });
  });

  describe('Deterministic Continuous Simulation (PRNG Reproducibility)', () => {
    it('produces identical empirical results for identical seeds', () => {
      const dist = createGaussian(0, 1).value!;
      const sim1 = simulateContinuousDistribution(dist, 500, 42);
      const sim2 = simulateContinuousDistribution(dist, 500, 42);

      expect(sim1.status).toBe('valid');
      expect(sim2.status).toBe('valid');
      expect(sim1.value?.empiricalMean).toBe(sim2.value?.empiricalMean);
      expect(sim1.value?.samplesPreview).toEqual(sim2.value?.samplesPreview);
    });

    it('converges toward theoretical mean for larger sample sizes', () => {
      // Exponential(λ = 2): theoretical mean = 0.5
      const dist = createExponential(2).value!;
      const sim = simulateContinuousDistribution(dist, 5000, 777);

      expect(sim.status).toBe('valid');
      expect(sim.value?.empiricalMean).toBeGreaterThan(0.45);
      expect(sim.value?.empiricalMean).toBeLessThan(0.55);
    });
  });
});
