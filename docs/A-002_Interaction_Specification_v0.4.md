# A-002 — Interaction Specification

**Project:** Probability Revision Studio  
**Document ID:** A-002  
**Version:** 0.4  
**Date:** 14 November 2026  
**Status:** Draft for design review  
**Parent document:** PRS-PAS-001 — Product & Architecture Specification  
**Related documents:** A-001 v0.4 — Screen-by-Screen Blueprint; A-003 v0.4 — Probability Playground Specification; A-004/A-005 v0.2 — deterministic and content/data model drafts; A-006 v0.1 — exercise and assessment draft; A-007 v0.1 — technical architecture proposal; A-008 v0.1 — implementation readiness and acceptance verification.

---

## 1. Purpose and scope

This document specifies how the learner and application respond to one another across the screens proposed in A-001. It defines interaction behavior and state changes, not visual styling, implementation technology, detailed mathematical algorithms, or final data schemas.

It covers navigation, dashboard continuation, concept browsing, practice sessions, guided laboratory discovery and shared lab behavior, formula reference, progress and revision, and the future custom experiment builder. Detailed lab-specific controls and calculations belong in A-003; deterministic operation requirements belong in A-004; assessment details belong in A-006.

### 1.1 Decision labels

- **Approved:** recorded product decision or constraint.
- **Proposed:** recommended behavior for review; not yet a product requirement.
- **Open:** requires a product decision or a later design artifact.
- **Deferred detail:** intentionally specified elsewhere or after a prerequisite design decision.

### 1.2 Governing constraints

- **Approved D-008 / PD-08:** Modules organize content; learners choose the entry point. Parts and modules do not gate access. The Concept Atlas, Practice Gym and Probability Playground are co-equal.
- Mathematical calculations, simulation and answer validation are deterministic. No core interaction requires an LLM.
- Part and module associations, prerequisites and recommendations support discovery; they do not block access.
- Source-derived and supplementary content remain distinguishable and traceable.
- Proposed progress states, thresholds, review intervals and proposed new labs below remain pending review unless separately approved.

## 2. Interaction conventions

### 2.1 Navigation and context

**Proposed — INT-NAV-01:** Navigation from one environment to another preserves enough context to return to the originating activity. Context may include the source concept, exercise, lab, selected Part/module filter, and experiment parameters.

- In-app Back returns to the view that opened the current item. Browser Back follows browser history; it must not submit an answer or reset an activity. Both paths preserve the minimum state listed in §2.5.
- Cross-links open the requested destination with relevant context preselected, but never require a prerequisite activity.
- A visible clear/reset action removes inherited filters or experiment settings.
- Leaving an activity does not silently submit an answer or erase a saved progress event.
- If there is no in-app return view, provide a destination-appropriate route to its parent index or dashboard.

### 2.2 Global navigation, search and filtering

**Approved — INT-NAV-02:** A persistent global top-level navigation control is available from every primary screen, with destinations for Dashboard, Concept Atlas, Practice Gym, Probability Playground, Formula Reference, and Progress & Revision. Search is available from every primary screen. Search returns matching concepts, exercises and formula entries, grouped by result type. Selecting a result opens its canonical destination; associated Part/module context may be shown as metadata.

The three environments remain co-equal in the global navigation: none is ranked, visually subordinated, or hidden behind another. Curriculum modules (M01–M22) are not a global persistent left menu; instead, they are accessed via contextual, collapsible left sidebars/drawers inside Concept Atlas and Practice Gym, ensuring modules organize content without acting as an artificial linear constraint or gating access.

- Search does not require a Part selection.
- Filters are optional, additive where useful, and removable individually or with “Clear filters.”
- Empty results explain which filters are active and offer a way to broaden the search.
- Search and filter state is retained when the learner opens a result and returns to the result list during the current session.
- Progress & Revision has a persistent navigation destination; its queue and history are also reachable from dashboard links.
- Search implementation, ranking and exact supported fields remain open for A-005/A-007.

