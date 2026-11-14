# A-008 — Implementation and Testing Plan

**Project:** Probability Revision Studio  
**Document ID:** A-008  
**Version:** 0.1  
**Date:** 14 November 2026  
**Status:** Draft for implementation-readiness review; no implementation authorized  
**Related documents:** PRS-PAS-001 v0.1; A-001 v0.4; A-002 v0.4; A-003 v0.4; A-004 v0.2; A-004/A-005 Shared Contracts v0.2; A-005 v0.2; A-006 v0.1; A-007 v0.1

---

## 1. Purpose and scope

Set out a staged implementation sequence, verification strategy, acceptance evidence and release gates for Probability Revision Studio. A-008 explains how approved requirements will be demonstrated; it does not change product behavior, approve unresolved proposals, select technology, or authorize implementation.

Requirements remain authoritative in their source documents. A-008 references the stable IDs and defines cross-cutting verification evidence. Before a feature is implemented, its relevant specification decisions must be approved or the feature must be explicitly scoped as a reversible prototype.

## 2. Readiness and scope controls

### 2.1 Implementation entry gate

Before production implementation begins, review and resolve or explicitly accept as scoped proposals:

- A-001/A-002 product and interaction decisions that affect the first release, including mastery/revision rules, saved-state expiry windows and dashboard suggestion behavior.
- A-003 initial lab controls, mathematically verified defaults and the PL-07–PL-09 approval boundary.
- A-004 exact/approximate numeric methods and tolerances, parameter ceilings, infinite-tail truncation, run limits, PRNG and seed representation.
- A-005 logical record fields, expiry derivation, migration and export/import requirements.
- A-006 response grammar, retry policy, hint effects, assessment format and any partial-credit policy. A-006 v0.1 is a draft; its review is deferred and none of its proposed choices are implicitly approved by A-008.
- A-007 selected framework/libraries, browser baseline, persistence adapter and security/privacy review.

If an open decision is not required for a reversible prototype, record the assumption, affected scope, evidence needed and removal path. Do not present the prototype as an approved product behavior or stable contract.

### 2.2 Scope boundaries

- Initial implementation scope is the approved product baseline and PL-01–PL-06. Proposed PL-07–PL-09 remain excluded from production scope until approved and mathematically verified.
- A prototype may validate architecture or accessibility choices without committing learner data or changing product decisions.
- No custom experiment builder dependency may block pre-built guided labs.
- No LLM feature is required to satisfy the acceptance plan. If one is added later, it receives separate privacy, security, and authority checks.

## 3. Verification strategy

Use layered verification. The exact tools and automation framework are selected in A-007; this plan defines required evidence independent of those tools.

| Layer | What it demonstrates | Minimum evidence |
|---|---|---|
| Content/schema lint | IDs, links, required fields, statuses, source references and non-gating associations are valid | Machine-readable lint report plus reviewed exceptions |
| Calculation unit/golden tests | A-004 operation outputs, error/status mapping and exactness behavior | Golden-vector results with CAL ID, engine version and input/output record |
| Property/boundary tests | Invariants hold beyond hand-picked examples | Reproducible generated/property cases and recorded seed; boundary report |
| Service integration tests | Feature, calculation, assessment, progress and persistence contracts compose correctly | Named cases for request/response versions, errors and state transitions |
| UI/component tests | Inputs, feedback, accessible announcements, tables and controls expose the intended states | Keyboard and screen-state evidence tied to requirement IDs |
| End-to-end browser tests | Representative learner journeys work across the application | Repeatable browser runs, traces/screenshots for failures and supported-browser matrix |
| Manual accessibility review | Assistive technology and keyboard use work in actual flows | Checklist with browser/AT/version, steps, outcome and unresolved barriers |
| Migration/recovery tests | Saved data survives supported upgrades and import/export failures safely | Fixture-based migration reports, rollback and invalid-file cases |
| Security/privacy checks | Client bundles, imported data, rendering and optional integrations meet constraints | Dependency/license review, secret scan, security configuration review and data-flow record |

