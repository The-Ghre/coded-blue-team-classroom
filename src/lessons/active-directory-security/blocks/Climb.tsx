import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import type { EvidenceBlock } from '@/types/content'
import { EVIDENCE_META } from '@/types/content'
import { EvidenceChip, MonoLabel, SyntheticBadge } from '@/components/brand/Brand'
import { useReducedMotion } from '@/motion'
import type { BlockOverrideProps } from '../../types'
import { Detail, Footer, SheetHead } from './parts'

/* =========================================================================
   THE CLIMB — twenty minutes of a domain falling, drawn as a section
   =========================================================================
   The shared evidence annotator, rebuilt as a construction sheet: on the
   left, Section A–A through the building's stair, one storey per event, the
   red route solid where svc_backup has been and dashed where it has yet to
   go; on the right, the six lines as a schedule, each one a button that
   opens its annotation exactly as the shared renderer does. A time rule
   under both runs 03:00 → 03:22 on one clock. Everything the shared
   renderer shows — caption, synthetic label, every annotation, what the
   excerpt proves and does not prove — is here.
   ========================================================================= */

interface Parsed {
  time: string
  minutes: number
  event: string
  fields: string[]
  target: string
}

function parse(text: string): Parsed {
  const tokens = text.split(/\s{2,}/).filter(Boolean)
  const time = tokens[0] ?? ''
  const [h, m] = time.split(':').map(Number)
  const minutes = Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN
  const target =
    /dest=(\S+)/.exec(text)?.[1] ??
    /ServiceName=(\S+)/.exec(text)?.[1] ??
    /GroupName="([^"]+)"/.exec(text)?.[1] ??
    /Properties=(\S+)/.exec(text)?.[1] ??
    tokens[1] ??
    ''
  return { time, minutes, event: tokens[1] ?? '', fields: tokens.slice(2), target }
}

/** Only take over when the excerpt is a timed event log this form can draw. */
export function canClimb(block: EvidenceBlock): boolean {
  if (block.lines.length < 2 || block.lines.length > 9) return false
  return block.lines.every((l) => {
    const p = parse(l.text)
    return Number.isFinite(p.minutes) && /^\d{4}$/.test(p.event) && !!l.note
  })
}

const STEP_MS = 2600

