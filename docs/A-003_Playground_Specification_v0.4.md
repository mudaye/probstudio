# A-003 — Probability Playground Specification

**Project:** Probability Revision Studio  
**Document ID:** A-003  
**Version:** 0.4  
**Date:** 14 November 2026  
**Status:** Draft for design review  
**Parent document:** PRS-PAS-001 — Product & Architecture Specification  
**Related documents:** A-001 v0.4; A-002 v0.4; A-004 v0.2; A-005 v0.2; A-004/A-005 Shared Contracts v0.2

---

## 1. Purpose and scope

Specify the guided Probability Playground laboratories: their learning questions, learner-adjustable controls, defaults, outputs, comparison/reset/resume behavior, cross-links and interaction-level acceptance criteria. This document describes what learners can change and observe. Calculation definitions, algorithms, tolerances, probability validation details and random-number generation belong in A-004 and are referenced here rather than restated.

The Custom Probability Experiment Builder is out of scope for A-003. It remains separate and must not be a dependency for any guided lab.

### 1.1 Decision labels

- **Approved:** established product direction, including canonical IDs PL-01–PL-06.
- **Proposed:** lab interaction or extension requiring review.
- **Open:** unresolved product or mathematical authoring decision.
- **Deferred to A-004:** deterministic calculation, validation, numerical method or simulation detail.

### 1.2 Identifier reconciliation

The governing Product & Architecture Specification and current A-001 use **PL-01 through PL-06**. A search of the current project documents found no active LAB-01–LAB-06 identifier set requiring a conversion. A-003 uses PL identifiers consistently; no LAB aliases are introduced. PL-07–PL-09 below are provisional proposal IDs, not approved additions.

## 2. Shared lab interaction requirements

All guided labs use A-002's Orient → Set up → Explore → Explain → Compare → Simulate → Reset → Cross-link interaction cycle where relevant.

### 2.1 Shared values and validation

**Requirement ID:** LAB-COMMON-INPUT-01

- Each lab opens in the default state shown in its specification. The default must be mathematically valid; this is an explicit acceptance criterion.
- Show editable values with labels, units/domains where applicable, and plain-language constraints. An edit is committed per INT-MATH-01 in A-002: Apply when provided; otherwise Enter or blur for a single-value field; release for sliders/drags. Multi-value probability tables use an explicit Apply action so a partially edited table is not calculated. A-004 defines authoritative validation and computation.
- On invalid edits, keep the last valid output visible and mark it **Stale result — based on the last valid settings**. Do not calculate from invalid or incomplete inputs. Clear this label when valid settings are committed and results are refreshed.
- Keep theoretical/exact outputs visually and semantically distinct from empirical/simulated outputs. Do not imply a simulation is the exact probability.
- A simulation run is an explicit learner action. Preserve seed, run count, algorithm version and model settings so the same run can be reproduced; the required deterministic mechanism is specified in A-004.
- If a probability table contains only nonnegative masses with a positive total other than one, offer an explicit **Repair → Normalize masses** action. Preview the candidate normalized values and explain the operation; only **Apply repair** replaces the active values. Preserve original values until confirmed. Do not offer this repair for negative masses or an all-zero total. A-004 defines exact admissibility, rounding and validation behavior.

### 2.2 Comparison, reset and resume

**Requirement ID:** LAB-COMMON-STATE-01

- Each lab has one saved comparison snapshot in addition to the active configuration. The learner enters or edits its name in a labeled **Snapshot name** field before saving. Compare shows the active configuration beside the saved snapshot. Save creates it; Save again requires confirmation before replacing it. Restore loads the saved configuration as active and confirms if that would replace unsaved active edits. Delete confirms before removal. A snapshot stores its name, model settings and theoretical outputs; empirical output is included only when the learner chooses “Include last simulation,” in which case seed, run count and algorithm version are stored too.
- Reset restores the documented default. If reset will discard non-default settings or the saved comparison snapshot, confirm and name the data to be cleared. Cancel leaves the state unchanged.
- Resume state uses a common envelope plus the lab-specific payload listed below. The envelope includes lab ID, payload-schema version, calculation-engine version, calculation-relevant content version, simulation-algorithm version where applicable, and last-updated time. Resume restores saved outputs without automatically recalculating or rerunning. If a relevant version differs, retain the saved output with a version notice and offer Recalculate or Replay/Rerun as appropriate.
- Cross-links to concepts/exercises are contextual discovery links. Returning to the lab restores its state. Associations do not gate access.

### 2.3 Accessibility and live updates

**Requirement ID:** LAB-COMMON-ACCESS-01

