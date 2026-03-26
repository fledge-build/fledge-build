import type { SubCommandsDef } from 'citty'
import { createRequire } from 'node:module'
import { defineCommand, runMain } from 'citty'
import brief from './commands/brief.ts'
import installSkill from './commands/install-skill.ts'

const require = createRequire(import.meta.url)
const { version } = require('../package.json') as { version: string }

const subCommands: SubCommandsDef = {
  brief,
  'install-skill': installSkill,
}

const main = defineCommand({
  meta: { name: 'fledge', version, description: 'CLI tooling for the Fledge development workflow' },
  subCommands,
})

export function run() {
  runMain(main)
}
