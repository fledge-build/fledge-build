# Fledge

Technology skills and project knowledge for AI-assisted development. Pairs with [OpenSpec](https://openspec.dev/) for the full workflow: OpenSpec handles the "what" (specs, design, tasks), Fledge handles the "how" (technology-specific conventions, project context, implementation guidance).

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

Early stage. The focus right now is on `@fledge/vue` as the first skill package, to establish what works well before expanding to other technologies. See [ROADMAP.md](ROADMAP.md) for the full strategy and planned phases.

## Using in a project

```bash
pnpm add -D @fledge/vue
```

The skill is installed automatically via `postinstall` and available to agents immediately.

## Skill design principles

Skills are scoped by technology, not by cross-cutting concern. Each package provides exactly one self-contained skill. The skill encodes principles (non-negotiable conventions), recommends patterns (defaults for common problems), and defers to the project for implementation details (file structure, existing abstractions). Project patterns take precedence over skill recommendations when both exist.

The core of a skill is its decision tree: a step-by-step flow that walks the agent through the task, branching on real decisions and leading to focused reference files. Rules tell the agent what is correct; the decision tree tells the agent how to get there.

See [docs/skill-design.md](docs/skill-design.md) for the full guide on scoping, the three-layer model, decision tree design, and a worked example using `@fledge/vue`.

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
4. Add a corresponding playground under `playgrounds/` with agent configuration (e.g., `CLAUDE.md` or `AGENTS.md`)

## Development

Each skill package has a corresponding playground under `playgrounds/`. A playground is a minimal app that mirrors a real consuming project, with the skill package linked as a workspace dependency. Each playground has agent configuration that scopes it as an isolated project.

The playground is the primary environment for iterating on skills: open Claude from the playground directory, give it a realistic task, observe the output, and refine the skill content based on what you learn.

To sync the latest skill changes into the playground:

1. Edit skill files under `packages/<package>/skill/`
2. Run `pnpm install` from the **playground directory** (e.g. `playgrounds/vue`) to trigger the postinstall and sync skill files
3. Open your agent from the **playground directory**. Skills are picked up automatically
