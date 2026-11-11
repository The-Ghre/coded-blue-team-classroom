import type { HeroProps } from '../types'
import { CHECK_DOTS } from './art'
import { Pane } from './Pane'

/* =========================================================================
   HERO — the album page header
   =========================================================================
   Title, catalogue line, lead and the page's real controls on the left; a
   block of the session's stamp on the right with its variety. The eyebrow
   the app passes in is set beneath the title as the catalogue line, the
   way a catalogue names an issue after the stamp, not above it.
   ========================================================================= */

export function Hero({ session, eyebrow, lead, actions, surface, half }: HeroProps) {
  const slides = [...session.theory.blocks, ...session.practical.blocks]
  const v = slides.findIndex((b) => b.id === 'baseline')
  // The hero pane is 4 x 3; place the variety at the same reading-order
  // position when it fits, otherwise in the second row.
  const variety = v >= 0 && v < 12 ? v : 5

  return (
    <header className={`th-hero th-hero--${surface}`} data-half={half}>
      <div className="th-hero__text">
        <h1 className="th-hero__h">{session.title}</h1>
        <p className="th-hero__catalogue">
          <span className="th-hero__dots" aria-hidden="true" data-th-deco="" hidden>
            {CHECK_DOTS.map((c) => (
              <span key={c} style={{ background: c }} />
            ))}
          </span>
          <span>{eyebrow}</span>
        </p>
        {lead && <p className="lead th-hero__lead">{lead}</p>}
        {actions && <div className="th-hero__actions">{actions}</div>}
      </div>
      <div className="th-hero__sheet">
        <Pane cols={4} rows={3} variety={variety} label={session.title.toUpperCase()} className="th-hero__pane" />
      </div>
    </header>
  )
}
