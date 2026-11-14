import { describe, it, expect } from 'vitest';
import { checkExactRationalAnswer } from './checker';
import { createRational } from '../math/rational';

describe('Assessment Checker - Prototype Rational Inputs', () => {
  const expected = createRational(1n, 2n);
  const explanation = 'P(A) = 1/4 + 1/4 = 1/2';

  it('accepts exact fraction "1/2"', () => {
    const res = checkExactRationalAnswer('1/2', expected, explanation);
    expect(res.status).toBe('correct');
    expect(res.parsedInput?.num).toBe(1n);
    expect(res.parsedInput?.den).toBe(2n);
  });

  it('accepts equivalent decimal "0.5"', () => {
    const res = checkExactRationalAnswer('0.5', expected, explanation);
    expect(res.status).toBe('correct');
    expect(res.parsedInput?.num).toBe(1n);
    expect(res.parsedInput?.den).toBe(2n);
  });

  it('accepts equivalent unreduced fraction "2/4"', () => {
    const res = checkExactRationalAnswer('2/4', expected, explanation);
    expect(res.status).toBe('correct');
  });

  it('marks incorrect answers as incorrect with deterministic feedback', () => {
    const res = checkExactRationalAnswer('1/4', expected, explanation);
    expect(res.status).toBe('incorrect');
    expect(res.message).toContain('expected probability is 1/2');
    expect(res.explanationLatex).toBe(explanation);
  });

  it('rejects probability outside [0, 1] as invalid_input', () => {
    const res = checkExactRationalAnswer('1.5', expected, explanation);
    expect(res.status).toBe('invalid_input');
    expect(res.message).toContain('outside the valid probability range [0, 1]');
  });

  it('rejects non-numeric gibberish as invalid_input', () => {
    const res = checkExactRationalAnswer('hello', expected, explanation);
    expect(res.status).toBe('invalid_input');
  });

  it('rejects empty input as invalid_input', () => {
    const res = checkExactRationalAnswer('', expected, explanation);
    expect(res.status).toBe('invalid_input');
  });

  describe('EX-000002: Complement Rule Evaluation', () => {
    const expComplement = createRational(97n, 100n);
    const explanationLatex = 'P(A^c) = 1 - 3/100 = 97/100';

    it('accepts fraction "97/100"', () => {
      const res = checkExactRationalAnswer('97/100', expComplement, explanationLatex);
      expect(res.status).toBe('correct');
      expect(res.parsedInput?.num).toBe(97n);
      expect(res.parsedInput?.den).toBe(100n);
    });

    it('accepts equivalent decimal "0.97"', () => {
      const res = checkExactRationalAnswer('0.97', expComplement, explanationLatex);
      expect(res.status).toBe('correct');
      expect(res.parsedInput?.num).toBe(97n);
      expect(res.parsedInput?.den).toBe(100n);
    });

    it('evaluates incorrect response "3/100" as incorrect', () => {
      const res = checkExactRationalAnswer('3/100', expComplement, explanationLatex);
      expect(res.status).toBe('incorrect');
    });
  });

  describe('EX-000003: Disjoint Event Union Evaluation', () => {
    const expUnion = createRational(2n, 3n);
    const explanationLatex = 'P(A ∪ B) = 2/6 + 2/6 = 4/6 = 2/3';

    it('accepts simplified rational "2/3"', () => {
      const res = checkExactRationalAnswer('2/3', expUnion, explanationLatex);
      expect(res.status).toBe('correct');
    });

    it('accepts unsimplified rational "4/6"', () => {
      const res = checkExactRationalAnswer('4/6', expUnion, explanationLatex);
      expect(res.status).toBe('correct');
    });

    it('evaluates incorrect response "1/6" as incorrect', () => {
      const res = checkExactRationalAnswer('1/6', expUnion, explanationLatex);
      expect(res.status).toBe('incorrect');
    });
  });

  describe('EX-000004: Diagnostic Screening Bayes Posterior Evaluation', () => {
    const expPosterior = createRational(1n, 6n);
    const explanationLatex = 'P(D | T^+) = 99 / 594 = 1/6';

    it('accepts simplified rational "1/6"', () => {
      const res = checkExactRationalAnswer('1/6', expPosterior, explanationLatex);
      expect(res.status).toBe('correct');
      expect(res.parsedInput?.num).toBe(1n);
      expect(res.parsedInput?.den).toBe(6n);
    });

    it('accepts unsimplified rational "99/594"', () => {
      const res = checkExactRationalAnswer('99/594', expPosterior, explanationLatex);
      expect(res.status).toBe('correct');
    });

    it('accepts unsimplified rational "594/3564"', () => {
      const res = checkExactRationalAnswer('594/3564', expPosterior, explanationLatex);
      expect(res.status).toBe('correct');
    });

    it('evaluates incorrect response "0.99" (sensitivity mistake) as incorrect', () => {
      const res = checkExactRationalAnswer('0.99', expPosterior, explanationLatex);
      expect(res.status).toBe('incorrect');
      expect(res.message).toContain('expected probability is 1/6');
    });
  });

  describe('EX-000005: Independent Event Product Evaluation', () => {
    const expJoint = createRational(1n, 4n);
    const explanationLatex = 'P(A ∩ B) = 1/2 * 1/2 = 1/4';

    it('accepts fraction "1/4"', () => {
      const res = checkExactRationalAnswer('1/4', expJoint, explanationLatex);
      expect(res.status).toBe('correct');
      expect(res.parsedInput?.num).toBe(1n);
      expect(res.parsedInput?.den).toBe(4n);
    });

    it('accepts equivalent decimal "0.25"', () => {
      const res = checkExactRationalAnswer('0.25', expJoint, explanationLatex);
      expect(res.status).toBe('correct');
    });

    it('evaluates incorrect response "1/2" as incorrect', () => {
      const res = checkExactRationalAnswer('1/2', expJoint, explanationLatex);
      expect(res.status).toBe('incorrect');
    });
  });

  describe('EX-000006: Conditional Invariance Under Independence Evaluation', () => {
    const expCond = createRational(1n, 5n);
    const explanationLatex = 'P(F1 | F2) = P(F1) = 1/5 = 0.20';

    it('accepts fraction "1/5"', () => {
      const res = checkExactRationalAnswer('1/5', expCond, explanationLatex);
      expect(res.status).toBe('correct');
      expect(res.parsedInput?.num).toBe(1n);
      expect(res.parsedInput?.den).toBe(5n);
    });

    it('accepts equivalent decimal "0.2"', () => {
      const res = checkExactRationalAnswer('0.2', expCond, explanationLatex);
      expect(res.status).toBe('correct');
    });

    it('evaluates incorrect response "1/4" as incorrect', () => {
      const res = checkExactRationalAnswer('1/4', expCond, explanationLatex);
      expect(res.status).toBe('incorrect');
    });
  });

  describe('EX-000007: Induced PMF Evaluation', () => {
    const expHeads = createRational(3n, 8n);
    const explanationLatex = 'P(X = 2) = 3/8 = 0.375';

    it('accepts fraction "3/8"', () => {
      const res = checkExactRationalAnswer('3/8', expHeads, explanationLatex);
      expect(res.status).toBe('correct');
      expect(res.parsedInput?.num).toBe(3n);
      expect(res.parsedInput?.den).toBe(8n);
    });

    it('accepts equivalent decimal "0.375"', () => {
      const res = checkExactRationalAnswer('0.375', expHeads, explanationLatex);
      expect(res.status).toBe('correct');
    });

    it('evaluates incorrect response "1/8" as incorrect', () => {
      const res = checkExactRationalAnswer('1/8', expHeads, explanationLatex);
      expect(res.status).toBe('incorrect');
    });
  });

  describe('EX-000008: Non-Negative Payoff Probability Evaluation', () => {
    const expPayoff = createRational(3n, 4n);
    const explanationLatex = 'P(Y ≥ 0) = 3/4 = 0.75';

    it('accepts fraction "3/4"', () => {
      const res = checkExactRationalAnswer('3/4', expPayoff, explanationLatex);
      expect(res.status).toBe('correct');
      expect(res.parsedInput?.num).toBe(3n);
      expect(res.parsedInput?.den).toBe(4n);
    });

    it('accepts equivalent decimal "0.75"', () => {
      const res = checkExactRationalAnswer('0.75', expPayoff, explanationLatex);
      expect(res.status).toBe('correct');
    });

    it('evaluates incorrect response "1/2" as incorrect', () => {
      const res = checkExactRationalAnswer('1/2', expPayoff, explanationLatex);
      expect(res.status).toBe('incorrect');
    });
  });

  describe('EX-000009: Interval Probability Evaluation', () => {
    const expInterval = createRational(3n, 4n);
    const explanationLatex = 'P(0 < X ≤ 2) = F(2) - F(0) = 1 - 1/4 = 3/4 = 0.75';

    it('accepts fraction "3/4"', () => {
      const res = checkExactRationalAnswer('3/4', expInterval, explanationLatex);
      expect(res.status).toBe('correct');
      expect(res.parsedInput?.num).toBe(3n);
      expect(res.parsedInput?.den).toBe(4n);
    });

    it('accepts equivalent decimal "0.75"', () => {
      const res = checkExactRationalAnswer('0.75', expInterval, explanationLatex);
      expect(res.status).toBe('correct');
    });

    it('evaluates incorrect response "1/4" as incorrect', () => {
      const res = checkExactRationalAnswer('1/4', expInterval, explanationLatex);
      expect(res.status).toBe('incorrect');
    });
  });

  describe('EX-000010: CDF Jump Size Evaluation', () => {
    const expJump = createRational(1n, 2n);
    const explanationLatex = 'P(X = 1) = F(1) - F(1^-) = 3/4 - 1/4 = 1/2 = 0.50';

    it('accepts fraction "1/2"', () => {
      const res = checkExactRationalAnswer('1/2', expJump, explanationLatex);
      expect(res.status).toBe('correct');
      expect(res.parsedInput?.num).toBe(1n);
      expect(res.parsedInput?.den).toBe(2n);
    });

    it('accepts equivalent decimal "0.5"', () => {
      const res = checkExactRationalAnswer('0.5', expJump, explanationLatex);
      expect(res.status).toBe('correct');
    });

    it('evaluates incorrect response "1/4" as incorrect', () => {
      const res = checkExactRationalAnswer('1/4', expJump, explanationLatex);
      expect(res.status).toBe('incorrect');
    });
  });
});
