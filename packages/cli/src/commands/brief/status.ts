import type { Task } from '../../schemas/tasks.ts'
import { stdout } from 'node:process'
import { defineCommand } from 'citty'
import { briefExists, createBriefContext, getBriefDirectory, readBriefFrontmatter, readTasksFrontmatter } from '../../brief.ts'
import { projectDirectory } from './shared.ts'

/**
 * Groups tasks by their group field. Tasks without a group are placed under an empty string key.
 *
 * @param tasks - The list of tasks to group.
 * @returns A map of group names to their tasks.
 */
function groupTasks(tasks: Task[]): Map<string, Task[]> {
  const groups = new Map<string, Task[]>()
  for (const task of tasks) {
    const group = task.group ?? ''
    const existing = groups.get(group) ?? []
    existing.push(task)
    groups.set(group, existing)
  }
  return groups
}

/**
 * Formats a task as a line with a checkbox indicator.
 *
 * @param task - The task to format.
 * @returns The formatted task string.
 */
function formatTask(task: Task): string {
  const checkbox = task.done ? '[x]' : '[ ]'
  return `  ${checkbox} ${task.name}`
}

export default defineCommand({
  meta: {
    name: 'status',
    description: 'Show the status and task progress of a brief',
  },
  args: {
    name: {
      type: 'positional',
      required: true,
      description: 'The name of the brief to show status for',
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
    const { tasks } = readTasksFrontmatter(ctx, name)
    const done = tasks.filter(task => task.done).length
    const lines: string[] = []

    lines.push(`${name} [${brief.status}] ${done}/${tasks.length} tasks done`)
    lines.push('')

    const groups = groupTasks(tasks)
    for (const [group, groupedTasks] of groups) {
      if (group) {
        lines.push(group)
      }
      for (const task of groupedTasks) {
        lines.push(formatTask(task))
      }
    }

    stdout.write(`${lines.join('\n')}\n`)
  },
})
