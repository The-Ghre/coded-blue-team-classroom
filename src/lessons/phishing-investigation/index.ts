import type { LessonKit } from '../types'
import { Hero } from './Hero'
import { SourceBackdrop } from './SourceBackdrop'
import { TitlePlate } from './blocks/TitlePlate'
import './theme.css'

const kit: LessonKit = {
  slug: 'phishing-investigation',
  Backdrop: SourceBackdrop,
  Hero,
  blocks: { title: TitlePlate },
}
export default kit
