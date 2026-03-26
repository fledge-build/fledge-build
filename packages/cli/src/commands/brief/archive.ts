import { stdout } from 'node:process'
import { defineCommand } from 'citty'
import { briefExists, formatDate, getBriefDirectory, readBriefFrontmatter, updateBriefFrontmatter, validateTransition } from '../../brief.ts'

export default defineCommand({
  meta: {
    name: 'archive',
    description: 'Transition a brief from completed to archived',
  },
  args: {
    name: {
      type: 'positional',
      required: true,
      description: 'The name of the brief to archive',
    },
  },
  run(context) {
    const { name } = context.args

    if (!briefExists(name)) {
      throw new Error(`Brief "${name}" does not exist at "${getBriefDirectory(name)}"`)
    }

    const brief = readBriefFrontmatter(name)
    validateTransition(brief.status, 'archived')

    updateBriefFrontmatter(name, { ...brief, status: 'archived', updated: formatDate() })

    stdout.write(`Brief "${name}" is now archived\n`)
  },
})