- Every chart has an equivalent labeled table or text summary containing the same relevant values.
- Keyboard users can edit every control, activate all actions and inspect outputs in a logical order.
- After a valid edit is committed, announce: **“Results updated. [Primary result summary].”** After an invalid edit, announce: **“[Control name] is invalid. Showing results from the last valid settings.”** After simulation completion, announce: **“Simulation complete: [run count] trials. [Primary empirical result summary].”**
- Also announce: **“Settings reset to defaults.”** after confirmed reset; **“Comparison snapshot saved: [name].”** after save; **“Result undefined: [reason].”** for a mathematically undefined request; and **“Simulation is outdated because model settings changed.”** when settings invalidate the prior empirical result.
- Debounce nonessential live-result announcements by 300 ms after the learner stops editing; validation errors appear on commit or blur and are not delayed by this debounce. Do not announce every simulated draw or every animation frame.
- Accessible math rendering, focus behavior and shared accessibility criteria follow INT-ACCESS-01 in A-002.

### 2.4 Shared simulation controls

**Requirement ID:** LAB-COMMON-SIM-01

Where a lab supports simulation, offer a run-count control, an explicit **Run** action, and a seed field or equivalent reproducibility control. Each Run generates a new seed by default and displays the seed used. A learner-entered seed overrides the next Run. **Replay last run** reuses the exact prior seed, settings and run count. Suggested run-count choices are 100, 1,000 and 10,000; the permitted range and resource ceiling are deferred to A-004. Keep the last simulation result visible and label it with the settings, seed, run count and algorithm version that generated it. If model settings change after a run, label the empirical result **Outdated simulation** until rerun.

### 2.5 Module-to-lab crosswalk

**Requirement ID:** LAB-CROSSWALK-01

Associations are many-to-many content links, not a hierarchy or access rule. Part 1 links preserve the existing A-001 crosswalk. Part 2/3 links below are proposals, grounded in the module inventories and transcript chapter scope; they require content review and do not make proposed labs approved.

| Module | Laboratory association | Status / rationale |
|---|---|---|
| M01 Probability Foundations | PL-01 | Existing crosswalk |
| M02 Conditional Probability; M03 Total Probability and Bayes' Rule | PL-02 | Existing crosswalk |
| M04 Event Independence | PL-03 | Existing crosswalk |
| M05 Random Variables and Induced Probability Measures | PL-04 | Existing crosswalk |
| M06 Cumulative Distribution Functions; M07 Discrete Random Variables and PMFs | PL-05 | Existing crosswalk |
| M08 Discrete Distributions | PL-06 | Existing crosswalk |
| M09 Continuous Random Variables, PDFs, and Continuous CDFs | proposed PL-07 | PL-05 remains discrete; PL-07 handles continuous PDF/CDF interactions |
| M10 Common Continuous Distributions | proposed PL-07 | Continuous models |
| M11 Functions and Transformations of One Random Variable; M12 Expectation and Its Properties; M13 Variance and Moment Relationships; M14 Probability Inequalities | proposed PL-08 | Transformations and moments; inequalities can be explored as supported bound views |
| M15 Simulation and Empirical Estimation | PL-06; proposed PL-07; proposed PL-08 | Cross-links to simulations by model type |
| M16 Joint Distribution Functions; M17 Joint PMFs and Joint PDFs; M18 Marginal Distributions and Joint–Marginal Relationships | proposed PL-09 | Joint and marginal views |
| M19 Conditional Distributions and Bayes' Rule | No lab association proposed | Concept Atlas and Practice Gym cover until a distinct lab need is approved |
| M20 Mixture Models and Communication-System Example | No lab association proposed | Source-derived concept/practice content; mixed conditioning is outside PL-02/PL-09 scope |
| M21 Independence and IID Sequences | proposed PL-09; PL-06 | PL-09 can compare pairwise joint/marginal independence; PL-06 covers discrete IID sampling |
| M22 Multiple Variables, Mixed Conditioning, and Transformations | No lab association proposed | Higher-dimensional/mixed scope is outside current guided-lab proposals |

### 2.6 Shared requirement IDs and acceptance criteria

| Requirement ID | Acceptance criteria |
|---|---|
| LAB-COMMON-INPUT-01 | A field commits according to A-002; intermediate keystrokes/drag states do not calculate; a probability table uses Apply; repair previews proposed values and changes them only after explicit Apply repair. |
| LAB-COMMON-STATE-01 | One named saved snapshot is available per lab; save, replace, restore and delete follow the confirmation rules; resume stores the common envelope and the specified lab payload. |
| LAB-COMMON-ACCESS-01 | Every plot has a labeled equivalent; updates, invalid input, simulation completion, reset, snapshot save, undefined results and outdated simulation are announced with the specified messages. |
| LAB-COMMON-SIM-01 | Run, learner seed override and Replay last run follow the stated policy; each result records the exact seed, settings, run count and algorithm version. |
| LAB-CROSSWALK-01 | Module/lab links are many-to-many discovery links, have a status, and never gate access. |
| LAB-CONTENT-01 | Any example/default not prescribed by the source is labeled “Illustrative setup”; source-derived examples link to a verified source reference. |

