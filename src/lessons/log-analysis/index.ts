import type { LessonKit } from '../types'
import './theme.css'
import Backdrop from './Backdrop'
import Hero from './Hero'

/** Field Join: raw records, shared fields, independent sources. */
const kit: LessonKit = { slug: 'log-analysis', Backdrop, Hero }
export default kit
