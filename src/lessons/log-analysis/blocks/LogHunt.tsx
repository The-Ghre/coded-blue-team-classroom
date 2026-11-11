import { useEffect, useMemo, useRef, useState } from 'react'
import type { InteractionBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { EvidenceChip, MonoLabel, SyntheticBadge } from '@/components/brand/Brand'
import { usePresentState } from '@/motion'
import { HIDDEN_ON_PAPER, formatClock, parseClock } from '../graph'
import { Detail, Footer, Head } from '../parts'

/* =========================================================================
   LOG INVESTIGATION — the window as a working graph
   =========================================================================
   The shared exercise, rebuilt in this world with every behaviour kept:
   flag lines, commit, score precision and recall separately, explain
   every hit, miss and false positive, debrief, nudges, try again.

   Above the lines, the window is plotted as a train graph: every process
   is a station, every log line is a short run from its parent's station
   to its child's. Ordinary activity leaves the shell and the service
   manager in the same short hops all morning. What you flag inks in
   graphite; after you commit, the chain draws in vermilion — solid where
   you found it, dashed where you missed it — and a false positive keeps a
   cross. Station order is first appearance in the window, never the
   answer, so the plot shows relationships without giving them away.
   ========================================================================= */

interface Line {
  id: string
  text: string
  malicious: boolean
  why: string
}

interface Data {
  caption: string
  note: string
  lines: Line[]
  debrief: string
}

function isData(d: unknown): d is Data {
  return !!d && typeof d === 'object' && Array.isArray((d as Data).lines)
}

type State = 'idle' | 'flagged' | 'hit' | 'missed' | 'false-positive' | 'correct-reject'

interface Parsed {
  t: number | null
  time: string
  parent: string
  arrow: string
  child: string
  rest: string
}

/** "09:09:03  WINWORD.EXE → cmd.exe /c …" keeping every original character. */
function parse(text: string): Parsed {
  const m = /^(\s*\d{2}:\d{2}:\d{2}\s+)(\S+)(\s*→\s*)(\S+)([\s\S]*)$/.exec(text)
  if (!m) return { t: parseClock(text), time: '', parent: '', arrow: '', child: '', rest: text }
  return { t: parseClock(m[1]), time: m[1], parent: m[2], arrow: m[3], child: m[4], rest: m[5] }
}

const key = (name: string) => name.toLowerCase()

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

function WindowPlot({
  lines,
  parsed,
  states,
  focus,
  onFocus,
  onPick,
  submitted,
}: {
  lines: Line[]
  parsed: Parsed[]
  states: State[]
  focus: string | null
  onFocus: (id: string | null) => void
  onPick: (id: string) => void
  submitted: boolean
}) {
  const [ref, width] = useWidth()
  const { presenting } = usePresentState()
  // Projected, the plot sits in a half-width column beside the list.
  const narrow = width < (presenting ? 400 : 600)
  // Projected, the station names must read from the back of the room.
  const big = presenting && !narrow

  const stations = useMemo(() => {
    const out: { key: string; name: string }[] = []
    const add = (n: string) => {
      if (n && !out.some((s) => s.key === key(n))) out.push({ key: key(n), name: n })
    }
    parsed.forEach((p) => {
      add(p.parent)
      add(p.child)
    })
    return out
  }, [parsed])

  const times = parsed.map((p) => p.t).filter((t): t is number => t !== null)
  if (!times.length || !stations.length) return null
  const t0 = Math.floor(Math.min(...times) / 60) * 60
  const t1 = Math.ceil((Math.max(...times) + 1) / 60) * 60
  const labelW = narrow ? 84 : big ? 132 : 128
  const rowH = narrow ? 13 : big ? 24 : 16
  const top = 26
  const plotH = rowH * (stations.length - 1)
  const height = top + plotH + 18
  const x = (t: number) => labelW + ((t - t0) / (t1 - t0)) * (width - labelW - 14)
  const y = (n: string) => top + stations.findIndex((s) => s.key === key(n)) * rowH

  const minutes: number[] = []
  for (let t = t0; t <= t1; t += 60) minutes.push(t)

  return (
    <div ref={ref} className="la-plot la-plot--window" style={HIDDEN_ON_PAPER} data-submitted={submitted || undefined}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
        {minutes.map((t) => (
          <g key={t}>
            <line
              x1={x(t)}
              x2={x(t)}
              y1={top - 6}
              y2={top + plotH + 4}
              className={(t - t0) % 300 === 0 ? 'la-graph__minute' : 'la-graph__tick'}
            />
            {(t - t0) % (narrow ? 600 : 300) === 0 && (
              <text x={x(t)} y={top - 12} textAnchor="middle" className="la-graph__time">
                {formatClock(t, false)}
              </text>
            )}
          </g>
        ))}
        {stations.map((s, i) => (
          <g key={s.key}>
            <line x1={labelW - 4} x2={width - 8} y1={top + i * rowH} y2={top + i * rowH} className="la-graph__station" />
            <text x={labelW - 9} y={top + i * rowH} dy="0.34em" textAnchor="end" className={big ? 'la-plot__label la-plot__label--big' : 'la-plot__label la-plot__label--small'}>
              {s.name.replace(/\.exe$/i, '').toUpperCase()}
            </text>
          </g>
        ))}
        {lines.map((line, i) => {
          const p = parsed[i]
          if (p.t === null || !p.parent) return null
          const xa = x(p.t)
          const ya = y(p.parent)
          const yb = y(p.child)
          const st = states[i]
          // Longer hops lean further, so the plot reads as runs, not ticks.
          const run = (narrow ? 4 : 6) + (Math.abs(yb - ya) / rowH) * (narrow ? 1.5 : 2.6)
          return (
            <g
              key={line.id}
              className={`la-hop la-hop--${st}${focus === line.id ? ' is-focus' : ''}`}
              onClick={() => onPick(line.id)}
              onPointerEnter={() => onFocus(line.id)}
              onPointerLeave={() => onFocus(null)}
            >
              <line x1={xa} y1={ya} x2={xa + run} y2={yb} className="la-hop__hit" />
              <line x1={xa} y1={ya} x2={xa + run} y2={yb} pathLength={1} className="la-hop__run" />
              <rect x={xa - 2} y={ya - 2} width={4} height={4} className="la-hop__from" />
              <rect x={xa + run - 2.5} y={yb - 2.5} width={5} height={5} className="la-hop__to" />
              {st === 'false-positive' && (
                <path
                  d={`M${xa + run / 2 - 4} ${(ya + yb) / 2 - 4} l8 8 m0 -8 l-8 8`}
                  className="la-hop__cross"
                />
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function Investigation({ data }: { data: unknown }) {
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)
  const [focus, setFocus] = useState<string | null>(null)

  const valid = isData(data)
  const lines = valid ? data.lines : []
  const parsed = useMemo(() => lines.map((l) => parse(l.text)), [lines])

  const score = useMemo(() => {
    const truth = lines.filter((l) => l.malicious)
    const truePositives = truth.filter((l) => flagged.has(l.id)).length
    const falsePositives = [...flagged].filter((id) => !lines.find((l) => l.id === id)?.malicious).length
    const missed = truth.length - truePositives
    const precision = flagged.size ? Math.round((truePositives / flagged.size) * 100) : 0
    const recall = truth.length ? Math.round((truePositives / truth.length) * 100) : 0
    return { truePositives, falsePositives, missed, precision, recall, total: truth.length }
  }, [flagged, lines])

  if (!valid) {
    return <p className="interaction__error">This exercise could not load its data.</p>
  }

  function toggle(id: string) {
    if (submitted) return
    setFlagged((f) => {
      const next = new Set(f)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const states: State[] = lines.map((line) => {
    const isFlagged = flagged.has(line.id)
    return !submitted
      ? isFlagged
        ? 'flagged'
        : 'idle'
      : line.malicious
        ? isFlagged
          ? 'hit'
          : 'missed'
        : isFlagged
          ? 'false-positive'
          : 'correct-reject'
  })

  return (
    <div className="ix ix--loghunt la-hunt">
      <SyntheticBadge />

      <div className="ix__bar">
        <div className="ix__bar-left">
          <MonoLabel>{data.caption}</MonoLabel>
        </div>
        <div className="ix__bar-right">
          <MonoLabel>Flagged</MonoLabel>
          <span className="ix__score">{flagged.size}</span>
        </div>
      </div>

      <p className="loghunt__note">{data.note}</p>

      <WindowPlot
        lines={lines}
        parsed={parsed}
        states={states}
        focus={focus}
        onFocus={setFocus}
        onPick={toggle}
        submitted={submitted}
      />

      <ol className="loghunt__lines">
        {lines.map((line, i) => {
          const isFlagged = flagged.has(line.id)
          const state = states[i]
          const p = parsed[i]
          return (
            <li
              key={line.id}
              className={`loghunt__row${focus === line.id ? ' is-focus' : ''}`}
              data-state={state}
              onPointerEnter={() => setFocus(line.id)}
              onPointerLeave={() => setFocus(null)}
            >
              <button
                type="button"
                className="loghunt__line"
                aria-pressed={isFlagged}
                onClick={() => toggle(line.id)}
                onFocus={() => setFocus(line.id)}
                onBlur={() => setFocus(null)}
                disabled={submitted}
              >
                <span className="loghunt__mark" aria-hidden="true">
                  {!submitted
                    ? isFlagged
                      ? '▣'
                      : '□'
                    : state === 'hit'
                      ? '✓'
                      : state === 'missed'
                        ? '!'
                        : state === 'false-positive'
                          ? '✕'
                          : '·'}
                </span>
                <code>
                  {p.parent ? (
                    <>
                      <span className="la-line__time">{p.time}</span>
                      <span className="la-line__parent">{p.parent}</span>
                      <span className="la-line__arrow">{p.arrow}</span>
                      <span className="la-line__child">{p.child}</span>
                      <span className="la-line__record">{p.rest}</span>
                    </>
                  ) : (
                    line.text
                  )}
                </code>
              </button>
              {submitted && (state === 'hit' || state === 'missed' || state === 'false-positive') && (
                <p className="loghunt__why" data-state={state}>
                  {line.why}
                </p>
              )}
            </li>
          )
        })}
      </ol>

      {!submitted ? (
        <div className="loghunt__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setSubmitted(true)}
            disabled={flagged.size === 0}
          >
            Commit {flagged.size} {flagged.size === 1 ? 'line' : 'lines'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => setFlagged(new Set())}>
            Clear
          </button>
        </div>
      ) : (
        <div className="loghunt__result">
          <div className="loghunt__metrics">
            <div className="loghunt__metric">
              <MonoLabel>Found</MonoLabel>
              <span className="loghunt__metric-value">
                {score.truePositives} / {score.total}
              </span>
            </div>
            <div className="loghunt__metric" data-warn={score.falsePositives > 0}>
              <MonoLabel>False positives</MonoLabel>
              <span className="loghunt__metric-value">{score.falsePositives}</span>
            </div>
            <div className="loghunt__metric" data-warn={score.missed > 0}>
              <MonoLabel>Missed</MonoLabel>
              <span className="loghunt__metric-value">{score.missed}</span>
            </div>
            <div className="loghunt__metric">
              <MonoLabel>Precision</MonoLabel>
              <span className="loghunt__metric-value">{score.precision}%</span>
            </div>
            <div className="loghunt__metric">
              <MonoLabel>Recall</MonoLabel>
              <span className="loghunt__metric-value">{score.recall}%</span>
            </div>
          </div>

          <div className="loghunt__debrief">
            <div className="loghunt__debrief-head">
              <EvidenceChip kind="response" label="Debrief" />
            </div>
            <p>{data.debrief}</p>
            {score.falsePositives > 0 && (
              <p className="loghunt__nudge">
                Your {score.falsePositives} false{' '}
                {score.falsePositives === 1 ? 'positive is' : 'positives are'} worth more attention
                than the misses. In a real queue, each one is an escalation that costs Tier 2 time
                and teaches them to trust your judgement a little less.
              </p>
            )}
            {score.missed > 0 && (
              <p className="loghunt__nudge">
                {score.missed} attack {score.missed === 1 ? 'line' : 'lines'} went unflagged. Read
                the explanations above — in every case the parent-child relationship or the argument
                was the tell, not how alarming the line looked.
              </p>
            )}
          </div>

          <button
            type="button"
            className="btn"
            onClick={() => {
              setSubmitted(false)
              setFlagged(new Set())
            }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}

export default function Interaction(props: BlockOverrideProps<InteractionBlock>) {
  const { block, mode, Default } = props
  if (block.component !== 'log-investigation') return <Default block={block} mode={mode} />
  return (
    <section className="block block--interaction la-interaction">
      <Head block={block} kicker="Interactive exercise" />
      {block.lead && <p className="lead">{block.lead}</p>}
      <div className="interaction__teaches">
        <MonoLabel>What this teaches</MonoLabel>
        <p>{block.teaches}</p>
      </div>
      <Investigation data={block.data} />
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}
