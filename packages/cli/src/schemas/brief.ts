import { z } from 'zod'

export const briefStatus = z.enum(['draft', 'ready', 'active', 'completed', 'cancelled'])

export type BriefStatus = z.infer<typeof briefStatus>

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
 *
 * draft → ready: brief skill marks the brief as designed and enriched
 * ready → active: implement skill begins implementation
 * ready → draft: brief needs rework
 * active → completed: implement skill finishes all tasks
 * draft/ready/active → cancelled: feature is dropped
 */
export const briefTransitions: Record<BriefStatus, readonly BriefStatus[]> = {
  draft: ['ready', 'cancelled'],
  ready: ['active', 'draft', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}
