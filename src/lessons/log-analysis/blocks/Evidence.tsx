import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { EvidenceBlock, EvidenceKind } from '@/types/content'
import { EVIDENCE_META } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { EvidenceChip, MonoLabel, SyntheticBadge } from '@/components/brand/Brand'
import { usePresentState } from '@/motion'
import { HIDDEN_ON_PAPER, ROUTE_EVENT, formatClock, parseClock, routeFromEvidence, stationOffsets, type Route } from '../graph'
import { Detail, Footer, Head } from '../parts'

/* =========================================================================
   ANNOTATED EVIDENCE — the route, plotted as you read it
   =========================================================================
   The same behaviour as the shared annotator: every annotated line is a
   button that opens its note, one at a time. Above the lines, the excerpt
   is plotted as a train graph — sources as stations, time across — and
   each line you open extends the vermilion run to its stop, with a leader
   from the stop naming what that stop proved. Read in order, a single
   logon becomes a run that waits five minutes and then crosses six
   stations in forty seconds.

   The graph mirrors the list for pointer users; the list is the control.
   ========================================================================= */

/** Piecewise time scale: long waits are compressed behind a break mark,
    so the plunge gets the width it needs to be read. */
function timeScale(route: Route, x0: number, x1: number) {
  const gapLimit = 90
  const pad = 14
  const breakW = 34
  type Seg = { a: number; b: number }
  const segs: Seg[] = []
  let cur: Seg = { a: route.stops[0].t - pad, b: route.stops[0].t + pad }
  for (let k = 1; k < route.stops.length; k++) {
    const t = route.stops[k].t
    if (t - cur.b > gapLimit) {
      segs.push(cur)
      cur = { a: t - pad, b: t + pad }
    } else cur.b = t + pad
  }
  segs.push(cur)
  const total = segs.reduce((s, g) => s + (g.b - g.a), 0)
  const usable = x1 - x0 - breakW * (segs.length - 1)
  const starts: number[] = []
  let x = x0
  segs.forEach((g, i) => {
    starts.push(x)
    x += ((g.b - g.a) / total) * usable + (i < segs.length - 1 ? breakW : 0)
  })
  const xOf = (t: number) => {
    for (let i = 0; i < segs.length; i++) {
      const g = segs[i]
      if (t <= g.b || i === segs.length - 1) {
        return starts[i] + ((Math.max(g.a, t) - g.a) / total) * usable
      }
    }
    return x1
  }
  const breaks = segs.slice(0, -1).map((g, i) => ({
    x: starts[i] + ((g.b - g.a) / total) * usable + breakW / 2,
    gap: segs[i + 1].a + pad - (g.b - pad),
  }))
  return { xOf, breaks, segs }
}

function Mark({ kind, x, y, r = 6 }: { kind?: EvidenceKind; x: number; y: number; r?: number }) {
  const k = kind ?? 'observation'
  if (k === 'confirmed' || k === 'uncertain') {
    return <circle cx={x} cy={y} r={r} className={`la-mark la-mark--${k}`} />
  }
  if (k === 'response') {
    return <path d={`M${x - r} ${y - r} L${x + r} ${y} L${x - r} ${y + r} Z`} className={`la-mark la-mark--${k}`} />
  }
  if (k === 'attack') {
    return (
      <g className={`la-mark la-mark--${k}`}>
        <rect x={x - r} y={y - r} width={r * 2} height={r * 2} />
        <path d={`M${x + r} ${y - r} l5 -5 v10 z`} />
      </g>
    )
  }
  return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} className={`la-mark la-mark--${k}`} />
}

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(900)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

