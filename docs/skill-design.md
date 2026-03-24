# Skill Design Guide

This document defines how technical skills in Fledge are designed, scoped, and structured. It is the reference for anyone writing or extending a skill.

## What a skill is

A skill is a set of markdown files that encode conventions, principles, and decision guidance for a specific technology or domain. Agents load skills automatically when a task matches the skill's description. The skill's job is to make the agent produce output that is consistent with team standards, without the engineer needing to prompt for it.

A skill is not a tutorial, a reference manual, or a prompt template. It is decision infrastructure: it tells the agent how to think through the task, not just what the answer looks like.

## Scoping

### One skill per package

Each package provides exactly one skill. A skill maps to one distinct task type. Agents select a single skill per task based on its description, so every skill must be self-contained: it should carry all the knowledge agents need to complete the task, without relying on another skill being loaded alongside it.

A useful test: if you can write a clear, non-overlapping description for a skill, the scope is right. If two skills would both match the same task, or if a task requires knowledge from two separate skills to be done correctly, the split is wrong.

### Stack-scoped, not concern-scoped

Skills are scoped by technology, not by cross-cutting concern. Everything Vue-related (components, composables, data fetching, forms, testing) lives in `@fledge/vue`. There is no separate `@fledge/testing` or `@fledge/accessibility` skill.

This follows from the one-skill-per-task model. An agent building a Vue feature needs testing guidance in the same context as component guidance. Splitting concerns across skills would force the agent to combine knowledge from multiple sources, which is unreliable.

Cross-cutting concerns that apply to multiple technologies (e.g., "write deterministic tests tied to specific failure modes") may appear in multiple skill packages. This duplication is intentional, because the concrete guidance is technology-specific even when the principle is universal.

## The three layers

A skill operates within a layered system. Understanding where the skill's authority starts and stops is essential to writing good skill content.

| Layer              | Source          | What it defines                                           | Example                                                               |
| ------------------ | --------------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| **Principles**     | Skill           | Architectural rules and design constraints                | "Feature components own state, domain components don't"               |
| **Patterns**       | Skill + Project | Recommended approaches for common problems                | "Use TanStack Query for data fetching" (skill default, project may differ) |
| **Implementation** | Project         | Concrete structure, file locations, existing abstractions | "API client is at `src/api/client.ts`, auth is injected via provider" |

### What the skill owns

The skill owns **principles** fully. These are the non-negotiable conventions that define what "correct" means for the technology. A principle like "single state ownership" or "UI components have zero domain knowledge" is not something a project should override.

The skill **recommends patterns** as defaults. TanStack Query for data fetching, Zod for validation, reka-ui for primitives. These are the skill's opinion on the best approach. They apply when the project has no established alternative.

### What the skill defers to

The skill never assumes **implementation details**. It does not hardcode file paths, folder structures, or the names of existing abstractions. Instead, it instructs the agent to discover these from the project.

Good skill instruction: "Find the existing data fetching setup before creating a new one."
Bad skill instruction: "Import the API client from `src/api/client.ts`."

### When project and skill disagree

A project may have established patterns that differ from the skill's recommendations. The rule is: **project patterns take precedence over skill recommendations when both exist.** The skill is a default for greenfield decisions, not an override for established codebases.

The agent resolves this naturally: it reads the skill for principles, then reads the project for context. If the project already uses a custom fetching layer instead of TanStack Query, the agent should follow the project's approach while still applying the skill's principles (e.g., separation of concerns, error handling).

Principles, however, are not overridable. If a project violates a principle (e.g., a feature component that also renders UI primitives directly), the skill should guide the agent toward the correct pattern, not accommodate the violation.

## Project conventions

Projects can define their own conventions that extend or specialize a skill's guidance. These are not skill overrides; they are project-specific decisions that the skill's framework leaves open.