export function Climb({ block, mode }: BlockOverrideProps<EvidenceBlock>) {
  const [open, setOpen] = useState<number | null>(null)
  const [reached, setReached] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [clock, setClock] = useState<number | null>(null)
  const reduced = useReducedMotion()
  const panelId = useId()
  const rows = block.lines.map((l) => parse(l.text))
  const start = rows[0].minutes
  const end = rows[rows.length - 1].minutes
  const span = Math.max(1, end - start)
  const n = rows.length

  /* The line the reader is on, kept in a ref so quick repeated presses of
     the step controls each move one line from the latest position. */
  const pos = useRef(-1)
  const choose = (i: number | null) => {
    setOpen(i)
    if (i !== null) {
      pos.current = i
      setReached(i + 1)
    }
  }

  /* Replay: open each line in turn on one shared clock. Any press of a line
     or a step control hands control back to the reader. */
  const raf = useRef(0)
  useEffect(() => {
    if (!playing) return
    const t0 = performance.now()
    choose(0)
    const tick = (now: number) => {
      const step = (now - t0) / STEP_MS
      const i = Math.min(n - 1, Math.floor(step))
      const k = Math.min(1, step - i)
      const a = rows[i].minutes
      const b = rows[Math.min(n - 1, i + 1)].minutes
      setClock(a + (b - a) * k)
      setOpen((cur) => (cur === i ? cur : i))
      pos.current = i
      setReached((r) => Math.max(r, i + 1))
      if (step >= n) {
        setPlaying(false)
        setClock(null)
        return
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  const stop = () => {
    setPlaying(false)
    setClock(null)
  }

  const now = clock ?? (reached > 0 ? rows[reached - 1].minutes : start)
  const fmt = (min: number) =>
    `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(Math.floor(min % 60)).padStart(2, '0')}`

  const current = reached > 0 ? rows[reached - 1] : null
  const sectionLabel = current
    ? `Section A–A. Event ${reached} of ${n} reached: ${current.time}, Event ID ${current.event}, ${current.target}.`
    : `Section A–A. No event selected yet; svc_backup is on the ground floor at WORKSTATION-14.`

  return (
    <section className="block block--evidence adw-climb" data-reached={reached}>
      <SheetHead block={block} kicker="Annotated evidence · Section A–A" />
      {block.lead && <p className="lead">{block.lead}</p>}
      <SyntheticBadge>{block.source}</SyntheticBadge>

      <div className="adw-climb__stage">
        <figure className="adw-climb__section" role="img" aria-label={sectionLabel}>
          <SectionDrawing rows={rows} reached={reached} />
          <figcaption aria-hidden="true">
            <span>Section A–A</span>
            <span>One storey per event</span>
          </figcaption>
        </figure>

        <div className="evidence adw-climb__schedule">
          <div className="evidence__head">
            <MonoLabel>{block.caption}</MonoLabel>
            <span className="evidence__hint">Select a line to annotate it</span>
          </div>
          <div className="adw-climb__cols" aria-hidden="true">
            <span>Time</span>
            <span>Event</span>
            <span>Fields</span>
          </div>
          <ol className="evidence__lines">
            {block.lines.map((line, i) => {
              const r = rows[i]
              const isOpen = open === i
              const kind = line.note!.kind
              return (
                <li
                  key={i}
                  className="evidence__line-wrap adw-climb__row"
                  data-passed={i < reached}
                  data-current={i === reached - 1}
                >
                  <button
                    type="button"
                    className={`evidence__line evidence__line--interactive${isOpen ? ' is-open' : ''}`}
                    data-kind={kind}
                    aria-expanded={isOpen}
                    aria-controls={`${panelId}-${i}`}
                    onClick={() => {
                      stop()
                      choose(isOpen ? null : i)
                    }}
                  >
                    <span className="evidence__marker" aria-hidden="true">
                      {EVIDENCE_META[kind].glyph}
                    </span>
                    <code className="adw-climb__code">
                      <span className="adw-climb__time">{r.time}</span>{' '}
                      <span className="adw-climb__event">{r.event}</span>{' '}
                      <span className="adw-climb__fields">
                        {r.fields.map((f, j) => (
                          <span key={j}>
                            {f}
                            {j < r.fields.length - 1 ? ' ' : ''}
                          </span>
                        ))}
                      </span>
                    </code>
                  </button>
                  {isOpen && (
                    <div className="evidence__note" id={`${panelId}-${i}`} data-kind={kind}>
                      <div className="evidence__note-head">
                        <EvidenceChip kind={kind} />
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
      </div>

      <div className="adw-climb__rule">
        <div className="adw-climb__ruler" aria-hidden="true">
          <span className="adw-climb__ruler-end">{fmt(start)}</span>
          <div className="adw-climb__track">
            {rows.map((r, i) => (
              <span
                key={i}
                className="adw-climb__tick"
                data-passed={i < reached}
                style={{ '--x': (r.minutes - start) / span } as CSSProperties}
              >
                <i>{r.event}</i>
              </span>
            ))}
            <span
              className="adw-climb__now"
              style={{ '--x': Math.min(1, Math.max(0, (now - start) / span)) } as CSSProperties}
            >
              <b>{fmt(now)}</b>
            </span>
          </div>
          <span className="adw-climb__ruler-end">{fmt(end)}</span>
        </div>
        <div className="adw-climb__controls">
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => {
              stop()
              choose(Math.max(0, pos.current - 1))
            }}
            disabled={reached <= 1}
          >
            Previous event
          </button>
          <button
            type="button"
            className="btn btn--sm btn--primary"
            onClick={() => {
              stop()
              choose(Math.min(n - 1, pos.current + 1))
            }}
            disabled={reached >= n && open !== null}
          >
            Next event
          </button>
          {!reduced && (
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              aria-pressed={playing}
              onClick={() => (playing ? stop() : setPlaying(true))}
            >
              {playing ? 'Stop the replay' : `Replay the ${end - start} minutes`}
            </button>
          )}
          <p className="adw-climb__status" aria-live="polite">
            {current ? `${reached} of ${n} · ${current.target}` : `0 of ${n}`}
          </p>
        </div>
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

/* -------------------------------------------------------------------------
   Section A–A: slabs, a stair in alternating flights, and the route.
   ------------------------------------------------------------------------- */

const W = 320
const H = 400
const GROUND = 372
const STOREY = 54
const STAIR_L = 34
const STAIR_R = 118

function SectionDrawing({ rows, reached }: { rows: Parsed[]; reached: number }) {
  const n = rows.length
  const storey = Math.min(STOREY, (GROUND - 24) / n)
  const levelY = (k: number) => GROUND - storey * k

  // The walking line up the stair: alternating flights, landing at each slab.
  const flight = (k: number) => {
    const y0 = levelY(k)
    const y1 = levelY(k + 1)
    const goingRight = k % 2 === 0
    const x0 = goingRight ? STAIR_L : STAIR_R
    const x1 = goingRight ? STAIR_R : STAIR_L
    return { x0, y0, x1, y1 }
  }
  const pathTo = (count: number) => {
    let d = `M${STAIR_L - 18} ${GROUND} L${STAIR_L} ${GROUND}`
    for (let k = 0; k < count; k++) {
      const f = flight(k)
      d += ` L${f.x1} ${f.y1}`
    }
    return d
  }

  return (
    <svg className="adw-section" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      {/* Ground, hatched as earth. */}
      <line className="adw-section__ground" x1={4} y1={GROUND} x2={W - 4} y2={GROUND} />
      {Array.from({ length: 26 }, (_, i) => (
        <line
          key={i}
          className="adw-section__earth"
          x1={8 + i * 12}
          y1={GROUND + 4}
          x2={2 + i * 12}
          y2={GROUND + 14}
        />
      ))}

      {/* Slabs and treads. */}
      {rows.map((r, k) => {
        const y = levelY(k + 1)
        const f = flight(k)
        const treads = 7
        return (
          <g key={k} className="adw-section__storey" data-passed={k < reached} data-current={k === reached - 1}>
            <rect className="adw-section__slab" x={STAIR_R + 6} y={y - 3} width={W - STAIR_R - 12} height={6} />
            <line className="adw-section__landing" x1={STAIR_L - 10} y1={y} x2={STAIR_R + 6} y2={y} />
            {Array.from({ length: treads }, (_, t) => {
              const a = t / treads
              const b = (t + 1) / treads
              const xa = f.x0 + (f.x1 - f.x0) * a
              const xb = f.x0 + (f.x1 - f.x0) * b
              const ya = f.y0 + (f.y1 - f.y0) * a
              const yb = f.y0 + (f.y1 - f.y0) * b
              return <path key={t} className="adw-section__tread" d={`M${xa} ${ya} L${xa} ${yb} L${xb} ${yb}`} />
            })}
            <text className="adw-section__when" x={STAIR_R + 14} y={y - 24}>
              {r.time} · {r.event}
            </text>
            <text
              className="adw-section__where"
              x={STAIR_R + 14}
              y={y - 9}
              data-long={r.target.length > 18 || undefined}
            >
              {r.target}
            </text>
          </g>
        )
      })}

      {/* Ground floor origin. */}
      <text className="adw-section__when" x={STAIR_R + 14} y={GROUND - 24}>
        Origin
      </text>
      <text className="adw-section__where" x={STAIR_R + 14} y={GROUND - 9}>
        WORKSTATION-14
      </text>

      {/* The whole climb, dashed: the path that exists. */}
      <path className="adw-section__path adw-section__path--all" d={pathTo(n)} />
      {/* The climb so far, solid red: the path taken. */}
      <path
        className="adw-section__path adw-section__path--taken"
        d={pathTo(reached)}
        key={reached}
      />
      {/* Where svc_backup stands now. */}
      {(() => {
        const x = reached === 0 ? STAIR_L - 18 : flight(reached - 1).x1
        const y = reached === 0 ? GROUND : levelY(reached)
        return (
          <g className="adw-section__marker" transform={`translate(${x} ${y})`}>
            <path d="M0 -17 L9 -3 L-9 -3 Z" />
            <text y={-6.5} textAnchor="middle">
              !
            </text>
          </g>
        )
      })()}

      {/* Section bubble and the privilege axis. */}
      <g className="adw-section__axis-arrow">
        <line x1={9} y1={GROUND - 30} x2={9} y2={GROUND - 150} />
        <path d={`M5 ${GROUND - 142} L9 ${GROUND - 152} L13 ${GROUND - 142}`} />
      </g>
      <text className="adw-section__axis" transform={`translate(20 ${GROUND - 40}) rotate(-90)`}>
        Privilege
      </text>
    </svg>
  )
}
