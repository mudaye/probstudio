# A-005 — Content and Data Model Specification

**Project:** Probability Revision Studio  
**Document ID:** A-005  
**Version:** 0.2  
**Date:** 14 November 2026  
**Status:** Draft for design review  
**Related documents:** PRS-PAS-001 v0.1; A-001 v0.4; A-002 v0.4; A-003 v0.4; A-004 v0.2; A-004/A-005 Shared Contracts v0.2; A-006 v0.1; A-007 v0.1; A-008 v0.1

---

## 1. Purpose, scope and boundaries

Define the logical content entities, stable identifier rules, non-gating associations, source traceability, learner-state records and search metadata needed by Probability Revision Studio. This is a technology-neutral conceptual model, not a database schema.

- A-004 owns calculations, validation, status semantics, numerical methods, error codes and simulation algorithms.
- A-005 owns authored content, content identifiers/version, message keys, association metadata and the logical learner-record model.
- A-006 owns exercise formats and grading policy; A-005 stores exercise shells and attempt references/outcomes.
- A-007 chooses storage, indexing, serialization and migration mechanisms.
- Content and learner state are logically distinct even if a later implementation stores them together.

Use the shared ownership/version/result/seed/error contracts in [A-004/A-005 Shared Contracts](A-004_A-005_Shared_Contracts_v0.2.md).

## 2. Identifier scheme

### 2.1 Existing canonical IDs

- Parts: P1, P2, P3.
- Modules: M01–M22 as listed in PRS-PAS-001.
- Guided labs: PL-01–PL-06 canonical; PL-07–PL-09 remain provisional proposals.
- Transcript artifacts retain their current filenames under `transcripts/` and receive source IDs in the content model rather than being renamed.

### 2.2 Proposed ID grammar

The grammar is proposed for review before concept/exercise/formula IDs are assigned:

| Entity | Proposed stable ID shape | Example |
|---|---|---|
| Concept | `C-{sequence}` | `C-000001` |
| Formula entry | `F-{sequence}` | `F-001` |
| Exercise | `EX-{sequence}` | `EX-000001` |
| Source reference | `SRC-P{part}-CH{chapter}-{sequence}` | `SRC-P3-CH04-001` |
| Editorial clarification | `ED-{sequence}` | `ED-001` |
| Message key | `MSG-{error-code-suffix}` | `MSG-PROB-SUM` |
| Lab | Existing PL ID | `PL-01` |

Concept, exercise and formula IDs are opaque and do not encode mutable Part/module membership; membership is represented only by association records. IDs are immutable once referenced by saved learner records or published content. Retire IDs instead of reusing them. Renamed content retains its ID; content split/merge operations create new IDs and preserve explicit supersession/alias links. Module IDs are structural grouping identifiers, not prerequisites.

### 2.3 Deep links

Each content ID resolves through a canonical route/lookup mapping. A-002 Back and cross-link behavior depends on stable destinations, but route syntax is implementation-owned by A-007. Routes must tolerate renamed titles and preserve source context without making association links gating.

## 3. Content entities and fields

### 3.1 Shared content metadata

Every content entity has: stable ID, title/label, content status, source/supplementary/editorial classification, Part/module associations where relevant, source references, version introduced/modified, and review metadata. Do not duplicate source-derived concepts when a later Part extends them; use typed relationships.

### 3.2 Core entities

| Entity | Core fields (logical) |
|---|---|
| Part | ID, title, source series reference, display order, availability/content status |
| Module | ID, Part ID, full parent title, coverage summary, transcript chapter links |
| Concept | ID, title, intuition, formal definition reference, assumptions, examples, derivation/explanation blocks, misconceptions, source refs, status |
| Formula entry | ID, display name, rendered expression, symbols, assumptions, interpretation, worked example refs, A-004 calculation ID(s), source refs |
| Exercise shell | ID, prompt/content refs, associated concepts/modules, source refs, difficulty/category metadata; response/grading format details are A-006-owned |
| Lab entry | PL ID, title, purpose, learning question, supported controls/output summary, source refs, approved/proposed status, resume contract reference to A-003 |
| Symbol definition | Symbol/context, meaning, domain/units, related formula/concept |
| Source reference | ID, Part, transcript artifact, chapter, optional timestamp range, source note/locator |
| Editorial clarification | ID, correction/extension text, reason, linked original source reference, review status |
| Message entry | A-004 error code or UI/announcement key, learner-facing message/label, repair guidance/action label, accessibility announcement text |

