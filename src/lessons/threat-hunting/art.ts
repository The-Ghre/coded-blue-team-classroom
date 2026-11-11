/* =========================================================================
   STAMP GEOMETRY — shared by the SVG pane and the canvas backdrop
   =========================================================================
   One stamp design, the numeral-09 definitive, described once as numbers
   and path data. The SVG renders it as markup; the backdrop feeds the same
   path strings to Path2D, so the two can never drift apart.

   Unit space: one stamp is 100 x 120, perforation line on its edge.
   ========================================================================= */

export const STAMP_W = 100
export const STAMP_H = 120

/** Perforation gauge: hole pitch and radius in stamp units. */
export const PERF_PITCH = 7.6
export const PERF_R = 2.5

/** Hole centres along the four edges of one stamp. */
export function perfHoles(): [number, number][] {
  const holes: [number, number][] = []
  const across = Math.round(STAMP_W / PERF_PITCH)
  const down = Math.round(STAMP_H / PERF_PITCH)
  for (let i = 0; i <= across; i++) {
    const x = (i / across) * STAMP_W
    holes.push([x, 0], [x, STAMP_H])
  }
  for (let j = 1; j < down; j++) {
    const y = (j / down) * STAMP_H
    holes.push([0, y], [STAMP_W, y])
  }
  return holes
}

/** The vignette oval every stamp prints its rosette and numeral inside. */
export const OVAL = { cx: 50, cy: 62, rx: 29, ry: 33 }

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

/**
 * A hypotrochoid — the curve a geometric lathe engraves into security
 * printing. Scaled into an ellipse so it sits inside the vignette.
 */
function trochoid(R: number, r: number, d: number, rx: number, ry: number, rot = 0): string {
  const turns = r / gcd(R, r)
  const steps = Math.round(220 * turns)
  const max = R - r + d
  const k = (R - r) / r
  let p = ''
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2 * turns
    const x0 = (R - r) * Math.cos(t) + d * Math.cos(k * t)
    const y0 = (R - r) * Math.sin(t) - d * Math.sin(k * t)
    const x = x0 * Math.cos(rot) - y0 * Math.sin(rot)
    const y = x0 * Math.sin(rot) + y0 * Math.cos(rot)
    const px = OVAL.cx + (x / max) * rx
    const py = OVAL.cy + (y / max) * ry
    p += `${i === 0 ? 'M' : 'L'}${px.toFixed(2)} ${py.toFixed(2)}`
  }
  return p + 'Z'
}

/** Three interleaved engine-turned rosettes, outer to inner. */
export const ROSETTES: string[] = [
  trochoid(11, 4, 3.2, OVAL.rx - 1.5, OVAL.ry - 1.5),
  trochoid(9, 5, 3.6, OVAL.rx - 6, OVAL.ry - 6, 0.35),
  trochoid(7, 3, 1.6, OVAL.rx - 13, OVAL.ry - 13, 0.2),
]

/** Pencil tick, drawn in a stamp's top-right corner once a position is examined. */
export const TICK_PATH = 'M80 18 L84.5 23 L93 10'

/** Sheet positions are named the way a plating specialist names them. */
export function positionLabel(index: number, cols: number): string {
  return `R${Math.floor(index / cols) + 1}/${(index % cols) + 1}`
}

/** Named stamp inks. Kept in sync with the tokens in theme.css. */
export const INK = {
  ultramarine: '#2b3a9e',
  carmine: '#a3182f',
  paper: '#f3ecdc',
  stockbook: '#0f0e0c',
  phosphor: '#d8f07a',
  graphite: '#8f8676',
}

/** The colour-check dots printed in the sheet margin — one per evidence ink. */
export const CHECK_DOTS = ['#9fb0ff', '#e0b155', '#62cf94', '#c9a3e6', '#56c8de', '#ff6b72']
