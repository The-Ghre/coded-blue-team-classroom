import type { HeroProps } from '../types'
import { Decor, FilmStrip, type Frame } from './parts'

/* =========================================================================
   HERO — the contact sheet header
   =========================================================================
   Study, workshop and overview open on a contact sheet: one strip of the
   session's roll printed across the top, its edge print carrying the page's
   place in the course, and the session title developing beneath it.
   ========================================================================= */

export function Hero({ session, half, surface, eyebrow, lead, actions }: HeroProps) {
  const themes = session.themes
  const frames: Frame[] =
    half === 'practical'
      ? [
          { image: 'label', label: 'Network', edge: 'LANE 1' },
          { image: 'burst', seed: 3, edge: '00:00' },
          { image: 'label', label: 'Memory', edge: 'LANE 2' },
          { image: 'payload', edge: '03:00' },
          { image: 'label', label: 'Endpoint', edge: 'LANE 3' },
          { image: 'burst', seed: 11, edge: '06:00' },
          { image: 'fog' },
          { image: 'payload', edge: '09:00' },
        ]
      : [
          { image: 'label', label: themes[0] ?? 'Beaconing', edge: '00:00' },
          { image: 'payload', edge: '00:04' },
          { image: 'payload', edge: '00:08' },
          { image: 'label', label: themes[1] ?? 'DNS', edge: '00:12' },
          { image: 'payload', edge: '00:16' },
          { image: 'burst', seed: 5, edge: 'USER' },
          { image: 'label', label: themes[2] ?? 'Injection', edge: '00:24' },
          { image: 'payload', edge: '00:28' },
          { image: 'fog' },
        ]

  return (
    <header className="nmf-hero" data-surface={surface} data-half={half}>
      <div className="nmf-hero__sheet">
        <p className="nmf-hero__edge">
          <span>{eyebrow}</span>
          <span className="nmf-hero__edge-mark nmf-decor" aria-hidden="true" hidden>
            ▸
          </span>
        </p>
        <Decor className="nmf-hero__strip">
          <FilmStrip
            frames={frames}
            topEdge="SAFETY FILM"
            startNumber={session.number}
            ring={half === 'practical' ? 3 : 1}
          />
        </Decor>
      </div>
      <div className="nmf-hero__body">
        <h1 className="nmf-hero__title nmf-develop">{session.title}</h1>
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
