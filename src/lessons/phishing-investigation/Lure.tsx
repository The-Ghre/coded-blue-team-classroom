import { useEffect, useId, useRef } from 'react'
import { useFrameLoop, useIsVisible, useReducedMotion } from '@/motion'

/* =========================================================================
   THE LURE
   =========================================================================
   A through-wired minnow plug, drawn as code. Its painted flank is what the
   target sees; the wire and the hooks are what it is. A lens follows the
   pointer and dissolves the paint wherever it passes, so the wire that runs
   from the line to every hook is visible underneath — the same move the
   lesson teaches with a header: read past the display to the structure.

   Decorative throughout: the rig is aria-hidden and never takes the pointer.
   ========================================================================= */

/** Tie point in viewBox units — the line attaches here and the lure pivots here. */
const TIE = { x: 100, y: 20 }
const VIEW = { w: 200, h: 470 }

const BODY =
  'M100 44 C134 46 150 96 150 158 C150 228 128 296 113 336 L130 386 C114 380 104 374 100 372 C96 374 86 380 70 386 L87 336 C72 296 50 228 50 158 C50 96 66 46 100 44 Z'

function Treble({ x, y }: { x: number; y: number }) {
  const b = y + 48
  return (
    <g className="pi-lure__hook" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={x} cy={y} r={3.2} />
      <path d={`M${x} ${y + 3} V${b}`} />
      <path d={`M${x} ${b} C${x} ${b + 19} ${x + 24} ${b + 20} ${x + 24} ${b - 1}`} />
      <path d={`M${x + 24} ${b - 1} L${x + 19.5} ${b + 6}`} />
      <path d={`M${x} ${b} C${x} ${b + 19} ${x - 24} ${b + 20} ${x - 24} ${b - 1}`} />
      <path d={`M${x - 24} ${b - 1} L${x - 19.5} ${b + 6}`} />
      <path d={`M${x} ${b} C${x} ${b + 15} ${x + 9} ${b + 17} ${x + 11} ${b + 8}`} />
    </g>
  )
}

export interface LureRigProps {
  className?: string
  /** Whether the lens follows the pointer. Off, the lens rests on the belly hook. */
  interactive?: boolean
  /** Units of line drawn above the tie point (clipped by whatever holds the rig). */
  lineAbove?: number
}

