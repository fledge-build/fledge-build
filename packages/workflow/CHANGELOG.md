# @fledge/workflow

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
