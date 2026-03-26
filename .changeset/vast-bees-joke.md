---
"@fledge/cli": patch
"@fledge/workflow": patch
---

Remove executable script handling in favor of running skill scripts with node. Drop shebang banner from workflow build and makeScriptsExecutable from CLI.
