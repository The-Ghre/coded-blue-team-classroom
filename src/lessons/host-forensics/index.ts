import type { LessonKit } from '../types'
import { Backdrop } from './Backdrop'
import { Hero } from './Hero'
import { Title } from './blocks/Title'
import { ReadingPanes } from './blocks/ReadingPanes'
import './theme.css'
const kit: LessonKit = {
  slug: 'host-forensics', Backdrop, Hero,
  blocks: { title: Title, compare: ReadingPanes, concept: ReadingPanes, evidence: ReadingPanes, check: ReadingPanes, tasks: ReadingPanes, hints: ReadingPanes, brief: ReadingPanes, deliverables: ReadingPanes, recap: ReadingPanes },
}
export default kit
