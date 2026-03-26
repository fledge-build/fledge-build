import { defineConfig } from 'rolldown'

export default defineConfig({
  input: {
    brief: 'src/scripts/brief.ts',
    init: 'src/scripts/init.ts',
    skills: 'src/scripts/skills.ts',
  },
  output: {
    dir: 'dist/scripts',
    format: 'esm',
    entryFileNames: '[name].js',
  },
  platform: 'node',
})
