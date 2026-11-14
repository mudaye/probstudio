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
  CONCEPT_C000010,
  CONCEPT_C000011,
  CONCEPT_C000012,
  CONCEPT_C000013,
  CONCEPT_C000014,
  CONCEPT_C000015,
  CONCEPT_C000016,
  CONCEPT_C000017,
  CONCEPT_C000018,
  CONCEPT_C000019,
  CONCEPT_C000020,
  CONCEPT_C000021,
  CONCEPT_C000022,
  CONCEPT_C000023,
  CONCEPT_C000024,
  CONCEPT_C000025,
  CONCEPT_C000026,
  CONCEPT_C000027,
  CONCEPT_C000028,
  CONCEPT_C000029,
  CONCEPT_C000030,
  ALL_EXERCISES,
  getExercisesByModule,
  getExerciseById,
  EXERCISE_EX000011,
  EXERCISE_EX000012,
  EXERCISE_EX000013,
  EXERCISE_EX000014,
  EXERCISE_EX000015,
  EXERCISE_EX000016,
  EXERCISE_EX000017,
  EXERCISE_EX000018,
  EXERCISE_EX000019,
  EXERCISE_EX000020,
  EXERCISE_EX000021,
  EXERCISE_EX000022,
  EXERCISE_EX000023,
  EXERCISE_EX000024,
} from './fixtures';

