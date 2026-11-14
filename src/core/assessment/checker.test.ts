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
});
