import type { BlockOverrides, LessonKit } from '../types'
import './theme.css'
import { Backdrop } from './Backdrop'
import { Hero } from './Hero'
import { TitleOverride } from './blocks/Title'
import { ConceptOverride } from './blocks/Concept'
import { QueryOverride } from './blocks/Query'
import { InteractionOverride } from './blocks/Interaction'

/** The Long Tail: hypothesis, frequency, outcome, reusable detection. */
const blocks: BlockOverrides = {
  title: TitleOverride,
  concept: ConceptOverride,
  query: QueryOverride,
  interaction: InteractionOverride,
}

const kit: LessonKit = {
  slug: 'threat-hunting',
  Backdrop,
  Hero,
  blocks,
}

export default kit
