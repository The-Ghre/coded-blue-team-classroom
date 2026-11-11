import type { HeroProps } from '../types'
import { MessageSource } from './MessageSource'

export function Hero({ session, eyebrow, lead, actions, surface }: HeroProps) {
  return <header className="pi-hero" data-surface={surface}>
    <div className="pi-hero__text">
      <h1>{session.title}</h1>
      <p className="pi-caption">{eyebrow}</p>
      {lead && (typeof lead === 'string' ? <p className="lead">{lead}</p> : lead)}
      {actions && <div className="pi-actions">{actions}</div>}
    </div>
    <MessageSource />
  </header>
}
