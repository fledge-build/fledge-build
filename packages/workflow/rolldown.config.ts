import { defineConfig } from 'rolldown'

export default defineConfig({
  input: {
    brief: 'src/scripts/brief.ts',
    skills: 'src/scripts/skills.ts',
  },
  output: {
    dir: 'dist/scripts',
    format: 'esm',
    entryFileNames: '[name].js',
    banner: '#!/usr/bin/env node',
  },
  platform: 'node',
})
