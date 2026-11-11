import type { ReactNode } from 'react'
import type { Block } from '@/types/content'
import type { RenderMode } from '@/components/teaching/blocks'
import { Duration, MonoLabel, ProvenanceTag, SourceRefs } from '@/components/brand/Brand'
import { Mark } from './marks'

/* Small pieces every re-implemented block needs, matching the shared
   renderer's behaviour: study-only depth and provenance, slide-sparse. */

export function Head({ block, children }: { block: Block; children?: ReactNode }) {
  return (
    <header className="block__head">
      <h2 className="block__title">{block.title}</h2>
      {block.minutes !== undefined && (
        <div className="block__meta">
          <Duration minutes={block.minutes} />
        </div>
      )}
      {children}
    </header>
  )
}

export function Detail({
  detail,
  mode,
  render,
}: {
  detail?: string[]
  mode: RenderMode
  /** Optional structured rendering for a paragraph; return null to fall back to prose. */
  render?: (p: string, i: number) => ReactNode | null
}) {
  if (mode !== 'study' || !detail?.length) return null
  return (
    <div className="detail">
      <MonoLabel>Going deeper</MonoLabel>
      <div className="prose">
        {detail.map((p, i) => {
          const custom = render?.(p, i)
          return custom ? <div key={i}>{custom}</div> : <p key={i}>{p}</p>
        })}
      </div>
    </div>
  )
}

export function Footer({ block, mode }: { block: Block; mode: RenderMode }) {
  if (mode !== 'study') return null
  if (!block.provenance && !block.sources?.length) return null
  return (
    <footer className="block__footer">
      {block.provenance && <ProvenanceTag provenance={block.provenance} />}
      <SourceRefs refs={block.sources} />
    </footer>
  )
}

/** The three hunt outcomes, as an expertizing committee would mark them. */
export type Outcome = 'confirmed' | 'refuted' | 'inconclusive'

export function outcomeOf(text: string): Outcome | null {
  const t = text.toLowerCase()
  if (/\bconfirmed\b/.test(t)) return 'confirmed'
  if (/\brefuted\b/.test(t)) return 'refuted'
  if (/\binconclusive\b/.test(t)) return 'inconclusive'
  return null
}

const OUTCOME_MARK = { confirmed: 'tick', refuted: 'rule', inconclusive: 'wave' } as const

/** A handstamped outcome mark: double-ruled frame, the outcome word, the text. */
export function OutcomeMark({ outcome, children, word }: { outcome: Outcome; children: ReactNode; word?: string }) {
  return (
    <div className="th-mark" data-outcome={outcome}>
      <div className="th-mark__stamp">
        <Mark kind={OUTCOME_MARK[outcome]} className="th-mark__glyph" />
        <span className="th-mark__word">{word ?? outcome}</span>
      </div>
      <div className="th-mark__text">{children}</div>
    </div>
  )
}

/**
 * "Three outcomes, three actions. Confirmed: … Refuted: … Inconclusive: …"
 * renders as three marks; anything else returns null and stays prose.
 */
export function renderOutcomesParagraph(p: string): ReactNode | null {
  const m = p.match(/^(.*?)\s*Confirmed:\s*(.+?)\s*Refuted:\s*(.+?)\s*Inconclusive:\s*(.+)$/)
  if (!m) return null
  const [, intro, c, r, i] = m
  return (
    <div className="th-marks th-marks--detail">
      {intro && <p className="th-marks__intro">{intro}</p>}
      <OutcomeMark outcome="confirmed" word="Confirmed">
        <p>{c}</p>
      </OutcomeMark>
      <OutcomeMark outcome="refuted" word="Refuted">
        <p>{r}</p>
      </OutcomeMark>
      <OutcomeMark outcome="inconclusive" word="Inconclusive">
        <p>{i}</p>
      </OutcomeMark>
    </div>
  )
}
