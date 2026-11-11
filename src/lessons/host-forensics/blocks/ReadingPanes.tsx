import { useState } from 'react'
import type { Block } from '@/types/content'
import type { BlockOverrideProps } from '../../types'

/** Projection panes preserve the shared renderer, including its state and feedback.
 * All panes stay mounted so paging never resets a learner's selected answer. */
function divide(block: Block): Block[] {
  switch (block.kind) {
    case 'compare': return Array.from({ length: Math.ceil(block.rows.length / 3) }, (_, i) => ({ ...block, rows: block.rows.slice(i * 3, i * 3 + 3) }))
    case 'concept': return [
      { ...block, redView: undefined, blueView: undefined, callout: undefined },
      { ...block, lead: undefined, points: [], diagram: undefined },
    ]
    case 'evidence': return [
      ...block.lines.map(line => ({ ...block, lines: [line], proves: [], doesNotProve: [] })),
      { ...block, lines: [], proves: block.proves, doesNotProve: [] },
      { ...block, lines: [], proves: [], doesNotProve: block.doesNotProve },
    ]
    case 'check': return block.questions.map(q => ({ ...block, questions: [q] }))
    case 'tasks': return block.tasks.map(task => ({ ...block, tasks: [task] }))
    case 'hints': return block.hints.map(hint => ({ ...block, hints: [hint] }))
    case 'brief': return [
      { ...block, requires: [], setup: [], realism: '' },
      { ...block, scenario: '', objectives: [], setup: [], realism: '' },
      { ...block, scenario: '', objectives: [], requires: [] },
    ]
    case 'recap': return [{ ...block, furtherStudy: [] }, { ...block, takeaways: [] }]
    default: return [block]
  }
}
function PaneReader<B extends Block>({ block, mode, Default }: BlockOverrideProps<B>) {
  const [page, setPage] = useState(0)
  if (mode !== 'slide') return <Default block={block} mode={mode} />
  const panes = divide(block) as B[]
  return <div className="hf-reader">
    {panes.map((pane, i) => <div key={i} hidden={page !== i} className="hf-reader__pane"><Default block={pane} mode={mode} /></div>)}
    {panes.length > 1 && <nav className="hf-reader__nav" aria-label={`${block.title} reading panes`}>
      <button className="btn btn--sm" type="button" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous pane</button>
      <span aria-live="polite">{page + 1} / {panes.length}</span>
      <button className="btn btn--sm" type="button" disabled={page === panes.length - 1} onClick={() => setPage(page + 1)}>Next pane</button>
    </nav>}
  </div>
}

export function ReadingPanes<B extends Block>(props: BlockOverrideProps<B>) { return <PaneReader key={props.block.id} {...props} /> }
