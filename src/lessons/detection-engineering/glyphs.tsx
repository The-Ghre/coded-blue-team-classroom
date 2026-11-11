/* =========================================================================
   GLYPHS — authored chart symbols
   =========================================================================
   One stroke weight (1.5 at 24px), drawn in currentColor unless the chart
   convention fixes the colour (the light flare is always magenta). Every
   glyph is decorative and paired with a word wherever it appears.
   ========================================================================= */

import type { CSSProperties } from 'react'

type G = { size?: number; className?: string; style?: CSSProperties }

const base = (size = 24) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  'aria-hidden': true as const,
  focusable: 'false' as const,
})

/** A lit light: its sector (dashed limits, starboard-green arc), the light star and the magenta flare. */
export function LitGlyph({ size, className, style }: G) {
  return (
    <svg {...base(size)} className={className} style={style}>
      <path d="M8 20 L3.5 6.5 M8 20 L14.5 6" stroke="currentColor" strokeWidth="1" strokeDasharray="1.6 1.6" />
      <path d="M3.5 6.5 A 14.5 14.5 0 0 1 14.5 6" stroke="var(--de-stbd)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M9.5 19 C 12.5 17, 15.5 15, 21 12 C 17 16, 13.5 18.5, 10 20.5 Z" fill="var(--de-magenta)" />
      <circle cx="8" cy="20" r="2.3" fill="currentColor" />
    </svg>
  )
}

/** Synthetic-data mark: a hatched sounding box, the chart's sign for "not surveyed". */
export function SyntheticGlyph({ size, className, style }: G) {
  return (
    <svg {...base(size)} className={className} style={style}>
      <rect x="3.5" y="3.5" width="17" height="17" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
      <path d="M7 17 L17 7 M7 12 L12 7 M12 17 L17 12" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

/** An unlit beacon: tower outline, no flare. */
export function UnlitGlyph({ size, className, style }: G) {
  return (
    <svg {...base(size)} className={className} style={style}>
      <path d="M8 20 L11 6 L13 6 L16 20 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5 20 H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9.5 13 H14.5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
    </svg>
  )
}

/** Adversary vessel. Filled when a rule lit it, hollow and dashed when it passed dark. */
export function VesselGlyph({ size, className, style, caught }: G & { caught: boolean }) {
  return (
    <svg {...base(size)} className={className} style={style}>
      <path
        d="M12 4 L20 19 L4 19 Z"
        stroke="var(--ev-attack)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeDasharray={caught ? undefined : '2.5 2'}
        fill={caught ? 'var(--ev-attack)' : 'none'}
      />
    </svg>
  )
}

/** Noise that alerts: a small square mark. */
export function NoiseGlyph({ size, className, style }: G) {
  return (
    <svg {...base(size)} className={className} style={style}>
      <rect x="8" y="8" width="8" height="8" fill="currentColor" />
    </svg>
  )
}

/** Obscured sector: a hatched wedge. */
export function ObscuredGlyph({ size, className, style }: G) {
  return (
    <svg {...base(size)} className={className} style={style}>
      <defs>
        <pattern id="de-hatch-g" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0 V3" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <path d="M12 21 L5 4 L19 4 Z" fill="url(#de-hatch-g)" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

/* ---------------------------------------------------------------------------
   Pattern glyphs — one per term in the rule anatomy and the five
   correlation patterns. Each draws the pattern itself rather than an icon
   for it, so the shape teaches.
   --------------------------------------------------------------------------- */

function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg width="64" height="40" viewBox="0 0 64 40" fill="none" aria-hidden="true" focusable="false" className={className}>
      {children}
    </svg>
  )
}

const ink = 'currentColor'
const mag = 'var(--de-magenta)'

export const PATTERN_GLYPHS: Record<string, () => JSX.Element> = {
  // Anatomy
  'data source': () => (
    <Frame>
      {[6, 14, 22, 30].map((y, i) => (
        <path key={y} d={`M4 ${y} H${44 - i * 6}`} stroke={ink} strokeWidth="1.5" strokeLinecap="round" />
      ))}
      <path d="M50 6 V34" stroke={mag} strokeWidth="2" />
      <path d="M50 20 L58 20" stroke={mag} strokeWidth="2" />
    </Frame>
  ),
  conditions: () => (
    <Frame>
      {[8, 16, 24, 32, 40, 48, 56].map((x, i) => (
        <rect key={x} x={x - 2} y={18} width="4" height="4" fill={i === 2 || i === 5 ? mag : ink} opacity={i === 2 || i === 5 ? 1 : 0.35} />
      ))}
      <path d="M22 12 V28 M46 12 V28" stroke={mag} strokeWidth="1.2" strokeDasharray="2 2" />
    </Frame>
  ),
  threshold: () => (
    <Frame>
      <path d="M4 14 H60" stroke={mag} strokeWidth="1.5" strokeDasharray="4 3" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
        const h = [8, 10, 9, 12, 14, 18, 24, 26, 25, 27][i]
        return <path key={i} d={`M${7 + i * 5.4} 36 V${36 - h}`} stroke={h > 22 ? mag : ink} strokeWidth="2.4" />
      })}
    </Frame>
  ),
  // Correlation
  sequence: () => (
    <Frame>
      <rect x="6" y="15" width="10" height="10" stroke={ink} strokeWidth="1.5" />
      <path d="M20 20 H40" stroke={ink} strokeWidth="1.5" strokeDasharray="3 2" />
      <path d="M38 16 L44 20 L38 24" stroke={ink} strokeWidth="1.5" />
      <circle cx="53" cy="20" r="6" fill={mag} />
    </Frame>
  ),
  aggregation: () => (
    <Frame>
      <circle cx="8" cy="20" r="4" fill={mag} />
      {[6, 13, 20, 27, 34].map((y) => (
        <g key={y}>
          <path d={`M12 20 L48 ${y}`} stroke={ink} strokeWidth="1" opacity="0.6" />
          <rect x="50" y={y - 2.5} width="5" height="5" fill={ink} />
        </g>
      ))}
    </Frame>
  ),
  anomaly: () => (
    <Frame>
      {[
        [10, 26], [16, 24], [21, 27], [27, 25], [33, 26], [39, 24], [45, 26], [51, 25],
      ].map(([x, y]) => (
        <circle key={`${x}`} cx={x} cy={y} r="2" fill={ink} opacity="0.45" />
      ))}
      <circle cx="40" cy="9" r="3.2" fill={mag} />
      <circle cx="40" cy="9" r="6.5" stroke={mag} strokeWidth="1" strokeDasharray="2 2" />
    </Frame>
  ),
  'multi-source': () => (
    <Frame>
      <rect x="3" y="16" width="8" height="8" stroke={ink} strokeWidth="1.5" />
      <circle cx="23" cy="20" r="4.5" stroke={ink} strokeWidth="1.5" />
      <path d="M37 15 L42 24 L32 24 Z" stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M53 15 L58 20 L53 25 L48 20 Z" fill={mag} />
      <path d="M11 20 H18 M28 20 H33 M42 20 H48" stroke={mag} strokeWidth="1.5" />
    </Frame>
  ),
}

/** Threshold appears in both lists; the key is the term, lower-cased. */
export function patternGlyphFor(term: string) {
  return PATTERN_GLYPHS[term.trim().toLowerCase()]
}
