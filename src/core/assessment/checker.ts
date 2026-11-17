/**
 * Assessment Response Checker
 * Conforms to A-006 v0.1 specification and Stage 6 Assessment Depth.
 * Uses deterministic arithmetic comparison via A-004 exact Rational primitives.
 */

import {
  Rational,
  parseRational,
  compareRational,
  rationalToString,
  rationalToLatex,
} from '../math/rational';

export type AssessmentStatus = 'correct' | 'partially_correct' | 'incorrect' | 'invalid_input';

export interface AssessmentCheckResult {
  readonly status: AssessmentStatus;
  readonly parsedInput?: Rational;
  readonly message: string;
  readonly explanationLatex?: string;
  readonly score?: number;
  readonly maxScore?: number;
  readonly partResults?: Record<string, AssessmentCheckResult>;
}

export interface ExercisePart {
  readonly id: string;
  readonly label: string;
  readonly prompt: string;
  readonly expectedRational: Rational;
  readonly domain?: 'probability' | 'non_negative' | 'real';
  readonly explanationLatex?: string;
}

export interface IntervalCheckResult {
  readonly status: AssessmentStatus;
  readonly parsedLow?: Rational;
  readonly parsedHigh?: Rational;
  readonly closedLow?: boolean;
  readonly closedHigh?: boolean;
  readonly message: string;
  readonly explanationLatex?: string;
}

export interface TupleCheckResult {
  readonly status: AssessmentStatus;
  readonly parsedTuple?: Rational[];
  readonly message: string;
  readonly explanationLatex?: string;
}

/**
 * Checks a scalar rational/decimal answer against an expected exact Rational.
 * Supports configurable domain validation (probability in [0, 1], non_negative in [0, inf), or real).
 */
export function checkExactRationalAnswer(
  learnerInput: string,
  expected: Rational,
  explanationLatex: string,
  domain: 'probability' | 'non_negative' | 'real' = 'probability'
): AssessmentCheckResult {
  const trimmed = learnerInput.trim();
  if (!trimmed) {
    return {
      status: 'invalid_input',
      message: domain === 'probability'
        ? 'Please enter a probability value (e.g. 1/2 or 0.5).'
        : 'Please enter a numerical value (e.g. 3, 1/2, or -4).',
    };
  }

  const parsed = parseRational(trimmed);
  if (!parsed) {
    return {
      status: 'invalid_input',
      message: `"${trimmed}" could not be parsed as a valid rational or decimal number. Use formats like 1/2, 3/4, or 0.5.`,
    };
  }

  // Domain checks
  if (domain === 'probability') {
    if (parsed.num < 0n || parsed.num > parsed.den) {
      return {
        status: 'invalid_input',
        parsedInput: parsed,
        message: `The entered value ${rationalToString(parsed)} is outside the valid probability range [0, 1].`,
      };
    }
  } else if (domain === 'non_negative') {
    if (parsed.num < 0n) {
      return {
        status: 'invalid_input',
        parsedInput: parsed,
        message: `The entered value ${rationalToString(parsed)} cannot be negative for this quantity.`,
      };
    }
  }

  const matches = compareRational(parsed, expected) === 0;

  if (matches) {
    return {
      status: 'correct',
      parsedInput: parsed,
      score: 1,
      maxScore: 1,
      message: `Correct! Your answer ${rationalToString(parsed)} matches the exact target ${rationalToString(expected)}.`,
      explanationLatex,
    };
  } else {
    return {
      status: 'incorrect',
      parsedInput: parsed,
      score: 0,
      maxScore: 1,
      message: `Not quite. You entered ${rationalToString(parsed)} (${rationalToLatex(parsed)}), but the expected ${domain === 'probability' ? 'probability' : 'value'} is ${rationalToString(expected)}.`,
      explanationLatex,
    };
  }
}

/**
 * Parses an interval string, supporting formats:
 * - [a, b]
 * - (a, b)
 * - [a, b)
 * - (a, b]
 * - a to b
 */
