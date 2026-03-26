import { stdout } from 'node:process'
import { defineCommand } from 'citty'
import { briefExists, formatDate, getBriefDirectory, readBriefFrontmatter, readTasksFrontmatter, updateBriefFrontmatter, validateTransition } from '../../brief.ts'

export default defineCommand({
  meta: {
    name: 'complete',
    description: 'Transition a brief from active to completed',
  },
  args: {
    name: {
      type: 'positional',
      required: true,
      description: 'The name of the brief to complete',
    },
  },
  run(context) {
    const { name } = context.args

    if (!briefExists(name)) {
      throw new Error(`Brief "${name}" does not exist at "${getBriefDirectory(name)}"`)
    }

    const brief = readBriefFrontmatter(name)
    validateTransition(brief.status, 'completed')

    if (!brief.summary) {
      throw new Error('Brief must have a summary before completing. Add a "summary" field to the brief.md frontmatter.')
    }

    const tasks = readTasksFrontmatter(name)
    const incomplete = tasks.tasks.filter(task => !task.done)
    if (incomplete.length > 0) {
      const names = incomplete.map(task => `  - ${task.name}`).join('\n')
      throw new Error(`Cannot complete brief with ${incomplete.length} incomplete task(s):\n${names}`)
    }

    updateBriefFrontmatter(name, { ...brief, status: 'completed', updated: formatDate() })

    stdout.write(`Brief "${name}" is now completed\n`)
  },
})
