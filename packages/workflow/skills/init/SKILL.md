---
name: fledge-init
description: >-
  Initialize a project for the Fledge workflow. Creates project knowledge and populates it by exploring the codebase.
  Invoked directly via /fledge-init, not auto-triggered.
metadata:
  type: workflow
allowed-tools: Bash(node *scripts/init.js*)
---

## Purpose

This skill initializes a project for the Fledge workflow by creating and populating `.fledge/project.md` with project knowledge. It runs once per project, not per feature.

The CLI command (`node scripts/init.js`) creates the file with an empty template. This skill then explores the codebase and fills in each section with what it discovers.

## Step 1: Create the project file

Run `node scripts/init.js --project-dir <path>` to create `.fledge/project.md`.

If the file already exists, skip creation and proceed to Step 2 to review and update the existing content.

## Step 2: Explore the codebase

Read the project to understand its structure. Focus on:

1. **Package configuration**: read `package.json` (and workspace configs if monorepo) to understand dependencies, scripts, and the technology stack.
2. **Source structure**: explore the source directories to understand how the project is organized.
3. **Data layer**: look for database schemas, ORM models, or type definitions that describe the data model.
4. **API surface**: look for route definitions, API handlers, or endpoint configurations.
5. **External integrations**: look for third-party service configurations, API keys references, or SDK imports.
6. **Existing conventions**: look for configuration files (linters, formatters, test config), naming patterns, and file organization conventions.
7. **Installed Fledge skills**: check `.claude/skills/` for any installed technology skills.

Do not try to read every file. Focus on entry points, configuration, and structural files that reveal how the project is organized.

## Step 3: Populate project.md

Fill in each section of `project.md` based on what you discovered:

### Project description
Write one to two sentences describing what the project is and does. Keep it factual.

### Domain
List the key domain concepts. For each concept, write a short definition. Focus on terms that someone new to the project would need to understand. Use the language the codebase uses.

### Data models
Describe the main entities, their relationships, and key fields. Do not dump raw schemas. Write it as prose that captures the shape of the data: "A recipe has a title, description, and a list of ingredients. Each ingredient references a product and specifies a quantity."

### APIs
Describe the endpoint patterns and conventions. What does the URL structure look like? What authentication approach is used? What response format? List key endpoint groups, not every individual endpoint.

### External services
List any third-party services and what they are used for. Include services referenced in configuration or environment variables, even if you cannot see the full integration.

### Conventions
Document project-specific patterns you observed: naming conventions, file organization, testing patterns, anything that is consistent across the codebase but would not be obvious to someone new.

### Stack
Start with a one to two sentence prose summary of the stack (e.g. "Vue 3 frontend with TypeScript, Hono API server with Drizzle ORM on SQLite").

Then add a table listing each core technology, its version, and whether a Fledge skill covers it. Check `.claude/skills/` for installed skills. Only include technologies that matter for understanding the project, not every sub-dependency (linters, formatters, and dev tools belong in Conventions).

```markdown
| Technology   | Version | Fledge skill |
| ------------ | ------- | ------------ |
| Vue 3        | 3.5     | @fledge/vue  |
| Hono         | 4.11    |              |
```

The Fledge skill column helps the build skill know which technologies have guided support and which rely on general agent knowledge.

## Step 4: Review with the developer

Present the populated `project.md` to the developer. Ask them to:
- Correct anything that is wrong
- Add anything important that was missed
- Remove anything that is noise

Make the edits based on their feedback. The goal is a concise, accurate project description that gives an agent enough context to write good briefs and specs.
