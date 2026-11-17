# Probability Revision Studio — Roadmap

**Purpose:** Track curriculum activation, laboratory capability, assessment expansion, and mastery engine evolution across Probability Revision Studio.  
**Current Stage:** Stage 7 — Accessibility, Polish & Release (Stage 6 Completed).  
**Core Principles:**
- Grounded in source transcripts (`transcripts/Review of Basic Probability 1-3.md`).
- 100% deterministic mathematical calculations, validation, and scoring.
- Non-gating navigation across all three co-equal learning environments: Concept Atlas, Practice Gym, and Probability Playground.
- Raw learner evidence kept immutable; mastery states and review schedules derived deterministically.

---

## 1. Executive Summary & Current Metrics

| Dimension | Metric | Status |
|---|---|---|
| **Curriculum Activation** | **22 of 22 Modules (100%)** | Fully activated across Parts 1, 2, and 3 (`M01`–`M22`) |
| **Concept Coverage** | **44 Concepts** (`C-000001`–`C-000044`) | Verified definitions, intuition, LaTeX formulas, examples, and cross-links |
| **Practice Gym** | **45 Scored Exercises** (`EX-000001`–`EX-000045`) | Multi-part exercises, interval & vector/tuple evaluation, progressive hints, partial credit, $\ge 2$ exercises for every module `M01`–`M22` |
| **Guided Laboratories** | **11 Active Labs + Custom Builder** (`PL-01`–`PL-11`, `EXP-BUILDER`) | 100% harmonized under unified `LabShell` architecture with persistent snapshot comparisons & normative error states |
| **Test Suite Coverage** | **19 Suites, 219 Passing Tests** | Vitest automated golden vectors, domain boundaries, precision tests, multi-part assessment checks |
| **Build & Type Safety** | **Clean Production Build** | TypeScript (`tsc && vite build`) passing with zero errors |
| **Routing & Navigation** | **Bi-directional Hash Routing** | Deep-links (`#/playground/:id`, `#/atlas/:id`, `#/practice/:id`) with state preserved |
| **Persistence & Backup** | **Local-First JSON Export/Import** | Full learner attempts, activity logs, and laboratory comparison snapshots |
| **Adaptive Mastery & Spaced Revision** | **4-Tier State Engine & Leitner Ladder** | Multi-day unassisted criteria for Secure, confidence calibration, manual review flags |

---

## 2. Laboratory Inventory (`PL-01` through `PL-11` & `EXP-BUILDER`)

| Lab ID | Name | Part | Core Mathematical Capabilities |
|---|---|---|---|
| `PL-01` | **Venn Event Workbench** | P1 | 2-event Venn diagram with clickable regions, disjoint/subset presets, exact set operations (`CAL-EVENT-001/002`). |
| `PL-02` | **Conditional & Bayes Workbench** | P1 | 2x2 contingency table, probability tree diagram, Bayes posterior calculator with normalization repair (`CAL-COND-001/002`). |
| `PL-03` | **Independence Explorer** | P1 | Pairwise, 3-event mutual independence, and conditional independence testers (`CAL-IND-001`–`003`). |
| `PL-04` | **Random Variable Mapper** | P1 | Discrete random variable fiber aggregation $X: \Omega \to \mathbb{R}$ and induced PMF bar chart (`CAL-RV-001`). |
| `PL-05` | **CDF & PMF Explorer** | P1 | Right-continuous staircase CDF generator, jump discontinuity visualizer, interval query tool $[a, b]$ (`CAL-PMF-001`, `CAL-CDF-001/002`). |
| `PL-06` | **Discrete Distribution Explorer** | P1 | Parameterized Bernoulli, Binomial, Geometric ($k \ge 1$), and Poisson with PRNG simulation overlay (`CAL-DIST-001`–`004`). |
| `PL-07` | **Continuous Distribution Explorer** | P2 | PDF & CDF curves for Uniform, Exponential, and Normal ($\mu, \sigma$) with interval shading and rejection sampling (`CAL-CONT-001`–`004`). |
| `PL-08` | **Transform & Moments Workbench** | P2 | 1D continuous transforms $Y = g(X)$, expectation $E[X]$, variance $\text{Var}(X)$, Chebyshev bounds, sample mean tracking (`CAL-TRANS-001`, `CAL-MOM-001/002`, `CAL-INEQ-001`–`003`). |
| `PL-09` | **Joint & Marginals Lab** | P3 | 2D discrete joint tables and continuous triangular density $f(x, y) = 2$ ($0 < x < y < 1$), non-rectangular boundary events $P(Y > X + c)$, marginals, and independence checks (`CAL-JOINT-001`–`006`). |
| `PL-10` | **Conditionals, Channels & Transforms** | P3 | Continuous conditional slicing $f_{Y\|X}(y\|x)$, binary communication channel signaling with Gaussian/Uniform noise & decision thresholding, 2D Jacobian explorer (`CAL-COND-DIST-001`, `CAL-COMM-001/002`, `CAL-JACOBIAN-001`). |
| `PL-11` | **Central Limit Theorem & IID Sums** | P2/P3 | Sums of IID variables $S_n = \sum_{i=1}^n X_i$, slider $n \in [1, 50]$, exact discrete PMF convolution, Monte Carlo sampling, and standardized $Z_n$ convergence to $\mathcal{N}(0, 1)$ (`CAL-CLT-001/002`). |
| `EXP-BUILDER` | **Custom Finite Experiment Builder** | Universal | Author custom sample spaces $\Omega$, assign exact rational masses, define arbitrary random variables $X(\omega)$, calculate PMFs, CDFs, moments, event operations, and conditional probability with `E-COND-ZERO` guard (`CAL-CUSTOM-EXP-001`). |

