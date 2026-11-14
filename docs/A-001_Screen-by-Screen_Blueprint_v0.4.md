# A-001 — Screen-by-Screen Blueprint

**Project:** Probability Revision Studio  
**Document ID:** A-001  
**Version:** 0.4  
**Date:** 14 November 2026  
**Status:** Revised draft for design review  
**Parent document:** PRS-PAS-001 — Product & Architecture Specification

---

## 1. Purpose

Define the screen structure, information hierarchy, navigation and primary interactions of the Probability Revision Studio.

This document is a design specification, not an implementation specification. It should give an LLM or developer enough context to understand what each screen must accomplish while leaving unresolved technical and visual choices open.

### Decision labels

- **Approved:** Explicitly agreed product direction.
- **Proposed:** Recommended design, pending review.
- **Open:** Requires a design decision.

## 2. Application-wide structure

### 2.0 Governing navigation principle

**Approved (D-008 / PD-08):** Modules organise where content lives; the learner chooses the entry point.

- The Concept Atlas, Practice Gym and Probability Playground are equally prominent entry points. Access to one never depends on completing another.
- Modules, Parts and prerequisites provide structure for browsing and dependency checks. They do not impose a sequence or gate access to content.
- Progress is recorded per concept and per exercise. Module or Part completion percentages are not the primary progress measure.
- All three Parts appear as content groupings or filters, not as locked chapters. Part selection remains optional.

All screen decisions below are to be read against this principle.

### 2.1 Primary navigation

**Approved:** Use a persistent primary application header navigation with these destinations:

1. Dashboard
2. Concept Atlas
3. Practice Gym
4. Probability Playground
5. Formula Reference
6. Progress & Revision

The Custom Experiment Builder is accessed through the Probability Playground rather than treated as a separate top-level destination.

**Approved navigation layout (Global vs. Contextual Panels):**
- **Persistent top header:** Hosts the primary navigation destinations above, maintaining equal prominence among the three core learning environments (Atlas, Practice, Playground) without visual hierarchy or gating.
- **Modules (M01–M22) are NOT a global application sidebar:** Placing all 22 modules as a permanent left panel would impose an artificial linear-course structure and crowd focused workspaces.
- **Contextual left panel / collapsible drawer in Concept Atlas:** Presents Parts (P1–P3) and Modules (M01–M22) as a structured curriculum index for fast jumping and filtering. Module selection remains strictly non-gating.
- **Contextual filter drawer in Practice Gym:** Offers optional filtering by Part, Module, exercise category, and difficulty.
- **Left panel in Probability Playground:** Dedicated to experiment definition and parameter controls (sample space, outcome masses, event definitions), not curriculum modules.

### 2.2 Shared application elements

**Proposed:**

- Persistent application navigation.
- Current section and location indicator.
- Search across concepts, formulae and exercises.
- Consistent mathematical notation rendering.
- Contextual hints and explanations.
- Clear distinction between source material and supplementary explanations.
- Consistent feedback for correct, incorrect and incomplete answers.
- Responsive layouts for desktop, tablet and mobile.

**Open:** Exact navigation placement, compact/mobile navigation behaviour, global search implementation and visual design.

## 3. Screen 01 — Dashboard

### Purpose

Provide an overview of the learning environment and a useful starting point for each visit.

### Proposed information hierarchy

**A. Three primary learning environments**

Present the three environments as equally prominent entry points, with equivalent visual weight and direct access:

- **Concept Atlas — Understand:** Browse and study concepts, definitions, explanations and worked examples.
- **Practice Gym — Practise:** Start exercises and work on applying concepts.
- **Probability Playground — Experiment:** Open guided laboratories or the Custom Experiment Builder.

None of these entry points should be subordinate to another or require progress in another environment.

**B. Continue learning**
- Resume the last viewed concept, exercise or playground experiment.
- Display relevant context, such as Part and module, without making that context a prerequisite.
- Provide a direct continuation action.

