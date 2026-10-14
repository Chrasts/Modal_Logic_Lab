# General Agent Working Instructions

## Source hierarchy and freshness

Use the following precedence when working in this repository:

1. the user's task-specific instructions
2. a more specific nested `AGENTS.md`, if one exists for the affected area
3. actual current `main` code, tests, package configuration and workflows
4. `PROJECT_STATE_AND_ROADMAP.md`
5. `LEARNING_AND_PRODUCT_ARCHITECTURE.md`
6. `README.md`

Repository reality takes precedence over stale documentation.

If a task depends on whether a feature currently exists, verify the relevant implementation in current `main` instead of trusting an old status statement.

Do not use archived dated context files as active product truth unless the task explicitly asks for historical comparison.

Future ideas in the roadmap are approved directions, not automatic implementation scope.

## Scope and efficiency

- Start with the smallest amount of repository context needed to solve the task.
- Do not scan, index or summarize the entire repository by default.
- Expand investigation only when the task requires it, dependencies are unclear or initial evidence is insufficient.
- Prefer targeted inspection of named files, relevant directories, imports, references, tests and error traces.
- Reuse information already established in the current session instead of repeatedly rereading the same files.

## Before editing

When editing:

- identify the concrete objective, affected area, constraints and success criteria
- for broad tasks, state the intended scope before extensive changes
- do not redesign architecture, replace technologies or perform broad cleanup unless explicitly requested or necessary for correctness
- preserve existing conventions and make the smallest coherent change that solves the problem
- inspect the current behavior before restoring an older pattern described in historical documentation

## Product-specific guardrails

### Mathematical correctness

- Keep deterministic logic semantics separate from presentation logic.
- Do not use a language model to decide mathematical correctness.
- Preserve distinctions between pointed, model-global and frame-level semantics.
- Do not claim mathematical minimality without an actual proof or a clearly defined exhaustive search.
- Reference solutions demonstrate solvability unless the task explicitly requires exact structural equality.

### Existing architecture

- Prefer the existing shared workspace/evaluator across Learn, Campaigns, Lab and Create.
- Prefer focused extraction over a full rewrite of `App.tsx` or the application.
- Preserve import/export/share compatibility where practical.
- Keep semantic state separate from presentation/layout state.
- Add a new semantic engine only when a concrete new module requires it.

### Current UI direction

The current interface intentionally uses a flatter relational/editorial design language.

Do not reintroduce removed square navigation markers, unnecessary nested cards, decorative gradients or redundant visual chrome by default.

Use typography, spacing, structure and semantic state to communicate hierarchy unless a task calls for a different design direction.

### Mobile

Mobile web is technically functional but still unfinished and polish-heavy.

- Do not restore a blanket "Desktop required" guard.
- Do not assume mobile has full desktop-quality parity.
- Preserve mobile-specific workspace routing and responsive behavior when changing shared UI.
- Test small-screen overflow, touch targets, sheets, overlays and verification flows for changes that can affect them.
- Desktop may remain the denser reference experience for complex Lab and Create workflows.

## Implementation

When implementing:

- work in focused, reviewable units
- avoid unrelated refactoring, formatting churn, generated-file changes and speculative improvements
- prefer modifying existing abstractions over introducing new ones without a clear need
- if the task grows substantially beyond the requested scope, reassess before expanding it
- do not repeatedly attempt the same failing approach

## Verification

Run the narrowest relevant checks first:

- targeted unit/component tests
- type/build checks
- minimal reproduction

Broaden verification when the change affects shared dependencies or user flows.

Relevant repository-level checks include:

- `npm test`
- `npm run build`
- `npm run smoke`
- `npm run test:e2e`
- WebKit mobile smoke where mobile-sensitive behavior changed

Never claim that a change works unless the relevant checks were actually run.

Distinguish completed verification from checks that could not be run.

A successful GitHub Pages deploy does not imply the full CI suite passed. Pages deployment has a separate build and smoke path.

## Documentation maintenance

When implementation status changes materially:

- update `PROJECT_STATE_AND_ROADMAP.md`
- update `LEARNING_AND_PRODUCT_ARCHITECTURE.md` only when product role, pedagogy or placement changes
- keep `README.md` concise and public-facing

Do not leave a completed feature listed only as future work.

Do not remove approved future directions merely because they are not currently prioritized.

## Communication

At completion, summarize:

1. what changed
2. which files were affected
3. what was verified
4. any unresolved risks or recommended next step

Keep progress reports concise and substantive. Do not produce a long repository overview unless requested.