**LAB-CONTENT-AC-01:** A learner can distinguish an illustrative default from a source-derived example at the point of use. A source-derived example cannot be enabled before its source and mathematical review status is approved.

**PL06-AC-05:** When a displayed PMF is truncated, the UI shows the omitted tail mass or a documented bound beside the displayed range; the displayed bars are not presented as the full distribution.

## 3. Lab specifications

Parameter ranges/defaults below describe proposed learner-facing controls, not the calculation engine. “Valid domain” and normalization rules are enforced as defined in A-004. Where source material does not prescribe a default, the displayed default is a design choice for review and must be labeled as an illustrative setup.

### PL-01 — Event and Probability Builder

**Status:** Approved initial lab.  
**Linked concepts/modules:** Sample spaces, events, event operations, probability axioms; M01.  
**Source references:** Part 1, Chapters 1–2; the two-coin setup is an illustrative lab example.

**Content labeling:** The two-toss setup is an illustrative setup, not a quoted tutorial example.

**Learning question:** How do events relate to outcomes, and how do event operations and valid probability assignments affect event probabilities?

**Model and assumptions:** Finite sample space. Default Ω = {HH, HT, TH, TT}, with a fair independent two-coin example as the initial preset. Learners may edit outcome masses and define events as subsets. The independence/fairness preset assumptions are stated explicitly and may be changed.

| Control | Type / range | Default | Constraint text |
|---|---|---|---|
| Preset | Choice: two fair coin tosses / editable finite space | Two fair tosses | Preset supplies labeled outcomes; learner edits are validated. |
| Outcome probability | Numeric per outcome, [0,1] | 1/4 each | All masses must form a valid probability assignment; exact validation in A-004. |
| Event membership | Outcome selection for each named event | A={HH,HT}; B={HH,TH} | Each event must be a subset of Ω. |
| Left operand | Event selector | A | Must reference a defined event. |
| Operation | Choice: union, intersection, complement, difference | Intersection | Complement is relative to Ω. |
| Right operand | Event selector; disabled for unary complement | B | Must reference a defined event when required. |

**Recalculation:** Immediate after a valid committed edit; during invalid edits show last-valid outputs labeled Stale result.  
**Outputs:** Sample-space/event diagram, event membership table, selected event probability, operation result and relevant axiom check. Simulation is optional and not required for this lab.  
**Comparison:** Compare two event definitions or two valid probability assignments. Snapshot includes Ω, masses, event membership and theoretical outputs.  
**Reset:** Restore the two-coin fair default and initial A/B events; confirm if edited sample space or comparison snapshots would be lost.  
**Resume state payload:** Preset/sample space, outcome masses, event definitions, selected operation, left operand, right operand when applicable, last valid outputs and optional named saved comparison snapshot.  
**Cross-links:** M01 and related event concepts; PL-02 for conditional probability; linked exercises.  
**Accessibility update:** Announce selected operation and resulting event probability; provide an outcome/event membership table.  
**Acceptance:** PL01-AC-01 default is valid; PL01-AC-02 events cannot include non-outcomes; PL01-AC-03 invalid probability edits retain and label last valid result Stale result; PL01-AC-04 reset confirmation preserves state on cancel and restores defaults on confirm; PL01-AC-05 illustrative two-toss setup is labeled illustrative.

### PL-02 — Conditional Probability and Bayes Laboratory

**Status:** Approved initial lab.  
**Linked concepts/modules:** Conditional probability, partitions, total probability, Bayes' rule; M02–M03 only.  
**Source references:** Part 1, Chapters 3–4; Part 2, Chapter 11 diagnostic-testing example.

**Learning question:** How does conditioning change probabilities, and how can a learner reason from observed evidence back to its source?

**Model and assumptions:** Initial preset is a binary diagnostic test with disease status and positive/negative result. Default prevalence 0.01, sensitivity 0.99 and specificity 0.95 are illustrative, editable values. Explain the population and event definitions. PL-02 is limited to finite/discrete event conditioning and Bayes scenarios. It does not support continuous or mixed conditioning, conditional densities, or the Part 3 communication-system example.

| Control | Type / range | Default | Constraint text |
|---|---|---|---|
| Prevalence/prior | Probability [0,1] | 0.01 | Defines prior probability of the condition. |
| Sensitivity | Probability [0,1] | 0.99 | Conditional probability of a positive result given condition. |
| Specificity | Probability [0,1] | 0.95 | Conditional probability of a negative result given no condition. |
| Observed evidence | Choice: positive / negative | Positive | Selected evidence must have non-zero probability for a conditional posterior to be defined. |