Examples of project conventions:
- Document each UI component in a `components.md` file
- Use a specific naming pattern for API query keys
- Require a Storybook story for every UI component
- Place feature composables in a `composables/` directory next to the feature

The skill should instruct the agent to look for and follow project conventions where they exist. A simple pattern: include a step in the skill's decision flow that says "check for project-level conventions before proceeding."

The mechanism for project conventions is whatever the team already uses: `CLAUDE.md`, a `conventions/` directory, inline comments, or existing code patterns. The skill does not prescribe the format, it just tells the agent to look.

## Skill structure

### Entry point

Every skill has a `SKILL.md` file. This is the entry point that agents load first. It should provide:

1. **Frontmatter** with a `name` and `description`. The description is what agents match against when selecting a skill. Write it to trigger on the right tasks and not trigger on the wrong ones.

2. **A decision tree**, not a flat list of rules. The decision tree walks the agent through the task step by step, branching based on the specific situation. Each branch leads to the right reference file for that scenario.

3. **Links to reference files** at each decision point. The entry point orients; the reference files provide depth.

### Decision tree design

The decision tree is the most important part of a skill. It encodes the thought process that an experienced developer would follow, making that process explicit and repeatable.

Design principles for decision trees:

- **Start with triage.** The first question should determine the scope and nature of the task. This prevents the agent from diving into details before understanding the big picture.

- **Branch on real decisions.** Each branch point should represent a genuine fork where the approach changes. "Is this a component or a logic unit?" is a real decision. "Is this important?" is not.

- **Lead to concrete guidance.** Every path through the tree should end at a reference file with specific, actionable instructions. A branch that ends with "use good judgment" has failed.

- **Include the full-feature path.** When a task spans multiple concerns, the tree should guide the agent through planning before execution: map the hierarchy, audit what exists, produce a checklist, execute bottom-up.

- **Keep it shallow.** Three to five decision points is usually enough. Deeper trees suggest the skill is trying to cover too many distinct task types.

### Reference files

Reference files provide the depth behind each branch of the decision tree. Each file covers one focused topic (e.g., component types, data fetching patterns, form handling).

A good reference file:
- **Leads with the decision guidance**, not the rules. How to choose, then what to do.
- **Covers the why** behind each convention. An agent that understands the reasoning handles edge cases better than one that memorizes rules.
- **Includes anti-patterns** alongside correct patterns. Showing what not to do is often more instructive than showing what to do.
- **Is self-contained** for its topic. The agent should not need to cross-reference multiple files to handle a single decision.

## Worked example: `@fledge/vue`

The Vue skill demonstrates these principles in practice.

**Scoping:** Everything Vue-related in one package. Components, composables, data fetching, forms, and styling are all covered because they all appear in the same task type ("build a Vue feature").

**Decision tree:** The `SKILL.md` starts with triage (targeted task vs. full feature), then branches on what is being touched (component vs. logic unit), then narrows to the specific type (UI, domain, feature, view, or composable type). Each path ends at a reference file.

**Layers in practice:**
- Principles (skill-owned): component type classification, single state ownership, v-model conventions
- Patterns (skill-recommended): TanStack Query for data fetching, reka-ui for primitives, CVA for variants
- Implementation (project-derived): where components live, what the existing API client looks like, which design tokens exist

**Project convention awareness:** The decision tree includes an "audit existing" step and a "check design tokens" step that require the agent to read the project before writing code. The skill tells the agent what to look for without assuming what it will find.

## Future considerations

### Installing skills from repositories

The `fledge install-skill` command currently installs skills from npm packages via postinstall. A future extension could support pulling skills directly from a git repository, making it easier for teams to create and share custom skills without publishing to npm.

### Composition across skills

For full-stack feature implementation, a project may have multiple skills installed (e.g., `@fledge/vue` and a future `@fledge/api`). While each skill is self-contained per task, the project's CLAUDE.md or conventions could document which skills are relevant for which scenarios, helping engineers (and agents) understand the full picture.
