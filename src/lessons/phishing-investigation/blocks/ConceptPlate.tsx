import { useState } from 'react'
import type { ConceptBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { Callout, RedBlue } from '@/components/brand/Brand'
import { Diagram } from '@/components/teaching/Diagram'
import { Detail, Footer, Head } from '../shared'

/* =========================================================================
   CONCEPTS — set as plates
   =========================================================================
   Every concept keeps its full content: lead, points, diagram, callout, the
   red and blue views, and in study mode the detail and provenance.

   Points written "Term — explanation" are set as a specimen list, the term
   in the header face, because in this lesson the terms are header fields
   and campaign stages the student must recognise on sight.

   The impact concept gets the ripple: five questions that spread outward
   from one strike, drawn as the sets they really are — everyone who opened
   it received it; everyone who submitted clicked; running the attachment is
   a separate path inside "opened". The rings draw in the order you ask.
   ========================================================================= */

/** "Who clicked? Proxy and DNS logs…" → the question, then the evidence. */
function splitQuestion(point: string): [string, string] | null {
  const i = point.indexOf('? ')
  if (i <= 0 || i > 60) return null
  return [point.slice(0, i + 1), point.slice(i + 2)]
}

/** "From the TLS certificate, search…" → "TLS certificate". */
function pivotSource(point: string): string | null {
  const m = /^From (?:the )?([^,]{2,28}),/.exec(point)
  return m ? m[1] : null
}

function splitTerm(point: string): [string, string] | null {
  const i = point.indexOf(' — ')
  if (i <= 0 || i > 48) return null
  return [point.slice(0, i), point.slice(i + 3)]
}

interface Ring {
  cx: number
  cy: number
  r: number
  lx: number
  ly: number
  tone: 'wide' | 'mid' | 'near' | 'hot' | 'side'
}

/* Nested by meaning: 1 ⊃ 2 ⊃ (3 ⊃ 4, 5). */
const RINGS: Ring[] = [
  { cx: 200, cy: 200, r: 186, lx: 200, ly: 34, tone: 'wide' },
  { cx: 200, cy: 222, r: 142, lx: 200, ly: 100, tone: 'mid' },
  { cx: 160, cy: 250, r: 82, lx: 160, ly: 188, tone: 'near' },
  { cx: 156, cy: 268, r: 40, lx: 156, ly: 268, tone: 'hot' },
  { cx: 282, cy: 246, r: 38, lx: 282, ly: 246, tone: 'side' },
]

function Ripples({ active, onHover }: { active: number | null; onHover: (i: number | null) => void }) {
  return (
    <figure className="pi-ripples" aria-hidden="true">
      <svg viewBox="0 0 400 400" focusable="false">
        <circle className="pi-ripples__wave" cx={RINGS[3].cx} cy={RINGS[3].cy} r={RINGS[3].r} />
        <circle className="pi-ripples__wave pi-ripples__wave--2" cx={RINGS[3].cx} cy={RINGS[3].cy} r={RINGS[3].r} />
        {RINGS.map((ring, i) => (
          <g
            key={i}
            className="pi-ripples__ring"
            data-tone={ring.tone}
            data-active={active === i}
            style={{ '--i': i } as React.CSSProperties}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
          >
            <circle cx={ring.cx} cy={ring.cy} r={ring.r} pathLength={1} />
            <text x={ring.lx} y={ring.ly} dy="0.35em">
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  )
}

/*
  Pivoting: one indicator on one line; from it, a crossline with a dropper
  for every pivot path the content names. The hooks set one after another —
  the infrastructure each path can turn up before it is used.
*/
function Longline({ sources }: { sources: string[] }) {
  const n = sources.length
  const xs = sources.map((_, i) => 60 + (i * 280) / Math.max(1, n - 1))
  return (
    <figure className="pi-longline" aria-hidden="true">
      <svg viewBox="0 0 400 250" focusable="false">
        <path className="pi-longline__main" d="M200 -40 V70" />
        <path className="pi-longline__cross" d={`M${xs[0]} 112 Q200 128 ${xs[n - 1]} 112`} />
        <path className="pi-longline__stem" d="M200 82 V118" />
        <g className="pi-longline__origin">
          <circle cx="200" cy="76" r="9" />
          <text x="200" y="50">one indicator</text>
        </g>
        {xs.map((x, i) => {
          // On the crossline: a quadratic from (60,112) via (200,128) to (340,112).
          const t = (x - 60) / 280
          const y = 112 + 32 * t * (1 - t)
          return (
            <g key={i} className="pi-longline__drop" style={{ '--i': i } as React.CSSProperties}>
              <path d={`M${x} ${y} V${178}`} />
              <path className="pi-longline__hook" d={`M${x} 178 C${x} 192 ${x + 14} 192 ${x + 14} 180 M${x + 14} 180 L${x + 10} 186`} />
              <text x={x} y="222">
                {sources[i]}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

export function ConceptPlate({ block, mode }: BlockOverrideProps<ConceptBlock>) {
  const [active, setActive] = useState<number | null>(null)
  const isImpact = block.id === 'impact' && block.points.length === RINGS.length
  const termed = block.points.every((p) => splitTerm(p))

  const sources = block.points.map(pivotSource).filter((x): x is string => !!x)
  const isPivot = !isImpact && sources.length >= 3
  const List = isImpact ? 'ol' : 'ul'
  const points = (
    <List
      className={`concept__points pi-points${termed ? ' pi-points--termed' : ''}${
        isImpact ? ' pi-points--asked' : ''
      }`}
    >
      {block.points.map((p, i) => {
        const t = termed ? splitTerm(p) : isImpact ? splitQuestion(p) : null
        return (
          <li
            key={i}
            data-active={active === i}
            onMouseEnter={isImpact ? () => setActive(i) : undefined}
            onMouseLeave={isImpact ? () => setActive(null) : undefined}
          >
            {isImpact ? (
              <span className="pi-points__n" aria-hidden="true">
                {i + 1}
              </span>
            ) : (
              <span className="concept__bullet" aria-hidden="true" />
            )}
            {t ? (
              <span className="pi-points__body">
                <span className="pi-points__term">{t[0]}</span>{' '}
                <span className="pi-points__desc">{t[1]}</span>
              </span>
            ) : (
              <span className="pi-points__body">{p}</span>
            )}
          </li>
        )
      })}
    </List>
  )

  return (
    <section className="block block--concept pi-concept" data-id={block.id} data-mode={mode}>
      <Head block={block} />
      {block.lead && <p className="lead">{block.lead}</p>}
      {isImpact ? (
        <div className="pi-impact">
          <Ripples active={active} onHover={setActive} />
          {points}
        </div>
      ) : isPivot ? (
        <div className="pi-impact pi-impact--pivot">
          <Longline sources={sources} />
          {points}
        </div>
      ) : (
        points
      )}
      {block.diagram && <Diagram spec={block.diagram} />}
      {block.callout && <Callout tone={block.callout.tone}>{block.callout.text}</Callout>}
      <RedBlue red={block.redView} blue={block.blueView} />
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}
