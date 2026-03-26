import { z } from 'zod'

export const briefStatus = z.enum(['draft', 'active', 'completed', 'archived'])

export type BriefStatus = z.infer<typeof briefStatus>

export const briefFrontmatter = z.object({
  name: z.string().min(1),
  status: briefStatus,
  created: z.string().date(),
  updated: z.string().date().optional(),
})

export type BriefFrontmatter = z.infer<typeof briefFrontmatter>

/**
 * Valid state transitions for a brief.
 * Each key maps to the set of states it can transition to.
 */
export const briefTransitions: Record<BriefStatus, readonly BriefStatus[]> = {
  draft: ['active'],
  active: ['completed', 'draft'],
  completed: ['archived', 'active'],
  archived: [],
}
