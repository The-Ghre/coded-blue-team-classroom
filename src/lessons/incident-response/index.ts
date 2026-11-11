import type { LessonKit } from '../types'
import './theme.css'
import Backdrop from './Backdrop'
import Overlay from './Overlay'
import Hero from './Hero'
import Title from './blocks/Title'
import Concept from './blocks/Concept'
import Custody from './blocks/Custody'
import Scenario from './blocks/Scenario'
import Tasks from './blocks/Tasks'

/**
 * Lesson world: incident-response — Safelight.
 *
 * The session is developed in a darkroom. Evidence is a latent image: it
 * fades in a known order and the wrong light destroys it; only fixing makes
 * it permanent. Slides develop out of the dark, every slide is a frame on
 * the negative, and the study pages open on a contact sheet.
 */
const kit: LessonKit = {
  slug: 'incident-response',
  Backdrop,
  Overlay,
  Hero,
  blocks: {
    title: Title,
    concept: Concept,
    evidence: Custody,
    scenario: Scenario,
    tasks: Tasks,
  },
}

export default kit
