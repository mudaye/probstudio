/**
 * Content fixtures for the Prototype Slice
 * Conforms to A-005 v0.2 and ROADMAP.md Stage 0
 */

export interface SourceReference {
  readonly id: string;
  readonly part: string;
  readonly transcript_file: string;
  readonly chapter: string;
  readonly note: string;
}

export interface ConceptContent {
  readonly id: string;
  readonly title: string;
  readonly moduleId: string;
  readonly intuition: string;
  readonly formalDefinition: string;
  readonly formalDefinitionLatex: string;
  readonly properties: readonly string[];
  readonly sourceRef: SourceReference;
  readonly classification: 'source_derived' | 'supplementary' | 'editorial';
}

export interface ExerciseContent {
  readonly id: string;
  readonly title: string;
  readonly moduleId: string;
  readonly category: 'numerical' | 'concept_identification' | 'formula_selection' | 'error_detection';
  readonly linkedConceptIds: readonly string[];
  readonly prompt: string;
  readonly promptLatex: string;
  readonly sampleSpaceLatex?: string;
  readonly expectedRational: { num: bigint; den: bigint };
  readonly explanation: string;
  readonly explanationLatex: string;
  readonly sourceRef: SourceReference;
  readonly classification: 'source_derived' | 'supplementary';
}

export const MODULE_M01 = {
  id: 'M01',
  partId: 'P1',
  title: 'Probability Foundations',
  summary: 'Sample spaces, events, probability axioms, and discrete models.',
  transcriptChapters: ['Chapter 1: Introduction and Probability Spaces', 'Chapter 2: Axioms of Probability'],
};

