/* =========================================================================
   SECTOR LIGHT — the world's emblem, drawn as a chart extract
   =========================================================================
   A headland, one light, three sectors: red and green warn, the narrow
   white sector marks the channel. It is the lesson in one picture: a
   narrow beam is precise and easy to miss; a wide one is seen by everyone
   and means less. Arcs draw in, the flare shows its characteristic
   (two flashes every ten seconds, CSS-timed), and under reduced motion it
   is a finished still.
   ========================================================================= */

const CX = 392
const CY = 318
const R = 218

function polar(deg: number, r: number) {
  const a = (deg * Math.PI) / 180
  return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r }
}

function arc(d0: number, d1: number, r: number) {
  const a = polar(d0, r)
  const b = polar(d1, r)
  const large = Math.abs(d1 - d0) > 180 ? 1 : 0
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
}

const SOUNDINGS: [number, number, string][] = [
  [70, 70, '42'], [150, 120, '38'], [60, 190, '31'], [250, 60, '47'], [200, 210, '24'],
  [120, 280, '17'], [300, 150, '29'], [60, 300, '12₄'], [340, 70, '51'], [520, 80, '44'],
  [560, 170, '33'], [250, 250, '9₂'], [470, 200, '21'], [110, 250, '7'],
]

export function SectorLight({ className, compact }: { className?: string; compact?: boolean }) {
  // White sector: the channel. Narrow on purpose.
  const red: [number, number] = [-150, -103]
  const white: [number, number] = [-103, -91]
  const green: [number, number] = [-91, -40]
  const limits = [red[0], white[0], white[1], green[1]]

  return (
    <svg
      className={`de-sector ${compact ? 'de-sector--compact' : ''} ${className ?? ''}`}
      viewBox="0 0 600 420"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* An island headland: shoal ring, depth contours, land. Closed
          shapes, so the extract sits on any chart without a cut edge. */}
      <path
        className="de-sector__contour de-sector__contour--deep"
        d="M 120 372 C 150 300, 300 262, 420 268 C 540 274, 600 330, 580 384 C 560 420, 160 424, 120 372 Z"
      />
      <path
        className="de-sector__shoal"
        d="M 170 370 C 200 318, 310 292, 410 294 C 510 298, 560 336, 548 374 C 534 404, 210 408, 170 370 Z"
      />
      <path
        className="de-sector__contour"
        d="M 170 370 C 200 318, 310 292, 410 294 C 510 298, 560 336, 548 374 C 534 404, 210 408, 170 370 Z"
      />
      <path
        className="de-sector__land"
        d="M 226 366 C 250 344, 320 332, 370 326 C 380 322, 386 318, 392 318 C 400 318, 410 323, 424 328 C 470 336, 510 346, 512 366 C 512 384, 250 390, 226 366 Z"
      />
      <path className="de-sector__cliff" d="M 350 330 L 372 324 M 412 324 L 432 331" />

      {/* Soundings in the hydrographic italic */}
      <g className="de-sector__soundings">
        {SOUNDINGS.map(([x, y, d]) => (
          <text key={`${x}-${y}`} x={x} y={y}>
            {d}
          </text>
        ))}
      </g>

      {/* Sector limits */}
      <g className="de-sector__limits">
        {limits.map((d) => {
          const p = polar(d, R + 34)
          return <line key={d} x1={CX} y1={CY} x2={p.x} y2={p.y} />
        })}
      </g>

      {/* Sectors */}
      <path className="de-sector__arc de-sector__arc--r" d={arc(red[0], red[1], R)} pathLength={1} />
      <path className="de-sector__arc de-sector__arc--w" d={arc(white[0], white[1], R)} pathLength={1} />
      <path className="de-sector__arc de-sector__arc--g" d={arc(green[0], green[1], R)} pathLength={1} />

      {/* Sector letters */}
      <g className="de-sector__letters">
        {(
          [
            [(red[0] + red[1]) / 2, 'R'],
            [(white[0] + white[1]) / 2, 'W'],
            [(green[0] + green[1]) / 2, 'G'],
          ] as [number, string][]
        ).map(([d, l]) => {
          const p = polar(d, R + 20)
          return (
            <text key={l} x={p.x} y={p.y}>
              {l}
            </text>
          )
        })}
      </g>

      {/* Leading line up the white sector */}
      <path className="de-sector__track" d={`M ${polar(-97, 70).x} ${polar(-97, 70).y} L ${polar(-97, R - 8).x} ${polar(-97, R - 8).y}`} />

      {/* The light: structure, star, flare */}
      <path className="de-sector__flare" d={`M ${CX + 3} ${CY - 5} C ${CX + 14} ${CY - 22}, ${CX + 30} ${CY - 40}, ${CX + 48} ${CY - 60} C ${CX + 34} ${CY - 34}, ${CX + 22} ${CY - 18}, ${CX + 7} ${CY - 1} Z`} />
      <circle className="de-sector__star" cx={CX} cy={CY} r="5" />

      {!compact && (
        <text className="de-sector__char" x={CX - 16} y={CY - 22} textAnchor="end">
          Fl(2) WRG 10s 18m 12M
        </text>
      )}
    </svg>
  )
}