**C. Browse the curriculum**
- Show the available Parts and their modules as an organisational browsing structure.
- Part 1: Foundations and discrete random variables (M01–M08).
- Part 2: Continuous random variables, transformations, expectation, variance, inequalities, and simulation (M09–M15).
- Part 3: Joint and multiple random variables, conditional distributions, dependence, IID variables, and transformations (M16–M22).
- Do not display module or Part completion percentages as the primary progress indicator.

**D. Learning activity and revision**
- Recent concepts and exercises.
- Concepts marked for revision.
- Recent playground experiments.
- A concise view of per-concept status, using the proposed states described in Screen 07; revision priority is shown separately from learning status.

### Primary interactions

- Enter any of the three learning environments.
- Resume previous activity.
- Browse Parts, modules or concepts.
- Start a practice session.
- Open a playground laboratory or the custom builder.
- Navigate to a revision item.
- From a recommended item, open the concept explanation, start a related exercise, or launch a related lab; recommendations never start automatically.

### Open decisions

- The precise dashboard treatment of recent activity and concept status.
- Whether to include a daily learning target.
- Whether recommendations should use only explicit learner choices and recent exercise evidence, or also laboratory activity.

**Proposed dashboard interaction logic:** “Continue learning” resumes the most recent unfinished activity and preserves its context. If there is no resumable activity, show a neutral choice among the three learning environments. A separate “Suggested next” area may offer at most three actions: a due concept review, a related exercise, or a relevant lab. Each suggestion names its reason and offers dismiss/snooze controls. Learners can always enter any environment directly. Recent activity is chronological and distinct from recommendations. Part/module browsing remains available below the three equal entry points and does not become the default continuation path.

**Progress constraint:** Progress is tracked at the concept and exercise level. Module and Part completion percentages are not the primary progress measure. The specific status model and review schedule in Screen 07 remain proposed pending review.

## 4. Screen 02 — Concept Atlas

The Concept Atlas has two principal screen types: a concept index and a concept detail view.

### 4.1 Concept index

**Purpose:** Let users browse the subject in a structured, discoverable way.

**Approved layout:**

- **Collapsible left panel / drawer:** An expandable curriculum tree showing Parts (1, 2, 3) and their constituent Modules (M01–M22). Selecting a module filters or scrolls the main catalogue, without gating access to any other module or part.
- **Main catalogue area:** A default index that exposes the available concept catalogue without requiring the learner to choose a Part or module first.
- **Part selector/filter chips:** Allows the catalogue to be narrowed to one or more Parts.
- **Search and additional filtering:** Immediate text search across concept titles, definitions, and keywords.
- **Per-concept status indicators:** Displays study/revision status when progress tracking is enabled.

The Part selector is a browsing filter, not a gate or an initial mandatory step. All three Parts are represented as curriculum groupings, with content status shown where useful; no Part is a locked chapter.

The proposed curriculum contains eight Part 1 modules, seven Part 2 modules, and seven Part 3 modules:

| Part | Modules |
|---|---|
| 1 | M01 Probability Foundations; M02 Conditional Probability; M03 Total Probability and Bayes' Rule; M04 Event Independence; M05 Random Variables and Induced Probability Measures; M06 Cumulative Distribution Functions; M07 Discrete Random Variables and PMFs; M08 Discrete Distributions |
| 2 | M09 Continuous Random Variables, PDFs, and Continuous CDFs; M10 Common Continuous Distributions; M11 Functions and Transformations of One Random Variable; M12 Expectation and Its Properties; M13 Variance and Moment Relationships; M14 Probability Inequalities; M15 Simulation and Empirical Estimation |
| 3 | M16 Joint Distribution Functions; M17 Joint PMFs and Joint PDFs; M18 Marginal Distributions and Joint–Marginal Relationships; M19 Conditional Distributions and Bayes' Rule; M20 Mixture Models and Communication-System Example; M21 Independence and IID Sequences; M22 Multiple Variables, Mixed Conditioning, and Transformations |

This module map is source-derived organization, not an approved teaching sequence. The product specification gives the detailed concept inventory. Transcript-derived notation and claims require mathematical review before being presented as authoritative instructional content.
### 4.2 Concept detail

**Purpose:** Provide a comprehensive, navigable explanation of an individual concept.

**Proposed content hierarchy:**

