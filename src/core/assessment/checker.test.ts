import { describe, it, expect } from 'vitest';
import {
  checkExactRationalAnswer,
  checkIntervalAnswer,
  checkTupleAnswer,
  checkMultiPartRationalAnswer,
} from './checker';
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

  describe('Stage 6 Assessment Depth & Response Formats', () => {
    describe('Domain-Specific Checking', () => {
      const expectedVariance = createRational(5n, 2n); // 2.5 > 1
      const explanation = 'Var(X) = 5/2 = 2.5';

      it('permits values > 1 when domain is non_negative or real', () => {
        const res = checkExactRationalAnswer('5/2', expectedVariance, explanation, 'non_negative');
        expect(res.status).toBe('correct');
        expect(res.parsedInput?.num).toBe(5n);
        expect(res.parsedInput?.den).toBe(2n);
      });

      it('rejects negative numbers when domain is non_negative', () => {
        const res = checkExactRationalAnswer('-1', expectedVariance, explanation, 'non_negative');
        expect(res.status).toBe('invalid_input');
        expect(res.message).toContain('cannot be negative');
      });

      it('permits negative values when domain is real', () => {
        const expectedMean = createRational(-3n, 4n);
        const res = checkExactRationalAnswer('-3/4', expectedMean, 'E[X] = -3/4', 'real');
        expect(res.status).toBe('correct');
      });
    });

    describe('Interval Checking', () => {
      const low = createRational(1n, 4n);
      const high = createRational(3n, 4n);
      const explanation = 'Support interval is [1/4, 3/4]';

      it('accepts exact closed interval [1/4, 3/4]', () => {
        const res = checkIntervalAnswer('[1/4, 3/4]', low, high, explanation, true, true);
        expect(res.status).toBe('correct');
        expect(res.parsedLow?.num).toBe(1n);
        expect(res.parsedHigh?.num).toBe(3n);
      });

      it('accepts equivalent decimal interval [0.25, 0.75]', () => {
        const res = checkIntervalAnswer('[0.25, 0.75]', low, high, explanation, true, true);
        expect(res.status).toBe('correct');
      });

      it('flags mismatched boundary brackets as partially_correct', () => {
        const res = checkIntervalAnswer('(1/4, 3/4)', low, high, explanation, true, true);
        expect(res.status).toBe('partially_correct');
        expect(res.message).toContain('boundary inclusion');
      });

      it('rejects incorrect interval bounds as incorrect', () => {
        const res = checkIntervalAnswer('[0, 1]', low, high, explanation, true, true);
        expect(res.status).toBe('incorrect');
      });

      it('returns invalid_input for unparseable interval string', () => {
        const res = checkIntervalAnswer('foobar', low, high, explanation);
        expect(res.status).toBe('invalid_input');
      });
    });

    describe('Tuple / Vector Checking', () => {
      const expectedMoments = [createRational(2n, 1n), createRational(4n, 1n)]; // (E[X], Var(X))
      const explanation = '(E[X], Var(X)) = (2, 4)';

      it('accepts parenthesized tuple "(2, 4)"', () => {
        const res = checkTupleAnswer('(2, 4)', expectedMoments, explanation);
        expect(res.status).toBe('correct');
        expect(res.parsedTuple?.length).toBe(2);
      });

      it('accepts unparenthesized comma-separated list "2, 4"', () => {
        const res = checkTupleAnswer('2, 4', expectedMoments, explanation);
        expect(res.status).toBe('correct');
      });

      it('rejects tuple with incorrect length as invalid_input', () => {
        const res = checkTupleAnswer('(2)', expectedMoments, explanation);
        expect(res.status).toBe('invalid_input');
        expect(res.message).toContain('Expected 2 values');
      });

      it('evaluates wrong tuple values as incorrect', () => {
        const res = checkTupleAnswer('(2, 5)', expectedMoments, explanation);
        expect(res.status).toBe('incorrect');
      });
    });

    describe('Multi-Part Exercise Checking', () => {
      const parts = [
        {
          id: 'part_a',
          label: 'Part A: Normalization Constant c',
          prompt: 'Find c such that f(x) integrates to 1',
          expectedRational: createRational(2n, 1n),
          domain: 'non_negative' as const,
          explanationLatex: 'c = 2',
        },
        {
          id: 'part_b',
          label: 'Part B: P(X > 1/2)',
          prompt: 'Compute probability for the tail',
          expectedRational: createRational(1n, 4n),
          domain: 'probability' as const,
          explanationLatex: 'P(X > 1/2) = 1/4',
        },
      ];

      it('awards full credit ("correct") when all parts are correct', () => {
        const inputs = { part_a: '2', part_b: '1/4' };
        const res = checkMultiPartRationalAnswer(inputs, parts, 'Both parts correct');
        expect(res.status).toBe('correct');
        expect(res.score).toBe(2);
        expect(res.maxScore).toBe(2);
      });

      it('awards partial credit ("partially_correct") when 1 of 2 parts is correct', () => {
        const inputs = { part_a: '2', part_b: '1/2' };
        const res = checkMultiPartRationalAnswer(inputs, parts, 'Part A correct');
        expect(res.status).toBe('partially_correct');
        expect(res.score).toBe(1);
        expect(res.maxScore).toBe(2);
        expect(res.partResults?.part_a.status).toBe('correct');
        expect(res.partResults?.part_b.status).toBe('incorrect');
      });

      it('marks outcome as "incorrect" when 0 parts are correct', () => {
        const inputs = { part_a: '5', part_b: '9/10' };
        const res = checkMultiPartRationalAnswer(inputs, parts);
        expect(res.status).toBe('incorrect');
        expect(res.score).toBe(0);
        expect(res.maxScore).toBe(2);
      });

      it('marks outcome as "invalid_input" if any part is invalid or empty', () => {
        const inputs = { part_a: '2', part_b: '' };
        const res = checkMultiPartRationalAnswer(inputs, parts);
        expect(res.status).toBe('invalid_input');
        expect(res.partResults?.part_b.status).toBe('invalid_input');
      });
    });
  });
});
