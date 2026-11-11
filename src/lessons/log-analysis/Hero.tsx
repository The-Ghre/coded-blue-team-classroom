import { useMemo } from 'react'
import type { HeroProps } from '../types'
import { formatClock, sessionRoute } from './graph'
import { RouteGraph } from './RouteGraph'

/* =========================================================================
   HERO — the head of the timetable sheet
   =========================================================================
   A ruled table head (the page's own label on the left, the route's clock
   span on the right), the session title set large in condensed caps, then
   a strip of the working graph with the unscheduled route plotted from the
   demo's own events. The workshop page leaves the route off: that run is
   the student's to reconstruct.
   ========================================================================= */

export default function Hero({ session, eyebrow, lead, actions, half, surface }: HeroProps) {
  const route = useMemo(() => sessionRoute(session), [session])
  const blank = surface === 'study' && half === 'practical'

  return (
    <header className={`la-hero${blank ? ' la-hero--blank' : ''}`}>
      <div className="la-hero__head">
        <span className="la-hero__table">{eyebrow}</span>
        {route && <span className="la-hero__sep"> · </span>}
        {route && (
          <span className="la-hero__span">
            {blank ? 'Route not yet drawn' : `${formatClock(route.start)} – ${formatClock(route.end)}`}
          </span>
        )}
      </div>
      <h1 className="la-hero__title">{session.title}</h1>
      {route && <RouteGraph route={route} showRoute={!blank} height={212} className="la-hero__graph" />}
      {(lead || actions) && (
        <div className="la-hero__foot">
          {lead &&
            (typeof lead === 'string' ? (
              <p className="la-hero__lead">{lead}</p>
            ) : (
              <div className="la-hero__lead">{lead}</div>
            ))}
          {actions && <div className="la-hero__actions">{actions}</div>}
        </div>
      )}
    </header>
  )
}