### 2.3 Mathematics and validation

**Proposed — INT-MATH-01:**

- Display equations and inline notation render as mathematics, with symbol definitions and relevant assumptions available near the expression.
- An invalid input is identified before it is used in a new calculation. While the current edit is invalid, retain the last valid derived result and mark it **Stale result — based on the last valid settings**; do not present it as the result of the invalid or unfinished input. Explain the violated constraint and how the learner can correct it.
- Distinguish invalid configuration, valid zero-probability results, and numerical approximation.
- Never alter the learner's entered value or displayed response without their action. The deterministic checker may compare equivalent forms using canonical internal representations (for example, (1/2) and (0.5)); feedback should say when an equivalent form is accepted.
- A learner-triggered repair is allowed when the application can explain a mathematically valid correction. Show the proposed repaired values and their effect, preserve the original entries, and require an explicit Apply repair action before replacing the active values. A-004 specifies eligible repair rules; for example, nonnegative probability masses with a positive total may be offered for normalization, while negative or all-zero masses cannot be repaired by normalization.
- **Commit** means the point at which pending edits become the candidate inputs for validation/calculation: activate Apply when provided; otherwise commit a single-value field on Enter or blur; commit a slider/drag control on release. Do not calculate from intermediate keystrokes or pointer movement. A-003 may specify a lab-specific Apply action where related values must be edited together.
- Use distinct state labels: **Stale result** means a previous valid theoretical result is shown while current edits are invalid; **Outdated simulation** means empirical output was generated from earlier model settings; **Expired saved state** means an activity no longer appears in Continue under its retention window but can still be opened from history. Do not use “stale” alone for simulation or saved-state expiry.
- Validation details and accepted tolerances are specified in A-004/A-006.

### 2.4 Feedback and hints

**Proposed — INT-FEEDBACK-01:**

- Feedback names what is correct, incorrect, incomplete, or mathematically equivalent, then gives a relevant explanation.
- Hints reveal progressively; opening a hint does not automatically reveal the worked solution.
- The learner can request the full explanation after making an attempt, then continue or retry where applicable.
- Core feedback is curated and deterministic. Any future generative help is optional and cannot override deterministic results.

### 2.5 Interaction state and retention scope

**Proposed — INT-STATE-01:** “Session” means the current open application tab/context. A page reload does not end the session; closing the app tab/window does. No separate “end session” action is assumed. “Persistent” means available after the app is closed and reopened. The persistence mechanism remains open for A-007, but interaction behavior should follow this scope.

| State | Minimum retention scope | Behavior |
|---|---|---|
| Search query, filters, result scroll position | Session | Restore when returning from a result during the current open application context. |
| Open/collapsed concept sections | Session | Restore when returning to the concept during that session. |
| Unsubmitted exercise response | Persistent | Resume restores the response without submitting it. |
| Checked exercise and feedback not yet continued | Persistent | Resume restores the checked response and feedback; it does not grade again automatically. |
| Completed exercise attempt and feedback outcome | Persistent | Keep in the exercise history and linked concept evidence record. |
| Lab parameters, selected configuration and comparison snapshots | Persistent | Resume restores learner selections and saved output snapshot, with the calculation-engine version and content version recorded separately. If either differs from the current version, retain the saved output with a version notice and require an explicit Recalculate action before replacing it. |
| Lab simulation seed, run count, algorithm version and empirical output | Persistent | Resume restores the same output and its settings. Seeded reproducibility for identical settings/version is required; A-004 defines the deterministic method and its limits. If the algorithm version changed, retain the saved empirical output as historical and require an explicit rerun. |
| Manual Mark for review flag | Persistent | Retain until the learner removes it. |
| Recommendations dismissed or snoozed | Persistent | Retain according to the behavior in §3.3. |

If persistent save is unavailable or fails, explain that the latest state may not survive leaving and offer a retry; do not silently imply it was saved.

## 3. Dashboard interactions

### 3.1 Entering a learning environment