---

## 3. Staged Roadmap Status

| Stage | Focus Area | Key Deliverables | Status |
|---|---|---|---|
| **Stage 0** | **Baseline & Specs** | Specifications A-001 through A-008 organized in `docs/`; AGENTS working rules defined. | **Completed** |
| **Stage 1** | **Technical Spike** | React 18 + TypeScript + Vite + KaTeX + Vitest harness established. | **Completed** |
| **Stage 2** | **Deterministic Core** | Exact rational arithmetic engine (`Rational`), deterministic simulation PRNG, error code taxonomy. | **Completed** |
| **Stage 3** | **Vertical Slice** | 6-step prototype learner journey across Dashboard, Atlas, Gym, and `PL-01`. | **Completed** |
| **Stage 4** | **Curriculum Activation & Lab Expansion** | 100% activation of Modules M01–M22, activation of Guided Labs `PL-02` through `PL-11`, Custom Builder, ErrorBoundary, and bi-directional deep-linking. | **Completed** |
| **Stage 5** | **Adaptive Mastery & Spaced Revision Engine** | Deterministic 4-tier mastery state machine (`Unseen` $\to$ `Exploring` $\to$ `Practising` $\to$ `Secure` / `Review Due`), Leitner interval progression, Dashboard Revision Queue, manual review flags, Practice Gym review filter, self-assessment confidence feedback, in-situ contextual help bars, and non-scrolling stepper/combobox item navigation. | **Completed** |
| **Stage 6** | **Assessment Depth & Laboratory Harmonization** | Multi-part exercise expansion (ensuring $\ge 2$ exercises per module, totaling 45 exercises), domain-bounded rational evaluation, progressive hint revealing with partial credit scoring, and complete migration of all guided labs `PL-01` through `PL-11` into the unified `LabShell` architecture. | **Completed** |
| **Stage 7** | **Accessibility, Polish & Release** | WCAG 2.1 AA keyboard/screen-reader audit, code-splitting optimization, and offline PWA capability. | **Up Next** |

---

## 4. Current Sprint Objectives (Stage 7)

1. **Accessibility & WCAG 2.1 AA Audit:**
   - Full keyboard navigation across all canvas/SVG interactive components.
   - Screen-reader aria attributes and contrast ratio checks.
2. **Performance & Code-Splitting:**
   - Dynamic lazy import of guided laboratory modules (`React.lazy` / `Suspense`) to optimize initial bundle size.
3. **Offline & Packaging:**
   - Offline service worker caching and PWA manifest configuration.
