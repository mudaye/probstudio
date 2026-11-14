# Probability Revision Studio
## Product & Architecture Specification

**Document ID:** PRS-PAS-001  
**Version:** 0.1  
**Status:** Initial design baseline — approved direction, architecture to be refined  
**Last updated:** 14 November 2026

---

# 1. Project Overview

## 1.1 Purpose

Probability Revision Studio is an interactive, browser-based learning environment designed to help learners understand, practise, revise and experiment with concepts in probability theory.

The initial content is based on a three-part YouTube tutorial series titled *Review of Basic Probability*.

The curriculum is based on all three parts of the Review of Basic Probability series. Part 1 establishes probability foundations and discrete random variables; Parts 2 and 3 extend the same application to continuous and joint probability, moments and inequalities.

The objective is not merely to reproduce the tutorial content in a digital format. The application should transform the material into an active learning experience that combines:

- Structured conceptual explanations.
- Mathematical definitions and properly typeset formulae.
- Worked examples and derivations.
- Interactive exercises and assessments.
- Computational experiments and visualisations.
- Personalised revision and feedback.

## 1.2 Learning Philosophy

The application follows three complementary learning activities:

1. **Understand:** Develop conceptual and mathematical understanding.
2. **Practise:** Apply concepts, retrieve information and solve problems.
3. **Experiment:** Manipulate mathematical models and observe their behaviour.

The experience should encourage reasoning rather than formula memorisation.

The application must explain not only what a formula says, but also:
- Why it works.
- Under what conditions it applies.
- How it relates to other concepts.
- What common mistakes arise when applying it.

## 1.3 Target Experience

The application should feel like a personal mathematics learning laboratory rather than a conventional online course or quiz application.

It should support both structured learning and independent exploration.

The learner must be able to navigate freely between concepts, exercises and experiments without being forced into a rigid sequence.

---

# 2. Product Design Decisions

The following decisions establish the approved product direction.

| ID | Decision | Status |
|---|---|---|
| PD-01 | Balanced learning experience combining concepts, practice and experimentation | Approved |
| PD-02 | Six initial interactive laboratories, with custom experiment construction | Approved |
| PD-03 | LLM-ready architecture, but no mandatory LLM integration in the initial implementation | Approved |
| PD-04 | Deterministic mathematical computation and answer validation | Approved |
| PD-05 | Proper mathematical notation using LaTeX rendering | Approved |
| PD-06 | One application accommodating all three tutorial parts | Approved |
| PD-07 | Extend the existing application rather than creating separate applications for each tutorial part | Approved |
| PD-08 | Modules organise where content lives; the learner chooses the entry point. Parts and modules are browsable groupings, not progression gates; the three learning environments are co-equal entry points, and progress is primarily tracked at concept and exercise level. | Approved |

## 2.1 Learning Experience: Balanced Learning Studio

Three equally important learning environments will form the foundation.

### A. Concept Atlas

A structured, navigable representation of probability concepts.

Each concept should support:

- Intuitive explanation.
- Formal mathematical definition.
- Mathematical notation.
- Conditions and assumptions.
- Worked examples.
- Step-by-step derivations where relevant.
- Connections to related concepts.
- Common misconceptions.
- Knowledge-check questions.

Concepts should have explicit relationships, including prerequisites and dependencies.

The Concept Atlas should eventually support a visual concept map.

### B. Practice Gym

An environment for active recall and problem-solving.

Supported exercise categories should include:

1. Concept identification.
2. Formula selection.
3. Numerical calculations.
4. Mathematical derivations.
5. Error detection and correction.
6. Scenario-based modelling.
7. Interpretation of mathematical results.

Feedback should go beyond a binary correct/incorrect result.

Where appropriate, the system should:
- Identify the error.
- Explain the underlying misconception.
- Offer progressively more revealing hints.
- Show the complete worked solution.
- Suggest related concepts for revision.

### C. Probability Playground

A computational environment for constructing and experimenting with probability models.

It should allow learners to manipulate parameters, construct events, define random variables, observe probability distributions and compare theoretical results with simulations.

The playground must support both guided experiments and independent exploration.

---

# 3. Probability Playground Specification

The playground is a central feature, not an optional collection of demonstrations.

Its purpose is to make abstract mathematical concepts tangible through manipulation, computation and visualisation.

## 3.1 Initial Interactive Laboratories

### PL-01: Event and Probability Builder

**Purpose:** Explore sample spaces, events, set operations and probability axioms.

