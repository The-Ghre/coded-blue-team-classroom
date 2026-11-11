import type { LessonKit } from '../types'
import './theme.css'
import { Water } from './Water'
import { Hero } from './Hero'
import { TitlePlate } from './blocks/TitlePlate'
import { HeaderEvidence } from './blocks/HeaderEvidence'
import { ConceptPlate } from './blocks/ConceptPlate'
import { InteractionPlate } from './blocks/TriageSoundings'

/**
 * Lesson world: phishing-investigation — "The Lure".
 *
 * A phishing email is a lure: a painted counterfeit with a hook, on a line
 * held by someone the target cannot see. The world is lake water seen from
 * below; the investigation follows the line back to the hand.
 */
const kit: LessonKit = {
  slug: 'phishing-investigation',
  Backdrop: Water,
  Hero,
  blocks: {
    title: TitlePlate,
    evidence: HeaderEvidence,
    concept: ConceptPlate,
    interaction: InteractionPlate,
  },
}

export default kit
