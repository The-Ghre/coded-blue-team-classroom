import type { HeroProps } from '../types'
import { RouteStrips, Stamp } from './parts'

/* =========================================================================
   HERO — the session's own triage tag, lying under the desk lamp
   =========================================================================
   Study, workshop and overview open on the desk at night: one tag, its
   string running off the edge, its fields filled in from the session
   itself. The routing strips are the three decisions this session teaches.
   ========================================================================= */

export function Hero({ session, eyebrow, lead, actions, surface }: HeroProps) {
  const num = String(session.number).padStart(2, '0')
  const minutes = `${session.theory.minutes} + ${session.practical.minutes} min`

  return (
    <header className="soc-hero" data-surface={surface}>
      <svg
        className="soc-hero__string"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M-10 18 Q 210 168 400 112" />
      </svg>

      <div className="soc-hero__lay">
      <div className="soc-hero__tag">
        <span className="soc-hero__eyelet" aria-hidden="true" />

        <div className="soc-hero__body">
          <h1 className="soc-hero__title">{session.title}</h1>
          {lead ? (
            typeof lead === 'string' ? (
              <p className="soc-hero__lead">{lead}</p>
            ) : (
              <div className="soc-hero__lead">{lead}</div>
            )
          ) : null}
          {actions ? <div className="soc-hero__actions">{actions}</div> : null}
        </div>

        <dl className="soc-fields soc-hero__fields">
          <div className="soc-field">
            <dt>Tag</dt>
            <dd className="soc-field__num">{num}</dd>
          </div>
          <div className="soc-field soc-field--wide">
            <dt>Filed under</dt>
            <dd>{eyebrow}</dd>
          </div>
          <div className="soc-field">
            <dt>Time</dt>
            <dd>{minutes}</dd>
          </div>
          <div className="soc-field soc-field--wide">
            <dt>Themes</dt>
            <dd>{session.themes.join(' · ')}</dd>
          </div>
        </dl>

        <Stamp className="soc-hero__stamp">S·{num}</Stamp>
        <RouteStrips className="soc-hero__strips" />
      </div>
      </div>
    </header>
  )
}
