import { z } from 'zod'

export const taskStatus = z.enum(['pending', 'active', 'completed', 'skipped'])

export type TaskStatus = z.infer<typeof taskStatus>

export const task = z.object({
  name: z.string().min(1),
  group: z.string().min(1).optional(),
  status: taskStatus.default('pending'),
})

export type Task = z.infer<typeof task>

export const tasksFrontmatter = z.object({
  tasks: z.array(task),
})

export type TasksFrontmatter = z.infer<typeof tasksFrontmatter>
