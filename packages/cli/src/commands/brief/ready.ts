import { stdout } from 'node:process'
import { defineCommand } from 'citty'
import { briefExists, createBriefContext, formatDate, getBriefDirectory, readBriefFrontmatter, updateBriefFrontmatter, validateTransition } from '../../brief.ts'
import { projectDirectory } from './shared.ts'

export default defineCommand({
  meta: {
    name: 'ready',
    description: 'Transition a brief from draft to ready',
  },
  args: {
    name: {
      type: 'positional',
      required: true,
      description: 'The name of the brief to mark as ready',
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
    validateTransition(brief.status, 'ready')

    updateBriefFrontmatter(ctx, name, { ...brief, status: 'ready', updated: formatDate() })

    stdout.write(`Brief "${name}" is ready for implementation\n`)
  },
})