export function parseInterval(input: string): {
  low: Rational;
  high: Rational;
  closedLow: boolean;
  closedHigh: boolean;
} | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Match bracketed interval: e.g. [1/4, 3/4] or (0, 0.5]
  const bracketMatch = trimmed.match(/^([\[\(])\s*([^,;]+)\s*[,;]\s*([^\]\)]+)\s*([\]\)])$/);
  if (bracketMatch) {
    const closedLow = bracketMatch[1] === '[';
    const closedHigh = bracketMatch[4] === ']';
    const low = parseRational(bracketMatch[2].trim());
    const high = parseRational(bracketMatch[3].trim());
    if (low && high) {
      return { low, high, closedLow, closedHigh };
    }
    return null;
  }

  // Match "a to b"
  const toMatch = trimmed.match(/^([^\s]+)\s+(?:to|-)\s+([^\s]+)$/i);
  if (toMatch) {
    const low = parseRational(toMatch[1].trim());
    const high = parseRational(toMatch[2].trim());
    if (low && high) {
      return { low, high, closedLow: true, closedHigh: true };
    }
  }

  return null;
}

/**
 * Checks an interval response against expected boundaries.
 */
export function checkIntervalAnswer(
  learnerInput: string,
  expectedLow: Rational,
  expectedHigh: Rational,
  explanationLatex: string,
  expectedClosedLow: boolean = true,
  expectedClosedHigh: boolean = true
): IntervalCheckResult {
  const parsed = parseInterval(learnerInput);
  if (!parsed) {
    return {
      status: 'invalid_input',
      message: `"${learnerInput}" could not be parsed as an interval. Use standard interval notation like [1/4, 3/4] or (0, 1).`,
    };
  }

  const lowMatches = compareRational(parsed.low, expectedLow) === 0;
  const highMatches = compareRational(parsed.high, expectedHigh) === 0;
  const bracketsMatch =
    parsed.closedLow === expectedClosedLow && parsed.closedHigh === expectedClosedHigh;

  if (lowMatches && highMatches && bracketsMatch) {
    const bracketLeft = expectedClosedLow ? '[' : '(';
    const bracketRight = expectedClosedHigh ? ']' : ')';
    return {
      status: 'correct',
      parsedLow: parsed.low,
      parsedHigh: parsed.high,
      closedLow: parsed.closedLow,
      closedHigh: parsed.closedHigh,
      message: `Correct! The interval is ${bracketLeft}${rationalToString(expectedLow)}, ${rationalToString(expectedHigh)}${bracketRight}.`,
      explanationLatex,
    };
  } else if (lowMatches && highMatches && !bracketsMatch) {
    return {
      status: 'partially_correct',
      parsedLow: parsed.low,
      parsedHigh: parsed.high,
      closedLow: parsed.closedLow,
      closedHigh: parsed.closedHigh,
      message: `The endpoints are correct, but the boundary inclusion (open vs. closed brackets) is incorrect.`,
      explanationLatex,
    };
  } else {
    return {
      status: 'incorrect',
      parsedLow: parsed.low,
      parsedHigh: parsed.high,
      closedLow: parsed.closedLow,
      closedHigh: parsed.closedHigh,
      message: `Not quite. You entered ${parsed.closedLow ? '[' : '('}${rationalToString(parsed.low)}, ${rationalToString(parsed.high)}${parsed.closedHigh ? ']' : ')'}, but the expected interval is ${expectedClosedLow ? '[' : '('}${rationalToString(expectedLow)}, ${rationalToString(expectedHigh)}${expectedClosedHigh ? ']' : ')'}.`,
      explanationLatex,
    };
  }
}

/**
 * Parses comma- or space-separated tuples, e.g. "(1/2, 3/4)" or "2, 4".
 */
