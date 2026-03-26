import type { BriefFrontmatter, BriefStatus } from './schemas/brief.ts'
import type { TasksFrontmatter } from './schemas/tasks.ts'
import fs from 'node:fs'
import path from 'node:path'
import { cwd, env } from 'node:process'
import { parseFrontmatter, writeFrontmatter } from './frontmatter.ts'
import { briefFrontmatter, briefTransitions } from './schemas/brief.ts'
import { tasksFrontmatter } from './schemas/tasks.ts'

const BRIEFS_DIRECTORY = path.join('.fledge', 'briefs')

/**
 * Returns the project root directory.
 * Uses the `FLEDGE_PROJECT_DIR` environment variable if set, otherwise falls back to `cwd()`.
 *
 * @returns The absolute path to the project root.
 */
export function getProjectRoot(): string {
  return env.FLEDGE_PROJECT_DIR || cwd()
}

/**
 * Returns the absolute path to the briefs directory for the current project.
 *
 * @returns The absolute path to `.fledge/briefs/` in the project root.
 */
export function getBriefsDirectory(): string {
  return path.join(getProjectRoot(), BRIEFS_DIRECTORY)
}

/**
 * Returns the absolute path to a specific brief's directory.
 *
 * @param name - The brief name (used as directory name).
 * @returns The absolute path to the brief directory.
 */
export function getBriefDirectory(name: string): string {
  return path.join(getBriefsDirectory(), name)
}

/**
 * Returns the absolute path to a brief's `brief.md` file.
 *
 * @param name - The brief name.
 * @returns The absolute path to `brief.md`.
 */
export function getBriefFile(name: string): string {
  return path.join(getBriefDirectory(name), 'brief.md')
}

/**
 * Returns the absolute path to a brief's `tasks.md` file.
 *
 * @param name - The brief name.
 * @returns The absolute path to `tasks.md`.
 */
export function getTasksFile(name: string): string {
  return path.join(getBriefDirectory(name), 'tasks.md')
}

/**
 * Checks whether a brief directory exists.
 *
 * @param name - The brief name.
 * @returns `true` if the brief directory exists.
 */
export function briefExists(name: string): boolean {
  return fs.existsSync(getBriefDirectory(name))
}

/**
 * Reads and validates the frontmatter of a brief's `brief.md` file.
 *
 * @param name - The brief name.
 * @returns The validated brief frontmatter.
 * @throws If the file does not exist or frontmatter fails validation.
 */
export function readBriefFrontmatter(name: string): BriefFrontmatter {
  const content = fs.readFileSync(getBriefFile(name), 'utf8')
  return briefFrontmatter.parse(parseFrontmatter(content))
}

/**
 * Reads and validates the frontmatter of a brief's `tasks.md` file.
 *
 * @param name - The brief name.
 * @returns The validated tasks frontmatter.
 * @throws If the file does not exist or frontmatter fails validation.
 */
export function readTasksFrontmatter(name: string): TasksFrontmatter {
  const content = fs.readFileSync(getTasksFile(name), 'utf8')
  return tasksFrontmatter.parse(parseFrontmatter(content))
}

/**
 * Updates the frontmatter of a brief's `brief.md` file while preserving its body content.
 *
 * @param name - The brief name.
 * @param data - The new frontmatter data to write.
 */
export function updateBriefFrontmatter(name: string, data: BriefFrontmatter): void {
  const briefFile = getBriefFile(name)
  const content = fs.readFileSync(briefFile, 'utf8')
  fs.writeFileSync(briefFile, writeFrontmatter(data, content))
}

/**
 * Validates that a state transition is allowed and throws a descriptive error if not.
 *
 * @param current - The current brief status.
 * @param target - The desired target status.
 * @throws If the transition is not allowed.
 */
export function validateTransition(current: BriefStatus, target: BriefStatus): void {
  const allowed = briefTransitions[current]
  if (!allowed.includes(target)) {
    const allowedList = allowed.length > 0 ? allowed.join(', ') : 'none'
    throw new Error(`Cannot transition from "${current}" to "${target}". Allowed transitions: ${allowedList}`)
  }
}

/**
 * Returns today's date as an ISO 8601 date string (YYYY-MM-DD).
 *
 * @returns The formatted date string.
 */
export function formatDate(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Lists all brief directories in the project.
 *
 * @returns An array of brief names (directory names).
 */
export function listBriefs(): string[] {
  const directory = getBriefsDirectory()
  if (!fs.existsSync(directory)) {
    return []
  }
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
}
