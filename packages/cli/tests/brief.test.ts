import fs from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { parseFrontmatter, writeFrontmatter } from '../src/frontmatter.ts'
import { createTempDirectory, readFile, run, writeFile } from './helpers.ts'

let tempDirectory: string

afterEach(() => {
  if (tempDirectory) {
    fs.rmSync(tempDirectory, { recursive: true, force: true })
  }
})

function briefPath(name: string): string {
  return path.join(tempDirectory, '.fledge', 'briefs', name)
}

function briefFile(name: string): string {
  return path.join(briefPath(name), 'brief.md')
}

function tasksFile(name: string): string {
  return path.join(briefPath(name), 'tasks.md')
}

function specFile(name: string): string {
  return path.join(briefPath(name), 'spec.md')
}

function setTasks(name: string, tasks: Array<{ name: string, group?: string, status?: string }>): void {
  const content = ['---', `tasks:`, ...tasks.flatMap((task) => {
    const lines = [`  - name: ${task.name}`]
    if (task.group)
      lines.push(`    group: ${task.group}`)
    lines.push(`    status: ${task.status ?? 'pending'}`)
    return lines
  }), '---', ''].join('\n')
  writeFile(tasksFile(name), content)
}

function setSummary(name: string, summary: string): void {
  const content = fs.readFileSync(briefFile(name), 'utf8')
  const data = parseFrontmatter(content)
  data.summary = summary
  fs.writeFileSync(briefFile(name), writeFrontmatter(data, content))
}

function setBriefStatus(name: string, status: string): void {
  const content = fs.readFileSync(briefFile(name), 'utf8')
  const data = parseFrontmatter(content)
  data.status = status
  fs.writeFileSync(briefFile(name), writeFrontmatter(data, content))
}