**Recalculation:** Immediate after valid committed edits. If selected evidence has zero probability, show that the requested conditional result is undefined and retain unrelated valid prior/likelihood outputs; do not divide by zero.  
**Outputs:** Partition/tree or contingency table; prior and likelihood inputs; evidence probability; posterior; forward and reverse conditional comparisons. Calculation authority is A-004; authored explanations reference calculation IDs.  
**Comparison:** Compare up to two valid parameter sets or positive/negative evidence states.  
**Simulation:** Optional population simulation; show theoretical and empirical counts separately. Seed and run count follow §2.4/A-004.  
**Reset:** Restore illustrative diagnostic defaults; confirm loss of edited scenario and snapshots.  
**Resume state payload:** Scenario type, parameter values, selected evidence, outputs, optional named saved comparison snapshot, simulation seed/run count/results.  
**Cross-links:** M02–M03; source-derived diagnostic example; linked practice. M19/M20 are not linked to this lab in the current scope.  
**Accessibility update:** Provide an equivalent contingency table and announce posterior/evidence status.  
**Acceptance:** PL02-AC-01 default model is valid; PL02-AC-02 zero-probability evidence is clearly undefined, not a numeric answer; PL02-AC-03 every input is identified by its conditional meaning; PL02-AC-04 theoretical and simulated results remain distinguishable.

### PL-03 — Independence Laboratory

**Status:** Approved initial lab.  
**Linked concepts/modules:** Event independence, complements, pairwise/mutual and conditional independence; M04.  
**Source references:** Part 1, Chapter 5. Random-variable independence in Part 3 is not in PL-03's current event-focused scope; any lab link requires a separately approved extension.

**Learning question:** Which independence claims hold for the selected events or variables, and how can pairwise, mutual and conditional independence differ?

**Model and assumptions:** Offer authored finite-event presets and a learner-editable finite probability model. Proposed default is the four equally likely two-toss outcomes with A={first toss H}, B={second toss H}, and C={tosses equal}. This preset illustrates pairwise independence without mutual independence; label the construction and provide an explanation. Include separate authored presets for complements and conditional independence only after mathematical review.

| Control | Type / range | Default | Constraint text |
|---|---|---|---|
| Event preset | Choice of authored scenarios / editable finite model | Pairwise-but-not-mutual example | Preset definition and claim are content-reviewed. |
| Outcome masses | Numeric [0,1] per outcome | 1/4 each | Must form a valid finite probability assignment. |
| Event membership | Outcome subsets A, B, C | As described above | Each set must be a subset of Ω. |
| Test | Choice: pair, complement, mutual, conditional | Pairwise comparisons | Conditional test requires a valid conditioning event with positive probability. |
| Conditioning event | Event selector | C | Required for conditional tests; must be defined and have positive probability. |

**Recalculation:** Recompute valid selected tests after committed edits; mark last-valid outputs Stale result on invalid edits.  
**Outputs:** Side-by-side required joint and product probabilities, pass/fail for each selected test, and an explanation of which independence notion was checked.  
**Comparison:** Compare up to two event configurations; preserve memberships, masses and selected tests.  
**Simulation:** Optional repeated sampling of the configured finite experiment; theoretical test remains primary.  
**Reset:** Restore the authored pairwise-not-mutual example; confirm loss of learner edits/snapshots.  
**Resume state payload:** Preset, Ω/masses, event memberships, test mode, conditioning event, outputs, optional named saved comparison snapshot, and simulation seed/run count/results.  
**Cross-links:** M04; PL-01 event construction. Random-variable independence remains outside PL-03's event-focused scope.  
**Accessibility update:** Present a table for each tested intersection/product comparison; announce the exact independence claim being evaluated.  
**Acceptance:** PL03-AC-01 default passes every pairwise test and fails the total-independence test as intended; PL03-AC-02 conditional tests are unavailable when conditioning probability is zero; PL03-AC-03 results name the tested independence notion; PL03-AC-04 invalid edits show Stale result outputs.

### PL-04 — Random Variable Mapper

**Status:** Approved initial lab.  
**Linked concepts/modules:** Random variables as mappings and induced distributions; M05.  
**Source references:** Part 1, Chapter 6. Part 3 multiple-variable chapters are outside this lab's current scope.

**Learning question:** How does a numerical mapping on outcomes induce a distribution, and how can multiple outcomes map to one value?

**Model and assumptions:** Finite sample space. Initial example uses three independent fair coin tosses and maps each outcome to its number of heads. Keep independence/fairness assumptions visible and editable only through the experiment settings.

