import { Fragment, type CSSProperties, type ReactNode } from 'react'
import type { Block } from '@/types/content'
import type { RenderMode } from '@/components/teaching/blocks'
import { Duration, MonoLabel, ProvenanceTag, SourceRefs } from '@/components/brand/Brand'

/* =========================================================================
   MUSIC BOX PARTS
   =========================================================================
   The vocabulary every surface of this lesson is built from:

   - Cylinder     the pinned cylinder, unrolled: a steel band whose rows are
                  comb teeth (one per destination) and whose columns are
                  beats. Empty pin positions are drawn too, as ghosts, so
                  the grid's regularity is always visible. The comb at the
                  right edge is where each pin is plucked.
   - IndexBracket the blued-steel index bracket that marks a selection.
   - Decor        decoration that exists on screen only: rendered `hidden`
                  so a printed handout never carries it; the screen
                  stylesheet reveals it.

   Head, Detail and Footer mirror the shared renderer's scaffolding exactly,
   for the blocks this kit re-implements.
   ========================================================================= */

export function Decor({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`nmf-decor${className ? ` ${className}` : ''}`} aria-hidden="true" hidden>
      {children}
    </div>
  )
}

export function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

/* ---------------------------------------------------------------------------
   The cylinder, unrolled
   --------------------------------------------------------------------------- */

export interface Pin {
  row: number
  col: number
  kind: 'beacon' | 'human' | 'inject'
}

export interface CylinderProps {
  rows: number
  cols: number
  pins: Pin[]
  /** Engraved under the columns they name. */
  timeLabels?: { col: number; label: string }[]
  /** Engraved at the start of the rows they name. */
  rowLabels?: { row: number; label: string }[]
  bracket?: { row: number; col: number }
  className?: string
  /** Which end stays in view when the band is narrower than its drawing. */
  anchor?: 'start' | 'end'
  animate?: boolean
}

const CW = 26 // column pitch: one beat
const RH = 22 // row pitch: one tooth
const PAD_L = 34
const PAD_T = 18
const COMB_W = 92
const SCALE_H = 30

