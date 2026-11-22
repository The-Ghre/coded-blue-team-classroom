import type { Session } from '@/types/content'
import type { PresentationPlan, TeachingBeat } from './types'
import { presentation01 } from './s01'
import { presentation02 } from './s02'
import { presentation03 } from './s03'
import { presentation04 } from './s04'
import { presentation05 } from './s05'
import { presentation06 } from './s06'
import { presentation07 } from './s07'
import { presentation08 } from './s08'
import { presentation09 } from './s09'
import { presentation10 } from './s10'

export const presentationPlans: PresentationPlan[] = [presentation01, presentation02, presentation03, presentation04, presentation05, presentation06, presentation07, presentation08, presentation09, presentation10]
export interface ProjectionFrame extends Omit<TeachingBeat, 'kind'> {
  kind: TeachingBeat['kind'] | 'cover' | 'agenda' | 'section'
  half: 'theory' | 'practical'
  chapter: string
  chapterIndex: number
}
const cache = new Map<string, ProjectionFrame[]>()
export function getPresentation(session: Session): ProjectionFrame[] {
  const existing = cache.get(session.slug)
  if (existing) return existing
  const plan = presentationPlans.find(p => p.slug === session.slug)!
  const first = plan.chapters[0].beats[0].sourceId
  const frames: ProjectionFrame[] = [
    { id: 'cover', sourceId: first, kind: 'cover', title: plan.title, takeaway: plan.throughline, half: 'theory', chapter: session.title, chapterIndex: -1 },
    { id: 'agenda', sourceId: first, kind: 'agenda', title: 'Our route through the session', points: plan.chapters.map(c => c.title), half: 'theory', chapter: session.title, chapterIndex: -1 },
  ]
  plan.chapters.forEach((chapter, chapterIndex) => {
    const shared = { half: chapter.half, chapter: chapter.title, chapterIndex }
    frames.push({ ...shared, id: `section-${chapter.id}`, sourceId: chapter.beats[0].sourceId, kind: 'section', title: chapter.title, points: chapter.outline })
    chapter.beats.forEach(beat => frames.push({ ...beat, ...shared }))
  })
  cache.set(session.slug, frames)
  return frames
}
export function getPresentationIndex(session: Session, sourceId: string, slideId?: string): number {
  if (slideId) {
    const exact = getPresentation(session).findIndex(frame => frame.id === slideId)
    if (exact >= 0) return exact
  }
  return getPresentation(session).findIndex(frame => frame.sourceId === sourceId && !['cover', 'agenda', 'section'].includes(frame.kind))
}
export function buildCount(frame: ProjectionFrame): number {
  if (['cover', 'agenda', 'section', 'question', 'recap', 'activity'].includes(frame.kind)) return 0
  return Math.max(0, (frame.steps?.length ?? frame.columns?.length ?? frame.lines?.length ?? frame.points?.length ?? 1) - 1)
}
