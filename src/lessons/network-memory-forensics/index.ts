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
 * Lesson world: network-memory-forensics — the music box.
 *
 * You can hear a music box from across the room and its beat never wavers:
 * that is the network, and regularity is the signature of a machine. To
 * know what it will play you must open the lid and read the cylinder: that
 * is memory. The printed score is the disk; it shows the tune but not the
 * pin someone added.
 *
 * Backdrop  the mechanism (canvas): a pinned cylinder turning, each pin
 *           plucking a tooth, the slide's argument set in pins.
 * Overlay   the comb: one tuned tooth per slide down the left edge.
 * Hero      the cylinder plate for study, workshop and overview.
 * blocks    title (the cylinder unrolled), scenario / concept (one score
 *           each), beacon analyzer (pin print and sound), evidence (bracketed
 *           manuscript).
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