| Control | Type / range | Default | Constraint text |
|---|---|---|---|
| Experiment preset | Choice / finite outcome model | Three fair tosses | Probabilities must form a valid assignment. |
| Mapping value | Real-valued entry per outcome | Count of heads | Every outcome has exactly one finite numeric value. |
| Mapping preset | Choice: heads / tails / custom | Heads | Custom mappings may assign the same value to multiple outcomes. |

**Recalculation:** Update induced distribution after valid mapping edits; invalid/missing mappings retain last-valid outputs labeled Stale result.  
**Outputs:** Outcome-to-value mapping diagram/table, distinct image values and induced probability masses; optional side-by-side comparison of two variables on the same Ω.  
**Comparison:** Compare head-count and tail-count mappings without duplicating the experiment.  
**Simulation:** Optional sampling of outcomes with empirical distribution alongside induced exact distribution.  
**Reset:** Restore the three-toss head-count example; confirm loss of custom mapping/snapshots.  
**Resume state payload:** Experiment model, mapping values, selected mappings, exact outputs, optional named saved comparison snapshot and simulation seed/run count/results.  
**Cross-links:** M05, PL-05 and PL-06.  
**Accessibility update:** Provide one row per outcome with probability, mapped value and aggregation group.  
**Acceptance:** PL04-AC-01 default mapping is complete and valid; PL04-AC-02 equal mapped values aggregate their masses; PL04-AC-03 missing/non-finite mappings are rejected and last valid outputs marked Stale result.

### PL-05 — CDF and PMF Explorer

**Status:** Approved initial lab; discrete-only scope.  
**Linked concepts/modules:** CDF, discrete random variables and PMFs; M06–M07.  
**Source references:** Part 1, Chapters 7–8; Part 2, Chapters 2–3.

**Learning question:** How do point masses accumulate into a CDF, and how do support and endpoint choices affect interval probability?

**Model and assumptions:** PL-05 is exclusively a finite discrete distribution explorer. Proposed default support {0,1,2} with masses (0.25, 0.50, 0.25). Continuous PDF/CDF controls belong only in proposed PL-07; the concept pages may cross-link, but the interactive lab scopes remain distinct.

| Control | Type / range | Default | Constraint text |
|---|---|---|---|
| Support values | Finite list of distinct real values | 0, 1, 2 | Values must be finite and ordered for display. |
| Point masses | [0,1] per support value | 0.25, 0.50, 0.25 | Masses must form a valid probability assignment. |
| Interval bounds | Real values; endpoint inclusion selectable | Example bounds 0 and 1 | Bound order and endpoint convention are explicit. |
| View | PMF / CDF / both | Both | Both views describe the selected discrete distribution. |

**Recalculation:** Update CDF and interval result after valid mass/support edits; mark last-valid outputs Stale result for invalid masses.  
**Outputs:** PMF table/bar chart, staircase CDF, jump values, selected interval probability and endpoint convention.  
**Comparison:** Compare two valid mass assignments on shared support.  
**Simulation:** Optional sampling from discrete masses; show empirical counts separately.  
**Reset:** Restore default support/masses and view; confirm loss of edits/snapshots.  
**Resume state payload:** Support, masses, bounds, endpoint settings, view, outputs, optional named saved comparison snapshot, and simulation seed/run count/results.  
**Cross-links:** M06–M07; PL-04 and PL-06. Continuous CDF/PDF interactions are in proposed PL-07.  
**Accessibility update:** Table contains support, PMF mass and CDF value; announce interval and endpoint convention with result.  
**Acceptance:** PL05-AC-01 default masses are valid; PL05-AC-02 the lab exposes only discrete support/mass controls; PL05-AC-03 interval result reflects selected endpoint convention; PL05-AC-04 default CDF and PMF are internally consistent per A-004.

### PL-06 — Distribution Explorer

**Status:** Approved initial lab; remain focused on Part 1 discrete distributions.  
**Linked concepts/modules:** Bernoulli, Binomial, Poisson and Geometric distributions; M08, proposed M15.  
**Source references:** Part 1, Chapter 8; Part 2, Chapter 11 for empirical estimation methods.

**Learning question:** How do distribution parameters change a discrete model's probabilities, and how do repeated samples compare with its theoretical distribution?

**Model and assumptions:** Discrete distribution selector with Bernoulli, Binomial, Poisson and Geometric options. Geometric support follows the transcript convention (number of trials until first success, support starting at 1); authoring must retain this explicit convention.

