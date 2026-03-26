---
"@fledge/cli": minor
---

Add brief lifecycle management commands (create, start, complete, archive, status, list, validate, schema). Briefs are managed as markdown files with YAML frontmatter validated against zod schemas. The CLI enforces state transitions (draft, active, completed, archived) and validates task completeness at each step.