### 3.3 Content lifecycle

Use the lifecycle: `draft` → `reviewed` → `math_verified` where relevant → `approved` → `retired`. A learner-facing source-derived math item must not become approved until its notation and claims have been checked against the source and mathematical requirements. Supplemental content is labeled supplementary; transcription corrections are labeled editorial clarification and retain a source pointer.

## 4. Association model

Associations are explicit records with `from_id`, `to_id`, `relationship_type`, `status` (`proposed`, `approved`, `retired`), source/rationale; `gating` is not a per-record field. Schema invariant: all discovery associations are non-gating. Prerequisite relationships describe conceptual dependency and can support explanation/recommendation, but never deny access.

Supported relationship types include:

- Part–module membership.
- Module–concept membership.
- Concept–concept: `prerequisite`, `related`, `extends`, `application_of`, `review_spanning`.
- Concept–formula and exercise–concept.
- Concept/module–lab many-to-many association.
- Content–source reference and editorial clarification–source reference.
- Content supersedes/alias relation for retired IDs.

### 4.1 Lab crosswalk source of truth

A-005 association records are authoritative for lab links. The PL crosswalk in A-003 is a human-readable view of those records. Existing Part 1 links are retained. Proposed Part 2/3 links remain `proposed` until approved. Modules M19, M20 and M22 have no lab association in the current A-003 scope; this does not make their content unavailable in the Atlas or Practice Gym.

## 5. Source attribution and traceability

- A source locator records Part, transcript filename, chapter, optional timestamp range, and a concise locator note.
- Concepts, formulas, exercises and lab scenarios retain source references. Source-derived content, supplementary content and editorial clarification are distinguishable in learner-facing views.
- Corrections link to the original transcript location and record corrected expression/text, rationale and reviewer status.
- Compact attribution may appear inline; full source metadata opens without losing the current learning activity.
- Curated transcript excerpts and quotation limits/rights require review before use. Prefer concise attribution and paraphrase pending that review.