function RoutePlot({
  route,
  open,
  reached,
  onPick,
  lines,
}: {
  route: Route
  open: number | null
  reached: number
  onPick: (i: number) => void
  lines: EvidenceBlock['lines']
}) {
  const [ref, width] = useWidth()
  const { presenting } = usePresentState()
  const narrow = width < 600
  const labelW = narrow ? 98 : 138
  // On a projected slide the plot stays short so the lines it mirrors are
  // in view with it; the reading page can afford the taller drawing.
  const rowH = narrow ? 30 : presenting ? 24 : 36
  const top = 30
  const height = top + rowH * (route.stations.length - 1) + 66
  const offsets = stationOffsets(route.stations.length)
  const plotH = rowH * (route.stations.length - 1)
  const y = (s: number) => top + offsets[s] * plotH
  const { xOf, breaks, segs } = useMemo(() => timeScale(route, labelW + 14, width - 18), [route, labelW, width])

  /* Ten-second ruling inside each segment. */
  const ticks: number[] = []
  segs.forEach((g) => {
    for (let t = Math.ceil(g.a / 10) * 10; t <= g.b; t += 10) ticks.push(t)
  })

  const openStop = open === null ? undefined : route.stops.find((s) => s.line === open)
  const note = open === null ? undefined : lines[open]?.note

  return (
    <div ref={ref} className="la-plot" style={HIDDEN_ON_PAPER}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
        {ticks.map((t) => (
          <line key={t} x1={xOf(t)} x2={xOf(t)} y1={top - 8} y2={top + plotH + 6} className={t % 60 === 0 ? 'la-graph__minute' : 'la-graph__tick'} />
        ))}
        {breaks.map((b, i) => (
          <g key={i} className="la-plot__break">
            <path d={`M${b.x - 5} ${top - 12} l4 -8 M${b.x + 1} ${top - 12} l4 -8`} />
            <rect x={b.x - 10} y={top - 4} width={20} height={plotH + 8} className="la-plot__gap" />
            <text x={b.x} y={top + plotH + 22} textAnchor="middle" className="la-graph__time">
              {Math.floor(b.gap / 60)}m {String(Math.round(b.gap % 60)).padStart(2, '0')}s
            </text>
          </g>
        ))}
        {route.stations.map((st, i) => (
          <g key={st.name}>
            <line x1={labelW - 6} x2={width - 10} y1={y(i)} y2={y(i)} className={st.derived ? 'la-graph__station la-graph__station--derived' : 'la-graph__station'} />
            <text x={labelW - 12} y={y(i)} dy="0.34em" textAnchor="end" className={narrow ? 'la-plot__label la-plot__label--small' : 'la-plot__label'}>
              {st.name.toUpperCase()}
            </text>
          </g>
        ))}

        {/* The run: each leg inks once its arriving stop has been read. */}
        {route.stops.slice(1).map((s, k) => {
          const prev = route.stops[k]
          const drawn = route.stops.indexOf(s) <= reached
          const xa = xOf(prev.t)
          const xb = xOf(s.t)
          return (
            <path
              key={k}
              d={`M${xa} ${y(prev.station)} L${xb} ${y(prev.station)} L${xb} ${y(s.station)}`}
              pathLength={1}
              className={drawn ? 'la-plot__leg is-drawn' : 'la-plot__leg'}
            />
          )
        })}

        {route.stops.map((s, k) => {
          const isOpen = s.line === open
          const read = k <= reached
          return (
            <g
              key={k}
              className={`la-plot__stop${read ? ' is-read' : ''}${isOpen ? ' is-open' : ''}${s.derived ? ' is-derived' : ''}`}
              onClick={() => onPick(s.line)}
            >
              <rect x={xOf(s.t) - 13} y={y(s.station) - 13} width={26} height={26} className="la-plot__hit" />
              <Mark kind={s.kind} x={xOf(s.t)} y={y(s.station)} r={isOpen ? 7 : 5.5} />
            </g>
          )
        })}

        {openStop && note && (
          <g className="la-plot__leader" key={open}>
            <line x1={xOf(openStop.t)} x2={xOf(openStop.t)} y1={y(openStop.station) + 9} y2={top + plotH + 30} />
            {!narrow && <text
              x={Math.min(Math.max(xOf(openStop.t), labelW + 4), width - 12)}
              y={top + plotH + 46}
              textAnchor={xOf(openStop.t) > width * 0.6 ? 'end' : 'start'}
              className="la-plot__leader-text"
            >
              {formatClock(openStop.t)} · {note.label}
            </text>}
          </g>
        )}
      </svg>
    </div>
  )
}

