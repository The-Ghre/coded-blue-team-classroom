/* =========================================================================
   TRAIL — the one record every surface of this lesson reads
   =========================================================================
   The carpet remembers. Steps the walker has taken, and the places the
   cleaner has vacuumed, live here for the whole visit, so the presentation,
   the study pages and the overview all show the same trodden floor. Going
   back a slide never removes a step: navigation is not erasure.

   Coordinates are normalised to the layer (0..1 on both axes, origin top
   left) so the same walk fits a projector and a phone.
   ========================================================================= */

export type TrailEvent = { type: 'step'; index: number } | { type: 'vacuum'; side: 'linux' | 'windows' }

/** Steps the walker takes across the whole lesson. */
export const TOTAL_STEPS = 30

/** Where the two carpets meet, as x at the top and x at the bottom (0..1). */
export const THRESHOLD = { top: 0.585, bottom: 0.535 } as const

export function thresholdX(y: number): number {
  return THRESHOLD.top + (THRESHOLD.bottom - THRESHOLD.top) * y
}

type Listener = () => void

const state = {
  events: [] as TrailEvent[],
  stepsTaken: 0,
  vacuumed: { linux: false, windows: false },
}
const listeners = new Set<Listener>()

export const trail = {
  get events(): readonly TrailEvent[] {
    return state.events
  },
  get stepsTaken() {
    return state.stepsTaken
  },
  isVacuumed(side: 'linux' | 'windows') {
    return state.vacuumed[side]
  },
  /** Walk forward to `count` steps. Never walks backwards. */
  walkTo(count: number) {
    const target = Math.max(0, Math.min(TOTAL_STEPS, Math.round(count)))
    if (target <= state.stepsTaken) return
    for (let i = state.stepsTaken; i < target; i++) state.events.push({ type: 'step', index: i })
    state.stepsTaken = target
    listeners.forEach((l) => l())
  },
  vacuum(side: 'linux' | 'windows') {
    if (state.vacuumed[side]) return
    state.vacuumed[side] = true
    state.events.push({ type: 'vacuum', side })
    listeners.forEach((l) => l())
  },
  subscribe(l: Listener) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}

/* ---------------------------------------------------------------------------
   The floor: Windows plum carpet on the left, Linux petrol carpet on the
   right, matching the lesson's own column order. The walk is a cubic curve
   from the lower right of the Linux carpet, over the threshold, to the upper
   left of the Windows carpet — the order the intrusion happened in. Steps are spaced by
   arc length in the layer's own pixels, so a stride looks like a stride at
   any aspect ratio.
   --------------------------------------------------------------------------- */

const P = [
  [0.96, 0.97],
  [0.74, 0.4],
  [0.3, 0.88],
  [0.04, 0.1],
] as const

function bez(t: number, w: number, h: number): [number, number] {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return [
    (a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0]) * w,
    (a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]) * h,
  ]
}

export interface Footprint {
  /** Layer pixels. */
  x: number
  y: number
  /** Direction of travel, radians, screen space (y down). */
  angle: number
  /** -1 left foot, +1 right foot. */
  side: -1 | 1
  /** Sole length in layer pixels. */
  length: number
}

/** Every footprint of the walk, laid out for a layer of w × h pixels. */
export function layoutWalk(w: number, h: number): Footprint[] {
  const samples = 400
  const pts: [number, number][] = []
  const lens: number[] = [0]
  for (let i = 0; i <= samples; i++) {
    pts.push(bez(i / samples, w, h))
    if (i > 0) {
      const [x0, y0] = pts[i - 1]
      const [x1, y1] = pts[i]
      lens.push(lens[i - 1] + Math.hypot(x1 - x0, y1 - y0))
    }
  }
  const total = lens[samples]
  const stride = total / (TOTAL_STEPS + 1)
  const length = Math.max(18, Math.min(60, stride * 0.86))
  const out: Footprint[] = []
  let j = 0
  for (let k = 0; k < TOTAL_STEPS; k++) {
    const target = stride * (k + 1)
    while (j < samples && lens[j + 1] < target) j++
    const span = lens[j + 1] - lens[j] || 1
    const f = (target - lens[j]) / span
    const [x0, y0] = pts[j]
    const [x1, y1] = pts[Math.min(j + 1, samples)]
    const x = x0 + (x1 - x0) * f
    const y = y0 + (y1 - y0) * f
    const angle = Math.atan2(y1 - y0, x1 - x0)
    const side: -1 | 1 = k % 2 === 0 ? -1 : 1
    // Feet sit either side of the line of travel.
    const off = length * 0.3 * side
    out.push({
      x: x - Math.sin(angle) * off,
      y: y + Math.cos(angle) * off,
      angle: angle + side * 0.07,
      side,
      length,
    })
  }
  return out
}

/** The vacuum's lanes for one carpet, in layer pixels: [x0, x1] per lane. */
export function vacuumLanes(side: 'linux' | 'windows', w: number): [number, number][] {
  const lane = Math.max(34, Math.min(70, w * 0.042))
  const lanes: [number, number][] = []
  // Linux: three lanes across the petrol carpet, where the early steps run.
  // Windows: three lanes on the plum carpet, after the threshold.
  // Everything outside the lanes keeps its prints.
  const start = side === 'linux' ? w * 0.69 : w * 0.17
  for (let i = 0; i < 3; i++) lanes.push([start + lane * i, start + lane * (i + 1)])
  return lanes
}