1. Concept title and short description.
2. Learning objectives.
3. Intuitive explanation.
4. Formal definition.
5. Mathematical notation and formulae.
6. Assumptions and conditions.
7. Derivation or proof, where appropriate.
8. Worked examples.
9. Visual explanation, where useful.
10. Common misconceptions and errors.
11. Connections to related concepts.
12. Knowledge checks.
13. Related exercises.
14. Relevant playground laboratories.

### Interaction requirements

- Expand or collapse detailed explanations.
- Reveal derivations progressively.
- Interact with diagrams where applicable.
- Open related concepts without losing navigation context.
- Jump from a formula to its explanation.
- Launch a relevant playground experiment.
- Mark a concept for revision.

**Important:** A concept page should not become a long, uninterrupted article. Use progressive disclosure and interactive examples to make dense material manageable.

### Open decisions

- Whether concepts should be presented as one continuous page or as smaller navigable sections.
- Whether derivations should be expanded by default.
- Whether knowledge checks appear inline or in a separate exercise view.

## 5. Screen 03 — Practice Gym

### Purpose

Develop the ability to recall, recognise, select and apply probability concepts.

The Practice Gym should assess understanding, not merely the ability to reproduce formulae. Its available exercises should be browsable across all three Parts as content is authored.

### 5.1 Practice entry screen

**Proposed controls:**

- Browse exercises across the available curriculum by default.
- Optionally filter by Part, module or concept.
- Select exercise category.
- Select difficulty.
- Start a practice session.

Part is an optional filter, not a mandatory first step. All three Parts may be browsed or filtered; a learner can enter Practice Gym and work with available exercises without first selecting a Part.

**Proposed dashboard-to-practice flow:** The dashboard’s Practice Gym card opens the Gym directly. “Start practice” opens a short recommended set preview based on due concepts and recent exercise evidence, with the reason for each suggested concept visible. The learner can start it immediately or switch to “Browse all exercises” and choose concepts, Parts, modules, formats or difficulty. No Part selection, concept mastery state, or prior Atlas/lab activity is required. A suggestion opened from a specific concept/revision item may pre-filter the Gym to that concept, while keeping a visible “Clear filter” action. After each answer, the learner can retry, view an explanation, continue, or leave; at the end, show exercise-level results, linked concept updates, and optional next actions to review the concept or explore a related lab. Do not force completion of a fixed session.

### Exercise categories

1. **Concept identification:** Identify the correct concept or property.
2. **Formula selection:** Choose the appropriate formula for a problem.
3. **Numerical problems:** Calculate probabilities and distribution values.
4. **Derivations:** Complete or explain mathematical derivations.
5. **Error detection:** Find and correct mistakes in a proposed solution.
6. **Scenario modelling:** Translate a real-world scenario into a probability model.

### 5.2 Exercise screen

**Proposed layout:**

- Exercise statement.
- Supporting context, diagram or data.
- Answer input appropriate to the exercise.
- Hint controls.
- Submit/check action.
- Explanation and feedback area.

Input types may include:

- Multiple choice.
- Numerical answer.
- Mathematical expression.
- Select-all-that-apply.
- Matching.
- Step-by-step solution.
- Short written explanation.

### 5.3 Feedback screen/state

Feedback should distinguish between:

- Correct answer.
- Incorrect answer.
- Partially correct answer.
- Mathematically valid but differently expressed answer.
- Incomplete reasoning.

Feedback should explain why an answer is correct or incorrect, not simply reveal the expected answer.

**Approved direction:** Initial assessment and answer validation must work without an LLM.

**Open decisions:**

- Exercise sequencing and adaptive difficulty.
- Number of questions per session.
- Whether users can retry indefinitely.
- Whether hints affect performance records.
- Whether written reasoning is assessed manually, deterministically or through an optional LLM.

## 6. Screen 04 — Probability Playground

### Purpose

Allow users to manipulate probability models and observe the mathematical consequences.

The playground contains guided laboratories and a distinct custom experiment builder. Proceed with designing the pre-built labs as the initial playground experience; the custom builder is not a prerequisite or blocker and remains a separate later design capability. Extend existing labs where the same underlying concept carries across Parts, and propose new labs where the interaction needs materially differ. Associations are many-to-many discovery links, not containment or access gates.

