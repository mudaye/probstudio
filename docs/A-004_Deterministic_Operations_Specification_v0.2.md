# A-004 — Deterministic Operations Specification

**Project:** Probability Revision Studio  
**Document ID:** A-004  
**Version:** 0.2  
**Date:** 14 November 2026  
**Status:** Draft for design review  
**Related documents:** A-002 v0.4; A-003 v0.4; A-004/A-005 Shared Contracts v0.2; A-005 v0.2; A-006 v0.1; A-007 v0.1; A-008 v0.1

---

## 1. Purpose, scope and boundaries

Define deterministic probability calculations, validation, repair eligibility, numerical behavior, simulation and test evidence used by the guided labs and answer checking.

- A-002 owns learner-facing interaction and result labels.
- A-003 owns learner-adjustable lab controls and visible lab behavior.
- A-004 is authoritative for calculation IDs, preconditions, validation, results, numeric approximations, seed handling and simulation behavior.
- A-005 owns authored formula entries, message text and stored records; formula entries reference A-004 calculation IDs.
- A-006 owns exercise formats, grading policy and answer equivalence use; it calls A-004 operations for mathematical results.
- A-007 owns technology and implementation architecture.

Use the shared ownership, version, status, error-code, formula and seed contracts in [A-004/A-005 Shared Contracts](A-004_A-005_Shared_Contracts_v0.2.md).

## 2. Numeric foundations

### 2.1 Exactness and approximation

**Proposed policy:**

- Preserve learner-entered decimal strings and parse finite decimal/rational inputs without first converting them to binary floating point.
- Use exact rational arithmetic for finite outcome/event masses and sums, finite conditional probability ratios, finite discrete induced distributions, and finite PMF/CDF accumulation whenever the inputs permit exact representation.
- Use numerically stable floating-point methods for transcendental values, infinite-support distributions, continuous CDF/PDF evaluations, numerical integration, and simulation summaries.
- Every result has an independent precision value (`exact`, `approximate`, or `empirical`). An approximate result includes method identifier and precision/error metadata where the method provides it.
- Display rounding never changes stored values or validation results.
- Probability normalization for learner input is never implicit. The explicit repair path follows §4.

### 2.2 Tolerance policy

Do not use one tolerance for every operation. Exact constraints (such as a finite rational mass sum) are checked exactly when inputs support exact evaluation. Numerical methods define operation-specific absolute/relative error targets and convergence/failure statuses. The method, tolerances and display precision are versioned under `calculation_engine_version`. Exact tolerance values and the implementation numeric type remain open for review before A-007.

## 3. Validation and result statuses

### 3.1 Shared validation predicates

Define reusable predicates for:

- Probability in [0,1].
- Nonnegative mass/density values.
- Finite support and distinct support points where required.
- Valid normalization over finite support or integral/sum criteria for a distribution.
- Event membership as a subset of the defined sample space.
- Complete mapping from each outcome to one finite random-variable value.
- Parameter domains for each distribution and transformation.
- Positive conditioning mass/probability where a conditional ratio is requested.
- Valid bounds, endpoint conventions and supported region shape.
- Finite numeric values; reject NaN/infinity as learner inputs except where a documented mathematical limit is used internally.

Each predicate returns a structured result, not only a boolean: status, stable error code when applicable, field/path, and optional relevant constraint values.

### 3.2 Status model

Use shared `result_status` tokens: `valid`, `invalid_configuration`, `undefined`, `unsupported`, `calculation_error`, and `cancelled`. Record precision separately as `exact`, `approximate`, or `empirical`. A zero probability is `valid` with value 0 and precision exact or approximate as applicable. Zero conditioning probability returns `undefined` with `E-COND-ZERO`. Invalid user input returns `invalid_configuration`; system failures return `calculation_error` and preserve the last valid result under A-002.

### 3.3 Initial error-code registry