**Approved — D-008 / PD-08:** The three primary learning environments have equal prominence and direct access. They are not ranked or visually subordinated.

**Proposed — INT-ENTRY-01 routes:**

- Selecting Concept Atlas opens the all-Part concept index.
- Selecting Practice Gym opens its entry/browse view, with no required Part or concept selection.
- Selecting Probability Playground opens the lab index, not a module-owned lab page.

### 3.2 Continue learning

**Proposed — INT-DASH-01:**

1. If one or more resumable activities exist, show the most recently updated one in the Continue slot and provide an “Other saved activities” list for the rest.
2. Resume restores the saved state without submitting or changing results.
3. The learner can Discard a resumable activity. Before discarding, show a confirmation naming the activity and all saved state that will be removed (for a lab, this includes parameters, snapshots, seed and simulation output). Cancel preserves everything; confirm removes saved continuation state. Completed attempt history remains intact.
4. **Proposed expiry:** An unsubmitted exercise response and a resumable lab remain in Continue for 30 days after last activity. A checked exercise with feedback not continued remains there for seven days because its feedback context is time-sensitive. After the applicable window, the item is labeled **Expired saved state** and leaves Continue, but its saved state remains accessible from history. The learner can select Resume there to restore the prior state or Discard it. These intervals and the checked-exercise distinction need product review.
5. If no resumable activity exists, show a neutral prompt with the three learning environments; do not infer that the learner must start at Part 1.
6. Completed activities remain in recent activity, not in the unfinished continuation slot.

An activity is resumable when it has an unsubmitted exercise response, a checked exercise whose feedback has not been continued past, or a guided lab with non-default parameters or a saved comparison/simulation state. A viewed concept without an active interaction appears in recent activity, not as unfinished. Required state scope is defined in §2.5. When multiple items exist, the most recently updated is primary; all others remain accessible until their applicable expiry or discard.

### 3.3 Suggested next actions

**Proposed — INT-DASH-02A:** Show up to three optional suggestions, separately from chronological recent activity. Each suggestion states its reason (for example, a manually marked concept, a due review, or a recently missed exercise) and offers Open, Dismiss, or Snooze where applicable. Selecting a suggestion opens the relevant concept, a related exercise, or a related lab. It never starts an activity or submits an answer automatically.

**Proposed — INT-DASH-02B:** Recommendation signals, including whether lab activity counts, remain open. **Proposed ordering:** due review first, manually marked concept second, then recent incorrect exercise; ties use most recent activity. Dismiss removes that suggestion instance; it may reappear only if a new underlying trigger occurs. Snooze hides it for seven days, then returns it to the candidate pool if the trigger still applies. The seven-day interval and ordering are proposals. When more due items exist than display slots, the ordering may delay manually marked concepts; this starvation risk should be reviewed if the proposed order is adopted. Suggestions must not become a hidden sequence or make Part/module progress the primary dashboard measure.

## 4. Concept Atlas interactions

### 4.1 Index and browsing

**Proposed — INT-ATLAS-01:**

- Initial view presents concepts across available Parts, grouped by module.
- Part and module selectors narrow the view; no selection is required.
- Selecting a concept opens its detail view. Returning to the index restores search, filters, and scroll position.
- Selecting a prerequisite or related concept navigates to it without requiring completion of the current concept.
- Progress indicators, if shown, use concept-level status and are secondary to the concept title and description.

### 4.2 Concept detail

**Proposed — INT-ATLAS-01 detail behavior:**

- Long explanations, derivations and examples can be expanded or collapsed independently; the learner’s open sections remain during the current session, as defined in §2.5.
- Formula links open a formula explanation or reference entry and provide a return path to the concept.
- Related-concept links preserve the source concept as return context.
- “Practise this concept” opens Practice Gym with that concept selected and a visible Clear filter action.
- “Explore in the Playground” opens a relevant associated lab with the concept context. The association is descriptive, not an access rule.
- “Mark for review” toggles a learner-controlled flag. Its state is visible and reversible.
- Opening a concept may count as an exploration event, but does not by itself establish exercise evidence or Secure status.
- Source-derived and supplementary sections have visible labels. Concept content exposes its source Part and transcript/chapter/timestamp reference where available; supplementary explanations identify themselves as such. Links open a source/reference detail without replacing the learner's current concept view.

