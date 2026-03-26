import { stdout } from 'node:process'
import { defineCommand } from 'citty'
import { briefExists, formatDate, getBriefDirectory, readBriefFrontmatter, readTasksFrontmatter, updateBriefFrontmatter, validateTransition } from '../../brief.ts'

export default defineCommand({
  meta: {
    name: 'start',
    description: 'Transition a brief from draft to active',
  },
  args: {
    name: {
      type: 'positional',
      required: true,
      description: 'The name of the brief to start',
    },
  },
  run(context) {
    const { name } = context.args

    if (!briefExists(name)) {
      throw new Error(`Brief "${name}" does not exist at "${getBriefDirectory(name)}"`)
    }

    const brief = readBriefFrontmatter(name)
    validateTransition(brief.status, 'active')

    const tasks = readTasksFrontmatter(name)
    if (tasks.tasks.length === 0) {
      throw new Error('Brief must have at least one task before starting')
    }

    updateBriefFrontmatter(name, { ...brief, status: 'active', updated: formatDate() })

    stdout.write(`Brief "${name}" is now active\n`)
  },
})
