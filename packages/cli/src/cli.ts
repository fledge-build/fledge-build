import type { SubCommandsDef } from 'citty'
import { createRequire } from 'node:module'
import { defineCommand, runMain } from 'citty'
import installSkill from './commands/install-skill.ts'

const require = createRequire(import.meta.url)
const { version } = require('../package.json') as { version: string }

const subCommands: SubCommandsDef = {
  'install-skill': installSkill,
}

const main = defineCommand({
  meta: { name: 'fledge', version, description: 'CLI tooling for the Fledge development workflow' },
  subCommands,
})

export function run() {
  runMain(main)
}