### 6.1 Laboratory index

**Proposed:** Present the six initial laboratories as separate entry points.

Each laboratory should show:

- Name and purpose.
- Concepts covered.
- What the user can manipulate.
- What they can observe.
- Relevant concept pages.

### 6.2 Laboratory layouts

Each laboratory should follow a reusable structure:

**A. Experiment setup**
- Parameters, events, outcomes or distributions.
- Editable inputs.
- Constraints and validation.

**B. Visualisation**
- Diagram, table, graph or other appropriate representation.

**C. Computed results**
- Relevant probabilities.
- Formulae used.
- Intermediate values where useful.

**D. Explanation**
- What changed.
- Why the result changed.
- Relevant mathematical principles.

**E. Experiment controls**
- Reset.
- Randomise, where meaningful.
- Run simulation, where applicable.
- Compare configurations.

### 6.3 Initial laboratories

#### PL-01 — Event and Probability Builder

Explore finite sample spaces, events, event operations and probability axioms.

Initial example: two coin tosses.

#### PL-02 — Conditional Probability and Bayes Laboratory

Explore conditional probabilities, partitions, total probability and Bayes' rule.

Initial example: diagnostic testing with adjustable prevalence, sensitivity and specificity.

#### PL-03 — Independence Laboratory

Explore independence, mutual exclusivity, complements, pairwise independence and conditional independence.

#### PL-04 — Random Variable Mapper

Map sample-space outcomes to numerical values and examine the induced probability distribution.

Initial example: number of heads in three coin tosses.

#### PL-05 — CDF and PMF Explorer

Manipulate discrete probability masses and observe the resulting PMF and staircase CDF.

Explore jumps, interval probabilities and endpoint conventions.

#### PL-06 — Distribution Explorer

Explore the Part 1 Bernoulli, Binomial, Poisson and Geometric distributions. **Proposal:** keep PL-06 focused on discrete distributions and add a separate continuous-distribution lab (proposed PL-07) for the Part 2 Uniform, Exponential and Gaussian/Normal distributions. This avoids forcing PMF and PDF interactions into one control/visualization model. Both labs can share simulation and comparison capabilities.

Manipulate parameters, inspect theoretical probabilities and compare them with simulation results.

**Open:** Exact visualisation types, control layouts, simulation behaviour and lab-specific acceptance criteria will be specified in A-003.

### Cross-Part overlap and proposed lab extensions

Part 1 concepts should be extended and linked rather than duplicated. These mappings are proposals grounded in the three transcripts and the parent curriculum; they do not create module ownership or access requirements.

| Part 2/3 material | Relationship to existing Part 1 material | Proposed playground treatment |
|---|---|---|
| M09 continuous CDFs and M10 continuous distributions | Extend M06 CDF and M08 distribution ideas; PMF remains discrete-only, while CDF applies to discrete and continuous variables. | PL-05 may add continuous CDF/interval views as an extension; add proposed PL-07 for PDF/CDF and continuous distribution exploration. |
| M11 transformations; M12 expectation; M13 variance | Extend M05 random variables and M08 distribution summaries; LOTUS connects functions of variables to expectations. | Proposed PL-08 Transformation, Expectation and Variance Lab: choose a source distribution and transformation, inspect resulting distribution and moments. |
| M14 inequalities; M15 empirical estimation | Inequalities use expectation/moments; simulation develops the empirical/theoretical comparison already present in PL-06. | Add bound overlays and sampling controls to relevant labs; no separate lab proposed yet because these can be explored as views within PL-07/08. |
| M16–M18 joint distributions, joint PMFs/PDFs and marginals | Generalize M06 CDF/M07 PMF and M05 induced distributions from one variable to pairs; marginals connect joint and single-variable views. | Proposed PL-09 Joint Distribution and Marginals Lab with joint table/density, rectangle probabilities, marginals, and consistency checks. |
| M19 conditional distributions; M20 mixtures | Extend M02/M03 conditional probability, total probability and Bayes to conditional distributions and mixture models. | Extend PL-02 with conditional-distribution and mixture scenarios; add a mixture/Gaussian detection scenario grounded in the Part 3 communication example. |
| M21 independence/IID; M22 multiple, mixed and transformed variables | Extend M04 event independence and M11 transformations to random variables and vectors. | Extend PL-03 to test independence of random variables and compare joint versus product distributions; extend PL-09 for mixed/multivariate transformations only when scope is specified. |

