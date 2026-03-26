import fs from 'node:fs'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { parseFrontmatter } from '../src/frontmatter.ts'
import { SKILLS_DIRECTORY } from '../src/skills.ts'
import { createTempDirectory, readFile, run, writeFile } from './helpers.ts'

let sourceDirectory: string
let targetDirectory: string

afterEach(() => {
  if (sourceDirectory) {
    fs.rmSync(sourceDirectory, { recursive: true, force: true })
  }
  if (targetDirectory) {
    fs.rmSync(targetDirectory, { recursive: true, force: true })
  }
})

function createSingleSkillPackage(name: string, frontmatter: string): string {
  const directory = createTempDirectory()
  writeFile(path.join(directory, 'package.json'), JSON.stringify({ name }))
  writeFile(path.join(directory, 'skill', 'SKILL.md'), frontmatter)
  return directory
}

function createMultiSkillPackage(name: string, skills: Record<string, string>): string {
  const directory = createTempDirectory()
  writeFile(path.join(directory, 'package.json'), JSON.stringify({ name }))
  for (const [skillName, frontmatter] of Object.entries(skills)) {
    writeFile(path.join(directory, 'skills', skillName, 'SKILL.md'), frontmatter)
  }
  return directory
}

function installedSkillPath(target: string, skillName: string): string {
  return path.join(target, SKILLS_DIRECTORY, skillName)
}

function installedSkillFile(target: string, skillName: string): string {
  return path.join(installedSkillPath(target, skillName), 'SKILL.md')
}

