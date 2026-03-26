# @fledge/cli

CLI tooling for the [Fledge](https://github.com/fledge-build/fledge-build) development workflow. Provides the `fledge` binary for managing skill packages and feature briefs.

## Install

As a project dependency (most common):

```bash
pnpm add -D @fledge/cli
```

## Commands

### `fledge skills install [source]`

Installs skills from a package into the project's skills directory. Supports two layouts:

- **Single skill**: a `skill/` directory in the package. Installed as `<prefix>` (e.g. `@fledge/vue` becomes `fledge-vue`).
- **Multiple skills**: a `skills/` directory with subdirectories. Each subdirectory is installed as `<prefix>-<name>` (e.g. `@fledge/workflow/skills/brief` becomes `fledge-workflow-brief`).

The skill name in SKILL.md frontmatter is updated to match the installed directory name. A `.gitignore` is written so the installed files are not committed.

Typically called from a skill package's `postinstall` script:

```json
{
  "dependencies": {
    "@fledge/cli": "..."
  },
  "scripts": {
    "postinstall": "fledge skills install"
  }
}
```

| Option     | Description                                          |
| ---------- | ---------------------------------------------------- |
| `--target` | Target directory to install into (defaults to project root) |
| `--global` | Install to the home directory instead of the project |

### `fledge skills list`

Lists all installed skills with their name, type, and description. Reads SKILL.md frontmatter from each installed skill directory.

```bash
fledge skills list
fledge skills list --type technology
```

Example output:

```
fledge-vue             technology  Vue conventions
fledge-workflow-brief  workflow    Brief lifecycle
```

| Option     | Description                                          |
| ---------- | ---------------------------------------------------- |
| `--type`   | Filter by skill type from SKILL.md metadata (e.g. "technology", "workflow") |
| `--global` | List globally installed skills instead of project-local |

### `fledge brief create <name>`

Creates a new brief directory at `.fledge/briefs/<name>/` with stub files for `brief.md` and `tasks.md`. The brief starts in `draft` status.

```bash
fledge brief create recipe-versioning
```

### `fledge brief start <name>`

Transitions a brief from `draft` to `active`. Validates that the brief has at least one task defined in `tasks.md` before allowing the transition.

```bash
fledge brief start recipe-versioning
```

### `fledge brief complete <name>`

Transitions a brief from `active` to `completed`. Validates that all tasks are marked as done before allowing the transition.

```bash
fledge brief complete recipe-versioning
```

### `fledge brief archive <name>`

Transitions a brief from `completed` to `archived`.

```bash
fledge brief archive recipe-versioning
```

### `fledge brief status <name>`

Shows the current status of a brief, including task progress grouped by group.

```bash
fledge brief status recipe-versioning
```

Example output:

```
recipe-versioning [active] 1/4 tasks done

backend
  [x] Add version column to recipes table
  [ ] Create migration script
frontend
  [ ] Create version history composable
  [ ] Add version badge to recipe card
```

### `fledge brief list`

Lists all briefs with their status and task progress.

```bash
fledge brief list
```

Example output:

```
recipe-versioning  active      1/4 tasks
recipe-sharing     draft       0/2 tasks
meal-planning      archived    6/6 tasks
```

### `fledge brief validate <name>`

Runs schema validation on a brief's `brief.md` and `tasks.md` frontmatter without changing state. Reports all validation errors.

```bash
fledge brief validate recipe-versioning
```

### `fledge brief schema`

Outputs the JSON Schema for `brief.md` and `tasks.md` frontmatter. Useful for agents that need to understand the expected file format.

```bash
fledge brief schema
```

## Brief lifecycle

Briefs follow a linear state machine. The CLI enforces valid transitions and runs validation checks at each transition.

```
draft  -->  active  -->  completed  -->  archived
```

| Transition              | Command                   | Validation                       |
| ----------------------- | ------------------------- | -------------------------------- |
| (new) to `draft`        | `fledge brief create`     | Name must not already exist      |
| `draft` to `active`     | `fledge brief start`      | At least one task must be defined |
| `active` to `completed` | `fledge brief complete`   | All tasks must be done           |
| `completed` to `archived` | `fledge brief archive`  | None                             |

## Brief file format

Briefs live in `.fledge/briefs/<name>/` and consist of two files:

### `brief.md`

```markdown
---
name: recipe-versioning
status: draft
created: 2026-03-26
updated: 2026-03-27
---

Requirements, design decisions, and context go here as freeform markdown.
```

### `tasks.md`

```markdown
---
tasks:
  - name: Add version column to recipes table
    group: backend
    done: false
  - name: Create version history composable
    group: frontend
    done: true
---

Optional notes and implementation details go here as freeform markdown.
```

| Field   | Type    | Required | Description                      |
| ------- | ------- | -------- | -------------------------------- |
| `name`  | string  | yes      | The task name                    |
| `group` | string  | no       | Grouping label (e.g. "backend") |
| `done`  | boolean | yes      | Whether the task is complete     |
