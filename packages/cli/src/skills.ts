import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { cwd, env } from 'node:process'
import { parseFrontmatter, writeFrontmatter } from './frontmatter.ts'

const SCOPED_PACKAGE_PATTERN = /^@([\w-]+)\/(.+)/

/**
 * Relative path from a project (or home directory for global installs) to the
 * skills directory. Claude Code currently only loads skills from `.claude/skills`.
 * Once `.agents/skills` is supported we can switch here:
 * https://github.com/anthropics/claude-code/issues/31005
 */
export const SKILLS_DIRECTORY = path.join('.claude', 'skills')

/**
 * Reads the package name from a package.json file in the given directory.
 *
 * @param packageDirectory - The directory containing the package.json.
 * @returns The package name.
 * @throws If the package.json does not contain a string name.
 */
export function getPackageName(packageDirectory: string): string {
  const packageFile = path.join(packageDirectory, 'package.json')
  const { name } = JSON.parse(fs.readFileSync(packageFile, 'utf8'))
  if (typeof name !== 'string') {
    throw new TypeError('Package name must be of type string')
  }
  return name
}

/**
 * Derives the skill prefix from a package name by replacing the scoped package
 * separator with a hyphen (e.g. `@fledge/vue` becomes `fledge-vue`).
 *
 * @param packageName - The npm package name.
 * @returns The skill prefix used as directory name.
 */
export function getSkillPrefix(packageName: string): string {
  return packageName.replace(SCOPED_PACKAGE_PATTERN, (_, scope, name) => `${scope}-${name}`)
}

/**
 * Returns the default target directory for skill installation.
 * Uses `INIT_CWD` (set by npm/pnpm during postinstall) or falls back to `cwd()`.
 *
 * @returns The absolute path to the project directory.
 */
export function getProjectDirectory(): string {
  return env.INIT_CWD || cwd()
}

/**
 * Returns the user's home directory for global skill installation.
 *
 * @returns The absolute path to the home directory.
 */
export function getGlobalDirectory(): string {
  return os.homedir()
}

/**
 * Detects whether a package contains a single skill (`skill/` directory)
 * or multiple skills (`skills/` directory with subdirectories).
 *
 * @param packageDirectory - The directory containing the skill package.
 * @returns `'single'` if a `skill/` directory exists, `'multiple'` if a `skills/` directory exists, or `'none'`.
 */
export function detectSkillLayout(packageDirectory: string): 'single' | 'multiple' | 'none' {
  if (fs.existsSync(path.join(packageDirectory, 'skills'))) {
    return 'multiple'
  }
  if (fs.existsSync(path.join(packageDirectory, 'skill'))) {
    return 'single'
  }
  return 'none'
}

/**
 * Returns the source directories for skills in a package.
 *
 * For a single-skill package, returns one entry with the `skill/` directory
 * and the skill name derived from the package name.
 *
 * For a multi-skill package, returns one entry per subdirectory in `skills/`,
 * with the skill name taken from the subdirectory name.
 *
 * @param packageDirectory - The directory containing the skill package.
 * @param packageName - The npm package name (used for single-skill naming).
 * @returns An array of `{ source, name }` objects.
 */
export function getSkillSources(packageDirectory: string, packageName: string): Array<{ source: string, name: string }> {
  const layout = detectSkillLayout(packageDirectory)

  if (layout === 'single') {
    return [{
      source: path.join(packageDirectory, 'skill'),
      name: getSkillPrefix(packageName),
    }]
  }

  if (layout === 'multiple') {
    const skillsDirectory = path.join(packageDirectory, 'skills')
    return fs.readdirSync(skillsDirectory, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => ({
        source: path.join(skillsDirectory, entry.name),
        name: `${getSkillPrefix(packageName)}-${entry.name}`,
      }))
  }

  return []
}

interface InstallSkillOptions {
  source: string
  name: string
  targetBase: string
}

/**
 * Installs a single skill by copying its source directory to the target
 * skills directory, updating the SKILL.md frontmatter name, and writing
 * a .gitignore.
 *
 * @param options - The install options.
 * @param options.source - The source directory containing the skill files.
 * @param options.name - The target skill name (used as directory name and frontmatter name).
 * @param options.targetBase - The base directory to install into (project root or home).
 */
export function installSkill({ source, name, targetBase }: InstallSkillOptions): void {
  const targetDirectory = path.join(targetBase, SKILLS_DIRECTORY, name)

  if (fs.existsSync(targetDirectory)) {
    fs.rmSync(targetDirectory, { recursive: true })
  }

  fs.mkdirSync(path.dirname(targetDirectory), { recursive: true })
  fs.cpSync(source, targetDirectory, { recursive: true })

  const skillFile = path.join(targetDirectory, 'SKILL.md')
  if (fs.existsSync(skillFile)) {
    const content = fs.readFileSync(skillFile, 'utf8')
    const data = parseFrontmatter(content)
    data.name = name
    fs.writeFileSync(skillFile, writeFrontmatter(data, content))
  }

  fs.writeFileSync(path.join(targetDirectory, '.gitignore'), '*\n')
}

interface InstalledSkill {
  name: string
  description: string
  type: string
  location: string
}

/**
 * Lists all installed skills in a given base directory by reading SKILL.md
 * frontmatter from each subdirectory in the skills directory.
 *
 * @param baseDirectory - The base directory to search (project root or home).
 * @returns An array of installed skill records.
 */
export function listInstalledSkills(baseDirectory: string): InstalledSkill[] {
  const skillsDirectory = path.join(baseDirectory, SKILLS_DIRECTORY)

  if (!fs.existsSync(skillsDirectory)) {
    return []
  }

  return fs.readdirSync(skillsDirectory, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map((entry) => {
      const skillFile = path.join(skillsDirectory, entry.name, 'SKILL.md')
      if (!fs.existsSync(skillFile)) {
        return null
      }

      const content = fs.readFileSync(skillFile, 'utf8')
      const data = parseFrontmatter<{
        name?: string
        description?: string
        metadata?: Record<string, string>
      }>(content)

      return {
        name: data.name ?? entry.name,
        description: data.description ?? '',
        type: data.metadata?.type ?? 'unknown',
        location: skillFile,
      }
    })
    .filter((skill): skill is InstalledSkill => skill !== null)
}
