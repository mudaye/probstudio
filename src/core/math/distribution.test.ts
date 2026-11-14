import { describe, it, expect } from 'vitest';
import { createRational } from './rational';
import {
  createDiscreteDistribution,
  evaluateCdf,
  calculateIntervalProbability,
} from './distribution';

describe('Deterministic Discrete Distribution Engine: CAL-PMF-001, CAL-CDF-001, CAL-CDF-002', () => {
  // A-004 §5.1 Golden Vector: support {0, 1, 2}, masses (0.25, 0.50, 0.25)
  const q1 = createRational(1n, 4n); // 0.25
  const q2 = createRational(1n, 2n); // 0.50
  const q3 = createRational(1n, 4n); // 0.25

  const rawSupport = [
    { x: 0, mass: q1 },
    { x: 1, mass: q2 },
    { x: 2, mass: q3 },
  ];

  it('creates valid discrete distribution and verifies CDF values at support (A-004 §5.1)', () => {
    const res = createDiscreteDistribution(rawSupport);
    expect(res.status).toBe('valid');
    expect(res.value).toBeDefined();

    const dist = res.value!;
    expect(dist.points.length).toBe(3);

    // x = 0
    expect(dist.points[0].x).toBe(0);
    expect(dist.points[0].leftLimit).toEqual(createRational(0n, 1n));
    expect(dist.points[0].cdfValue).toEqual(createRational(1n, 4n)); // 0.25
    expect(dist.points[0].jumpSize).toEqual(createRational(1n, 4n));

    // x = 1
    expect(dist.points[1].x).toBe(1);
    expect(dist.points[1].leftLimit).toEqual(createRational(1n, 4n));
    expect(dist.points[1].cdfValue).toEqual(createRational(3n, 4n)); // 0.75
    expect(dist.points[1].jumpSize).toEqual(createRational(1n, 2n)); // 0.50

    // x = 2
    expect(dist.points[2].x).toBe(2);
    expect(dist.points[2].leftLimit).toEqual(createRational(3n, 4n));
    expect(dist.points[2].cdfValue).toEqual(createRational(1n, 1n)); // 1.00
    expect(dist.points[2].jumpSize).toEqual(createRational(1n, 4n));
  });

  it('evaluates CDF at arbitrary points across domains and plateaus', () => {
    const dist = createDiscreteDistribution(rawSupport).value!;

    // x < 0: F(x) = 0
    expect(evaluateCdf(dist, -1).cdfValue).toEqual(createRational(0n, 1n));
    expect(evaluateCdf(dist, -0.001).cdfValue).toEqual(createRational(0n, 1n));

    // At x = 0: F(0) = 0.25
    expect(evaluateCdf(dist, 0).cdfValue).toEqual(createRational(1n, 4n));

    // 0 < x < 1 (plateau at 0.25): F(0.5) = 0.25
    expect(evaluateCdf(dist, 0.5).cdfValue).toEqual(createRational(1n, 4n));

    // At x = 1: F(1) = 0.75
    expect(evaluateCdf(dist, 1).cdfValue).toEqual(createRational(3n, 4n));

    // 1 < x < 2 (plateau at 0.75): F(1.8) = 0.75
    expect(evaluateCdf(dist, 1.8).cdfValue).toEqual(createRational(3n, 4n));

    // At x = 2: F(2) = 1.0
    expect(evaluateCdf(dist, 2).cdfValue).toEqual(createRational(1n, 1n));

    // x > 2: F(x) = 1.0
    expect(evaluateCdf(dist, 5).cdfValue).toEqual(createRational(1n, 1n));
  });

  it('evaluates PL-05 endpoint vector on support {0, 1, 2}, masses (0.25, 0.50, 0.25) (A-004 §5.1)', () => {
    const dist = createDiscreteDistribution(rawSupport).value!;

    // P([0, 1]) = 0.75
    const resClosed = calculateIntervalProbability(dist, 0, 1, true, true);
    expect(resClosed.status).toBe('valid');
    expect(resClosed.value?.probability).toEqual(createRational(3n, 4n)); // 0.75
    expect(resClosed.value?.includedPoints).toEqual([0, 1]);

    // P((0, 1]) = 0.50
    const resHalfOpenRight = calculateIntervalProbability(dist, 0, 1, false, true);
    expect(resHalfOpenRight.status).toBe('valid');
    expect(resHalfOpenRight.value?.probability).toEqual(createRational(1n, 2n)); // 0.50
    expect(resHalfOpenRight.value?.includedPoints).toEqual([1]);

    // P([0, 1)) = 0.25
    const resHalfOpenLeft = calculateIntervalProbability(dist, 0, 1, true, false);
    expect(resHalfOpenLeft.status).toBe('valid');
    expect(resHalfOpenLeft.value?.probability).toEqual(createRational(1n, 4n)); // 0.25
    expect(resHalfOpenLeft.value?.includedPoints).toEqual([0]);

    // P((0, 1)) = 0 with zero returned valid
    const resOpen = calculateIntervalProbability(dist, 0, 1, false, false);
    expect(resOpen.status).toBe('valid');
    expect(resOpen.value?.probability).toEqual(createRational(0n, 1n)); // 0.00
    expect(resOpen.value?.includedPoints).toEqual([]);
  });

  it('rejects reversed bounds (a > b) with E-BOUNDS-ORDER', () => {
    const dist = createDiscreteDistribution(rawSupport).value!;
    const res = calculateIntervalProbability(dist, 2, 1, true, true);
    expect(res.status).toBe('invalid_configuration');
    expect(res.error_code).toBe('E-BOUNDS-ORDER');
    expect(res.message).toContain('cannot exceed upper bound');
  });

  it('rejects duplicate support points with E-SUPPORT-DUPLICATE', () => {
    const badSupport = [
      { x: 1, mass: q1 },
      { x: 1, mass: q2 },
      { x: 2, mass: q3 },
    ];
    const res = createDiscreteDistribution(badSupport);
    expect(res.status).toBe('invalid_configuration');
    expect(res.error_code).toBe('E-SUPPORT-DUPLICATE');
  });

  it('rejects masses not summing to 1 with E-PROB-SUM', () => {
    const badSupport = [
      { x: 0, mass: createRational(1n, 3n) },
      { x: 1, mass: createRational(1n, 3n) },
    ];
    const res = createDiscreteDistribution(badSupport);
    expect(res.status).toBe('invalid_configuration');
    expect(res.error_code).toBe('E-PROB-SUM');
  });
});
