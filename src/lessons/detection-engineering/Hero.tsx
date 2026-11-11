import type { HeroProps } from '../types'
import { SectorLight } from './SectorLight'
import { usePrinting } from './hooks'

/* =========================================================================
   HERO — the chart's title cartouche
   =========================================================================
   Charts carry their title in a framed block: the chart number in a
   corner, the title in roman capitals, a subtitle in italic, the scale
   bar beneath. Here the scale bar is the session's own timetable, read
   from the content (theory minutes + practical minutes).
   ========================================================================= */

export function Hero({ session, surface, eyebrow, lead, actions, half }: HeroProps) {
  const theory = session.theory.minutes
  const practical = session.practical.minutes
  const total = theory + practical
  // The chart art is styled for screen only; paper gets the words.
  const printing = usePrinting()

  return (
    <header className={`de-hero de-hero--${surface}`} data-half={half}>
      <div className="de-hero__cartouche">
        <div className="de-hero__title-row">
          <h1 className="de-hero__title">{session.title}</h1>
          <p className="de-hero__number">
            <span className="sr-only">{eyebrow}</span>
            <span className="de-hero__number-big" aria-hidden="true">
              S{String(session.number).padStart(2, '0')}
            </span>
            <span className="de-hero__number-sub" aria-hidden="true">
              {eyebrow.replace(/^Session \d+ · /, '')}
            </span>
          </p>
        </div>

        <p className="de-hero__subtitle">{session.themes.join(' · ')}</p>

        {lead && <div className="de-hero__lead lead">{lead}</div>}

        <figure className="de-hero__scale" aria-label={`Session timetable: ${theory} minutes theory, ${practical} minutes practical`}>
          <div className="de-hero__scale-bar" aria-hidden="true">
            <span style={{ flexGrow: theory }} data-part="theory" />
            <span style={{ flexGrow: practical }} data-part="practical" />
          </div>
          <figcaption className="de-hero__scale-legend" aria-hidden="true">
            <span>0</span>
            <span>Theory {theory} min</span>
            <span>Practical {practical} min</span>
            <span>{total} min</span>
          </figcaption>
        </figure>

        {actions && <div className="de-hero__actions">{actions}</div>}
      </div>

      {!printing && (
        <div className="de-hero__art" aria-hidden="true">
          <SectorLight compact={surface === 'study'} />
        </div>
      )}
    </header>
  )
}
