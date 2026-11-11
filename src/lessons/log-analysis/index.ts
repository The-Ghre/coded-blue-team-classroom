import type { BlockOverrides, LessonKit } from '../types'
import './theme.css'
import Backdrop from './Backdrop'
import Hero from './Hero'
import ReadingPane from './ReadingPane'

/** Field Join: raw records, shared fields, independent sources. */
const blocks = Object.fromEntries(
  ['title', 'retrieval', 'scenario', 'objectives', 'concept', 'compare', 'evidence',
    'timeline', 'query', 'chain', 'check', 'interaction', 'brief', 'tasks', 'hints',
    'deliverables', 'assessment', 'debrief', 'recap'].map(kind => [kind, ReadingPane]),
) as BlockOverrides
const kit: LessonKit = { slug: 'log-analysis', Backdrop, Hero, blocks }
export default kit