Capabilities:
- Construct finite sample spaces.
- Define events as subsets.
- Explore unions, intersections and complements.
- Assign probabilities to individual outcomes.
- Calculate event probabilities.
- Explore mutually exclusive events.
- Validate probability assignments against the axioms.

Initial example: Tossing two coins.

### PL-02: Conditional Probability and Bayes Laboratory

**Purpose:** Understand conditional probability, partitions, total probability and Bayes' rule.

Capabilities:
- Construct scenarios involving multiple populations or groups.
- Define prior probabilities and conditional probabilities.
- Explore partitions.
- Calculate conditional probabilities.
- Apply the total probability law.
- Apply Bayes' rule.
- Observe the difference between forward and reverse conditional probabilities.

Initial example: Medical diagnostic testing with adjustable prevalence, sensitivity and specificity.

### PL-03: Independence Laboratory

**Purpose:** Explore different forms of independence.

Capabilities:
- Manipulate marginal and joint probabilities.
- Test independence using the product rule.
- Explore mutually exclusive versus independent events.
- Examine relationships involving complementary events.
- Compare pairwise and total independence.
- Explore conditional independence.

The laboratory should include examples where:
- Events are pairwise independent but not totally independent.
- Events are conditionally independent but not unconditionally independent.
- Events are independent but not conditionally independent given another event.

### PL-04: Random Variable Mapper

**Purpose:** Understand random variables as deterministic mappings from sample spaces to real numbers.

Capabilities:
- Construct a finite sample space.
- Define numerical mappings.
- Map multiple outcomes to the same numerical value.
- Calculate the induced probability measure.
- Generate possible values and their probabilities.
- Compare different random variables defined on the same sample space.

Initial example: Three coin tosses, with separate mappings for the number of heads and number of tails.

### PL-05: CDF and PMF Explorer

**Purpose:** Understand the relationship between probability mass and cumulative probability.

Capabilities:
- Construct and manipulate discrete probability masses.
- Generate PMF and CDF visualisations.
- Display the staircase nature of discrete CDFs.
- Explore CDF jumps.
- Observe cumulative probability.
- Calculate interval probabilities.
- Demonstrate endpoint conventions and left limits.

Essential formulae:

\[
F_X(x)=P(X\leq x)
\]

\[
p_X(x)=P(X=x)
\]

\[
P(a<X\leq b)=F_X(b)-F_X(a)
\]

### PL-06: Distribution Explorer

**Purpose:** Experiment with the discrete distributions introduced in Part 1.

Initial distributions:

| Distribution | Parameters |
|---|---|
| Bernoulli | \(p\) |
| Binomial | \(n,p\) |
| Poisson | \(\lambda\) |
| Geometric | \(p\) |

Capabilities:
- Manipulate distribution parameters.
- Visualise PMFs and CDFs.
- Inspect individual probabilities.
- Verify normalisation.
- Run repeated simulations.
- Compare empirical frequencies with theoretical probabilities.

## 3.2 Custom Probability Experiment Builder

In addition to the six guided laboratories, the playground should support an independent experiment-building environment.

The proposed interaction model is:

1. Define a sample space.
2. Assign probabilities to outcomes.
3. Construct events.
4. Define relationships between events.
5. Define random variables as mappings.
6. Explore induced distributions.
7. Visualise the resulting PMF and CDF.
8. Run simulations and compare empirical and theoretical results.

The builder should validate the mathematical consistency of the experiment.

**Important architectural distinction:** The custom finite-experiment builder and the parameterised distribution explorers are separate capabilities. They may share the underlying mathematical computation engine, but should not be implemented as one monolithic component.

Future support for continuous distributions must extend this architecture.

---

# 4. Mathematical and Educational Requirements

## 4.1 Mathematical Notation

Mathematical formulae must be rendered as mathematics, not approximated using ordinary text.

Use LaTeX-compatible rendering through a suitable library such as KaTeX or MathJax.

The final library choice remains open.

Requirements:
- Support inline and display mathematics.
- Render subscripts, superscripts, fractions, summations, integrals and set notation.
- Support piecewise functions.
- Maintain readability on different screen sizes.
- Ensure mathematical notation is consistent throughout the application.

## 4.2 Mathematical Accuracy

Mathematical computation must be deterministic.

An LLM must never be the authoritative source for numerical calculations or mathematical validation.

