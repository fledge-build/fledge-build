import fs from 'node:fs'
import { stdout } from 'node:process'
import { defineCommand } from 'citty'
import { briefExists, createBriefContext, getBriefDirectory, getBriefFile, getTasksFile } from '../../brief.ts'
import { parseFrontmatter } from '../../frontmatter.ts'
import { briefFrontmatter } from '../../schemas/brief.ts'
import { tasksFrontmatter } from '../../schemas/tasks.ts'
import { projectDirectory } from './shared.ts'

export default defineCommand({
  meta: {
    name: 'validate',
    description: 'Validate brief and tasks files against their schemas',
  },
  args: {
    name: {
      type: 'positional',
      required: true,
      description: 'The name of the brief to validate',
    },
    projectDirectory,
  },
  run(context) {
    const ctx = createBriefContext(context.args.projectDirectory)
    const { name } = context.args

    if (!briefExists(ctx, name)) {
      throw new Error(`Brief "${name}" does not exist at "${getBriefDirectory(ctx, name)}"`)
    }

    const errors: string[] = []

    const briefContent = fs.readFileSync(getBriefFile(ctx, name), 'utf8')
    const briefResult = briefFrontmatter.safeParse(parseFrontmatter(briefContent))
    if (!briefResult.success) {
      for (const issue of briefResult.error.issues) {
        errors.push(`brief.md: ${issue.path.join('.')}: ${issue.message}`)
      }
    }

    const tasksContent = fs.readFileSync(getTasksFile(ctx, name), 'utf8')
    const tasksResult = tasksFrontmatter.safeParse(parseFrontmatter(tasksContent))
    if (!tasksResult.success) {
      for (const issue of tasksResult.error.issues) {
        errors.push(`tasks.md: ${issue.path.join('.')}: ${issue.message}`)
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed for "${name}":\n${errors.map(error => `  - ${error}`).join('\n')}`)
    }

    stdout.write(`Brief "${name}" is valid\n`)
  },
})
