---
"@fledge/workflow": minor
"@fledge/cli": minor
---

Replace global state with explicit BriefContext object passed through all brief functions. Add --project-dir flag to all brief subcommands for overriding the project root, enabling scripts to run from the skill directory while operating on the correct project. Add allowed-tools: Bash(scripts/brief.js \*) to the brief skill frontmatter so agents can execute scripts without permission prompts.
