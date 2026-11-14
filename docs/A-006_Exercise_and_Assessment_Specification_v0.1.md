# A-006 — Exercise and Assessment Specification

**Project:** Probability Revision Studio  
**Document ID:** A-006  
**Version:** 0.1  
**Date:** 14 November 2026  
**Status:** Draft v0.1; product and assessment review deferred  
**Related documents:** PRS-PAS-001 v0.1; A-001 v0.4; A-002 v0.4; A-004 v0.2; A-005 v0.2; A-007 v0.1; A-008 v0.1

---

## 1. Purpose and scope

Define the exercise model, supported response formats, deterministic checking and scoring, feedback, hints, retries, attempt records, and assessment boundaries for the Practice Gym and embedded knowledge checks.

- A-002 owns the learner-facing practice flow, navigation, resume behavior, and high-level feedback interaction.
- A-003 owns guided lab controls; lab activity is not an assessed exercise unless a separate exercise is authored.
- A-004 owns mathematical calculations, validation, numerical tolerances, calculation IDs, and deterministic comparison primitives.
- A-005 owns exercise content records, stable IDs, source and concept associations, message keys, and learner attempt records.
- A-006 owns exercise item structure, response schemas, scoring/rubric rules, feedback criteria, and the use of A-004 comparison primitives.
- A-008 verifies acceptance and integration behavior.

This is a content and behavior specification, not a complete exercise bank, storage schema, or implementation decision. Exercise selection and adaptive ordering remain open; a learner can browse and start a chosen item without an adaptive system or fixed session.

## 2. Assessment principles

1. **Mathematical authority is deterministic.** A-004 calculations and authored answer keys/rubrics determine correctness. An LLM must not override or invent a mathematical outcome.
2. **Feedback teaches.** State the assessed result and explain the relevant reasoning or misconception. Do not rely on a bare green check, red cross, or answer reveal.
3. **Preserve the learner's work.** Checking does not clear or rewrite the response. Equivalent expressions may be accepted according to an authored comparison policy; show the learner's original entry unchanged.
4. **Use partial credit only when criteria support it.** Each awarded component maps to explicit rubric criteria. Do not infer partial correctness from unstructured prose.
5. **Separate evidence types.** Correctness, hint use, self-assessment, time, and manual review flags are distinct records. Self-assessment is not correctness or mastery evidence and does not alter review scheduling.
6. **Do not turn curriculum structure into a gate.** Exercise availability and navigation do not require prior Part/module completion or an assigned mastery state.
7. **Keep authored source status visible.** Source-derived items cite their transcript location; supplementary explanations and corrections are labeled per A-005.

## 3. Exercise record and item lifecycle

### 3.1 Exercise shell

Each published exercise has a stable A-005 exercise ID and at least:

- Prompt and any stimulus/data/diagram references.
- One or more response parts, each with a response type and validation/checking contract.
- Authored answer key or rubric, including scoring and accepted-equivalence policy.
- Feedback for correct, incorrect, partial, incomplete, and invalid/unparseable responses as applicable.
- Ordered hint content and solution/explanation content, each with a reveal policy.
- Linked concepts, source references, exercise category, and editorial/source status.
- Difficulty metadata if curated; difficulty is descriptive and does not gate access.
- Attempt policy fields: retry availability and whether a new attempt is created on retry.

An item is not ready for learner release unless its answer key/rubric, response validation, accessible input mode, feedback, source status, and verification evidence are complete. Unscored reflection items are explicitly marked `unscored`; they do not masquerade as deterministic assessment.

### 3.2 Lifecycle

Draft → reviewed → answer-verified → approved → retired. For source-derived mathematics, source and mathematical review are required before approval. Retired exercise IDs remain resolvable for historical attempts and are never reassigned.

## 4. Exercise categories

Support these content categories, consistent with the product baseline:

| Category | Typical learner task | Suitable response modes |
|---|---|---|
| Concept identification | Identify an event, distribution, condition, or concept from a description | Single choice, select-all, matching, short response with authored rubric |
| Formula selection | Select an applicable relationship and identify its assumptions | Single choice, matching, structured selection |
| Numerical calculation | Compute a probability, parameter, moment, or other specified quantity | Exact/numeric input, expression input |
| Mathematical derivation | Supply justified steps or a derivation | Structured steps, expression parts, or unscored/curated written rubric |
| Error detection and correction | Diagnose a worked claim and repair it | Select error, select/correct expression, structured explanation |
| Scenario-based modelling | Define events, variables, assumptions, or model parameters | Structured controls, tables, matching, expression input |
| Interpretation | Explain the meaning, assumptions, or limitations of a result | Choice, structured response, or unscored written response |

Category and response format are separate metadata: one category may use several formats, and the learner can filter by either.

## 5. Response formats and checking contracts

### 5.1 Deterministically scored formats