| Distribution/control | Type / valid domain | Default | Constraint text |
|---|---|---|---|
| Distribution | Choice | Bernoulli | Switching distribution replaces only distribution-specific parameters. |
| Bernoulli p | Probability [0,1] | 0.5 | Success probability. |
| Binomial n, p | Integer n≥1; p∈[0,1] | n=10, p=0.5 | n is trial count; trials assumed independent with common p. |
| Poisson λ | Real λ≥0 | 3 | Rate/mean parameter as defined in the source content. |
| Geometric p | 0<p≤1 | 0.5 | Number of trials until first success; support starts at 1. |

**Recalculation:** Theoretical outputs update on valid parameter commit; invalid committed parameters retain last-valid outputs labeled Stale result.  
**Outputs:** Parameter/domain summary, PMF and CDF displays, selected point probability, normalization status, theoretical summary values and displayed tail-mass information for truncated infinite support.  
**Comparison:** Compare two distributions or parameter configurations where the display scale is meaningful; identify differences in support.  
**Simulation:** Core interaction: sample, choose run count/seed, compare empirical frequencies with theory. A-004 specifies PRNG, numerical behavior and limits.  
**Reset:** Restore Bernoulli(p=0.5); confirm if user has non-default settings or snapshots.  
**Resume state payload:** Distribution, parameters, selected output/plot range, optional named saved comparison snapshot, seed, run count and empirical results.  
**Cross-links:** M08, proposed M15; PL-04/PL-05.  
**Accessibility update:** PMF/CDF tables accompany plots; announce distribution, parameters and simulation completion.  
**Acceptance:** PL06-AC-01 each default parameter set is valid; PL06-AC-02 geometric support begins at 1; PL06-AC-03 invalid parameters retain Stale result theoretical outputs; PL06-AC-04 seeded run is reproducible under A-004; PL06-AC-05 truncated PMF displays include omitted-tail mass or a documented bound.

## 4. Proposed additional laboratories

The following address interaction needs not well served by extending discrete-only controls. They are proposals; approval is required before reserving their IDs as canonical.

### Proposed PL-07 — Continuous Distribution Explorer

**Recommendation:** Approve in principle as a Part 2 lab, with the ID provisional pending product review.  
**Linked modules:** M09–M10 and M15.  
**Source references:** Part 2, Chapters 2–4 and 11.

**Learning question:** How do continuous PDFs and CDFs describe probability, and how do distribution parameters affect shape and empirical samples?

**Model and assumptions:** Distribution selector: Uniform(a,b), Exponential(λ), Gaussian/Normal(μ,σ²), including standard normal as a constrained preset. Explain support and parameters. Start with Uniform(0,1), a valid default. Exact PDF/CDF calculations and supported parameter domains belong in A-004/content.

| Control | Type / range | Default | Constraint text |
|---|---|---|---|
| Distribution | Uniform / Exponential / Gaussian | Uniform | Switching mode reveals relevant parameters. |
| Uniform a,b | Real values with a<b | a=0, b=1 | Upper bound must exceed lower bound. |
| Exponential λ | Real λ>0 | λ=1 | Rate must be positive. |
| Gaussian μ,σ | Real μ; σ>0 | μ=0, σ=1 | Standard normal preset is μ=0, σ=1. |
| Inspection interval | Real lower/upper bounds and endpoint toggles | 0 to 1 | Selected interval is compared with support; endpoint equivalence is explained for continuous models. |

**Recalculation:** On valid committed parameter edits; last-valid outputs labeled Stale result during invalid edits.  
**Outputs:** PDF and CDF plots, support, selected interval probability, parameter summary; never display PDF height as point probability.  
**Comparison:** Compare two parameter settings/distributions with clearly labeled support and axes.  
**Simulation:** Sampled values/histogram and empirical estimates beside theoretical quantities; exact and empirical values labeled separately.  
**Reset:** Uniform(0,1); confirm loss of settings/snapshots.  
**Resume state payload:** Distribution, parameters, interval, plot range, outputs, optional named saved comparison snapshot, seed/run count and empirical results.  
**Cross-links:** M09, M10, M15. Concept pages may link to PL-05 for the discrete counterpart; interactive controls remain separate.  
**Accessibility update:** Provide tabular interval and distribution summary; use the shared announced text with distribution name and primary interval result.  
**Acceptance:** PL07-AC-01 all distribution defaults satisfy valid domains; PL07-AC-02 changing a parameter updates labeled PDF/CDF outputs; PL07-AC-03 UI distinguishes density height from probability; PL07-AC-04 resume reproduces seeded empirical output.

### Proposed PL-08 — Transformation, Expectation and Variance Lab

**Recommendation:** Approve in principle as a Part 2 lab; keep ID provisional pending product review.  
**Linked modules:** M11–M15.  
**Source references:** Part 2, Chapters 5–10; Chapter 11 for simulation comparison.

