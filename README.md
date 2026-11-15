# ProbStudio

**ProbStudio** is an interactive, browser-based learning environment for understanding, practising, and experimenting with probability theory and stochastic models. It is based on the three-part *Review of Basic Probability* tutorial series (NPTEL).

This folder contains the planning documents, source transcripts, and the interactive web application prototype.

## Learning experience

The intended product brings together three equally prominent environments:

- **Concept Atlas:** intuitive and formal explanations, definitions, derivations, examples, and links between concepts.
- **Practice Gym:** retrieval and problem-solving exercises with useful hints, deterministic answer checking, and explanatory feedback.
- **Probability Playground:** guided interactive laboratories and a custom experiment builder for exploring models, calculations, visualisations, and simulations.

The broader design also proposes a dashboard, formula reference, and progress and revision views. Learners should be free to move between these areas; curriculum parts and modules organize material but do not gate access.

## Curriculum sources

The `transcripts/` directory contains the primary source material:

| Transcript | Main coverage |
|---|---|
| `Review of Basic Probability 1.md` | Probability spaces, conditional probability, total probability and Bayes' rule, independence, random variables, CDFs, discrete random variables, and introductory discrete distributions |
| `Review of Basic Probability 2.md` | Continuous random variables, PDFs and CDFs, common continuous distributions, functions and transformations of random variables, expectation, variance, inequalities, and simulation |
| `Review of Basic Probability 3.md` | Joint distributions, marginal and conditional distributions, dependence and independence, multiple and IID random variables, and transformations |

The product specification maps the three transcripts into 22 proposed modules: eight for Part 1, seven for Part 2, and seven for Part 3. The mapping follows the transcript chapters and appended concept ontologies; it is a content organization, not a required sequence. Detailed lessons and playground behavior still need authoring and mathematical review. Transcript text may contain speech-recognition errors, so verify notation and mathematical claims before turning it into instructional content.

## Project documents

- [`Probability Revision Studio.md`](docs/Probability%20Revision%20Studio.md) — product goals, learning principles, architecture direction, mathematical requirements, and open decisions.
- [`A-001_Screen-by-Screen_Blueprint_v0.4.md`](docs/A-001_Screen-by-Screen_Blueprint_v0.4.md) — proposed screen structure, navigation, cross-Part lab extensions, dashboard behavior, and a progress/revision proposal. The new lab and progress details are pending review.
- [`A-002_Interaction_Specification_v0.4.md`](docs/A-002_Interaction_Specification_v0.4.md) — draft interaction flows, state-retention rules, accessibility patterns, requirement IDs and acceptance criteria for navigation, concepts, practice, guided labs, and revision. Pending progress, expiry and new-lab proposals remain explicitly unresolved.
- [`A-003_Playground_Specification_v0.4.md`](docs/A-003_Playground_Specification_v0.4.md) — draft specifications for the six guided labs, proposed later-Part labs, parameter defaults, module crosswalk, resume state and lab acceptance criteria. PL-07–PL-09 remain provisional pending approval.
- [`A-004_A-005_Shared_Contracts_v0.2.md`](docs/A-004_A-005_Shared_Contracts_v0.2.md) — joint draft for version ownership, result statuses, formula references, errors and simulation seeds.
- [`A-004_Deterministic_Operations_Specification_v0.2.md`](docs/A-004_Deterministic_Operations_Specification_v0.2.md) — draft calculation, validation, repair, simulation and verification contract.
- [`A-005_Content_and_Data_Model_Specification_v0.2.md`](docs/A-005_Content_and_Data_Model_Specification_v0.2.md) — draft IDs, content entities, associations, traceability and learner-state model.
- [`A-006_Exercise_and_Assessment_Specification_v0.1.md`](docs/A-006_Exercise_and_Assessment_Specification_v0.1.md) — draft exercise formats, deterministic checking, scoring, feedback, hints, retries and attempt evidence.
- [`A-007_Technical_Architecture_v0.1.md`](docs/A-007_Technical_Architecture_v0.1.md) — proposed module boundaries, local-first architecture, technology candidates, privacy and accessibility constraints.
- [`A-008_Implementation_and_Testing_Plan_v0.1.md`](docs/A-008_Implementation_and_Testing_Plan_v0.1.md) — implementation readiness gates, acceptance matrix, verification strategy and proposed delivery stages.
- [`ROADMAP.md`](ROADMAP.md) — prioritized path to a feedback-ready end-to-end prototype and the remaining product/technical backlog.
- [`AGENTS.md`](AGENTS.md) — local working and content guidelines for this folder.

## Curriculum map

- **Part 1 (M01–M08):** Foundations, conditional probability and Bayes, event independence, random variables, CDFs, discrete random variables/PMFs, and discrete distributions. The Part 1 list includes Poisson.
- **Part 2 (M09–M15):** Continuous random variables/PDFs, continuous distributions, transformations, expectation, variance, inequalities, and simulation.
- **Part 3 (M16–M22):** Joint distributions, PMFs/PDFs, marginals, conditional distributions, mixture models, independence/IID variables, vector-valued and mixed variables, and multivariate transformations.