The application must explicitly validate:
- Probability constraints.
- Parameter ranges.
- Distribution normalisation.
- Preconditions for formula application.
- Domain and support restrictions.

Where numerical approximations are used, the application should distinguish them from exact results.

## 4.3 Educational Completeness

The application must cover all concepts from the source transcripts and extracted ontologies.

The source materials are the primary curriculum authority.

Additional material may be introduced where it improves understanding or fills an important conceptual gap.

Additional content must be identified as supplementary rather than silently attributed to the original tutorial.

---

# 5. Curriculum: Parts 1–3

The three transcripts and their appended concept ontologies form the curriculum authority. The module breakdown below organizes the source material for learning; it does not impose a mandatory sequence. Stable concept identifiers should be assigned in the content schema. Transcript wording and mathematical expressions must be checked against reliable notation because the transcripts contain speech-recognition errors.

## Part 1 — Foundations and discrete random variables

| Module | Coverage |
|---|---|
| M01 | Probability foundations |
| M02 | Conditional probability |
| M03 | Total probability and Bayes' rule |
| M04 | Event independence |
| M05 | Random variables and induced probability measures |
| M06 | Cumulative distribution functions |
| M07 | Discrete random variables and PMFs |
| M08 | Discrete distributions |

**M01 — Probability Foundations:** Random experiments; sample spaces Ω; events; event spaces F as subsets of the power set (the transcript's working assumption); probability measures; non-negativity, normalization, sigma-additivity; probability spaces (Ω,F,P).

**M02 — Conditional Probability:** Definition P(A|B)=P(A∩B)/P(B); requirement P(B)>0; revised probability assignment and its interpretation as a probability measure.

**M03 — Total Probability and Bayes' Rule:** Partitions and mutual exclusivity; law of total probability; Bayes' rule; the complementary-event partition; reversing conditional probabilities and the diagnostic-testing example.

**M04 — Event Independence:** Independence of two events and its conditional-probability consequence; independence involving complements; total (mutual) independence; pairwise independence; conditional independence; distinctions and counterexamples among these notions.

**M05 — Random Variables:** Random variables as deterministic real-valued functions on a probability space; multiple variables on one space; induced probability measure/distribution P_X.

**M06 — Cumulative Distribution Functions:** Definition for any random variable; range and boundary limits; non-decreasing behavior; right-continuity and left limits; interval probabilities and endpoint conventions; a CDF completely determines the distribution.

**M07 — Discrete Random Variables and PMFs:** Finite or countable support; PMF definition, non-negativity and normalization; PMF-to-CDF accumulation; recovering point masses from CDF jumps; distinction between PMF and CDF and PMF's discrete-only scope; three-coin head-count example.

**M08 — Discrete Distributions:** Bernoulli; indicator random variables; Binomial; Poisson; Geometric distributions, including their parameters, support, PMFs and source examples.

## Part 2 — Continuous random variables, transformations, and moments

| Module | Coverage |
|---|---|
| M09 | Continuous random variables, PDFs, and continuous CDFs |
| M10 | Common continuous distributions |
| M11 | Functions and transformations of one random variable |
| M12 | Expectation and its properties |
| M13 | Variance and moment relationships |
| M14 | Probability inequalities |
| M15 | Simulation and empirical estimation |

**M09 — Continuous Random Variables, PDFs, and CDFs:** PDF-integral definition of a continuous random variable; uncountable support alone is not sufficient for this classification; PDF validity (non-negativity and unit integral); PDF is not itself a probability measure and may exceed one; continuous CDF properties; zero point probability; interval probability and endpoint equivalence.

**M10 — Common Continuous Distributions:** Uniform, Exponential, and Gaussian/Normal distributions, including support, parameters, PDFs and CDFs where given; standard normal as a special case.

**M11 — Functions and Transformations:** Distribution of Y=g(X) through its CDF; monotone differentiable change-of-variable formula for densities, inverse mapping, support, and derivative/Jacobian factor.

**M12 — Expectation:** Discrete sum and continuous integral definitions; weighted-average interpretation; expectation of an indicator; Law of the Unconscious Statistician (LOTUS); linearity, constants, and non-negativity.

**M13 — Variance and Moment Relationships:** Variance as E[(X−E[X])²]; identity E[X²]−(E[X])²; non-negativity and the resulting second-moment bound; effects of shifting and scaling; expectation of products for independent versus dependent variables.

**M14 — Probability Inequalities:** Markov and Chebyshev inequalities, assumptions, bounds and standard-deviation form; Jensen's inequality for convex functions. Verify conditions and correct formal statements when authoring content.

**M15 — Simulation and Empirical Estimation:** Reproducible sampling; empirical estimates of probabilities, means and variances; comparison with theoretical values and densities; effect of sample size. The transcript's NumPy demonstrations are source examples, not a required implementation choice. The Part 2 diagnostic-testing Bayes example also reinforces M03 and PL-02.

## Part 3 — Joint and multiple random variables

| Module | Coverage |
|---|---|
| M16 | Joint distribution functions |
| M17 | Joint PMFs and joint PDFs |
| M18 | Marginal distributions and joint–marginal relationships |
| M19 | Conditional distributions and Bayes' rule |
| M20 | Mixture models and communication-system example |
| M21 | Independence of random variables and IID sequences |
| M22 | Multiple variables, mixed conditioning, and transformations |

**M16 — Joint Distribution Functions:** Joint CDF for pairs; boundary, monotonicity and continuity properties; non-negative rectangle probabilities and rectangle-increment formula.

**M17 — Joint PMFs and Joint PDFs:** Definitions for discrete pairs and continuous pairs; normalization; obtaining the joint CDF by summation or integration; probability of regions.

**M18 — Marginals and Joint–Marginal Relationships:** Obtain marginals from joint CDFs, PMFs, or PDFs; the joint determines its marginals, but marginals generally do not determine the joint.

**M19 — Conditional Distributions and Bayes' Rule:** Conditional distribution functions; conditional PMFs and densities; positive conditioning mass/density requirements; continuous conditioning via limiting intervals; Bayes' rule and total-probability sums/integrals for pairs.

**M20 — Mixture Models and Communication-System Example:** Mixture densities formed from discrete component probabilities and conditional continuous densities; ratio-based bit detection using Gaussian measurement models and equal priors.

**M21 — Independence and IID Sequences:** Factorization of joint CDF/mass/density; conditional distribution under independence; independence determines the joint from marginals; independent and identically distributed (IID) variables; functions of independent variables remain independent.

**M22 — Multiple Variables, Mixed Conditioning, and Transformations:** Vector-valued random variables and extension of joint/marginal/conditional ideas beyond pairs; mixed discrete/continuous conditioning through conditional distribution functions; multivariate density change of variables with inverse mapping and non-zero Jacobian determinant.

These modules are a content organization derived from the transcript chapters and appended ontologies, not a newly approved teaching sequence. Examples and derivations should retain source-part and chapter references. Content that corrects, extends, or contextualizes the source should be labeled as editorial clarification or supplementary material as appropriate.
# 6. Content Architecture and Extensibility

## 6.1 Three-Part Curriculum

The application must support three independently maintainable content modules:

- Part 1: Probability foundations and discrete random variables.
- Part 2: Continuous variables, transformations, moments, inequalities, and simulation (M09–M15).
- Part 3: Joint/multiple variables, conditional distributions, dependence, IID variables, and transformations (M16–M22).

The Part 2 and Part 3 module outlines are mapped from their transcripts and appended ontologies; detailed instructional content still requires authoring and mathematical review.

## 6.2 Content-Driven Design

Concepts, exercises, formulae and worked examples should be represented as structured content rather than hardcoded into individual screens.

Each concept should support metadata such as:

- Stable concept identifier.
- Title.
- Description.
- Source tutorial part.
- Source timestamp or reference.
- Prerequisites.
- Related concepts.
- Formal definition.
- Formulae.
- Worked examples.
- Common misconceptions.
- Exercises.
- Playground associations.
- Supplementary-content classification.

Exercises and formulae should also have stable identifiers.

## 6.3 Cross-Part Relationships

Concepts from different parts must be connectable.

For example, a CDF introduced in Part 1 may be extended when continuous random variables are introduced in Part 2.

The existing concept should be extended or linked to new material, not duplicated unnecessarily.

The application should distinguish:
- New concepts.
- Extensions of existing concepts.
- New applications of existing concepts.
- Revision material spanning multiple parts.

---

# 7. Application Architecture

## 7.1 Architectural Direction

The application should be a modular browser-based web application.

The recommended direction is a component-based frontend architecture, with React/Vite or a comparable framework as candidates.

The final framework selection remains pending.

The architecture should separate:

1. Presentation and navigation.
2. Educational content.
3. Mathematical computation.
4. Interactive visualisation.
5. Exercise and assessment logic.
6. Progress and revision management.
7. Optional AI services.

These responsibilities should not be tightly coupled.

## 7.2 Mathematical Engine

A reusable mathematical engine should provide the computational foundation.

It should handle:
- Set operations.
- Event probabilities.
- Conditional probabilities.
- Total probability.
- Bayes calculations.
- Independence checks.
- Random variable mappings.
- PMF and CDF generation.
- Distribution calculations.
- Random sampling and simulation.

The engine should be independent of the user interface.

This will allow multiple laboratories to reuse the same mathematical functionality.

## 7.3 Visualisation Layer

Visualisations should be reusable components.

Potential components include:
- Venn diagrams.
- Probability trees.
- Contingency tables.
- Sample-space diagrams.
- Mapping diagrams.
- PMF bar charts.
- CDF staircase plots.
- Distribution plots.
- Simulation frequency plots.

The same visualisation components should be reusable across explanations, exercises and playgrounds.

## 7.4 Persistence

Local progress persistence is the proposed initial approach.

The application should be designed to preserve:
- Exercise attempts.
- Completed exercises.
- Revision history.
- Identified weak concepts.
- Learning progress.

The storage technology, data schema and backup/export strategy remain to be decided.

The initial implementation should not require an external user account or cloud database.

---

# 8. Optional LLM Architecture

## 8.1 Guiding Principle

The application must remain fully functional without an LLM.

LLM functionality is an enhancement, not a dependency.

## 8.2 Potential LLM Capabilities

Future integration may support:

- Alternative explanations of concepts.
- Context-sensitive hints.
- Evaluation of written reasoning.
- Generation of new practice questions.
- Adaptive difficulty.
- Socratic tutoring.
- Identification of misconceptions.
- Personalised revision recommendations.

## 8.3 Integration Architecture

The LLM should communicate through an abstraction layer rather than being embedded into the mathematical engine.

The architecture should support:
- Different model providers.
- Configurable model selection.
- API key protection.
- Structured inputs and outputs.
- Usage limits and error handling.

API credentials must never be exposed in browser-side code.

## 8.4 Deterministic Versus Generative Responsibilities

| Responsibility | Primary mechanism |
|---|---|
| Mathematical calculations | Deterministic engine |
| Probability validation | Deterministic engine |
| Simulation | Deterministic engine |
| Numerical answer checking | Deterministic engine |
| Concept explanations | Curated content, optionally LLM |
| Contextual hints | Rules initially, optionally LLM |
| Written reasoning assessment | Optional LLM |
| Question generation | Curated bank initially, optionally LLM |

---

# 9. User Interface and Navigation Direction

The proposed application navigation includes:

1. Dashboard.
2. Concept Atlas.
3. Practice Gym.
4. Probability Playground.
5. Formula Reference.
6. Progress and Revision.

This is a proposed information architecture, not a final screen specification.

Detailed screen layouts, interaction patterns, responsive behaviour and navigation flows will be documented separately.

The interface should prioritise:
- Readable mathematical notation.
- Clear conceptual hierarchy.
- Easy movement between related concepts.
- Immediate feedback.
- Minimal interaction friction.
- Consistent visualisation conventions.

---

# 10. Extensibility Beyond the Mapped Curriculum

Parts 2 and 3 already introduce continuous and joint/multiple-variable probability, so these are part of the mapped curriculum rather than speculative future topics. The architecture should also allow the existing concepts and components to grow as later material requires, including extensions of CDFs, distributions, conditioning, expectations, and transformations.

The application must not assume all random variables are discrete or that every distribution is represented by a PMF. Specific support for additional material beyond the three source parts remains open and should be added only with clear source attribution or a supplementary label.
# 11. Non-Goals and Constraints

The initial application is not intended to be:

- A video player or transcript reader.
- A conventional linear online course.
- An LLM-dependent chatbot.
- A replacement for a general-purpose computer algebra system.
- A full statistical analysis package.
- A cloud-dependent learning management system.

The initial focus is probability revision and conceptual understanding.

Additional functionality must justify its contribution to that objective.

---

# 12. Development and Design Workflow

Development should proceed through explicit design and approval stages.

The project must not jump directly from this specification into implementation.

Proposed sequence:

1. Establish and approve the product specification.
2. Produce a screen-by-screen blueprint.
3. Produce detailed interaction specifications.
4. Define the mathematical engine and data models.
5. Define the content schema.
6. Select the implementation technology.
7. Establish the initial application architecture.
8. Implement the first version using Part 1.
9. Validate mathematical correctness and learning interactions.
10. Complete and validate the mapped Parts 2 and 3 content, then incorporate it incrementally.

Each major stage should have a review and approval checkpoint.

The learner's experience and mathematical correctness take precedence over implementation convenience.

---

# 13. LLM Implementation Instructions

Any LLM working on this project must follow these instructions.

1. Treat this document as the authoritative product and architecture specification.
2. Read the complete document before proposing or implementing changes.
3. Preserve approved decisions unless explicitly instructed otherwise.
4. Do not interpret recommendations or unresolved questions as approved decisions.
5. Do not silently change the product direction or substitute a different application architecture.
6. Keep mathematical computation deterministic and independently testable.
7. Never rely on LLM-generated calculations as the source of mathematical truth.
8. Preserve the separation between educational content, mathematical logic and presentation.
9. Design all new functionality for compatibility with the three-part curriculum.
10. Document new decisions and their rationale.
11. Update this specification when a new design or architecture decision is approved.
12. Do not begin implementation without explicit approval of the relevant design stage.

When a requirement is ambiguous, identify the ambiguity and propose alternatives rather than inventing a decision.

---

# 14. Decision Log and Outstanding Questions

## 14.1 Approved Decisions

| ID | Decision |
|---|---|
| D-001 | Balanced learning studio |
| D-002 | Six initial playground laboratories |
| D-003 | Custom probability experiment builder |
| D-004 | LLM-ready architecture, initially without mandatory LLM integration |
| D-005 | Deterministic mathematical computation |
| D-006 | Proper LaTeX mathematical rendering |
| D-007 | Modular application accommodating all three tutorial parts |
| D-008 | Modules organise content; learners choose their entry point. Parts/modules do not gate access, the three learning environments are co-equal, and progress is primarily concept/exercise-level. |

## 14.2 Outstanding Decisions

The following are deliberately unresolved:

- Frontend framework selection.
- Mathematical rendering library.
- Charting and visualisation library.
- Local persistence technology.
- Mathematical computation library, if any.
- Detailed content data schema.
- Detailed exercise data schema.
- Exact application navigation and screen layouts.
- Responsive design requirements.
- Progress tracking and revision algorithms.
- The proposed concept progress states and the criteria for evidence-based “secure” status; whether to adopt a fixed spaced-review cadence or learner-adjusted intervals.
- Data export and backup capabilities.
- Testing strategy and acceptance criteria.

These decisions should be addressed in subsequent design artifacts.

## 14.3 Future Design Artifacts

The specification will be extended through separately maintained artifacts.

| Artifact | Purpose | Status |
|---|---|---|
| A-001: Screen-by-Screen Blueprint | Define screens, layouts and navigation | Planned |
| A-002: Interaction Specification | Define user interactions and system responses | Draft v0.4 — design review |
| A-003: Playground Specification | Define guided laboratory interactions, controls and acceptance criteria | Draft v0.4 — design review |
| A-004/A-005 Shared Contracts | Define common version, result, formula, seed and error-code ownership | Draft v0.2 — joint review |
| A-004: Deterministic Operations Specification | Define mathematical operations, validation and simulation behavior | Draft v0.2 — design review |
| A-005: Content and Data Model Specification | Define structured curriculum representation and learner-state model | Draft v0.2 — design review |
| A-006: Exercise and Assessment Specification | Define question formats, feedback and evaluation | Draft v0.1 — review deferred |
| A-007: Technical Architecture | Finalise frameworks, libraries and application structure | Draft v0.1 — architecture proposal; choices pending review |
| A-008: Implementation and Testing Plan | Define development milestones and acceptance criteria | Draft v0.1 — readiness and verification plan; no implementation authorized |

Each artifact should have its own version and approval status.

The main specification should reference these artifacts and incorporate their approved decisions.

---

# 15. Change Management

This is a living document.

Changes must be deliberate and traceable.

For each significant change, record:

- Decision or requirement identifier.
- Description of the change.
- Reason for the change.
- Whether it replaces an existing decision.
- Impact on other design artifacts.
- Approval status.
- Date of approval.

Do not silently overwrite earlier decisions.

When a new artifact introduces a conflicting recommendation, identify the conflict and resolve it explicitly before updating the authoritative specification.

**The objective is to maintain one coherent source of truth for the entire project, usable by any future LLM or human developer without relying on the original conversation.**




