import type { LessonKit } from '../types'
import { Backdrop } from './Backdrop'
import { Overlay } from './Overlay'
import { Hero } from './Hero'
import { Title } from './blocks/Title'
import { Concept } from './blocks/Concept'
import { InteractionBlock } from './blocks/InteractionBlock'
import { Query } from './blocks/Query'
import './theme.css'

/**
 * Lesson world: detection-engineering — the coastal chart and its Light List.
 *
 * Every rule is a light with a declared character, range and sector;
 * tuning sets the sector; coverage is the chart of which reaches of the
 * attacker's coast are lit. See theme.css for the palette and type, and
 * src/lessons/README.md for the kit contract.
 */
const kit: LessonKit = {
  slug: 'detection-engineering',
  Backdrop,
  Overlay,
  Hero,
  blocks: {
    title: Title,
    concept: Concept,
    interaction: InteractionBlock,
    query: Query,
  },
}

export default kit
