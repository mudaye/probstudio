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

export const CONCEPT_C000006: ConceptContent = {
  id: 'C-000006',
  title: 'Event Independence & Equivalent Formulations',
  moduleId: 'M04',
  intuition:
    'Two events are independent if knowing whether one occurred provides zero information about the probability of the other. The defining mathematical hallmark of independence is that joint probability factorizes into the product of marginal probabilities.',
  formalDefinition:
    'Two events A and B are independent iff P(A ∩ B) = P(A)P(B).\nWhen P(B) > 0, this is mathematically equivalent to P(A | B) = P(A).\nWhen P(A) > 0, it is equivalent to P(B | A) = P(B).',
  formalDefinitionLatex:
    'P(A \\cap B) = P(A)P(B) \\iff P(A \\mid B) = P(A) \\quad (\\text{for } P(B) > 0)',
  properties: [
    'Product Rule Primacy: P(A ∩ B) = P(A)P(B) serves as the primary definition because it remains valid even when P(A) = 0 or P(B) = 0.',
    'Complement Invariance: If A and B are independent, then (A, Bᶜ), (Aᶜ, B), and (Aᶜ, Bᶜ) are also independent pairs.',
    'Disjoint vs Independent: Disjoint events with positive probabilities are NEVER independent, because P(A ∩ B) = 0 while P(A)P(B) > 0.',
  ],
  sourceRef: {
    id: 'SRC-P1-CH05-001',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 5: Independence',
    note: 'Definition of independence and complement independence invariance.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000007: ConceptContent = {
  id: 'C-000007',
  title: 'Pairwise vs Mutual and Conditional Independence',
  moduleId: 'M04',
  intuition:
    'For three or more events, pairwise independence does not guarantee mutual (total) independence. Mutual independence requires every sub-family of events to factorize. Furthermore, independence is not preserved under conditioning: independent events can become dependent upon observing evidence, and vice-versa.',
  formalDefinition:
    '1. Mutual Independence: A collection {A_1, ..., A_n} is mutually independent iff for every subset S ⊆ {1, ..., n} with |S| ≥ 2:\nP(∩_{i ∈ S} A_i) = ∏_{i ∈ S} P(A_i).\n2. Conditional Independence: Events A and B are conditionally independent given C with P(C) > 0 iff:\nP(A ∩ B | C) = P(A | C)P(B | C).',
  formalDefinitionLatex:
    '\\begin{aligned} &\\text{Mutual: } P\\left(\\bigcap_{i \\in S} A_i\\right) = \\prod_{i \\in S} P(A_i) \\quad \\forall S \\subseteq \\{1,\\dots,n\\}, |S| \\ge 2 \\\\[4pt] &\\text{Conditional: } P(A \\cap B \\mid C) = P(A \\mid C) P(B \\mid C) \\quad (P(C) > 0) \\end{aligned}',
  properties: [
    'Pairwise Does Not Imply Mutual: All pairs can be independent while the triple fails the joint product condition.',
    'Conditioning Can Create Dependence: Two independent coin tosses A and B become dependent when conditioning on whether their outcomes match (event C).',
    'Conditioning Can Create Independence: Unconditionally dependent diagnostic test observations can become conditionally independent given true disease status.',
  ],
  sourceRef: {
    id: 'SRC-P1-CH05-002',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 5: Independence',
    note: 'Total independence vs pairwise independence and conditional independence.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000008: ConceptContent = {
  id: 'C-000008',
  title: 'Random Variables as Real-Valued Functions',
  moduleId: 'M05',
  intuition:
    'A random variable is neither "random" nor a "variable": it is a deterministic mathematical function mapping abstract experimental outcomes to real numbers. Multiple distinct random variables can be defined on the very same probability space.',
  formalDefinition:
    'Let (Ω, F, P) be a probability space. A real-valued random variable X is a deterministic function X: Ω → ℝ such that for every Borel set B ⊆ ℝ, the pre-image X⁻¹(B) = {ω ∈ Ω : X(ω) ∈ B} is an event in F.',
  formalDefinitionLatex:
    'X: \\Omega \\to \\mathbb{R}, \\quad X^{-1}(B) = \\{\\omega \\in \\Omega : X(\\omega) \\in B\\} \\in \\mathcal{F}',
  properties: [
    'Deterministic Mapping: The numerical value X(ω) is completely determined once the outcome ω is realized.',
    'Pre-Image Sets (Fibers): Events on the real number line correspond to fiber subsets in the underlying sample space.',
    'Multiple Mappings on One Space: Multiple random variables (e.g. heads count, net payoff, score difference) can operate simultaneously on the same Ω.',
  ],
  sourceRef: {
    id: 'SRC-P1-CH06-001',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 6: Random variables',
    note: 'Definition of random variables as mappings from sample space to real numbers.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000009: ConceptContent = {
  id: 'C-000009',
  title: 'Induced Probability Measures & Discrete PMFs',
  moduleId: 'M05',
  intuition:
    'A random variable transfers probability mass from abstract outcomes in Ω onto the real number line ℝ. For discrete random variables, the probability mass function (PMF) aggregates the masses of all outcomes that map to each specific value.',
  formalDefinition:
    'The random variable X induces a new probability space (ℝ, B, P_X), where the induced probability measure is defined by P_X(B) = P(X ∈ B) = P(X⁻¹(B)).\nFor a discrete random variable taking values in support S_X, the Probability Mass Function (PMF) is:\np_X(x) = P(X = x) = Σ_{ω: X(ω)=x} p(ω).',
  formalDefinitionLatex:
    '\\begin{aligned} P_X(B) &= P(X^{-1}(B)) = P(\\{\\omega \\in \\Omega : X(\\omega) \\in B\\}) \\\\[4pt] p_X(x) &= P(X = x) = \\sum_{\\omega \\in \\Omega : X(\\omega) = x} p(\\omega) \\end{aligned}',
  properties: [
    'Axiom Preservation: The induced measure P_X satisfies all Kolmogorov axioms on the real line.',
    'PMF Normalization: For any discrete random variable, p_X(x) ≥ 0 for all x and Σ_{x ∈ S_X} p_X(x) = 1.',
    'Fiber Aggregation: When multiple outcomes map to the same numerical value, their masses sum additively.',
  ],
  sourceRef: {
    id: 'SRC-P1-CH06-002',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 6: Random variables',
    note: 'Induced probability measure and discrete PMF definition.',
  },
  classification: 'source_derived',
};

export const ALL_CONCEPTS: readonly ConceptContent[] = [
  CONCEPT_C000001,
  CONCEPT_C000002,
  CONCEPT_C000003,
  CONCEPT_C000004,
  CONCEPT_C000005,
  CONCEPT_C000006,
  CONCEPT_C000007,
  CONCEPT_C000008,
  CONCEPT_C000009,
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

export const EXERCISE_EX000005: ExerciseContent = {
  id: 'EX-000005',
  title: 'Joint Probability of Independent Events',
  moduleId: 'M04',
  category: 'numerical',
  linkedConceptIds: ['C-000006'],
  prompt:
    'In a two-coin toss experiment with sample space Ω = {HH, HT, TH, TT} and equal probability 1/4 each, let event A be "first toss is Head" (A = {HH, HT}) and event B be "second toss is Head" (B = {HH, TH}). Because the coin tosses are independent, calculate the exact joint probability P(A ∩ B).',
  promptLatex:
    'P(A) = \\frac{1}{2}, \\quad P(B) = \\frac{1}{2}.\\newline \\text{Since } A \\perp B, \\text{ find } P(A \\cap B).',
  expectedRational: { num: 1n, den: 4n },
  explanation:
    'By the product rule for independent events: P(A ∩ B) = P(A) · P(B) = (1/2) · (1/2) = 1/4. In the sample space, A ∩ B = {HH}, which has outcome probability 1/4.',
  explanationLatex:
    'P(A \\cap B) = P(A) P(B) = \\frac{1}{2} \\times \\frac{1}{2} = \\frac{1}{4}',
  sourceRef: {
    id: 'SRC-P1-CH05-003',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 5: Independence',
    note: 'Product rule application in coin tossing.',
  },
  classification: 'supplementary',
};

export const EXERCISE_EX000006: ExerciseContent = {
  id: 'EX-000006',
  title: 'Conditional Probability Under Independence',
  moduleId: 'M04',
  category: 'numerical',
  linkedConceptIds: ['C-000006', 'C-000007'],
  prompt:
    'Two independent network servers S₁ and S₂ fail independently during peak hours with failure probabilities P(F₁) = 1/5 and P(F₂) = 1/4. Given that server S₂ has failed (event F₂), what is the conditional probability P(F₁ | F₂) that server S₁ also fails? Express your answer as a simplified fraction or decimal.',
  promptLatex:
    'P(F_1) = \\frac{1}{5}, \\quad P(F_2) = \\frac{1}{4}, \\quad F_1 \\perp F_2.\\newline \\text{Find } P(F_1 \\mid F_2).',
  expectedRational: { num: 1n, den: 5n },
  explanation:
    'Because events F₁ and F₂ are independent, knowing that F₂ occurred provides zero information about F₁. Therefore, P(F₁ | F₂) = P(F₁) = 1/5 (or 0.20). Mathematically: P(F₁ | F₂) = P(F₁ ∩ F₂) / P(F₂) = (P(F₁)P(F₂)) / P(F₂) = P(F₁) = 1/5.',
  explanationLatex:
    'P(F_1 \\mid F_2) = \\frac{P(F_1 \\cap F_2)}{P(F_2)} = \\frac{P(F_1)P(F_2)}{P(F_2)} = P(F_1) = \\frac{1}{5} = 0.20',
  sourceRef: {
    id: 'SRC-P1-CH05-004',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 5: Independence',
    note: 'Invariance of conditional probability under independence.',
  },
  classification: 'supplementary',
};

export const EXERCISE_EX000007: ExerciseContent = {
  id: 'EX-000007',
  title: 'Induced PMF of Heads Count in Three Coin Tosses',
  moduleId: 'M05',
  category: 'numerical',
  linkedConceptIds: ['C-000008', 'C-000009'],
  prompt:
    'Consider three independent tosses of a fair coin, with sample space Ω = {HHH, HHT, HTH, HTT, THH, THT, TTH, TTT} and equal mass 1/8 each. Let random variable X: Ω → ℝ denote the total number of Heads observed. Calculate the induced probability P(X = 2).',
  promptLatex:
    '\\Omega = \\{HHH, HHT, HTH, HTT, THH, THT, TTH, TTT\\}, \\quad p(\\omega) = \\frac{1}{8}.\\newline X(\\omega) = \\text{number of heads in } \\omega.\\newline \\text{Find } P(X = 2).',
  expectedRational: { num: 3n, den: 8n },
  explanation:
    'The pre-image of value 2 under mapping X is the event containing exactly two Heads: X⁻¹({2}) = {HHT, HTH, THH}. Since each outcome has mass 1/8, the induced probability is P(X = 2) = p(HHT) + p(HTH) + p(THH) = 1/8 + 1/8 + 1/8 = 3/8.',
  explanationLatex:
    'P(X = 2) = \\sum_{\\omega: X(\\omega) = 2} p(\\omega) = p(HHT) + p(HTH) + p(THH) = \\frac{3}{8}',
  sourceRef: {
    id: 'SRC-P1-CH06-003',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 6: Random variables',
    note: 'Three-coin toss heads count distribution.',
  },
  classification: 'source_derived',
};

export const EXERCISE_EX000008: ExerciseContent = {
  id: 'EX-000008',
  title: 'Net Payoff Random Variable in Coin Toss Game',
  moduleId: 'M05',
  category: 'numerical',
  linkedConceptIds: ['C-000008', 'C-000009'],
  prompt:
    'In a two-coin toss game (Ω = {HH, HT, TH, TT}, mass 1/4 each), a player defines net payoff random variable Y: Y(HH) = 2, Y(HT) = 0, Y(TH) = 0, and Y(TT) = -3. Calculate the probability of breaking even or winning, P(Y ≥ 0).',
  promptLatex:
    '\\begin{aligned} &Y(HH) = 2, \\quad Y(HT) = 0, \\quad Y(TH) = 0, \\quad Y(TT) = -3 \\\\[4pt] &p(\\omega) = \\frac{1}{4} \\quad \\forall \\omega \\in \\Omega. \\quad \\text{Find } P(Y \\ge 0). \\end{aligned}',
  expectedRational: { num: 3n, den: 4n },
  explanation:
    'The event {Y ≥ 0} corresponds to outcomes with non-negative payoff: Y⁻¹([0, ∞)) = {HH, HT, TH}. Summing the masses of these 3 outcomes yields P(Y ≥ 0) = 1/4 + 1/4 + 1/4 = 3/4 (or 0.75).',
  explanationLatex:
    'P(Y \\ge 0) = p(HH) + p(HT) + p(TH) = \\frac{1}{4} + \\frac{1}{4} + \\frac{1}{4} = \\frac{3}{4} = 0.75',
  sourceRef: {
    id: 'SRC-P1-CH06-004',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 6: Random variables',
    note: 'Payoff mapping example on finite sample space.',
  },
  classification: 'supplementary',
};

export const ALL_EXERCISES: readonly ExerciseContent[] = [
  EXERCISE_EX000001,
  EXERCISE_EX000002,
  EXERCISE_EX000003,
  EXERCISE_EX000004,
  EXERCISE_EX000005,
  EXERCISE_EX000006,
  EXERCISE_EX000007,
  EXERCISE_EX000008,
];

export function getExerciseById(id: string): ExerciseContent | undefined {
  return ALL_EXERCISES.find((e) => e.id === id);
}

export function getExercisesByModule(moduleId: string): readonly ExerciseContent[] {
  return ALL_EXERCISES.filter((e) => e.moduleId === moduleId);
}