| Code | Condition | Status |
|---|---|---|
| E-PROB-RANGE | Probability/mass outside [0,1] | invalid_configuration |
| E-PROB-SUM | Finite masses fail normalization | invalid_configuration |
| E-NONFINITE-INPUT | Learner supplies NaN or infinity | invalid_configuration |
| E-BOUNDS-ORDER | Lower bound exceeds upper bound | invalid_configuration |
| E-BOUNDARY-CONVENTION | Boundary convention is undefined for requested operation | unsupported |
| E-SUPPORT-DUPLICATE | Duplicate or invalid support value | invalid_configuration |
| E-EVENT-OUTSIDE-SPACE | Event contains an outcome outside Ω | invalid_configuration |
| E-MAPPING-INCOMPLETE | Random-variable map is missing an outcome or gives a non-finite value | invalid_configuration |
| E-PARAM-DOMAIN | Distribution/transformation parameter outside its domain | invalid_configuration |
| E-RUN-COUNT | Run count is outside supported positive-integer range | invalid_configuration |
| E-SEED-FORMAT | Seed cannot be parsed losslessly | invalid_configuration |
| E-COND-ZERO | Requested conditioning event has zero probability | undefined |
| E-UNSUPPORTED-MODEL | Operation/model combination not specified | unsupported |
| E-UNSUPPORTED-REGION | Region shape is not supported by the selected operation | unsupported |
| E-UNSUPPORTED-SCALE | Valid parameter exceeds the supported computation ceiling | unsupported |
| E-NUMERIC-CONVERGENCE | Numerical method cannot produce a finite result within declared maximum error | calculation_error |
| E-REPAIR-INELIGIBLE | Repair requested for negative, non-finite or all-zero masses | invalid_configuration |
| E-SIM-CANCELLED | Learner cancels an in-progress simulation | cancelled |

A-005 supplies message keys and learner-facing messages for exposed codes. Version mismatch is compatibility metadata, not a calculation error. A method that misses its preferred target may still return `valid` with `precision=approximate` only if it remains finite, within the operation's declared maximum error, and reports achieved error; otherwise use `calculation_error`/`E-NUMERIC-CONVERGENCE`. A-008 verifies these mappings.

## 4. Repair rules

Normalization repair is allowed only when every entered mass is finite and nonnegative and their total is positive. The repair previews each candidate mass and explains division by the positive total. Negative, non-finite or all-zero input is ineligible and returns E-REPAIR-INELIGIBLE. The learner must confirm Apply repair; original input remains recoverable until confirmation. Use exact rational normalization where possible; otherwise use a documented deterministic numeric method and ensure the normalized result satisfies the operation-specific validation target. Repair never happens merely on blur, commit or error display.

When exact rationals are available, show repaired values exactly (for example `1/3`), with an optional rounded decimal clearly marked and exact value available in details. Editable fields retain exact normalized values; rounded display strings are never fed back as inputs. Other repair operations require explicit user action, preview, confirmation, recovery behavior and deterministic criteria.

## 5. Calculation specifications

All operations have stable calculation IDs, typed inputs, output shape, preconditions, status/error mapping and golden vectors. Formula details are normative here. A-005 formula content references these IDs.

### 5.1 Approved initial lab calculation inventory: PL-01–PL-06

