# Roadmap

## Vision

AI-assisted development is only as good as the workflow it operates within. Most teams have great AI tools but no AI-native workflow. Fledge structures the development process so that AI works with team principles, not against them.

The core idea is the **what/how split**:

- **"The what"** -- what to build. Feature-driven briefs that capture intent, requirements, and design decisions. Enriched with project knowledge before implementation begins.
- **"The how"** -- how to build it. Technology-specific skills that guide agents through implementation decisions using decision trees, conventions, and patterns.

Between the two sits **project knowledge**: a living understanding of the system (data models, domain glossary, API conventions, architecture decisions) that bridges the gap. The workflow layer produces feature briefs enriched by project knowledge. The technology skills consume those briefs and produce implementation that follows team conventions.

## Strategy

These principles guide what Fledge builds and how:

- **Feature-driven, not domain-driven.** Work is organized around features, not system domains. A feature brief captures one user-facing change end-to-end (frontend, backend, data model). Domain-level understanding lives in project knowledge, not in the workflow artifacts.
- **Skills as infrastructure.** Prompt engineering is team infrastructure, not personal skill. Skills live in the repo, are versioned, and travel with the project.
- **Project knowledge as a living system.** The agent's understanding of the project is not a static config file. It is structured, discoverable, and maintained as the project evolves. Initialization creates it, the workflow consumes it, and completed features feed back into it.
- **Progressive adoption.** Every package delivers standalone value. Technology skills work without the workflow layer. The full workflow emerges naturally as more pieces are adopted.
- **Technology-aware, not technology-agnostic.** Generic tools produce generic results. Fledge ships opinionated, technology-specific skills that guide agents through implementation decisions.
- **Fluid, not linear.** The workflow supports exploration, iteration, and revision. Feature briefs can be refined during implementation. Rigid phase gates do not reflect how real work happens.
- **Human-in-the-loop, not human-at-the-end.** The agent drives the conversation, but the human makes the decisions. Workflow skills are interactive: they ask questions, propose options, and wait for direction. Because all artifacts are plain files, the human can also edit outside the agent conversation at any time. The agent assists; the human owns the outcome. To keep this efficient, the agent should make obvious decisions autonomously and present remaining choices as specific options rather than open-ended questions.
- **No runtime.** No daemon, no server, no proprietary format. Everything is files the agent reads and conventions the agent follows. The CLI has no dependency on agent capabilities.
- **Design over implementation time.** Spending more time on design and specification makes implementation straightforward for agents.

## The workflow

The developer experience, from idea to implementation:

```
Explore       <- Investigate the idea, understand the codebase, clarify scope
Brief         <- Produce a feature brief: requirements, design, tasks
Enrich        <- Connect the brief to project knowledge (data models, conventions, existing patterns)
Implement     <- Execute tasks, guided by technology skills
Verify        <- Check completeness against the brief and convention compliance
Archive       <- Store the completed brief for future reference
```

The workflow is fluid. Steps can be revisited: implementation may reveal design gaps, which flow back into the brief. Exploration may happen at any point. The sequence is a default, not a gate.

Two systems support the workflow:

```
Project knowledge (living, maintained)       Feature briefs (per feature, archived)
├── data models                              ├── recipe-versioning/
├── domain glossary                          │   ├── requirements.md
├── API conventions                          │   ├── brief.md
├── architecture decisions                   │   ├── enriched-brief.md
└── installed skills + conventions           │   └── contract.md
                                             └── recipe-sharing/
                                                 └── ...
```

## Package architecture

Two types of packages, one clear boundary: the CLI handles mechanical operations (files, directories, scaffolding), skills handle tasks that require understanding and judgment (writing briefs, exploring code, verifying implementation).

```
packages/
  cli/                  @fledge/cli         CLI binary, devDependency or global
  workflow/             @fledge/workflow     Multiple workflow skills
    skills/
      brief/            fledge-brief        Feature brief lifecycle
      explore/          fledge-explore      Codebase exploration
      verify/           fledge-verify       Brief + convention compliance
  vue/                  @fledge/vue         Vue technology skill
    skill/
      SKILL.md          fledge-vue
```

### CLI vs agent responsibilities

The CLI provides commands that both humans and skills invoke. Skills delegate mechanical work to the CLI, then take over for tasks that need reasoning.

```
developer or skill
        |
        v
  fledge <command>        <- CLI: deterministic, no LLM
        |
        v
  files on disk           <- dirs, stubs, config, knowledge structure
        |
        v
  skill takes over        <- agent: fills in content, makes decisions
```

