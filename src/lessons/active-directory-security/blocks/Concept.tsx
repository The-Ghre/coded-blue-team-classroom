import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { ConceptBlock } from '@/types/content'
import { Callout, RedBlue } from '@/components/brand/Brand'
import { Diagram } from '@/components/teaching/Diagram'
import type { BlockOverrideProps } from '../../types'
import { Detail, Footer, Keynoted, SheetHead } from './parts'
import { DoubleReset, canDoubleReset } from './DoubleReset'

/* =========================================================================
   CONCEPT SHEETS
   =========================================================================
   The shared concept renderer, re-set as drawing sheets. Every field the
   shared renderer shows is kept: lead, points, diagram, callout, red and
   blue views, study-only depth and provenance. Three sheets get a form of
   their own:

   - escalation: a schedule of the rights the text names, each one a door
     that was keyed for someone else's problem;
   - persistence: each mechanism ringed in a red revision cloud with its
     delta — changes nobody put on the drawings, built to outlast a reissue;
   - krbtgt: the double reset as a working register (see DoubleReset).
   ========================================================================= */

export function ConceptSheet(props: BlockOverrideProps<ConceptBlock>) {
  const { block, mode } = props
  if (block.id === 'krbtgt' && canDoubleReset(block)) return <DoubleReset block={block} mode={mode} />

  const clouded = block.id === 'persistence'
  const rights = block.id === 'escalation' ? parseRights(block.points) : []

  return (
    <section className={`block block--concept adw-concept${clouded ? ' adw-concept--clouded' : ''}`}>
      <SheetHead block={block} kicker={clouded ? 'Concept · Revisions not on the drawings' : 'Concept'} />
      {block.lead && <p className="lead">{block.lead}</p>}

      <div className={rights.length ? 'adw-concept__split' : undefined}>
        <ul className="concept__points">
          {block.points.map((p, i) =>
            clouded ? (
              <CloudedPoint key={i} index={i} text={p} />
            ) : (
              <li key={i}>
                <span className="concept__bullet" aria-hidden="true" />
                <span>
                  <Keynoted text={p} />
                </span>
              </li>
            ),
          )}
        </ul>
        {rights.length > 0 && <RightsSchedule rights={rights} />}
      </div>

      {block.diagram && <Diagram spec={block.diagram} />}
      {block.callout && <Callout tone={block.callout.tone}>{block.callout.text}</Callout>}
      <RedBlue red={block.redView} blue={block.blueView} />
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

/* ---------- Escalation: a hardware schedule of rights --------------------- */

interface Right {
  right: string
  on: string
  permits: string
}

/** Reads "GenericAll on a user permits a password reset" style clauses. */
function parseRights(points: string[]): Right[] {
  const out: Right[] = []
  const re = /(Generic\w+|Write\w+|AllExtendedRights|Owns)\s+on\s+([^;.]+?)\s+permits\s+([^;.]+)/g
  for (const p of points) for (const m of p.matchAll(re)) out.push({ right: m[1], on: m[2], permits: m[3] })
  return out
}

function RightsSchedule({ rights }: { rights: Right[] }) {
  // A restatement of the point above it, set as a schedule; the point is
  // the accessible source, so the schedule is hidden from screen readers.
  return (
    <figure className="adw-rights" aria-hidden="true">
      <figcaption>
        <span>Hardware schedule</span>
        <span>Rights already granted</span>
      </figcaption>
      <table>
        <thead>
          <tr>
            <th>Set</th>
            <th>Right</th>
            <th>On</th>
            <th>Opens</th>
          </tr>
        </thead>
        <tbody>
          {rights.map((r, i) => (
            <tr key={i} style={{ '--i': i } as CSSProperties}>
              <td>
                <span className="adw-rights__tag">HW-{i + 1}</span>
              </td>
              <td>
                <span className="adw-rights__door" />
                {r.right}
              </td>
              <td>{r.on}</td>
              <td>{r.permits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

/* ---------- Persistence: revision clouds --------------------------------- */

function CloudedPoint({ index, text }: { index: number; text: string }) {
  const ref = useRef<HTMLLIElement>(null)
  const [box, setBox] = useState<{ w: number; h: number } | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setBox({ w: el.offsetWidth, h: el.offsetHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <li ref={ref} className="adw-cloud" style={{ '--i': index } as CSSProperties}>
      {box && (
        <svg
          className="adw-cloud__svg"
          width={box.w + 16}
          height={box.h + 16}
          viewBox={`-8 -8 ${box.w + 16} ${box.h + 16}`}
          aria-hidden="true"
          focusable="false"
        >
          <path d={cloudPath(box.w, box.h)} pathLength={1} />
        </svg>
      )}
      <span className="adw-cloud__delta" aria-hidden="true">
        <svg viewBox="0 0 24 21" focusable="false">
          <path d="M12 1.5 L22.5 19.5 L1.5 19.5 Z" />
        </svg>
        <b>{index + 1}</b>
      </span>
      <span className="adw-cloud__text">
        <Keynoted text={text} />
      </span>
    </li>
  )
}

/** Scalloped outline around a w×h box, clockwise so every arc bulges out. */
function cloudPath(w: number, h: number): string {
  const step = 26
  const pts: [number, number][] = []
  const edge = (x0: number, y0: number, x1: number, y1: number) => {
    const len = Math.hypot(x1 - x0, y1 - y0)
    const n = Math.max(1, Math.round(len / step))
    for (let i = 0; i < n; i++) pts.push([x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n])
  }
  const m = 2
  edge(-m, -m, w + m, -m)
  edge(w + m, -m, w + m, h + m)
  edge(w + m, h + m, -m, h + m)
  edge(-m, h + m, -m, -m)
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 1; i <= pts.length; i++) {
    const [x, y] = pts[i % pts.length]
    const [px, py] = pts[i - 1]
    const r = (Math.hypot(x - px, y - py) / 2) * 1.02
    d += ` A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`
  }
  return d
}
