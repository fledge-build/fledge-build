---
name: changeset
description: >-
  Stage all local changes and prepare a release commit with a changeset.
  Invoked directly via /changeset, not auto-triggered.
allowed-tools: Bash(git add:*), Bash(git diff:*), Bash(git commit:*), Bash(pnpm changeset:*), Read, Write
---

## Steps

1. Run `git add .` to stage all local changes.

2. Run `git diff --cached --stat` and `git diff --cached` to understand what changed.

3. Determine which publishable packages are affected. Publishable packages are those without `"private": true` in their `package.json`. Read each affected package's `package.json` to check. Files outside of `packages/` do not belong to any publishable package and should be ignored for changeset purposes.

4. Based on the changes, suggest a bump type for each affected package:
   - **patch**: fixes, content tweaks, dependency updates
   - **minor**: new features, new commands, meaningful additions
   - **major**: breaking changes to public API or install mechanism

   Present your suggestion and ask the user to confirm or adjust.

5. Run `pnpm changeset --empty` to create a new changeset file. The command outputs the path of the created file.

6. Write the changeset file with the correct format. Example:

   ```markdown
   ---
   "@fledge/cli": minor
   "@fledge/workflow": patch
   ---

   Short description of what changed across the affected packages.
   ```

   Use a single summary that covers all package changes. Keep it concise (1-3 sentences).

7. Run `git add .` to stage the changeset file.

8. Run `git commit` with a short, descriptive commit message. Do not add co-authoring hints or trailers.
