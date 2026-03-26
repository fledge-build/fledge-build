# @fledge/cli

## 0.9.1

### Patch Changes

- fadf884: Remove executable script handling in favor of running skill scripts with node. Drop shebang banner from workflow build and makeScriptsExecutable from CLI.

## 0.9.0

### Minor Changes

- 46dd3ab: Replace global state with explicit BriefContext object passed through all brief functions. Add --project-dir flag to all brief subcommands for overriding the project root, enabling scripts to run from the skill directory while operating on the correct project. Add allowed-tools: Bash(scripts/brief.js \*) to the brief skill frontmatter so agents can execute scripts without permission prompts.

## 0.8.0

### Minor Changes

- 808fb79: Add FLEDGE_PROJECT_DIR environment variable support. Brief commands resolve the project root from this variable, falling back to cwd(). Workflow skill instructs the agent to set it before running scripts, solving the path mismatch when scripts run from the skill directory. Scripts are referenced as executables (no node prefix) in the skill instructions.

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
