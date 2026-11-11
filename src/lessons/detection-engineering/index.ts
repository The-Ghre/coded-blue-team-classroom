import type { LessonKit } from '../types'
import { Backdrop } from './Backdrop'
import { Hero } from './Hero'
import { Title } from './blocks/Title'
import { Query } from './blocks/Query'
import { Controls } from './blocks/Controls'
import './theme.css'
const kit: LessonKit = {
  slug: 'detection-engineering', Backdrop, Hero,
  blocks: { title: Title, query: Query, interaction: Controls, check: Controls, hints: Controls, retrieval: Controls, deliverables: Controls },
}
export default kit
