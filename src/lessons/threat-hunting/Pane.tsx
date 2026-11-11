import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { useReducedMotion } from '@/motion'
import { CHECK_DOTS, OVAL, PERF_R, ROSETTES, STAMP_H, STAMP_W, TICK_PATH, perfHoles, positionLabel } from './art'

/* =========================================================================
   PANE — a block of numeral-09 stamps with one listed variety
   =========================================================================
   The lesson's emblem. Every position is the same engraved stamp except
   one, whose centre was printed upside down. On entry a lamp passes over
   the pane position by position, leaving a pencil tick on every stamp it
   has examined — found or not — and settles on the variety.

   Decoration: the whole figure is aria-hidden and carries `hidden` until
   the lesson's screen stylesheet reveals it, so it never prints.
   ========================================================================= */

const HOLES = perfHoles()

/* Styles for the engraved stamp live inline: elements cloned into a <use>
   shadow tree do not match document selectors, but they do inherit the
   custom properties (--th-ink, --th-paper) from the <use> element. */
const S = {
  paper: { fill: 'var(--th-paper, #f3ecdc)' },
  rule: { fill: 'none', stroke: 'var(--th-ink, #2b3a9e)', strokeWidth: 0.5 },
  heavy: { fill: 'none', stroke: 'var(--th-ink, #2b3a9e)', strokeWidth: 1.4 },
  ink: { fill: 'var(--th-ink, #2b3a9e)' },
  oval: {
    fill: 'var(--th-paper, #f3ecdc)',
    stroke: 'var(--th-ink, #2b3a9e)',
    strokeWidth: 1,
  },
  label: {
    fill: 'var(--th-paper, #f3ecdc)',
    fontFamily: "'IBM Plex Sans Condensed', 'IBM Plex Sans', sans-serif",
    fontWeight: 600,
    fontSize: '7.2px',
    letterSpacing: '0.9px',
    textAnchor: 'middle',
  },
  rosette: {
    fill: 'none',
    stroke: 'var(--th-ink, #2b3a9e)',
    strokeWidth: 0.32,
  },
  numeral: {
    fontFamily: "'IBM Plex Serif', Georgia, serif",
    fontWeight: 600,
    fontSize: '44px',
    textAnchor: 'middle',
    fill: 'var(--th-paper, #f3ecdc)',
    stroke: 'var(--th-ink, #2b3a9e)',
    strokeWidth: 1.3,
    paintOrder: 'stroke',
  },
} as const
const SELVAGE = { left: 26, top: 30, right: 14, bottom: 18 }
const STEP_MS = 52