export const CONCEPT_C000001: ConceptContent = {
  id: 'C-000001',
  title: 'Sample Spaces and Events',
  moduleId: 'M01',
  intuition:
    'A random experiment is any process with an uncertain outcome. The sample space is the complete catalogue of everything that could possibly happen, and an event is any collection of outcomes we might care to ask about.',
  formalDefinition:
    'Let Ω be a non-empty set called the sample space. An outcome ω is an element of Ω. An event A is a subset of the sample space: A ⊆ Ω.',
  formalDefinitionLatex:
    '\\Omega = \\{\\omega_1, \\omega_2, \\dots\\}, \\quad A \\subseteq \\Omega',
  properties: [
    'Certain event: The entire sample space Ω always occurs, P(Ω) = 1.',
    'Impossible event: The empty set ∅ never occurs, P(∅) = 0.',
    'Complementation: The event A^c = Ω \\ A occurs if and only if A does not occur.',
    'Union: A ∪ B occurs if A occurs, B occurs, or both occur.',
    'Intersection: A ∩ B occurs if both A and B occur simultaneously.',
  ],
  sourceRef: {
    id: 'SRC-P1-CH01-001',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 1: Probability Spaces',
    note: 'Definitions of sample space, outcome, and event.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000002: ConceptContent = {
  id: 'C-000002',
  title: 'Probability Axioms & The Probability Space',
  moduleId: 'M01',
  intuition:
    'To assign numbers measuring likelihood in a mathematically sound way, any probability measure must obey three foundational rules established by Kolmogorov: probabilities cannot be negative, the entire universe of possibilities has probability 1, and the probability of non-overlapping alternatives adds together.',
  formalDefinition:
    'A probability space is a triplet (Ω, F, P), where Ω is the sample space, F is a σ-algebra of events, and P: F → [0, 1] is a probability measure satisfying three axioms:\n1. Non-negativity: P(A) ≥ 0 for all A ∈ F.\n2. Normalization: P(Ω) = 1.\n3. Countable Additivity (σ-additivity): For any countable sequence of pairwise disjoint events A_1, A_2, ..., P(∪ A_i) = Σ P(A_i).',
  formalDefinitionLatex:
    '\\begin{aligned} &\\text{1. Non-negativity:} \\quad P(A) \\ge 0 \\quad \\forall A \\in \\mathcal{F} \\\\[6pt] &\\text{2. Normalization:} \\quad P(\\Omega) = 1 \\\\[6pt] &\\text{3. } \\sigma\\text{-Additivity:} \\quad A_i \\cap A_j = \\emptyset \\; (i \\ne j) \\implies P\\left(\\bigcup_{i=1}^\\infty A_i\\right) = \\sum_{i=1}^\\infty P(A_i) \\end{aligned}',
  properties: [
    'The Probability Triplet: (Ω, F, P) defines the complete mathematical universe for any random experiment.',
    'Finite Additivity: Follows directly from σ-additivity for two disjoint events: if A ∩ B = ∅, then P(A ∪ B) = P(A) + P(B).',
    'Non-negativity constraint: No event can ever have negative probability.',
    'Certainty constraint: Probability is bounded above by 1 because P(Ω) = 1.',
  ],
  sourceRef: {
    id: 'SRC-P1-CH02-001',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 2: Probability axioms and space',
    note: 'The three axioms of probability (Kolmogorov axioms) and the probability space triplet (Ω, F, P).',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000003: ConceptContent = {
  id: 'C-000003',
  title: 'Derived Probability Rules & Properties',
  moduleId: 'M01',
  intuition:
    'Starting solely from Kolmogorov\'s three axioms, fundamental operational rules can be derived logically: the empty set has zero probability, the probability of an event happening plus its complement not happening always equals 1, and overlapping probabilities are corrected using the addition rule.',
  formalDefinition:
    'From the three probability axioms, the following core theorems hold for any events A, B ∈ F:\n1. Empty Set: P(∅) = 0.\n2. Complement Rule: P(A^c) = 1 - P(A).\n3. Monotonicity: If A ⊆ B, then P(A) ≤ P(B).\n4. General Addition Rule: P(A ∪ B) = P(A) + P(B) - P(A ∩ B).',
  formalDefinitionLatex:
    '\\begin{aligned} P(\\emptyset) &= 0 \\\\[4pt] P(A^c) &= 1 - P(A) \\\\[4pt] A \\subseteq B &\\implies P(A) \\le P(B) \\\\[4pt] P(A \\cup B) &= P(A) + P(B) - P(A \\cap B) \\end{aligned}',
  properties: [
    'Complement Principle: P(A) + P(A^c) = P(A ∪ A^c) = P(Ω) = 1 because A and A^c are disjoint and exhaustive.',
    'Double-Counting Correction: In P(A ∪ B), outcomes in the intersection A ∩ B are counted in both P(A) and P(B), requiring subtraction of P(A ∩ B).',
    'Union Bound (Boole\'s Inequality): P(A ∪ B) ≤ P(A) + P(B) with equality if and only if A and B are disjoint.',
    'Probability Boundedness: For any event A, 0 ≤ P(A) ≤ 1, since ∅ ⊆ A ⊆ Ω.',
  ],
  sourceRef: {
    id: 'SRC-P1-CH02-002',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 2: Probability axioms and space',
    note: 'Theorems derived from the axioms: complementation, empty set, and finite addition.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000004: ConceptContent = {
  id: 'C-000004',
  title: 'Conditional Probability & Sample Space Reduction',
  moduleId: 'M02',
  intuition:
    'When partial information arrives—such as learning that an event B has occurred—the effective universe of possibilities shrinks from Ω to B. Any outcome outside B is now impossible, and probabilities within B are scaled up proportionally by dividing by P(B).',
  formalDefinition:
    'For any events A and B in a probability space (Ω, F, P) with P(B) > 0, the conditional probability of A given B is defined as:\n\nP(A | B) = P(A ∩ B) / P(B).\n\nIf P(B) = 0, P(A | B) is undefined (E-COND-ZERO).',
  formalDefinitionLatex:
    'P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}, \\quad \\text{defined for } P(B) > 0',
  properties: [
    'Sample Space Restriction: Conditioning on B restricts the effective sample space to B.',
    'Certainty of Condition: P(B | B) = P(B ∩ B) / P(B) = 1.',
    'Disjoint Conditioning: If A and B are mutually exclusive (A ∩ B = ∅) and P(B) > 0, then P(A | B) = 0.',
    'Probability Range: For any event A, 0 ≤ P(A | B) ≤ 1.',
  ],
  sourceRef: {
    id: 'SRC-P1-CH03-001',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 3: Conditional probability',
    note: 'Definition of conditional probability and reduced sample space.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000005: ConceptContent = {
  id: 'C-000005',
  title: 'Multiplication Rule & Bayes Theorem',
  moduleId: 'M02',
  intuition:
    'Rearranging the conditional probability definition yields the multiplication rule, allowing sequential calculation of joint probabilities. Furthermore, dividing sample space into exhaustive non-overlapping slices allows computing total probability and updating prior beliefs into posterior probabilities via Bayes\' Rule.',
  formalDefinition:
    '1. Multiplication Rule: P(A ∩ B) = P(A | B)P(B) = P(B | A)P(A).\n2. Law of Total Probability: For a finite partition {B_1, ..., B_n} of Ω with P(B_i) > 0:\nP(A) = Σ P(A | B_i)P(B_i).\n3. Bayes\' Rule: P(B_j | A) = (P(A | B_j)P(B_j)) / (Σ P(A | B_i)P(B_i)).',
  formalDefinitionLatex:
    '\\begin{aligned} P(A \\cap B) &= P(A \\mid B) P(B) \\\\[4pt] P(A) &= \\sum_{i=1}^n P(A \\mid B_i) P(B_i) \\\\[4pt] P(B_j \\mid A) &= \\frac{P(A \\mid B_j) P(B_j)}{\\sum_{i=1}^n P(A \\mid B_i) P(B_i)} \\end{aligned}',
  properties: [
    'Conditional Probability Measure: For any fixed B with P(B) > 0, P(· | B) satisfies all three Kolmogorov axioms.',
    'Sequential Chain Rule: P(A ∩ B ∩ C) = P(A) P(B | A) P(C | A ∩ B).',
    'Prior to Posterior: Bayes\' rule updates the prior belief P(B_j) into the posterior belief P(B_j | A) upon observing evidence A.',
  ],
  sourceRef: {
    id: 'SRC-P1-CH03-002',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 3 & 4: Conditional probability and Bayes',
    note: 'The multiplication rule, law of total probability, and Bayes rule.',
  },
  classification: 'source_derived',
};

export const ALL_CONCEPTS: readonly ConceptContent[] = [
  CONCEPT_C000001,
  CONCEPT_C000002,
  CONCEPT_C000003,
  CONCEPT_C000004,
  CONCEPT_C000005,
];

export function getConceptById(id: string): ConceptContent | undefined {
  return ALL_CONCEPTS.find((c) => c.id === id);
}

export function getConceptsByModule(moduleId: string): readonly ConceptContent[] {
  return ALL_CONCEPTS.filter((c) => c.moduleId === moduleId);
}

export const EXERCISE_EX000001: ExerciseContent = {
  id: 'EX-000001',
  title: 'Event Probability in a Two-Coin Toss',
  moduleId: 'M01',
  category: 'numerical',
  linkedConceptIds: ['C-000001', 'C-000002'],
  prompt:
    'Consider an experiment where a fair coin is tossed twice. The sample space is Ω = {HH, HT, TH, TT}, where each outcome has equal probability 1/4. Let event A be getting a Head on the first toss: A = {HH, HT}. Calculate P(A).',
  promptLatex:
    '\\Omega = \\{HH, HT, TH, TT\\}, \\quad p(\\omega) = \\frac{1}{4} \\text{ for each } \\omega \\in \\Omega.\\newline \\text{Let } A = \\{HH, HT\\}. \\text{ Find } P(A).',
  sampleSpaceLatex: '\\Omega = \\{HH, HT, TH, TT\\}',
  expectedRational: { num: 1n, den: 2n },
  explanation:
    'Since all 4 outcomes are equally likely with mass 1/4 each, P(A) is the sum of the masses of outcomes in A: P(A) = p(HH) + p(HT) = 1/4 + 1/4 = 2/4 = 1/2.',
  explanationLatex:
    'P(A) = \\sum_{\\omega \\in A} p(\\omega) = p(HH) + p(HT) = \\frac{1}{4} + \\frac{1}{4} = \\frac{2}{4} = \\frac{1}{2}',
  sourceRef: {
    id: 'SRC-P1-CH01-002',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 1 & 2',
    note: 'Illustrative setup grounded in transcript coin-toss probability examples.',
  },
  classification: 'supplementary',
};

export const EXERCISE_EX000002: ExerciseContent = {
  id: 'EX-000002',
  title: 'Applying the Complement Rule',
  moduleId: 'M01',
  category: 'numerical',
  linkedConceptIds: ['C-000002', 'C-000003'],
  prompt:
    'In a quality inspection of manufactured microchips, let event A be the event that a randomly tested chip is defective. Historical testing indicates that the probability of a defect is P(A) = 3/100 (or 0.03). Using the Complement Rule, calculate the probability P(A^c) that a randomly selected chip is non-defective.',
  promptLatex:
    'P(A) = \\frac{3}{100} = 0.03.\\newline \\text{Using the Complement Rule } P(A^c) = 1 - P(A), \\text{ find } P(A^c).',
  expectedRational: { num: 97n, den: 100n },
  explanation:
    'By the Complement Rule derived from Kolmogorov\'s axioms, the probability of an event and its complement must sum to 1: P(A) + P(A^c) = 1. Therefore, P(A^c) = 1 - P(A) = 1 - 3/100 = 97/100 = 0.97.',
  explanationLatex:
    'P(A^c) = 1 - P(A) = 1 - \\frac{3}{100} = \\frac{97}{100} = 0.97',
  sourceRef: {
    id: 'SRC-P1-CH02-003',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 2: Probability axioms and space',
    note: 'Application of the complement rule derived from normalization and additivity.',
  },
  classification: 'supplementary',
};

export const EXERCISE_EX000003: ExerciseContent = {
  id: 'EX-000003',
  title: 'Finite Additivity for Disjoint Events',
  moduleId: 'M01',
  category: 'numerical',
  linkedConceptIds: ['C-000001', 'C-000002', 'C-000003'],
  prompt:
    'A fair 6-sided die is rolled once, with sample space Ω = {1, 2, 3, 4, 5, 6}, where each outcome has equal mass 1/6. Let event A be rolling a 1 or 2 (A = {1, 2}), and event B be rolling a 5 or 6 (B = {5, 6}). Because A and B share no common outcomes (A ∩ B = ∅), they are mutually exclusive. Calculate P(A ∪ B).',
  promptLatex:
    '\\Omega = \\{1, 2, 3, 4, 5, 6\\}, \\quad p(\\omega) = \\frac{1}{6}.\\newline A = \\{1, 2\\}, \\quad B = \\{5, 6\\}, \\quad A \\cap B = \\emptyset.\\newline \\text{Find } P(A \\cup B).',
  sampleSpaceLatex: '\\Omega = \\{1, 2, 3, 4, 5, 6\\}',
  expectedRational: { num: 2n, den: 3n },
  explanation:
    'Because events A and B are mutually exclusive (disjoint, A ∩ B = ∅), the Additivity Axiom states P(A ∪ B) = P(A) + P(B). Here P(A) = 2/6 = 1/3 and P(B) = 2/6 = 1/3. Therefore, P(A ∪ B) = 2/6 + 2/6 = 4/6 = 2/3.',
  explanationLatex:
    'P(A \\cup B) = P(A) + P(B) = \\frac{2}{6} + \\frac{2}{6} = \\frac{4}{6} = \\frac{2}{3}',
  sourceRef: {
    id: 'SRC-P1-CH02-004',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 2: Probability axioms and space',
    note: 'Addition rule for mutually exclusive events.',
  },
  classification: 'supplementary',
};

export const EXERCISE_EX000004: ExerciseContent = {
  id: 'EX-000004',
  title: 'Posterior Probability in Medical Diagnostic Screening',
  moduleId: 'M02',
  category: 'numerical',
  linkedConceptIds: ['C-000004', 'C-000005'],
  prompt:
    'A rare medical condition D has a prevalence of P(D) = 0.01 (1/100). A diagnostic test T has sensitivity P(T⁺ | D) = 0.99 (99/100) and specificity P(T⁻ | Dᶜ) = 0.95 (95/100), meaning the false-positive rate is P(T⁺ | Dᶜ) = 0.05 (5/100). If a randomly selected individual tests positive (T⁺), what is the posterior probability P(D | T⁺) that the individual actually has the condition? Express your answer as a simplified fraction or decimal.',
  promptLatex:
    '\\begin{aligned} &P(D) = \\frac{1}{100}, \\quad P(D^c) = \\frac{99}{100} \\\\[4pt] &P(T^+ \\mid D) = \\frac{99}{100}, \\quad P(T^+ \\mid D^c) = 1 - \\frac{95}{100} = \\frac{5}{100} \\\\[4pt] &\\text{Find } P(D \\mid T^+). \\end{aligned}',
  expectedRational: { num: 1n, den: 6n },
  explanation:
    'Using Bayes\' Rule and the Law of Total Probability: P(T⁺) = P(T⁺ | D)P(D) + P(T⁺ | Dᶜ)P(Dᶜ) = (99/100)(1/100) + (5/100)(99/100) = 99/10000 + 495/10000 = 594/10000 = 297/5000 (0.0594). Then P(D | T⁺) = P(T⁺ | D)P(D) / P(T⁺) = (99/10000) / (594/10000) = 99 / 594 = 1/6 (≈ 0.1667).',
  explanationLatex:
    '\\begin{aligned} P(T^+) &= P(T^+ \\mid D)P(D) + P(T^+ \\mid D^c)P(D^c) \\\\[4pt] &= \\left(\\frac{99}{100}\\right)\\left(\\frac{1}{100}\\right) + \\left(\\frac{5}{100}\\right)\\left(\\frac{99}{100}\\right) = \\frac{99 + 495}{10000} = \\frac{594}{10000} \\\\[6pt] P(D \\mid T^+) &= \\frac{P(T^+ \\mid D)P(D)}{P(T^+)} = \\frac{\\frac{99}{10000}}{\\frac{594}{10000}} = \\frac{99}{594} = \\frac{1}{6} \\end{aligned}',
  sourceRef: {
    id: 'SRC-P1-CH04-001',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 4: Bayes theorem and diagnostic tests',
    note: 'Standard diagnostic testing paradigm from Bayes rule discussion.',
  },
  classification: 'source_derived',
};

export const ALL_EXERCISES: readonly ExerciseContent[] = [
  EXERCISE_EX000001,
  EXERCISE_EX000002,
  EXERCISE_EX000003,
  EXERCISE_EX000004,
];

export function getExerciseById(id: string): ExerciseContent | undefined {
  return ALL_EXERCISES.find((e) => e.id === id);
}

export function getExercisesByModule(moduleId: string): readonly ExerciseContent[] {
  return ALL_EXERCISES.filter((e) => e.moduleId === moduleId);
}
