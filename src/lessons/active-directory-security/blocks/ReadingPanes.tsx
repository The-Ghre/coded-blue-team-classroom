import { useState } from 'react'
import type { Block } from '@/types/content'
import type { BlockOverrideProps } from '../../types'

/** Projection panes preserve the shared renderer, including its state and feedback.
 * All panes stay mounted so paging never resets a learner's selected answer. */
function divide(block: Block): Block[] {
  switch (block.kind) {
    case 'compare': return Array.from({ length: Math.ceil(block.rows.length / 3) }, (_, i) => ({ ...block, rows: block.rows.slice(i * 3, i * 3 + 3) }))
    case 'concept': return block.id === 'krbtgt' ? [block] : [
      ...Array.from({ length: Math.ceil(block.points.length / 3) }, (_, i) => ({ ...block, points: block.points.slice(i * 3, i * 3 + 3), lead: i === 0 ? block.lead : undefined, diagram: i === 0 ? block.diagram : undefined, redView: undefined, blueView: undefined, callout: undefined })),
      { ...block, lead: undefined, points: [], diagram: undefined },
    ]
    case 'evidence': return [block] /* The authored privilege replay remains one persistent interaction. */
    case 'scenario': return block.narrative.map((text, i) => ({ ...block, narrative: [text], drivingQuestion: i === block.narrative.length - 1 ? block.drivingQuestion : '' }))
    case 'assessment': return Array.from({ length: Math.ceil(block.criteria.length / 2) }, (_, i) => ({ ...block, criteria: block.criteria.slice(i * 2, i * 2 + 2) }))
    case 'debrief': return Array.from({ length: Math.ceil(block.questions.length / 3) }, (_, i) => ({ ...block, questions: block.questions.slice(i * 3, i * 3 + 3), landingPoint: i === Math.ceil(block.questions.length / 3) - 1 ? block.landingPoint : '' }))
    case 'check': return block.questions.map(q => ({ ...block, questions: [q] }))
    case 'tasks': return block.tasks.map(task => ({ ...block, tasks: [task] }))
    case 'hints': return block.hints.map(hint => ({ ...block, hints: [hint] }))
    case 'brief': return [
      { ...block, requires: [], setup: [], realism: '' },
      { ...block, scenario: '', objectives: [], setup: [], realism: '' },
      { ...block, scenario: '', objectives: [], requires: [], realism: '' },
      { ...block, scenario: '', objectives: [], requires: [], setup: [] },
    ]
    case 'deliverables': return [...Array.from({ length: Math.ceil(block.items.length / 3) }, (_, i) => ({ ...block, items: block.items.slice(i * 3, i * 3 + 3), structure: undefined })), { ...block, items: [] }]
    case 'recap': return [...Array.from({ length: Math.ceil(block.takeaways.length / 3) }, (_, i) => ({ ...block, takeaways: block.takeaways.slice(i * 3, i * 3 + 3), furtherStudy: [] })), { ...block, takeaways: [] }]
    default: return [block]
  }
}
function PaneReader<B extends Block>({ block, mode, Default }: BlockOverrideProps<B>) {
  const [page, setPage] = useState(0)
  if (mode !== 'slide') return <Default block={block} mode={mode} />
  const panes = divide(block) as B[]
  return <div className="ad-reader">
    {block.kind === 'tasks' && <p className="ad-reader__budget">Suggested timing · {block.tasks.length} tasks · {block.tasks.reduce((total, task) => total + task.minutes, 0)} minutes total</p>}
    {panes.map((pane, i) => <div key={i} hidden={page !== i} className="ad-reader__pane" tabIndex={0} role="region" aria-label={`${block.title}, reading pane ${i + 1}`} onKeyDown={event => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) event.stopPropagation() }}><Default block={pane} mode={mode} /></div>)}
    <nav data-keys-own className="ad-reader__nav" aria-label={`${block.title} reading panes`}>
      <button className="btn btn--sm" type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous pane</button>
      <span aria-live="polite">Pane {page + 1} / {panes.length} · Scroll to read</span>
      <button className="btn btn--sm" type="button" disabled={page === panes.length - 1} onClick={() => setPage(page + 1)}>Next pane</button>
    </nav>
  </div>
}

export function ReadingPanes<B extends Block>(props: BlockOverrideProps<B>) { return <PaneReader key={props.block.id} {...props} /> }