**New-lab proposals for discussion:** PL-07 Continuous Distribution Explorer; PL-08 Transformation, Expectation and Variance Lab; PL-09 Joint Distribution and Marginals Lab. These are proposals only; PL-01–PL-06 identifiers and scope remain intact. The Part 3 mixture example is proposed as an extension/scenario within PL-02 rather than an additional lab at this stage. A-003 should confirm whether each proposed lab offers a distinct experiment before these IDs are reserved.

## 7. Screen 05 — Custom Experiment Builder

### Purpose

Allow users to construct probability experiments beyond the predefined laboratories.

This is a substantial playground capability, distinct from the pre-built guided labs and not required to deliver them. The initial playground can proceed with the pre-built labs first; builder scope remains separately designable.

### Proposed workflow

1. Define a sample space.
2. Assign probabilities to outcomes.
3. Construct events.
4. Define event relationships.
5. Define random variables as mappings.
6. Explore induced distributions.
7. Visualise PMFs and CDFs where applicable.
8. Run simulations.
9. Compare theoretical and empirical results.

### Proposed layout

**Left panel — Experiment definition**

- Sample-space editor.
- Outcome probability editor.
- Event editor.
- Random-variable editor.

**Main panel — Experiment visualisation**

- Sample-space representation.
- Event diagrams.
- Mapping diagrams.
- Distribution visualisations.

**Right panel — Results and inspection**

- Computed probabilities.
- Formulae and intermediate calculations.
- Validation messages.
- Simulation results.

### Validation requirements

The builder must detect invalid probability assignments and mathematically inconsistent configurations.

Examples:

- Negative probability.
- Probability greater than one.
- Total probability not equal to one.
- Invalid event definitions.
- Inconsistent event relationships.
- Invalid random-variable mappings.

Validation should explain the problem and, where possible, suggest how to correct it.

### Important architectural requirement

The builder must not be designed exclusively around finite discrete probability spaces. The content and computation architecture should support the continuous models in Part 2 and joint/mixed models in Part 3, while detailed builder scope remains open.

**Open:** Whether and how the builder should support countably infinite, continuous, joint and mixed models. Keep its model definition separate from the guided-lab catalog; this decision does not delay specification or delivery planning for the pre-built labs.

## 8. Screen 06 — Formula Reference

### Purpose

Provide a quick, searchable reference for mathematical definitions and formulae.

### Proposed content

Each entry should contain:

- Formula name.
- Mathematical expression.
- Symbol definitions.
- Conditions and assumptions.
- Related concepts.
- A short interpretation.
- A worked example or link to one.

### Proposed organisation

- Probability axioms and event operations.
- Conditional probability, total probability and Bayes' rule.
- Event and random-variable independence.
- Random variables, CDFs, PMFs and PDFs.
- Discrete and continuous distributions.
- Expectation, LOTUS, variance and moments.
- Markov, Chebyshev and Jensen inequalities.
- Joint, marginal and conditional distributions.
- Transformations, mixtures and IID variables.
### Interaction requirements

- Search by formula name, symbol or concept.
- Copy mathematical notation.
- Navigate to the relevant concept.
- Open a worked example.
- View applicable conditions and restrictions.

**Important:** The formula reference must not imply that a formula can be applied without satisfying its assumptions.

## 9. Screen 07 — Progress and Revision

### Purpose

Help users identify what they understand, what needs more work and what they should revisit.

### Proposed sections

**A. Overview**
- Concepts explored.
- Exercises attempted.
- Exercises completed.
- Recent activity.