Source-derived examples used for lab defaults (including A-003's proposed PL-09 continuous density) require a `math_verified` status before activation.

## 6. Versioning and migration semantics

A-005 owns global `content_release_version` and dependency-scoped calculation `content_version`. Global editorial changes do not themselves trigger recalculation. A result content version changes only when its dependency set changes in a way that can alter model inputs or result meaning. The record stores content version alongside `calculation_engine_version` and, for simulations, `simulation_algorithm_version`; A-004 owns the latter two. Content edits that cannot change the meaning/output do not alter calculation-engine version. A content change that changes model inputs or interpretation updates content version and triggers A-002's saved-output notice/recalculation flow.

Retired IDs remain resolvable for historical attempts and resume records. When a content ID is superseded, retain its old record and point to the replacement. Migrations are explicit and versioned by A-007; do not silently rewrite historical responses or outcomes.

## 7. Logical learner-state model

This section defines record meaning, not storage technology. A-007 specifies persistence and backup.

| Record | Required logical fields |
|---|---|
| Exercise attempt | Attempt ID, exercise ID, concept links, timestamp, raw response, hint-use sequence, deterministic outcome/status or `unscored`, calculation/content versions, feedback/message references |
| Self-assessment | Attempt/concept ID, learner choice (`can_explain`, `partly`, `need_help`), timestamp; separate from correctness and mastery evidence |
| Concept evidence | Concept ID, linked attempt IDs and outcomes, activity events; derived status is not stored as sole truth while mastery rules remain open |
| Manual review flag | Concept ID, created/removed timestamps and action source; removing the flag does not delete history |
| Activity history event | Event ID, target content ID, activity type, timestamp, relevant context |
| Dashboard suggestion state | Trigger/content ID, trigger-instance ID (for example attempt/event ID), dismiss/snooze action, timestamp, optional expiry; new trigger instances may create new suggestions |
| Exercise resume state | Exercise ID, unsubmitted response or checked-not-continued response/feedback, timestamp, content/calculation versions as applicable |
| Lab resume state | Common envelope (lab ID, payload-schema version, engine/content versions, simulation-algorithm version when applicable, updated timestamp) plus lab-specific payload schema ID/version and fields defined in A-003 |

Store raw evidence so concept status can be recomputed if the proposed mastery thresholds change. Unscored free-text self-assessment never becomes correctness evidence. It may create a review flag only through the explicit A-002 action.

### 7.1 Deletion, expiry and discard

- Removing a manual review flag removes the flag, not evidence/history.
- Discard removes the selected resumable state after A-002 confirmation; completed attempts remain.
- Expiry is derived from last-activity timestamp plus the approved activity-specific policy; do not persist `expired_saved_state` as a source field. Persist the policy version used for determination.
- Expiry windows, retention beyond expiry, and progress data deletion/export remain open for product review/A-007.

## 8. Search metadata

Searchable fields should include IDs, titles, aliases, full module names, concept text, formula names/symbols, exercise titles/prompts where appropriate, source metadata, and approved tags. Results group by entity type and display Part/module context. Search ranking, indexing implementation and whether transcript text itself is indexed are open for A-007; search never requires a Part filter.

## 9. Authoring and data-quality checks

Before content approval, check:

- Every required ID is stable and unique; links resolve.
- Every source-derived item has an available source reference; editorial clarifications link back to original source.
- Formula entries reference valid A-004 calculation IDs and pass the shared formula consistency check.
- Every association has a status and obeys the schema invariant that access associations never gate.
- No duplicate lab crosswalk links; no orphaned content introduced by a split/retirement without a replacement relation.
- Defaults, ranges and source-derived lab examples meet the A-003/A-004 verification gates.
- A-004 error codes exposed in content have a message key and plain-language message.
- Learner records store all required version fields and do not collapse self-assessment into correctness.

Automated lint implementation belongs in A-007/A-008; these are authoring requirements now.

## 10. Requirement IDs and open handoffs

| Requirement ID | Requirement | Traceability |
|---|---|---|
| DATA-ID-01 | Content IDs are opaque, immutable and do not encode mutable associations. | A-001 content links; A-008 content lint |
| DATA-ASSOC-01 | Associations are authoritative, many-to-many and non-gating by schema invariant. | INT-NAV-01/02; LAB-CROSSWALK-01; A-008 association lint |
| DATA-VERSION-01 | Global editorial release and calculation dependency versions are separate. | A-002 §2.5; DET-STATUS-01; A-008 compatibility checks |
| DATA-STATE-01 | Expiry is derived; raw timestamps and policy version are retained. | INT-DASH-01; INT-DASH-02A/B; A-008 expiry cases |
| DATA-SUGGEST-01 | Dismissal binds to a trigger instance so a new trigger can create a new suggestion. | INT-DASH-02A/B; A-008 suggestion checks |
| DATA-RESUME-01 | Lab state uses a common versioned envelope and A-003 payload schema. | LAB-COMMON-STATE-01; A-008 resume checks |
| DATA-MESSAGE-01 | Error, control-label and announcement keys resolve to accessible messages. | LAB-COMMON-ACCESS-01; A-008 message coverage |

The `DATA-*` requirement family is stable. The requirements above map to interaction, lab, calculation and A-008 verification criteria.

| Topic | Status / next artifact |
|---|---|
| Final ID grammar and route mapping | Product review; A-007 route implementation |
| Exact logical schema and migrations | A-007 |
| Lab crosswalk approval | Product review; A-003/A-005 |
| Mastery and revision schedule | Product review; keep raw evidence fields until settled |
| Retention, deletion, export and backup | A-007/product review |
| Formula-to-calculation consistency gate | Joint A-004/A-005 review |
| Source excerpt/quotation policy | Content review before excerpts are shown |

## 11. Revision record

### Version 0.1 — Initial content/data model draft — 14 November 2026

Defines proposed stable ID grammar, logical entities/associations, source traceability, shared version fields, learner state and data-quality workflow without choosing storage technology.

### Version 0.2 — Stable IDs and state model alignment — 14 November 2026

Uses opaque content IDs, establishes A-005 association authority, separates editorial release from dependency compatibility, derives expiry state, adds trigger-instance and lab resume schemas, message keys and DATA traceability.

**End of A-005 v0.2**
