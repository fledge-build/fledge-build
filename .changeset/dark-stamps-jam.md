---
"@fledge/cli": minor
"@fledge/workflow": minor
---

Redesign workflow lifecycle: add `ready` and `cancelled` brief states, replace task `done` boolean with `status` enum (pending, active, completed, skipped), add `spec.md` for technical context, and new `ready`/`cancel` CLI commands. Brief skill updated with enrich step and new state transitions.