See the product specification for the concept-level inventory and source-related mathematical review notes.

## Approved direction and constraints

- One application should accommodate all three tutorial parts.
- Concepts, practice, and experimentation are balanced parts of the learning experience.
- Six guided labs are planned: event/probability building (PL-01), conditional probability and Bayes (PL-02), independence (PL-03), random variable mapping (PL-04), CDF/PMF exploration (PL-05), and discrete distributions (PL-06). A custom experiment builder is also planned.
- Calculations, validation, simulations, and numerical answer checks must be deterministic; LLM integration is optional and must not be required for core use.
- Mathematical notation should be properly typeset. The renderer and the application framework are still open choices.
- Local progress storage is the proposed starting point; a final schema and backup strategy remain open.
- Source-derived and supplementary content should be distinguishable and retain useful source references.

## Current status

The Probability Revision Studio vertical slice and playground feature set is active and verified:
- **Stack:** React 18, Vite, TypeScript, KaTeX, and a versioned local storage persistence adapter.
- **Deterministic Math Engine:** Pure TypeScript exact rational arithmetic (`Rational`), moment calculations, multidimensional joints, discrete convolutions, and PRNG simulations (`CAL-EVENT-001` through `CAL-CLT-002`, `CAL-CUSTOM-EXP-001`) with automated tests (`npm test`).
- **Complete Feature Journey Across All 3 Environments:**
  1. **Concept Atlas:** Full curriculum coverage across all 22 modules (M01–M22, 44 concepts) with deep links to corresponding Practice Gym exercises and Playground labs.
  2. **Practice Gym:** 31 retrieval and problem-solving exercises across Parts 1, 2, and 3 with exact rational response checking, step-by-step mathematical explanations, and cross-links to Atlas and Playground.
  3. **Probability Playground:**
     - **11 Active Guided Laboratories (`PL-01` through `PL-11`):**
       - `PL-01`: Venn Event Workbench (2-event Venn diagram with set operations).
       - `PL-02`: Conditional & Bayes Workbench (2x2 contingency table, tree diagram, posterior calculator).
       - `PL-03`: Independence Explorer (Pairwise, mutual, and conditional independence testers).
       - `PL-04`: Random Variable Mapper (Discrete RV fiber aggregation and induced PMF).
       - `PL-05`: CDF & PMF Explorer (Staircase CDF generator and jump discontinuity visualizer).
       - `PL-06`: Discrete Distribution Explorer (Bernoulli, Binomial, Geometric, Poisson with PRNG simulation).
       - `PL-07`: Continuous Distribution Explorer (Uniform, Exponential, Normal with interval shading and rejection sampling).
       - `PL-08`: Transform & Moments Workbench (1D continuous transforms $Y=g(X)$, moments, and Chebyshev bounds).
       - `PL-09`: Joint & Marginals Lab (2D discrete joints, continuous triangular density $f(x,y)=2$, and boundary probabilities).
       - `PL-10`: Conditionals, Channels & Transforms (Continuous conditional slicing, binary channel signaling, and 2D Jacobian explorer).
       - `PL-11`: Central Limit Theorem & Sums of IID Variables (Convolution of IID variables $S_n = \sum X_i$, slider $n \in [1, 50]$, and standardized $Z_n$ convergence to $\mathcal{N}(0, 1)$).
     - **Custom Probability Experiment Builder (`EXP-BUILDER`):**
       - Author custom finite sample spaces $\Omega$, assign exact rational masses, define arbitrary random variables $X(\omega)$, calculate induced PMFs, staircase CDFs, expectation $E[X]$, and variance $\text{Var}(X)$.
       - Event operations $A \cup B$, $A \cap B$, and conditional probability $P(A|B)$ with zero-conditioning guard (`E-COND-ZERO`).
     - **Universal Laboratory Toolbar / Shell (`LabShell`):**
       - Standard *Orient* $\to$ *Set up* $\to$ *Explore* $\to$ *Explain* $\to$ *Compare* $\to$ *Simulate* $\to$ *Reset* flow.
       - Persistent snapshot bar (save, side-by-side active vs. saved comparison, restore, delete).
       - Normative error codes (`E-PARAM-DOMAIN`, `E-PROB-RANGE`, `E-COND-ZERO`, `E-NONFINITE-INPUT`, `E-PROB-SUM`).
       - Normalization repair workflow banner with preview and commit.
       - Snapshot and learner state JSON export and import.
  4. **Cross-Screen Deep-Linking & State Hydration:** Seamless navigation between Concept Atlas, Practice Gym, and specific Playground laboratories with state preserved.

To run the development server:
```bash
npm run dev
```

To run test suites:
```bash
npm test
```

To build production bundle:
```bash
npm run build
```




