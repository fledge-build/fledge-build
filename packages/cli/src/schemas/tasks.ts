import { z } from 'zod'

export const task = z.object({
  name: z.string().min(1),
  group: z.string().min(1).optional(),
  done: z.boolean().default(false),
})

export type Task = z.infer<typeof task>

export const tasksFrontmatter = z.object({
  tasks: z.array(task),
})

export type TasksFrontmatter = z.infer<typeof tasksFrontmatter>
