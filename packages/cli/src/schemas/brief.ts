import { z } from 'zod'

export const briefStatus = z.enum(['draft', 'active', 'completed'])

export type BriefStatus = z.infer<typeof briefStatus>

// TODO: Refactor to per-status schemas using z.discriminatedUnion('status', [...])
// so each status variant carries its own validation rules (e.g. summary required
// only for completed, tasks min(1) only for active). This would make the schema
// the single source of truth for transition validation, replacing the manual checks
// in the transition commands.
export const briefFrontmatter = z.object({
  name: z.string().min(1),
  status: briefStatus,
  created: z.iso.date(),
  updated: z.iso.date(),
  summary: z.string().min(1).optional(),
})

export type BriefFrontmatter = z.infer<typeof briefFrontmatter>

/**
 * Valid state transitions for a brief.
 * Each key maps to the set of states it can transition to.
 */
export const briefTransitions: Record<BriefStatus, readonly BriefStatus[]> = {
  draft: ['active'],
  active: ['completed', 'draft'],
  completed: [],
}
