import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { BlockOverrideProps } from '../../types'
import type { ConceptBlock } from '@/types/content'
import type { RenderMode } from '@/components/teaching/blocks'
import { Callout, MonoLabel, RedBlue, SyntheticBadge } from '@/components/brand/Brand'
import { Diagram } from '@/components/teaching/Diagram'
import { useReducedMotion } from '@/motion'
import { Detail, Footer, Head, OutcomeMark, outcomeOf, renderOutcomesParagraph } from '../parts'

/* Concepts that need a structurally different form get one; the rest wrap
   the shared renderer. Every form falls back to the shared renderer when
   the content no longer has the shape it was built for. */
export function ConceptOverride(props: BlockOverrideProps<ConceptBlock>) {
  const { block, mode, Default } = props
  if (block.id === 'hypothesis') {
    const parsed = parseFormat(block.points)
    if (parsed) return <HypothesisSheet block={block} mode={mode} parsed={parsed} />
  }
  if (block.id === 'baseline') return <StackCount block={block} mode={mode} />
  if (block.id === 'pipeline') {
    const steps = splitSteps(block.points[0] ?? '')
    if (steps.length >= 3) return <Pipeline block={block} mode={mode} steps={steps} />
  }
  return <Default block={block} mode={mode} />
}

function Tail({
  block,
  mode,
  render,
}: {
  block: ConceptBlock
  mode: RenderMode
  render?: (p: string) => ReactNode | null
}) {
  return (
    <>
      {block.diagram && <Diagram spec={block.diagram} />}
      {block.callout && <Callout tone={block.callout.tone}>{block.callout.text}</Callout>}
      <RedBlue red={block.redView} blue={block.blueView} />
      <Detail detail={block.detail} mode={mode} render={render} />
      <Footer block={block} mode={mode} />
    </>
  )
}

/* =========================================================================
   The hypothesis — an album page with four printed spaces
   ========================================================================= */

interface Parsed {
  label?: string
  parts: { text: string; slot?: number }[]
  slots: string[]
  /** point index -> slot number (1-based) */
  notes: { slot: number; name: string; text: string }[]
  rest: string[]
}

function parseFormat(points: string[]): Parsed | null {
  const first = points[0]
  if (!first || !/\[[^\]]+\]/.test(first)) return null
  const m = first.match(/^([^:[]{1,40}):\s*(.+)$/)
  const label = m ? m[1] : undefined
  const sentence = m ? m[2] : first
  const slots: string[] = []
  const parts = sentence
    .split(/(\[[^\]]+\])/)
    .filter(Boolean)
    .map((text) => {
      const s = text.match(/^\[([^\]]+)\]$/)
      if (!s) return { text }
      slots.push(s[1])
      return { text: s[1], slot: slots.length }
    })
  if (slots.length < 2) return null

  const notes: Parsed['notes'] = []
  const rest: string[] = []
  const used = new Set<number>()
  for (const p of points.slice(1)) {
    const head = p.toLowerCase().split(/\s+/).slice(0, 3).join(' ')
    const idx = slots.findIndex(
      (name, i) =>
        !used.has(i) && (p.toLowerCase().startsWith(name.toLowerCase()) || head.includes(name.toLowerCase())),
    )
    if (idx >= 0) {
      used.add(idx)
      notes.push({ slot: idx + 1, name: slots[idx], text: p })
    } else rest.push(p)
  }
  notes.sort((a, b) => a.slot - b.slot)
  return { label, parts, slots, notes, rest }
}