Tests must be deterministic except for the single generated simulation seed governed by A-004. A generated seed is recorded before sampling; reruns use the recorded seed and algorithm version. Avoid tests that depend on network services, wall-clock ordering or uncontrolled browser state unless the test specifically validates that boundary.

## 4. Test case identifiers and evidence records

Use stable verification IDs of the form `TST-{AREA}-{NNN}`. IDs are opaque and never reused. An evidence record includes:

- Test ID, requirement IDs, build/commit identifier after implementation is authorized, test data fixture version and execution date.
- Preconditions and steps, expected result, observed result, pass/fail/blocked state and evidence location.
- Browser/OS/runtime and assistive-technology details when relevant.
- For calculations: CAL ID, engine/content versions, input, expected exact/numeric value, result status, precision, tolerance/error metadata and outcome.
- For simulations: lab/model settings, seed, count, algorithm version, runtime/platform and output comparison.
- For persistence: storage schema version, migration path and whether the operation is create/read/update/delete/import/export.

Never store learner-identifying data in test fixtures. Use synthetic content and synthetic learner records.

## 5. Acceptance matrix

The following matrix is the minimum cross-document coverage. Detailed case IDs and exact expected values are assigned when the relevant contract is approved and implementation begins.

| Test area | Requirements covered | Minimum acceptance evidence |
|---|---|---|
| Product navigation and entry points | PD-08; INT-ENTRY-01; INT-NAV-01/02; INT-PRACTICE-01 | Direct entry to Atlas, Practice and Playground; clear return context; optional filters; no module/Part gate; browser Back does not submit/reset. |
| Dashboard continuation and saved states | INT-STATE-01; INT-DASH-01A/B; DATA-STATE-01; DATA-RESUME-01 | Multiple resumable items; resume does not resubmit/recompute; cancel-safe discard; expiry and history restore according to approved windows; reload preserves session semantics. |
| Dashboard suggestions and review | INT-DASH-02A/B; INT-REVIEW-01; DATA-SUGGEST-01 | Suggestions are separate from recents, explain reason, do not auto-start; dismissal is trigger-instance scoped; only approved ordering/snooze rules are tested. |
| Content and source integrity | DATA-ID-01; DATA-ASSOC-01; DATA-MESSAGE-01; INT-SOURCE-01; INT-ATLAS-01 | Unique stable IDs; resolved links; no gating associations; correct full parent module titles; source/supplementary/editorial labels; every exposed message key resolves. |
| Lab interaction | LAB-COMMON-INPUT/STATE/ACCESS/SIM-01; LAB-CROSSWALK-01; PLxx-AC; INT-LAB-INDEX-01; INT-LAB-01 | Valid defaults; valid/invalid commits; stale-result handling; repair eligibility/confirmation; snapshot/reset/discard confirmations; accessible plot equivalent; proposed labs not listed as approved. |
| Deterministic calculation | DET-INPUT/STATUS/REPAIR/CALC-01; CAL-*; INT-MATH-01 | A-004 golden vectors, boundaries, result status versus precision, exact zero, unsupported versus invalid, numerical convergence/error target, and reproducibility. |
| Simulation | DET-SIM-01; LAB-COMMON-SIM-01 | Fresh seed recorded before Run; same seed/settings/count/version reproduce under the stated platform tier; Replay uses prior tuple; cancellation returns no complete partial result; changed settings mark empirical output outdated. |
| Exercise and assessment | EX-ITEM/FORMAT/GRAMMAR/CHECK/SCORE/FEEDBACK/HINT/RETRY/SELF/PROGRESS-01; INT-EXERCISE-01; INT-FEEDBACK-01 | Correct/incorrect/partial/incomplete/invalid/unscored paths; supported equivalent forms; unsupported syntax not graded wrong; preserved response; criterion score totals; progressive hints, solution reveal, retry lineage and separate self-assessment. Apply only the A-006 decisions that have been approved. |
| Progress and revision | INT-PROGRESS-01; INT-REVIEW-01; DATA-STATE-01; DATA-SUGGEST-01 | Raw evidence retained; manual review flag explicit and removable without deleting history; no lab-only Secure status; mastery/review calculations tested only after their rules are approved. |
| Persistence and data recovery | DATA-RESUME-01; ARCH-STATE-01; ARCH-EXPORT-01 | Save/load, quota/error path, version mismatch notice, migrations, export/import preview, malformed/oversized file rejection, conflict handling and rollback. |
| Accessibility and responsive UI | INT-ACCESS-01; LAB-COMMON-ACCESS-01; ARCH-ACCESS-01 | Keyboard-only complete journeys; announced dynamic state; visible focus; zoom/reflow; screen-reader checks; equivalent math/visual summaries at supported widths. |
| Security and privacy | ARCH-PRIVACY-01; A-007 §5 | No provider secrets in shipped client assets; imported data is validated; authored content is safely rendered; no unapproved telemetry/account requirement. |

