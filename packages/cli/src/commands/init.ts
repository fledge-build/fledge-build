import fs from 'node:fs'
import path from 'node:path'
import { cwd, stdout } from 'node:process'
import { defineCommand } from 'citty'
import { projectDirectory } from './brief/shared.ts'

const PROJECT_FILE = path.join('.fledge', 'project.md')

const TEMPLATE = `# Project

<!-- Brief description of what this project is and does. -->

## Domain

<!-- Key domain concepts and terminology.
     What do terms mean in this project?
     Not a full glossary, just the concepts an agent needs to understand scope. -->

## Data models

<!-- Entities, their relationships, and key fields.
     Not a schema dump, but enough to understand the shape of the data. -->

## APIs

<!-- Endpoint patterns, conventions, authentication approach.
     What does the API surface look like? -->

## External services

<!-- Third-party integrations and what they are used for. -->

## Conventions

<!-- Project-specific patterns not covered by technology skills.
     Naming, file organization, testing approach. -->

## Stack

<!-- Technology stack and installed Fledge skills.

     Example:
     Vue 3 frontend with TypeScript, Vite for bundling.
     Hono API server with Drizzle ORM on PostgreSQL.

     Technology skills:
     - @fledge/vue -- components, composables, data fetching, forms, styling -->
`

export default defineCommand({
  meta: {
    name: 'init',
    description: 'Initialize a project for the Fledge workflow',
  },
  args: {
    projectDirectory,
  },
  run(context) {
    const projectRoot = context.args.projectDirectory
      ? path.resolve(context.args.projectDirectory)
      : cwd()

    const filePath = path.join(projectRoot, PROJECT_FILE)

    if (fs.existsSync(filePath)) {
      throw new Error(`Project already initialized: "${filePath}" exists`)
    }

    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, TEMPLATE)

    stdout.write(`Initialized project at "${filePath}"\n`)
  },
})
