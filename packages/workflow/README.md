# @fledge/workflow

Workflow skills for the [Fledge](https://github.com/fledge-build/fledge-build) development workflow. Provides agent skills that guide feature planning, brief creation, and lifecycle management.

## Install

```bash
pnpm add -D @fledge/workflow
```

On install, skills are automatically copied into your project's `.claude/skills/` directory. Skills bundle self-contained scripts with all dependencies inlined, so no additional packages are needed at runtime.

## Skills

### `fledge-brief`

Guides the agent through feature brief creation and lifecycle. Invoked directly:

```
/fledge-brief
```

The skill walks through:

1. **New brief** -- gather context from completed briefs, define requirements, break down into tasks
2. **Continue a brief** -- review progress, update tasks, revise scope
3. **Complete a brief** -- write a summary, validate, and mark as done

The skill includes bundled scripts for brief lifecycle operations. All artifacts are plain markdown files with YAML frontmatter, stored in `.fledge/briefs/`.

## Dependencies

| Package       | Role                                                                 |
| ------------- | -------------------------------------------------------------------- |
| `@fledge/cli` | Build-time dependency. Bundled into self-contained scripts via rolldown |