| Calculation ID | Inputs → outputs | Preconditions/status mapping |
|---|---|---|
| CAL-EVENT-001 | Ω, masses, A → P(A) | Valid finite model and A⊆Ω; zero is valid. |
| CAL-EVENT-002 | Ω, A/B, operation → result subset and probability | Events are subsets; complement relative to Ω. |
| CAL-COND-001 | P(A∩B), P(B) → P(A given B) | P(B)>0; else undefined/E-COND-ZERO. |
| CAL-COND-002 | Partition and likelihoods → total probability/posterior | Partition is disjoint/exhaustive; posterior denominator positive. |
| CAL-INDEP-001 | A, B → pairwise independence | Compare P(A∩B) with P(A)P(B). |
| CAL-INDEP-002 | Event family → pairwise/mutual results | Report each notion separately; mutual checks every nonempty subfamily. |
| CAL-INDEP-003 | A, B given C → conditional independence | P(C)>0; compare conditional joint with product of conditional marginals. |
| CAL-RV-001 | Finite Ω, masses, mapping X → image support and induced PMF | Complete map; aggregate equal mapped values. |
| CAL-PMF-001 | Support/masses → PMF validity and point masses | Finite distinct support; normalized nonnegative masses. |
| CAL-CDF-001 | Support/masses, x → F(x) | Right-continuous sum over support ≤x. |
| CAL-CDF-002 | Support/masses, interval/boundary flags → probability | Ordered bounds and explicit endpoint convention; zero is valid. |
| CAL-DIST-001 | Bernoulli p,k → PMF/CDF | 0≤p≤1. |
| CAL-DIST-002 | Binomial n,p,k → PMF/CDF | n integer ≥0 and 0≤p≤1; ceiling policy §5.2. |
| CAL-DIST-003 | Poisson λ,k → PMF/CDF | λ≥0; ceiling/numeric policy §5.2. |
| CAL-DIST-004 | Geometric p,k → PMF/CDF | 0<p≤1; support starts at 1. |

Every entry has typed inputs, canonical outputs, preconditions, status/error mapping, precision/error metadata and golden/boundary vectors. A-005 formulas reference these IDs. A-006 owns answer-expression grammar; A-004 supplies deterministic exact/approximate comparison primitives.

#### Normative calculation rules and status mapping

- **CAL-EVENT-001/002:** `P(A)=Σ(ω∈A)p(ω)`. Union, intersection and difference use the corresponding set operations; complement is `Ω\A`. Return `invalid_configuration` for malformed probability assignments or event members; otherwise return `valid`, including when the result is zero.
- **CAL-COND-001/002:** `P(A|B)=P(A∩B)/P(B)` when `P(B)>0`; a zero denominator is `undefined`/`E-COND-ZERO`. For a finite partition `{Bᵢ}`, `P(A)=ΣᵢP(A|Bᵢ)P(Bᵢ)` and `P(Bⱼ|A)=P(A|Bⱼ)P(Bⱼ)/P(A)` when `P(A)>0`.
- **CAL-INDEP-001/002/003:** Pairwise independence iff `P(A∩B)=P(A)P(B)`. Mutual independence requires `P(∩ᵢAᵢ)=∏ᵢP(Aᵢ)` for every subfamily of size at least two. Conditional independence given C iff `P(A∩B|C)=P(A|C)P(B|C)`; `P(C)=0` is undefined. Return valid boolean/diagnostic outputs for defined comparisons.
- **CAL-RV-001:** For each image value x, `P(X=x)=Σ_{ω:X(ω)=x}p(ω)`. Missing/non-finite mappings return invalid/E-MAPPING-INCOMPLETE.
- **CAL-PMF-001/CDF-001/002:** PMF requires nonnegative masses summing to one. `F(x)=Σ_{t≤x}p(t)`. Interval probability sums support masses satisfying the selected lower/upper endpoint flags; reversed bounds return invalid/E-BOUNDS-ORDER, while a valid empty interval returns valid zero.
- **CAL-DIST-001–004:** Bernoulli: `p^k(1−p)^(1−k)` for k∈{0,1}; Binomial: `C(n,k)p^k(1−p)^(n−k)` for k=0,…,n; Poisson: `e^(−λ)λ^k/k!` for k≥0; Geometric: `(1−p)^(k−1)p` for k≥1. Out-of-support point queries return valid zero. Domain violations are invalid; values beyond an approved engine ceiling are unsupported. Exactness/approximation follows §2 and §5.2.

For all calculations, malformed inputs map to `invalid_configuration` with the most specific applicable E-code; mathematically undefined requests map to `undefined`; unsupported operations/scale map to `unsupported`; unexpected failures or unmet declared maximum numerical error map to `calculation_error`; cancelled simulations map to `cancelled`. Precision is recorded independently. The vectors below are required checks against these rules.

#### Golden vectors required

