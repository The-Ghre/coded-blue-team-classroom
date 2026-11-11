import type { LessonKit } from '../types'
import { Backdrop } from './Backdrop'
import { Hero } from './Hero'
import { Title } from './blocks/Title'
import { Concept } from './blocks/Concept'
import { Compare } from './blocks/Compare'
import { Evidence } from './blocks/Evidence'
import './theme.css'

/**
 * Lesson world: host-forensics — the pile remembers.
 *
 * The lesson is laid on office carpet tiles whose nap records every pass.
 * Windows (plum) and Linux (petrol) are two carpets meeting at a brass
 * threshold. A walker crosses them one stretch per slide; the cleaner's
 * vacuum erases what lies under its lanes and leaves its own stripes.
 *
 *   Backdrop.tsx      who walks, and when the cleaner comes
 *   pile/             the WebGL carpet and the shared trail record
 *   Hero.tsx          study, workshop and overview header
 *   blocks/           title, concept, compare and evidence in this world's form
 *   theme.css         palette, type, components and slide transitions
 */
const kit: LessonKit = {
  slug: 'host-forensics',
  Backdrop,
  Hero,
  blocks: {
    title: Title,
    concept: Concept,
    compare: Compare,
    evidence: Evidence,
  },
}

export default kit