export function Cylinder({
  rows,
  cols,
  pins,
  timeLabels = [],
  rowLabels = [],
  bracket,
  className,
  anchor = 'start',
  animate = true,
}: CylinderProps) {
  const bandW = PAD_L + cols * CW
  const bandH = PAD_T * 2 + (rows - 1) * RH
  const W = bandW + COMB_W
  const H = bandH + (timeLabels.length ? SCALE_H : 4)
  const x = (c: number) => PAD_L + c * CW
  const y = (r: number) => PAD_T + r * RH
  const tune = rng(rows * 131 + cols)
  /* Tuned teeth: low notes long, high notes short. */
  const teeth = Array.from(
    { length: rows },
    (_, r) => 0.5 + 0.5 * (1 - r / Math.max(1, rows - 1)) * (0.85 + tune() * 0.15),
  )

  return (
    <svg
      className={`nmf-cyl${className ? ` ${className}` : ''}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio={anchor === 'end' ? 'xMaxYMid slice' : 'xMinYMid slice'}
      focusable="false"
    >
      <defs>
        {/* The drum's own curvature: light on the crown, falling to the edges. */}
        <linearGradient id="nmf-drum" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4f57" />
          <stop offset="0.36" stopColor="#d7dbe1" />
          <stop offset="0.6" stopColor="#aeb4bd" />
          <stop offset="1" stopColor="#3d4249" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={bandW} height={bandH} fill="url(#nmf-drum)" />
      {/* ghost pin positions: the grid is designed even where nothing is set */}
      {Array.from({ length: rows }, (_, r) => (
        <Fragment key={`r${r}`}>
          <line x1={PAD_L - 12} x2={bandW} y1={y(r)} y2={y(r)} className="nmf-cyl__track" />
          {Array.from({ length: cols }, (_, c) => (
            <circle key={c} cx={x(c)} cy={y(r)} r={1.5} className="nmf-cyl__ghost" />
          ))}
        </Fragment>
      ))}
      {pins.map((p, i) => (
        <circle
          key={i}
          cx={x(p.col)}
          cy={y(p.row)}
          r={p.kind === 'human' ? 3.4 : 5}
          className={`nmf-cyl__pin nmf-cyl__pin--${p.kind}`}
          style={{ '--d': p.col } as CSSProperties}
        />
      ))}
      {rowLabels.map((l) => (
        <text key={l.label} x={PAD_L - 8} y={y(l.row) - 5} className="nmf-cyl__row-label">
          {l.label}
        </text>
      ))}
      {/* The comb: one tuned tooth per row, plucked at the band's edge. */}
      <rect x={bandW + 10} y={0} width={10} height={bandH} className="nmf-cyl__comb-base" />
      {teeth.map((len, r) => (
        <rect
          key={r}
          x={bandW + 2}
          y={y(r) - 3}
          width={8 + (COMB_W - 30) * len}
          height={6}
          rx={1.5}
          className="nmf-cyl__tooth"
          style={{ '--r': r } as CSSProperties}
        />
      ))}
      {/* Engraved scale */}
      <line x1={0} x2={bandW} y1={bandH + 1} y2={bandH + 1} className="nmf-cyl__scale-rule" />
      {timeLabels.map((t) => (
        <g key={t.col}>
          <line x1={x(t.col)} x2={x(t.col)} y1={bandH + 1} y2={bandH + 7} className="nmf-cyl__scale-rule" />
          <text x={x(t.col)} y={bandH + 21} textAnchor="middle" className="nmf-cyl__time">
            {t.label}
          </text>
        </g>
      ))}
      {bracket && <BracketPath cx={x(bracket.col)} cy={y(bracket.row)} w={22} h={22} animate={animate} />}
    </svg>
  )
}

/* ---------------------------------------------------------------------------
   The index bracket
   --------------------------------------------------------------------------- */

function bracketD(cx: number, cy: number, w: number, h: number, arm: number) {
  const l = cx - w / 2
  const r = cx + w / 2
  const t = cy - h / 2
  const b = cy + h / 2
  return `M${l + arm} ${t} H${l} V${b} H${l + arm} M${r - arm} ${t} H${r} V${b} H${r - arm}`
}

export function BracketPath({
  cx,
  cy,
  w,
  h,
  animate = true,
}: {
  cx: number
  cy: number
  w: number
  h: number
  animate?: boolean
}) {
  return (
    <path
      d={bracketD(cx, cy, w, h, Math.min(8, w * 0.3))}
      pathLength={1}
      className={`nmf-bracket${animate ? ' nmf-bracket--draw' : ''}`}
    />
  )
}

/** A blued-steel index bracket sized to its parent. Parent must be position: relative. */
export function IndexBracket({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <svg className="nmf-index" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M5 1 H1 V39 H5 M95 1 H99 V39 H95" pathLength={1} className="nmf-bracket nmf-bracket--draw" />
    </svg>
  )
}

/* ---------------------------------------------------------------------------
   Pin layouts
   --------------------------------------------------------------------------- */

/** One tooth plucked on a fixed beat; the others plucked by a person, irregularly. */
export function beaconPins(rows: number, cols: number, beaconRow: number, every: number, seed = 17): Pin[] {
  const out: Pin[] = []
  for (let c = every - 1; c < cols; c += every) out.push({ row: beaconRow, col: c, kind: 'beacon' })
  const r = rng(seed)
  let c = 0
  for (;;) {
    const p = r()
    c += p < 0.5 ? 1 : p < 0.8 ? 2 + Math.floor(r() * 3) : 5 + Math.floor(r() * 6)
    if (c >= cols) break
    let row = Math.floor(r() * rows)
    if (row === beaconRow) row = (row + 1 + Math.floor(r() * (rows - 1))) % rows
    out.push({ row, col: c, kind: 'human' })
  }
  return out
}

export function clock(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

/* ---------------------------------------------------------------------------
   Shared scaffolding, mirroring blocks.tsx for re-implemented blocks
   --------------------------------------------------------------------------- */

export function Head({ block }: { block: Block }) {
  return (
    <header className="block__head">
      <h2 className="block__title">{block.title}</h2>
      {block.minutes !== undefined && (
        <div className="block__meta">
          <Duration minutes={block.minutes} />
        </div>
      )}
    </header>
  )
}

export function Detail({ detail, mode }: { detail?: string[]; mode: RenderMode }) {
  if (mode !== 'study' || !detail?.length) return null
  return (
    <div className="detail">
      <MonoLabel>Going deeper</MonoLabel>
      <div className="prose">
        {detail.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
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