- PL-01 two fair tosses, A={HH,HT}, B={HH,TH}: P(A)=1/2, P(B)=1/2, P(A∩B)=1/4, P(A∪B)=3/4.
- PL-02 default test inputs (prevalence 0.01, sensitivity 0.99, specificity 0.95): P(positive)=0.0594 and P(condition | positive)=1/6 exactly under rational input representation.
- PL-03 default A/B/C events: each pair is independent; the triple is not mutually independent. Conditional vector: Ω={HH,HT,TH,TT}, A={HH,HT}, B={HH,TH}, C={HH,TT}; P(A∩B|C)=1/2 while P(A|C)P(B|C)=1/4, so A and B are not conditionally independent given C.
- PL-04 three fair toss head count: support 0,1,2,3 with masses 1/8, 3/8, 3/8, 1/8.
- PL-05 default PMF 0.25, 0.50, 0.25: CDF values at support are 0.25, 0.75, 1.
- PL-05 endpoint vector on support {0,1,2}, masses (0.25,0.50,0.25): P([0,1])=0.75; P((0,1])=0.50; P([0,1))=0.25; P((0,1))=0, with zero returned valid.
- PL-06 Bernoulli(p=0.5): masses (0.5,0.5); Geometric(p=0.5): support begins at 1 and P(X=1)=0.5; Poisson probabilities are marked approximate when represented numerically.
- Proposed PL-09 vectors, pending product approval and verification: density 2 on 0<x<y<1 gives P(Y>X+c)=(1−c)^2 for 0≤c≤1 (c=0.5 gives 0.25; c≤0 gives 1; c≥1 gives 0). The equal-mass discrete 2×2 default is independent; the triangular continuous model is dependent because its support is not a product set and product marginals are positive where the joint density is zero.

### 5.2 Parameter and infinite-support policy

**Proposed ceilings pending review:** Binomial n≤1000 uses exact rational evaluation when inputs permit; 1001≤n≤10000 uses a stable approximate method and records precision/error metadata; larger n is unsupported with E-UNSUPPORTED-SCALE. Poisson supports 0≤λ≤1000 with stable approximate PMF/CDF methods and achieved error metadata; larger λ is unsupported with E-UNSUPPORTED-SCALE. Reconcile these engine ceilings with A-003 ranges before implementation.

Poisson and Geometric distributions have infinite support. A-004 shall define a deterministic truncation/display policy that chooses a finite displayed range from an explicit omitted-tail target, reports the omitted tail mass/bound, and never implies the truncated bars sum to the complete distribution unless they do. The target, quantile search method, maximum display support and failure behavior remain open for review. Every truncated display reports omitted tail mass or a conservative bound. Analytical PMF/CDF queries at requested points remain distinct from display truncation.

### 5.3 Proposed lab annex: PL-07–PL-09

Do not activate these calculation IDs until product approval of the proposed labs. Once approved, add operation specifications for:

- Continuous Uniform, Exponential and Gaussian/Normal PDF/CDF/interval evaluations, including a documented normal-CDF numerical method and error target.
- Supported affine and reviewed nonlinear transformations, expectation, variance, and Markov/Chebyshev/Jensen preconditions.
- Discrete and continuous pair models, joint/marginal outputs, rectangular-region probabilities, the authored Part 3 boundary event Y>X+c, and joint-versus-product independence comparison. Arbitrary learner-drawn regions, mixed conditioning and higher-dimensional vectors remain unsupported unless separately specified.

## 6. Simulation

