/**
 * Shared argument definition for the `--project-dir` flag used by all brief subcommands.
 */
export const projectDirectory = {
  // type: 'string' as const,
  required: false as const,
  alias: 'project-dir',
  description: 'Project root directory. Overrides cwd() for locating .fledge/briefs/.',
} as const
