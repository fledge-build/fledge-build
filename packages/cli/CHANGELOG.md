# @fledge/cli

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
