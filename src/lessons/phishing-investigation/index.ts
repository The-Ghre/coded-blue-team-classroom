import type { LessonKit } from '../types'
import { Hero } from './Hero'
import { SourceBackdrop } from './SourceBackdrop'
import { TitlePlate } from './blocks/TitlePlate'
import { ReadingPane } from './blocks/ReadingPane'
import './theme.css'

const kit: LessonKit = {
  slug: 'phishing-investigation',
  Backdrop: SourceBackdrop,
  Hero,
  blocks: {
    title: TitlePlate,
    objectives: ReadingPane, retrieval: ReadingPane, scenario: ReadingPane,
    concept: ReadingPane, evidence: ReadingPane, compare: ReadingPane,
    timeline: ReadingPane, query: ReadingPane, chain: ReadingPane, interaction: ReadingPane, check: ReadingPane,
    recap: ReadingPane, brief: ReadingPane, tasks: ReadingPane,
    hints: ReadingPane, deliverables: ReadingPane, assessment: ReadingPane,
    debrief: ReadingPane,
  },
}
export default kit
