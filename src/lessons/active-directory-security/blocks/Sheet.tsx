import type { Block } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { Bubble } from './parts'

/**
 * Every block the world does not rebuild keeps the shared renderer, set on
 * a sheet with its detail bubble, so content edits flow straight through.
 */
/* The shared head's label for each kind, so a label that only repeats the
   title ("Knowledge check" over "Knowledge check") can be left off the
   drawing title rather than said twice. */
const KICKER: Partial<Record<Block['kind'], string>> = {
  retrieval: 'Retrieval',
  scenario: 'Opening scenario',
  objectives: 'Learning objectives',
  compare: 'Comparison',
  timeline: 'Timeline',
  query: 'Query walkthrough',
  chain: 'Attack chain',
  check: 'Knowledge check',
  interaction: 'Interactive exercise',
  brief: 'Practical briefing',
  tasks: 'Student tasks',
  hints: 'Progressive hints',
  deliverables: 'Deliverables',
  assessment: 'Assessment criteria',
  debrief: 'Debrief',
  recap: 'Recap',
}

function echoes(kind: Block['kind'], title: string): boolean {
  const kicker = KICKER[kind]
  if (!kicker) return false
  const t = title.toLowerCase()
  return kicker
    .toLowerCase()
    .split(/\s+/)
    .some((w) => w.length >= 4 && new RegExp(`\\b${w}\\b`).test(t))
}

export function Sheet({ block, mode, Default }: BlockOverrideProps<Block>) {
  return (
    <div className="adw-wrap" data-kind={block.kind} data-echo={echoes(block.kind, block.title) || undefined}>
      <Bubble id={block.id} />
      <Default block={block} mode={mode} />
    </div>
  )
}
