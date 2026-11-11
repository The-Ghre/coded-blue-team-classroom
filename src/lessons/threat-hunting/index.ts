import type { BlockOverrides, LessonKit } from '../types'
import './theme.css'
import { Backdrop } from './Backdrop'
import { Hero } from './Hero'
import { Overlay } from './Overlay'
import { TitleOverride } from './blocks/Title'
import { ConceptOverride } from './blocks/Concept'
import { QueryOverride } from './blocks/Query'
import { InteractionOverride } from './blocks/Interaction'

/**
 * Lesson world: threat-hunting — the plate-variety hunt.
 *
 * A specialist examines a sheet of identical stamps for one listed
 * variety. Naming the variety, where it would sit and which lamp shows it
 * is what makes both "found" and "examined, not present" worth recording.
 * See src/lessons/README.md for the kit API.
 */
const blocks: BlockOverrides = {
  title: TitleOverride,
  concept: ConceptOverride,
  query: QueryOverride,
  interaction: InteractionOverride,
}

const kit: LessonKit = {
  slug: 'threat-hunting',
  Backdrop,
  Overlay,
  Hero,
  blocks,
}

export default kit
