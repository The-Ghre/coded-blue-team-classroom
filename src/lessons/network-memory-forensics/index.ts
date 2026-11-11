import type { LessonKit } from '../types'
import { Backdrop } from './Backdrop'
import { Overlay } from './Overlay'
import { Hero } from './Hero'
import { Title } from './blocks/Title'
import { Concept, Scenario } from './blocks/Prints'
import { Interaction } from './blocks/Beacon'
import { Evidence } from './blocks/Evidence'
import './theme.css'

/**
 * Lesson world: network-memory-forensics — the darkroom.
 *
 * Evidence here is a latent image: it exists until the light comes on, and
 * has to be developed before isolation fogs it. A beacon is a roll shot by
 * an interval timer; on the contact sheet its frames line up identical and
 * evenly spaced, where a person's roll is bursts and gaps.
 *
 * Backdrop  the developing tray (WebGL): the slide's argument develops out
 *           of grain under an amber safelight.
 * Overlay   the roll: film rebate down the left edge, one frame per slide.
 * Hero      a contact sheet header for study, workshop and overview.
 * blocks    title (contact sheet), scenario / concept (one print each),
 *           beacon analyzer (exposure print), evidence (marked print).
 */
const kit: LessonKit = {
  slug: 'network-memory-forensics',
  Backdrop,
  Overlay,
  Hero,
  blocks: {
    title: Title,
    scenario: Scenario,
    concept: Concept,
    interaction: Interaction,
    evidence: Evidence,
  },
}

export default kit