| Responsibility              | Owner         | Examples                                             |
| --------------------------- | ------------- | ---------------------------------------------------- |
| Schemas and validation      | CLI           | Brief format, knowledge file structure, project config. Defined with zod, used by CLI commands and available to skills |
| File and directory creation | CLI           | Create brief stubs, knowledge dirs, project scaffold |
| Interactive project setup   | CLI           | `fledge init`, `fledge scaffold`                     |
| Skill installation          | CLI           | Copy skill files on postinstall                      |
| Listing and status          | CLI           | List briefs, list knowledge sources                  |
| Understanding code          | Agent (skill) | Explore codebase, discover project knowledge         |
| Writing brief content       | Agent (skill) | Requirements, design decisions, task breakdown       |
| Enriching with context      | Agent (skill) | Connect brief to data models, conventions            |
| Implementation guidance     | Agent (skill) | Technology skills guide agent through decisions      |
| Verification                | Agent (skill) | Check implementation against brief and conventions   |

### Global vs project-local

`@fledge/cli` works both as a global install and as a project devDependency. One command is global-only:

| Install context | Commands available                                            |
| --------------- | ------------------------------------------------------------- |
| Global          | `fledge scaffold` (creates a new project, runs before a project exists) |
| Project-local   | Everything else: `init`, `install-skill`, `brief`, `knowledge` |

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

### Phase 2: Workflow layer

The feature-driven workflow. Provides the structure for moving from idea to implementation: explore, brief, enrich, implement, verify, archive.

> **Dependency:** The workflow must be designed before initialization (Phase 3) can be implemented, because initialization produces the project knowledge that the workflow consumes.

- [ ] Define the feature brief format (requirements, design, tasks) and enrichment model
- [ ] Design the workflow commands and how they interact with technology skills
- [ ] Build the enrichment step that connects briefs to project knowledge
- [ ] Customized implementation step that discovers and activates installed technology skills
- [ ] Verification that checks both brief compliance and convention compliance
- [ ] Archiving of completed briefs for future reference

### Phase 3: Project initialization

Prepares a project for the Fledge workflow. Likely involves two concerns that may be separate steps or combined:

- **Mechanical setup** -- which technology skills to install, project structure, initial configuration. This may be a CLI command (`fledge init`), similar to how other tools handle interactive project setup.
- **Project knowledge discovery** -- understanding the existing codebase: data models, domain concepts, API conventions, existing patterns. This likely needs agent intelligence and may be better served by a skill.

The right split will become clearer during implementation. Key deliverables regardless of approach:

- [ ] Discover and register project knowledge sources (data models, domain glossary, API conventions)
- [ ] Connect installed technology skills to project context
- [ ] Establish the project knowledge structure so it can be maintained as the project evolves

### Phase 4: Project scaffolding

Agent-based scaffolding for new projects. Runs before a project exists, installed globally so it's available from any directory.

- [ ] Scaffolding skill that guides the agent through project setup interactively (what are we building, which technologies)
- [ ] Scaffolds project structure, generates `package.json`, installs Fledge technology packages
- [ ] Auto-runs project initialization (Phase 3) after scaffolding completes
- [ ] Global install mechanism (user-level, not project-level)

### Phase 5: Quality gates

Testing and review guidance baked into technology skills and the workflow.

- [ ] Testing principles per technology skill (what to test, how to structure tests, deterministic over brittle)
- [ ] Review guidance: separation of generation and review, multi-pass review patterns
- [ ] Context management guidance (when to clear context, how to keep agent reasoning sharp across long tasks)

### Phase 6: Interactive onboarding

A skill that guides new engineers through the project interactively. The agent reads the installed technology skills, project knowledge, and archived feature briefs, then runs a conversation adapted to what the engineer already knows.

- [ ] Onboarding skill with a decision tree for how to run the conversation (what to cover first, how to assess existing knowledge, when to go deeper)
- [ ] Draws from existing skills, project knowledge, and archived briefs at conversation time
- [ ] Adapts depth and examples based on the engineer's background
- [ ] Uses real code from the project for examples rather than abstract illustrations

### Phase 7: Technology expansion

Additional technology skills following the established design principles.

- [ ] Identify the next technology to cover based on project needs
- [ ] Apply the skill design guide to ensure consistency across skills
- [ ] Validate that cross-cutting concerns (testing, error handling) work when expressed per technology

### Open questions

**Naming.** The term "feature brief" is a working name for the workflow artifact. It should signal: scoped to one feature, intent-driven, concise, not a formal system specification. The right term will emerge from real usage.

**Skill inheritance.** Teams can already build their own skills following the [skill design principles](docs/skill-design.md). The three-layer model handles overlap: a team's skill owns its own principles, and project conventions handle project-specific decisions. An open question is whether skills can be extended rather than forked, letting a team skill say "start from `@fledge/vue` but override these specific branches." This would keep team skills lean and automatically pick up upstream improvements. Whether this is reliable in practice (skills are markdown read by an agent, not code with an inheritance model) needs exploration.

**Installing skills from repositories.** The `fledge install-skill` command currently works with npm packages. Supporting direct installation from a git repository would make it easier for teams to create and share custom skills without publishing to npm.
