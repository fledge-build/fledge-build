import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const FLEDGE_BIN = path.resolve(import.meta.dirname, '../src/fledge-binary.ts')

interface RunResult {
  stdout: string
  stderr: string
  exitCode: number
}

/**
 * Runs the fledge CLI binary as a subprocess.
 *
 * @param args - The CLI arguments to pass (e.g. `['brief', 'create', 'my-feature']`).
 * @param workingDirectory - The working directory to run the command in.
 * @returns The stdout, stderr, and exit code of the process.
 */
export function run(args: string[], workingDirectory: string): RunResult {
  try {
    const stdout = execFileSync(FLEDGE_BIN, args, {
      cwd: workingDirectory,
      encoding: 'utf8',
      timeout: 10_000,
    })
    return { stdout, stderr: '', exitCode: 0 }
  }
  catch (error) {
    const execError = error as { stdout?: string, stderr?: string, status?: number }
    return {
      stdout: execError.stdout ?? '',
      stderr: execError.stderr ?? '',
      exitCode: execError.status ?? 1,
    }
  }
}

/**
 * Creates a temporary directory for use in a test.
 *
 * @returns The absolute path to the created temporary directory.
 */
export function createTempDirectory(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'fledge-test-'))
}

/**
 * Reads and returns the content of a file at the given path.
 *
 * @param filePath - The absolute path to the file.
 * @returns The file content as a string.
 */
export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8')
}

/**
 * Writes content to a file, creating parent directories as needed.
 *
 * @param filePath - The absolute path to the file.
 * @param content - The content to write.
 */
export function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content)
}
