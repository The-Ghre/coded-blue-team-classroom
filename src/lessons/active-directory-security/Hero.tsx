import type { HeroProps } from '../types'
import { getSlides } from '@/content'
import { PlanSvg } from './PlanSvg'

/* =========================================================================
   HERO — the sheet's title block
   =========================================================================
   Study, workshop and overview open on a drawing title: the session title
   lettered large with the double rule beneath, the page's own label set as
   the drawing's scale line, and a title block beside it holding a key plan
   — the small plan every construction sheet carries to say which part of
   the building this sheet shows. Theory shows the route through the
   building; the workshop highlights the two workstations the pack says
   both matter; the overview shows the whole sheet set.
   ========================================================================= */

export default function Hero({ surface, session, half, eyebrow, lead, actions }: HeroProps) {
  const slides = getSlides(session)
  const sheet =
    surface === 'overview' ? 'Index' : half === 'practical' ? 'Workshop' : 'Theory'
  const keyPlan =
    surface === 'overview'
      ? { route: true, pull: true, highlight: [] as string[], caption: 'Whole building' }
      : half === 'practical'
        ? { route: false, pull: false, highlight: ['ws14', 'ws22'], caption: 'Both workstations' }
        : { route: true, pull: true, highlight: [] as string[], caption: 'svc_backup route' }

  return (
    <header className={`adw-hero adw-hero--${surface}`} data-half={half}>
      <div className="adw-hero__title">
        <span className="adw-bubble adw-bubble--lg" aria-hidden="true">
          <span>{session.number}</span>
          <span>{half === 'practical' ? 'P' : 'T'}</span>
        </span>
        <div className="adw-hero__lettering">
          <h1 className="adw-hero__h">{session.title}</h1>
          <p className="adw-hero__scale">{eyebrow}</p>
        </div>
      </div>

      {lead ? <div className="lead adw-hero__lead">{lead}</div> : null}
      {actions ? <div className="adw-hero__actions">{actions}</div> : null}

      <aside className="adw-hero__block" aria-label="Sheet details">
        <figure className="adw-hero__keyplan">
          <PlanSvg
            className="adw-keyplan"
            route={keyPlan.route}
            pull={keyPlan.pull}
            highlight={keyPlan.highlight}
          />
          <figcaption>
            <span>Key plan</span>
            <span>{keyPlan.caption}</span>
          </figcaption>
        </figure>
        <dl className="adw-hero__fields">
          <div>
            <dt>Session</dt>
            <dd>
              {session.number} of 10
            </dd>
          </div>
          <div>
            <dt>Track</dt>
            <dd>{session.track === 'core' ? 'Core' : 'Extension'}</dd>
          </div>
          <div>
            <dt>Sheet</dt>
            <dd>{sheet}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>
              {session.theory.minutes} + {session.practical.minutes} min
            </dd>
          </div>
          <div className="adw-hero__fields-wide">
            <dt>Slides</dt>
            <dd>
              {session.theory.blocks.length} theory · {session.practical.blocks.length} workshop ·{' '}
              {slides.length} in all
            </dd>
          </div>
        </dl>
      </aside>
    </header>
  )
}
