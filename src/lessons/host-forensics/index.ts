import type { LessonKit } from '../types'
import { Backdrop } from './Backdrop'
import { Hero } from './Hero'
import { Title } from './blocks/Title'
import './theme.css'
const kit: LessonKit = {
  slug: 'host-forensics', Backdrop, Hero,
  blocks: { title: Title },
}
export default kit
