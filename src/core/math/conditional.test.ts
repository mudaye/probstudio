import { describe, it, expect } from 'vitest';
import { createRational, rationalToDecimalString } from './rational';
import {
  calculateConditionalProbability,
  calculateBayesRule,
  BayesInputPartition,
} from './conditional';

describe('A-004 Golden Vectors - CAL-COND-001 and CAL-COND-002', () => {
  it('CAL-COND-001: calculates simple conditional probability P(A|B) = P(A ∩ B) / P(B)', () => {
    const pIntersection = createRational(1n, 4n);
    const pB = createRational(1n, 2n);
    const res = calculateConditionalProbability(pIntersection, pB);

    expect(res.status).toBe('valid');
    expect(res.precision).toBe('exact');
    expect(res.value?.num).toBe(1n);
    expect(res.value?.den).toBe(2n);
    expect(res.display_value).toBe('1/2');
  });

  it('CAL-COND-001: returns undefined with E-COND-ZERO when conditioning probability is 0', () => {
    const pIntersection = createRational(0n, 1n);
    const pB = createRational(0n, 1n);
    const res = calculateConditionalProbability(pIntersection, pB);

    expect(res.status).toBe('undefined');
    expect(res.error_code).toBe('E-COND-ZERO');
    expect(res.value).toBeNull();
  });

  it('CAL-COND-002: verifies PL-02 default medical diagnostic test golden vector (prevalence 0.01, sensitivity 0.99, specificity 0.95)', () => {
    // Disease present (D): prior = 1/100, sensitivity P(T+ | D) = 99/100
    // Disease absent (D^c): prior = 99/100, false positive P(T+ | D^c) = 1 - 95/100 = 5/100
    const partition: BayesInputPartition[] = [
      {
        name: 'Disease Present (D)',
        prior: createRational(1n, 100n), // 0.01
        likelihood: createRational(99n, 100n), // 0.99
      },
      {
        name: 'Disease Absent (D^c)',
        prior: createRational(99n, 100n), // 0.99
        likelihood: createRational(5n, 100n), // 0.05
      },
    ];

    const result = calculateBayesRule(partition, 0); // Target: D given T+

    // 1. Evidence total probability P(T+) = 0.01 * 0.99 + 0.99 * 0.05 = 0.0099 + 0.0495 = 0.0594
    expect(result.evidenceTotalProbability.status).toBe('valid');
    expect(result.evidenceTotalProbability.value?.num).toBe(297n);
    expect(result.evidenceTotalProbability.value?.den).toBe(5000n);
    expect(rationalToDecimalString(result.evidenceTotalProbability.value!, 4)).toBe('0.0594');

    // 2. Posterior probability P(D | T+) = 0.0099 / 0.0594 = 99/594 = 1/6 exactly!
    expect(result.posteriorProbability.status).toBe('valid');
    expect(result.posteriorProbability.precision).toBe('exact');
    expect(result.posteriorProbability.value?.num).toBe(1n);
    expect(result.posteriorProbability.value?.den).toBe(6n);
    expect(result.posteriorProbability.display_value).toBe('1/6');
    expect(result.posteriorProbability.latex_value).toBe('\\frac{1}{6}');
  });
});