**B. Concept learning status (proposal for review)**
- **New:** No recorded concept activity.
- **Exploring:** Concept opened or lab activity recorded, but no successful linked exercise evidence yet.
- **Practising:** At least one linked exercise attempted; evidence is not yet sufficient for Secure.
- **Secure (proposed):** At least three correct linked exercise attempts across at least two exercise formats, with attempts on two separate days. Hints may be used; the record shows hint use and can distinguish independent retrieval from supported success.

Learning status is separate from a learner-controlled **Marked for review** flag. A due review does not erase status. A later incorrect attempt can move Secure back to Practising and schedule a near-term review. These criteria are a proposed lightweight evidence rule, not a psychometric claim or a Part/module completion score.

**C. Revision queue and proposed scheduling**
- Include manually marked concepts, concepts with recent errors, and reviews due under the schedule.
- After an incorrect/partial answer, offer a relevant explanation and a retry; if unresolved, schedule a review for the next day.
- After a successful retrieval, schedule the next review at 1, 3, 7, then 14 days; advance one interval after a correct review and return to the next-day interval after an incorrect review.
- A hint-supported correct answer counts as practice but does not advance the review interval; offer a later unhinted retrieval.
- Learners can review now, snooze once, or remove their manual review mark. The schedule is a recommendation and never gates content.
- A lab visit alone does not establish Secure status; simulation activity can suggest a linked concept or exercise.

**D. History**
- Previous exercise attempts.
- Results and feedback.
- Recent playground experiments.

### Open decisions

- Whether to adopt the proposed evidence threshold and interval schedule as the initial progress model, or simplify it further.
- Whether hint-supported correctness should ever advance a review interval.
- Whether progress should be stored locally only.
- Whether users should be able to export or back up progress.

No account or cloud-dependent learning system is required for the initial product direction.

## 10. Shared interaction patterns

The following patterns should behave consistently across the application.

### Mathematical notation

- Render mathematical expressions using a dedicated mathematics renderer.
- Support inline and display equations.
- Preserve readable formatting on narrow screens.
- Support multi-line derivations.
- Distinguish variables, parameters, functions and probability measures clearly.

### Hints and explanations

- Hints should be progressively revealed.
- Explanations should distinguish intuition from formal reasoning.
- Avoid exposing the complete solution when a smaller hint is sufficient.

### Visualisations

- Provide labels and legends.
- Explain what the visualisation represents.
- Keep numerical results consistent with the mathematical computation engine.
- Where possible, allow users to manipulate visual elements directly.

### Error handling

- Explain invalid inputs.
- Avoid silently correcting mathematically invalid configurations.
- Distinguish invalid input from a valid but unusual mathematical result.

## 11. Navigation and cross-linking

The application should connect its three learning environments rather than treat them as isolated sections.

Examples:

- Concept page → related practice exercises.
- Concept page → relevant playground laboratory.
- Exercise feedback → explanation of the underlying concept.
- Playground result → relevant formula and concept.
- Formula reference → concept explanation.
- Revision queue → concept page or targeted practice.

The user should be able to move between these destinations without losing meaningful context or unnecessarily restarting an activity.

## 12. Content and source attribution

Every concept, formula, example, exercise and playground laboratory should have a stable identifier.

Where relevant, content should retain:

- Source part.
- Source transcript reference or timestamp.
- Ontology reference.
- Whether it is source-derived or supplementary.
- Related concepts.
- Prerequisites.
- Explicit associations to relevant modules and playground laboratories.

### Module–laboratory associations

The following initial crosswalk is part of the content organisation:

| Module | Associated laboratory |
|---|---|
| M01 — Probability Foundations | PL-01 — Event and Probability Builder |
| M02 — Conditional Probability | PL-02 — Conditional Probability and Bayes Laboratory |
| M03 — Total Probability and Bayes' Rule | PL-02 — Conditional Probability and Bayes Laboratory |
| M04 — Independence | PL-03 — Independence Laboratory |
| M05 — Random Variables | PL-04 — Random Variable Mapper |
| M06 — Cumulative Distribution Functions | PL-05 — CDF and PMF Explorer |
| M07 — Discrete Random Variables and PMFs | PL-05 — CDF and PMF Explorer |
| M08 — Discrete Distributions | PL-06 — Distribution Explorer |

