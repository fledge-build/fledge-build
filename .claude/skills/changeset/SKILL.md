---
name: changeset
description: >-
  Stage all local changes and prepare a release commit with a changeset.
  Invoked directly via /changeset, not auto-triggered.
allowed-tools: Bash(git add:*), Bash(git diff:*), Bash(git commit:*), Bash(pnpm changeset:*), Read, Write
---

## No-verify mode

If the user passes "no-verify", "no verify", "--no-verify", or any similar variation, skip all confirmation prompts. Determine bump types and write the changeset without asking the user to confirm or adjust.

## Steps

1. Run `git add .` to stage all local changes.

2. Run `git diff --cached --stat` and `git diff --cached` to understand what changed.

3. Determine which publishable packages are affected. Publishable packages are those without `"private": true` in their `package.json`. Read each affected package's `package.json` to check. Files outside of `packages/` do not belong to any publishable package and should be ignored for changeset purposes.

4. If no publishable packages are affected, skip the changeset entirely. Run `git commit` with a descriptive commit message and stop. No changeset file is needed.

5. Based on the changes, suggest a bump type for each affected package:
   - **patch**: fixes, content tweaks, dependency updates
   - **minor**: new features, new commands, meaningful additions
   - **major**: breaking changes to public API or install mechanism

   Unless in no-verify mode, present your suggestion and ask the user to confirm or adjust.

6. Run `pnpm changeset --empty` to create a new changeset file. The command outputs the path of the created file.

7. Write the changeset file with the correct format. Example:

   ```markdown
   ---
   "@fledge/cli": minor
   "@fledge/workflow": patch
   ---

   Short description of what changed across the affected packages.
   ```

   Use a single summary that covers all package changes. Keep it concise (1-3 sentences).

8. Run `git add .` to stage the changeset file.

9. Run `git commit` with a short, descriptive commit message. Do not add co-authoring hints or trailers.
