import type { LessonKit } from '../types'
import { Backdrop } from './Backdrop'
import { Hero } from './Hero'
import { Title } from './blocks/Title'
import { Paged } from './blocks/Paged'
import './theme.css'

const kit: LessonKit = {
  slug: 'network-memory-forensics',
  Backdrop,
  Hero,
  blocks: { title: Title, concept: Paged, recap: Paged, query: Paged, interaction: Paged, evidence: Paged, brief: Paged, tasks: Paged, check: Paged, deliverables: Paged },
}
export default kit
