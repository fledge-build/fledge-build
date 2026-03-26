# @fledge/workflow

## 0.6.0

### Minor Changes

- 46dd3ab: Replace global state with explicit BriefContext object passed through all brief functions. Add --project-dir flag to all brief subcommands for overriding the project root, enabling scripts to run from the skill directory while operating on the correct project. Add allowed-tools: Bash(scripts/brief.js \*) to the brief skill frontmatter so agents can execute scripts without permission prompts.

### Patch Changes

- Updated dependencies [46dd3ab]
  - @fledge/cli@0.9.0

## 0.5.0

### Minor Changes

- 808fb79: Add FLEDGE_PROJECT_DIR environment variable support. Brief commands resolve the project root from this variable, falling back to cwd(). Workflow skill instructs the agent to set it before running scripts, solving the path mismatch when scripts run from the skill directory. Scripts are referenced as executables (no node prefix) in the skill instructions.

### Patch Changes

- Updated dependencies [808fb79]
  - @fledge/cli@0.8.0

## 0.4.0

### Minor Changes

- 0a42bbf: Bundle workflow skill scripts as self-contained executables using rolldown. The CLI exports @fledge/cli/brief and @fledge/cli/skills as programmatic entry points. The workflow package imports these and rolldown bundles them with all dependencies inlined into dist/scripts/. During fledge skills install, scripts from dist/scripts/ are automatically copied into each installed skill directory and made executable (shebang detection). Skills no longer require any runtime dependencies in the consuming project.

### Patch Changes

- Updated dependencies [0a42bbf]
  - @fledge/cli@0.7.0

## 0.3.0

### Minor Changes

- e028e2c: resolve CLI binary via npx in workflow skills, keep direct dependency for postinstall

### Patch Changes

- Updated dependencies [e028e2c]
  - @fledge/cli@0.6.0

## 0.2.0

### Minor Changes

- 7fca727: Switch @fledge/cli from dependency to peerDependency so the binary is hoisted and available in consuming projects.

## 0.1.0

### Minor Changes

- bc2dfe8: First workflow skill: fledge-brief for feature brief creation and lifecycle management. Invoked directly via /fledge-brief. Guides the agent through creating briefs, breaking down tasks, and completing features with summaries.

### Patch Changes

- Updated dependencies [bc2dfe8]
  - @fledge/cli@0.5.0
