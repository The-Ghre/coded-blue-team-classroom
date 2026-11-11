import type { LessonKit } from '../types'
import { Backdrop } from './Backdrop'
import { Hero } from './Hero'
import './theme.css'

// Shared renderers own all teaching content, interaction gates and feedback.
const kit: LessonKit = { slug: 'soc-operations', Backdrop, Hero }
export default kit
