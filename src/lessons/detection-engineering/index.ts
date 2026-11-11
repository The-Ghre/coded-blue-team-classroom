import type { LessonKit } from '../types'
import { Backdrop } from './Backdrop'
import { Hero } from './Hero'
import { Title } from './blocks/Title'
import { Query } from './blocks/Query'
import './theme.css'
const kit: LessonKit = {
  slug: 'detection-engineering', Backdrop, Hero,
  blocks: { title: Title, query: Query },
}
export default kit
