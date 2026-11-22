import type { HeroProps } from '../types'
import { Trace } from './Trace'
export function Hero({ session, surface, eyebrow, lead, actions }: HeroProps) {
  return <header className={`nm-hero ${surface === 'overview' ? 'overview__head' : 'study__header'}`}>
    <div className="nm-hero__copy">
      <h1>{session.title}</h1>
      <p className="nm-hero__meta">{eyebrow}</p>
      {surface !== 'overview' && <p className="lead">{session.summary}</p>}
      {lead && <div className="lead nm-hero__lead">{lead}</div>}
      {actions && <div className="nm-hero__actions">{actions}</div>}
    </div>
    <Trace />
  </header>
}
