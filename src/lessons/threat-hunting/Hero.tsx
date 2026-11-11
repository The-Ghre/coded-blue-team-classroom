import type { HeroProps } from '../types'
import { Distribution } from './Distribution'

export function Hero({ session, eyebrow, lead, actions }: HeroProps) {
  return <header className="hunt-hero">
    <div className="hunt-hero__heading"><h1>{session.title}</h1><p>{eyebrow}</p></div>
    {lead && <p className="lead hunt-hero__lead">{lead}</p>}
    {actions && <div className="hunt-hero__actions">{actions}</div>}
    <Distribution />
  </header>
}
