# Roadmap

## Vision

AI-assisted development is only as good as the workflow it operates within. Most teams have great AI tools but no AI-native workflow. Fledge structures the entire development process so that AI works with team principles, not against them.

The core idea is the **what/how split**. Every step belongs to one of two layers:

- **Workflow layer ("the what")** -- requirements, spec, enriched spec. Universally applicable, stack-independent.
- **Technical layer ("the how")** -- API contract, implementation. Stack-specific, guided by technology skills.

The contract boundary between these layers is the architectural seam. The workflow layer produces a precise description of what to build. The technical layer, powered by skills, produces the implementation.

## Strategy

These principles guide what Fledge builds and how:

- **Spec-first, not prompt-first.** Work starts with a structured spec, not a freeform conversation. The spec is the source of truth.
- **Skills as infrastructure.** Prompt engineering is team infrastructure, not personal skill. Skills live in the repo, are versioned, and travel with the project.
- **Progressive adoption.** Every package delivers standalone value. The full workflow emerges naturally as more pieces are adopted.
- **Technology-aware, not technology-agnostic.** Generic tools produce generic results. Fledge ships opinionated, technology-specific skills alongside a universal workflow core.
- **No runtime.** No daemon, no server, no proprietary format. Everything is files the agent reads and conventions the agent follows.
- **Design over implementation time.** Spending more time on design and specification makes implementation straightforward for agents. The toolset reflects this by investing heavily in the workflow layer.

## Current state

The foundation is being established with `@fledge/vue` as the first technology skill. The focus is on proving that skills can reliably produce consistent, high-quality output for a specific technology before expanding scope.

What exists today:

- `@fledge/cli` -- install mechanism for skill packages
- `@fledge/vue` -- Vue skill covering components, composables, data fetching, forms, and styling
- Skill design principles formalized in [docs/skill-design.md](docs/skill-design.md)
- Playground-driven development workflow for iterating on skills
- CI/CD pipeline with changesets for versioning and publishing

## Roadmap

### Phase 1: Foundation

Establish the skill model and prove it works.

- [x] Skill install mechanism (`@fledge/cli`)
- [x] First technology skill (`@fledge/vue`) with decision tree structure
- [x] Playground for iterating on skills
- [x] Skill design principles documented
- [x] CI/CD pipeline with automated releases
- [ ] Validate skill effectiveness through real project usage
- [ ] Refine the three-layer model (principles, patterns, implementation) based on practical experience

### Phase 2: Project initialization

A project needs more than installed skill files to work effectively with Fledge. The agent needs to know what skills are available, what workflow to follow, and where project knowledge lives (data models, domain glossary, API conventions). This phase establishes the wiring between skills, workflow, and project context.

> **Dependency:** The workflow layer (Phase 3) must be designed before initialization can be implemented, because initialization produces the configuration that the workflow consumes. The recommended approach is to design the workflow layer first (spec format, steps, required project context), then implement initialization to produce what the workflow expects, then implement the workflow itself.

- [ ] Define what project initialization produces (agent configuration, directory structure, or both)
- [ ] Connect installed skills to project context so agents discover them naturally
- [ ] Register project knowledge sources (data models, domain glossary, API conventions) so skills can reference them
- [ ] Decide whether initialization is a skill, a CLI command, or a documented manual setup

### Phase 3: Workflow layer

The spec-driven design pipeline. Technology-independent, works with any technology skill. The design of this phase is a prerequisite for Phase 2 (initialization), since the workflow defines what project context it needs and how it discovers installed skills.

- [ ] Structured spec format (requirements, spec, enriched spec, contract)
- [ ] Agent commands for the design workflow (interactive spec refinement, contract generation)
- [ ] Integration between workflow output (contract) and technology skills (implementation)

### Phase 4: Project scaffolding

Agent-based scaffolding for new projects. Runs before a project exists, installed globally so it's available from any directory.

- [ ] `/fledge:scaffold` command that guides the agent through project setup interactively (what are we building, which stack)
- [ ] Scaffolds project structure, generates `package.json`, installs workflow and technology packages
- [ ] Auto-runs project initialization (Phase 2) after scaffolding completes
- [ ] Global install mechanism (user-level, not project-level)

### Phase 5: Quality gates

Skills and workflow currently focus on generation. This phase adds guidance for verification, review, and testing.

- [ ] Testing principles per technology skill (what to test, how to structure tests, deterministic over brittle)
- [ ] Separation of generation and review (different agent modes or passes for writing code vs. reviewing it)
- [ ] Review checklists or multi-pass review guidance baked into skills
- [ ] Context management guidance (when to clear context, how to keep agent reasoning sharp across long tasks)

### Phase 6: Interactive onboarding

A skill that guides new engineers through the project interactively. Instead of static documentation, the agent reads the installed technology skills, project knowledge, and workflow configuration, then runs a conversation adapted to what the engineer already knows.

- [ ] Onboarding skill with a decision tree for how to run the conversation (what to cover first, how to assess existing knowledge, when to go deeper)
- [ ] The skill reads existing skills and project knowledge at conversation time, no content to maintain separately
- [ ] Adapts depth and examples based on the engineer's background (e.g., senior Vue developer vs. someone new to the technology)
- [ ] Uses real code from the project for examples rather than abstract illustrations

### Phase 7: Technology expansion

Additional technology skills following the established design principles.

- [ ] Identify the next technology to cover based on project needs
- [ ] Apply the skill design guide to ensure consistency across skills
- [ ] Validate that cross-cutting concerns (testing, error handling) work when expressed per technology

### Open questions

**Skill inheritance.** Teams can already build their own skills following the [skill design principles](docs/skill-design.md). The three-layer model handles overlap: a team's skill owns its own principles, and project conventions handle project-specific decisions. An open question is whether skills can be extended rather than forked, letting a team skill say "start from `@fledge/vue` but override these specific branches." This would keep team skills lean and automatically pick up upstream improvements. Whether this is reliable in practice (skills are markdown read by an agent, not code with an inheritance model) needs exploration.

**Installing skills from repositories.** The `fledge install-skill` command currently works with npm packages. Supporting direct installation from a git repository would make it easier for teams to create and share custom skills without publishing to npm.