## 6. Mathematical and deterministic acceptance gates

### 6.1 Calculation gate

- Every enabled calculation maps to an active A-004 CAL ID and approved operation contract.
- Golden vectors include the required PL-01–PL-06 cases and boundaries in A-004; proposed-lab vectors remain gated by lab approval.
- Exact rational outputs are compared exactly. Approximate outputs include method, precision and error/tolerance metadata; acceptance checks the declared bound, not rounded display text.
- `valid` with value zero is tested distinctly from `undefined`; invalid configuration and unsupported capability produce their own status/error mappings.
- Repairs are learner-triggered, eligible-only, previewed, exact where available, and never applied to the original without confirmation.

### 6.2 Simulation gate

- Same model/settings, run count, seed and algorithm version reproduce the declared output sequence and summaries.
- Discrete rational sampling meets A-004's cross-platform contract; continuous sampling is checked against its documented same-runtime contract and explicitly documented cross-platform limitation.
- Seed generation is the only permitted nondeterminism and is recorded before sampling.
- Cancellation, run limits, stale/outdated distinction, saved result versions and replay are covered.

### 6.3 Assessment gate

- The answer parser accepts only the approved A-006 grammar, is bounded, and never executes learner input.
- Outcome and scoring come from the authored answer key/rubric and A-004 primitives; optional AI cannot change either.
- An unsupported/unparseable response is not recorded as mathematically incorrect.
- Retry, hint, solution, response persistence and self-assessment behaviors follow the approved A-006/A-002 choices; unresolved A-006 proposals are not acceptance requirements.

## 7. Proposed implementation stages

Each stage ends with a review checkpoint. Starting a stage still requires approval; this sequence is a plan, not authorization.

| Stage | Scope | Exit evidence |
|---|---|---|
| 0. Contract and architecture approval | Close implementation blockers; approve A-007 stack and applicable A-006 decisions | Decision log; supported browser/accessibility baseline; explicit first-release scope |
| 1. Technical spike | Route shell, content loading, math rendering, deterministic package boundary, persistence/export prototype | Architecture proof, accessibility prototype, migration/export risk assessment; no permanent learner data |
| 2. Core content and progress foundations | A-005 content loading, non-gating navigation, local learner records and migration path | Content lint; local persistence failure/recovery evidence; ID/deep-link checks |
| 3. Practice Gym vertical slice | Approved A-006 response type(s), A-004 checking, attempt history, feedback and resume | Exercise acceptance matrix and accessible keyboard/screen-reader flow |
| 4. Initial guided labs | PL-01–PL-06, deterministic outputs, simulation where approved, snapshots and resume | PL acceptance, golden vectors, seeded replay, chart/table accessibility |
| 5. Atlas/dashboard/revision integration | Cross-links, Continue, recent activity and only approved suggestion/progress rules | INT acceptance, state/expiry/migration evidence |
| 6. Release readiness | Cross-browser, performance, security/privacy, accessibility, backup/export and content review | No unresolved release-blocking defects; signed acceptance record |
| 7. Later curriculum/lab expansion | Approved Part 2/3 content and approved PL-07–PL-09 | Source/math verification and new CAL/lab acceptance evidence |

