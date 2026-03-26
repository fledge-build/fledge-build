import { stdout } from 'node:process'
import { defineCommand } from 'citty'
import { z } from 'zod'
import { briefFrontmatter } from '../../schemas/brief.ts'
import { tasksFrontmatter } from '../../schemas/tasks.ts'

export default defineCommand({
  meta: {
    name: 'schema',
    description: 'Output the JSON Schema for brief and tasks frontmatter',
  },
  run() {
    const schema = {
      brief: z.toJSONSchema(briefFrontmatter),
      tasks: z.toJSONSchema(tasksFrontmatter),
    }

    stdout.write(`${JSON.stringify(schema, null, 2)}\n`)
  },
})
