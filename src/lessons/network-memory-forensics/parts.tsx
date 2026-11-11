import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Block } from '@/types/content'
import type { RenderMode } from '@/components/teaching/blocks'
import { Duration, MonoLabel, ProvenanceTag, SourceRefs } from '@/components/brand/Brand'
import { useReducedMotion } from '@/motion'

/* =========================================================================
   DARKROOM PARTS
   =========================================================================
   The small vocabulary every surface of this lesson is built from:

   - FilmStrip   a contact-printed strip: black rebate, sprocket holes,
                 light edge print, and frames that are positives.
   - MarkerRing  a china-marker circle, drawn by hand around what matters.
   - Decor       a wrapper that keeps decoration off paper. It renders with
                 the `hidden` attribute and the screen stylesheet reveals
                 it, so a printed handout never carries darkroom art.

   Detail, Footer and Head mirror the shared renderer's scaffolding exactly,
   for the blocks this kit re-implements.
   ========================================================================= */

/** Decoration that exists on screen only. aria-hidden, and hidden on paper. */
export function Decor({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`nmf-decor${className ? ` ${className}` : ''}`} aria-hidden="true" hidden>
      {children}
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Film strip
   --------------------------------------------------------------------------- */

export interface Frame {
  /** Edge-print text under the frame (a time, a label). */
  edge?: string
  /** What the positive image shows. */
  image: 'payload' | 'blank' | 'fog' | 'burst' | 'label'
  /** For 'burst' frames: deterministic variety. */
  seed?: number
  /** For 'label' frames: a word printed into the frame. */
  label?: string
}

const FW = 150 // frame width (3:2)
const FH = 100
const GAP = 8
const REB = 34 // rebate height
const PITCH = FW + GAP

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

function FrameImage({ frame, x, y }: { frame: Frame; x: number; y: number }) {
  switch (frame.image) {
    case 'payload':
      /* The same 180-byte payload, at the same place, every time. */
      return (
        <g>
          <rect x={x} y={y} width={FW} height={FH} className="nmf-strip__frame" />
          <rect x={x + 18} y={y + FH - 30} width={FW - 36} height={1} className="nmf-strip__base" />
          <rect x={x + 64} y={y + FH - 52} width={22} height={22} className="nmf-strip__mark" />
        </g>
      )
    case 'burst': {
      const r = rng(frame.seed ?? 7)
      const marks = Array.from({ length: 3 + Math.floor(r() * 4) }, () => ({
        mx: 14 + r() * (FW - 40),
        h: 6 + r() * 56,
        w: 4 + r() * 18,
      }))
      return (
        <g>
          <rect x={x} y={y} width={FW} height={FH} className="nmf-strip__frame" />
          <rect x={x + 10} y={y + FH - 30} width={FW - 20} height={1} className="nmf-strip__base" />
          {marks.map((m, i) => (
            <rect
              key={i}
              x={x + m.mx}
              y={y + FH - 30 - m.h}
              width={m.w}
              height={m.h}
              className="nmf-strip__mark nmf-strip__mark--soft"
            />
          ))}
        </g>
      )
    }
    case 'fog':
      return <rect x={x} y={y} width={FW} height={FH} className="nmf-strip__frame nmf-strip__frame--fog" />
    case 'label':
      return (
        <g>
          <rect x={x} y={y} width={FW} height={FH} className="nmf-strip__frame" />
          <text x={x + FW / 2} y={y + FH / 2 + 7} textAnchor="middle" className="nmf-strip__word">
            {frame.label}
          </text>
        </g>
      )
    default:
      return <rect x={x} y={y} width={FW} height={FH} className="nmf-strip__frame nmf-strip__frame--blank" />
  }
}

/**
 * A strip of film, contact printed. `ring` circles one frame with the
 * china marker. Sized by its container; the viewBox slices on narrow screens
 * so frames keep their proportions instead of squashing.
 */
export function FilmStrip({
  frames,
  topEdge,
  startNumber = 1,
  ring,
  className,
  animateRing = true,
  anchor = 'start',
}: {
  frames: Frame[]
  topEdge?: string
  startNumber?: number
  ring?: number
  className?: string
  animateRing?: boolean
  /** Which end of the strip stays in view when the container is narrower. */
  anchor?: 'start' | 'end'
}) {
  const width = frames.length * PITCH + GAP + 24
  const height = FH + REB * 2
  const holesPerFrame = 6
  const holePitch = PITCH / holesPerFrame
  const holes = Array.from({ length: Math.ceil(width / holePitch) }, (_, i) => i * holePitch + 6)

  return (
    <svg
      className={`nmf-strip${className ? ` ${className}` : ''}`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={anchor === 'end' ? 'xMaxYMid slice' : 'xMinYMid slice'}
      focusable="false"
    >
      <rect x={0} y={0} width={width} height={height} className="nmf-strip__rebate" />
      {holes.map((hx, i) => (
        <g key={i}>
          <rect x={hx} y={4} width={11} height={13} rx={2} className="nmf-strip__hole" />
          <rect x={hx} y={height - 17} width={11} height={13} rx={2} className="nmf-strip__hole" />
        </g>
      ))}
      {topEdge &&
        frames.map((_, i) =>
          i % 4 === 1 ? (
            <text key={i} x={GAP + i * PITCH + 12} y={REB - 7} className="nmf-strip__edge nmf-strip__edge--top">
              {topEdge}
            </text>
          ) : null,
        )}
      {frames.map((f, i) => {
        const x = GAP + i * PITCH
        const n = startNumber + i
        return (
          <g key={i} className="nmf-strip__cell" style={{ ['--f' as string]: i }}>
            <FrameImage frame={f} x={x} y={REB} />
            <text x={x + 4} y={REB + FH + 13} className="nmf-strip__edge">
              {n}
              <tspan dx={6}>▸</tspan>
              <tspan dx={6}>{n}A</tspan>
            </text>
            {f.edge && (
              <text x={x + FW - 4} y={REB + FH + 13} textAnchor="end" className="nmf-strip__edge nmf-strip__edge--time">
                {f.edge}
              </text>
            )}
          </g>
        )
      })}
      {ring !== undefined && (
        <MarkerPath
          cx={GAP + ring * PITCH + FW / 2}
          cy={height / 2}
          rx={FW / 2 + 14}
          ry={height / 2 - 2}
          animate={animateRing}
        />
      )}
    </svg>
  )
}

/* ---------------------------------------------------------------------------
   China marker
   --------------------------------------------------------------------------- */

/** A hand-drawn loop: an ellipse that wobbles and overshoots its own start. */
function loopPath(cx: number, cy: number, rx: number, ry: number) {
  const pts: string[] = []
  const steps = 28
  for (let i = 0; i <= steps + 4; i++) {
    const a = -Math.PI * 0.62 + (i / steps) * Math.PI * 2
    const wobble = 1 + Math.sin(i * 1.7) * 0.025 + (i > steps ? 0.06 : 0)
    const x = cx + Math.cos(a) * rx * wobble
    const y = cy + Math.sin(a) * ry * (wobble + (i > steps ? -0.08 : 0))
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return pts.join(' ')
}

export function MarkerPath({
  cx,
  cy,
  rx,
  ry,
  animate = true,
}: {
  cx: number
  cy: number
  rx: number
  ry: number
  animate?: boolean
}) {
  return (
    <path
      d={loopPath(cx, cy, rx, ry)}
      pathLength={1}
      className={`nmf-marker${animate ? ' nmf-marker--draw' : ''}`}
    />
  )
}

/** A china-marker ring sized to its parent box. Parent must be position: relative. */
export function MarkerRing({ active, className }: { active: boolean; className?: string }) {
  if (!active) return null
  return (
    <svg
      className={`nmf-ring${className ? ` ${className}` : ''}`}
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <MarkerPath cx={50} cy={20} rx={49} ry={18} />
    </svg>
  )
}

/* ---------------------------------------------------------------------------
   Develop-on-arrival: a heading reaches full density as it enters view.
   Content is visible from the first frame; only its density changes.
   --------------------------------------------------------------------------- */

export function useDeveloped<T extends Element>() {
  const ref = useRef<T>(null)
  const reduced = useReducedMotion()
  const [developed, setDeveloped] = useState(false)
  useEffect(() => {
    if (reduced) {
      setDeveloped(true)
      return
    }
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setDeveloped(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setDeveloped(true)
          io.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])
  return [ref, developed] as const
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

/** Deterministic beacon frames for strips: same payload, four minutes apart. */
export function beaconFrames(count: number, startMinutes: number, stepMinutes = 4): Frame[] {
  return Array.from({ length: count }, (_, i) => {
    const m = startMinutes + i * stepMinutes
    const hh = String(Math.floor(m / 60)).padStart(2, '0')
    const mm = String(m % 60).padStart(2, '0')
    return { image: 'payload' as const, edge: `${hh}:${mm}` }
  })
}