Whether knowledge checks are inline or open as exercises remains open; either path must preserve the concept context.

## 5. Practice Gym interactions

### 5.1 Entry and exercise discovery

**Proposed — INT-PRACTICE-01 dashboard-to-practice flow:**

1. From the dashboard, selecting the Practice Gym card opens the Gym's exercise browse view directly.
2. The browse view exposes exercises across all available curriculum, with optional Part, module, concept, format and difficulty filters.
3. A concept/revision cross-link may preselect a concept; the learner can clear it.
4. No Part, status, prior Atlas visit, or playground activity is required.

**Open:** Whether to add a recommended-set preview, default set length, how recommendations/exercises are selected, and whether adaptive sequencing is used. These features are not part of the specified baseline flow; direct browsing and starting a learner-selected exercise work without session configuration.

### 5.2 Answer and feedback cycle

**Proposed — INT-EXERCISE-01:**

1. Present the prompt, necessary data/visuals, answer control, optional hints, and Check action. Keyboard users can reach and operate all controls in a logical order.
2. Check validates the submitted response deterministically where the answer type permits. For free-text reasoning that lacks a deterministic rubric, do not imply automated mathematical authority; provide curated criteria or mark the evaluation mode clearly. An unscored free-text response is saved as an attempt but does not count as correct/incorrect concept evidence. The learner may record a self-assessment separately, but it is not treated as a correctness result.
3. Keep the response visible after checking. Show correctness/partial-credit state and an explanation appropriate to the response. After Check, move focus to the feedback heading or announce the feedback without unexpectedly moving visual focus; preserve an accessible path back to the response.
4. Offer Retry, Reveal explanation/solution, and Continue according to the exercise’s authored behavior. Retry rules are not yet finalized.
5. Record the attempt, response, feedback outcome, hint use and linked concept/exercise identifiers, subject to the final progress model.
6. The learner can leave at any point. Do not force completion of a fixed set.

After an unscored free-text response, provide an optional **Self-assessment** control with “I can explain this,” “Partly,” and “I need help.” Save this separately from the answer outcome; it never changes correctness, Secure status, or spaced-review intervals. Choosing “I need help” may offer an explicit “Add concept to review list” action; only confirming that action sets the manual review flag and makes it eligible for the corresponding suggestion.

### 5.3 Completing or leaving practice

At a set boundary, if sets are implemented, show exercise-level outcomes and optional next actions: retry an item, revisit a linked concept, practise another exercise, or open a related lab. Do not convert the result into a Part/module completion percentage. On early exit, preserve completed attempt records and offer to resume the unfinished item when supported.

Retry limits, hint effects on review scheduling, session length, and written-response assessment remain open for A-006 and progress-model review.

## 6. Probability Playground interactions

### 6.1 Lab discovery and entry

**Proposed — INT-LAB-INDEX-01:**

- The lab index lists guided labs as independent destinations and shows purpose, concepts, available manipulations, expected observations, and related concept links.
- Module/concept links are many-to-many associations. Opening a lab from a module does not place the lab inside that module.
- Selecting a lab opens its setup in a valid default configuration and explains the model and controls.
- The six canonical initial lab IDs remain PL-01 through PL-06.
- Proposed PL-07 through PL-09 are candidates only and must not be presented as approved labs before approval.
- The Custom Experiment Builder is a separate capability. Its unfinished scope does not block specification or use of pre-built labs.

### 6.2 Shared guided-lab cycle

**Proposed — INT-LAB-01 reusable behavior; detailed controls belong in A-003:**

