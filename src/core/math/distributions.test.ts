import { describe, it, expect } from 'vitest';
import { createRational } from './rational';
import {
  createBernoulli,
  createBinomial,
  createGeometric,
  createPoisson,
  calculateBernoulliPmf,
  calculateBinomialPmf,
  calculateGeometricPmf,
  calculatePoissonPmf,
  calculateBernoulliCdf,
  calculateBinomialCdf,
  calculateGeometricCdf,
  calculatePoissonCdf,
  getDistributionMoments,
  getDistributionDisplayTable,
  simulateDistribution,
} from './distributions';

describe('Deterministic Parameterized Distribution Engine (CAL-DIST-001 - 004)', () => {
  describe('CAL-DIST-001: Bernoulli Distribution', () => {
    it('evaluates PL-06 golden vector Bernoulli(p=0.5): masses (0.5, 0.5) (A-004 §5.1)', () => {
      const p = createRational(1n, 2n);
      const res = createBernoulli(p);
      expect(res.status).toBe('valid');
      expect(res.precision).toBe('exact');

      const dist = res.value!;
      const pmf0 = calculateBernoulliPmf(dist, 0);
      const pmf1 = calculateBernoulliPmf(dist, 1);

      expect(pmf0.status).toBe('valid');
      expect(pmf0.value).toEqual(createRational(1n, 2n));
      expect(pmf1.status).toBe('valid');
      expect(pmf1.value).toEqual(createRational(1n, 2n));
    });

    it('returns valid 0 for out-of-support queries on Bernoulli', () => {
      const dist = createBernoulli(createRational(1n, 2n)).value!;
      const pmfNeg = calculateBernoulliPmf(dist, -1);
      const pmfTwo = calculateBernoulliPmf(dist, 2);

      expect(pmfNeg.status).toBe('valid');
      expect(pmfNeg.value).toEqual(createRational(0n, 1n));
      expect(pmfTwo.status).toBe('valid');
      expect(pmfTwo.value).toEqual(createRational(0n, 1n));
    });

    it('validates Bernoulli domain p in [0, 1] with E-PARAM-DOMAIN', () => {
      const invalidLow = createBernoulli(createRational(-1n, 2n));
      expect(invalidLow.status).toBe('invalid_configuration');
      expect(invalidLow.error_code).toBe('E-PARAM-DOMAIN');

      const invalidHigh = createBernoulli(createRational(3n, 2n));
      expect(invalidHigh.status).toBe('invalid_configuration');
      expect(invalidHigh.error_code).toBe('E-PARAM-DOMAIN');
    });

    it('calculates analytical CDF and moments for Bernoulli', () => {
      const dist = createBernoulli(createRational(3n, 10n)).value!; // p = 0.3
      expect(calculateBernoulliCdf(dist, -0.5).value).toEqual(createRational(0n, 1n));
      expect(calculateBernoulliCdf(dist, 0.5).value).toEqual(createRational(7n, 10n)); // 1-p = 0.7
      expect(calculateBernoulliCdf(dist, 1.5).value).toEqual(createRational(1n, 1n)); // 1.0

      const moments = getDistributionMoments(dist);
      expect(moments.exactMean).toEqual(createRational(3n, 10n));
      expect(moments.exactVariance).toEqual(createRational(21n, 100n)); // 0.3 * 0.7 = 0.21
    });
  });

  describe('CAL-DIST-002: Binomial Distribution', () => {
    it('computes exact rational PMF for Binomial(10, 1/2) at k=5', () => {
      const dist = createBinomial(10, createRational(1n, 2n)).value!;
      const pmf5 = calculateBinomialPmf(dist, 5);

      expect(pmf5.status).toBe('valid');
      expect(pmf5.precision).toBe('exact');
      // C(10, 5) * (1/2)^10 = 252 / 1024 = 63 / 256
      expect(pmf5.value).toEqual(createRational(63n, 256n));
    });

    it('returns valid 0 for out-of-support Binomial queries', () => {
      const dist = createBinomial(4, createRational(1n, 3n)).value!;
      expect(calculateBinomialPmf(dist, -1).value).toEqual(createRational(0n, 1n));
      expect(calculateBinomialPmf(dist, 5).value).toEqual(createRational(0n, 1n));
    });

    it('enforces scale ceiling policy n > 10000 with E-UNSUPPORTED-SCALE (A-004 §5.2)', () => {
      const res = createBinomial(15000, createRational(1n, 2n));
      expect(res.status).toBe('unsupported');
      expect(res.error_code).toBe('E-UNSUPPORTED-SCALE');
    });

    it('enforces non-negative integer domain for n', () => {
      const resNeg = createBinomial(-5, createRational(1n, 2n));
      expect(resNeg.status).toBe('invalid_configuration');
      expect(resNeg.error_code).toBe('E-PARAM-DOMAIN');

      const resFloat = createBinomial(4.5, createRational(1n, 2n));
      expect(resFloat.status).toBe('invalid_configuration');
      expect(resFloat.error_code).toBe('E-PARAM-DOMAIN');
    });

    it('calculates analytical CDF and moments for Binomial', () => {
      // Binomial(4, 1/2): mean = 2, var = 1
      const dist = createBinomial(4, createRational(1n, 2n)).value!;
      const moments = getDistributionMoments(dist);
      expect(moments.exactMean).toEqual(createRational(2n, 1n));
      expect(moments.exactVariance).toEqual(createRational(1n, 1n));

      // CDF at x = 0: P(X=0) = (1/2)^4 = 1/16
      expect(calculateBinomialCdf(dist, 0).value).toEqual(createRational(1n, 16n));
      // CDF at x >= 4: 1
      expect(calculateBinomialCdf(dist, 4).value).toEqual(createRational(1n, 1n));
    });
  });

  describe('CAL-DIST-004: Geometric Distribution (Support Starts at 1)', () => {
    it('evaluates PL-06 golden vector Geometric(p=0.5): support begins at 1 and P(X=1)=0.5 (A-004 §5.1)', () => {
      const dist = createGeometric(createRational(1n, 2n)).value!;

      // P(X=1) = 0.5
      const pmf1 = calculateGeometricPmf(dist, 1);
      expect(pmf1.status).toBe('valid');
      expect(pmf1.value).toEqual(createRational(1n, 2n));

      // P(X=0) = 0 because support begins at 1
      const pmf0 = calculateGeometricPmf(dist, 0);
      expect(pmf0.status).toBe('valid');
      expect(pmf0.value).toEqual(createRational(0n, 1n));

      // P(X=2) = (1-p)p = 1/4
      const pmf2 = calculateGeometricPmf(dist, 2);
      expect(pmf2.value).toEqual(createRational(1n, 4n));

      // P(X=3) = (1-p)^2 p = 1/8
      const pmf3 = calculateGeometricPmf(dist, 3);
      expect(pmf3.value).toEqual(createRational(1n, 8n));
    });

    it('enforces Geometric domain (0, 1] with E-PARAM-DOMAIN', () => {
      // p = 0 is invalid for Geometric (waiting time would be infinite)
      const resZero = createGeometric(createRational(0n, 1n));
      expect(resZero.status).toBe('invalid_configuration');
      expect(resZero.error_code).toBe('E-PARAM-DOMAIN');

      const resNegative = createGeometric(createRational(-1n, 4n));
      expect(resNegative.status).toBe('invalid_configuration');
      expect(resNegative.error_code).toBe('E-PARAM-DOMAIN');
    });

    it('calculates analytical CDF F(k) = 1 - (1-p)^k for Geometric', () => {
      const dist = createGeometric(createRational(1n, 2n)).value!;
      // x < 1 => F(x) = 0
      expect(calculateGeometricCdf(dist, 0.5).value).toEqual(createRational(0n, 1n));
      // F(1) = 1/2
      expect(calculateGeometricCdf(dist, 1).value).toEqual(createRational(1n, 2n));
      // F(2) = 1 - (1/2)^2 = 3/4
      expect(calculateGeometricCdf(dist, 2).value).toEqual(createRational(3n, 4n));
      // F(3) = 1 - (1/2)^3 = 7/8
      expect(calculateGeometricCdf(dist, 3).value).toEqual(createRational(7n, 8n));
    });

    it('computes moments E[X] = 1/p and Var(X) = (1-p)/p^2', () => {
      const dist = createGeometric(createRational(1n, 4n)).value!; // p = 1/4
      const moments = getDistributionMoments(dist);
      // E[X] = 4
      expect(moments.exactMean).toEqual(createRational(4n, 1n));
      // Var(X) = (3/4) / (1/16) = 12
      expect(moments.exactVariance).toEqual(createRational(12n, 1n));
    });

    it('reports omitted tail mass in display table (A-003 PL06-AC-05)', () => {
      const dist = createGeometric(createRational(1n, 2n)).value!;
      const table = getDistributionDisplayTable(dist, 20);

      expect(table.isTruncated).toBe(true);
      expect(table.omittedTailMass).toBeGreaterThan(0);
      expect(table.omittedTailMass).toBeLessThan(0.001);
      expect(table.tailBoundDescription).toBeDefined();
      expect(table.points[0].x).toBe(1); // Support begins at 1
    });
  });

  describe('CAL-DIST-003: Poisson Distribution', () => {
    it('verifies PL-06 golden vector Poisson probabilities marked approximate (A-004 §5.1)', () => {
      const res = createPoisson(3);
      expect(res.status).toBe('valid');
      expect(res.precision).toBe('approximate');

      const dist = res.value!;
      const pmf0 = calculatePoissonPmf(dist, 0);
      expect(pmf0.status).toBe('valid');
      expect(pmf0.precision).toBe('approximate');
      // e^(-3) ≈ 0.049787
      expect(pmf0.value).toBeCloseTo(Math.exp(-3), 5);

      const pmf1 = calculatePoissonPmf(dist, 1);
      // 3 * e^(-3) ≈ 0.149361
      expect(pmf1.value).toBeCloseTo(3 * Math.exp(-3), 5);
    });

    it('returns valid 0 for out-of-support Poisson queries', () => {
      const dist = createPoisson(2).value!;
      expect(calculatePoissonPmf(dist, -1).value).toBe(0);
    });

    it('enforces scale ceiling λ <= 1000 with E-UNSUPPORTED-SCALE', () => {
      const res = createPoisson(1500);
      expect(res.status).toBe('unsupported');
      expect(res.error_code).toBe('E-UNSUPPORTED-SCALE');
    });

    it('enforces non-negative domain for λ', () => {
      const res = createPoisson(-1);
      expect(res.status).toBe('invalid_configuration');
      expect(res.error_code).toBe('E-PARAM-DOMAIN');
    });

    it('computes moments E[X] = λ and Var(X) = λ', () => {
      const dist = createPoisson(4.5).value!;
      const moments = getDistributionMoments(dist);
      expect(moments.mean).toBe(4.5);
      expect(moments.variance).toBe(4.5);
    });

    it('calculates numerical CDF for Poisson', () => {
      const dist = createPoisson(1).value!;
      const cdf1 = calculatePoissonCdf(dist, 1);
      // F(1) = P(0) + P(1) = e^(-1) + e^(-1) = 2/e ≈ 0.735759
      expect(cdf1.value).toBeCloseTo(2 / Math.E, 5);
    });
  });

  describe('Deterministic Pseudorandom Simulation Engine (A-003 PL06-AC-04)', () => {
    it('produces identical empirical results for identical seeds (reproducibility)', () => {
      const dist = createBinomial(10, createRational(1n, 2n)).value!;
      const sim1 = simulateDistribution(dist, 500, 12345);
      const sim2 = simulateDistribution(dist, 500, 12345);

      expect(sim1.status).toBe('valid');
      expect(sim2.status).toBe('valid');
      expect(sim1.value?.frequencies).toEqual(sim2.value?.frequencies);
      expect(sim1.value?.empiricalMean).toBe(sim2.value?.empiricalMean);
      expect(sim1.value?.samplesPreview).toEqual(sim2.value?.samplesPreview);
    });

    it('produces different empirical results for different seeds', () => {
      const dist = createBinomial(10, createRational(1n, 2n)).value!;
      const sim1 = simulateDistribution(dist, 200, 100);
      const sim2 = simulateDistribution(dist, 200, 200);

      expect(sim1.value?.samplesPreview).not.toEqual(sim2.value?.samplesPreview);
    });

    it('converges toward theoretical mean for larger sample sizes', () => {
      // Geometric(p = 0.5): theoretical mean = 2
      const dist = createGeometric(createRational(1n, 2n)).value!;
      const sim = simulateDistribution(dist, 5000, 777);

      expect(sim.status).toBe('valid');
      expect(sim.value?.empiricalMean).toBeGreaterThan(1.85);
      expect(sim.value?.empiricalMean).toBeLessThan(2.15);
    });

    it('validates sample count and seed inputs with E-RUN-COUNT and E-SEED-FORMAT', () => {
      const dist = createBernoulli(createRational(1n, 2n)).value!;
      const resBadCount = simulateDistribution(dist, 0);
      expect(resBadCount.status).toBe('invalid_configuration');
      expect(resBadCount.error_code).toBe('E-RUN-COUNT');

      const resBadSeed = simulateDistribution(dist, 100, NaN);
      expect(resBadSeed.status).toBe('invalid_configuration');
      expect(resBadSeed.error_code).toBe('E-SEED-FORMAT');
    });
  });
});
