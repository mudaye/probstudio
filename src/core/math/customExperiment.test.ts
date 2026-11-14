import { describe, it, expect } from 'vitest';
import { analyzeCustomExperiment } from './customExperiment';
import { rationalToString } from './rational';

describe('Custom Probability Experiment Engine (CAL-CUSTOM-EXP-001)', () => {
  it('correctly validates and analyzes a normalized finite space', () => {
    const outcomes = [
      { name: 'w1', massStr: '1/4' },
      { name: 'w2', massStr: '1/4' },
      { name: 'w3', massStr: '1/2' },
    ];
    const rv = {
      name: 'X',
      mapping: {
        w1: '10',
        w2: '10', // fibers aggregate: X=10 has mass 1/4 + 1/4 = 1/2
        w3: '20', // X=20 has mass 1/2
      },
    };

    const res = analyzeCustomExperiment(outcomes, rv, ['w1'], ['w1', 'w2']);
    expect(res.status).toBe('valid');
    expect(res.value).toBeDefined();
    const val = res.value!;

    expect(val.isNormalized).toBe(true);
    expect(val.inducedPmf).toHaveLength(2);
    expect(val.inducedPmf![0].valLatex).toBe('10');
    expect(rationalToString(val.inducedPmf![0].mass)).toBe('1/2');
    expect(val.inducedPmf![1].valLatex).toBe('20');
    expect(rationalToString(val.inducedPmf![1].mass)).toBe('1/2');

    // Moments: E[X] = 10*(1/2) + 20*(1/2) = 15
    expect(val.expectation?.decimal).toBe(15);
    // Var(X) = E[X^2] - (E[X])^2 = (100*0.5 + 400*0.5) - 225 = 250 - 225 = 25
    expect(val.variance?.decimal).toBe(25);
    expect(val.stdDev).toBe(5);

    // Events: A={w1}, B={w1, w2}
    // P(A) = 1/4, P(B) = 1/2, P(A n B) = 1/4
    // P(A|B) = (1/4)/(1/2) = 1/2
    expect(rationalToString(val.eventAProb!)).toBe('1/4');
    expect(rationalToString(val.eventBProb!)).toBe('1/2');
    expect(val.conditionalAGivenB?.defined).toBe(true);
    expect(rationalToString(val.conditionalAGivenB!.rational!)).toBe('1/2');
  });

  it('detects unnormalized masses and offers exact rational repair preview', () => {
    // Total mass 1/2 + 1/2 + 1 = 2 (not 1)
    const outcomes = [
      { name: 'A', massStr: '1/2' },
      { name: 'B', massStr: '1/2' },
      { name: 'C', massStr: '1' },
    ];
    const res = analyzeCustomExperiment(outcomes);
    expect(res.status).toBe('invalid_configuration');
    expect(res.error_code).toBe('E-PROB-SUM');
    expect(res.value?.repairEligible).toBe(true);
    expect(res.value?.repairedMassesPreview).toBeDefined();

    const preview = res.value!.repairedMassesPreview!;
    expect(preview).toHaveLength(3);
    // Division by total 2: 1/2 -> 1/4, 1/2 -> 1/4, 1 -> 1/2
    expect(rationalToString(preview[0].newMass)).toBe('1/4');
    expect(rationalToString(preview[1].newMass)).toBe('1/4');
    expect(rationalToString(preview[2].newMass)).toBe('1/2');
  });

  it('safeguards against conditioning on zero probability event with E-COND-ZERO', () => {
    const outcomes = [
      { name: 'H', massStr: '1' },
      { name: 'T', massStr: '0' },
    ];
    // Event A = {H}, Event B = {T} (P(B) = 0)
    const res = analyzeCustomExperiment(outcomes, undefined, ['H'], ['T']);
    expect(res.status).toBe('valid');
    const val = res.value!;
    expect(val.conditionalAGivenB?.defined).toBe(false);
    expect(val.conditionalAGivenB?.errorCode).toBe('E-COND-ZERO');
  });

  it('rejects duplicate outcome names with E-SUPPORT-DUPLICATE', () => {
    const outcomes = [
      { name: 'dup', massStr: '1/2' },
      { name: 'dup', massStr: '1/2' },
    ];
    const res = analyzeCustomExperiment(outcomes);
    expect(res.status).toBe('invalid_configuration');
    expect(res.error_code).toBe('E-SUPPORT-DUPLICATE');
  });

  it('marks negative masses as ineligible for repair with E-PROB-RANGE', () => {
    const outcomes = [
      { name: 'w1', massStr: '-1/2' },
      { name: 'w2', massStr: '3/2' },
    ];
    const res = analyzeCustomExperiment(outcomes);
    expect(res.status).toBe('invalid_configuration');
    expect(res.error_code).toBe('E-PROB-RANGE');
    expect(res.value?.repairEligible).toBe(false);
  });
});