describe('Concept Content Fixtures - Modules M01 through M15 (A-005 Compliance)', () => {
  it('contains authored concepts for active modules across Part 1 and Part 2', () => {
    expect(ALL_CONCEPTS.length).toBe(30);
    const m01Concepts = getConceptsByModule('M01');
    expect(m01Concepts.length).toBe(3);
    expect(m01Concepts.map((c) => c.id)).toEqual(['C-000001', 'C-000002', 'C-000003']);

    const m02Concepts = getConceptsByModule('M02');
    expect(m02Concepts.length).toBe(2);
    expect(m02Concepts.map((c) => c.id)).toEqual(['C-000004', 'C-000005']);

    const m03Concepts = getConceptsByModule('M03');
    expect(m03Concepts.length).toBe(2);
    expect(m03Concepts.map((c) => c.id)).toEqual(['C-000014', 'C-000015']);

    const m04Concepts = getConceptsByModule('M04');
    expect(m04Concepts.length).toBe(2);
    expect(m04Concepts.map((c) => c.id)).toEqual(['C-000006', 'C-000007']);

    const m05Concepts = getConceptsByModule('M05');
    expect(m05Concepts.length).toBe(2);
    expect(m05Concepts.map((c) => c.id)).toEqual(['C-000008', 'C-000009']);

    const m06Concepts = getConceptsByModule('M06');
    expect(m06Concepts.length).toBe(2);
    expect(m06Concepts.map((c) => c.id)).toEqual(['C-000010', 'C-000011']);

    const m07Concepts = getConceptsByModule('M07');
    expect(m07Concepts.length).toBe(2);
    expect(m07Concepts.map((c) => c.id)).toEqual(['C-000016', 'C-000017']);

    const m08Concepts = getConceptsByModule('M08');
    expect(m08Concepts.length).toBe(2);
    expect(m08Concepts.map((c) => c.id)).toEqual(['C-000012', 'C-000013']);

    const m09Concepts = getConceptsByModule('M09');
    expect(m09Concepts.length).toBe(2);
    expect(m09Concepts.map((c) => c.id)).toEqual(['C-000018', 'C-000019']);

    const m10Concepts = getConceptsByModule('M10');
    expect(m10Concepts.length).toBe(2);
    expect(m10Concepts.map((c) => c.id)).toEqual(['C-000020', 'C-000021']);

    const m11Concepts = getConceptsByModule('M11');
    expect(m11Concepts.length).toBe(2);
    expect(m11Concepts.map((c) => c.id)).toEqual(['C-000022', 'C-000023']);

    const m12Concepts = getConceptsByModule('M12');
    expect(m12Concepts.length).toBe(2);
    expect(m12Concepts.map((c) => c.id)).toEqual(['C-000024', 'C-000025']);

    const m13Concepts = getConceptsByModule('M13');
    expect(m13Concepts.length).toBe(2);
    expect(m13Concepts.map((c) => c.id)).toEqual(['C-000026', 'C-000027']);

    const m14Concepts = getConceptsByModule('M14');
    expect(m14Concepts.length).toBe(2);
    expect(m14Concepts.map((c) => c.id)).toEqual(['C-000028', 'C-000029']);

    const m15Concepts = getConceptsByModule('M15');
    expect(m15Concepts.length).toBe(1);
    expect(m15Concepts.map((c) => c.id)).toEqual(['C-000030']);
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
    for (const c of [
      CONCEPT_C000001,
      CONCEPT_C000002,
      CONCEPT_C000003,
      CONCEPT_C000004,
      CONCEPT_C000005,
      CONCEPT_C000006,
      CONCEPT_C000007,
      CONCEPT_C000008,
      CONCEPT_C000009,
      CONCEPT_C000010,
      CONCEPT_C000011,
      CONCEPT_C000012,
      CONCEPT_C000013,
      CONCEPT_C000014,
      CONCEPT_C000015,
      CONCEPT_C000016,
      CONCEPT_C000017,
      CONCEPT_C000018,
      CONCEPT_C000019,
      CONCEPT_C000020,
      CONCEPT_C000021,
      CONCEPT_C000022,
      CONCEPT_C000023,
      CONCEPT_C000024,
      CONCEPT_C000025,
      CONCEPT_C000026,
      CONCEPT_C000027,
      CONCEPT_C000028,
      CONCEPT_C000029,
      CONCEPT_C000030,
    ]) {
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

  it('verifies C-000010: Cumulative Distribution Functions & Properties', () => {
    const c = getConceptById('C-000010');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Cumulative Distribution');
    expect(c?.moduleId).toBe('M06');
    expect(c?.formalDefinitionLatex).toContain('F_X(x) = P(X \\le x)');
    expect(c?.properties.some((p) => p.includes('Right-Continuity'))).toBe(true);
  });

  it('verifies C-000011: Discrete Staircase CDFs & Jump Discontinuities', () => {
    const c = getConceptById('C-000011');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Discrete Staircase');
    expect(c?.moduleId).toBe('M06');
    expect(c?.formalDefinitionLatex).toContain('F_X(x_k) - F_X(x_k^-)');
    expect(c?.formalDefinitionLatex).toContain('P(a < X \\le b)');
  });

  it('verifies C-000012: Discrete Distribution Families: Bernoulli & Binomial', () => {
    const c = getConceptById('C-000012');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Bernoulli & Binomial');
    expect(c?.moduleId).toBe('M08');
    expect(c?.formalDefinitionLatex).toContain('\\binom{n}{k}');
    expect(c?.formalDefinitionLatex).toContain('np(1-p)');
  });

  it('verifies C-000013: Waiting Times & Rate Models: Geometric & Poisson', () => {
    const c = getConceptById('C-000013');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Geometric & Poisson');
    expect(c?.moduleId).toBe('M08');
    expect(c?.formalDefinitionLatex).toContain('(1-p)^{k-1} p');
    expect(c?.formalDefinitionLatex).toContain('e^{-\\lambda}');
    expect(c?.properties.some((p) => p.includes('starts at k = 1'))).toBe(true);
  });

  it('verifies C-000014: Law of Total Probability & Finite Partitions', () => {
    const c = getConceptById('C-000014');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Law of Total Probability');
    expect(c?.moduleId).toBe('M03');
    expect(c?.formalDefinitionLatex).toContain('\\sum_{i=1}^n P(A \\mid B_i) P(B_i)');
  });

  it('verifies C-000015: Bayes\' Rule & Inverse Probability Updating', () => {
    const c = getConceptById('C-000015');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Bayes');
    expect(c?.moduleId).toBe('M03');
    expect(c?.formalDefinitionLatex).toContain('P(B_j \\mid A)');
  });

  it('verifies C-000016: Discrete Probability Mass Functions & Support', () => {
    const c = getConceptById('C-000016');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Discrete Probability Mass');
    expect(c?.moduleId).toBe('M07');
    expect(c?.formalDefinitionLatex).toContain('\\sum_{x \\in S_X} p_X(x) = 1');
  });

  it('verifies C-000017: The Bridge Between PMF and CDF: Summations & Differences', () => {
    const c = getConceptById('C-000017');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Bridge Between PMF and CDF');
    expect(c?.moduleId).toBe('M07');
    expect(c?.formalDefinitionLatex).toContain('p_X(x_k) &= F_X(x_k) - F_X(x_k^-)');
  });

  it('verifies C-000018: Continuous Random Variables & PDFs', () => {
    const c = getConceptById('C-000018');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Continuous Random Variables');
    expect(c?.moduleId).toBe('M09');
    expect(c?.formalDefinitionLatex).toContain('\\int_{-\\infty}^\\infty f_X(x) dx = 1');
  });

  it('verifies C-000019: Continuous CDFs & The Calculus Bridge', () => {
    const c = getConceptById('C-000019');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Continuous Cumulative Distribution');
    expect(c?.moduleId).toBe('M09');
    expect(c?.formalDefinitionLatex).toContain('f_X(x) = \\frac{d}{dx} F_X(x)');
  });

  it('verifies C-000020: Continuous Distribution Families: Uniform & Exponential', () => {
    const c = getConceptById('C-000020');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Uniform & Exponential');
    expect(c?.moduleId).toBe('M10');
    expect(c?.formalDefinitionLatex).toContain('\\frac{1}{b - a}');
    expect(c?.formalDefinitionLatex).toContain('\\lambda e^{-\\lambda x}');
  });

  it('verifies C-000021: The Gaussian (Normal) Distribution & Standard Normal Table', () => {
    const c = getConceptById('C-000021');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Gaussian (Normal)');
    expect(c?.moduleId).toBe('M10');
    expect(c?.formalDefinitionLatex).toContain('\\sigma\\sqrt{2\\pi}');
  });

  it('verifies C-000022: Transformations of Random Variables & The Change-of-Variables Formula', () => {
    const c = getConceptById('C-000022');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Transformations of Random Variables');
    expect(c?.moduleId).toBe('M11');
    expect(c?.formalDefinitionLatex).toContain('g^{-1}(y)');
  });

  it('verifies C-000023: Linear Transformations & The General CDF Method', () => {
    const c = getConceptById('C-000023');
    expect(c).toBeDefined();
    expect(c?.title).toContain('Linear Transformations');
    expect(c?.moduleId).toBe('M11');
    expect(c?.formalDefinitionLatex).toContain('\\frac{1}{|a|}');
  });

  describe('Exercise Content Fixtures - Modules M01 through M15', () => {
    it('contains authored exercises across Part 1 and Part 2', () => {
      expect(ALL_EXERCISES.length).toBe(24);
      const m01Ex = getExercisesByModule('M01');
      expect(m01Ex.length).toBe(3);
      expect(m01Ex.map((e) => e.id)).toEqual(['EX-000001', 'EX-000002', 'EX-000003']);

      const m02Ex = getExercisesByModule('M02');
      expect(m02Ex.length).toBe(1);
      expect(m02Ex.map((e) => e.id)).toEqual(['EX-000004']);

      const m03Ex = getExercisesByModule('M03');
      expect(m03Ex.length).toBe(2);
      expect(m03Ex.map((e) => e.id)).toEqual(['EX-000013', 'EX-000014']);

      const m04Ex = getExercisesByModule('M04');
      expect(m04Ex.length).toBe(2);
      expect(m04Ex.map((e) => e.id)).toEqual(['EX-000005', 'EX-000006']);

      const m05Ex = getExercisesByModule('M05');
      expect(m05Ex.length).toBe(2);
      expect(m05Ex.map((e) => e.id)).toEqual(['EX-000007', 'EX-000008']);

      const m06Ex = getExercisesByModule('M06');
      expect(m06Ex.length).toBe(2);
      expect(m06Ex.map((e) => e.id)).toEqual(['EX-000009', 'EX-000010']);

      const m07Ex = getExercisesByModule('M07');
      expect(m07Ex.length).toBe(2);
      expect(m07Ex.map((e) => e.id)).toEqual(['EX-000015', 'EX-000016']);

      const m08Ex = getExercisesByModule('M08');
      expect(m08Ex.length).toBe(2);
      expect(m08Ex.map((e) => e.id)).toEqual(['EX-000011', 'EX-000012']);

      expect(getExerciseById('EX-000011')).toBe(EXERCISE_EX000011);
      expect(getExerciseById('EX-000012')).toBe(EXERCISE_EX000012);
      expect(getExerciseById('EX-000013')).toBe(EXERCISE_EX000013);
      expect(getExerciseById('EX-000014')).toBe(EXERCISE_EX000014);
      expect(getExerciseById('EX-000015')).toBe(EXERCISE_EX000015);
      expect(getExerciseById('EX-000016')).toBe(EXERCISE_EX000016);

      const m09Ex = getExercisesByModule('M09');
      expect(m09Ex.length).toBe(2);
      expect(m09Ex.map((e) => e.id)).toEqual(['EX-000017', 'EX-000018']);

      const m10Ex = getExercisesByModule('M10');
      expect(m10Ex.length).toBe(1);
      expect(m10Ex.map((e) => e.id)).toEqual(['EX-000019']);

      const m11Ex = getExercisesByModule('M11');
      expect(m11Ex.length).toBe(1);
      expect(m11Ex.map((e) => e.id)).toEqual(['EX-000020']);

      const m12Ex = getExercisesByModule('M12');
      expect(m12Ex.length).toBe(1);
      expect(m12Ex.map((e) => e.id)).toEqual(['EX-000021']);

      const m13Ex = getExercisesByModule('M13');
      expect(m13Ex.length).toBe(1);
      expect(m13Ex.map((e) => e.id)).toEqual(['EX-000022']);

      const m14Ex = getExercisesByModule('M14');
      expect(m14Ex.length).toBe(1);
      expect(m14Ex.map((e) => e.id)).toEqual(['EX-000023']);

      const m15Ex = getExercisesByModule('M15');
      expect(m15Ex.length).toBe(1);
      expect(m15Ex.map((e) => e.id)).toEqual(['EX-000024']);

      const ex17 = getExerciseById('EX-000017');
      expect(ex17).toBe(EXERCISE_EX000017);
      expect(ex17?.title).toContain('Continuous PDF Normalization');
      expect(ex17?.expectedRational.num).toBe(1n);
      expect(ex17?.expectedRational.den).toBe(9n);
      expect(ex17?.moduleId).toBe('M09');

      const ex18 = getExerciseById('EX-000018');
      expect(ex18).toBe(EXERCISE_EX000018);
      expect(ex18?.title).toContain('Uniform Distribution');
      expect(ex18?.expectedRational.num).toBe(1n);
      expect(ex18?.expectedRational.den).toBe(2n);
      expect(ex18?.moduleId).toBe('M09');

      const ex19 = getExerciseById('EX-000019');
      expect(ex19).toBe(EXERCISE_EX000019);
      expect(ex19?.title).toContain('Exponential-Decay');
      expect(ex19?.expectedRational.num).toBe(3n);
      expect(ex19?.expectedRational.den).toBe(16n);
      expect(ex19?.moduleId).toBe('M10');

      const ex20 = getExerciseById('EX-000020');
      expect(ex20).toBe(EXERCISE_EX000020);
      expect(ex20?.title).toContain('Linear Transformation');
      expect(ex20?.expectedRational.num).toBe(1n);
      expect(ex20?.expectedRational.den).toBe(8n);
      expect(ex20?.moduleId).toBe('M11');

      const ex21 = getExerciseById('EX-000021');
      expect(ex21).toBe(EXERCISE_EX000021);
      expect(ex21?.title).toContain('Expectation Under Affine');
      expect(ex21?.expectedRational.num).toBe(19n);
      expect(ex21?.expectedRational.den).toBe(1n);
      expect(ex21?.moduleId).toBe('M12');

      const ex22 = getExerciseById('EX-000022');
      expect(ex22).toBe(EXERCISE_EX000022);
      expect(ex22?.title).toContain('Variance Scaling');
      expect(ex22?.expectedRational.num).toBe(12n);
      expect(ex22?.expectedRational.den).toBe(1n);
      expect(ex22?.moduleId).toBe('M13');

      const ex23 = getExerciseById('EX-000023');
      expect(ex23).toBe(EXERCISE_EX000023);
      expect(ex23?.title).toContain('Chebyshev Concentration');
      expect(ex23?.expectedRational.num).toBe(1n);
      expect(ex23?.expectedRational.den).toBe(9n);
      expect(ex23?.moduleId).toBe('M14');

      const ex24 = getExerciseById('EX-000024');
      expect(ex24).toBe(EXERCISE_EX000024);
      expect(ex24?.title).toContain('Empirical Sample Mean Convergence');
      expect(ex24?.expectedRational.num).toBe(7n);
      expect(ex24?.expectedRational.den).toBe(1n);
      expect(ex24?.moduleId).toBe('M15');
    });
  });
});
