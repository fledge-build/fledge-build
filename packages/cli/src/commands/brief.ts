import { defineCommand } from 'citty'
import complete from './brief/complete.ts'
import create from './brief/create.ts'
import list from './brief/list.ts'
import schema from './brief/schema.ts'
import start from './brief/start.ts'
import status from './brief/status.ts'
import validate from './brief/validate.ts'

export default defineCommand({
  meta: {
    name: 'brief',
    description: 'Manage feature briefs',
  },
  subCommands: {
    complete,
    create,
    list,
    schema,
    start,
    status,
    validate,
  },
})