1. **Orient:** State the question or concept being explored, define the displayed model, and identify assumptions.
2. **Set up:** Let the learner edit supported parameters/events. Apply the commit behavior defined in INT-MATH-01 and identify invalid fields without silently changing them. During invalid edits, retain the last valid results labeled Stale result until valid inputs are committed.
3. **Explore:** Update deterministic theoretical results and visualizations when valid inputs change. Label approximations and simulation output separately from exact/theoretical values.
4. **Explain:** Describe what changed and connect the observed result to the relevant concept/formula.
5. **Compare:** Where supported, save a comparison state so the learner can inspect two configurations side by side.
6. **Simulate:** Where supported, expose run count and a reproducible seed or equivalent reproducibility control. Keep empirical results distinguishable from exact values.
7. **Reset/leave:** Reset returns to the documented default configuration. If reset would discard non-default parameters or comparison snapshots, show a confirmation that names what will be cleared; confirmed reset clears those items and restores defaults. Leaving preserves state according to §2.5.
8. **Cross-link:** Offer links to relevant concepts and exercises. Returning restores the lab state.

Whether edits recalculate immediately or require an Apply action is lab-specific and belongs in A-003. Simulation seeds, error tolerances and numerical methods belong in A-004. Dynamic results are announced accessibly without forcing focus changes; chart/table equivalents expose the same result information to assistive technology.

### 6.3 Custom Experiment Builder

The builder follows the same validation, explanation, reset and cross-link principles, but its initial supported model types remain undecided. Its detailed interaction flow is deferred until the supported scope is agreed. Do not make guided labs depend on builder-created data.

## 7. Formula Reference interactions

**Proposed — INT-FORMULA-01:**

- Search or browse entries by name, symbol or related concept where supported.
- Selecting an entry shows the expression, symbol meanings, assumptions/preconditions, interpretation, and a worked example or link.
- Selecting a related concept opens the Atlas with a return path to the formula entry.
- Copying an expression should preserve readable mathematical notation and provide a clear action result.
- A formula is never presented without applicable conditions and domain/support restrictions.
- Source-derived formulas show source Part and transcript/chapter/timestamp reference where available; editorial corrections or supplementary formula notes are labeled and distinguished from tutorial material.

Exact copy formats and search indexing remain open for A-005/A-007.

## 8. Progress and revision interactions

### 8.1 Recorded activity

**INT-PROGRESS-01:** The product direction tracks progress primarily at concept and exercise level. An exercise attempt can update its exercise record and associated concept evidence. A lab visit may create recent-activity history and suggest related study, but must not alone establish Secure status. Part/module completion percentages are not the primary measure.

### 8.2 Proposed concept status and schedule (pending decision)

A-001 proposes New, Exploring, Practising and Secure states, with Secure requiring three correct linked attempts, two formats and two separate days. It also proposes 1/3/7/14-day review intervals, a next-day review after an incorrect/partial attempt, and no interval advancement for a hint-supported correct response. These criteria are not yet approved.

Until the model is approved, A-002 requires only that activity and attempt outcomes be recordable with their concept/exercise links, and that manual Mark for review works independently. Do not implement or communicate a final mastery claim based solely on these draft thresholds.

### 8.3 Review queue and activity history

**Proposed — INT-REVIEW-01:** A review item opens the concept, targeted exercise, or relevant explanation that supports revision. Learners can act now, snooze where scheduling exists, dismiss a suggestion, and remove their manual review mark. Dismissing a recommendation does not erase learning history. Due state and rescheduling rules depend on approval of the progress model.

The history view lists exercise attempts and outcomes, recent labs, and concept activity in reverse chronological order, with links to the related concept, exercise, or lab. Filters may narrow by activity type or Part; no Part filter is required. Removing a manual review mark removes the flag, not the associated activity history. An Expired saved state or discarded resume state does not delete completed attempts.

Storage location, export/backup, and cross-device behavior remain open.

## 9. Responsive, accessibility and error behavior

**Proposed — INT-ACCESS-01:**

