# Probability Revision Studio — Agent Guidelines

## Project purpose

This folder contains the planning and, eventually, implementation work for Probability Revision Studio: a self-paced, browser-based environment for learning, practising and experimenting with probability. The three tutorial transcripts in `transcripts/` are the primary curriculum sources. Product direction and screen proposals are documented in `Probability Revision Studio.md` and the current version of the A-001 blueprint.

## Working agreements

- The project is tracked in Git with standard version control conventions.
- Keep project-specific documents and future application work inside this `probability/` folder unless the user directs otherwise.
- Treat the transcripts as source material, not polished instructional copy. Verify mathematical statements and clean transcription artifacts before incorporating them into learner-facing content.
- Preserve source attribution. Mark content that extends beyond the tutorial as supplementary; do not silently attribute it to the source.
- Keep proposed design details distinct from approved product decisions. The screen blueprint is a draft where it says details remain open.
- Prefer stable identifiers for concepts, exercises, formulas, and playground laboratories. Preserve existing identifiers when revising documents.
- Keep Part 2 and Part 3 content grounded in their transcripts. Do not invent their curriculum in advance.
- When content spans parts, link or extend the existing concept rather than making unnecessary duplicates.

## Learning and mathematical principles

- Support three equally important activities: understanding concepts, practising problem solving, and experimenting with probability models.
- Keep navigation flexible. Parts and modules organize content; they are not gates to concepts, practice, or laboratories.
- Make explanations include intuition, formal definitions, assumptions, examples, and common errors where appropriate.
- Render mathematical notation as mathematics using a suitable LaTeX renderer once implementation choices are made.
- Keep calculations, probability validation, simulations, and answer checking deterministic. An LLM must not be authoritative for mathematical results.
- Validate probability constraints, parameter ranges, formula preconditions, and domain/support restrictions. Distinguish exact values from numerical approximations.
- Keep any future LLM feature optional. Never expose provider credentials in browser-side code.

## Product architecture direction

The proposed application is modular and browser-based. Keep presentation, structured educational content, mathematical computation, visualisation, assessment, progress, and optional AI responsibilities separable. The framework and libraries are not yet final decisions.

The six initial guided labs use canonical IDs PL-01 through PL-06. The custom finite-experiment builder is a separate capability from parameterized distribution explorers, though they may share the mathematical engine. Design for later continuous probability support without assuming all random variables are discrete.

## Documentation and implementation

- Keep `README.md` as the concise entry point and update it when the folder's contents or project status materially changes.
- Treat `Probability Revision Studio.md` as the product and architecture baseline and the current version of A-001 as the proposed screen blueprint.
- Avoid introducing implementation choices that the specifications explicitly leave open without documenting the decision and its rationale.
- If creating notebooks later, provide context, prerequisites, and self-contained cells; clear generated outputs before sharing them.
- If Python tooling is introduced in this folder, follow the user's repository-level `uv` conventions and run scripts through `uv run python`.
