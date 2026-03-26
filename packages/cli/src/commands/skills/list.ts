import path from 'node:path'
import { stdout } from 'node:process'
import { defineCommand } from 'citty'
import { getGlobalDirectory, getProjectDirectory, listInstalledSkills } from '../../skills.ts'

export default defineCommand({
  meta: {
    name: 'list',
    description: 'List installed skills',
  },
  args: {
    type: {
      type: 'string',
      required: false,
      description: 'Filter by skill type (e.g. "technology", "workflow")',
    },
    global: {
      type: 'boolean',
      default: false,
      description: 'List globally installed skills instead of project-local',
    },
  },
  run(context) {
    const baseDirectory = context.args.global
      ? getGlobalDirectory()
      : getProjectDirectory()

    let skills = listInstalledSkills(baseDirectory)

    if (context.args.type) {
      skills = skills.filter(skill => skill.type === context.args.type)
    }

    if (skills.length === 0) {
      stdout.write('No skills found\n')
      return
    }

    const nameWidth = Math.max(...skills.map(skill => skill.name.length))
    const typeWidth = Math.max(...skills.map(skill => skill.type.length))

    const lines = skills.map((skill) => {
      const name = skill.name.padEnd(nameWidth)
      const type = skill.type.padEnd(typeWidth)
      return `${name}  ${type}  ${skill.description}`
    })

    stdout.write(`${lines.join('\n')}\n`)
  },
})
