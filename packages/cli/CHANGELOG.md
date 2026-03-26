# @fledge/cli

## 0.2.0

### Minor Changes

- 5f16654: Add brief lifecycle management commands (create, start, complete, archive, status, list, validate, schema). Briefs are managed as markdown files with YAML frontmatter validated against zod schemas. The CLI enforces state transitions (draft, active, completed, archived) and validates task completeness at each step.

## 0.1.1

### Patch Changes

- 2ced56c: Initial version for early development
