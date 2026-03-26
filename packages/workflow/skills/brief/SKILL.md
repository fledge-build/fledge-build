---
name: fledge-brief
description: >-
  Guide feature brief creation and lifecycle. Plan new features, create or update feature briefs, enrich with project knowledge, or complete a feature.
  Invoked directly via /fledge-brief, not auto-triggered.
metadata:
  type: workflow
allowed-tools: Bash(node *scripts/brief.js*)
---

## Lifecycle overview

The brief skill owns two workflow phases: **Brief** (capture what to build) and **Enrich** (connect to project knowledge). See [docs/workflow.md](../../docs/workflow.md) for the full workflow.

```
Brief  →  Enrich  →  [Implement]  →  [Verify]  →  [Complete]
└── this skill ──┘    └── implement skill (future) ──────────┘
```

**States this skill manages:** `draft → ready`
**States managed by the implement skill:** `ready → active → completed`

A brief directory contains three files:

```
.fledge/briefs/<name>/
  brief.md      what, why, scope, design decisions (product-level)
  spec.md       data models, APIs, external services (technical context)
  tasks.md      implementation tasks (empty until implement phase)
```

## Available scripts

**Important:** Run all scripts with `node` (e.g. `node scripts/brief.js list`). Always pass `--project-dir` pointing to the project root.

- **`node scripts/brief.js create <name> --project-dir <path>`** -- Create a new brief with stub files
- **`node scripts/brief.js ready <name> --project-dir <path>`** -- Transition a brief from draft to ready
- **`node scripts/brief.js start <name> --project-dir <path>`** -- Transition a brief from ready to active
- **`node scripts/brief.js complete <name> --project-dir <path>`** -- Transition a brief from active to completed
- **`node scripts/brief.js cancel <name> --project-dir <path>`** -- Cancel a brief
- **`node scripts/brief.js status <name> --project-dir <path>`** -- Show status and task progress
- **`node scripts/brief.js list [--status <status>] --project-dir <path>`** -- List all briefs with progress and summary
- **`node scripts/brief.js validate <name> --project-dir <path>`** -- Validate brief files against schemas
- **`node scripts/brief.js schema`** -- Output JSON Schema for brief and tasks frontmatter

## Step 0: Determine intent

Ask what the user wants to do, or infer from context. Present these options:

1. **New brief** -- plan a new feature from scratch. Proceed to Step 1.
2. **Continue a brief** -- pick up an existing brief. Proceed to Step 5.
3. **Complete a brief** -- wrap up a finished feature. Proceed to Step 6.

If unclear, run `node scripts/brief.js list --project-dir <path>` to show current briefs and ask.

---

## Step 1: Gather context

Before writing anything, build an understanding of what exists.

1. Run `node scripts/brief.js list --status completed --project-dir <path>` to read summaries of completed features. Note anything relevant to the new feature.
2. Ask the user what they want to build. Keep it conversational, not a form. Aim to understand:
   - What is the user-facing change?
   - Why does it matter?
   - What parts of the system does it touch?
3. If the codebase is relevant, explore it to understand existing patterns, data models, and components that the feature will interact with.

Make obvious decisions yourself. Only ask the user when there is a genuine choice to make. When you do ask, present 2-3 specific options rather than open-ended questions.

Proceed to Step 2.

---

## Step 2: Draft the brief

Run `node scripts/brief.js create <name> --project-dir <path>` to create the brief directory.

Write the brief content into `brief.md`. The frontmatter is managed by the scripts. The markdown body should capture:

- **What**: the user-facing change in one or two sentences
- **Why**: the motivation or problem being solved
- **Scope**: what is included and what is explicitly excluded
- **Design decisions**: key choices made during this conversation, with reasoning

Keep it concise. The brief is a reference for implementation, not a specification document. If something is obvious from the code, do not repeat it here.

Proceed to Step 3.

---

## Step 3: Enrich with project knowledge

Connect the brief to the technical reality of the project. Read the codebase and project knowledge sources to understand:

- **Data models**: what existing models does the feature interact with? What new models are needed?
- **APIs**: what endpoints exist? What new endpoints are needed?
- **External services**: what third-party integrations are involved?
- **Domain concepts**: what domain terms and relationships are relevant?

Write this technical context into `spec.md`. The spec grounds the product-level brief in the project's actual structure. It does **not** include implementation tasks or technology-specific guidance (those come from the implement skill and technology skills).

Proceed to Step 4.

---

## Step 4: Mark as ready

Run `node scripts/brief.js validate <name> --project-dir <path>` to confirm the brief is valid.

Present the complete brief (`brief.md`) and spec (`spec.md`) to the user for review.

Once approved, run `node scripts/brief.js ready <name> --project-dir <path>` to transition to ready. The brief is now ready for the implement skill to pick up.

---

## Step 5: Continue a brief

Run `node scripts/brief.js list --project-dir <path>` to show all briefs. If the user does not specify which brief, ask them to pick one.

Run `node scripts/brief.js status <name> --project-dir <path>` to show progress. Read the brief, spec, and tasks files to understand the full context.

From here, the user may want to:
- **Discuss the brief** -- talk through scope or design decisions
- **Update the spec** -- add or revise technical context
- **Revise the brief** -- update scope or design decisions based on what was learned
- **Send back to draft** -- if a ready brief needs significant rework, update the status back to draft

When updating files, run `node scripts/brief.js validate <name> --project-dir <path>` afterward to confirm validity.

---

## Step 6: Complete a brief

Run `node scripts/brief.js status <name> --project-dir <path>` to verify all tasks are done.

If there are incomplete tasks, ask the user whether to:
1. Mark remaining tasks as completed (if they were completed outside this conversation)
2. Mark tasks as skipped (if they are no longer needed)
3. Continue working on them first

Write a summary into the `brief.md` frontmatter `summary` field. The summary should be one to two sentences capturing:
- What was built
- Key decisions or patterns established that future features should know about

Run `node scripts/brief.js complete <name> --project-dir <path>` to transition to completed. The script validates that all tasks are done or skipped and the summary is present.
