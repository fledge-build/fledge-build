import fs from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createTempDirectory, readFile, run } from './helpers.ts'

let tempDirectory: string

afterEach(() => {
  if (tempDirectory) {
    fs.rmSync(tempDirectory, { recursive: true, force: true })
  }
})

function projectFile(): string {
  return path.join(tempDirectory, '.fledge', 'project.md')
}

describe('fledge init', () => {
  it('creates .fledge/project.md with template', () => {
    tempDirectory = createTempDirectory()
    const result = run(['init'], tempDirectory)

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Initialized project')
    expect(fs.existsSync(projectFile())).toBe(true)
  })

  it('template contains expected sections', () => {
    tempDirectory = createTempDirectory()
    run(['init'], tempDirectory)

    const content = readFile(projectFile())
    expect(content).toContain('# Project')
    expect(content).toContain('## Domain')
    expect(content).toContain('## Data models')
    expect(content).toContain('## APIs')
    expect(content).toContain('## External services')
    expect(content).toContain('## Conventions')
    expect(content).toContain('## Stack')
  })

  it('fails if already initialized', () => {
    tempDirectory = createTempDirectory()
    run(['init'], tempDirectory)
    const result = run(['init'], tempDirectory)

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('already initialized')
  })

  it('creates .fledge directory if it does not exist', () => {
    tempDirectory = createTempDirectory()
    run(['init'], tempDirectory)

    expect(fs.existsSync(path.join(tempDirectory, '.fledge'))).toBe(true)
  })
})
