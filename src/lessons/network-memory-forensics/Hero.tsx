import type { HeroProps } from '../types'
import { Cylinder, Decor, beaconPins } from './parts'

/* =========================================================================
   HERO — the cylinder plate
   =========================================================================
   Study, workshop and overview open on the cylinder, unrolled: the
   session's three themes engraved on their rows, one tooth set on a fixed
   beat, a person's pins scattered around it. The page's place in the
   course is engraved on the plate above, and the title sits below.
   ========================================================================= */

export function Hero({ session, half, surface, eyebrow, lead, actions }: HeroProps) {
  const rows = 7
  const cols = 44
  const practical = half === 'practical'
  /* Theory: the beat on the Beaconing row, scattered plucks on DNS, a
     cluster set where no score has notes on Injection. Workshop: three
     lanes that strike together at one moment. */
  const beaconRow = practical ? 3 : 1
  const pins = practical
    ? [
        ...beaconPins(rows, cols, beaconRow, 6, 41),
        { row: 0, col: 29, kind: 'inject' as const },
        { row: 3, col: 29, kind: 'inject' as const },
        { row: 6, col: 29, kind: 'inject' as const },
      ]
    : [
        ...beaconPins(rows, cols, beaconRow, 4, 23).filter((p) => p.row !== 5),
        ...[30, 31, 32].map((col) => ({ row: 5, col, kind: 'inject' as const })),
      ]
  const rowLabels = practical
    ? [
        { row: 0, label: 'NETWORK' },
        { row: 3, label: 'MEMORY' },
        { row: 6, label: 'ENDPOINT' },
      ]
    : session.themes.slice(0, 3).map((t, i) => ({ row: [1, 3, 5][i], label: t.toUpperCase() }))
  const bracket = practical ? { row: 3, col: 29 } : { row: beaconRow, col: 23 }

  return (
    <header className="nmf-hero" data-surface={surface} data-half={half}>
      <div className="nmf-hero__plate">
        <p className="nmf-hero__engraving">{eyebrow}</p>
        <Decor className="nmf-hero__band">
          <Cylinder
            rows={rows}
            cols={cols}
            pins={pins}
            rowLabels={rowLabels}
            bracket={bracket}
          />
        </Decor>
      </div>
      <div className="nmf-hero__body">
        <h1 className="nmf-hero__title nmf-rise">{session.title}</h1>
        {surface !== 'overview' && <p className="nmf-hero__caption">{session.summary}</p>}
        {lead &&
          (typeof lead === 'string' ? (
            <p className="nmf-hero__lead lead">{lead}</p>
          ) : (
            <div className="nmf-hero__lead lead">{lead}</div>
          ))}
        {actions && <div className="nmf-hero__actions">{actions}</div>}
      </div>
    </header>
  )
}