- All core learning actions remain available at narrow widths; multi-panel lab layouts may stack while preserving setup → result/visualization → explanation order.
- All interactive controls are keyboard operable with a visible focus indicator and a logical reading/focus order.
- After Check, feedback is announced to assistive technology; focus behavior follows §5.2 and does not strand the learner.
- Live calculation/result changes are announced without repeatedly interrupting the learner; the learner can navigate to the result on demand.
- Rendered mathematics has an accessible semantic representation (for example, MathML or an equivalent screen-reader-readable form) and a textual fallback where needed.
- Visualizations provide an equivalent labeled table or textual summary of the underlying values and result.
- Preserve navigation and activity context when the layout changes.
- Input errors identify the affected value and relevant constraint in plain language.
- Calculation or simulation failures distinguish invalid learner input from a system failure; preserve the last valid result when useful and provide a retry path.
- Empty catalogue/filter/search results offer a clear route back to broader discovery.
- Avoid destructive resets without a clear confirmation when learner-authored configuration would be lost.

Detailed responsive breakpoints, accessibility conformance criteria, persistence failure handling and visual design remain for later design artifacts; the interaction-level accessibility requirements above apply to those decisions.

## 10. Source traceability interactions

**Proposed — INT-SOURCE-01:** Concepts, exercises, formula entries and lab explanations identify source-derived material and supplementary/editorial material. Where source-derived, show Part and transcript/chapter/timestamp references when available. Selecting a reference opens its source metadata or a curated excerpt/reference view without navigating away from the learning activity. Corrections to transcription or mathematical notation are labeled as editorial clarification and retain a link to the original source reference.

Exercise feedback and formula examples retain their source references in the content record even when the learner-facing view shows a compact attribution. Source attribution does not imply that a transcript artifact is mathematically authoritative; editorial clarification remains distinguishable.

## 11. Requirement traceability and acceptance criteria

The following criteria are interaction-level checks for later design and implementation artifacts. A criterion is satisfied when the described observable behavior can be demonstrated; technology-specific verification is left to A-008.

| Requirement ID | Acceptance criteria |
|---|---|
| INT-NAV-01 | In-app Back and browser Back return without submitting or resetting; the minimum retained state in §2.5 remains available. Cross-links have a return path and do not gate access. |
| INT-NAV-02 | Every primary screen exposes global navigation, search and a route to Progress & Revision; search/filter context returns with the learner during the same session. |
| INT-STATE-01 | Each listed state is retained for its stated scope; failed persistent saves are disclosed rather than reported as successful. Calculation/content version differences are shown and never silently replace saved outputs with recalculated results. |
| INT-MATH-01 | Invalid inputs are not used in new calculations; the last valid result is visibly marked Stale result; learner-entered values are not silently altered; equivalent forms may be compared deterministically. |
| INT-FEEDBACK-01 | Feedback identifies the answer state and explains it; hints reveal progressively; optional generative help cannot override deterministic results. |
| INT-DASH-01A | The most recently updated resumable item appears first; other resumable items remain available; Resume restores without submission; Discard confirms and names saved state, preserves it on cancel, and does not delete completed history on confirm. |
| INT-DASH-01B | Continue applies the approved expiry windows. After expiry, the saved state is labeled Expired saved state, remains accessible from history, and can be restored or discarded. |
| INT-DASH-02A | Suggestions are separate from chronological recents, show a reason, and opening one never auto-starts an activity. |
| INT-DASH-02B | If the proposed suggestion rules are approved, displayed items follow the approved ordering and dismiss/snooze return behavior. |
| INT-ENTRY-01 | Each environment card opens its destination directly; the three environments remain co-equal. |
| INT-ATLAS-01 | Atlas filters are optional; concept cross-links return to context; practice/lab links carry a clearable concept context; source labels and review flag are visible. |
| INT-PRACTICE-01 | Dashboard Practice Gym entry opens browse directly. Any recommendation preview remains absent unless separately approved. No Part selection is required. |
| INT-EXERCISE-01 | Check preserves the response, provides accessible feedback, records response/hint/outcome, and unscored free text is not counted as correct/incorrect concept evidence. After an unscored response, the three self-assessment choices are available and stored separately; they do not affect correctness, mastery or schedule. “I need help” offers Add to review list; the flag changes only after confirmation. |
| INT-LAB-INDEX-01 | The index shows each approved lab's purpose, concepts, manipulations, observations and links; opening a lab loads a valid default; proposed labs are not represented as approved. |
| INT-LAB-01 | Invalid edits retain the last valid results marked Stale result; reset confirms loss of non-default parameters/snapshots; saved seed/run count reproduce the simulation state, and changed settings label old empirical output Outdated simulation. |
| INT-FORMULA-01 | Formula entries expose expression, definitions, assumptions, source/supplementary status, and a return path from linked concepts. |
| INT-PROGRESS-01 | Activity is linked to concept/exercise records; a lab visit alone cannot produce Secure status; no Part/module completion gate or primary score is shown. |
| INT-REVIEW-01 | Review items open a relevant concept/exercise/explanation; manual review marks can be removed without deleting history; activity history is chronological and can be followed back to its item. |
| INT-ACCESS-01 | Core controls work by keyboard; feedback and dynamic results are announced accessibly; rendered math and visuals have equivalent accessible representations. |
| INT-SOURCE-01 | Source-derived and supplementary material can be distinguished and source references can be opened without losing the current activity context. |