export function Pane({
  cols = 5,
  rows = 4,
  variety = 6,
  label = 'THREAT HUNTING',
  scan = true,
  className = '',
  caption = true,
}: {
  cols?: number
  rows?: number
  variety?: number
  label?: string
  scan?: boolean
  className?: string
  caption?: boolean
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const reduced = useReducedMotion()
  const animate = scan && !reduced
  const lampRef = useRef<SVGRectElement>(null)
  const [found, setFound] = useState(!animate)
  const count = cols * rows
  const v = Math.min(Math.max(variety, 0), count - 1)

  const W = SELVAGE.left + cols * STAMP_W + SELVAGE.right
  const H = SELVAGE.top + rows * STAMP_H + SELVAGE.bottom
  const at = (i: number) => ({
    x: SELVAGE.left + (i % cols) * STAMP_W,
    y: SELVAGE.top + Math.floor(i / cols) * STAMP_H,
  })

  useEffect(() => {
    if (!animate) {
      setFound(true)
      return
    }
    setFound(false)
    const lamp = lampRef.current
    const lead = 280
    const total = lead + count * STEP_MS
    let anim: Animation | undefined
    if (lamp && typeof lamp.animate === 'function') {
      const frames: Keyframe[] = []
      for (let i = 0; i < count; i++) {
        const p = at(i)
        frames.push({
          transform: `translate(${p.x}px, ${p.y}px)`,
          opacity: i === 0 ? 0 : 0.9,
          offset: (lead + i * STEP_MS) / (total + 520),
        })
      }
      const pv = at(v)
      frames.push({
        transform: `translate(${pv.x}px, ${pv.y}px)`,
        opacity: 0.9,
        offset: (total + 260) / (total + 520),
      })
      frames.push({
        transform: `translate(${pv.x}px, ${pv.y}px)`,
        opacity: 0,
        offset: 1,
      })
      frames.unshift({
        transform: `translate(${at(0).x}px, ${at(0).y}px)`,
        opacity: 0,
        offset: 0,
      })
      anim = lamp.animate(frames, {
        duration: total + 520,
        easing: 'linear',
        fill: 'forwards',
      })
    }
    const t = window.setTimeout(() => setFound(true), total + 260)
    return () => {
      window.clearTimeout(t)
      anim?.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, count, v])

  const vp = at(v)

  return (
    <figure
      className={`th-pane${animate ? ' is-scanning' : ''}${found ? ' is-found' : ''} ${className}`}
      aria-hidden="true"
      data-th-deco=""
      hidden
    >
      <svg className="th-pane__svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} focusable="false">
        <defs>
          <mask id={`${uid}-perf`} maskUnits="userSpaceOnUse" x="-1" y="-1" width={STAMP_W + 2} height={STAMP_H + 2}>
            <rect x="-1" y="-1" width={STAMP_W + 2} height={STAMP_H + 2} fill="#fff" />
            {HOLES.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={PERF_R} fill="#000" />
            ))}
          </mask>
          <pattern id={`${uid}-hatch`} width="3" height="1.7" patternUnits="userSpaceOnUse">
            <path
              d="M0 0.85H3"
              style={{
                stroke: 'var(--th-ink, #2b3a9e)',
                strokeWidth: 0.42,
                opacity: 0.5,
              }}
            />
          </pattern>
          <g id={`${uid}-frame`}>
            <rect width={STAMP_W} height={STAMP_H} style={S.paper} mask={`url(#${uid}-perf)`} />
            <rect x="9" y="9" width="82" height="102" fill={`url(#${uid}-hatch)`} />
            <rect x="9" y="9" width="82" height="102" style={S.heavy} />
            <rect x="11.5" y="24.5" width="77" height="71" style={S.rule} />
            <rect x="9" y="9" width="82" height="13" style={S.ink} />
            <text x="50" y="18.4" style={S.label}>
              {label}
            </text>
            <rect x="9" y="98" width="82" height="13" style={S.ink} />
            <text x="50" y="107.4" style={S.label}>
              DEFENSIVE TRACK
            </text>
          </g>
          <g id={`${uid}-centre`}>
            <ellipse cx={OVAL.cx} cy={OVAL.cy} rx={OVAL.rx} ry={OVAL.ry} style={S.oval} />
            {ROSETTES.map((d, i) => (
              <path key={i} d={d} style={{ ...S.rosette, opacity: i === 1 ? 0.75 : 1 }} />
            ))}
            <text x={OVAL.cx} y={OVAL.cy + 13} style={S.numeral}>
              9
            </text>
          </g>
        </defs>

        {/* Selvage: plate number, colour-check dots, row and column numbers */}
        <text x={SELVAGE.left} y="17" className="th-s-selvage">
          PLATE 9
        </text>
        {CHECK_DOTS.map((c, i) => (
          <circle
            key={c}
            cx={W - SELVAGE.right - 6 - i * 13}
            cy="13"
            r="4.2"
            className="th-s-dot"
            style={{ '--dot': c } as CSSProperties}
          />
        ))}
        {Array.from({ length: cols }, (_, c) => (
          <text key={c} x={SELVAGE.left + c * STAMP_W + STAMP_W / 2} y={SELVAGE.top - 6} className="th-s-pos">
            {c + 1}
          </text>
        ))}
        {Array.from({ length: rows }, (_, r) => (
          <text key={r} x={SELVAGE.left - 11} y={SELVAGE.top + r * STAMP_H + STAMP_H / 2 + 3} className="th-s-pos">
            {r + 1}
          </text>
        ))}

        {Array.from({ length: count }, (_, i) => {
          const p = at(i)
          const isV = i === v
          return (
            <g
              key={i}
              className={`th-cell${isV ? ' th-cell--variety' : ''}`}
              transform={`translate(${p.x} ${p.y})`}
              style={{ '--i': i } as CSSProperties}
            >
              <g className="th-cell__lift">
                <use href={`#${uid}-frame`} />
                <use href={`#${uid}-centre`} transform={isV ? `rotate(180 ${OVAL.cx} ${OVAL.cy})` : undefined} />
                <path d={TICK_PATH} className="th-s-tick" />
              </g>
            </g>
          )
        })}

        <rect ref={lampRef} className="th-s-lamp" width={STAMP_W} height={STAMP_H} rx="2" opacity="0" />
        <rect className="th-s-ring" x={vp.x - 3} y={vp.y - 3} width={STAMP_W + 6} height={STAMP_H + 6} rx="3" />
      </svg>
      {caption && (
        <figcaption className="th-pane__caption">
          <span className="th-pane__pos">{positionLabel(v, cols)}</span>
          <span>inverted centre</span>
          <span className="th-pane__count">1 of {count}</span>
        </figcaption>
      )}
    </figure>
  )
}