**Learning question:** How does transforming a random variable change its distribution and moments, and what can moment-based inequalities tell us about event probabilities?

**Model and assumptions:** Select a source distribution from supported discrete and continuous presets, then select a mapping. Start with a fair Bernoulli source and identity mapping. Provide affine mappings first; include a square mapping only after its non-monotone behavior and resulting distribution are mathematically reviewed. Mark unsupported transformations clearly.

| Control | Type / range | Default | Constraint text |
|---|---|---|---|
| Source model | Distribution preset | Bernoulli(0.5) | Must be a supported PL-06/PL-07 model. |
| Transformation | Identity / affine / reviewed nonlinear preset | Identity | Mapping domain must include source support. |
| Affine a,b | Real values | a=1, b=0 | A-004 defines any transform-specific preconditions. |
| Statistic | Expectation / variance | Expectation | Required moment/preconditions must be satisfied. |
| Inequality view | None / Markov / Chebyshev / Jensen | None | Display a bound only when its preconditions are satisfied. |
| Bound threshold | Positive real a; event form depends on selected inequality | a=1 | Markov uses X≥a; Chebyshev uses |X−μ|≥a. Exact preconditions belong to A-004. |
| Jensen convex function | Reviewed convex-function preset, independent of the selected transformation | Square function | Enabled only for Jensen; Jensen evaluates this separately selected convex function of the source variable. Show its domain and convexity assumptions. |

**Recalculation:** Update transformed distribution and supported statistics after valid changes. A result with unmet assumptions is labeled unavailable with the reason, not silently approximated.  
**Outputs:** Source/transformed distributions, supported expectation/variance, and the selected Markov/Chebyshev/Jensen bound view with preconditions. Jensen's function control is independent from the transformation control; changing the transformation does not silently change the Jensen expression. Formula and computation authority reside in A-004; curated explanations reference A-004 calculation IDs rather than restating operational formulae.
**Comparison:** Compare source and transformed variables/statistics for one configuration; snapshot source, mapping and selected statistic.  
**Simulation:** Optional empirical transformed samples and sample statistics beside theoretical values.  
**Reset:** Bernoulli(0.5), identity mapping and expectation view; confirm loss of edits/snapshots.  
**Resume state payload:** Source model/parameters, transformation, statistic, inequality view, bound threshold/event, Jensen convex function where selected, outputs, optional named saved comparison snapshot, seed/run count and empirical results.  
**Cross-links:** M11–M15, PL-06/PL-07, and PL-04 for mapping intuition.  
**Accessibility update:** Provide source-to-transformed value table for finite models; for continuous models provide a labeled summary/table of selected values and supported statistic results.  
**Acceptance:** PL08-AC-01 default is valid; PL08-AC-02 unsupported/invalid preconditions are visible and prevent unsupported result claims; PL08-AC-03 theoretical and simulated statistics are distinguished; PL08-AC-04 transformations preserve source/parameter context on resume.

### Proposed PL-09 — Joint Distribution and Marginals Lab

**Recommendation:** Approve in principle as a Part 3 lab; keep ID provisional pending product review.  
**Linked modules:** M16–M18; proposed M21 independence comparison.  
**Source references:** Part 3, Chapters 2–5 and 9.

**Learning question:** How does a joint distribution assign probability across pairs, and how are marginal distributions and rectangle/region probabilities obtained from it?

**Model and assumptions:** Provide discrete-pair and continuous-pair modes. Initial default is a discrete 2×2 joint mass table with four equal cell masses, a valid illustrative distribution. A continuous preset may use the source-derived Part 3 density 2 on 0<x<y<1 only after mathematical verification; do not treat a density plot as a probability surface without clear labeling. Mixed discrete/continuous conditioning and higher-dimensional random vectors are out of scope. Region controls support rectangles and an authored non-rectangular region preset from Part 3 Chapter 4 (Y>X+c, with c defaulting to 0.5); arbitrary learner-drawn regions remain out of scope.

| Control | Type / range | Default | Constraint text |
|---|---|---|---|
| Pair model | Discrete / continuous | Discrete | Each mode exposes its own valid model controls. |
| Discrete support | Finite X/Y value lists | {0,1} × {0,1} | Values are finite; duplicate support values are disallowed. |
| Joint cell masses | [0,1] per supported pair | 0.25 each | Joint masses form a valid normalized model. |
| Continuous preset | Authored density/support selector | Source-derived triangular support preset (pending verification) | Only reviewed valid densities are selectable. |
| Region type | Rectangle / authored boundary event | Rectangle | Only supported region types are selectable. |
| Rectangle bounds | X/Y lower and upper bounds | Full default support | Bounds must define a supported rectangular region; endpoint convention is explicit. |
| Boundary threshold c | Real value | 0.5 | Used only for authored Y>X+c event; region clipped to the model support. |
| Independence comparison | Off / compare joint with product of marginals | Off | Available only when required marginals are defined; results follow A-004. |

