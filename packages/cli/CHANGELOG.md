# @fledge/cli

## 0.7.0

### Minor Changes

- 0a42bbf: Bundle workflow skill scripts as self-contained executables using rolldown. The CLI exports @fledge/cli/brief and @fledge/cli/skills as programmatic entry points. The workflow package imports these and rolldown bundles them with all dependencies inlined into dist/scripts/. During fledge skills install, scripts from dist/scripts/ are automatically copied into each installed skill directory and made executable (shebang detection). Skills no longer require any runtime dependencies in the consuming project.

## 0.6.0

### Minor Changes

- e028e2c: resolve CLI binary via npx in workflow skills, keep direct dependency for postinstall

## 0.5.0

### Minor Changes

- bc2dfe8: First workflow skill: fledge-brief for feature brief creation and lifecycle management. Invoked directly via /fledge-brief. Guides the agent through creating briefs, breaking down tasks, and completing features with summaries.

## 0.4.0

### Minor Changes

- 88a0591: Drop archived state, simplify brief lifecycle to draft, active, completed. Add required summary field for completion, serving as lightweight project knowledge for future briefs. Make updated date required and set on creation. Add status filtering and date sorting to brief list, include summary in output.

## 0.3.0

### Minor Changes

- d96f6fb: Restructure skill installation. Replace fledge install-skill with fledge skills install, adding support for multi-skill packages and explicit --target flag. Add fledge skills list with type filtering via SKILL.md metadata.

## 0.2.0

### Minor Changes

- 5f16654: Add brief lifecycle management commands (create, start, complete, archive, status, list, validate, schema). Briefs are managed as markdown files with YAML frontmatter validated against zod schemas. The CLI enforces state transitions (draft, active, completed, archived) and validates task completeness at each step.

## 0.1.1

### Patch Changes

- 2ced56c: Initial version for early development
