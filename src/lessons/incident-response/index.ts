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

/** Preservation Ledger: acquire volatile traces, verify copies, retain custody. */
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
