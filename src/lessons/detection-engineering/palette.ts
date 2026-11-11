/**
 * Canvas cannot read CSS custom properties per draw call cheaply, so the
 * chart colours are read once from the lesson root (theme.css owns them)
 * with these as the fallback when a token is missing.
 */
export interface ChartInk {
  paper: string
  land: string
  landInk: string
  shoal: string
  shoalDeep: string
  ink: string
  inkSoft: string
  contour: string
  magenta: string
  port: string
  stbd: string
  attack: string
}

const FALLBACK: ChartInk = {
  paper: '#f2f5f4',
  land: '#ecd690',
  landInk: '#6d5b25',
  shoal: '#dcebf1',
  shoalDeep: '#c3dce7',
  ink: '#0e171b',
  inkSoft: 'rgba(14, 23, 27, 0.5)',
  contour: '#6f97ab',
  magenta: '#b8147a',
  port: '#c8202d',
  stbd: '#1f7a3d',
  attack: '#b21f2a',
}

export function readInk(): ChartInk {
  if (typeof document === 'undefined') return FALLBACK
  const cs = getComputedStyle(document.documentElement)
  const v = (name: string, fb: string) => cs.getPropertyValue(name).trim() || fb
  return {
    paper: v('--de-paper', FALLBACK.paper),
    land: v('--de-land', FALLBACK.land),
    landInk: v('--de-land-ink', FALLBACK.landInk),
    shoal: v('--de-shoal', FALLBACK.shoal),
    shoalDeep: v('--de-shoal-deep', FALLBACK.shoalDeep),
    ink: v('--de-ink', FALLBACK.ink),
    inkSoft: v('--de-ink-soft', FALLBACK.inkSoft),
    contour: v('--de-contour', FALLBACK.contour),
    magenta: v('--de-magenta', FALLBACK.magenta),
    port: v('--de-port', FALLBACK.port),
    stbd: v('--de-stbd', FALLBACK.stbd),
    attack: v('--ev-attack', FALLBACK.attack),
  }
}