Order between Stages 3 and 4 may change based on product approval and learning validation; neither requires the other to be designed as a gate. The custom experiment builder remains separately scoped.

## 8. Defect severity and release gates

| Severity | Examples | Release treatment |
|---|---|---|
| Blocker | Incorrect authoritative probability, silent data loss, answer engine accepts unsafe code, credential exposure, access gate contradicts PD-08 | Block release; fix and rerun affected acceptance suite. |
| High | Core task cannot be completed by keyboard/screen reader; resume/discard corrupts state; incorrect status or unsupported result shown as valid | Block affected feature/release until fixed or product-approved scope exclusion is documented. |
| Medium | Major feedback/source/link issue with a usable workaround; noncritical browser-specific visual issue | Fix before broad release or document owner/date and narrow supported scope. |
| Low | Minor visual/copy defect with no mathematical, accessibility, persistence or navigation impact | May be deferred with a tracked issue and review date. |

Release requires: approved scope, all Blocker/High defects closed, all applicable requirements traceable to passing evidence, A-004 calculations verified, source-derived items reviewed, local data recovery exercised, and accessibility/privacy gates passed. A waived criterion requires an explicit product decision and documented impact; a failed test is not silently reclassified as out of scope.

## 9. Test and traceability requirements

| Requirement ID | Requirement | Acceptance / traceability |
|---|---|---|
| QA-TRACE-01 | Each implemented requirement maps to at least one test/evidence record. | Requirement-to-test matrix is complete; exceptions have rationale and approver. |
| QA-MATH-01 | Mathematical acceptance is based on A-004 contracts and values, not screenshots or LLM output. | Golden vectors, boundaries and status/precision evidence exist for every enabled CAL ID. |
| QA-REPRO-01 | Seeded runs and deterministic answer checks reproduce. | Seed/version/input evidence is recorded and reproducibility contract passes. |
| QA-A11Y-01 | Core flows are usable with keyboard and assistive technology. | Automated and manual evidence cover entry, check/feedback, lab controls, dashboard resume and error states. |
| QA-DATA-01 | State changes, migration, expiry, export/import and failure recovery preserve records as specified. | Fixture and fault-injection evidence; no silent loss or duplicate attempt creation. |
| QA-CONTENT-01 | Released content has verified source/status/IDs and valid links. | A-005 lint and content-review evidence; no proposed content appears as approved. |
| QA-SEC-01 | Client bundle, content rendering, import and optional integrations meet A-007 security boundaries. | Secret/dependency/render/import review evidence; AI disabled-path verified. |
| QA-RELEASE-01 | Release gate is enforced and defects are dispositioned. | Signed evidence index, known limitations and approved waivers accompany each release candidate. |

## 10. Open decisions and handoffs

| Topic | Owner / next step |
|---|---|
| Architecture baseline and browser target | Product review of A-007 proposal |
| A-006 grammar, retry and hint policy | Deferred product review; A-006 v0.1 proposals stay provisional |
| Mastery states/review intervals and dashboard ranking | Product review in A-001/A-002; do not build assumptions into Stage 5 |
| Engine tolerances, tail limits, run limits and seed algorithm | A-004 review before corresponding production feature |
| Persistence/export format and recovery UX | A-005/A-007 review and prototype before durable local use |
| WCAG target and manual AT/browser matrix | Product review of A-007 proposal; accessibility acceptance in A-008 |
| Test framework, CI and evidence storage | A-007 tool choice after architecture approval |

## 11. Revision record

### Version 0.1 — Initial implementation and testing plan — 14 November 2026

Defines implementation readiness gates, layered verification, acceptance traceability, mathematical and simulation gates, proposed delivery stages, defect severity and release criteria. All stages require separate authorization; unresolved A-006 review items remain provisional.

**End of A-008 v0.1**
