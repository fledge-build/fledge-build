import { stdout } from 'node:process'
import { defineCommand } from 'citty'
import { briefExists, createBriefContext, formatDate, getBriefDirectory, readBriefFrontmatter, readTasksFrontmatter, updateBriefFrontmatter, validateTransition } from '../../brief.ts'
import { projectDirectory } from './shared.ts'

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
    projectDirectory,
  },
  run(context) {
    const ctx = createBriefContext(context.args.projectDirectory)
    const { name } = context.args

    if (!briefExists(ctx, name)) {
      throw new Error(`Brief "${name}" does not exist at "${getBriefDirectory(ctx, name)}"`)
    }

    const brief = readBriefFrontmatter(ctx, name)
    validateTransition(brief.status, 'active')

    const tasks = readTasksFrontmatter(ctx, name)
    if (tasks.tasks.length === 0) {
      throw new Error('Brief must have at least one task before starting')
    }

    updateBriefFrontmatter(ctx, name, { ...brief, status: 'active', updated: formatDate() })

    stdout.write(`Brief "${name}" is now active\n`)
  },
})
