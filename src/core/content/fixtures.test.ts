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
  ALL_EXERCISES,
  getExercisesByModule,
  getExerciseById,
} from './fixtures';

describe('Concept Content Fixtures - Module M01 and M02 (A-005 Compliance)', () => {
  it('contains authored concepts for Module M01 and M02', () => {
    expect(ALL_CONCEPTS.length).toBe(5);
    const m01Concepts = getConceptsByModule('M01');
    expect(m01Concepts.length).toBe(3);
    expect(m01Concepts.map((c) => c.id)).toEqual(['C-000001', 'C-000002', 'C-000003']);

    const m02Concepts = getConceptsByModule('M02');
    expect(m02Concepts.length).toBe(2);
    expect(m02Concepts.map((c) => c.id)).toEqual(['C-000004', 'C-000005']);
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
    for (const c of [CONCEPT_C000001, CONCEPT_C000002, CONCEPT_C000003, CONCEPT_C000004, CONCEPT_C000005]) {
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

  describe('Exercise Content Fixtures - Module M01 and M02', () => {
    it('contains authored exercises for Module M01 and M02', () => {
      expect(ALL_EXERCISES.length).toBe(4);
      const m01Ex = getExercisesByModule('M01');
      expect(m01Ex.length).toBe(3);
      expect(m01Ex.map((e) => e.id)).toEqual(['EX-000001', 'EX-000002', 'EX-000003']);

      const m02Ex = getExercisesByModule('M02');
      expect(m02Ex.length).toBe(1);
      expect(m02Ex.map((e) => e.id)).toEqual(['EX-000004']);

      const ex2 = getExerciseById('EX-000002');
      expect(ex2?.title).toContain('Complement Rule');
      expect(ex2?.expectedRational.num).toBe(97n);
      expect(ex2?.expectedRational.den).toBe(100n);

      const ex3 = getExerciseById('EX-000003');
      expect(ex3?.title).toContain('Finite Additivity');
      expect(ex3?.expectedRational.num).toBe(2n);
      expect(ex3?.expectedRational.den).toBe(3n);

      const ex4 = getExerciseById('EX-000004');
      expect(ex4?.title).toContain('Diagnostic Screening');
      expect(ex4?.expectedRational.num).toBe(1n);
      expect(ex4?.expectedRational.den).toBe(6n);
      expect(ex4?.moduleId).toBe('M02');
      expect(ex4?.linkedConceptIds).toEqual(['C-000004', 'C-000005']);
    });
  });
});
