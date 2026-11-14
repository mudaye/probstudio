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

export const CONCEPT_C000010: ConceptContent = {
  id: 'C-000010',
  title: 'Cumulative Distribution Functions & Foundational Properties',
  moduleId: 'M06',
  intuition:
    'The Cumulative Distribution Function (CDF) accumulates all probability mass up to a given real value x. Unlike the sample space probability measure P(·) which acts on event sets, the CDF F_X(x) is an ordinary function from real numbers to [0, 1] that completely describes the probabilistic behavior of random variable X.',
  formalDefinition:
    'For any random variable X, its Cumulative Distribution Function F_X: ℝ → [0, 1] is defined as:\nF_X(x) = P(X ≤ x) = P({ω ∈ Ω : X(ω) ≤ x}).',
  formalDefinitionLatex:
    'F_X(x) = P(X \\le x) = P(\\{\\omega \\in \\Omega : X(\\omega) \\le x\\})',
  properties: [
    'Bounded Range: 0 ≤ F_X(x) ≤ 1 for all x ∈ ℝ.',
    'Asymptotic Limits: lim_{x → -∞} F_X(x) = 0 and lim_{x → +∞} F_X(x) = 1.',
    'Monotonicity (Non-Decreasing): If x₁ ≤ x₂, then F_X(x₁) ≤ F_X(x₂).',
    'Right-Continuity: lim_{h ↓ 0} F_X(x + h) = F_X(x) for all x ∈ ℝ.',
  ],
  sourceRef: {
    id: 'SRC-P1-CH07-001',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 7: Cumulative distribution function',
    note: 'CDF definition and foundational properties.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000011: ConceptContent = {
  id: 'C-000011',
  title: 'Discrete Staircase CDFs & Jump Discontinuities',
  moduleId: 'M06',
  intuition:
    'For discrete random variables, the CDF forms a staircase step function. Between support points, the CDF is flat (constant). At each support point x_k, the CDF jumps vertically by an amount exactly equal to the point mass P(X = x_k).',
  formalDefinition:
    'Let X be a discrete random variable with support {x_1 < x_2 < ...} and masses p_k = P(X = x_k).\nF_X(x) = Σ_{x_k ≤ x} p_k.\nAt every support point x_k, the jump height equals the PMF mass:\nP(X = x_k) = F_X(x_k) - F_X(x_k⁻) = F_X(x_k) - lim_{t ↑ x_k} F_X(t).\nInterval probability:\nP(a < X ≤ b) = F_X(b) - F_X(a).',
  formalDefinitionLatex:
    '\\begin{aligned} F_X(x) &= \\sum_{x_k \\le x} P(X = x_k) \\\\[4pt] P(X = x_k) &= F_X(x_k) - F_X(x_k^-) \\\\[4pt] P(a < X \\le b) &= F_X(b) - F_X(a) \\end{aligned}',
  properties: [
    'Step and Plateau: F_X(x) remains constant on intervals [x_k, x_{k+1}) where no probability mass resides.',
    'Jump Height Equals Point Mass: A vertical jump in F(x) signals discrete probability mass, with jump size P(X = x).',
    'Boundary Conventions: P(a ≤ X ≤ b) includes jumps at both endpoints; P(a < X < b) excludes both endpoint jumps.',
  ],
  sourceRef: {
    id: 'SRC-P1-CH07-002',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 7: Cumulative distribution function',
    note: 'Staircase CDFs, jump discontinuities, and interval probabilities.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000012: ConceptContent = {
  id: 'C-000012',
  title: 'Discrete Distribution Families: Bernoulli & Binomial Experiments',
  moduleId: 'M08',
  intuition:
    'Many random experiments consist of repeated trials with binary outcomes (success or failure). A single trial is modeled by a Bernoulli distribution with parameter p. When we conduct n independent and identically distributed Bernoulli trials, the total count of successes follows the Binomial distribution with parameters n and p.',
  formalDefinition:
    'Bernoulli Distribution: X ~ Bernoulli(p) has support S_X = {0, 1} with PMF P(X=1) = p and P(X=0) = 1-p, where 0 ≤ p ≤ 1. Mean E[X] = p, Var(X) = p(1-p).\nBinomial Distribution: X ~ Binomial(n, p) is the sum of n independent Bernoulli(p) trials, X = Σ_{i=1}^n I_i. Support S_X = {0, 1, ..., n}. PMF P(X=k) = C(n, k) p^k (1-p)^(n-k) for k ∈ {0, 1, ..., n}. Mean E[X] = np, Var(X) = np(1-p).',
  formalDefinitionLatex:
    '\\begin{aligned} &\\textbf{Bernoulli}(p): \\quad S_X = \\{0, 1\\}, \\quad P(X = k) = p^k (1-p)^{1-k}, \\quad k \\in \\{0, 1\\} \\\\[4pt] &E[X] = p, \\quad \\text{Var}(X) = p(1-p) \\\\[6pt] &\\textbf{Binomial}(n, p): \\quad S_X = \\{0, 1, \\dots, n\\}, \\quad P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}, \\quad k \\in \\{0, 1, \\dots, n\\} \\\\[4pt] &E[X] = np, \\quad \\text{Var}(X) = np(1-p) \\end{aligned}',
  properties: [
    'Binary Success-Failure Model: Bernoulli models a single binary experiment; Binomial counts successes across n independent trials.',
    'Combinatorial Multiplicity: The binomial coefficient C(n, k) = n! / (k!(n-k)!) counts the number of distinct outcome sequences containing exactly k successes and n-k failures.',
    'Support Bounds: Binomial support is strictly finite, bounded between 0 and n.',
    'Linearity of Expectation: Because X = Σ_{i=1}^n X_i with each E[X_i] = p, the mean is E[X] = np.',
  ],
  sourceRef: {
    id: 'SRC-P1-CH08-001',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 8: Discrete random variables',
    note: 'Bernoulli and Binomial random variables, PMF formula, independent trial formulation.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000013: ConceptContent = {
  id: 'C-000013',
  title: 'Waiting Times & Rate Models: Geometric & Poisson Distributions',
  moduleId: 'M08',
  intuition:
    'When we repeat independent Bernoulli trials until the first success occurs, the number of trials needed follows a Geometric distribution. When we count the number of rare events occurring in a fixed interval of time or space at a constant average rate λ, the count follows a Poisson distribution. Both distributions possess countably infinite support.',
  formalDefinition:
    'Geometric Distribution: In the NPTEL transcript convention, X is the number of independent Bernoulli(p) trials until the first success occurs. Support S_X = {1, 2, 3, ...}. PMF P(X=k) = (1-p)^(k-1) p for k ≥ 1. Analytical CDF F_X(k) = 1 - (1-p)^k for k ≥ 1. Mean E[X] = 1/p, Var(X) = (1-p)/p^2.\nPoisson Distribution: X ~ Poisson(λ) models count of events with rate parameter λ ≥ 0. Support S_X = {0, 1, 2, ...}. PMF P(X=k) = e^(-λ) λ^k / k! for k ≥ 0. Mean E[X] = λ, Var(X) = λ.',
  formalDefinitionLatex:
    '\\begin{aligned} &\\textbf{Geometric}(p): \\quad S_X = \\{1, 2, 3, \\dots\\}, \\quad P(X = k) = (1-p)^{k-1} p, \\quad k \\in \\{1, 2, \\dots\\} \\\\[4pt] &F_X(k) = 1 - (1-p)^k, \\quad E[X] = \\frac{1}{p}, \\quad \\text{Var}(X) = \\frac{1-p}{p^2} \\\\[6pt] &\\textbf{Poisson}(\\lambda): \\quad S_X = \\{0, 1, 2, \\dots\\}, \\quad P(X = k) = \\frac{e^{-\\lambda} \\lambda^k}{k!}, \\quad k \\in \\{0, 1, \\dots\\} \\\\[4pt] &E[X] = \\lambda, \\quad \\text{Var}(X) = \\lambda \\end{aligned}',
  properties: [
    'Transcript Convention for Geometric Support: Support strictly starts at k = 1 (the trial number of the first success), requiring k - 1 preceding failures.',
    'Countably Infinite Support: Unlike Bernoulli and Binomial models, both Geometric and Poisson have infinite support {1, 2, ...} and {0, 1, 2, ...}.',
    'Equidispersion of Poisson: For the Poisson distribution, the mean and variance are identical: E[X] = Var(X) = λ.',
    'Memoryless Property of Geometric: P(X > s + t | X > s) = P(X > t), meaning past failed trials do not affect remaining waiting time.',
  ],
  sourceRef: {
    id: 'SRC-P1-CH08-002',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 8: Discrete random variables',
    note: 'Geometric waiting time (support starting at 1) and Poisson distribution PMF.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000014: ConceptContent = {
  id: 'C-000014',
  title: 'Law of Total Probability & Finite Partitions',
  moduleId: 'M03',
  intuition:
    'When direct calculation of an event A is difficult, we can divide the universe of possibilities into mutually exclusive and exhaustive scenarios (a partition {B_1, ..., B_n}). By computing the conditional probability of A under each scenario weighted by that scenario\'s likelihood, we recover the total probability P(A).',
  formalDefinition:
    'Let {B_1, B_2, ..., B_n} be a finite partition of the sample space Ω, such that B_i ∩ B_j = ∅ for i ≠ j, ∪_{i=1}^n B_i = Ω, and P(B_i) > 0 for each i. Then for any event A ⊆ Ω:\nP(A) = Σ_{i=1}^n P(A ∩ B_i) = Σ_{i=1}^n P(A | B_i) P(B_i).',
  formalDefinitionLatex:
    '\\bigcup_{i=1}^n B_i = \\Omega, \\quad B_i \\cap B_j = \\emptyset \\; (i \\ne j) \\implies P(A) = \\sum_{i=1}^n P(A \\mid B_i) P(B_i)',
  properties: [
    'Exhaustive Partition: Every possible outcome in Ω must belong to exactly one scenario partition block B_i.',
    'Scenario Weighting: P(A) is a weighted arithmetic mean of conditional probabilities P(A | B_i) with weights P(B_i).',
    'Non-zero Conditioning: Requires P(B_i) > 0 for all conditioning blocks to avoid zero-conditioning error E-COND-ZERO.',
  ],
  sourceRef: {
    id: 'SRC-P1-CH03-002',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 3: Total probability and partitions',
    note: 'Partition definition and Law of Total Probability formula.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000015: ConceptContent = {
  id: 'C-000015',
  title: 'Bayes\' Rule & Inverse Probability Updating',
  moduleId: 'M03',
  intuition:
    'Bayes\' Rule allows us to invert conditioning: given that an effect or evidence A has been observed, what is the probability that a specific underlying cause B_j was responsible? It updates our prior belief P(B_j) into a posterior belief P(B_j | A) using evidence likelihoods.',
  formalDefinition:
    'Let {B_1, ..., B_n} be a partition of Ω with P(B_i) > 0, and let A be an observed event with P(A) > 0. For any partition element B_j:\nP(B_j | A) = (P(A | B_j) P(B_j)) / P(A) = (P(A | B_j) P(B_j)) / (Σ_{i=1}^n P(A | B_i) P(B_i)).',
  formalDefinitionLatex:
    'P(B_j \\mid A) = \\frac{P(A \\mid B_j) P(B_j)}{\\sum_{i=1}^n P(A \\mid B_i) P(B_i)}',
  properties: [
    'Prior to Posterior: Prior probability P(B_j) is updated to posterior P(B_j | A) in light of evidence A.',
    'Likelihood Weighting: Hypotheses that predict evidence A with higher likelihood receive a proportional posterior boost.',
    'Denominator as Total Evidence: The normalizing denominator is P(A) evaluated via the Law of Total Probability.',
  ],
  sourceRef: {
    id: 'SRC-P1-CH04-002',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 4: Bayes theorem and diagnostic tests',
    note: 'Bayes rule for partitions and posterior computation.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000016: ConceptContent = {
  id: 'C-000016',
  title: 'Discrete Probability Mass Functions & Support',
  moduleId: 'M07',
  intuition:
    'A random variable X is discrete if its set of possible values (its support S_X) is finite or countably infinite. The Probability Mass Function assigns an exact probability mass to each value in this support.',
  formalDefinition:
    'Let X: Ω → ℝ be a discrete random variable with countable support S_X = {x_1, x_2, ...}. The Probability Mass Function (PMF) p_X: ℝ → [0, 1] is defined by:\np_X(x) = P(X = x) = P({ω ∈ Ω : X(ω) = x}).\nIt satisfies two fundamental conditions:\n1. Non-negativity: p_X(x) ≥ 0 for all x ∈ ℝ (and p_X(x) = 0 for x ∉ S_X).\n2. Total Mass Normalization: Σ_{x ∈ S_X} p_X(x) = 1.',
  formalDefinitionLatex:
    'p_X(x) = P(X = x), \\quad p_X(x) \\ge 0, \\quad \\sum_{x \\in S_X} p_X(x) = 1',
  properties: [
    'Countable Support: Discrete random variables can take at most countably many values (either finite or countably infinite like ℕ).',
    'Point Probabilities: Unlike continuous random variables where point probabilities are zero, discrete random variables place positive mass on individual points.',
    'Normalization Requirement: Any valid PMF must sum to exactly 1 over its entire support.',
  ],
  sourceRef: {
    id: 'SRC-P1-CH08-005',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 8: Discrete random variables',
    note: 'Definition of discrete random variables and PMF normalization conditions.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000017: ConceptContent = {
  id: 'C-000017',
  title: 'The Bridge Between PMF and CDF: Summations & Differences',
  moduleId: 'M07',
  intuition:
    'The PMF and CDF are two equivalent ways of characterizing a discrete random variable. You can build the CDF from the PMF by summing masses from left to right (running sum). Conversely, you can recover the PMF from the CDF by measuring the vertical jump discontinuity at each support point.',
  formalDefinition:
    'For discrete random variable X with PMF p_X(x) and support S_X:\nForward Bridge (PMF to CDF): F_X(x) = Σ_{t ≤ x, t ∈ S_X} p_X(t).\nInverse Bridge (CDF to PMF): p_X(x_k) = F_X(x_k) - F_X(x_k⁻) = F_X(x_k) - lim_{t ↑ x_k} F_X(t).\nInterval Bridge: P(a < X ≤ b) = F_X(b) - F_X(a).',
  formalDefinitionLatex:
    '\\begin{aligned} F_X(x) &= \\sum_{t \\le x} p_X(t) \\\\[4pt] p_X(x_k) &= F_X(x_k) - F_X(x_k^-) \\\\[4pt] P(a < X \\le b) &= F_X(b) - F_X(a) \\end{aligned}',
  properties: [
    'Bidirectional Equivalence: Knowing all values of the PMF completely determines the CDF, and knowing the CDF completely determines the PMF.',
    'Jump Discontinuities: The CDF of a discrete random variable is discontinuous exactly at the points where PMF mass is positive, with jump size equal to the mass.',
    'Interval Arithmetic: Standard half-open intervals (a, b] evaluate cleanly as F(b) - F(a) without endpoint corrections.',
  ],
  sourceRef: {
    id: 'SRC-P1-CH07-005',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 7: Cumulative distribution function',
    note: 'Interchangeability between discrete PMF and CDF.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000018: ConceptContent = {
  id: 'C-000018',
  title: 'Continuous Random Variables & Probability Density Functions',
  moduleId: 'M09',
  intuition:
    'A continuous random variable takes values in an uncountable continuum (such as real intervals). Unlike discrete models, the probability of any exact single point is zero. Instead, probability is represented by the area under a non-negative curve called the Probability Density Function (PDF).',
  formalDefinition:
    'A random variable X is continuous if there exists a non-negative integrable function f_X: ℝ → [0, ∞) called the Probability Density Function (PDF) such that for any measurable set B ⊆ ℝ:\nP(X ∈ B) = ∫_B f_X(x) dx.\nAxioms: 1. f_X(x) ≥ 0 for all x ∈ ℝ; 2. ∫_{-∞}^∞ f_X(x) dx = 1.\nFor any single real value c: P(X = c) = ∫_c^c f_X(x) dx = 0.',
  formalDefinitionLatex:
    'f_X(x) \\ge 0, \\quad \\int_{-\\infty}^\\infty f_X(x) dx = 1, \\quad P(a \\le X \\le b) = \\int_a^b f_X(x) dx',
  properties: [
    'Density Height vs Probability: The value f_X(x) is not a probability; it is probability per unit length and can exceed 1.',
    'Nullity of Singletons: P(X = c) = 0 for any single point c ∈ ℝ.',
    'Endpoint Invariance: P(a ≤ X ≤ b) = P(a < X ≤ b) = P(a ≤ X < b) = P(a < X < b).',
  ],
  sourceRef: {
    id: 'SRC-P2-CH02-001',
    part: 'Part 2',
    transcript_file: 'Review of Basic Probability 2.md',
    chapter: 'Chapter 2: Continuous random variables',
    note: 'Continuous random variable and PDF definitions.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000019: ConceptContent = {
  id: 'C-000019',
  title: 'Continuous Cumulative Distribution Functions & The Calculus Bridge',
  moduleId: 'M09',
  intuition:
    'The Cumulative Distribution Function F_X(x) gives the accumulated probability up to point x. For continuous random variables, F_X(x) is continuous everywhere. Integration transforms the PDF into the CDF, and differentiation recovers the PDF from the CDF by the Fundamental Theorem of Calculus.',
  formalDefinition:
    'For a continuous random variable X with PDF f_X(x):\nAccumulation Bridge: F_X(x) = P(X ≤ x) = ∫_{-∞}^x f_X(t) dt.\nDifferentiation Bridge: At every continuity point of f_X, f_X(x) = (d/dx) F_X(x).\nInterval Evaluation: P(a < X ≤ b) = F_X(b) - F_X(a).',
  formalDefinitionLatex:
    'F_X(x) = \\int_{-\\infty}^x f_X(t) dt, \\quad f_X(x) = \\frac{d}{dx} F_X(x), \\quad P(a \\le X \\le b) = F_X(b) - F_X(a)',
  properties: [
    'Everywhere Continuous: F_X(x) has no vertical jump discontinuities; jumps only exist when discrete point mass is present.',
    'Limits at Infinity: lim_{x → -∞} F_X(x) = 0 and lim_{x → +∞} F_X(x) = 1.',
    'Slope as Density: The instantaneous slope of the CDF is the probability density.',
  ],
  sourceRef: {
    id: 'SRC-P2-CH03-001',
    part: 'Part 2',
    transcript_file: 'Review of Basic Probability 2.md',
    chapter: 'Chapter 3: PDF and CDF definitions',
    note: 'CDF integration from PDF and differentiation relationship.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000020: ConceptContent = {
  id: 'C-000020',
  title: 'Continuous Distribution Families: Uniform & Exponential',
  moduleId: 'M10',
  intuition:
    'The Uniform distribution models complete lack of preference over an interval [a, b] (flat constant density). The Exponential distribution models waiting times between independent Poisson events with constant hazard rate λ, uniquely characterized by its memoryless property.',
  formalDefinition:
    'Uniform Distribution: X ~ Uniform(a, b), a < b. f(x) = 1/(b-a) for x ∈ [a, b]. F(x) = (x-a)/(b-a) on [a, b]. E[X] = (a+b)/2, Var(X) = (b-a)^2 / 12.\nExponential Distribution: X ~ Exponential(λ), λ > 0. f(x) = λ e^(-λx) for x ≥ 0. F(x) = 1 - e^(-λx) for x ≥ 0. E[X] = 1/λ, Var(X) = 1/λ^2.',
  formalDefinitionLatex:
    '\\begin{aligned} &\\textbf{Uniform}(a, b): \\quad f(x) = \\frac{1}{b - a} \\; (a \\le x \\le b), \\quad E[X] = \\frac{a+b}{2}, \\quad \\text{Var}(X) = \\frac{(b-a)^2}{12} \\\\[6pt] &\\textbf{Exponential}(\\lambda): \\quad f(x) = \\lambda e^{-\\lambda x} \\; (x \\ge 0), \\quad E[X] = \\frac{1}{\\lambda}, \\quad \\text{Var}(X) = \\frac{1}{\\lambda^2} \\end{aligned}',
  properties: [
    'Memoryless Property of Exponential: P(X > s + t | X > s) = P(X > t).',
    'Constant Hazard Rate: The conditional failure rate of an exponential random variable is constant λ over time.',
    'Uniform Area: For Uniform(a, b), probability is simply the ratio of subinterval length to total length (b - a).',
  ],
  sourceRef: {
    id: 'SRC-P2-CH04-001',
    part: 'Part 2',
    transcript_file: 'Review of Basic Probability 2.md',
    chapter: 'Chapter 4: Common distributions',
    note: 'Uniform and Exponential distributions, PDF, CDF, expectation and variance.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000021: ConceptContent = {
  id: 'C-000021',
  title: 'The Gaussian (Normal) Distribution & Standard Normal Table',
  moduleId: 'M10',
  intuition:
    'The Gaussian (Normal) distribution is the cornerstone of probability and statistics due to the Central Limit Theorem. Symmetrical and bell-shaped, it is completely determined by its mean μ and variance σ². Any normal variable can be standardized to Z ~ N(0, 1) using Z = (X - μ) / σ.',
  formalDefinition:
    'X ~ Normal(μ, σ²), σ > 0. Support ℝ.\nf_X(x) = (1 / (σ √(2π))) exp(-(x - μ)² / (2σ²)).\nMean E[X] = μ, Var(X) = σ².\nStandardization: Z = (X - μ) / σ ~ Normal(0, 1).\nStandard Normal CDF: Φ(z) = (1 / √(2π)) ∫_{-∞}^z e^(-t²/2) dt. Symmetry: Φ(-z) = 1 - Φ(z).',
  formalDefinitionLatex:
    'f_X(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} \\exp\\left(-\\frac{(x - \\mu)^2}{2\\sigma^2}\\right), \\quad Z = \\frac{X - \\mu}{\\sigma}, \\quad \\Phi(-z) = 1 - \\Phi(z)',
  properties: [
    'Symmetry About the Mean: f(μ - x) = f(μ + x) for all x.',
    'Empirical Rule: Approximately 68.27% of probability mass lies in [μ - σ, μ + σ], 95.45% in [μ - 2σ, μ + 2σ], and 99.73% in [μ - 3σ, μ + 3σ].',
    'Invariance Under Affine Transforms: If X ~ N(μ, σ²), then aX + b ~ N(aμ + b, a²σ²).',
  ],
  sourceRef: {
    id: 'SRC-P2-CH04-002',
    part: 'Part 2',
    transcript_file: 'Review of Basic Probability 2.md',
    chapter: 'Chapter 4: Common distributions',
    note: 'Gaussian distribution, standardization, and standard normal CDF.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000022: ConceptContent = {
  id: 'C-000022',
  title: 'Transformations of Random Variables & The Change-of-Variables Formula',
  moduleId: 'M11',
  intuition:
    'When a continuous random variable X is transformed by a smooth invertible function Y = g(X), the density changes not only by shifting values through g, but also by stretching or compressing probability space. The Jacobian scale factor |d/dy g⁻¹(y)| preserves probability mass.',
  formalDefinition:
    'Let X be a continuous random variable with PDF f_X(x), and let Y = g(X) where g: ℝ → ℝ is strictly monotonic and differentiable with inverse x = g⁻¹(y). Then the PDF of Y is:\nf_Y(y) = f_X(g⁻¹(y)) · |(d/dy) g⁻¹(y)| = f_X(g⁻¹(y)) / |g\'(g⁻¹(y))|.',
  formalDefinitionLatex:
    'f_Y(y) = f_X(g^{-1}(y)) \\left| \\frac{d}{dy} g^{-1}(y) \\right| = \\frac{f_X(x)}{|g\'(x)|} \\quad \\text{where } x = g^{-1}(y)',
  properties: [
    'Probability Conservation: P(y_1 ≤ Y ≤ y_2) = P(g⁻¹(y_1) ≤ X ≤ g⁻¹(y_2)).',
    'Jacobian Scale Factor: The derivative accounts for the local stretch or compression of the infinitesimal interval dy.',
    'Invertibility Requirement: The direct formula requires g to be strictly increasing or strictly decreasing.',
  ],
  sourceRef: {
    id: 'SRC-P2-CH05-001',
    part: 'Part 2',
    transcript_file: 'Review of Basic Probability 2.md',
    chapter: 'Chapter 5: Functions of random variables',
    note: 'Monotone transformation theorem and Jacobian scaling.',
  },
  classification: 'source_derived',
};

export const CONCEPT_C000023: ConceptContent = {
  id: 'C-000023',
  title: 'Linear Transformations & The General CDF Method',
  moduleId: 'M11',
  intuition:
    'For linear/affine transformations Y = aX + b, the density scales by 1/|a|. For non-monotone transformations (such as Y = X²), the direct change-of-variables formula cannot be applied directly; instead, we use the foundational CDF method: determine F_Y(y) = P(Y ≤ y) by integrating over the pre-image, then differentiate.',
  formalDefinition:
    'Linear Transformation: If Y = aX + b (a ≠ 0), then f_Y(y) = (1 / |a|) f_X((y - b) / a).\nCDF Method for Non-Monotone Maps: 1. Express F_Y(y) = P(g(X) ≤ y) = ∫_{x: g(x) ≤ y} f_X(x) dx; 2. Differentiate F_Y(y) with respect to y to obtain f_Y(y) = (d/dy) F_Y(y).\nFor Y = X² (y ≥ 0): F_Y(y) = P(-√y ≤ X ≤ √y) = F_X(√y) - F_X(-√y), so f_Y(y) = (f_X(√y) + f_X(-√y)) / (2√y).',
  formalDefinitionLatex:
    '\\begin{aligned} &Y = aX + b \\implies f_Y(y) = \\frac{1}{|a|} f_X\\left(\\frac{y - b}{a}\\right) \\\\[4pt] &Y = X^2 \\implies f_Y(y) = \\frac{f_X(\\sqrt{y}) + f_X(-\\sqrt{y})}{2\\sqrt{y}} \\quad (y > 0) \\end{aligned}',
  properties: [
    'Universal Applicability of CDF Method: The CDF method works for any measurable transformation, monotone or non-monotone.',
    'Scale Inversion: Scaling X by factor a compresses the density height by 1/|a|.',
    'Support Tracking: Always determine the image domain S_Y = g(S_X) to know where f_Y(y) > 0.',
  ],
  sourceRef: {
    id: 'SRC-P2-CH05-002',
    part: 'Part 2',
    transcript_file: 'Review of Basic Probability 2.md',
    chapter: 'Chapter 5: Functions of random variables',
    note: 'Linear scaling formula and square transformation via CDF method.',
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

export const EXERCISE_EX000009: ExerciseContent = {
  id: 'EX-000009',
  title: 'Interval Probability on Discrete Distribution',
  moduleId: 'M06',
  category: 'numerical',
  linkedConceptIds: ['C-000010', 'C-000011'],
  prompt:
    'A discrete random variable X has support {0, 1, 2} with probability masses P(X=0)=1/4, P(X=1)=1/2, and P(X=2)=1/4. Calculate the interval probability P(0 < X ≤ 2). Express your answer as a simplified fraction or decimal.',
  promptLatex:
    '\\begin{aligned} &S_X = \\{0, 1, 2\\}, \\quad P(X=0)=\\frac{1}{4}, \\quad P(X=1)=\\frac{1}{2}, \\quad P(X=2)=\\frac{1}{4} \\\\[4pt] &\\text{Find } P(0 < X \\le 2). \\end{aligned}',
  expectedRational: { num: 3n, den: 4n },
  explanation:
    'Using the CDF relationship: P(0 < X ≤ 2) = F(2) - F(0). From the point masses, F(2) = 1 and F(0) = 1/4. Therefore, P(0 < X ≤ 2) = 1 - 1/4 = 3/4 (or 0.75). Equivalently, summing the masses of support points in (0, 2]: P(X=1) + P(X=2) = 1/2 + 1/4 = 3/4.',
  explanationLatex:
    'P(0 < X \\le 2) = F(2) - F(0) = 1 - \\frac{1}{4} = \\frac{3}{4} = 0.75',
  sourceRef: {
    id: 'SRC-P1-CH07-003',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 7: Cumulative distribution function',
    note: 'Interval probability evaluation via CDF.',
  },
  classification: 'supplementary',
};

export const EXERCISE_EX000010: ExerciseContent = {
  id: 'EX-000010',
  title: 'Point Mass Retrieval from CDF Jump Discontinuity',
  moduleId: 'M06',
  category: 'numerical',
  linkedConceptIds: ['C-000010', 'C-000011'],
  prompt:
    'A discrete random variable X has CDF F(x). At point x = 1, the CDF evaluates to F(1) = 3/4 (0.75), while the left-hand limit is F(1⁻) = lim_{t ↑ 1} F(t) = 1/4 (0.25). Calculate the exact point mass P(X = 1).',
  promptLatex:
    'F(1) = \\frac{3}{4}, \\quad F(1^-) = \\lim_{t \\uparrow 1} F(t) = \\frac{1}{4}. \\quad \\text{Find } P(X = 1).',
  expectedRational: { num: 1n, den: 2n },
  explanation:
    'For any random variable, the point probability at x is the vertical jump discontinuity in its CDF: P(X = x) = F(x) - F(x⁻). Here, P(X = 1) = F(1) - F(1⁻) = 3/4 - 1/4 = 2/4 = 1/2 (or 0.50).',
  explanationLatex:
    'P(X = 1) = F(1) - F(1^-) = \\frac{3}{4} - \\frac{1}{4} = \\frac{2}{4} = \\frac{1}{2} = 0.50',
  sourceRef: {
    id: 'SRC-P1-CH07-004',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 7: Cumulative distribution function',
    note: 'Point mass retrieval from jump size.',
  },
  classification: 'source_derived',
};

export const EXERCISE_EX000011: ExerciseContent = {
  id: 'EX-000011',
  title: 'Binomial Probability of Exact Success Count',
  moduleId: 'M08',
  category: 'numerical',
  linkedConceptIds: ['C-000012'],
  prompt:
    'In a sequence of n = 4 independent Bernoulli trials with success probability p = 1/3, let X denote the total number of successes (X ~ Binomial(4, 1/3)). Calculate the exact probability of observing exactly k = 2 successes, P(X = 2). Express your answer as a simplified fraction.',
  promptLatex:
    'X \\sim \\text{Binomial}\\left(n = 4, p = \\frac{1}{3}\\right). \\quad \\text{Find } P(X = 2).',
  expectedRational: { num: 8n, den: 27n },
  explanation:
    'Using the Binomial PMF formula: P(X = k) = C(n, k) p^k (1-p)^(n-k). Here n = 4, k = 2, p = 1/3, and 1 - p = 2/3. The binomial coefficient is C(4, 2) = 4! / (2! 2!) = 6. Thus P(X = 2) = 6 * (1/3)^2 * (2/3)^2 = 6 * (1/9) * (4/9) = 24 / 81 = 8 / 27 (approx 0.2963).',
  explanationLatex:
    'P(X = 2) = \\binom{4}{2} \\left(\\frac{1}{3}\\right)^2 \\left(1 - \\frac{1}{3}\\right)^{4 - 2} = 6 \\times \\frac{1}{9} \\times \\frac{4}{9} = \\frac{24}{81} = \\frac{8}{27} \\approx 0.2963',
  sourceRef: {
    id: 'SRC-P1-CH08-003',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 8: Discrete random variables',
    note: 'Binomial PMF calculation on independent Bernoulli trials.',
  },
  classification: 'source_derived',
};

export const EXERCISE_EX000012: ExerciseContent = {
  id: 'EX-000012',
  title: 'Geometric Waiting Time for First Success',
  moduleId: 'M08',
  category: 'numerical',
  linkedConceptIds: ['C-000013'],
  prompt:
    'A biased coin lands on Heads with probability p = 1/4 on each independent toss. Let random variable X denote the number of tosses until the first Head appears, following the geometric distribution on support {1, 2, 3, ...}. Calculate the probability that the first Head appears on exactly the 3rd toss, P(X = 3). Express your answer as a simplified fraction.',
  promptLatex:
    'X \\sim \\text{Geometric}\\left(p = \\frac{1}{4}\\right) \\quad \\text{on support } \\{1, 2, 3, \\dots\\}. \\quad \\text{Find } P(X = 3).',
  expectedRational: { num: 9n, den: 64n },
  explanation:
    'Per the transcript convention, the Geometric distribution support begins at 1 (the trial number of the first success). For the first success to occur on the 3rd toss, the first two tosses must be failures (Tails) followed by a success (Head): P(X = 3) = (1 - p)^(3 - 1) * p = (1 - 1/4)^2 * (1/4) = (3/4)^2 * (1/4) = (9/16) * (1/4) = 9/64 (or 0.140625).',
  explanationLatex:
    'P(X = 3) = (1 - p)^{3 - 1} p = \\left(1 - \\frac{1}{4}\\right)^2 \\left(\\frac{1}{4}\\right) = \\left(\\frac{3}{4}\\right)^2 \\times \\frac{1}{4} = \\frac{9}{16} \\times \\frac{1}{4} = \\frac{9}{64} = 0.140625',
  sourceRef: {
    id: 'SRC-P1-CH08-004',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 8: Discrete random variables',
    note: 'Geometric waiting time calculation with support starting at 1.',
  },
  classification: 'source_derived',
};

export const EXERCISE_EX000013: ExerciseContent = {
  id: 'EX-000013',
  title: 'Total Probability Across Factory Production Lines',
  moduleId: 'M03',
  category: 'numerical',
  linkedConceptIds: ['C-000014'],
  prompt:
    'A factory produces computer microchips using three manufacturing lines: M₁, M₂, and M₃, which manufacture 50% (1/2), 30% (3/10), and 20% (1/5) of total factory output respectively. The defect rates for the three lines are P(D | M₁) = 1/100 (0.01), P(D | M₂) = 2/100 (0.02), and P(D | M₃) = 5/100 (0.05). Using the Law of Total Probability, calculate the overall probability P(D) that a randomly chosen microchip from the factory is defective. Express your answer as a simplified fraction or decimal.',
  promptLatex:
    '\\begin{aligned} &P(M_1) = \\frac{1}{2}, \\quad P(M_2) = \\frac{3}{10}, \\quad P(M_3) = \\frac{1}{5} \\\\[4pt] &P(D \\mid M_1) = \\frac{1}{100}, \\quad P(D \\mid M_2) = \\frac{2}{100}, \\quad P(D \\mid M_3) = \\frac{5}{100} \\\\[4pt] &\\text{Find } P(D) = \\sum_{i=1}^3 P(D \\mid M_i) P(M_i). \\end{aligned}',
  expectedRational: { num: 21n, den: 1000n },
  explanation:
    'By the Law of Total Probability: P(D) = P(D | M₁)P(M₁) + P(D | M₂)P(M₂) + P(D | M₃)P(M₃) = (1/100)(1/2) + (2/100)(3/10) + (5/100)(1/5) = 5/1000 + 6/1000 + 10/1000 = 21/1000 (0.021).',
  explanationLatex:
    'P(D) = \\left(\\frac{1}{100}\\right)\\left(\\frac{1}{2}\\right) + \\left(\\frac{2}{100}\\right)\\left(\\frac{3}{10}\\right) + \\left(\\frac{5}{100}\\right)\\left(\\frac{1}{5}\\right) = \\frac{5 + 6 + 10}{1000} = \\frac{21}{1000} = 0.021',
  sourceRef: {
    id: 'SRC-P1-CH03-003',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 3: Total probability and partitions',
    note: 'Standard 3-partition production defect application of total probability.',
  },
  classification: 'supplementary',
};

export const EXERCISE_EX000014: ExerciseContent = {
  id: 'EX-000014',
  title: 'Posterior Line Attribution via Bayes\' Rule',
  moduleId: 'M03',
  category: 'numerical',
  linkedConceptIds: ['C-000014', 'C-000015'],
  prompt:
    'Continuing from the factory scenario with lines M₁, M₂, and M₃: an inspector tests a randomly selected chip and finds it is defective (event D). Calculate the posterior probability P(M₃ | D) that this defective chip came from line M₃. Express your answer as a simplified fraction.',
  promptLatex:
    'P(D \\mid M_3) = \\frac{5}{100}, \\quad P(M_3) = \\frac{1}{5}, \\quad P(D) = \\frac{21}{1000}. \\quad \\text{Find } P(M_3 \\mid D).',
  expectedRational: { num: 10n, den: 21n },
  explanation:
    'Using Bayes\' Rule: P(M₃ | D) = P(D | M₃)P(M₃) / P(D). The numerator is (5/100) * (1/5) = 1/100 = 10/1000. The denominator is P(D) = 21/1000. Therefore, P(M₃ | D) = (10/1000) / (21/1000) = 10/21 (≈ 0.4762).',
  explanationLatex:
    'P(M_3 \\mid D) = \\frac{P(D \\mid M_3)P(M_3)}{P(D)} = \\frac{\\frac{1}{100}}{\\frac{21}{1000}} = \\frac{10}{21} \\approx 0.4762',
  sourceRef: {
    id: 'SRC-P1-CH04-003',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 4: Bayes theorem and diagnostic tests',
    note: 'Posterior probability calculation for partition branch.',
  },
  classification: 'supplementary',
};

export const EXERCISE_EX000015: ExerciseContent = {
  id: 'EX-000015',
  title: 'PMF Normalization Constant & Tail Probability',
  moduleId: 'M07',
  category: 'numerical',
  linkedConceptIds: ['C-000016'],
  prompt:
    'A discrete random variable X has support S_X = {1, 2, 3, 4} with PMF given by p_X(k) = c · k for k ∈ {1, 2, 3, 4}, where c is a positive normalizing constant. Calculate the tail probability P(X ≥ 3). Express your answer as a simplified fraction or decimal.',
  promptLatex:
    'S_X = \\{1, 2, 3, 4\\}, \\quad p_X(k) = c \\cdot k. \\quad \\text{Find } P(X \\ge 3).',
  expectedRational: { num: 7n, den: 10n },
  explanation:
    'First find normalizing constant c: Σ_{k=1}^4 p_X(k) = c(1 + 2 + 3 + 4) = 10c = 1, so c = 1/10. The individual masses are p(1) = 1/10, p(2) = 2/10, p(3) = 3/10, and p(4) = 4/10. Then P(X ≥ 3) = p(3) + p(4) = 3/10 + 4/10 = 7/10 (or 0.70).',
  explanationLatex:
    '\\sum_{k=1}^4 c k = 10 c = 1 \\implies c = \\frac{1}{10}. \\quad P(X \\ge 3) = p(3) + p(4) = \\frac{3}{10} + \\frac{4}{10} = \\frac{7}{10} = 0.70',
  sourceRef: {
    id: 'SRC-P1-CH08-006',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 8: Discrete random variables',
    note: 'Linear discrete PMF normalization and tail probability.',
  },
  classification: 'supplementary',
};

export const EXERCISE_EX000016: ExerciseContent = {
  id: 'EX-000016',
  title: 'Inverse Bridge: Extracting PMF Mass from CDF Steps',
  moduleId: 'M07',
  category: 'numerical',
  linkedConceptIds: ['C-000016', 'C-000017'],
  prompt:
    'A discrete random variable X has staircase CDF F(x) specified as follows: F(x) = 0 for x < 0; F(x) = 1/5 (0.20) for 0 ≤ x < 2; F(x) = 13/20 (0.65) for 2 ≤ x < 5; and F(x) = 1 for x ≥ 5. Using the jump discontinuity formula p_X(x) = F(x) - F(x⁻), calculate the exact point mass P(X = 2). Express your answer as a simplified fraction.',
  promptLatex:
    'F(x) = \\begin{cases} 0 & x < 0 \\\\ \\frac{1}{5} & 0 \\le x < 2 \\\\ \\frac{13}{20} & 2 \\le x < 5 \\\\ 1 & x \\ge 5 \\end{cases} \\quad \\text{Find } P(X = 2).',
  expectedRational: { num: 9n, den: 20n },
  explanation:
    'The point mass at x = 2 is the vertical step in the CDF at that point: P(X = 2) = F(2) - F(2⁻). Here F(2) = 13/20 and F(2⁻) = lim_{t ↑ 2} F(t) = 1/5 = 4/20. Thus P(X = 2) = 13/20 - 4/20 = 9/20 (or 0.45).',
  explanationLatex:
    'P(X = 2) = F(2) - F(2^-) = \\frac{13}{20} - \\frac{1}{5} = \\frac{13}{20} - \\frac{4}{20} = \\frac{9}{20} = 0.45',
  sourceRef: {
    id: 'SRC-P1-CH07-006',
    part: 'Part 1',
    transcript_file: 'Review of Basic Probability 1.md',
    chapter: 'Chapter 7: Cumulative distribution function',
    note: 'Extracting discrete PMF masses from jump sizes in CDF.',
  },
  classification: 'supplementary',
};

export const EXERCISE_EX000017: ExerciseContent = {
  id: 'EX-000017',
  title: 'Continuous PDF Normalization Constant',
  moduleId: 'M09',
  category: 'numerical',
  linkedConceptIds: ['C-000018', 'C-000019'],
  prompt:
    'A continuous random variable X has probability density function f_X(x) = c · x² for x ∈ [0, 3], and f_X(x) = 0 otherwise. Determine the exact value of the normalizing constant c such that f_X is a valid probability density function. Express your answer as a simplified fraction.',
  promptLatex:
    'f_X(x) = c x^2 \\quad (0 \\le x \\le 3), \\quad \\int_0^3 f_X(x) dx = 1. \\quad \\text{Find } c.',
  expectedRational: { num: 1n, den: 9n },
  explanation:
    'By the normalization condition for a continuous PDF, the total area under f_X(x) must equal 1: ∫_0^3 c x² dx = c [x³/3]_0^3 = c (27/3) = 9c = 1. Therefore, c = 1/9.',
  explanationLatex:
    '\\int_0^3 c x^2 dx = c \\left[ \\frac{x^3}{3} \\right]_0^3 = 9c = 1 \\implies c = \\frac{1}{9}',
  sourceRef: {
    id: 'SRC-P2-CH02-002',
    part: 'Part 2',
    transcript_file: 'Review of Basic Probability 2.md',
    chapter: 'Chapter 2: Continuous random variables',
    note: 'Polynomial density normalization on compact support.',
  },
  classification: 'source_derived',
};

export const EXERCISE_EX000018: ExerciseContent = {
  id: 'EX-000018',
  title: 'Uniform Distribution Interval Probability',
  moduleId: 'M09',
  category: 'numerical',
  linkedConceptIds: ['C-000018', 'C-000020'],
  prompt:
    'A continuous random variable X is uniformly distributed over the interval [2, 10] (X ~ Uniform(2, 10)) with constant density f_X(x) = 1/8. Calculate the interval probability P(4 ≤ X ≤ 8). Express your answer as a simplified fraction or decimal.',
  promptLatex:
    'X \\sim \\text{Uniform}(2, 10), \\quad f_X(x) = \\frac{1}{10 - 2} = \\frac{1}{8}. \\quad \\text{Find } P(4 \\le X \\le 8).',
  expectedRational: { num: 1n, den: 2n },
  explanation:
    'For a Uniform(a, b) distribution, the interval probability is the length of the subinterval divided by the total support length: P(4 ≤ X ≤ 8) = ∫_4^8 (1/8) dx = (8 - 4) / 8 = 4/8 = 1/2 (or 0.50). In continuous models, endpoint inclusion does not change the probability.',
  explanationLatex:
    'P(4 \\le X \\le 8) = \\int_4^8 \\frac{1}{8} dx = \\frac{8 - 4}{8} = \\frac{4}{8} = \\frac{1}{2} = 0.50',
  sourceRef: {
    id: 'SRC-P2-CH04-003',
    part: 'Part 2',
    transcript_file: 'Review of Basic Probability 2.md',
    chapter: 'Chapter 4: Common distributions',
    note: 'Uniform interval probability calculation and endpoint equivalence.',
  },
  classification: 'source_derived',
};

export const EXERCISE_EX000019: ExerciseContent = {
  id: 'EX-000019',
  title: 'Continuous Exponential-Decay Interval Evaluation',
  moduleId: 'M10',
  category: 'numerical',
  linkedConceptIds: ['C-000019', 'C-000020'],
  prompt:
    'A continuous random variable X has CDF given by F_X(x) = 1 - (1/4)^x for x ≥ 0 (and F_X(x) = 0 for x < 0). Calculate the exact interval probability P(1 ≤ X ≤ 2). Express your answer as a simplified fraction.',
  promptLatex:
    'F_X(x) = 1 - \\left(\\frac{1}{4}\\right)^x \\quad (x \\ge 0). \\quad \\text{Find } P(1 \\le X \\le 2) = F(2) - F(1).',
  expectedRational: { num: 3n, den: 16n },
  explanation:
    'Using the CDF interval relation: P(1 ≤ X ≤ 2) = F(2) - F(1) = [1 - (1/4)²] - [1 - (1/4)¹] = (1/4) - (1/16) = 4/16 - 1/16 = 3/16 (or 0.1875).',
  explanationLatex:
    'P(1 \\le X \\le 2) = F(2) - F(1) = \\left[1 - \\frac{1}{16}\\right] - \\left[1 - \\frac{1}{4}\\right] = \\frac{1}{4} - \\frac{1}{16} = \\frac{3}{16} = 0.1875',
  sourceRef: {
    id: 'SRC-P2-CH03-002',
    part: 'Part 2',
    transcript_file: 'Review of Basic Probability 2.md',
    chapter: 'Chapter 3: PDF and CDF definitions',
    note: 'Exponential-decay CDF interval difference evaluation.',
  },
  classification: 'supplementary',
};

export const EXERCISE_EX000020: ExerciseContent = {
  id: 'EX-000020',
  title: 'Linear Transformation Density Scale Factor',
  moduleId: 'M11',
  category: 'numerical',
  linkedConceptIds: ['C-000022', 'C-000023'],
  prompt:
    'Let continuous random variable X be uniformly distributed on [0, 4] with density f_X(x) = 1/4. A new random variable Y is defined by the affine transformation Y = 2X + 3. Using the transformation formula f_Y(y) = (1 / |a|) f_X((y - b) / a) with a = 2, calculate the constant density height of f_Y(y) on its support [3, 11]. Express your answer as a simplified fraction.',
  promptLatex:
    'X \\sim \\text{Uniform}(0, 4), \\quad f_X(x) = \\frac{1}{4}, \\quad Y = 2X + 3.\\newline \\text{Find the density height } f_Y(y) \\text{ on support } [3, 11].',
  expectedRational: { num: 1n, den: 8n },
  explanation:
    'By the linear transformation rule for continuous densities, stretching the variable by a factor of 2 compresses the density by 1/|a| = 1/2: f_Y(y) = (1/2) f_X((y - 3)/2) = (1/2) * (1/4) = 1/8. Notice that on support [3, 11] of width 8, the total area is (8) * (1/8) = 1.',
  explanationLatex:
    'f_Y(y) = \\frac{1}{|a|} f_X\\left(\\frac{y - b}{a}\\right) = \\frac{1}{2} \\times \\frac{1}{4} = \\frac{1}{8}',
  sourceRef: {
    id: 'SRC-P2-CH05-003',
    part: 'Part 2',
    transcript_file: 'Review of Basic Probability 2.md',
    chapter: 'Chapter 5: Functions of random variables',
    note: 'Affine transformation density scaling factor.',
  },
  classification: 'source_derived',
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
  EXERCISE_EX000009,
  EXERCISE_EX000010,
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
];

export function getExerciseById(id: string): ExerciseContent | undefined {
  return ALL_EXERCISES.find((e) => e.id === id);
}

export function getExercisesByModule(moduleId: string): readonly ExerciseContent[] {
  return ALL_EXERCISES.filter((e) => e.moduleId === moduleId);
}
