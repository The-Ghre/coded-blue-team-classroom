/* =========================================================================
   AS-BUILT — the domain drawn as one storey of a building
   =========================================================================
   One hand-laid floor plan, in drawing units (200 × 120), shared by the
   backdrop, the hero's key plan and the title sheet so the lesson only ever
   shows one building. Rooms carry the host names the lesson's demonstration
   uses; everything else is generic architectural furniture (stair, plant,
   lobby) that makes no claim about any real estate.
   ========================================================================= */

export const PLAN_W = 200
export const PLAN_H = 120

/** `room`: a room's name or number tag, left off the cover sheet. */
type Tagged = { tag?: 'room' }

export type Prim = Tagged &
  ({ t: 'line'; x1: number; y1: number; x2: number; y2: number; w: number; dash?: number[] }
  | { t: 'arc'; cx: number; cy: number; r: number; a0: number; a1: number; w: number }
  | { t: 'circle'; cx: number; cy: number; r: number; w: number }
  | { t: 'text'; x: number; y: number; s: string; size: number; align?: CanvasTextAlign; weight?: number })

export interface Room {
  id: string
  label: string
  x: number
  y: number
  w: number
  h: number
  /** Tier 0: rooms whose compromise is the domain's. */
  tier0?: boolean
}

/* Exterior shell and the corridor that every route has to use. */
const X0 = 10
const X1 = 190
const Y0 = 12
const Y1 = 110
const CORR0 = 52
const CORR1 = 62

export const ROOMS: Room[] = [
  { id: 'ws14', label: 'WORKSTATION-14', x: 10, y: 12, w: 30, h: 40 },
  { id: 'ws22', label: 'WORKSTATION-22', x: 40, y: 12, w: 30, h: 40 },
  { id: 'open', label: 'OPEN OFFICE', x: 70, y: 12, w: 30, h: 40 },
  { id: 'fs01', label: 'FILESERVER-01', x: 100, y: 12, w: 30, h: 40 },
  { id: 'fs02', label: 'FILESERVER-02', x: 130, y: 12, w: 30, h: 40 },
  { id: 'stair', label: 'STAIR', x: 160, y: 12, w: 30, h: 40 },
  { id: 'lobby', label: 'LOBBY', x: 10, y: 62, w: 45, h: 48 },
  { id: 'plant', label: 'PLANT', x: 55, y: 62, w: 40, h: 48 },
  { id: 'dc01', label: 'DC-01', x: 120, y: 62, w: 70, h: 48, tier0: true },
]

/** Door centres on the corridor walls, by room. */
export const DOORS: Record<string, { x: number; y: number; side: 'n' | 's' }> = {
  ws14: { x: 25, y: CORR0, side: 'n' },
  ws22: { x: 55, y: CORR0, side: 'n' },
  open: { x: 85, y: CORR0, side: 'n' },
  fs01: { x: 115, y: CORR0, side: 'n' },
  fs02: { x: 145, y: CORR0, side: 'n' },
  stair: { x: 175, y: CORR0, side: 'n' },
  lobby: { x: 32, y: CORR1, side: 's' },
  plant: { x: 75, y: CORR1, side: 's' },
  dc01: { x: 140, y: CORR1, side: 's' },
}

/** Where the master key cabinet sits inside DC-01. */
export const CABINET = { x: 172, y: 96, w: 10, h: 7 }

export const GRID_X = [10, 40, 70, 100, 130, 160, 190]
export const GRID_Y = [12, 52, 62, 110]
export const GRID_X_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
export const GRID_Y_LABELS = ['1', '2', '3', '4']

/* The route svc_backup takes in the demonstration: WORKSTATION-14 to two
   file servers, then the domain controller, then the cabinet. */
export const ROUTE: [number, number][] = [
  [25, 32],
  [25, 57],
  [115, 57],
  [115, 30],
  [115, 57],
  [145, 57],
  [145, 30],
  [145, 57],
  [140, 57],
  [140, 84],
  [172, 92],
]

/* The DCSync pull: from WORKSTATION-22, a non-DC, straight into the DC. */
export const PULL: [number, number][] = [
  [55, 32],
  [55, 57],
  [128, 57],
  [128, 88],
  [140, 92],
]

/** Total length of a polyline. */
export function polyLength(pts: [number, number][]): number {
  let L = 0
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
  return L
}

/** The polyline cut at fraction p of its length. */
export function polyCut(pts: [number, number][], p: number): [number, number][] {
  const total = polyLength(pts)
  let left = Math.max(0, Math.min(1, p)) * total
  const out: [number, number][] = [pts[0]]
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1]
    const [bx, by] = pts[i]
    const seg = Math.hypot(bx - ax, by - ay)
    if (left >= seg) {
      out.push(pts[i])
      left -= seg
    } else {
      const k = seg === 0 ? 0 : left / seg
      out.push([ax + (bx - ax) * k, ay + (by - ay) * k])
      break
    }
  }
  return out
}

/* -------------------------------------------------------------------------
   The drawing itself, as an ordered list of primitives. Order matters: the
   plotter draws them in sequence, structure first, annotation last.
   ------------------------------------------------------------------------- */

