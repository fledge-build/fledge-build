import { defineCommand } from 'citty'
import cancel from './brief/cancel.ts'
import complete from './brief/complete.ts'
import create from './brief/create.ts'
import list from './brief/list.ts'
import ready from './brief/ready.ts'
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
    cancel,
    complete,
    create,
    list,
    ready,
    schema,
    start,
    status,
    validate,
  },
})
