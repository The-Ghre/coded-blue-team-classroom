import type { CSSProperties } from 'react'
import { DRAWING, PULL, ROOMS, ROUTE, type Prim } from './plan'

/**
 * The same plan as the backdrop, as SVG, for places that need it crisp and
 * small: the hero's key plan and the title sheet. Decorative — the caller
 * owns any text alternative.
 */
export function PlanSvg({
  route = false,
  pull = false,
  highlight = [],
  labels = false,
  className,
}: {
  route?: boolean
  pull?: boolean
  highlight?: string[]
  labels?: boolean
  className?: string
}) {
  const prims = DRAWING.filter((p) => labels || p.t !== 'text')
  return (
    <svg
      className={className}
      viewBox="-6 -4 212 128"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <g className="adw-plan__hl">
        {highlight.map((id) => {
          const r = ROOMS.find((room) => room.id === id)
          if (!r) return null
          return <rect key={id} x={r.x + 2} y={r.y + 2} width={r.w - 4} height={r.h - 4} />
        })}
      </g>
      <g className="adw-plan__ink">
        {prims.map((p, i) => (
          <PrimSvg key={i} p={p} i={i} />
        ))}
      </g>
      {route && (
        <polyline className="adw-plan__route" points={ROUTE.map((pt) => pt.join(',')).join(' ')} pathLength={1} />
      )}
      {pull && <polyline className="adw-plan__pull" points={PULL.map((pt) => pt.join(',')).join(' ')} pathLength={1} />}
    </svg>
  )
}

function PrimSvg({ p, i }: { p: Prim; i: number }) {
  const style = { '--i': i } as CSSProperties
  switch (p.t) {
    case 'line':
      return (
        <line
          x1={p.x1}
          y1={p.y1}
          x2={p.x2}
          y2={p.y2}
          strokeWidth={p.w * 0.6}
          strokeDasharray={p.dash?.join(' ')}
          pathLength={p.dash ? undefined : 1}
          className={p.dash ? 'is-chain' : undefined}
          style={style}
        />
      )
    case 'arc': {
      const x0 = p.cx + Math.cos(p.a0) * p.r
      const y0 = p.cy + Math.sin(p.a0) * p.r
      const x1 = p.cx + Math.cos(p.a1) * p.r
      const y1 = p.cy + Math.sin(p.a1) * p.r
      return (
        <path
          d={`M${x0} ${y0} A${p.r} ${p.r} 0 0 1 ${x1} ${y1}`}
          strokeWidth={p.w * 0.6}
          pathLength={1}
          style={style}
        />
      )
    }
    case 'circle':
      return <circle cx={p.cx} cy={p.cy} r={p.r} strokeWidth={p.w * 0.6} pathLength={1} style={style} />
    case 'text':
      return (
        <text
          x={p.x}
          y={p.y}
          fontSize={p.size}
          textAnchor={p.align === 'center' ? 'middle' : 'start'}
          fontWeight={p.weight ?? 500}
          style={style}
        >
          {p.s}
        </text>
      )
  }
}
