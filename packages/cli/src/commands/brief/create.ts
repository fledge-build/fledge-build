import fs from 'node:fs'
import { stdout } from 'node:process'
import { defineCommand } from 'citty'
import { briefExists, createBriefContext, formatDate, getBriefDirectory, getBriefFile, getTasksFile } from '../../brief.ts'
import { writeFrontmatter } from '../../frontmatter.ts'
import { projectDirectory } from './shared.ts'

export default defineCommand({
  meta: {
    name: 'create',
    description: 'Create a new brief with stub files',
  },
  args: {
    name: {
      type: 'positional',
      required: true,
      description: 'The name of the brief to create (used as directory name)',
    },
    projectDirectory,
  },
  run(context) {
    const ctx = createBriefContext(context.args.projectDirectory)
    const { name } = context.args

    if (briefExists(ctx, name)) {
      throw new Error(`Brief "${name}" already exists at "${getBriefDirectory(ctx, name)}"`)
    }

    const directory = getBriefDirectory(ctx, name)
    fs.mkdirSync(directory, { recursive: true })

    const date = formatDate()

    fs.writeFileSync(
      getBriefFile(ctx, name),
      writeFrontmatter({ name, status: 'draft', created: date, updated: date }),
    )

    fs.writeFileSync(
      getTasksFile(ctx, name),
      writeFrontmatter({ tasks: [] }),
    )

    stdout.write(`Created brief "${name}" at "${directory}"\n`)
  },
})
