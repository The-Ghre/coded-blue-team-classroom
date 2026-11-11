import { useEffect, useMemo, useRef, useState } from 'react'
import { HIDDEN_ON_PAPER, formatClock, graphWindow, scheduledTraffic, stationOffsets, type Route } from './graph'

/* =========================================================================
   ROUTE GRAPH — the working graph as SVG
   =========================================================================
   A strip of the timetable: stations down the left, minutes across the top,
   the scheduled lattice in faint graphite and the unscheduled route in
   vermilion. Used by the hero and the title slide. Decorative: the same
   facts are in the evidence block as text.
   ========================================================================= */

interface Props {
  route: Route
  /** Draw the route, or leave the sheet blank for the student to fill. */
  showRoute?: boolean
  height?: number
  className?: string
}

/** Measures its own width so the drawing stays at true pixel size: labels
    never scale down into illegibility on a phone. */
function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null)
  const [w, setW] = useState(fallback)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

export function RouteGraph({ route, showRoute = true, height = 240, className }: Props) {
  const [wrapRef, width] = useWidth<HTMLDivElement>(1000)
  const narrow = width < 560
  const labelWidth = narrow ? 92 : 132
  const [t0, t1] = graphWindow(route)
  const top = 30
  const bottom = height - 14
  const left = labelWidth
  const right = width - 8
  const offsets = useMemo(() => stationOffsets(route.stations.length), [route])
  const runs = useMemo(() => scheduledTraffic(route.stations.length, t0, t1), [route, t0, t1])
  const x = (t: number) => left + ((t - t0) / (t1 - t0)) * (right - left)
  const y = (s: number) => top + offsets[s] * (bottom - top)

  const minutes: number[] = []
  for (let t = Math.ceil(t0 / 60) * 60; t <= t1; t += 60) minutes.push(t)
  const tens: number[] = []
  for (let t = Math.ceil(t0 / 10) * 10; t <= t1; t += 10) if (t % 60) tens.push(t)

  /* The route holds at each station until it departs, then runs. */
  let d = ''
  route.stops.forEach((s, k) => {
    const px = x(s.t)
    const py = y(s.station)
    if (k === 0) d += `M${px.toFixed(1)} ${py.toFixed(1)}`
    else {
      const prev = route.stops[k - 1]
      d += ` L${px.toFixed(1)} ${y(prev.station).toFixed(1)} L${px.toFixed(1)} ${py.toFixed(1)}`
    }
  })

  return (
    <div ref={wrapRef} style={HIDDEN_ON_PAPER} className={`la-graph${narrow ? ' la-graph--narrow' : ''}${className ? ` ${className}` : ''}`}>
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      focusable="false"
    >
      <g className="la-graph__ruling">
        {tens.map((t) => (
          <line key={t} x1={x(t)} x2={x(t)} y1={top - 4} y2={bottom} className="la-graph__tick" />
        ))}
        {minutes.map((t) => (
          <line key={t} x1={x(t)} x2={x(t)} y1={top - 12} y2={bottom + 6} className="la-graph__minute" />
        ))}
      </g>
      <g className="la-graph__stations">
        {route.stations.map((st, i) => (
          <line
            key={st.name}
            x1={left - 8}
            x2={right}
            y1={y(i)}
            y2={y(i)}
            className={st.derived ? 'la-graph__station la-graph__station--derived' : 'la-graph__station'}
          />
        ))}
      </g>
      <g className="la-graph__lattice">
        {runs.map((run, i) => (
          <polyline
            key={i}
            points={run.map(([t, s]) => `${x(t).toFixed(1)},${y(s).toFixed(1)}`).join(' ')}
          />
        ))}
      </g>
      {showRoute && (
        <g className="la-graph__route">
          <path d={d} pathLength={1} className="la-graph__run" />
          {route.stops.map((s, k) => (
            <rect
              key={k}
              x={x(s.t) - 4}
              y={y(s.station) - 4}
              width={8}
              height={8}
              className={s.derived ? 'la-graph__stop la-graph__stop--derived' : 'la-graph__stop'}
              style={{ ['--k' as string]: k }}
            />
          ))}
        </g>
      )}
      {/* Labels sit on a sheet-coloured mask so the lattice never runs under them. */}
      <rect x={0} y={0} width={left - 10} height={height} className="la-graph__label-ground" />
      <g className="la-graph__labels">
        {route.stations.map((st, i) => (
          <text key={st.name} x={left - 16} y={y(i)} dy="0.34em" textAnchor="end">
            {st.name.toUpperCase()}
          </text>
        ))}
        {minutes.filter((_, i) => !narrow || i % 2 === 0).map((t) => (
          <text key={t} x={x(t)} y={top - 17} textAnchor="middle" className="la-graph__time">
            {formatClock(t, false)}
          </text>
        ))}
      </g>
    </svg>
    </div>
  )
}
