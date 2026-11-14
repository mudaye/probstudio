# Probability Revision Studio — Roadmap

**Purpose:** Move from design documents to a working, feedback-ready end-to-end prototype as quickly as practical.  
**Current stage:** Specification and prototype planning; no application implementation exists.  
**Planning rule:** Build the smallest complete learner journey, gather feedback, then expand. Do not wait for every later curriculum, lab, mastery rule, or assessment format to be finalized.

---

## 1. Near-term outcome

Deliver a browser prototype that a learner can use from entry to saved outcome, and that the product owner can observe in a feedback session.

### Prototype journey

1. Open the Dashboard's neutral Practice Gym entry (no suggested-next logic) and enter the Gym directly.
2. Browse one source-reviewed Part 1 exercise and open it.
3. Submit a supported response; receive deterministic feedback and an explanation.
4. Open the linked concept and return without losing context.
5. Open PL-01 from the Playground, change an event operation, and see an exact probability result.
6. Return to Practice or the dashboard and confirm the attempt/activity record is still available after reload.

This slice demonstrates the three co-equal learning environments, one cross-link loop, deterministic checking/calculation, and local learner state. It is a prototype, not a complete curriculum or a mastery/revision release.

### Prototype success criteria

- A new learner can find and complete the journey without selecting a Part/module first or encountering a hidden prerequisite.
- The exercise response and result are understandable; mathematical feedback matches its answer key and A-004 operation.
- PL-01 defaults are valid; changing a supported control updates a correct result, and invalid input cannot replace the last valid result.
- Navigation preserves return context; reloading restores the recorded activity/attempt as specified for the prototype.
- The core journey is keyboard-operable and usable at narrow and desktop widths; one assistive-technology review is completed before feedback sessions.
- Feedback sessions produce a prioritized issue list with observed behavior, not just preference notes.

## 2. Delivery principles

- **Vertical slice before breadth:** one complete path through app shell, content, practice, deterministic engine, local persistence and lab is more valuable for early feedback than several polished but disconnected screens.
- **Use approved scope first:** build from the approved product direction and PL-01–PL-06. Proposed PL-07–PL-09 are excluded from the first prototype.
- **Prototype-only decisions stay labeled:** where A-006 or A-007 is still under review, record a narrow, reversible prototype assumption. Do not silently turn it into an approved product decision.
- **Do not block on mastery:** record attempts and activity, but defer Secure status, scheduling intervals, adaptive ordering and recommendation ranking.
- **Source before polish:** verify every displayed probability statement and source-derived example against the transcripts; label illustrative material.
- **No required AI:** complete the first learner path without a model service, external account or cloud database.
- **No premature platform work:** do not build the custom experiment builder, cross-device synchronization, a full content-authoring system or a complete Part 2/3 catalog before initial feedback.

## 3. Prototype completion & immediate next actions

### Completed in Stage 0–3 (Prototype vertical slice)
- [x] **Stack confirmed & running:** React 18, Vite, TypeScript, KaTeX, Vitest.
- [x] **Deterministic Math Engine:** Pure TypeScript exact rational arithmetic (`Rational`), operations `CAL-EVENT-001` and `CAL-EVENT-002` with 21 passing automated unit tests covering all required A-004 golden vectors.
- [x] **6-Step Prototype Learner Journey:** Neutral Dashboard -> Practice Gym (`EX-000001`) -> Exact evaluation & LaTeX derivation -> Context-preserving Concept Atlas jump (`C-000001`) and return -> Guided Lab PL-01 with live recalculation -> Persistent attempt/activity logging surviving reload.
- [x] **Navigation Layout Decision (Approved):** Top persistent header for the co-equal environments (Dashboard, Atlas, Practice, Playground); modules (M01–M22) are scoped as contextual, collapsible left sidebars/drawers inside Concept Atlas and Practice Gym (never a global app-level sidebar).
- [x] **Documentation Organization:** All 10 specification documents moved to `docs/` and cross-links updated.

---

### Implementation sprint: Next prioritized tasks