| Format | Response representation | Checking contract |
|---|---|---|
| Single choice | One option ID | Compare to authored correct option(s); distractors may map to misconception-specific feedback. |
| Select all that apply | Set of option IDs | Compare selected set with authored accepted set(s); define whether any partial credit applies. |
| Matching | Explicit pair mapping | Score by authored pair-level rubric; reject missing/duplicate mappings where not permitted. |
| Exact numeric | Finite integer/rational/decimal input | Parse using A-004-safe numeric parsing; compare exactly where representable and expected, otherwise use an authored A-004 tolerance. |
| Mathematical expression | Expression in the supported grammar below | Parse without executing code; canonicalize and compare using the authored A-004 primitive. Unsupported syntax is not graded as incorrect; request a supported form or route to unscored review. |
| Structured steps | Ordered response fields, each with a defined type | Check each field against its authored criterion; score only explicit criteria and report incomplete parts. |

### 5.2 Mathematical expression grammar

**Proposed initial grammar:** numeric literals (integer, finite decimal, or rational `a/b`); named symbols declared in the item; parentheses; unary signs; `+`, `-`, `*`, `/`, and integer powers; and explicitly listed elementary functions only when an item enables them. Implicit multiplication is not accepted in v0.1. No variables, function calls, assignments, imports, executable code, or arbitrary evaluator syntax are allowed.

Parsing and canonical comparison must be deterministic and bounded. A-004 supplies exact rational and approximate comparison; A-006 declares the expected quantity, dimension/domain, required form (if any), exactness mode, and tolerance reference on each response part. Algebraic equivalence beyond the declared canonicalizer is not assumed. If two mathematically equivalent forms are not supported, feedback must say the format could not verify the form and offer an approved input route; it must not claim the mathematics is wrong.

### 5.3 Unscored and human-readable responses

Free-text explanation is `unscored` unless the item has a finite, deterministic rubric that assesses explicit structured criteria. In the unscored case, show curated self-check criteria or a model explanation after the learner chooses to reveal it. Optional self-assessment uses the A-002 control and remains separate from correctness. A generative feature may offer optional practice support only if separately approved; it cannot assign the authoritative score or alter the attempt outcome.

## 6. Scoring and feedback

### 6.1 Outcome vocabulary

Use an attempt outcome separate from A-004 calculation `result_status`:

| `attempt_outcome` | Meaning |
|---|---|
| `correct` | All required criteria are satisfied. |
| `partially_correct` | At least one criterion is satisfied and at least one is not; partial scoring is enabled for the item. |
| `incorrect` | A valid, interpretable response satisfies none of the required criteria or selects an authored incorrect option. |
| `incomplete` | Required response parts are missing or not yet supplied. |
| `unscored` | No deterministic answer key/rubric applies. |
| `invalid_response` | The submitted representation cannot be parsed or violates the response schema; no correctness judgment is made. |

For exact numeric or expression answers, accept only the authored target equivalence. For approximate values, the item specifies tolerance policy by reference to A-004 metadata; do not introduce a hidden global tolerance. A valid zero answer remains eligible for `correct`.

### 6.2 Partial credit

Partial credit is optional per item and requires an explicit criterion list, each with a stable rubric criterion ID, point/weight value, and feedback association. The maximum is the sum of criterion weights; no negative points in v0.1. Normalize to a score only if the exercise defines a maximum score. Do not infer a score for prose or derivation quality from an LLM. Record both criterion outcomes and aggregate outcome so later progress rules can be revised without losing evidence.

### 6.3 Feedback

Feedback after Check includes:

- Outcome and score/criterion summary where scored.
- A concise explanation tied to the learner response or selected distractor.
- The correct answer or worked solution only when the authored reveal policy allows it.
- A next action such as Retry, reveal a hint/solution, open a linked concept, or Continue.

Invalid input feedback describes the format/constraint and preserves the response for editing. Incomplete feedback identifies missing parts. An unscored response clearly says it was not automatically evaluated and presents self-check criteria if authored. Feedback content may not contradict the answer key/rubric or A-004 result.

## 7. Hints, solution reveal, and retries

- Hints are authored in ordered levels, from least revealing to most revealing. Opening a hint is recorded with its level and timestamp; merely viewing a hint does not submit or change correctness.
- The solution is a separate action and may be revealed after Check or earlier only if the exercise explicitly permits it. Solution reveal does not turn an unanswered attempt into a correct/incorrect one.
- Retry availability and reset behavior are item-authored. A retry creates a new attempt record linked to the same exercise and any prior attempt; it does not overwrite history.
- **Proposed baseline pending product review:** retries are unlimited; the learner may revise and check again after feedback. A new Check after a scored response creates a new attempt. An unsubmitted response remains resumable under A-002.
- Hint effects on mastery and review scheduling are not decided here. A-001’s proposed rule that hint-supported correctness does not advance a review interval remains unapproved until the product closes the progress model. Store hint use so the rule can be applied later.

## 8. Attempt and response records

A-005 owns persistence. A logical completed attempt should retain:

