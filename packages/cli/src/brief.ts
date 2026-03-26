import type { BriefFrontmatter, BriefStatus } from './schemas/brief.ts'
import type { TasksFrontmatter } from './schemas/tasks.ts'
import fs from 'node:fs'
import path from 'node:path'
import { cwd } from 'node:process'
import { parseFrontmatter, writeFrontmatter } from './frontmatter.ts'
import { briefFrontmatter, briefTransitions } from './schemas/brief.ts'
import { tasksFrontmatter } from './schemas/tasks.ts'

const BRIEFS_DIRECTORY = path.join('.fledge', 'briefs')

export interface BriefContext {
  projectRoot: string
}

/**
 * Creates a BriefContext from a project directory path or falls back to `cwd()`.
 *
 * @param projectDirectory - Optional project root override.
 * @returns A BriefContext with the resolved project root.
 */
export function createBriefContext(projectDirectory?: string): BriefContext {
  return { projectRoot: projectDirectory ? path.resolve(projectDirectory) : cwd() }
}

/**
 * Returns the absolute path to the briefs directory for the given context.
 *
 * @param context - The brief context.
 * @returns The absolute path to `.fledge/briefs/` in the project root.
 */
export function getBriefsDirectory(context: BriefContext): string {
  return path.join(context.projectRoot, BRIEFS_DIRECTORY)
}

/**
 * Returns the absolute path to a specific brief's directory.
 *
 * @param context - The brief context.
 * @param name - The brief name (used as directory name).
 * @returns The absolute path to the brief directory.
 */
export function getBriefDirectory(context: BriefContext, name: string): string {
  return path.join(getBriefsDirectory(context), name)
}

/**
 * Returns the absolute path to a brief's `brief.md` file.
 *
 * @param context - The brief context.
 * @param name - The brief name.
 * @returns The absolute path to `brief.md`.
 */
export function getBriefFile(context: BriefContext, name: string): string {
  return path.join(getBriefDirectory(context, name), 'brief.md')
}

/**
 * Returns the absolute path to a brief's `tasks.md` file.
 *
 * @param context - The brief context.
 * @param name - The brief name.
 * @returns The absolute path to `tasks.md`.
 */
export function getTasksFile(context: BriefContext, name: string): string {
  return path.join(getBriefDirectory(context, name), 'tasks.md')
}

/**
 * Checks whether a brief directory exists.
 *
 * @param context - The brief context.
 * @param name - The brief name.
 * @returns `true` if the brief directory exists.
 */
export function briefExists(context: BriefContext, name: string): boolean {
  return fs.existsSync(getBriefDirectory(context, name))
}

/**
 * Reads and validates the frontmatter of a brief's `brief.md` file.
 *
 * @param context - The brief context.
 * @param name - The brief name.
 * @returns The validated brief frontmatter.
 * @throws If the file does not exist or frontmatter fails validation.
 */
export function readBriefFrontmatter(context: BriefContext, name: string): BriefFrontmatter {
  const content = fs.readFileSync(getBriefFile(context, name), 'utf8')
  return briefFrontmatter.parse(parseFrontmatter(content))
}

/**
 * Reads and validates the frontmatter of a brief's `tasks.md` file.
 *
 * @param context - The brief context.
 * @param name - The brief name.
 * @returns The validated tasks frontmatter.
 * @throws If the file does not exist or frontmatter fails validation.
 */
export function readTasksFrontmatter(context: BriefContext, name: string): TasksFrontmatter {
  const content = fs.readFileSync(getTasksFile(context, name), 'utf8')
  return tasksFrontmatter.parse(parseFrontmatter(content))
}

/**
 * Updates the frontmatter of a brief's `brief.md` file while preserving its body content.
 *
 * @param context - The brief context.
 * @param name - The brief name.
 * @param data - The new frontmatter data to write.
 */
export function updateBriefFrontmatter(context: BriefContext, name: string, data: BriefFrontmatter): void {
  const file = getBriefFile(context, name)
  const content = fs.readFileSync(file, 'utf8')
  fs.writeFileSync(file, writeFrontmatter(data, content))
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
 * @param context - The brief context.
 * @returns An array of brief names (directory names).
 */
export function listBriefs(context: BriefContext): string[] {
  const directory = getBriefsDirectory(context)
  if (!fs.existsSync(directory)) {
    return []
  }
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
}
