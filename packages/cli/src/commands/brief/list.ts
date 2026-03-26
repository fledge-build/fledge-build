import { stdout } from 'node:process'
import { defineCommand } from 'citty'
import { listBriefs, readBriefFrontmatter, readTasksFrontmatter } from '../../brief.ts'

export default defineCommand({
  meta: {
    name: 'list',
    description: 'List all briefs with their status and progress',
  },
  args: {
    status: {
      type: 'string',
      required: false,
      description: 'Filter by brief status (draft, active, completed)',
    },
  },
  run(context) {
    const names = listBriefs()

    if (names.length === 0) {
      stdout.write('No briefs found\n')
      return
    }

    let briefs = names.map((name) => {
      const brief = readBriefFrontmatter(name)
      const { tasks } = readTasksFrontmatter(name)
      const done = tasks.filter(task => task.done).length
      return { ...brief, tasksDone: done, tasksTotal: tasks.length }
    })

    if (context.args.status) {
      briefs = briefs.filter(brief => brief.status === context.args.status)
    }

    briefs.sort((a, b) => a.updated.localeCompare(b.updated))

    if (briefs.length === 0) {
      stdout.write('No briefs found\n')
      return
    }

    const nameWidth = Math.max(...briefs.map(brief => brief.name.length))
    const statusWidth = Math.max(...briefs.map(brief => brief.status.length))

    const lines = briefs.map((brief) => {
      const parts = [
        brief.name.padEnd(nameWidth),
        brief.status.padEnd(statusWidth),
        `${brief.tasksDone}/${brief.tasksTotal} tasks`,
      ]
      if (brief.summary) {
        parts.push(brief.summary)
      }
      return parts.join('  ')
    })

    stdout.write(`${lines.join('\n')}\n`)
  },
})
