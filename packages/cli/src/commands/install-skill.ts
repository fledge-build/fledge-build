import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { cwd, env, stdout } from 'node:process'
import { defineCommand } from 'citty'
import { parseFrontmatter, writeFrontmatter } from '../frontmatter.ts'

const SCOPED_PACKAGE_PATTERN = /^@([\w-]+)\/(.+)/

/**
 * Relative path from a project (or home directory for global installs) to the
 * skills directory. Claude Code currently only loads skills from `.claude/skills`.
 * Once `.agents/skills` is supported we can switch here:
 * https://github.com/anthropics/claude-code/issues/31005
 */
const SKILLS_DIRECTORY = path.join('.claude', 'skills')

function getPackageName(packageDirectory: string) {
  const packageFile = path.join(packageDirectory, 'package.json')
  const { name } = JSON.parse(fs.readFileSync(packageFile, 'utf8'))
  if (typeof name !== 'string') {
    throw new TypeError('Package name must be of type string')
  }
  return name
}

function getSkillPrefix(packageDirectory: string) {
  const packageName = getPackageName(packageDirectory)
  return packageName.replace(SCOPED_PACKAGE_PATTERN, (_, scope, name) => `${scope}-${name}`)
}

function getProjectDirectory() {
  return env.INIT_CWD || cwd()
}

function getGlobalDirectory() {
  return os.homedir()
}

interface InstallSkillOptions {
  packageDirectory: string
  global?: boolean
}

function installSkill({ packageDirectory, global }: InstallSkillOptions) {
  const packageName = getPackageName(packageDirectory)
  const baseDirectory = global ? getGlobalDirectory() : getProjectDirectory()

  if (!global && path.resolve(packageDirectory) === path.resolve(baseDirectory)) {
    console.warn(`[${packageName}] Skipping, running in own package`)
    return
  }

  const sourceDirectory = path.join(packageDirectory, 'skill')
  const skillPrefix = getSkillPrefix(packageDirectory)
  const targetDirectory = path.join(baseDirectory, SKILLS_DIRECTORY, skillPrefix)

  if (fs.existsSync(targetDirectory)) {
    fs.rmSync(targetDirectory, { recursive: true })
  }

  fs.mkdirSync(path.dirname(targetDirectory), { recursive: true })
  fs.cpSync(sourceDirectory, targetDirectory, { recursive: true })

  const skillFile = path.join(targetDirectory, 'SKILL.md')
  const targetSkillName = path.basename(targetDirectory)
  const content = fs.readFileSync(skillFile, 'utf8')
  const data = parseFrontmatter(content)
  data.name = targetSkillName
  fs.writeFileSync(skillFile, writeFrontmatter(data, content))

  fs.writeFileSync(path.join(targetDirectory, '.gitignore'), '*\n')

  stdout.write(`[${packageName}] Installed skill to "${targetDirectory}"`)
}

export default defineCommand({
  meta: {
    name: 'install-skill',
    description: 'Install a skill package into the consuming project',
  },
  args: {
    packageDirectory: {
      type: 'positional',
      required: false,
    },
    global: {
      type: 'boolean',
      default: false,
      description: `Install the skill to the global directory (~/${SKILLS_DIRECTORY}/) instead of the project`,
    },
  },
  run(ctx) {
    const packageDirectory = path.resolve(ctx.args.packageDirectory || cwd())
    const global = ctx.args.global
    installSkill({
      packageDirectory,
      global,
    })
  },
})
