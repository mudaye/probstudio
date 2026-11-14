import { describe, it, expect } from 'vitest';
import { createRational, parseRational } from './rational';
import {
  calculateEventProbability,
  calculateEventOperation,
  validateSampleSpace,
} from './events';
import { FiniteSampleSpace } from './types';

describe('A-004 Golden Vectors - CAL-EVENT-001 and CAL-EVENT-002', () => {
  // Setup: PL-01 Two fair coin tosses Omega = {HH, HT, TH, TT}, each mass 1/4
  const quarter = createRational(1n, 4n);
  const twoTossSpace: FiniteSampleSpace = {
    outcomes: ['HH', 'HT', 'TH', 'TT'],
    masses: [quarter, quarter, quarter, quarter],
  };

  const eventA = ['HH', 'HT'];
  const eventB = ['HH', 'TH'];

  it('parses rational strings correctly', () => {
    const r1 = parseRational('1/4');
    expect(r1?.num).toBe(1n);
    expect(r1?.den).toBe(4n);
    const r2 = parseRational('0.25');
    expect(r2?.num).toBe(1n);
    expect(r2?.den).toBe(4n);
  });

  it('validates the fair two-toss sample space', () => {
    const val = validateSampleSpace(twoTossSpace);
    expect(val.valid).toBe(true);
  });

  it('calculates P(A) = 1/2 exactly', () => {
    const resA = calculateEventProbability(twoTossSpace, eventA);
    expect(resA.status).toBe('valid');
    expect(resA.precision).toBe('exact');
    expect(resA.value?.num).toBe(1n);
    expect(resA.value?.den).toBe(2n);
    expect(resA.display_value).toBe('1/2');
    expect(resA.latex_value).toBe('\\frac{1}{2}');
  });

  it('calculates P(B) = 1/2 exactly', () => {
    const resB = calculateEventProbability(twoTossSpace, eventB);
    expect(resB.status).toBe('valid');
    expect(resB.value?.num).toBe(1n);
    expect(resB.value?.den).toBe(2n);
  });

  it('calculates P(A ∩ B) = 1/4 exactly (Intersection)', () => {
    const res = calculateEventOperation(twoTossSpace, eventA, eventB, 'intersection');
    expect(res.resultEvent).toEqual(['HH']);
    expect(res.probabilityResult.status).toBe('valid');
    expect(res.probabilityResult.value?.num).toBe(1n);
    expect(res.probabilityResult.value?.den).toBe(4n);
  });

  it('calculates P(A ∪ B) = 3/4 exactly (Union)', () => {
    const res = calculateEventOperation(twoTossSpace, eventA, eventB, 'union');
    expect(res.resultEvent).toEqual(['HH', 'HT', 'TH']);
    expect(res.probabilityResult.status).toBe('valid');
    expect(res.probabilityResult.value?.num).toBe(3n);
    expect(res.probabilityResult.value?.den).toBe(4n);
  });

  it('calculates P(A^c) = 1/2 exactly (Complement relative to Omega)', () => {
    const res = calculateEventOperation(twoTossSpace, eventA, eventB, 'complement');
    expect(res.resultEvent).toEqual(['TH', 'TT']);
    expect(res.probabilityResult.status).toBe('valid');
    expect(res.probabilityResult.value?.num).toBe(1n);
    expect(res.probabilityResult.value?.den).toBe(2n);
  });

  it('calculates P(A \\ B) = 1/4 exactly (Difference)', () => {
    const res = calculateEventOperation(twoTossSpace, eventA, eventB, 'difference');
    expect(res.resultEvent).toEqual(['HT']);
    expect(res.probabilityResult.status).toBe('valid');
    expect(res.probabilityResult.value?.num).toBe(1n);
    expect(res.probabilityResult.value?.den).toBe(4n);
  });

  it('handles empty event correctly with valid zero', () => {
    const res = calculateEventProbability(twoTossSpace, []);
    expect(res.status).toBe('valid');
    expect(res.value?.num).toBe(0n);
    expect(res.value?.den).toBe(1n);
  });

  it('rejects invalid sample space when masses sum != 1 with E-PROB-SUM', () => {
    const invalidSpace: FiniteSampleSpace = {
      outcomes: ['HH', 'HT'],
      masses: [quarter, quarter], // sum is 1/2
    };
    const res = calculateEventProbability(invalidSpace, ['HH']);
    expect(res.status).toBe('invalid_configuration');
    expect(res.error_code).toBe('E-PROB-SUM');
  });

  it('rejects event with outcome outside sample space with E-EVENT-OUTSIDE-SPACE', () => {
    const res = calculateEventProbability(twoTossSpace, ['HH', 'XX']);
    expect(res.status).toBe('invalid_configuration');
    expect(res.error_code).toBe('E-EVENT-OUTSIDE-SPACE');
  });
});
