import { describe, it, expect } from 'vitest';
import { createRational } from './rational';
import { FiniteSampleSpace } from './types';
import {
  calculatePairwiseIndependence,
  calculateMutualIndependence,
  calculateConditionalIndependence,
} from './independence';

describe('Deterministic Independence Engine: CAL-IND-001, CAL-IND-002, CAL-IND-003', () => {
  const q = createRational(1n, 4n);
  // Default PL-03 2-coin sample space
  const space2Coins: FiniteSampleSpace = {
    outcomes: ['HH', 'HT', 'TH', 'TT'],
    masses: [q, q, q, q],
  };

  const eventA = ['HH', 'HT']; // First toss H
  const eventB = ['HH', 'TH']; // Second toss H
  const eventC = ['HH', 'TT']; // Tosses equal

  describe('CAL-IND-001: Pairwise Independence Golden Vectors', () => {
    it('verifies event A and event B are independent', () => {
      const res = calculatePairwiseIndependence(space2Coins, eventA, eventB);
      expect(res.status).toBe('valid');
      expect(res.isIndependent).toBe(true);
      expect(res.probA).toEqual(createRational(1n, 2n));
      expect(res.probB).toEqual(createRational(1n, 2n));
      expect(res.probIntersection).toEqual(createRational(1n, 4n));
      expect(res.probProduct).toEqual(createRational(1n, 4n));
      expect(res.difference).toEqual(createRational(0n, 1n));
      expect(res.condProbAGivenB?.exact_rational).toEqual(createRational(1n, 2n));
    });

    it('verifies event A and event C are independent', () => {
      const res = calculatePairwiseIndependence(space2Coins, eventA, eventC);
      expect(res.isIndependent).toBe(true);
      expect(res.probIntersection).toEqual(createRational(1n, 4n));
      expect(res.probProduct).toEqual(createRational(1n, 4n));
    });

    it('verifies event B and event C are independent', () => {
      const res = calculatePairwiseIndependence(space2Coins, eventB, eventC);
      expect(res.isIndependent).toBe(true);
      expect(res.probIntersection).toEqual(createRational(1n, 4n));
      expect(res.probProduct).toEqual(createRational(1n, 4n));
    });

    it('verifies dependent events: A and A', () => {
      const res = calculatePairwiseIndependence(space2Coins, eventA, eventA);
      expect(res.isIndependent).toBe(false);
      expect(res.probIntersection).toEqual(createRational(1n, 2n));
      expect(res.probProduct).toEqual(createRational(1n, 4n));
      expect(res.difference).toEqual(createRational(1n, 4n));
    });
  });

  describe('CAL-IND-002: Mutual vs Pairwise Independence Golden Vector', () => {
    it('evaluates PL-03 default A, B, C: pairwise independent but NOT mutually independent', () => {
      const namedEvents = [
        { name: 'A', outcomes: eventA },
        { name: 'B', outcomes: eventB },
        { name: 'C', outcomes: eventC },
      ];

      const res = calculateMutualIndependence(space2Coins, namedEvents);
      expect(res.status).toBe('valid');
      expect(res.isPairwiseIndependent).toBe(true);
      expect(res.isMutuallyIndependent).toBe(false);
      expect(res.message).toContain('pairwise independent, but NOT mutually independent');

      // Verify the 4 sub-checks: AB, AC, BC, and ABC
      expect(res.checks.length).toBe(4);
      const abCheck = res.checks.find((c) => c.eventNames.join('') === 'AB');
      expect(abCheck?.isSatisfied).toBe(true);
      const acCheck = res.checks.find((c) => c.eventNames.join('') === 'AC');
      expect(acCheck?.isSatisfied).toBe(true);
      const bcCheck = res.checks.find((c) => c.eventNames.join('') === 'BC');
      expect(bcCheck?.isSatisfied).toBe(true);

      // Triple check ABC: P(A ∩ B ∩ C) = 1/4, but P(A)P(B)P(C) = 1/8
      const abcCheck = res.checks.find((c) => c.eventNames.join('') === 'ABC');
      expect(abcCheck?.isSatisfied).toBe(false);
      expect(abcCheck?.jointProb).toEqual(createRational(1n, 4n));
      expect(abcCheck?.productProb).toEqual(createRational(1n, 8n));
      expect(abcCheck?.difference).toEqual(createRational(1n, 8n));
    });

    it('evaluates 3 independent coin tosses as fully mutually independent', () => {
      const e = createRational(1n, 8n);
      const space3Coins: FiniteSampleSpace = {
        outcomes: ['HHH', 'HHT', 'HTH', 'HTT', 'THH', 'THT', 'TTH', 'TTT'],
        masses: [e, e, e, e, e, e, e, e],
      };

      const e1 = ['HHH', 'HHT', 'HTH', 'HTT']; // Toss 1 H
      const e2 = ['HHH', 'HHT', 'THH', 'THT']; // Toss 2 H
      const e3 = ['HHH', 'HTH', 'THH', 'TTH']; // Toss 3 H

      const res = calculateMutualIndependence(space3Coins, [
        { name: 'E1', outcomes: e1 },
        { name: 'E2', outcomes: e2 },
        { name: 'E3', outcomes: e3 },
      ]);

      expect(res.isPairwiseIndependent).toBe(true);
      expect(res.isMutuallyIndependent).toBe(true);
      expect(res.checks.every((c) => c.isSatisfied)).toBe(true);
    });
  });

  describe('CAL-IND-003: Conditional Independence Golden Vector', () => {
    it('verifies A and B are NOT conditionally independent given C (A-004 §5.1 Vector)', () => {
      // P(A ∩ B | C) = 1/2 while P(A | C)P(B | C) = 1/4
      const res = calculateConditionalIndependence(space2Coins, eventA, eventB, eventC);
      expect(res.status).toBe('valid');
      expect(res.isConditionallyIndependent).toBe(false);
      expect(res.probC).toEqual(createRational(1n, 2n));
      expect(res.probAGivenC.exact_rational).toEqual(createRational(1n, 2n));
      expect(res.probBGivenC.exact_rational).toEqual(createRational(1n, 2n));
      expect(res.condProduct).toEqual(createRational(1n, 4n));
      expect(res.probIntersectionGivenC.exact_rational).toEqual(createRational(1n, 2n));
      expect(res.difference).toEqual(createRational(1n, 4n)); // 1/2 - 1/4 = 1/4
    });

    it('returns status undefined with E-COND-ZERO when conditioning event has probability zero', () => {
      const emptyEvent: string[] = [];
      const res = calculateConditionalIndependence(space2Coins, eventA, eventB, emptyEvent);
      expect(res.status).toBe('undefined');
      expect(res.error_code).toBe('E-COND-ZERO');
      expect(res.isConditionallyIndependent).toBeNull();
      expect(res.message).toContain('Conditioning event has probability zero');
    });
  });
});