/** Splits "02:14:33  Sysmon:1  EXCEL.EXE → …" into time, station and record,
    keeping the exact original characters. */
function parts(text: string): [string, string, string] {
  const m = /^(\s*\d{2}:\d{2}:\d{2}\s+)(\S+\s+)?([\s\S]*)$/.exec(text)
  if (!m) return ['', '', text]
  return [m[1], m[2] ?? '', m[3]]
}

export default function Evidence({ block, mode }: BlockOverrideProps<EvidenceBlock>) {
  const [open, setOpen] = useState<number | null>(null)
  const [reachedLine, setReachedLine] = useState(-1)
  const panelId = useId()
  const route = useMemo(() => routeFromEvidence(block), [block])

  const pick = (i: number) => {
    setOpen((cur) => (cur === i ? null : i))
    setReachedLine((r) => Math.max(r, i))
    // Tell the presentation backdrop how far the reading has got, so the run
    // on the graph advances with the room rather than ahead of it.
    const t = parseClock(block.lines[i]?.text ?? '')
    if (t !== null) window.dispatchEvent(new CustomEvent(ROUTE_EVENT, { detail: { t } }))
  }
  const reached = route ? route.stops.filter((s) => s.line <= reachedLine).length - 1 : -1
  const allTimed = block.lines.every((l) => parseClock(l.text) !== null)

  return (
    <section className="block block--evidence la-evidence">
      <Head block={block} kicker="Annotated evidence" />
      {block.lead && <p className="lead">{block.lead}</p>}
      <SyntheticBadge>{block.source}</SyntheticBadge>

      <div className="evidence la-route">
        <div className="evidence__head">
          <MonoLabel>{block.caption}</MonoLabel>
          <span className="evidence__hint">Select a line to annotate it</span>
        </div>

        {route && allTimed && (
          <RoutePlot route={route} open={open} reached={reached} onPick={pick} lines={block.lines} />
        )}

        <ol className="evidence__lines">
          {block.lines.map((line, i) => {
            const isOpen = open === i
            const hasNote = !!line.note
            const [time, station, record] = parts(line.text)
            const body = (
              <code>
                <span className="la-line__time">{time}</span>
                <span className="la-line__station">{station}</span>
                <span className="la-line__record">{record}</span>
              </code>
            )
            return (
              <li key={i} className="evidence__line-wrap" data-read={i <= reachedLine || undefined}>
                {hasNote ? (
                  <button
                    type="button"
                    className={`evidence__line evidence__line--interactive${isOpen ? ' is-open' : ''}`}
                    data-kind={line.note!.kind}
                    aria-expanded={isOpen}
                    aria-controls={`${panelId}-${i}`}
                    onClick={() => pick(i)}
                  >
                    <span className="evidence__marker" aria-hidden="true">
                      {EVIDENCE_META[line.note!.kind].glyph}
                    </span>
                    {body}
                  </button>
                ) : (
                  <div className="evidence__line">
                    <span className="evidence__marker evidence__marker--none" aria-hidden="true">
                      ·
                    </span>
                    {body}
                  </div>
                )}

                {hasNote && isOpen && (
                  <div className="evidence__note" id={`${panelId}-${i}`} data-kind={line.note!.kind}>
                    <div className="evidence__note-head">
                      <EvidenceChip kind={line.note!.kind} />
                      <strong>{line.note!.label}</strong>
                    </div>
                    <p>{line.note!.body}</p>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      <div className="proves">
        <div className="proves__col proves__col--yes">
          <div className="proves__head">
            <EvidenceChip kind="confirmed" label="This establishes" />
          </div>
          <ul>
            {block.proves.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="proves__col proves__col--no">
          <div className="proves__head">
            <EvidenceChip kind="uncertain" label="This does not establish" />
          </div>
          <ul>
            {block.doesNotProve.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}
