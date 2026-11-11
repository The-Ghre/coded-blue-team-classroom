import type { HeroProps } from '../types'
import { LureRig } from './Lure'

/* =========================================================================
   HERO — study, workshop and overview
   =========================================================================
   The session's name, set large, with the lure hung beside it on its line.
   The eyebrow is set as a plate caption under the title rather than as a
   kicker above it. Lead and actions are the page's own, rendered in full.
   ========================================================================= */

export function Hero({ session, eyebrow, lead, actions, surface, half }: HeroProps) {
  return (
    <header className="pi-hero" data-surface={surface} data-half={half}>
      <div className="pi-hero__text">
        <h1 className="pi-hero__h">{session.title}</h1>
        <p className="pi-hero__plate">{eyebrow}</p>
        {lead && (typeof lead === 'string' ? <p className="lead pi-hero__lead">{lead}</p> : lead)}
        {actions && <div className="pi-hero__actions">{actions}</div>}
      </div>
      <div className="pi-hero__rig">
        <LureRig curve />
      </div>
    </header>
  )
}
