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
  CONCEPT_C000008,
  CONCEPT_C000009,
  ALL_EXERCISES,
  getExercisesByModule,
  getExerciseById,
} from './fixtures';

describe('Concept Content Fixtures - Modules M01, M02, M04, and M05 (A-005 Compliance)', () => {
  it('contains authored concepts for Module M01, M02, M04, and M05', () => {
    expect(ALL_CONCEPTS.length).toBe(9);
    const m01Concepts = getConceptsByModule('M01');
    expect(m01Concepts.length).toBe(3);
    expect(m01Concepts.map((c) => c.id)).toEqual(['C-000001', 'C-000002', 'C-000003']);

    const m02Concepts = getConceptsByModule('M02');
    expect(m02Concepts.length).toBe(2);
    expect(m02Concepts.map((c) => c.id)).toEqual(['C-000004', 'C-000005']);

    const m04Concepts = getConceptsByModule('M04');
    expect(m04Concepts.length).toBe(2);
    expect(m04Concepts.map((c) => c.id)).toEqual(['C-000006', 'C-000007']);

    const m05Concepts = getConceptsByModule('M05');
    expect(m05Concepts.length).toBe(2);
    expect(m05Concepts.map((c) => c.id)).toEqual(['C-000008', 'C-000009']);
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
    for (const c of [CONCEPT_C000001, CONCEPT_C000002, CONCEPT_C000003, CONCEPT_C000004, CONCEPT_C000005, CONCEPT_C000006, CONCEPT_C000007, CONCEPT_C000008, CONCEPT_C000009]) {
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

  it('verifies C-000008: Random Variables as Real-Valued Functions', () => {
    const c = getConceptById('C-000008');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Random Variables');
    expect(c?.moduleId).toBe('M05');
    expect(c?.formalDefinitionLatex).toContain('X: \\Omega \\to \\mathbb{R}');
    expect(c?.properties.some((p) => p.includes('Deterministic Mapping'))).toBe(true);
  });

  it('verifies C-000009: Induced Probability Measures & Discrete PMFs', () => {
    const c = getConceptById('C-000009');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Induced Probability Measures');
    expect(c?.moduleId).toBe('M05');
    expect(c?.formalDefinitionLatex).toContain('p_X(x)');
    expect(c?.formalDefinitionLatex).toContain('\\sum');
  });

  describe('Exercise Content Fixtures - Modules M01, M02, M04, and M05', () => {
    it('contains authored exercises for Modules M01, M02, M04, and M05', () => {
      expect(ALL_EXERCISES.length).toBe(8);
      const m01Ex = getExercisesByModule('M01');
      expect(m01Ex.length).toBe(3);
      expect(m01Ex.map((e) => e.id)).toEqual(['EX-000001', 'EX-000002', 'EX-000003']);

      const m02Ex = getExercisesByModule('M02');
      expect(m02Ex.length).toBe(1);
      expect(m02Ex.map((e) => e.id)).toEqual(['EX-000004']);

      const m04Ex = getExercisesByModule('M04');
      expect(m04Ex.length).toBe(2);
      expect(m04Ex.map((e) => e.id)).toEqual(['EX-000005', 'EX-000006']);

      const m05Ex = getExercisesByModule('M05');
      expect(m05Ex.length).toBe(2);
      expect(m05Ex.map((e) => e.id)).toEqual(['EX-000007', 'EX-000008']);

      const ex7 = getExerciseById('EX-000007');
      expect(ex7?.title).toContain('Induced PMF');
      expect(ex7?.expectedRational.num).toBe(3n);
      expect(ex7?.expectedRational.den).toBe(8n);
      expect(ex7?.moduleId).toBe('M05');

      const ex8 = getExerciseById('EX-000008');
      expect(ex8?.title).toContain('Net Payoff');
      expect(ex8?.expectedRational.num).toBe(3n);
      expect(ex8?.expectedRational.den).toBe(4n);
      expect(ex8?.moduleId).toBe('M05');
    });
  });
});
