import { stdout } from 'node:process'
import { defineCommand } from 'citty'
import { briefExists, createBriefContext, formatDate, getBriefDirectory, readBriefFrontmatter, updateBriefFrontmatter, validateTransition } from '../../brief.ts'
import { projectDirectory } from './shared.ts'

export default defineCommand({
  meta: {
    name: 'cancel',
    description: 'Cancel a brief',
  },
  args: {
    name: {
      type: 'positional',
      required: true,
      description: 'The name of the brief to cancel',
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
    validateTransition(brief.status, 'cancelled')

    updateBriefFrontmatter(ctx, name, { ...brief, status: 'cancelled', updated: formatDate() })

    stdout.write(`Brief "${name}" has been cancelled\n`)
  },
})
