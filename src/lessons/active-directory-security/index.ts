import { createElement, useMemo } from 'react'
import type { BlockOverrideProps, BlockOverrides, LessonKit } from '../types'
import type { Block, EvidenceBlock } from '@/types/content'
import './theme.css'
import Backdrop from './Backdrop'
import Overlay from './Overlay'
import Hero from './Hero'
import { TitleSheet } from './blocks/TitleSheet'
import { ConceptSheet } from './blocks/Concept'
import { Climb, canClimb } from './blocks/Climb'
import { ReadingPanes } from './blocks/ReadingPanes'
import { Sheet } from './blocks/Sheet'

/** Effective Access: directory relationships, credential propagation and revocation. */

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

/** Stable adapter identities also preserve state when presentation chrome changes. */
function withReader(Renderer: typeof Sheet) {
  return function ReaderOverride(props: BlockOverrideProps) {
    const Content = useMemo(() => function PaneContent(paneProps: Pick<BlockOverrideProps, 'block' | 'mode'>) {
      return createElement(Renderer, { ...paneProps, Default: props.Default })
    }, [props.Default])
    return createElement(ReadingPanes, { ...props, Default: Content })
  }
}

const kit: LessonKit = {
  slug: 'active-directory-security',
  Backdrop,
  Overlay,
  Hero,
  blocks: Object.fromEntries(Object.entries(blocks).map(([kind, Renderer]) =>
    [kind, withReader(Renderer as typeof Sheet)]
  )) as BlockOverrides,
}

export default kit
