---
name: fledge-brief
description: >-
  Guide feature brief creation and lifecycle. Plan new features, create or update feature briefs, break down work into tasks, or complete a feature.
  Invoked directly via /fledge-brief, not auto-triggered.
metadata:
  type: workflow
---

## Setup

Before running any script, set the `FLEDGE_PROJECT_DIR` environment variable to the project root so scripts know where to find and create briefs:

```bash
export FLEDGE_PROJECT_DIR="$(pwd)"
```

Set this once at the start of the conversation. All scripts below assume it is set.

## Available scripts

Self-contained executable scripts bundled with this skill:

- **`scripts/brief.js create <name>`** -- Create a new brief with stub files
- **`scripts/brief.js start <name>`** -- Transition a brief from draft to active
- **`scripts/brief.js complete <name>`** -- Transition a brief from active to completed
- **`scripts/brief.js status <name>`** -- Show status and task progress
- **`scripts/brief.js list [--status <status>]`** -- List all briefs with progress and summary
- **`scripts/brief.js validate <name>`** -- Validate brief files against schemas
- **`scripts/brief.js schema`** -- Output JSON Schema for brief and tasks frontmatter

## Step 0: Determine intent

Ask what the user wants to do, or infer from context. Present these options:

1. **New brief** -- plan a new feature from scratch. Proceed to Step 1.
2. **Continue a brief** -- pick up an existing brief. Proceed to Step 4.
3. **Complete a brief** -- wrap up a finished feature. Proceed to Step 5.

If unclear, run `scripts/brief.js list` to show current briefs and ask.

---

## Step 1: Gather context

Before writing anything, build an understanding of what exists.

1. Run `scripts/brief.js list --status completed` to read summaries of completed features. Note anything relevant to the new feature.
2. Ask the user what they want to build. Keep it conversational, not a form. Aim to understand:
   - What is the user-facing change?
   - Why does it matter?
   - What parts of the system does it touch?
3. If the codebase is relevant, explore it to understand existing patterns, data models, and components that the feature will interact with.

Make obvious decisions yourself. Only ask the user when there is a genuine choice to make. When you do ask, present 2-3 specific options rather than open-ended questions.

Proceed to Step 2.

---

## Step 2: Draft the brief

Run `scripts/brief.js create <name>` to create the brief directory.

Write the brief content into `brief.md`. The frontmatter is managed by the scripts. The markdown body should capture:

- **What**: the user-facing change in one or two sentences
- **Why**: the motivation or problem being solved
- **Scope**: what is included and what is explicitly excluded
- **Design decisions**: key choices made during this conversation, with reasoning

Keep it concise. The brief is a reference for implementation, not a specification document. If something is obvious from the code, do not repeat it here.

Proceed to Step 3.

---

## Step 3: Break down into tasks

Define the implementation tasks in `tasks.md`. Each task should be:

- **Small enough** to be a single focused unit of work
- **Specific enough** that someone (or an agent) can start without further clarification
- **Grouped** by concern when the feature spans multiple areas (e.g. backend, frontend, data)

Write the tasks into the `tasks.md` frontmatter:

```yaml
---
tasks:
  - name: <clear, actionable task name>
    group: <area>
    done: false
---
```

Order tasks by dependency: tasks that others depend on come first within their group.

After writing tasks, run `scripts/brief.js validate <name>` to confirm the brief is valid, then run `scripts/brief.js start <name>` to transition to active.

Present the complete brief and task list to the user for review before starting.

---

## Step 4: Continue a brief

Run `scripts/brief.js list` to show all briefs. If the user does not specify which brief, ask them to pick one.

Run `scripts/brief.js status <name>` to show progress. Read the brief and tasks files to understand the full context.

From here, the user may want to:
- **Discuss a task** -- talk through approach before implementing
- **Update tasks** -- mark tasks as done, add new tasks, reorder
- **Revise the brief** -- update scope or design decisions based on what was learned during implementation

When updating task status, modify the `tasks.md` frontmatter directly, then run `scripts/brief.js status <name>` to confirm the update.

---

## Step 5: Complete a brief

Run `scripts/brief.js status <name>` to verify all tasks are done.

If there are incomplete tasks, ask the user whether to:
1. Mark remaining tasks as done (if they were completed outside this conversation)
2. Remove tasks that are no longer needed
3. Continue working on them first

Write a summary into the `brief.md` frontmatter `summary` field. The summary should be one to two sentences capturing:
- What was built
- Key decisions or patterns established that future features should know about

Run `scripts/brief.js complete <name>` to transition to completed. The script validates that all tasks are done and the summary is present.
