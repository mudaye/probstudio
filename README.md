# Probability Revision Studio

Probability Revision Studio is a planned interactive learning environment for understanding, practising, revising, and experimenting with probability. It is based on the three-part *Review of Basic Probability* tutorial series.

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

The Stage 0 prototype vertical slice is implemented and verified:
- **Stack:** React 18, Vite, TypeScript, KaTeX, and a versioned local storage persistence adapter.
- **Deterministic Math Engine:** Pure TypeScript exact rational arithmetic (`Rational`) and operations `CAL-EVENT-001` and `CAL-EVENT-002` verified against A-004 golden vectors with automated tests (`npm test`).
- **Complete Vertical Journey:**
  1. Neutral Dashboard entry into all three co-equal environments.
  2. Practice Gym with Exercise `EX-000001` (fair two-coin toss, find $P(A)$ for $A=\{HH, HT\}$; exact rational response checking and feedback).
  3. Context-preserving cross-linking into Concept Atlas (`C-000001` Sample Spaces and Events) and back to Practice with active state intact.
  4. Guided Lab **PL-01 (Event and Probability Builder)** with live exact recalculation, outcome mass editing, event operations ($A \cap B$, $A \cup B$, $A^c$, $A \setminus B$), snapshot comparison, and invalid configuration warnings.
  5. Versioned local persistence recording attempt outcomes and activity history across browser sessions.

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