export function LureRig({ className, interactive = true, lineAbove = 2400 }: LureRigProps) {
  const uid = useId().replace(/:/g, '')
  const rigRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<SVGGElement>(null)
  const lensRef = useRef<SVGCircleElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)
  const lineRef = useRef<SVGPathElement>(null)
  const reduced = useReducedMotion()
  const visible = useIsVisible(rigRef, '120px')

  const pointer = useRef<{ x: number; y: number; at: number } | null>(null)
  const state = useRef({ angle: 0, lx: 112, ly: 228, bow: 0 })

  useEffect(() => {
    if (!interactive || reduced) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      pointer.current = { x: e.clientX, y: e.clientY, at: performance.now() }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [interactive, reduced])

  const apply = () => {
    const s = state.current
    groupRef.current?.setAttribute('transform', `rotate(${s.angle.toFixed(2)} ${TIE.x} ${TIE.y})`)
    lensRef.current?.setAttribute('cx', s.lx.toFixed(1))
    lensRef.current?.setAttribute('cy', s.ly.toFixed(1))
    ringRef.current?.setAttribute('cx', s.lx.toFixed(1))
    ringRef.current?.setAttribute('cy', s.ly.toFixed(1))
    lineRef.current?.setAttribute(
      'd',
      `M${TIE.x} ${-lineAbove} Q${(TIE.x + s.bow).toFixed(1)} ${(-lineAbove / 2).toFixed(0)} ${TIE.x} ${TIE.y - 6}`,
    )
  }

  useFrameLoop((t) => {
    const s = state.current
    const g = groupRef.current
    let targetAngle = Math.sin(t * 0.7) * 2.4 + Math.sin(t * 1.9) * 0.6
    // Idle lens: a slow pass down the body and back, so the wire shows even
    // to a visitor who never moves the pointer.
    let tx = 106 + Math.sin(t * 0.45) * 22
    let ty = 210 + Math.sin(t * 0.31) * 130
    const p = pointer.current
    const fresh = p && performance.now() - p.at < 2600
    if (p && fresh && g) {
      const ctm = g.getScreenCTM()
      const svg = g.ownerSVGElement
      if (ctm && svg) {
        const pt = svg.createSVGPoint()
        pt.x = p.x
        pt.y = p.y
        const local = pt.matrixTransform(ctm.inverse())
        // Swing toward the pointer, as a lure worked toward a fish.
        const tie = new DOMPoint(TIE.x, TIE.y).matrixTransform(ctm)
        const dx = p.x - tie.x
        targetAngle += Math.max(-1, Math.min(1, dx / 600)) * -11
        // The lens only takes over when the pointer is near the lure.
        if (local.x > -60 && local.x < VIEW.w + 60 && local.y > -20 && local.y < VIEW.h + 40) {
          tx = local.x
          ty = local.y
        }
      }
    }
    s.angle += (targetAngle - s.angle) * 0.06
    s.lx += (tx - s.lx) * 0.14
    s.ly += (ty - s.ly) * 0.14
    s.bow = Math.sin(t * 0.5) * 34 + s.angle * 4
    apply()
  }, !reduced && visible)

  // Reduced motion: one composed frame — lens over the belly hook, wire shown.
  useEffect(() => {
    if (!reduced) return
    state.current = { angle: -3, lx: 120, ly: 214, bow: 18 }
    apply()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  const mask = `pi-lens-${uid}`
  const clip = `pi-body-${uid}`
  const paint = `pi-paint-${uid}`
  const scales = `pi-scales-${uid}`

  return (
    <div ref={rigRef} className={`pi-rig${className ? ` ${className}` : ''}`} aria-hidden="true">
      <svg
        className="pi-lure"
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        focusable="false"
        overflow="visible"
      >
        <defs>
          <linearGradient id={paint} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--pi-chartreuse)" />
            <stop offset="0.46" stopColor="var(--pi-chartreuse)" />
            <stop offset="0.78" stopColor="var(--pi-pearl)" />
            <stop offset="1" stopColor="var(--pi-pearl)" />
          </linearGradient>
          <pattern id={scales} width="12" height="9" patternUnits="userSpaceOnUse">
            <path d="M0 9 A6 6 0 0 1 12 9" fill="none" stroke="var(--pi-deep)" strokeWidth="0.7" />
          </pattern>
          <clipPath id={clip}>
            <path d={BODY} />
          </clipPath>
          <mask id={mask} maskUnits="userSpaceOnUse" x="-200" y="-200" width="600" height="900">
            <rect x="-200" y="-200" width="600" height="900" fill="#fff" />
            <circle ref={lensRef} cx="112" cy="228" r="54" fill="#000" />
          </mask>
        </defs>

        <path
          ref={lineRef}
          className="pi-lure__line"
          d={`M${TIE.x} ${-lineAbove} Q${TIE.x} ${-lineAbove / 2} ${TIE.x} ${TIE.y - 6}`}
          fill="none"
        />

        <g ref={groupRef}>
          {/* What it is: the skeleton under the paint. */}
          <g className="pi-lure__skeleton">
            <path d={BODY} className="pi-lure__outline" />
            <path
              className="pi-lure__wire"
              d="M100 26 V205 C118 196 136 196 146 205 M100 205 V392"
            />
            <circle cx="100" cy="168" r="10" className="pi-lure__weight" />
            <circle cx="100" cy="262" r="7" className="pi-lure__weight" />
          </g>

          {/* What the target sees: the paint. */}
          <g mask={`url(#${mask})`}>
            <path d={BODY} fill={`url(#${paint})`} />
            <g clipPath={`url(#${clip})`}>
              <rect x="40" y="40" width="120" height="350" fill={`url(#${scales})`} opacity="0.32" />
              <g className="pi-lure__stripes">
                <path d="M46 120 L96 104 L96 116 L46 136 Z" />
                <path d="M46 170 L98 150 L98 164 L46 188 Z" />
                <path d="M46 222 L98 200 L98 214 L46 240 Z" />
                <path d="M50 272 L100 252 L100 264 L54 290 Z" />
              </g>
              <ellipse cx="132" cy="122" rx="15" ry="30" className="pi-lure__gill" />
              <path d="M70 70 C64 140 66 240 92 330" className="pi-lure__sheen" />
            </g>
            <path d={BODY} className="pi-lure__edge" />
            <path d="M88 108 C104 118 124 118 140 108" className="pi-lure__gillline" />
            <circle cx="116" cy="84" r="11" className="pi-lure__eye" />
            <circle cx="117.5" cy="85" r="5.2" className="pi-lure__pupil" />
            <circle cx="113" cy="80.5" r="2" className="pi-lure__glint" />
          </g>

          {/* Always there, whatever the paint says. */}
          <path d="M86 52 L72 10 Q100 2 128 10 L114 52 Z" className="pi-lure__lip" />
          <circle cx={TIE.x} cy={TIE.y} r="4.6" className="pi-lure__ring" />
          <circle cx="146" cy="205" r="3.6" className="pi-lure__ring" />
          <circle cx="154" cy="214" r="6" className="pi-lure__ring" />
          <circle cx="100" cy="392" r="6" className="pi-lure__ring" />
          <Treble x={158} y={220} />
          <Treble x={100} y={398} />

          <circle ref={ringRef} cx="112" cy="228" r="54" className="pi-lure__lens" />
        </g>
      </svg>
    </div>
  )
}
