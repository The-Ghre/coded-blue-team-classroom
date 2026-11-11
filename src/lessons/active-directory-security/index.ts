import { createElement } from 'react'
import type { BlockOverrideProps, BlockOverrides, LessonKit } from '../types'
import type { Block, EvidenceBlock } from '@/types/content'
import './theme.css'
import Backdrop from './Backdrop'
import Overlay from './Overlay'
import Hero from './Hero'
import { TitleSheet } from './blocks/TitleSheet'
import { ConceptSheet } from './blocks/Concept'
import { Climb, canClimb } from './blocks/Climb'
import { Sheet } from './blocks/Sheet'

/**
 * Lesson world: active-directory-security — AS-BUILT.
 * The domain as a building's construction drawings: a floor plan nobody
 * re-drew, a red route through doors keyed years ago, a section that climbs
 * one storey per event, and a key revision issued twice. See theme.css for
 * the palette and src/lessons/README.md for the kit contract.
 */

function EvidenceSheet(props: BlockOverrideProps<EvidenceBlock>) {
  if (canClimb(props.block)) return createElement(Climb, props)
  return createElement(Sheet, props as unknown as BlockOverrideProps<Block>)
}

/* Every kind the world does not rebuild gets the sheet wrapper. */
const WRAPPED: Block['kind'][] = [
  'retrieval',
  'scenario',
  'objectives',
  'compare',
  'timeline',
  'query',
  'chain',
  'check',
  'interaction',
  'brief',
  'tasks',
  'hints',
  'deliverables',
  'assessment',
  'debrief',
  'recap',
]

const blocks = {
  ...Object.fromEntries(WRAPPED.map((k) => [k, Sheet])),
  title: TitleSheet,
  concept: ConceptSheet,
  evidence: EvidenceSheet,
} as unknown as BlockOverrides

const kit: LessonKit = {
  slug: 'active-directory-security',
  Backdrop,
  Overlay,
  Hero,
  blocks,
}

export default kit