function HypothesisSheet({ block, mode, parsed }: { block: ConceptBlock; mode: RenderMode; parsed: Parsed }) {
  const [lit, setLit] = useState<number | null>(null)
  return (
    <section className={`block block--concept th-hyp th-hyp--${mode}`}>
      <Head block={block} />
      {block.lead && <p className="lead">{block.lead}</p>}

      <figure className="th-hyp__format">
        <p className="th-hyp__sentence">
          {parsed.parts.map((part, i) =>
            part.slot ? (
              <span
                key={i}
                className="th-hyp__slot"
                data-slot={part.slot}
                data-lit={lit === part.slot}
                style={{ '--k': part.slot - 1 } as CSSProperties}
              >
                <span className="th-hyp__slot-num" aria-hidden="true" data-th-deco="" hidden>
                  {part.slot}
                </span>
                <span className="th-hyp__slot-text">
                  <span className="th-print-only">[</span>
                  {part.text}
                  <span className="th-print-only">]</span>
                </span>
              </span>
            ) : (
              <span key={i}>{part.text}</span>
            ),
          )}
        </p>
        {parsed.label && <figcaption className="th-hyp__label">{parsed.label}</figcaption>}
      </figure>

      <ol className="th-hyp__notes">
        {parsed.notes.map((n) => (
          <li
            key={n.slot}
            className="th-hyp__note"
            data-slot={n.slot}
            data-lit={lit === n.slot}
            style={{ '--k': n.slot - 1 } as CSSProperties}
            onPointerEnter={() => setLit(n.slot)}
            onPointerLeave={() => setLit(null)}
          >
            <span className="th-hyp__note-num" aria-hidden="true" data-th-deco="" hidden>
              {n.slot}
            </span>
            <p>{n.text}</p>
          </li>
        ))}
      </ol>

      {parsed.rest.length > 0 && (
        <ul className="concept__points">
          {parsed.rest.map((p, i) => (
            <li key={i}>
              <span className="concept__bullet" aria-hidden="true" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}

      <Tail block={block} mode={mode} render={renderOutcomesParagraph} />
    </section>
  )
}

/* =========================================================================
   Stack counting — sort the same count two ways
   ========================================================================= */

/* Synthetic process-creation stack count. Two pairs come from the lesson
   text (explorer.exe -> notepad.exe at fifty thousand, WINWORD.EXE ->
   powershell.exe once); the rest are plausible Windows pairs, labelled. */
const STACK = [
  { parent: 'explorer.exe', child: 'notepad.exe', count: 50000 },
  { parent: 'services.exe', child: 'svchost.exe', count: 41212 },
  { parent: 'svchost.exe', child: 'taskhostw.exe', count: 18940 },
  { parent: 'explorer.exe', child: 'msedge.exe', count: 12377 },
  { parent: 'svchost.exe', child: 'WmiPrvSE.exe', count: 3208 },
  { parent: 'WmiPrvSE.exe', child: 'msiexec.exe', count: 211 },
  { parent: 'explorer.exe', child: 'mmc.exe', count: 9 },
  { parent: 'WINWORD.EXE', child: 'powershell.exe', count: 1 },
]
const LOG_MAX = Math.log10(50000 + 1)

function StackCount({ block, mode }: { block: ConceptBlock; mode: RenderMode }) {
  const [order, setOrder] = useState<'desc' | 'asc'>('desc')
  const reduced = useReducedMotion()
  const listRef = useRef<HTMLOListElement>(null)
  const before = useRef<Map<string, number>>(new Map())

  const rows = [...STACK].sort((a, b) => (order === 'asc' ? a.count - b.count : b.count - a.count))

  const choose = (next: 'desc' | 'asc') => {
    if (next === order) return
    const map = new Map<string, number>()
    listRef.current?.querySelectorAll<HTMLElement>('[data-key]').forEach((el) => {
      map.set(el.dataset.key!, el.getBoundingClientRect().top)
    })
    before.current = map
    setOrder(next)
  }

  // FLIP: each row travels from where it was to where the new order puts it.
  useLayoutEffect(() => {
    if (reduced || !before.current.size) return
    const els = listRef.current?.querySelectorAll<HTMLElement>('[data-key]')
    els?.forEach((el, i) => {
      const was = before.current.get(el.dataset.key!)
      if (was === undefined) return
      const dy = was - el.getBoundingClientRect().top
      if (Math.abs(dy) < 1) return
      el.animate(
        [
          { transform: `translateY(${dy}px)`, zIndex: 2 },
          { transform: 'translateY(0)', zIndex: 2 },
        ],
        {
          duration: 640,
          delay: i * 18,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'backwards',
        },
      )
    })
    before.current = new Map()
  }, [order, reduced])

  return (
    <section className={`block block--concept th-stack th-stack--${mode}`}>
      <Head block={block} />
      {block.lead && <p className="lead">{block.lead}</p>}

      <div className="th-stack__body">
        <figure className="th-stack__specimen" data-order={order}>
          <div className="th-stack__bar">
            <MonoLabel>Stack count · parent → child process</MonoLabel>
            <div className="th-stack__sort" role="group" aria-label="Sort the stack count">
              <button
                type="button"
                className="btn th-toggle"
                aria-pressed={order === 'desc'}
                onClick={() => choose('desc')}
              >
                Most frequent first
              </button>
              <button type="button" className="btn th-toggle" aria-pressed={order === 'asc'} onClick={() => choose('asc')}>
                Rarest first
              </button>
            </div>
          </div>

          <ol
            className="th-stack__rows"
            ref={listRef}
            aria-label={`Process pairs, ${order === 'asc' ? 'rarest first' : 'most frequent first'}`}
          >
            {rows.map((r) => {
              const key = `${r.parent}>${r.child}`
              const share = Math.max(0.035, Math.log10(r.count + 1) / LOG_MAX)
              const rare = r.count === 1
              return (
                <li key={key} data-key={key} className="th-stack__row" data-rare={rare}>
                  <span className="th-stack__pair">
                    <span>{r.parent}</span>
                    <span className="th-stack__arrow" aria-hidden="true">
                      {' → '}
                    </span>
                    <span className="sr-only"> spawned </span>
                    <span>{r.child}</span>
                  </span>
                  <span className="th-stack__strip" aria-hidden="true" data-th-deco="" hidden>
                    <span className="th-stack__fill" style={{ '--share': share } as CSSProperties} />
                  </span>
                  <span className="th-print-only">: </span>
                  <span className="th-stack__count">{r.count.toLocaleString('en-GB')}</span>
                </li>
              )
            })}
          </ol>
          <figcaption className="th-stack__caption">
            <span className="th-stack__scale">Illustrative counts · strip length on a log scale.</span>
            {mode === 'study' && (
            <SyntheticBadge>
              Illustrative counts. The two pairs named in this lesson are real examples of the pattern; the other rows
              are invented to fill out the distribution.
            </SyntheticBadge>
            )}
          </figcaption>
          <p className="sr-only" aria-live="polite">
            {order === 'asc'
              ? 'Sorted ascending: the rarest pair is first.'
              : 'Sorted descending: the most frequent pair is first.'}
          </p>
        </figure>

        <ul className="concept__points th-stack__points">
          {block.points.map((p, i) => (
            <li key={i}>
              <span className="concept__bullet" aria-hidden="true" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <Tail block={block} mode={mode} />
    </section>
  )
}

/* =========================================================================
   The pipeline — a se-tenant strip, then the three outcome marks
   ========================================================================= */

function splitSteps(text: string): string[] {
  return text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function Pipeline({ block, mode, steps }: { block: ConceptBlock; mode: RenderMode; steps: string[] }) {
  const others = block.points.slice(1)
  const marks = others.filter((p) => outcomeOf(p))
  const plain = others.filter((p) => !outcomeOf(p))

  return (
    <section className={`block block--concept th-pipe th-pipe--${mode}`}>
      <Head block={block} />
      {block.lead && <p className="lead">{block.lead}</p>}

      <ol className="th-pipe__strip" aria-label="The pipeline, in order">
        {steps.map((s, i) => (
          <li key={i} className="th-pipe__stamp" style={{ '--k': i } as CSSProperties}>
            <span className="th-pipe__band" aria-hidden="true" data-th-deco="" hidden>
              <span className="th-pipe__num">{i + 1}</span>
            </span>
            <span className="th-pipe__text">{s}</span>
          </li>
        ))}
      </ol>

      {marks.length > 0 && (
        <div className="th-marks">
          {marks.map((p, i) => {
            const o = outcomeOf(p)!
            return (
              <div key={i} style={{ '--k': i } as CSSProperties} className="th-marks__slot">
                <OutcomeMark outcome={o} word={o[0].toUpperCase() + o.slice(1)}>
                  <p>{p}</p>
                </OutcomeMark>
              </div>
            )
          })}
        </div>
      )}

      {plain.length > 0 && (
        <ul className="concept__points th-pipe__plain">
          {plain.map((p, i) => (
            <li key={i}>
              <span className="concept__bullet" aria-hidden="true" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}

      <Tail block={block} mode={mode} />
    </section>
  )
}
