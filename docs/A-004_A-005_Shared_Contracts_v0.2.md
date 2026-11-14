# A-004 / A-005 Shared Contracts

**Project:** Probability Revision Studio  
**Document ID:** A-004/A-005-SC  
**Version:** 0.2  
**Date:** 14 November 2026  
**Status:** Joint draft for design review  
**Applies to:** A-004 Deterministic Operations Specification; A-005 Content and Data Model Specification

---

## 1. Purpose

Agree on the small set of cross-document names and ownership boundaries before A-004 and A-005 expand. These are proposed shared contracts; once approved, incorporate them into A-004 and A-005 and retain one authoritative definition for each contract.

## 2. Version triple and ownership

Every saved calculation/result record refers to three separate versions:

| Field | Owner | What it versions | Bump when |
|---|---|---|---|
| `calculation_engine_version` | A-004 | Deterministic operations, validation semantics, numeric policy and output interpretation | Operation behavior, preconditions, status semantics, or numeric policy changes in a way that can change results/meaning |
| `simulation_algorithm_version` | A-004 | PRNG, seed derivation, sampling order and aggregation behavior | Any change can alter a seeded sample sequence or empirical result |
| `content_version` | A-005 | The version of calculation-relevant lab/model content dependencies for this result | A dependent model definition, parameter interpretation, lab input mapping, or calculation-linked content change that can alter result meaning |

Store all three fields independently; do not combine them into one opaque version. `content_version` is scoped to the result's dependency set, not every copy or editorial change in the application. A-005 also maintains a separate global `content_release_version` for reviewed content releases; it is not part of the compatibility triple and does not by itself trigger recalculation. A message typo or unrelated explanation edit therefore does not notify every saved lab. A saved theoretical output is associated with calculation-engine and relevant content versions. A saved simulation also records simulation-algorithm version. A-007 chooses version string/storage mechanics, not version ownership or bump semantics.

## 3. Result status vocabulary

A-004 owns machine-readable calculation status. A-005 stores the status and optional error code; A-002 owns the learner-facing labels and interaction behavior.

| `result_status` token | Meaning |
|---|---|
| `valid` | A supported calculation completed with a mathematically valid result. A probability result of zero is `valid` with value 0. |
| `invalid_configuration` | Inputs violate a model, probability, support or parameter constraint. |
| `undefined` | Inputs describe a valid configuration but the requested quantity is mathematically undefined, such as conditioning on a zero-probability event. |
| `unsupported` | The requested operation/model/region is outside the specified calculation capability. |
| `calculation_error` | An unexpected operation failure occurred; not a learner input judgment. |
| `cancelled` | The learner cancelled a running operation before a complete result was produced. |

Use a separate `precision` field with `exact`, `approximate`, or `empirical`. Precision is orthogonal to result status: an approximate calculation may be valid or undefined; an exact result may equal zero. Empirical simulation output is not a theoretical probability result. A-004 maps error codes to result statuses; A-005 maps codes to message keys; A-002 owns learner-facing labels.

## 4. Lab state tuple and output records

- A-003 defines the learner-editable model and resume fields for each lab.
- A-004 defines the canonical meaning/shape of model settings, calculation inputs/outputs, statuses, approximation metadata, and reproducible simulation records.
- A-005 defines persisted content references and learner-state records that store the A-003 tuple and A-004 output record, including all three version fields.
- A-007 defines persistence mechanisms. A saved output is not silently replaced when a version changes; A-002's explicit Recalculate/Rerun behavior applies.

Required shared output metadata: stable calculation ID; result status; precision; optional error code; exact value and/or numeric estimate; approximation metadata when relevant; calculation-engine version; dependency-scoped content version. Simulation record additionally includes algorithm version, seed, model settings, run count and empirical summary.

### 4.1 Calculation ID grammar

Use stable IDs of the form `CAL-{FAMILY}-{NNN}`, where `{FAMILY}` is an uppercase operation family and `{NNN}` is a zero-padded sequence allocated once within that family (for example, `CAL-EVENT-001`, `CAL-COND-001`, `CAL-DIST-004`). IDs are opaque after assignment; never reuse retired IDs or infer semantics from their sequence. A-004 owns the registry; A-005 formula entries reference these exact IDs.

## 5. Formula authority and content links

A-004 is the sole authority for executable calculation definitions, preconditions, numerical methods and validation. A-005 formula entries may contain learner-facing notation, definitions, assumptions, interpretation and source attribution, but they reference one or more stable A-004 `calculation_id` values rather than becoming a competing calculation specification.

**Consistency check:** for every approved formula entry linked to a calculation ID, review that the displayed expression, named assumptions, domain/support and explanation agree with the A-004 operation contract. A mismatch blocks content approval until reconciled. Supplementary derivations remain labeled and do not change the operation contract without an A-004 revision.

## 6. Error codes and message keys

A-004 owns stable error-code tokens and the condition that emits each code. A-005 owns message keys, learner-facing text, repair action labels and localized variants. A-002 owns interaction behavior (where errors appear and how stale results are treated). Error codes are never used as learner-facing prose.

Initial code families to define in A-004: `E-PROB-*`, `E-SUPPORT-*`, `E-EVENT-*`, `E-PARAM-*`, `E-COND-*`, `E-UNSUPPORTED-*`, `E-NUMERIC-*`, and `E-SIM-*`. Version mismatch is record compatibility metadata, not an error code. A-005 must provide a message key for every exposed code. Error codes remain stable; changed semantics require a new code or a versioned deprecation.

## 7. Seed representation and reproducibility

- A-004 owns the PRNG, seed interpretation, per-lab derivation, run indexing and reproducibility guarantee.
- A-005 stores the seed losslessly as a string plus algorithm version and run metadata; it must not coerce a seed through a lossy numeric representation.
- A-003's proposed control behavior is: each Run uses a fresh generated seed by default; a learner-entered seed overrides the next run; Replay last run reuses the exact prior seed, committed settings and run count.
- Reproducibility contract: same lab/model settings, run count, seed and simulation-algorithm version produce the same sample sequence and empirical summaries within the supported runtime contract. A-004 must state any platform/version limitation explicitly.

Seed encoding, PRNG selection and cross-platform guarantee remain open until A-004 review.

## 8. Status and approval

### Version 0.2 — Resolved shared compatibility and result contracts — 14 November 2026

Scopes content compatibility to calculation dependencies, separates result status from precision, and defines stable calculation-ID grammar.

The ownership boundaries and names above are adopted by A-004 v0.2 and A-005 v0.2. An approved change to a shared contract updates both specifications and this record.

**End of shared contracts v0.2**