## 12. Open decisions and handoffs

| Topic | Status / next artifact |
|---|---|
| Concept status threshold and review cadence | Pending product review; then update PAS/A-001 and A-002 |
| Dashboard recommendation signals | Pending product review; distinguish recent activity from suggestions |
| Resume expiry windows and snooze duration | Proposed intervals; pending product review |
| Practice set length, sequencing, retries, hints and written reasoning | A-006 / product review |
| PL-07–PL-09 | Evaluated in A-003; recommendations and IDs remain provisional pending product approval |
| Lab-specific controls, visualizations and acceptance criteria | A-003 |
| Deterministic calculations, tolerances, seeds and validation | A-004 |
| Content identifiers, cross-links, attempt and progress records | A-005 |
| Exercise response formats and grading behavior | A-006 |
| Framework, persistence, search, responsive implementation | A-007 |
| Interaction acceptance verification | A-008 |

The seven-day suggestion snooze, suggestion priority, exercise/lab expiry windows, default stale/outdated result presentation, and accessibility representation details are proposed behavior and require review. The interaction-state scopes and calculation/content version records in §2.5 are proposed retention requirements for A-005/A-007 to support; storage technology is not selected here.

## 13. Revision record

### Version 0.1 — Initial interaction specification — 14 November 2026

Translates A-001 v0.4 into proposed interaction flows and system responses. Preserves D-008 / PD-08, keeps progress and new-lab proposals pending, and separates guided-lab work from the custom builder.

### Version 0.2 — Review refinement — 14 November 2026

Resolves the direct-browse practice flow, invalid-edit result handling, reset confirmation, input equivalence checking, state-retention scope and resume cases. Adds global navigation, source-traceability interactions, free-text evidence rules, suggestion behavior, interaction-level accessibility requirements, requirement IDs and acceptance criteria. Proposed scheduling and lab scope remain pending review.

### Version 0.3 — Follow-up review refinements — 14 November 2026

Requires seeded simulation reproducibility; specifies multiple resumable activities, discard and expiry behavior; clarifies unscored learner self-assessment; adds review queue/history acceptance criteria; aligns session terminology; confirms co-equal navigation prominence; separates unconditional suggestion criteria from pending ordering rules; and adds A-008 verification handoff.

### Version 0.4 — Resume and lab input contract refinements — 14 November 2026

Adds distinct result/simulation/saved-state vocabulary; defines commit and explicit repair behavior; specifies versioned result restoration; completes exercise self-assessment controls; fixes requirement ID duplication and coverage; makes expiry resumable from history; and clarifies discard confirmation.

**End of A-002 v0.4**
