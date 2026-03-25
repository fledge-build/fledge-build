# Roadmap

## Vision

AI-assisted development is only as good as the workflow it operates within. Most teams have great AI tools but no AI-native workflow. Fledge structures the development process so that AI works with team principles, not against them.

The core idea is the **what/how split**:

- **"The what"** -- what to build. Structured specs, requirements, design decisions. Handled by [OpenSpec](https://openspec.dev/), an open-source spec-driven workflow engine.
- **"The how"** -- how to build it. Technology-specific conventions, project knowledge, implementation guidance. Handled by Fledge.

Fledge does not build its own workflow engine. It embraces OpenSpec for the planning and specification layer, and focuses on what only Fledge can provide: technology skills that guide implementation, project knowledge that enriches specifications, and the bridge between the two.

## Strategy

These principles guide what Fledge builds and how:

- **Embrace, don't rebuild.** OpenSpec provides a proven, agent-agnostic workflow engine with an active user base. Fledge extends it through OpenSpec's schema customization system rather than building a competing workflow layer.
- **Skills as infrastructure.** Prompt engineering is team infrastructure, not personal skill. Skills live in the repo, are versioned, and travel with the project.
- **Progressive adoption.** Every package delivers standalone value. Technology skills work without the workflow layer. The full workflow emerges naturally as more pieces are adopted.
- **Technology-aware, not technology-agnostic.** Generic tools produce generic results. Fledge ships opinionated, technology-specific skills that guide agents through implementation decisions.
- **No runtime.** No daemon, no server, no proprietary format. Everything is files the agent reads and conventions the agent follows.
- **Design over implementation time.** Spending more time on design and specification makes implementation straightforward for agents.

## How Fledge and OpenSpec work together

OpenSpec manages the workflow: propose changes, write specs, design solutions, break into tasks, apply, verify, archive. Fledge customizes this workflow through a custom OpenSpec schema that adds:

1. **Enrichment.** An artifact that connects raw specs to project knowledge (data models, domain context, existing patterns) before implementation begins.
2. **Skill-guided apply.** A customized apply template that instructs the agent to discover and follow installed technology skills during implementation.
3. **Convention-aware verification.** A customized verify template that checks both spec compliance and adherence to the technology skill's conventions.

The developer experience:

```
/opsx:explore "recipe versioning"        <- OpenSpec: investigate the idea
/opsx:propose "recipe-versioning"        <- OpenSpec: produce specs, design, tasks
                                            Fledge: enrichment connects to project knowledge
/opsx:apply                              <- OpenSpec: execute tasks
                                            Fledge: technology skill guides implementation
/opsx:verify                             <- OpenSpec: check completeness
                                            Fledge: check convention compliance
/opsx:archive                            <- OpenSpec: merge specs, archive change
```

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

### Phase 2: OpenSpec integration

Adopt OpenSpec as the workflow engine and build the Fledge-specific customization layer.

- [ ] Evaluate OpenSpec in practice on a real project (coexistence first, no customization)
- [ ] Design the Fledge OpenSpec schema: enrichment artifact, customized apply and verify templates
- [ ] Define what project knowledge the enrichment artifact needs and how it discovers it
- [ ] Ship the Fledge schema as part of the toolset (installable alongside technology skills)

### Phase 3: Project initialization

An initialization skill that prepares a project for the Fledge workflow. The agent discovers the project's codebase and produces structured configuration that the enrichment artifact and technology skills consume.

> **Dependency:** Phase 2 (OpenSpec integration) must be designed first, because initialization produces the configuration that the workflow and enrichment consume.

- [ ] Initialization as a skill (agent-driven discovery, not a CLI scaffold)
- [ ] Discover and register project knowledge sources (data models, domain glossary, API conventions)
- [ ] Connect installed technology skills to project context
- [ ] Write OpenSpec project configuration with structured context derived from the codebase
- [ ] Set the Fledge schema as the default OpenSpec schema for the project

### Phase 4: Project scaffolding

Agent-based scaffolding for new projects. Runs before a project exists, installed globally so it's available from any directory.

- [ ] Scaffolding skill that guides the agent through project setup interactively (what are we building, which technologies)
- [ ] Scaffolds project structure, generates `package.json`, installs OpenSpec and Fledge technology packages
- [ ] Auto-runs project initialization (Phase 3) after scaffolding completes
- [ ] Global install mechanism (user-level, not project-level)

### Phase 5: Quality gates

Testing and review guidance baked into technology skills and the Fledge OpenSpec schema.

- [ ] Testing principles per technology skill (what to test, how to structure tests, deterministic over brittle)
- [ ] Customized verify template that checks convention compliance alongside spec compliance
- [ ] Review guidance: separation of generation and review, multi-pass review patterns
- [ ] Context management guidance (when to clear context, how to keep agent reasoning sharp across long tasks)

### Phase 6: Interactive onboarding

A skill that guides new engineers through the project interactively. The agent reads the installed technology skills, project knowledge, and OpenSpec specs, then runs a conversation adapted to what the engineer already knows.

- [ ] Onboarding skill with a decision tree for how to run the conversation (what to cover first, how to assess existing knowledge, when to go deeper)
- [ ] Draws from existing skills, project knowledge, and archived specs at conversation time
- [ ] Adapts depth and examples based on the engineer's background
- [ ] Uses real code from the project for examples rather than abstract illustrations

### Phase 7: Technology expansion

Additional technology skills following the established design principles.

- [ ] Identify the next technology to cover based on project needs
- [ ] Apply the skill design guide to ensure consistency across skills
- [ ] Validate that cross-cutting concerns (testing, error handling) work when expressed per technology

### Open questions

**Skill inheritance.** Teams can already build their own skills following the [skill design principles](docs/skill-design.md). The three-layer model handles overlap: a team's skill owns its own principles, and project conventions handle project-specific decisions. An open question is whether skills can be extended rather than forked, letting a team skill say "start from `@fledge/vue` but override these specific branches." This would keep team skills lean and automatically pick up upstream improvements. Whether this is reliable in practice (skills are markdown read by an agent, not code with an inheritance model) needs exploration.

**Installing skills from repositories.** The `fledge install-skill` command currently works with npm packages. Supporting direct installation from a git repository would make it easier for teams to create and share custom skills without publishing to npm.
