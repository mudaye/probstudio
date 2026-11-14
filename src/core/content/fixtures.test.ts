import { describe, it, expect } from 'vitest';
import {
  ALL_CONCEPTS,
  getConceptById,
  getConceptsByModule,
  CONCEPT_C000001,
  CONCEPT_C000002,
  CONCEPT_C000003,
  CONCEPT_C000004,
  CONCEPT_C000005,
  CONCEPT_C000006,
  CONCEPT_C000007,
  ALL_EXERCISES,
  getExercisesByModule,
  getExerciseById,
} from './fixtures';

describe('Concept Content Fixtures - Modules M01, M02, and M04 (A-005 Compliance)', () => {
  it('contains authored concepts for Module M01, M02, and M04', () => {
    expect(ALL_CONCEPTS.length).toBe(7);
    const m01Concepts = getConceptsByModule('M01');
    expect(m01Concepts.length).toBe(3);
    expect(m01Concepts.map((c) => c.id)).toEqual(['C-000001', 'C-000002', 'C-000003']);

    const m02Concepts = getConceptsByModule('M02');
    expect(m02Concepts.length).toBe(2);
    expect(m02Concepts.map((c) => c.id)).toEqual(['C-000004', 'C-000005']);

    const m04Concepts = getConceptsByModule('M04');
    expect(m04Concepts.length).toBe(2);
    expect(m04Concepts.map((c) => c.id)).toEqual(['C-000006', 'C-000007']);
  });

  it('verifies C-000001: Sample Spaces and Events', () => {
    const c = getConceptById('C-000001');
    expect(c).toBeDefined();
    expect(c?.title).toBe('Sample Spaces and Events');
    expect(c?.sourceRef.chapter).toContain('Chapter 1');
    expect(c?.formalDefinitionLatex).toContain('\\Omega');
    expect(c?.properties.length).toBeGreaterThan(0);
  });

  it('verifies C-000002: Probability Axioms & Space', () => {
    const c = getConceptById('C-000002');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Probability Axioms');
    expect(c?.sourceRef.chapter).toContain('Chapter 2');
    expect(c?.sourceRef.transcript_file).toBe('Review of Basic Probability 1.md');
    // Checks that LaTeX contains Kolmogorov non-negativity and normalization
    expect(c?.formalDefinitionLatex).toContain('P(A) \\ge 0');
    expect(c?.formalDefinitionLatex).toContain('P(\\Omega) = 1');
    expect(c?.formalDefinitionLatex).toContain('Additivity');
  });

  it('verifies C-000003: Derived Probability Rules', () => {
    const c = getConceptById('C-000003');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Derived Probability Rules');
    expect(c?.sourceRef.chapter).toContain('Chapter 2');
    // Checks that LaTeX contains Complement Rule and Addition Rule
    expect(c?.formalDefinitionLatex).toContain('P(A^c) &= 1 - P(A)');
    expect(c?.formalDefinitionLatex).toContain('P(A \\cup B) &= P(A) + P(B) - P(A \\cap B)');
  });

  it('ensures all concepts have valid classification and non-empty intuition', () => {
    for (const c of [CONCEPT_C000001, CONCEPT_C000002, CONCEPT_C000003, CONCEPT_C000004, CONCEPT_C000005, CONCEPT_C000006, CONCEPT_C000007]) {
      expect(c.classification).toBe('source_derived');
      expect(c.intuition.length).toBeGreaterThan(20);
      expect(c.formalDefinition.length).toBeGreaterThan(20);
      expect(c.properties.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('verifies C-000004: Conditional Probability & Reduced Sample Space', () => {
    const c = getConceptById('C-000004');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Conditional Probability');
    expect(c?.moduleId).toBe('M02');
    expect(c?.formalDefinitionLatex).toContain('P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}');
    expect(c?.properties).toContain('Certainty of Condition: P(B | B) = P(B ∩ B) / P(B) = 1.');
  });

  it('verifies C-000005: Multiplication Rule & Bayes Theorem', () => {
    const c = getConceptById('C-000005');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Bayes Theorem');
    expect(c?.moduleId).toBe('M02');
    expect(c?.formalDefinitionLatex).toContain('P(A \\mid B_j) P(B_j)');
    expect(c?.formalDefinitionLatex).toContain('\\sum_{i=1}^n P(A \\mid B_i) P(B_i)');
  });

  it('verifies C-000006: Event Independence & Equivalent Formulations', () => {
    const c = getConceptById('C-000006');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Event Independence');
    expect(c?.moduleId).toBe('M04');
    expect(c?.formalDefinitionLatex).toContain('P(A \\cap B) = P(A)P(B)');
    expect(c?.properties.some((p) => p.includes('Complement Invariance'))).toBe(true);
  });

  it('verifies C-000007: Pairwise vs Mutual and Conditional Independence', () => {
    const c = getConceptById('C-000007');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Pairwise vs Mutual');
    expect(c?.moduleId).toBe('M04');
    expect(c?.formalDefinitionLatex).toContain('Mutual');
    expect(c?.formalDefinitionLatex).toContain('Conditional');
  });

  describe('Exercise Content Fixtures - Modules M01, M02, and M04', () => {
    it('contains authored exercises for Modules M01, M02, and M04', () => {
      expect(ALL_EXERCISES.length).toBe(6);
      const m01Ex = getExercisesByModule('M01');
      expect(m01Ex.length).toBe(3);
      expect(m01Ex.map((e) => e.id)).toEqual(['EX-000001', 'EX-000002', 'EX-000003']);

      const m02Ex = getExercisesByModule('M02');
      expect(m02Ex.length).toBe(1);
      expect(m02Ex.map((e) => e.id)).toEqual(['EX-000004']);

      const m04Ex = getExercisesByModule('M04');
      expect(m04Ex.length).toBe(2);
      expect(m04Ex.map((e) => e.id)).toEqual(['EX-000005', 'EX-000006']);

      const ex5 = getExerciseById('EX-000005');
      expect(ex5?.title).toContain('Independent Events');
      expect(ex5?.expectedRational.num).toBe(1n);
      expect(ex5?.expectedRational.den).toBe(4n);
      expect(ex5?.moduleId).toBe('M04');

      const ex6 = getExerciseById('EX-000006');
      expect(ex6?.title).toContain('Conditional Probability Under Independence');
      expect(ex6?.expectedRational.num).toBe(1n);
      expect(ex6?.expectedRational.den).toBe(5n);
      expect(ex6?.moduleId).toBe('M04');
    });
  });
});
