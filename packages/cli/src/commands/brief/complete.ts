import { stdout } from 'node:process'
import { defineCommand } from 'citty'
import { briefExists, createBriefContext, formatDate, getBriefDirectory, readBriefFrontmatter, readTasksFrontmatter, updateBriefFrontmatter, validateTransition } from '../../brief.ts'
import { projectDirectory } from './shared.ts'

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
    projectDirectory,
  },
  run(context) {
    const ctx = createBriefContext(context.args.projectDirectory)
    const { name } = context.args

    if (!briefExists(ctx, name)) {
      throw new Error(`Brief "${name}" does not exist at "${getBriefDirectory(ctx, name)}"`)
    }

    const brief = readBriefFrontmatter(ctx, name)
    validateTransition(brief.status, 'completed')

    if (!brief.summary) {
      throw new Error('Brief must have a summary before completing. Add a "summary" field to the brief.md frontmatter.')
    }

    const tasks = readTasksFrontmatter(ctx, name)
    const incomplete = tasks.tasks.filter(task => task.status !== 'completed' && task.status !== 'skipped')
    if (incomplete.length > 0) {
      const names = incomplete.map(task => `  - ${task.name} [${task.status}]`).join('\n')
      throw new Error(`Cannot complete brief with ${incomplete.length} unfinished task(s):\n${names}`)
    }

    updateBriefFrontmatter(ctx, name, { ...brief, status: 'completed', updated: formatDate() })

    stdout.write(`Brief "${name}" is now completed\n`)
  },
})