| Priority | Task | Scope & Deliverable |
|---|---|---|
| **P1** | **Contextual Module Navigation Panel** | Build the collapsible left drawer in **Concept Atlas** (browsable M01–M22 hierarchy by Part) and **Practice Gym** (multi-tag/module filter drawer). Preserves the non-gating rule. |
| **P2** | **Concept Atlas M01 Expansion** | Add remaining foundational concepts for Module M01: `C-000002` (Probability Axioms: Non-negativity, Normalization, Additivity) and `C-000003` (Derived Rules: Complements, Subsets, Inclusion-Exclusion). |
| **P3** | **Practice Gym Exercise Set (M01)** | Add exercises covering probability axioms and set rules (`EX-000002` Complement Rule, `EX-000003` Disjoint Unions) with deterministic verification. |
| **P4** | **Interactive Visualizations (SVG)** | Add interactive SVG Venn Diagram and 2x2 contingency grid for PL-01 to visually represent $A$, $B$, $A \cap B$, $A \cup B$, $A^c$, and $A \setminus B$, complete with accessible text descriptions. |
| **P5** | **Guided Lab PL-02 (Conditional Probability & Bayes' Rule)** | Implement `CAL-COND-001` ($P(A \cap B)/P(B)$) and `CAL-COND-002` (Total Probability / Bayes) in the deterministic engine with golden vector tests, followed by the PL-02 UI (prevalence, sensitivity, specificity, tree view). |
| **P6** | **Learner Data Export & Backup Tooling** | Add local JSON export and import with schema validation so learner progress and lab snapshots can be backed up and restored. |

## 4. Staged roadmap status

| Stage | Priority | Work | Status |
|---|---|---|---|
| **0 — Prototype checkpoint** | Baseline | Accept journey, scope, narrow A-006 subset, stack and browser baseline. | **Completed** |
| **1 — Technical spike** | Baseline | Create app shell, routes, KaTeX math rendering, local persistence adapter, deterministic math operations. | **Completed** |
| **2 — Deterministic domain slice** | Baseline | Implement `CAL-EVENT-001` and `CAL-EVENT-002`, exact rational arithmetic, validation statuses, golden vectors. | **Completed** (21/21 tests pass) |
| **3 — Learner journey** | Baseline | Build Dashboard, Practice Gym, Concept Atlas, Guided Lab PL-01, and context-preserving navigation. | **Completed** |
| **4 — Navigation & Content Expansion** | Current Sprint | Implement contextual module left sidebars, expand M01 concepts and exercises, add SVG visualizations. | **In Progress** |
| **5 — Lab PL-02 & Assessment Broadening** | Next Sprint | Implement `CAL-COND-001/002`, Bayes' Rule laboratory PL-02, and data export/import. | **Planned** |
| **6 — Feedback & Refinement** | Milestone | Structured feedback walkthrough on expanded prototype. | **Planned** |

## 5. Prototype decisions to keep narrow

These are recommended working assumptions for the prototype only. Record approval and scope in a short decision note; do not mark them as permanent product decisions.

| Topic | Prototype recommendation | Explicitly defer |
|---|---|---|
| Assessment | One authored exact-rational numeric response checked through A-004; preserve response and feedback; create a new attempt on a new Check. | Full A-006 review, expression grammar, free-text scoring, partial credit, unlimited-retry policy and hint impact on mastery. |
| Progress | Store attempt and activity evidence with concept/exercise links; show a simple history entry. | Secure thresholds, review spacing, due dates, recommendation ordering and adaptive sequences. |
| Labs | PL-01 only for the first slice; use CAL-EVENT-001/002 and a valid default. | PL-07–PL-09; custom experiment builder; broad simulation support unless PL-01 feedback requires it. |
| Persistence | Local-only storage behind an adapter; version the prototype records and test reload/reset. | Accounts, cloud sync, telemetry, production retention policy and robust cross-version user-data migration. |
| Content | One verified concept and a small exercise fixture. | Full transcript conversion, all 22 modules, editorial CMS and unreviewed examples. |
| Visuals | Semantic controls and text/table values; use only the chart needed for PL-01. | Full chart-library selection and visual design system. |
| AI | No AI in the first prototype. | Provider choice, server mediator, generated questions and written-response evaluation. |

## 6. Backlog after the first feedback loop

### Product and interaction decisions

- Review and close A-001/A-002 drafts based on prototype evidence.
- Decide concept status/mastery rules, evidence thresholds, review intervals, hint effects and scheduling.
- Decide dashboard suggestion signals, ordering, dismissal/snooze duration and starvation handling.
- Approve saved-state expiry windows, retention after expiry, and resume/discard interactions.
- Decide practice set/session behavior, retry rules, inline knowledge checks, and whether to introduce adaptive selection.
- Decide search implementation, ranking, and whether transcript text is indexed.
- Confirm whether to approve PL-07–PL-09 and normalize any new module associations; preserve full parent module titles in Atlas.

### Assessment — A-006 review is deferred

- When review resumes, decide the supported response schema and expression grammar, parser boundaries, equivalence policy and tolerances.
- Decide partial-credit rubric rules, retry limits, solution reveal behavior, hint effects and assessment of written reasoning.
- Reconcile the approved A-006 behavior with the prototype subset; update A-002/A-005/A-008 traceability where needed.

### Deterministic math and lab completeness

- Approve A-004 numeric type/library, exact-versus-approximate thresholds, operation-specific tolerances and convergence behavior.
- Approve Binomial/Poisson computation ceilings and align learner-facing A-003 parameter ranges.
- Define Poisson/Geometric tail targets, maximum displayed support and failure behavior.
- Select PRNG, lossless seed representation, run-count limits and final cross-platform reproducibility guarantees.
- Complete and verify remaining operation contracts and vectors; activate proposed PL-07–PL-09 calculations only after product/lab approval.
- Run the A-004/A-005 formula-to-calculation consistency gate for approved formula entries and calculation IDs.

### Technical architecture and operations

- Approve or change A-007’s framework/build/language, persistence, math renderer, visualization and browser baseline proposals.
- Finalize content and learner-state schema details, association authority, migration, import/export, backup and deletion behavior.
- Finalize ID grammar/route mapping, search fields and source excerpt/quotation policy.
- Set responsive breakpoints, dependency/package tooling, hosting/build pipeline and operational error-reporting policy.
- Decide deployment/hosting, content security policy, dependency review, error reporting and release process.
- Approve whether telemetry or any optional AI service is needed; define consent/privacy and server-side credential handling before development.
- Specify performance budgets only after prototype measurements identify meaningful bottlenecks.

### Curriculum and verification

- Continue Part 1 content verification and create source-grounded exercise coverage across the seven approved exercise categories.
- Add Part 2/3 content from the transcripts, linking existing concepts across parts rather than duplicating them.
- Complete A-008 browser, accessibility, security, migration, export/import and release evidence for production scope.
- Review WCAG target and assistive-technology/browser matrix; expand manual testing from the prototype's core journey.
- Consider PL-07–PL-09 only after transcript/source verification and proposed-lab approval; do not treat them as prototype blockers.

## 7. Current artifact status

| Artifact | Current status | Roadmap treatment |
|---|---|---|
| Product & Architecture Specification | Approved direction with open choices | Product authority; implementation approval gate remains. |
| A-001 v0.4 / A-002 v0.4 | Drafts for review | Use stable interaction contracts; defer unresolved mastery, expiry and suggestion policies. |
| A-003 v0.4 | Six initial labs specified; PL-07–PL-09 proposed | First slice uses PL-01 only; verify its default and calculations. |
| A-004 v0.2 / shared contracts v0.2 | Draft calculation and cross-document contracts | Implement only approved, necessary operations; preserve status/precision/version contracts. |
| A-005 v0.2 | Draft logical content/data model | Use stable IDs and non-gating associations; prototype storage remains temporary. |
| A-006 v0.1 | Review deferred | Use a narrowly scoped response subset only if separately accepted for the prototype. |
| A-007 v0.1 | Proposed architecture; choices pending review | Confirm a minimum stack for the prototype, with an exit path. |
| A-008 v0.1 | Draft readiness and verification plan | Use the first-slice checklist; defer production-scale gates only with rationale. |

## 8. Risks and responses

| Risk | Response |
|---|---|
| Waiting for every specification decision delays user feedback. | Limit the first slice, use explicit reversible assumptions, and defer unrelated decisions. |
| Prototype assumptions become accidental product policy. | Label assumptions in the UI/spec/decision note, capture feedback, and revisit before production. |
| Incorrect source transcription reaches learners. | Keep the sample content small and mathematically/source reviewed before use. |
| Local browser data is mistaken for durable backup. | Show prototype storage limitations and avoid relying on records the learner cannot export/restore. |
| Scope expands into a full LMS, custom builder or AI tutor. | Use the defined journey and exit criteria; move new requests to the post-feedback backlog. |
| A small feedback sample is treated as proof of learning efficacy. | Use sessions to find usability and comprehension issues; do not claim efficacy from early qualitative feedback. |

## 9. Roadmap maintenance

After each decision checkpoint or feedback round, update this file with completed stages, evidence links, changed priorities and newly discovered work. Keep it focused on outcomes and dependencies; detailed behavior remains in A-001–A-008.
