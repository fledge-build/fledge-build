---
"@fledge/workflow": minor
"@fledge/cli": minor
---

Bundle workflow skill scripts as self-contained executables using rolldown. The CLI exports @fledge/cli/brief and @fledge/cli/skills as programmatic entry points. The workflow package imports these and rolldown bundles them with all dependencies inlined into dist/scripts/. During fledge skills install, scripts from dist/scripts/ are automatically copied into each installed skill directory and made executable (shebang detection). Skills no longer require any runtime dependencies in the consuming project.
