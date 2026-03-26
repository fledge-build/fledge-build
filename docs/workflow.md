# Workflow

The Fledge workflow structures feature development from idea to implementation. It is the bridge between knowing what to build and having it built correctly.

## Phases

```
Brief  →  Enrich  →  Implement  →  Verify  →  Complete
```

The workflow is fluid, not linear. Implementation may reveal design gaps that flow back into the brief. The sequence is a default, not a gate.

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

### Implement

Plan and execute the work. The implement skill reads the enriched brief, discovers installed technology skills, and breaks the feature into concrete tasks. Tasks are informed by both the domain context (spec) and the technology skills (which know how to decompose work for their stack).

After planning, tasks are executed one by one, guided by the relevant technology skill.

**Input:** A ready brief with spec.
**Output:** Working code and a populated `tasks.md`. The brief transitions from `ready` to `active` at the start, and from `active` to `completed` at the end.

### Verify

Check the implementation against two dimensions: brief compliance (did we build what we said we would?) and convention compliance (does the code follow skill principles and project patterns?).

**Input:** An active brief with completed tasks.
**Output:** A pass/fail assessment with specific findings.

### Complete

Close out the feature. Write a summary of what was built and key decisions made. The summary becomes project knowledge that future briefs can reference.

**Input:** A verified implementation.
**Output:** A summary in `brief.md` frontmatter. The brief transitions to `completed`.

## Brief anatomy

A brief is a directory under `.fledge/briefs/` containing three files:

```
.fledge/briefs/<feature-name>/
  brief.md      what, why, scope, design decisions (product-level)
  spec.md       data models, APIs, external services (technical context)
  tasks.md      implementation tasks (populated during implement phase)
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

Implementation tasks populated by the implement skill. Each task has a status that tracks its lifecycle.

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

| State       | Meaning                                            | Owner           |
| ----------- | -------------------------------------------------- | --------------- |
| `draft`     | Being written and enriched, not ready for work     | Brief skill     |
| `ready`     | Fully designed and enriched, ready for implementation | Brief skill     |
| `active`    | Implementation in progress                         | Implement skill |
| `completed` | All tasks done, summary written                    | Implement skill |
| `cancelled` | Feature dropped                                    | Any             |

## State transitions

```
draft ──→ ready ──→ active ──→ completed
  │         │         │
  │         │         └──→ cancelled
  │         ├──→ draft (rework)
  │         └──→ cancelled
  └──→ cancelled
```

| Transition            | Triggered by    | What must be true                                 | CLI command            |
| --------------------- | --------------- | ------------------------------------------------- | ---------------------- |
| `draft → ready`       | Brief skill     | Brief and spec are written                        | `fledge brief ready`   |
| `ready → active`      | Implement skill | Implementation is starting                        | `fledge brief start`   |
| `ready → draft`       | Brief skill     | Brief needs rework                                | (update frontmatter)   |
| `active → completed`  | Implement skill | All tasks completed or skipped, summary written   | `fledge brief complete`|
| `* → cancelled`       | Any             | Feature is being dropped                          | `fledge brief cancel`  |

## Task states

Each task in `tasks.md` has a status:

| Status      | Indicator | Meaning                                      |
| ----------- | --------- | -------------------------------------------- |
| `pending`   | `[ ]`     | Defined but not started                      |
| `active`    | `[~]`     | Currently being worked on                    |
| `completed` | `[x]`     | Done                                         |
| `skipped`   | `[-]`     | Deliberately dropped (no longer needed)      |

A brief can only be completed when all tasks are either `completed` or `skipped`.

## Skill responsibilities

Two skills own the workflow, each responsible for specific phases and transitions:

### Brief skill (`fledge-brief`)

Owns the **Brief** and **Enrich** phases. Responsible for:

- Gathering context (completed briefs, codebase exploration)
- Drafting the brief (what, why, scope, design decisions)
- Enriching with project knowledge (data models, APIs, domain context)
- Writing `spec.md`
- Transitioning `draft → ready`

The brief skill does **not** create implementation tasks. It produces the product-level brief and technical spec that the implement skill consumes.

### Implement skill (future)

Owns the **Implement**, **Verify**, and **Complete** phases. Responsible for:

- Reading the enriched brief and spec
- Discovering installed technology skills
- Breaking work into concrete tasks in `tasks.md`
- Executing tasks guided by the relevant technology skill
- Verifying implementation against the brief and conventions
- Writing the completion summary
- Transitioning `ready → active → completed`