function wallWithDoors(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  w: number,
  gaps: number[],
  gap = 6,
): Prim[] {
  // Horizontal walls only carry doors in this plan.
  if (y1 !== y2 || !gaps.length) return [{ t: 'line', x1, y1, x2, y2, w }]
  const out: Prim[] = []
  const sorted = [...gaps].sort((a, b) => a - b)
  let cur = x1
  for (const g of sorted) {
    if (g - gap / 2 > cur) out.push({ t: 'line', x1: cur, y1, x2: g - gap / 2, y2, w })
    cur = g + gap / 2
  }
  if (cur < x2) out.push({ t: 'line', x1: cur, y1, x2, y2, w })
  return out
}

function buildDrawing(): Prim[] {
  const P: Prim[] = []

  /* Structural grid: chain lines with bubbles. */
  for (let i = 0; i < GRID_X.length; i++) {
    const x = GRID_X[i]
    P.push({ t: 'line', x1: x, y1: 4, x2: x, y2: Y1 + 6, w: 0.25, dash: [3, 1, 0.6, 1] })
  }
  for (let i = 0; i < GRID_Y.length; i++) {
    const y = GRID_Y[i]
    P.push({ t: 'line', x1: 2, y1: y, x2: X1 + 6, y2: y, w: 0.25, dash: [3, 1, 0.6, 1] })
  }

  /* Exterior walls, doubled, then poché hatch inside the double line. */
  const T = 1.6
  P.push({ t: 'line', x1: X0, y1: Y0, x2: X1, y2: Y0, w: 0.7 })
  P.push({ t: 'line', x1: X1, y1: Y0, x2: X1, y2: Y1, w: 0.7 })
  P.push({ t: 'line', x1: X1, y1: Y1, x2: X0, y2: Y1, w: 0.7 })
  P.push({ t: 'line', x1: X0, y1: Y1, x2: X0, y2: Y0, w: 0.7 })
  P.push({ t: 'line', x1: X0 + T, y1: Y0 + T, x2: X1 - T, y2: Y0 + T, w: 0.35 })
  P.push({ t: 'line', x1: X1 - T, y1: Y0 + T, x2: X1 - T, y2: Y1 - T, w: 0.35 })
  P.push({ t: 'line', x1: X1 - T, y1: Y1 - T, x2: X0 + T, y2: Y1 - T, w: 0.35 })
  P.push({ t: 'line', x1: X0 + T, y1: Y1 - T, x2: X0 + T, y2: Y0 + T, w: 0.35 })
  for (let x = X0; x < X1; x += 2.2) {
    P.push({ t: 'line', x1: x, y1: Y0 + T, x2: x + T, y2: Y0, w: 0.18 })
    P.push({ t: 'line', x1: x, y1: Y1, x2: x + T, y2: Y1 - T, w: 0.18 })
  }

  /* Corridor walls with doors cut in. */
  const north = Object.values(DOORS).filter((d) => d.side === 'n').map((d) => d.x)
  const south = Object.values(DOORS).filter((d) => d.side === 's').map((d) => d.x)
  P.push(...wallWithDoors(X0, CORR0, X1, CORR0, 0.55, north))
  P.push(...wallWithDoors(X0, CORR1, X1, CORR1, 0.55, south))

  /* Partitions. */
  for (const x of [40, 70, 100, 130, 160]) P.push({ t: 'line', x1: x, y1: Y0, x2: x, y2: CORR0, w: 0.45 })
  for (const x of [55, 95, 120]) P.push({ t: 'line', x1: x, y1: CORR1, x2: x, y2: Y1, w: 0.45 })

  /* Door leaves and swings. */
  for (const d of Object.values(DOORS)) {
    const hinge = d.x - 3
    if (d.side === 'n') {
      P.push({ t: 'line', x1: hinge, y1: d.y, x2: hinge, y2: d.y - 6, w: 0.35 })
      P.push({ t: 'arc', cx: hinge, cy: d.y, r: 6, a0: -Math.PI / 2, a1: 0, w: 0.2 })
    } else {
      P.push({ t: 'line', x1: hinge, y1: d.y, x2: hinge, y2: d.y + 6, w: 0.35 })
      P.push({ t: 'arc', cx: hinge, cy: d.y, r: 6, a0: 0, a1: Math.PI / 2, w: 0.2 })
    }
  }

  /* Stair: treads, a break line and the walking line with UP arrow. */
  for (let y = 16; y <= 48; y += 2.6) P.push({ t: 'line', x1: 163, y1: y, x2: 174, y2: y, w: 0.2 })
  for (let y = 16; y <= 48; y += 2.6) P.push({ t: 'line', x1: 176, y1: y, x2: 187, y2: y, w: 0.2 })
  P.push({ t: 'line', x1: 175, y1: 15, x2: 175, y2: 49, w: 0.35 })
  P.push({ t: 'line', x1: 168.5, y1: 47, x2: 168.5, y2: 18, w: 0.25 })
  P.push({ t: 'line', x1: 168.5, y1: 18, x2: 167, y2: 21, w: 0.25 })
  P.push({ t: 'line', x1: 168.5, y1: 18, x2: 170, y2: 21, w: 0.25 })
  P.push({ t: 'text', x: 168.5, y: 50.4, s: 'UP', size: 1.8, align: 'center', weight: 600 })

  /* Tier 0: DC-01 cross-hatched at the edges, the cabinet drawn in. */
  for (let i = 0; i < 12; i++) {
    const x = 121 + i * 5.8
    P.push({ t: 'line', x1: x, y1: Y1 - 1.8, x2: x + 3.2, y2: Y1 - 5, w: 0.15 })
  }
  P.push({ t: 'line', x1: CABINET.x - CABINET.w / 2, y1: CABINET.y - CABINET.h / 2, x2: CABINET.x + CABINET.w / 2, y2: CABINET.y - CABINET.h / 2, w: 0.4 })
  P.push({ t: 'line', x1: CABINET.x + CABINET.w / 2, y1: CABINET.y - CABINET.h / 2, x2: CABINET.x + CABINET.w / 2, y2: CABINET.y + CABINET.h / 2, w: 0.4 })
  P.push({ t: 'line', x1: CABINET.x + CABINET.w / 2, y1: CABINET.y + CABINET.h / 2, x2: CABINET.x - CABINET.w / 2, y2: CABINET.y + CABINET.h / 2, w: 0.4 })
  P.push({ t: 'line', x1: CABINET.x - CABINET.w / 2, y1: CABINET.y + CABINET.h / 2, x2: CABINET.x - CABINET.w / 2, y2: CABINET.y - CABINET.h / 2, w: 0.4 })
  P.push({ t: 'line', x1: CABINET.x - CABINET.w / 2, y1: CABINET.y - CABINET.h / 2, x2: CABINET.x + CABINET.w / 2, y2: CABINET.y + CABINET.h / 2, w: 0.15 })
  P.push({ t: 'text', x: CABINET.x, y: CABINET.y + 6.6, s: 'KRBTGT', size: 1.9, align: 'center', weight: 600 })

  /* Room names and number tags. */
  ROOMS.forEach((r, i) => {
    const cx = r.x + r.w / 2
    const cy = r.id === 'dc01' ? r.y + 14 : r.y + r.h / 2
    P.push({ t: 'text', x: cx, y: cy, s: r.label, size: r.id === 'dc01' ? 3 : 2.2, align: 'center', weight: 600, tag: 'room' })
    P.push({ t: 'circle', cx, cy: cy + 4.6, r: 2.1, w: 0.25, tag: 'room' })
    P.push({ t: 'text', x: cx, y: cy + 5.35, s: String(101 + i), size: 1.6, align: 'center', tag: 'room' })
  })
  P.push({ t: 'text', x: 100, y: 58.2, s: 'CORRIDOR', size: 2, align: 'center', weight: 600, tag: 'room' })
  P.push({ t: 'text', x: 155, y: 104, s: 'TIER 0', size: 2, align: 'center', weight: 600, tag: 'room' })

  /* Dimension string across the top. */
  P.push({ t: 'line', x1: X0, y1: 7, x2: X1, y2: 7, w: 0.2 })
  for (let i = 0; i < GRID_X.length; i++) {
    const x = GRID_X[i]
    P.push({ t: 'line', x1: x - 0.8, y1: 7.8, x2: x + 0.8, y2: 6.2, w: 0.3 })
    if (i < GRID_X.length - 1) P.push({ t: 'text', x: x + 15, y: 6.2, s: '30 000', size: 1.5, align: 'center' })
  }

  /* Grid bubbles. */
  GRID_X.forEach((x, i) => {
    P.push({ t: 'circle', cx: x, cy: 1.5, r: 2.4, w: 0.25 })
    P.push({ t: 'text', x, y: 2.3, s: GRID_X_LABELS[i], size: 2, align: 'center', weight: 600 })
  })
  GRID_Y.forEach((y, i) => {
    P.push({ t: 'circle', cx: -1, cy: y, r: 2.4, w: 0.25 })
    P.push({ t: 'text', x: -1, y: y + 0.8, s: GRID_Y_LABELS[i], size: 2, align: 'center', weight: 600 })
  })

  /* Section mark A–A, cut through the stair: the climb lives there. */
  P.push({ t: 'line', x1: 175, y1: 6, x2: 175, y2: 116, w: 0.3, dash: [4, 1.4] })
  P.push({ t: 'circle', cx: 175, cy: 118.5, r: 2.4, w: 0.3 })
  P.push({ t: 'text', x: 175, y: 119.3, s: 'A', size: 2, align: 'center', weight: 600 })

  return P
}

export const DRAWING: Prim[] = buildDrawing()

/** Approximate ink length of a primitive, used to pace the plotter. */
export function primLength(p: Prim): number {
  switch (p.t) {
    case 'line':
      return Math.hypot(p.x2 - p.x1, p.y2 - p.y1)
    case 'arc':
      return Math.abs(p.a1 - p.a0) * p.r
    case 'circle':
      return Math.PI * 2 * p.r
    case 'text':
      return p.s.length * p.size * 0.6
  }
}
