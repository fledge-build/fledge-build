import { stdout } from 'node:process'
import { defineCommand } from 'citty'
import { listBriefs, readBriefFrontmatter, readTasksFrontmatter } from '../../brief.ts'

export default defineCommand({
  meta: {
    name: 'list',
    description: 'List all briefs with their status and progress',
  },
  run() {
    const names = listBriefs()

    if (names.length === 0) {
      stdout.write('No briefs found\n')
      return
    }

    const lines: string[] = []

    for (const name of names) {
      const brief = readBriefFrontmatter(name)
      const { tasks } = readTasksFrontmatter(name)
      const done = tasks.filter(task => task.done).length
      const padding = Math.max(...names.map(n => n.length)) - name.length
      lines.push(`${name}${' '.repeat(padding)}  ${brief.status.padEnd(10)}  ${done}/${tasks.length} tasks`)
    }

    stdout.write(`${lines.join('\n')}\n`)
  },
})