export function parseTuple(input: string): Rational[] | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Strip optional outer parentheses: ( ... )
  const unparenthesized = trimmed.replace(/^\(/, '').replace(/\)$/, '').trim();
  const items = unparenthesized.split(/[,;\s]+/).filter(Boolean);
  if (items.length === 0) return null;

  const rationals: Rational[] = [];
  for (const item of items) {
    const parsed = parseRational(item);
    if (!parsed) return null;
    rationals.push(parsed);
  }
  return rationals;
}

/**
 * Checks a tuple / coordinate vector against expected elements.
 */
export function checkTupleAnswer(
  learnerInput: string,
  expectedTuple: Rational[],
  explanationLatex: string
): TupleCheckResult {
  const parsed = parseTuple(learnerInput);
  if (!parsed) {
    return {
      status: 'invalid_input',
      message: `"${learnerInput}" could not be parsed as a list of numbers. Use format like (1/2, 3/4) or 1, 2.`,
    };
  }

  if (parsed.length !== expectedTuple.length) {
    return {
      status: 'invalid_input',
      parsedTuple: parsed,
      message: `Expected ${expectedTuple.length} values, but received ${parsed.length}.`,
    };
  }

  const allMatch = expectedTuple.every(
    (exp, idx) => compareRational(parsed[idx], exp) === 0
  );

  const expStr = `(${expectedTuple.map(rationalToString).join(', ')})`;
  const actStr = `(${parsed.map(rationalToString).join(', ')})`;

  if (allMatch) {
    return {
      status: 'correct',
      parsedTuple: parsed,
      message: `Correct! ${actStr} matches the expected tuple.`,
      explanationLatex,
    };
  } else {
    return {
      status: 'incorrect',
      parsedTuple: parsed,
      message: `Not quite. You provided ${actStr}, but the expected tuple is ${expStr}.`,
      explanationLatex,
    };
  }
}

/**
 * Evaluates a multi-part exercise with individual criteria and partial credit scoring.
 */
export function checkMultiPartRationalAnswer(
  inputs: Record<string, string>,
  parts: readonly ExercisePart[],
  aggregateExplanationLatex?: string
): AssessmentCheckResult {
  const partResults: Record<string, AssessmentCheckResult> = {};
  let totalScore = 0;
  let hasInvalid = false;
  let correctCount = 0;

  for (const part of parts) {
    const learnerVal = inputs[part.id] ?? '';
    const res = checkExactRationalAnswer(
      learnerVal,
      part.expectedRational,
      part.explanationLatex ?? '',
      part.domain ?? 'probability'
    );
    partResults[part.id] = res;

    if (res.status === 'invalid_input') {
      hasInvalid = true;
    } else if (res.status === 'correct') {
      correctCount++;
      totalScore += 1;
    }
  }

  const maxScore = parts.length;

  if (hasInvalid) {
    return {
      status: 'invalid_input',
      score: totalScore,
      maxScore,
      partResults,
      message: 'One or more parts contains an invalid or empty response. Please review your entries.',
      explanationLatex: aggregateExplanationLatex,
    };
  }

  if (correctCount === maxScore) {
    return {
      status: 'correct',
      score: totalScore,
      maxScore,
      partResults,
      message: `Outstanding! All ${maxScore} parts are correct (${totalScore}/${maxScore}).`,
      explanationLatex: aggregateExplanationLatex,
    };
  } else if (correctCount > 0) {
    return {
      status: 'partially_correct',
      score: totalScore,
      maxScore,
      partResults,
      message: `Partially correct: ${correctCount} of ${maxScore} parts correct (${totalScore}/${maxScore}). Check feedback on remaining parts.`,
      explanationLatex: aggregateExplanationLatex,
    };
  } else {
    return {
      status: 'incorrect',
      score: 0,
      maxScore,
      partResults,
      message: `None of the ${maxScore} parts are correct. Review the explanations below.`,
      explanationLatex: aggregateExplanationLatex,
    };
  }
}
