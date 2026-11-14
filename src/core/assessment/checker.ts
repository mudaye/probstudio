/**
 * Prototype Response Checker
 * Conforms to A-006 v0.1 prototype-only scope and ROADMAP.md Stage 0
 * Uses deterministic rational comparison via A-004 exact arithmetic.
 */

import {
  Rational,
  parseRational,
  compareRational,
  rationalToString,
  rationalToLatex,
} from '../math/rational';

export interface AssessmentCheckResult {
  readonly status: 'correct' | 'incorrect' | 'invalid_input';
  readonly parsedInput?: Rational;
  readonly message: string;
  readonly explanationLatex?: string;
}

export function checkExactRationalAnswer(
  learnerInput: string,
  expected: Rational,
  explanationLatex: string
): AssessmentCheckResult {
  const trimmed = learnerInput.trim();
  if (!trimmed) {
    return {
      status: 'invalid_input',
      message: 'Please enter a probability value (e.g. 1/2 or 0.5).',
    };
  }

  const parsed = parseRational(trimmed);
  if (!parsed) {
    return {
      status: 'invalid_input',
      message: `"${trimmed}" could not be parsed as a valid rational or decimal number. Use formats like 1/2 or 0.5.`,
    };
  }

  // Check if answer is within probability range [0, 1]
  if (parsed.num < 0n || parsed.num > parsed.den) {
    return {
      status: 'invalid_input',
      parsedInput: parsed,
      message: `The entered value ${rationalToString(parsed)} is outside the valid probability range [0, 1].`,
    };
  }

  const matches = compareRational(parsed, expected) === 0;

  if (matches) {
    return {
      status: 'correct',
      parsedInput: parsed,
      message: `Correct! Your answer ${rationalToString(parsed)} matches the exact probability ${rationalToString(expected)}.`,
      explanationLatex,
    };
  } else {
    return {
      status: 'incorrect',
      parsedInput: parsed,
      message: `Not quite. You entered ${rationalToString(parsed)} (${rationalToLatex(parsed)}), but the expected probability is ${rationalToString(expected)}.`,
      explanationLatex,
    };
  }
}
