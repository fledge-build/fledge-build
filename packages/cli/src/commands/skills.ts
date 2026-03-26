import { defineCommand } from 'citty'
import install from './skills/install.ts'
import list from './skills/list.ts'

export default defineCommand({
  meta: {
    name: 'skills',
    description: 'Manage skill packages',
  },
  subCommands: {
    install,
    list,
  },
})