- Use a named/versioned PRNG and a lossless seed representation. Seed encoding and algorithm choice remain open. A fresh generated seed is the sole permitted nondeterministic input: obtain it from platform entropy and record it before sampling; subsequent sampling is deterministic.
- Record a per-lab `run_seed`; do not rely on unrecorded ambient randomness.
- A-003 proposes a fresh seed for each Run, learner seed override for the next run, and Replay last run with the same settings/seed/run count. Preserve this policy unless changed jointly in A-002/A-003/A-004.
- PL-01–PL-06 use integer-only sampling from rational masses and reproduce identical sequences across supported platforms for identical settings/count/seed/version. Continuous PL-07–PL-09 require same-runtime/version reproducibility; cross-platform bitwise reproducibility is best-effort until deterministic transcendental routines are selected.
- Sampling method/order is fixed within an algorithm version. A change that affects seeded outputs bumps `simulation_algorithm_version`.
- Run-count minimum/maximum, ceilings, runtime budgets, summary statistics, cancellation and error behavior are open. Default choices in A-003 are suggestions, not limits.
- Store empirical summaries with model settings, seed, run count, algorithm version and completion status. A cancelled run is not reported as a completed result.

## 7. Answer-equivalence primitives

Provide deterministic primitives for exact rational comparison and approximate numeric comparison with operation/answer-specific tolerance metadata. A-006 owns answer-expression grammar, selects comparison primitives for each answer format and defines partial credit. A-004 does not decide grading. Displayed learner input is never rewritten by comparison.

## 8. Verification and traceability

Required verification categories:

- Golden vectors in §5 and vectors for every operation/error condition.
- Property checks: probability bounds, normalization, valid marginals, CDF monotonicity/right-continuity where applicable, and event operation consistency.
- Reproducibility checks: same seed/settings/version gives identical sample sequence and empirical outputs; changed algorithm version is identifiable.
- Boundary checks: zero conditioning mass, parameter endpoints, support endpoints, invalid mass repair eligibility, numerical convergence and infinite-tail truncation.
- Map each calculation ID and test vector to PLxx acceptance criteria, INT-* requirements and A-008 verification criteria.

| Requirement ID | Requirement | Traceability |
|---|---|---|
| DET-INPUT-01 | Parse finite values losslessly where possible; reject non-finite learner inputs with stable errors. | LAB-COMMON-INPUT-01; INT-MATH-01; A-008 numeric validation |
| DET-STATUS-01 | Emit shared result-status tokens and independent precision metadata. | LAB-COMMON-ACCESS-01; INT-LAB-01; A-008 status checks |
| DET-REPAIR-01 | Repairs are eligible-only, explicit, previewed and recoverable. | LAB-COMMON-INPUT-01; INT-MATH-01; PLxx-AC; A-008 repair checks |
| DET-CALC-01 | Every supported operation has a stable CAL ID, preconditions, outputs and vectors. | PLxx-AC; INT-LAB-01; A-008 calculation registry |
| DET-SIM-01 | Record generated seed before sampling; guarantee follows the tiered §6 contract. | LAB-COMMON-SIM-01; INT-LAB-01; A-008 seeded-run checks |
| DET-COMPARE-01 | Comparison is deterministic; answer grammar remains A-006-owned. | INT-EXERCISE-01; A-008 grading integration |

Test harness/library selection remains open for A-007/A-008.

## 9. Open decisions and handoffs

| Topic | Next step |
|---|---|
| Exact arithmetic/numeric library and tolerance values | Review policy; implementation choice in A-007 |
| PRNG, seed encoding, run-count limits and platform reproducibility | Approve contract and specify algorithms here |
| Poisson/Geometric displayed-tail target and maximum support | Decide and define truncation behavior |
| PL-07–PL-09 operation annex | Activate only after product approval |
| Calculation IDs, vectors and exposed error messages | Align with A-005 and A-006 |

## 10. Revision record

### Version 0.1 — Initial deterministic operations draft — 14 November 2026

Defines the calculation ownership boundary, proposed numeric/status/repair contracts, initial PL-01–PL-06 operation inventory, proposed later-lab annex, simulation requirements and verification outline.

### Version 0.2 — Expanded calculation and traceability contract — 14 November 2026

Adopts shared status/precision and version contracts; adds concrete calculation IDs and vectors, repair display/eligibility rules, input errors, proposed parameter ceilings, tiered simulation reproducibility, A-006 grammar ownership and DET traceability.

**End of A-004 v0.2**
