import path from 'node:path'
import { cwd, stdout } from 'node:process'
import { defineCommand } from 'citty'
import { detectSkillLayout, getGlobalDirectory, getPackageName, getProjectDirectory, getSkillSources, installSkill } from '../../skills.ts'

export default defineCommand({
  meta: {
    name: 'install',
    description: 'Install skills from a package into the project',
  },
  args: {
    source: {
      type: 'positional',
      required: false,
      description: 'Path to the package containing skill(s). Defaults to the current directory.',
    },
    target: {
      type: 'string',
      required: false,
      description: 'Target directory to install skills into. Defaults to the project directory.',
    },
    global: {
      type: 'boolean',
      default: false,
      description: 'Install skills to the global directory (home) instead of the project',
    },
  },
  run(context) {
    const source = path.resolve(context.args.source || cwd())
    const targetBase = context.args.global
      ? getGlobalDirectory()
      : context.args.target
        ? path.resolve(context.args.target)
        : getProjectDirectory()

    if (!context.args.global && path.resolve(source) === path.resolve(targetBase)) {
      const packageName = getPackageName(source)
      console.warn(`[${packageName}] Skipping, running in own package`)
      return
    }

    const layout = detectSkillLayout(source)
    if (layout === 'none') {
      throw new Error(`No skill/ or skills/ directory found in "${source}"`)
    }

    const packageName = getPackageName(source)
    const skills = getSkillSources(source, packageName)

    for (const skill of skills) {
      installSkill({ source: skill.source, name: skill.name, targetBase })
      stdout.write(`[${packageName}] Installed skill "${skill.name}"\n`)
    }
  },
})
