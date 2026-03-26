---
"@fledge/workflow": minor
"@fledge/cli": minor
---

Add FLEDGE_PROJECT_DIR environment variable support. Brief commands resolve the project root from this variable, falling back to cwd(). Workflow skill instructs the agent to set it before running scripts, solving the path mismatch when scripts run from the skill directory. Scripts are referenced as executables (no node prefix) in the skill instructions.
