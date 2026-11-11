import { useState } from 'react'
import type { Block } from '@/types/content'
import type { BlockOverrideProps } from '../../types'

/** Reading panes retain the shared renderer and its mounted interaction state. */
export function Paged<B extends Block>({ block, mode, Default }: BlockOverrideProps<B>) {
  const [page, setPage] = useState(0)
  if (mode !== 'slide') return <Default block={block} mode={mode} />
  const labels = block.kind === 'query' ? ['Commands', 'Interpretation', 'Result and limits', 'Image prerequisites']
    : block.kind === 'concept' ? (block.redView || block.blueView ? ['Evidence', 'Context and perspectives'] : [])
    : block.kind === 'recap' ? ['Takeaways', 'Further study']
    : block.kind === 'interaction' ? ['Timing', 'Other signals', 'C2 ports', 'Timing finding']
    : block.kind === 'evidence' ? ['Output', 'What it establishes']
    : block.kind === 'brief' ? ['Scenario', 'Objectives and requirements', 'Setup and realism']
    : block.kind === 'deliverables' ? ['Checklist', 'Folder structure']
    : block.kind === 'tasks' ? block.tasks.map(t => `${t.ref} · ${t.title}`)
    : block.kind === 'check' ? block.questions.map((_, i) => `Question ${i + 1}`) : []
  if (!labels.length) return <Default block={block} mode={mode} />
  return <div className={`nm-paged nm-paged--${block.kind}`} data-nm-page={page}>
    <div className="nm-paged__nav" role="group" aria-label="Slide reading pane" data-keys-own>
      {labels.map((label, i) => <button key={label} type="button" aria-pressed={page === i} onClick={() => setPage(i)}>{label}</button>)}
    </div>
    <Default block={block} mode={mode} />
  </div>
}
