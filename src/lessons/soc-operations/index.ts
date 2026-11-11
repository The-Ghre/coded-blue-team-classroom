import type { LessonKit } from '../types'
import { Backdrop } from './Backdrop'
import { Hero } from './Hero'
import { TitleBlock } from './TitleBlock'
import { ConceptBlock } from './ConceptBlock'
import { EvidenceBlock } from './EvidenceBlock'
import { InteractionBlock } from './TriageTag'
import './theme.css'

/**
 * Lesson world: soc-operations — the dispatch triage tag.
 *
 * Triage is routing, not investigating. Every slide is a manila tag lying
 * in the pool of one desk lamp at night; deciding means tearing a routing
 * strip. Green CLOSE, yellow TIER 2 and red INCIDENT appear only where a
 * routing decision lives.
 */
const kit: LessonKit = {
  slug: 'soc-operations',
  Backdrop,
  Hero,
  blocks: {
    title: TitleBlock,
    concept: ConceptBlock,
    evidence: EvidenceBlock,
    interaction: InteractionBlock,
  },
}

export default kit