**Recalculation:** Update joint/marginal views and selected region result on valid model/bound changes; invalid model inputs leave last-valid outputs labeled Stale result and visible validation.  
**Outputs:** Joint table/contour or support diagram, joint CDF view where supported, marginal PMF/PDF/CDF displays, selected rectangular-region probability and optional joint-versus-product independence comparison.  
**Comparison:** Compare joint models or two valid dependence structures with matching marginals when an authored pair is available.  
**Simulation:** Optional paired samples and empirical marginals/region frequencies beside theoretical outputs.  
**Reset:** Discrete equal-mass 2×2 table; confirm loss of model edits/snapshots.  
**Resume state payload:** Pair mode, support/density preset, masses/parameters, region type, rectangle bounds or boundary threshold c, independence-comparison setting, outputs, optional named saved comparison snapshot, seed/run count and empirical results.  
**Cross-links:** M16–M18, proposed M21; PL-03 event independence. M22 is outside PL-09's pair-only scope.  
**Accessibility update:** Joint mass table or discretized/labeled summary accompanies plot; announce selected bounds and the region-result status.  
**Acceptance:** PL09-AC-01 default joint table is valid; PL09-AC-02 marginals agree with the selected joint model under A-004; PL09-AC-03 mixed conditioning, higher-dimensional vectors and arbitrary learner-drawn regions are identified as out of scope; PL09-AC-04 the continuous preset and non-rectangular boundary event are not enabled until their source-derived definitions are verified; PL09-AC-05 the optional independence comparison clearly identifies the pair model being evaluated.

## 5. Cross-lab consistency and scope decisions

- Use consistent labels for **Theoretical/Exact** and **Simulation/Empirical** values. Every empirical result names its run count and seed or reproducibility identifier.
- Use the shared **Stale result** treatment from INT-MATH-01: preserve the last valid result, label it Stale result, and identify the invalid input. Use **Outdated simulation** only for empirical output whose model settings have changed.
- Use consistent parameter entry, validation, reset confirmation, comparison snapshot and resume behaviors. Lab-specific deviations require a documented reason.
- A-004 is the sole authority for formula evaluation, probability constraints, numerical approximations, random seed behavior, simulation determinism and run-count ceilings. A-003 describes controls and visible states only.
- PL-01–PL-06 remain the approved initial labs. PL-07–PL-09 are recommended additions, but their IDs and scope require product approval before becoming canonical. If approved, update A-001, the PAS decision/artifact references and the content crosswalk.
- Custom Experiment Builder is excluded. Its supported model types and interaction design remain a separate decision and cannot block these labs.

## 6. Open decisions and handoffs

| Topic | Status / next artifact |
|---|---|
| Approval and canonical reservation of PL-07–PL-09 | Product review |
| Final defaults/ranges and verification of all source-derived examples | Mathematical/content review; A-004 |
| Seed algorithm, exact reproducibility contract, simulation limits and numerical methods | A-004 |
| Content IDs, module/concept associations, attribution metadata | A-005 |
| Exercise associations, answer checks and practice interactions | A-006 |
| Implementation feasibility and persistence of lab resume state | A-007 |
| Interaction and lab acceptance verification | A-008 |

## 7. Revision record

### Version 0.1 — Initial guided-lab specification — 14 November 2026

Defines a shared guided-lab template and interaction requirements for PL-01–PL-06; evaluates PL-07–PL-09 as proposed labs; records proposed cross-Part associations; and keeps calculation/validation authority in A-004.



### Version 0.2 — Interaction contract alignment — 14 November 2026

Aligns lab edits with A-002's commit behavior; adds explicit learner-triggered mass normalization repair; defines the versioned lab resume tuple; distinguishes Stale result from Outdated simulation; and records reproducible simulation state requirements.



### Version 0.3 — Scope and control reconciliation — 14 November 2026

Separates PL-05 from the continuous-only proposed PL-07; removes mixed-conditioning scope from PL-02/PL-09; narrows cross-Part associations accordingly; adds PL-01 operands, PL-03 conditioning-event selection, PL-08 inequality selection, per-run seed/replay behavior, and saved-snapshot management; consolidates the M15 crosswalk.

### Version 0.4 — Review residuals and shared contract alignment — 14 November 2026

Adds explicit snapshot naming, completes shared accessibility announcements and illustrative-content acceptance coverage, adds the PL-06 truncated-tail criterion, and clarifies that Jensen's convex function is selected independently from the transformation. Aligns resume envelopes and document references with A-004/A-005 v0.2.

**End of A-003 v0.4**
