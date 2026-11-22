import type { LessonKit } from '../types'
import { Backdrop } from './Backdrop'
import { Hero } from './Hero'
import { ReadingPane } from './blocks/ReadingPane'
import './theme.css'
const kit: LessonKit = {
  slug: 'detection-engineering', Backdrop, Hero,
  blocks: Object.fromEntries([
    'title', 'objectives', 'retrieval', 'scenario', 'concept', 'diagram', 'comparison', 'compare', 'evidence', 'query', 'interaction', 'check', 'recap', 'brief', 'tasks', 'hints', 'deliverables', 'assessment', 'debrief',
  ].map(kind => [kind, ReadingPane])),
}
export default kit