- Attempt ID, exercise ID, timestamp, response-part values, and response format/schema version.
- `attempt_outcome`, scored criteria/points where applicable, and whether the result was deterministic or unscored.
- Hint levels opened, solution reveal event, retry lineage, and learner self-assessment in its separate record.
- Concept links as they existed for that item/version, calculation IDs used where applicable, and calculation/content versions needed to reproduce the check.
- Feedback/message references and any invalid-response status.

Do not store only the aggregate score: preserve the raw response and criterion-level evidence. An unsubmitted response is saved as resume state, not as a completed attempt. A checked attempt awaiting continuation may resume with its response and feedback; resuming does not grade again. Expiry and discard follow A-002/A-005 and do not delete completed attempt history.

## 9. Integration with progress and review

A-006 records assessable evidence; it does not define concept mastery thresholds, dashboard suggestion ordering, or spaced-review intervals. Those remain product decisions associated with A-001/A-002 and A-005.

- Only deterministic scored exercise outcomes can contribute correctness evidence.
- A lab visit, hint opening, solution reveal, and self-assessment are distinct from a correct unassisted answer.
- An unscored response is retained as activity, not correctness evidence.
- “I need help” may offer **Add to review list**; only explicit confirmation creates the manual review flag.
- Store format, score/criterion evidence, hint use and attempt dates so a later approved model can calculate mastery/review without changing historical records.
- Do not display a definitive Secure status, score-to-mastery interpretation, or review date until the corresponding product rules are approved.

## 10. Requirements and acceptance criteria

| Requirement ID | Requirement | Acceptance criteria / traceability |
|---|---|---|
| EX-ITEM-01 | Approved items are complete, versioned and source-traceable. | Each released item has a stable ID, prompt, response contract, key/rubric, feedback, hint/reveal policy, concept links and review status; A-005 source and lifecycle fields resolve. |
| EX-FORMAT-01 | Supported response formats have explicit deterministic contracts. | Valid supported responses are checked by their authored contract; missing parts yield incomplete; unparseable input yields invalid_response and is not called mathematically incorrect. |
| EX-GRAMMAR-01 | Expression parsing is safe, bounded and deterministic. | Allowed grammar is accepted; unsupported or malformed syntax is rejected without code execution and leaves the learner’s original response intact. |
| EX-CHECK-01 | Correctness uses authored keys/rubrics and A-004 comparison primitives. | Exact, approximate, zero, invalid, and supported-equivalent forms produce the authored outcomes; a result/status/version mismatch cannot silently replace saved feedback. |
| EX-SCORE-01 | Partial credit is criterion-based. | Only authored criteria contribute points; aggregate and criterion evidence are stored; unscored prose receives no inferred score. |
| EX-FEEDBACK-01 | Feedback is explanatory, accessible and consistent with the key. | Correct/partial/incorrect/incomplete/invalid/unscored cases have suitable feedback; response remains visible; focus/announcement follows INT-EXERCISE-01. |
| EX-HINT-01 | Hints and solution reveal are distinct, progressive events. | Hint levels reveal in order and are recorded; solution reveal is separately recorded; neither changes correctness by itself. |
| EX-RETRY-01 | Retry creates new evidence without overwriting history. | Item retry policy is honored; prior attempts and raw answers remain accessible; resume never auto-checks. |
| EX-SELF-01 | Self-assessment remains separate from correctness and schedule. | A-002’s three choices are available for unscored responses, stored separately, do not modify outcome/mastery/schedule, and require explicit confirmation for a review flag. |
| EX-PROGRESS-01 | Exercise evidence is usable without prematurely fixing mastery rules. | Attempt records retain format, timestamps, outcomes, hint use and concept links; no unapproved Secure/scheduling rule is implied. |

## 11. Verification and handoffs

For each approved exercise, A-008 verification evidence should cover:

- Correct, incorrect, partial, incomplete, invalid-response, and unscored paths as applicable.
- Exact rational and decimal equivalence, authored approximate tolerance, zero-valued results, and a supported alternative expression.
- Expression parser allowed/forbidden syntax, resource limits, and preservation of original input.
- Criterion scoring totals, hint order, solution reveal, retry lineage, resume, and accessible feedback behavior.
- Source and concept links, calculation IDs, and retained engine/content versions.

| Topic | Owner / next step |
|---|---|
| Retry limit and post-check retry UX | A-002/A-006 product review |
| Hint effect on mastery and scheduling | Product review with A-001/A-002 progress model |
| Expression grammar breadth and algebraic equivalence | Approve this grammar, then A-007 implementation and A-008 verification |
| Human assessment of derivations/free text | Product review; remain explicitly unscored unless deterministic rubric exists |
| Exercise-bank authoring and source verification | Content authoring under A-005; transcript-grounded review |
| Persistence/migration of attempt records | A-005/A-007 |

## 12. Revision record

### Version 0.1 — Initial exercise and assessment draft — 14 November 2026

Defines supported exercise categories and response contracts, deterministic checking, outcome vocabulary, partial credit, feedback, hints, retries, attempt evidence, progress boundaries and verification handoffs. Proposed retry behavior and expression grammar require review.

**End of A-006 v0.1**
