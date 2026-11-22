import type { LessonKit } from '../types'
import { Backdrop } from './Backdrop'
import { Hero } from './Hero'
import { TitleBlock } from './TitleBlock'
import { ReadingPane } from './ReadingPane'
import './theme.css'

// Shared renderers own all teaching content, interaction gates and feedback.
const kit: LessonKit = { slug: 'soc-operations', Backdrop, Hero, Overlay: ReadingPane, blocks: { title: TitleBlock } }
export default kit