These associations are explicit cross-links, not a containment hierarchy or a navigation sequence. They must not make a laboratory a subsection of a module, and they must not gate access to either the module's concepts or the laboratory.

The eventual content schema should represent module-to-laboratory associations as an explicit many-to-many relationship. A module may link to multiple laboratories, and a laboratory may support multiple modules. The crosswalk records the initial Part 1 associations; explicit links for Part 2 and Part 3 remain to be specified with playground scope.

Supplementary material must be distinguishable from content explicitly covered in the tutorial.

## 13. Responsive design

**Proposed requirement:** The application should remain usable on desktop, tablet and mobile.

The layout may change by screen size, but mathematical content and core interactions must remain available.

Specific responsive rules are deferred until the screen layouts are reviewed.

## 14. Out of scope for this artifact

This blueprint does not finalise:

- Colour palette, typography or visual identity.
- Exact component dimensions.
- Frontend framework.
- Mathematical rendering library.
- Charting or visualisation library.
- Data schemas.
- Mathematical engine implementation.
- Exercise-generation algorithms.
- Progress calculation.
- LLM integration.
- Detailed laboratory behaviour.

These will be addressed in separate artifacts.

## 15. Proposed follow-on artifacts

| ID | Artifact | Purpose |
|---|---|---|
| A-002 | Interaction Specification | Define behaviour of shared and screen-specific interactions |
| A-003 | Playground Specification | Detail all six labs and the custom builder |
| A-004 | Mathematical Engine Specification | Define calculations, validation and simulation requirements |
| A-005 | Content Schema | Define the structured content model |
| A-006 | Exercise and Assessment Specification | Define question types, validation and feedback |
| A-007 | Technical Architecture | Select technologies and define application architecture |
| A-008 | Implementation and Testing Plan | Define development sequence and acceptance criteria |

## 16. Change management

This document is a draft. No proposed screen detail becomes an approved requirement until reviewed.

When a design decision is approved:

1. Update this blueprint.
2. Record consequential decisions in the parent specification's decision log.
3. Update affected supporting artifacts.
4. Preserve stable identifiers and version history.
5. Ensure future implementation prompts reference the latest approved versions.

## 17. Revision record

### Version 0.2 — 14 November 2026

This revision incorporates four design-review changes while leaving unrelated open decisions unresolved:

1. **Dashboard hierarchy:** The Concept Atlas, Practice Gym and Probability Playground are presented as equally prominent primary entry points. Curriculum browsing is secondary. Progress is represented at the concept and exercise level; module and Part completion percentages are not the primary progress measure.
2. **Part selectors:** Part selection in the Concept Atlas and Practice Gym is an optional filter. The default view does not require a Part selection. All three Parts are content groupings, not locked chapters.
3. **Module–laboratory crosswalk:** The initial Part 1 module/laboratory associations are recorded in §12 as explicit, non-gating many-to-many cross-links.
4. **Laboratory identifiers:** The canonical identifiers PL-01 through PL-06, already established in the parent specification, are used consistently throughout this blueprint.

No implementation decisions, detailed data schemas, mastery criteria or laboratory interaction specifications are implied by these changes. Subsequent curriculum mapping incorporates the Part 1 ontology correction and module-level coverage from Parts 2 and 3; it does not finalize detailed lessons or lab support for those parts.

### Version 0.3 — Curriculum mapping update — 14 November 2026

This update adds the transcript-derived Part 1 corrections and maps Parts 2 and 3 into M09–M22. It preserves the four v0.2 design-review decisions and leaves detailed screen designs, lessons, technical choices, and lab extensions open.

**End of A-001 v0.3**

### Version 0.4 — Cross-Part design refinement — 14 November 2026

Adds the full parent module titles to the Atlas inventory; proposes dashboard continuation and recommendation behavior, dashboard-to-practice flow, a concept evidence model and review cadence; maps Part 2/3 overlaps to existing labs and proposes PL-07–PL-09; and clarifies that pre-built labs can be designed independently of the custom builder. These progress and new-lab details remain proposals for review; they do not amend approved product decisions.

**End of A-001 v0.4**




