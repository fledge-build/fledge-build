# Workflow

The Fledge workflow structures feature development from idea to working code. It is the bridge between knowing what to build and having it built correctly.

## Phases

```
Brief  →  Enrich  →  Build  →  Verify  →  Complete
```

The workflow is fluid, not linear. Building may reveal design gaps that flow back into the brief. The sequence is a default, not a gate.

### Brief

Capture what to build, why, and the scope. The brief is product-level: it describes the user-facing change and the motivation behind it. Technical details come later.

The brief skill drives this phase. It gathers context (completed briefs, codebase exploration, conversation with the developer), then drafts the brief.

**Input:** An idea or feature request.
**Output:** A `brief.md` with what, why, scope, and design decisions.

### Enrich

Connect the brief to project knowledge. This step grounds the product-level brief in the technical reality of the project: data models, APIs, external services, domain concepts.

The brief skill also drives this phase. It reads project knowledge sources and writes a `spec.md` that captures how the feature connects to the existing system.

**Input:** A drafted brief.
**Output:** A `spec.md` with relevant data models, APIs, and domain context. The brief transitions from `draft` to `ready`.

### Build

Plan and execute the work. The build skill reads the enriched brief, discovers installed technology skills, and breaks the feature into concrete tasks. Tasks are informed by both the domain context (spec) and the technology skills (which know how to decompose work for their stack).

After planning, tasks are executed one by one, guided by the relevant technology skill.

**Input:** A ready brief with spec.
**Output:** Working code and a populated `tasks.md`. The brief transitions from `ready` to `active` at the start, and from `active` to `completed` at the end.

### Verify

Check the result against two dimensions: brief compliance (did we build what we said we would?) and convention compliance (does the code follow skill principles and project patterns?).

**Input:** An active brief with completed tasks.
**Output:** A pass/fail assessment with specific findings.

### Complete

Close out the feature. Write a summary of what was built and key decisions made. The summary becomes project knowledge that future briefs can reference.

**Input:** A verified feature.
**Output:** A summary in `brief.md` frontmatter. The brief transitions to `completed`.

## Brief anatomy

A brief is a directory under `.fledge/briefs/` containing three files:

```
.fledge/briefs/<feature-name>/
  brief.md      what, why, scope, design decisions (product-level)
  spec.md       data models, APIs, external services (technical context)
  tasks.md      tasks (populated during build phase)
```

### brief.md

The product-level description of the feature. Frontmatter is managed by CLI commands. The markdown body captures what the feature is, why it matters, what is in scope, and key design decisions.

```yaml
---
name: recipe-versioning
status: draft
created: 2026-03-26
updated: 2026-03-26
summary: '' # written during complete phase
---
```

### spec.md

Technical context written during the enrich step. Captures how the feature connects to the existing system: relevant data models, APIs, external services, and domain concepts. This file starts empty and is populated by the brief skill during enrichment.

### tasks.md

Tasks populated by the build skill. Each task has a status that tracks its lifecycle.

```yaml
---
tasks:
  - name: Add versions relation to recipe model
    group: backend
    status: pending
  - name: Create version history composable
    group: frontend
    status: pending
---
```

## Brief states

A brief moves through five states:

| State       | Meaning                                               | Owner       |
| ----------- | ----------------------------------------------------- | ----------- |
| `draft`     | Being written and enriched, not ready for work        | Brief skill |
| `ready`     | Fully designed and enriched, ready to build           | Brief skill |
| `active`    | Build in progress                                     | Build skill |
| `completed` | All tasks done, summary written                       | Build skill |
| `cancelled` | Feature dropped                                       | Any         |

## State transitions

```
draft ──→ ready ──→ active ──→ completed
  │         │         │
  │         │         └──→ cancelled
  │         ├──→ draft (rework)
  │         └──→ cancelled
  └──→ cancelled
```

| Transition           | Triggered by | What must be true                               | CLI command            |
| -------------------- | ------------ | ----------------------------------------------- | ---------------------- |
| `draft → ready`      | Brief skill  | Brief and spec are written                      | `fledge brief ready`   |
| `ready → active`     | Build skill  | Build is starting                               | `fledge brief start`   |
| `ready → draft`      | Brief skill  | Brief needs rework                              | (update frontmatter)   |
| `active → completed` | Build skill  | All tasks completed or skipped, summary written | `fledge brief complete`|
| `* → cancelled`      | Any          | Feature is being dropped                        | `fledge brief cancel`  |

## Task states

Each task in `tasks.md` has a status:

| Status      | Indicator | Meaning                                 |
| ----------- | --------- | --------------------------------------- |
| `pending`   | `[ ]`     | Defined but not started                 |
| `active`    | `[~]`     | Currently being worked on               |
| `completed` | `[x]`     | Done                                    |
| `skipped`   | `[-]`     | Deliberately dropped (no longer needed) |

A brief can only be completed when all tasks are either `completed` or `skipped`.

## Project knowledge

Project knowledge lives in `.fledge/project.md`. This file describes the project landscape: domain concepts, data models, APIs, external services, conventions, and the technology stack with installed skills.

Run `fledge init` to create the file with a template. The content is filled in by the developer or by a future initialization skill.

### Sections

| Section              | What it captures                                                    |
| -------------------- | ------------------------------------------------------------------- |
| **Domain**           | Key concepts and terminology used in the project                    |
| **Data models**      | Entities, relationships, and key fields                             |
| **APIs**             | Endpoint patterns, conventions, authentication approach             |
| **External services**| Third-party integrations and what they are used for                 |
| **Conventions**      | Project-specific patterns not covered by technology skills          |
| **Stack**            | Technology stack and installed Fledge technology skills              |

### Keeping project knowledge current

`project.md` is a living document maintained through normal workflow usage:

| When             | Who         | What                                                                |
| ---------------- | ----------- | ------------------------------------------------------------------- |
| During enrich    | Brief skill | Flags gaps: models, endpoints, or concepts missing from project.md  |
| During complete  | Build skill | Updates project.md with new models, APIs, and concepts added by the feature |

This means every feature that goes through the workflow also maintains the project knowledge. No separate maintenance task needed.

## Skill responsibilities

Two skills own the workflow, each responsible for specific phases and transitions:

### Brief skill (`fledge-brief`)

Owns the **Brief** and **Enrich** phases. Responsible for:

- Gathering context (completed briefs, codebase exploration)
- Drafting the brief (what, why, scope, design decisions)
- Enriching with project knowledge (reading `project.md`, walking through each section)
- Writing `spec.md`
- Flagging gaps in `project.md` discovered during enrichment
- Transitioning `draft → ready`

The brief skill does **not** create tasks. It produces the product-level brief and technical spec that the build skill consumes.

### Build skill (`fledge-build`, future)

Owns the **Build**, **Verify**, and **Complete** phases. Responsible for:

- Reading the enriched brief and spec
- Discovering installed technology skills (from the Stack section of `project.md`)
- Breaking work into concrete tasks in `tasks.md`
- Executing tasks guided by the relevant technology skill
- Verifying the result against the brief and conventions
- Writing the completion summary
- Updating `project.md` with new models, APIs, and concepts introduced by the feature
- Transitioning `ready → active → completed`
