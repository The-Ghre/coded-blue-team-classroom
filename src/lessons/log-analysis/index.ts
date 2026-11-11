import type { LessonKit } from '../types'
import './theme.css'
import Backdrop from './Backdrop'
import Overlay from './Overlay'
import Hero from './Hero'
import Concept from './blocks/Concept'
import Evidence from './blocks/Evidence'
import Interaction from './blocks/LogHunt'
import Query from './blocks/Query'

/**
 * Lesson world: log-analysis — the working graph.
 * A dispatcher's graphic timetable: log sources are stations, time runs
 * across, ordinary activity is scheduled traffic, and the attack is the
 * one unscheduled run. See src/lessons/README.md for the kit API.
 */
const kit: LessonKit = {
  slug: 'log-analysis',
  Backdrop,
  Overlay,
  Hero,
  blocks: {
    concept: Concept,
    evidence: Evidence,
    interaction: Interaction,
    query: Query,
  },
}

export default kit
