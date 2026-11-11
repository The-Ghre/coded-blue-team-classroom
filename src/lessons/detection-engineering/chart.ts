/* =========================================================================
   CHART GEOMETRY
   =========================================================================
   The procedural coast this lesson sails along. Everything is derived from
   a seeded 1D noise, so the same coast appears on every visit and every
   surface, and it is cheap: a coastline, its depth contours and a handful
   of islands are polylines computed once per resize.
   ========================================================================= */

/** Small deterministic PRNG (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Smooth 1D value noise, summed over octaves. Returns roughly -1..1. */
export function noise1(seed: number) {
  const r = rng(seed)
  const table = Array.from({ length: 512 }, () => r() * 2 - 1)
  const at = (i: number) => table[((i % 512) + 512) % 512]
  const smooth = (x: number) => {
    const i = Math.floor(x)
    const f = x - i
    const u = f * f * (3 - 2 * f)
    return at(i) * (1 - u) + at(i + 1) * u
  }
  return (x: number) => smooth(x) * 0.6 + smooth(x * 2.13 + 17) * 0.28 + smooth(x * 4.7 + 41) * 0.12
}

export interface Pt {
  x: number
  y: number
}

export interface Light {
  x: number
  y: number
  /** Direction the sector faces, radians (canvas convention, -PI/2 is up). */
  facing: number
  /** Flash group count, e.g. 2 for Fl(2). 0 = unlit beacon. */
  group: number
  period: number
  phase: number
}

export interface ChartGeometry {
  width: number
  height: number
  /** Bottom coastline, sampled left to right. */
  coast: Pt[]
  /** Upper coastline segments (land entering from the top edge). */
  upper: Pt[]
  /** Depth contours offset seaward from the bottom coast, shallow first. */
  contours: Pt[][]
  upperContours: Pt[][]
  islands: Pt[][]
  soundings: { x: number; y: number; d: string }[]
  lights: Light[]
}

/**
 * Builds a coast `width` wide (in CSS px) for a viewport `height` tall.
 * `stops` are x positions where lights should stand (one per slide on the
 * presentation, a few evenly spread elsewhere).
 */
export function buildChart(width: number, height: number, stops: number[], seed = 404): ChartGeometry {
  const n1 = noise1(seed)
  const n2 = noise1(seed + 9)
  const n3 = noise1(seed + 23)
  const step = 8
  const scale = 1 / 340

  const coastY = (x: number) => height * (0.83 + 0.07 * n1(x * scale)) - height * 0.05 * Math.max(0, n3(x * scale * 0.6))
  const upperY = (x: number) => height * (-0.06 + 0.2 * Math.max(0, n2(x * scale * 0.8) + 0.12))

  const coast: Pt[] = []
  const upper: Pt[] = []
  for (let x = -step; x <= width + step; x += step) {
    coast.push({ x, y: coastY(x) })
    upper.push({ x, y: upperY(x) })
  }

  const depths = [0.035, 0.075, 0.13, 0.21]
  const contours = depths.map((d, k) => {
    const pts: Pt[] = []
    for (let x = -step; x <= width + step; x += step) {
      // Deeper contours smooth out: average the coast over a wider window.
      const w = 2 + k * 3
      let y = 0
      for (let j = -w; j <= w; j++) y += coastY(x + j * step * 2)
      y /= 2 * w + 1
      pts.push({ x, y: y - height * d * (1 + 0.35 * n2(x * scale * 1.7 + k)) })
    }
    return pts
  })

  const upperContours = depths.slice(0, 3).map((d, k) => {
    const pts: Pt[] = []
    for (let x = -step; x <= width + step; x += step) {
      const w = 2 + k * 3
      let y = 0
      for (let j = -w; j <= w; j++) y += upperY(x + j * step * 2)
      y /= 2 * w + 1
      pts.push({ x, y: y + height * d * (1 + 0.3 * n1(x * scale * 1.9 + k)) })
    }
    return pts
  })

  const r = rng(seed + 3)

  // A few islands in the channel, kept clear of the light stops.
  const islands: Pt[][] = []
  const islandCount = Math.max(2, Math.round(width / 900))
  for (let i = 0; i < islandCount; i++) {
    const cx = (i + 0.5) * (width / islandCount) + (r() - 0.5) * 200
    const cy = height * (0.42 + r() * 0.22)
    const rad = 12 + r() * 22
    const pts: Pt[] = []
    const nn = noise1(seed + 100 + i)
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 18) {
      const rr = rad * (1 + 0.35 * nn(a * 1.3))
      pts.push({ x: cx + Math.cos(a) * rr * 1.6, y: cy + Math.sin(a) * rr })
    }
    islands.push(pts)
  }

  // Soundings: depth increases away from both coasts.
  const soundings: ChartGeometry['soundings'] = []
  const count = Math.round((width * height) / 9000)
  for (let i = 0; i < count; i++) {
    const x = r() * width
    const y = r() * height
    const cb = coastY(x)
    const cu = upperY(x)
    if (y > cb - 10 || y < cu + 10) continue
    const dist = Math.min(cb - y, y - cu)
    const depth = Math.max(1, dist / (height * 0.012) + r() * 3)
    const whole = Math.floor(depth)
    // Charts write shallow soundings with a subscript decimal; we keep it simple.
    soundings.push({ x, y, d: whole < 20 && r() > 0.5 ? `${whole}${Math.floor(r() * 9) + 1}` : String(whole) })
  }

  const lights: Light[] = stops.map((sx, i) => {
    // Find a local headland near the stop: the smallest y in a window.
    let bx = sx
    let by = coastY(sx)
    for (let dx = -60; dx <= 60; dx += 6) {
      const y = coastY(sx + dx)
      if (y < by) {
        by = y
        bx = sx + dx
      }
    }
    const groups = [2, 1, 3, 0, 2, 4, 1, 3]
    return {
      x: bx,
      y: by - 2,
      facing: -Math.PI / 2 + (r() - 0.5) * 0.5,
      group: groups[i % groups.length],
      period: 8 + (i % 3) * 2,
      phase: r() * 10,
    }
  })

  return { width, height, coast, upper, contours, upperContours, islands, soundings, lights }
}

/**
 * Light characteristic: is the light showing at time t? Group-flashing,
 * each flash 0.5s with 0.9s between flashes, then an eclipse for the rest of
 * the period. Never more than one flash per second, well under the
 * three-per-second flash limit.
 */
export function flashLevel(light: Light, t: number): number {
  if (light.group === 0) return 0
  const local = (t + light.phase) % light.period
  for (let k = 0; k < light.group; k++) {
    const start = k * 1.4
    if (local >= start && local < start + 0.5) {
      // Ease in and out within the flash so it reads as a light, not a strobe.
      const f = (local - start) / 0.5
      return Math.sin(f * Math.PI)
    }
  }
  return 0
}

/** Charted characteristic string for a light, e.g. "Fl(2) 10s". */
export function characteristic(light: Light) {
  if (light.group === 0) return 'unlit'
  return light.group === 1 ? `Fl ${light.period}s` : `Fl(${light.group}) ${light.period}s`
}