describe('fledge skills', () => {
  describe('install', () => {
    describe('single skill package', () => {
      it('installs a skill from a package with skill/ directory', () => {
        sourceDirectory = createSingleSkillPackage('@fledge/vue', [
          '---',
          'name: vue-core',
          'description: Vue conventions',
          '---',
          '',
        ].join('\n'))
        targetDirectory = createTempDirectory()

        const result = run(['skills', 'install', sourceDirectory, '--target', targetDirectory], targetDirectory)

        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('Installed skill "fledge-vue"')
        expect(fs.existsSync(installedSkillFile(targetDirectory, 'fledge-vue'))).toBe(true)
      })

      it('updates the skill name in SKILL.md frontmatter', () => {
        sourceDirectory = createSingleSkillPackage('@fledge/vue', [
          '---',
          'name: vue-core',
          'description: Vue conventions',
          '---',
          '',
        ].join('\n'))
        targetDirectory = createTempDirectory()

        run(['skills', 'install', sourceDirectory, '--target', targetDirectory], targetDirectory)

        const data = parseFrontmatter(readFile(installedSkillFile(targetDirectory, 'fledge-vue')))
        expect(data).toMatchObject({ name: 'fledge-vue' })
      })

      it('writes a .gitignore in the installed skill directory', () => {
        sourceDirectory = createSingleSkillPackage('@fledge/vue', [
          '---',
          'name: vue-core',
          'description: Vue conventions',
          '---',
          '',
        ].join('\n'))
        targetDirectory = createTempDirectory()

        run(['skills', 'install', sourceDirectory, '--target', targetDirectory], targetDirectory)

        const gitignore = readFile(path.join(installedSkillPath(targetDirectory, 'fledge-vue'), '.gitignore'))
        expect(gitignore).toBe('*\n')
      })

      it('replaces an existing installation', () => {
        sourceDirectory = createSingleSkillPackage('@fledge/vue', [
          '---',
          'name: vue-core',
          'description: Vue conventions',
          '---',
          '',
        ].join('\n'))
        targetDirectory = createTempDirectory()

        run(['skills', 'install', sourceDirectory, '--target', targetDirectory], targetDirectory)
        run(['skills', 'install', sourceDirectory, '--target', targetDirectory], targetDirectory)

        expect(fs.existsSync(installedSkillFile(targetDirectory, 'fledge-vue'))).toBe(true)
      })
    })

    describe('multi skill package', () => {
      it('installs all skills from a package with skills/ directory', () => {
        sourceDirectory = createMultiSkillPackage('@fledge/workflow', {
          brief: '---\nname: brief\ndescription: Brief lifecycle\n---\n',
          explore: '---\nname: explore\ndescription: Codebase exploration\n---\n',
        })
        targetDirectory = createTempDirectory()

        const result = run(['skills', 'install', sourceDirectory, '--target', targetDirectory], targetDirectory)

        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('Installed skill "fledge-workflow-brief"')
        expect(result.stdout).toContain('Installed skill "fledge-workflow-explore"')
        expect(fs.existsSync(installedSkillFile(targetDirectory, 'fledge-workflow-brief'))).toBe(true)
        expect(fs.existsSync(installedSkillFile(targetDirectory, 'fledge-workflow-explore'))).toBe(true)
      })

      it('updates the skill name in each SKILL.md', () => {
        sourceDirectory = createMultiSkillPackage('@fledge/workflow', {
          brief: '---\nname: brief\ndescription: Brief lifecycle\n---\n',
        })
        targetDirectory = createTempDirectory()

        run(['skills', 'install', sourceDirectory, '--target', targetDirectory], targetDirectory)

        const data = parseFrontmatter(readFile(installedSkillFile(targetDirectory, 'fledge-workflow-brief')))
        expect(data).toMatchObject({ name: 'fledge-workflow-brief' })
      })
    })

    it('fails if no skill directory is found', () => {
      sourceDirectory = createTempDirectory()
      writeFile(path.join(sourceDirectory, 'package.json'), JSON.stringify({ name: '@fledge/empty' }))
      targetDirectory = createTempDirectory()

      const result = run(['skills', 'install', sourceDirectory, '--target', targetDirectory], targetDirectory)

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('No skill/ or skills/ directory found')
    })
  })

  describe('list', () => {
    it('lists installed skills', () => {
      targetDirectory = createTempDirectory()
      sourceDirectory = createSingleSkillPackage('@fledge/vue', [
        '---',
        'name: fledge-vue',
        'description: Vue conventions',
        'metadata:',
        '  type: technology',
        '---',
        '',
      ].join('\n'))

      run(['skills', 'install', sourceDirectory, '--target', targetDirectory], targetDirectory)
      const result = run(['skills', 'list'], targetDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('fledge-vue')
      expect(result.stdout).toContain('technology')
      expect(result.stdout).toContain('Vue conventions')
    })

    it('filters by type', () => {
      targetDirectory = createTempDirectory()

      const techSource = createSingleSkillPackage('@fledge/vue', [
        '---',
        'name: fledge-vue',
        'description: Vue conventions',
        'metadata:',
        '  type: technology',
        '---',
        '',
      ].join('\n'))
      run(['skills', 'install', techSource, '--target', targetDirectory], targetDirectory)
      fs.rmSync(techSource, { recursive: true, force: true })

      const workflowSource = createMultiSkillPackage('@fledge/workflow', {
        brief: '---\nname: brief\ndescription: Brief lifecycle\nmetadata:\n  type: workflow\n---\n',
      })
      run(['skills', 'install', workflowSource, '--target', targetDirectory], targetDirectory)
      fs.rmSync(workflowSource, { recursive: true, force: true })

      sourceDirectory = '' // already cleaned up

      const techResult = run(['skills', 'list', '--type', 'technology'], targetDirectory)
      expect(techResult.stdout).toContain('fledge-vue')
      expect(techResult.stdout).not.toContain('fledge-workflow-brief')

      const workflowResult = run(['skills', 'list', '--type', 'workflow'], targetDirectory)
      expect(workflowResult.stdout).toContain('fledge-workflow-brief')
      expect(workflowResult.stdout).not.toContain('fledge-vue')
    })

    it('shows message when no skills are installed', () => {
      targetDirectory = createTempDirectory()
      const result = run(['skills', 'list'], targetDirectory)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('No skills found')
    })
  })
})
