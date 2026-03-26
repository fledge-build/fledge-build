import type { SubCommandsDef } from 'citty'
import { createRequire } from 'node:module'
import { defineCommand, runMain } from 'citty'
import brief from './commands/brief.ts'
import skills from './commands/skills.ts'

const require = createRequire(import.meta.url)
const { version } = require('../package.json') as { version: string }

const subCommands: SubCommandsDef = {
  brief,
  skills,
}

const main = defineCommand({
  meta: { name: 'fledge', version, description: 'CLI tooling for the Fledge development workflow' },
  subCommands,
})

/**
 * Runs the CLI main command.
 */
export function run() {
  runMain(main)
}