describe('fledge brief', () => {
  describe('create', () => {
    it('creates a brief directory with stub files', () => {
      tempDirectory = createTempDirectory()
      const result = run(['brief', 'create', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Created brief "my-feature"')
      expect(fs.existsSync(briefFile('my-feature'))).toBe(true)
      expect(fs.existsSync(tasksFile('my-feature'))).toBe(true)
      expect(fs.existsSync(specFile('my-feature'))).toBe(true)
    })

    it('creates brief.md with correct frontmatter', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)

      const data = parseFrontmatter(readFile(briefFile('my-feature')))
      expect(data).toMatchObject({
        name: 'my-feature',
        status: 'draft',
      })
      expect(data).toHaveProperty('created')
    })

    it('creates tasks.md with empty tasks array', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)

      const data = parseFrontmatter(readFile(tasksFile('my-feature')))
      expect(data).toEqual({ tasks: [] })
    })

    it('creates an empty spec.md', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)

      const content = readFile(specFile('my-feature'))
      expect(content).toBe('')
    })

    it('fails if brief already exists', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)
      const result = run(['brief', 'create', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('already exists')
    })
  })

  describe('validate', () => {
    it('passes for a valid brief', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)
      const result = run(['brief', 'validate', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('is valid')
    })

    it('reports errors for invalid frontmatter', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)
      writeFile(briefFile('my-feature'), '---\nstatus: invalid\n---\n')

      const result = run(['brief', 'validate', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Validation failed')
    })

    it('fails if brief does not exist', () => {
      tempDirectory = createTempDirectory()
      const result = run(['brief', 'validate', 'nonexistent'], tempDirectory)

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('does not exist')
    })
  })

  describe('ready', () => {
    it('transitions a draft brief to ready', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)

      const result = run(['brief', 'ready', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('is ready for implementation')

      const data = parseFrontmatter(readFile(briefFile('my-feature')))
      expect(data).toMatchObject({ status: 'ready' })
      expect(data).toHaveProperty('updated')
    })

    it('fails if brief is not in draft state', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)
      run(['brief', 'ready', 'my-feature'], tempDirectory)

      const result = run(['brief', 'ready', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Cannot transition')
    })
  })

  describe('start', () => {
    it('transitions a ready brief to active', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)
      run(['brief', 'ready', 'my-feature'], tempDirectory)

      const result = run(['brief', 'start', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('is now active')

      const data = parseFrontmatter(readFile(briefFile('my-feature')))
      expect(data).toMatchObject({ status: 'active' })
      expect(data).toHaveProperty('updated')
    })

    it('fails if brief is not in ready state', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)

      const result = run(['brief', 'start', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Cannot transition')
    })
  })

  describe('complete', () => {
    it('transitions an active brief to completed', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)
      setTasks('my-feature', [{ name: 'First task', status: 'completed' }])
      setBriefStatus('my-feature', 'active')
      setSummary('my-feature', 'Added the first feature')

      const result = run(['brief', 'complete', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('is now completed')

      const data = parseFrontmatter(readFile(briefFile('my-feature')))
      expect(data).toMatchObject({ status: 'completed' })
    })

    it('allows completion when all tasks are completed or skipped', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)
      setTasks('my-feature', [
        { name: 'Done task', status: 'completed' },
        { name: 'Skipped task', status: 'skipped' },
      ])
      setBriefStatus('my-feature', 'active')
      setSummary('my-feature', 'Some summary')

      const result = run(['brief', 'complete', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('is now completed')
    })

    it('fails if summary is missing', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)
      setTasks('my-feature', [{ name: 'First task', status: 'completed' }])
      setBriefStatus('my-feature', 'active')

      const result = run(['brief', 'complete', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('summary')
    })

    it('fails if there are unfinished tasks', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)
      setTasks('my-feature', [
        { name: 'Done task', status: 'completed' },
        { name: 'Pending task', status: 'pending' },
      ])
      setBriefStatus('my-feature', 'active')
      setSummary('my-feature', 'Some summary')

      const result = run(['brief', 'complete', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('unfinished task')
      expect(result.stderr).toContain('Pending task')
    })

    it('fails if brief is not in active state', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)

      const result = run(['brief', 'complete', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Cannot transition')
    })
  })

  describe('cancel', () => {
    it('cancels a draft brief', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)

      const result = run(['brief', 'cancel', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('has been cancelled')

      const data = parseFrontmatter(readFile(briefFile('my-feature')))
      expect(data).toMatchObject({ status: 'cancelled' })
    })

    it('cancels a ready brief', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)
      run(['brief', 'ready', 'my-feature'], tempDirectory)

      const result = run(['brief', 'cancel', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('has been cancelled')
    })

    it('cancels an active brief', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)
      setBriefStatus('my-feature', 'active')

      const result = run(['brief', 'cancel', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('has been cancelled')
    })

    it('fails if brief is already completed', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)
      setTasks('my-feature', [{ name: 'Task', status: 'completed' }])
      setBriefStatus('my-feature', 'active')
      setSummary('my-feature', 'Done')
      run(['brief', 'complete', 'my-feature'], tempDirectory)

      const result = run(['brief', 'cancel', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Cannot transition')
    })

    it('fails if brief is already cancelled', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)
      run(['brief', 'cancel', 'my-feature'], tempDirectory)

      const result = run(['brief', 'cancel', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Cannot transition')
    })
  })

  describe('status', () => {
    it('shows brief status and task progress', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)
      setTasks('my-feature', [
        { name: 'Backend model', group: 'backend', status: 'completed' },
        { name: 'API endpoint', group: 'backend', status: 'pending' },
        { name: 'UI component', group: 'frontend', status: 'pending' },
      ])
      setBriefStatus('my-feature', 'active')

      const result = run(['brief', 'status', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('my-feature [active] 1/3 tasks done')
      expect(result.stdout).toContain('backend')
      expect(result.stdout).toContain('[x] Backend model')
      expect(result.stdout).toContain('[ ] API endpoint')
      expect(result.stdout).toContain('frontend')
      expect(result.stdout).toContain('[ ] UI component')
    })

    it('shows active and skipped task indicators', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)
      setTasks('my-feature', [
        { name: 'Active task', status: 'active' },
        { name: 'Skipped task', status: 'skipped' },
      ])

      const result = run(['brief', 'status', 'my-feature'], tempDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('[~] Active task')
      expect(result.stdout).toContain('[-] Skipped task')
    })
  })

  describe('list', () => {
    it('lists all briefs with status and progress', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'feature-a'], tempDirectory)
      run(['brief', 'create', 'feature-b'], tempDirectory)
      run(['brief', 'ready', 'feature-b'], tempDirectory)

      const result = run(['brief', 'list'], tempDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('feature-a')
      expect(result.stdout).toContain('draft')
      expect(result.stdout).toContain('feature-b')
      expect(result.stdout).toContain('ready')
    })

    it('filters by status', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'feature-a'], tempDirectory)
      run(['brief', 'create', 'feature-b'], tempDirectory)
      run(['brief', 'ready', 'feature-b'], tempDirectory)

      const result = run(['brief', 'list', '--status', 'draft'], tempDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('feature-a')
      expect(result.stdout).not.toContain('feature-b')
    })

    it('shows no briefs found when status filter matches nothing', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'feature-a'], tempDirectory)

      const result = run(['brief', 'list', '--status', 'completed'], tempDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('No briefs found')
    })

    it('includes summary for completed briefs', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'my-feature'], tempDirectory)
      setTasks('my-feature', [{ name: 'The task', status: 'completed' }])
      setBriefStatus('my-feature', 'active')
      setSummary('my-feature', 'Added versioning to recipes')
      run(['brief', 'complete', 'my-feature'], tempDirectory)

      const result = run(['brief', 'list'], tempDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Added versioning to recipes')
    })

    it('sorts by updated date', () => {
      tempDirectory = createTempDirectory()
      run(['brief', 'create', 'feature-a'], tempDirectory)
      run(['brief', 'create', 'feature-b'], tempDirectory)
      run(['brief', 'ready', 'feature-b'], tempDirectory)

      const result = run(['brief', 'list'], tempDirectory)

      expect(result.exitCode).toBe(0)
      const lines = result.stdout.trim().split('\n')
      expect(lines[0]).toContain('feature-a')
      expect(lines[1]).toContain('feature-b')
    })

    it('shows message when no briefs exist', () => {
      tempDirectory = createTempDirectory()
      const result = run(['brief', 'list'], tempDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('No briefs found')
    })
  })

  describe('schema', () => {
    it('outputs valid JSON Schema', () => {
      tempDirectory = createTempDirectory()
      const result = run(['brief', 'schema'], tempDirectory)

      expect(result.exitCode).toBe(0)

      const schema = JSON.parse(result.stdout)
      expect(schema).toHaveProperty('brief')
      expect(schema).toHaveProperty('tasks')
      expect(schema.brief).toHaveProperty('$schema')
      expect(schema.tasks).toHaveProperty('$schema')
    })
  })

  describe('full lifecycle', () => {
    it('walks a brief through draft -> ready -> active -> completed', () => {
      tempDirectory = createTempDirectory()

      run(['brief', 'create', 'my-feature'], tempDirectory)
      expect(parseFrontmatter(readFile(briefFile('my-feature')))).toMatchObject({ status: 'draft' })

      run(['brief', 'ready', 'my-feature'], tempDirectory)
      expect(parseFrontmatter(readFile(briefFile('my-feature')))).toMatchObject({ status: 'ready' })

      run(['brief', 'start', 'my-feature'], tempDirectory)
      expect(parseFrontmatter(readFile(briefFile('my-feature')))).toMatchObject({ status: 'active' })

      setTasks('my-feature', [{ name: 'The task', status: 'completed' }])
      setSummary('my-feature', 'Implemented the feature with one task')
      run(['brief', 'complete', 'my-feature'], tempDirectory)
      expect(parseFrontmatter(readFile(briefFile('my-feature')))).toMatchObject({ status: 'completed' })
    })

    it('supports ready -> draft -> ready rework cycle', () => {
      tempDirectory = createTempDirectory()

      run(['brief', 'create', 'my-feature'], tempDirectory)
      run(['brief', 'ready', 'my-feature'], tempDirectory)
      expect(parseFrontmatter(readFile(briefFile('my-feature')))).toMatchObject({ status: 'ready' })

      setBriefStatus('my-feature', 'draft')
      expect(parseFrontmatter(readFile(briefFile('my-feature')))).toMatchObject({ status: 'draft' })

      run(['brief', 'ready', 'my-feature'], tempDirectory)
      expect(parseFrontmatter(readFile(briefFile('my-feature')))).toMatchObject({ status: 'ready' })
    })
  })
})
