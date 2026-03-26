import fs from 'node:fs'
import { stdout } from 'node:process'
import { defineCommand } from 'citty'
import { briefExists, formatDate, getBriefDirectory, getBriefFile, getTasksFile } from '../../brief.ts'
import { writeFrontmatter } from '../../frontmatter.ts'

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
  },
  run(context) {
    const { name } = context.args

    if (briefExists(name)) {
      throw new Error(`Brief "${name}" already exists at "${getBriefDirectory(name)}"`)
    }

    const directory = getBriefDirectory(name)
    fs.mkdirSync(directory, { recursive: true })

    const date = formatDate()

    fs.writeFileSync(
      getBriefFile(name),
      writeFrontmatter({ name, status: 'draft', created: date, updated: date }),
    )

    fs.writeFileSync(
      getTasksFile(name),
      writeFrontmatter({ tasks: [] }),
    )

    stdout.write(`Created brief "${name}" at "${directory}"\n`)
  },
})
