# Fledge

Agent-powered development workflows. From spec to implementation: scaffolding, spec-driven design, and stack-aware agent tooling in one coherent system.

## Why this exists

Agents (like Claude Code) automatically select a skill when a task matches its description and inject its content into the conversation. This makes skills the right place to encode coding principles, conventions, and architectural decisions. They are picked up without the engineer needing to prompt for them.

The goals of this repository are:

- **Consistency** -- shared skills mean agents apply the same principles across every project and every engineer, reducing drift in code style, patterns, and architecture decisions
- **Speed through predictability** -- higher-quality and more consistent outputs reduce review friction, rework, and the need to correct agents mid-task
- **Forward-looking** -- this repository defines principles for a future go-to stack. It is not intended to retrofit every existing project. Skills are iterated here until they reliably produce the output we want, then adopted in new and evolving projects.

## How it works

Each skill package under `packages/` ships a single skill. On `postinstall`, the `fledge` binary (provided by `@fledge/cli`) copies the skill directory into the consuming project, namespaced by package name (e.g. `fledge-vue`). A `.gitignore` is written into the installed directory so the files are not committed in the consuming project.

```
packages/vue/
  skill/
    SKILL.md                  <- skill entry point (name, description)
    component-types.md
    composable-principles.md
    ...
  package.json                <- postinstall: fledge install-skill
```

## Packages

| Package        | Type             | Description                                            |
| -------------- | ---------------- | ------------------------------------------------------ |
| `@fledge/cli` | Shared library   | Install utilities, shared primitives for skill packages |
| `@fledge/vue`  | Skill package    | Vue conventions, component patterns, data fetching     |

## Status

Early stage. The focus right now is on `@fledge/vue` as the first skill package, to establish what works well before expanding to other technologies.

## Using in a project

```bash
pnpm add -D @fledge/vue
```

The skill is installed automatically via `postinstall` and available to agents immediately.

## Skill design principles

### One skill per package

Each package provides exactly one skill. A skill maps to one distinct task type. Agents select a single skill per task based on its description, so every skill must be self-contained: it should carry all the knowledge agents need to complete the task, without relying on another skill being loaded alongside it.

A useful test: if you can write a clear, non-overlapping description for a skill, the scope is right. If two skills would both match the same task, or if a task requires knowledge from two separate skills to be done correctly, the split is wrong.

### Structure

A skill is an entry point (`SKILL.md`) that orients agents, backed by referenced files for depth. The entry point should cover:

- **What the task is** -- frames what the agent is about to do
- **What rules apply** -- the constraints and conventions
- **What good looks like** -- concrete examples of correct output
- **How to make decisions** -- guidance through the key decision points the agent will encounter, so the outcome is consistent rather than left to inference

The last point is the most important. Rules tell the agent what is correct; decision guidance tells the agent how to get there. A skill that only lists rules leaves too much to interpretation.

## Releases

Packages are published to npm under the `@fledge` scope. Releases are managed with [Changesets](https://github.com/changesets/changesets) and automated via CI on every merge to `main`.

### Adding a changeset to your PR

Whenever your PR changes something in a published package (e.g. `@fledge/vue`), add a changeset:

```bash
pnpm changeset
```

The CLI will ask you:
1. **Which packages changed** -- select the relevant package(s)
2. **Bump type** -- `patch` for fixes/content tweaks, `minor` for new skills or meaningful additions, `major` for breaking changes
3. **Summary** -- a short description of what changed (this goes into the CHANGELOG)

This generates a `.changeset/*.md` file. Commit it alongside your other changes as part of the PR.

> If your PR only touches non-published files (playgrounds, root config, etc.), no changeset is needed.

### What happens after merging

When a PR with pending changesets is merged to `main`, the [changesets GitHub action](https://github.com/changesets/action) opens a "Version Packages" PR that bumps package versions and updates `CHANGELOG.md`. Merging that PR triggers the publish to npm.

No manual release steps are required.

### Bump type guide

| Change                                                          | Bump    |
| --------------------------------------------------------------- | ------- |
| Fixing incorrect skill content                                  | `patch` |
| Adding a new reference file to an existing skill                | `patch` |
| Changing the install mechanism or skill structure in a breaking way | `major` |

## Contributing

### Editing a skill

Skill files are the source of truth for conventions. When a principle changes, a new pattern is adopted, or a gap is identified, update the relevant skill file. Test the change in the playground before treating it as settled.

When writing skill content, prefer decision guidance over rules. Tell the agent how to choose, not just what is correct.

### Adding a skill package

Packages are scoped by technology or domain. Everything Vue-related lives in `@fledge/vue`, a backend skill would be its own package, and so on. The practical benefit is selective installation: a project only installs the skills relevant to its stack.

1. Create a new directory under `packages/`
2. Add a `package.json` with `@fledge/cli` as a dependency and `"postinstall": "fledge install-skill"`
3. Add a `skill/` directory with at minimum a `SKILL.md`
4. Add a corresponding playground under `playgrounds/` with a `CLAUDE.md`

## Development

Each skill package has a corresponding playground under `playgrounds/`. A playground is a minimal app that mirrors a real consuming project, with the skill package linked as a workspace dependency. Each playground has a `CLAUDE.md` that tells Claude to treat it as an isolated project.

The playground is the primary environment for iterating on skills: open Claude from the playground directory, give it a realistic task, observe the output, and refine the skill content based on what you learn.

To sync the latest skill changes into the playground:

1. Edit skill files under `packages/<package>/skill/`
2. Run `pnpm install` from the **playground directory** (e.g. `playgrounds/vue`) to trigger the postinstall and sync skill files
3. Open Claude Code from the **playground directory**. Skills are picked up automatically
