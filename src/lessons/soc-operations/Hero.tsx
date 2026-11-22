import type { HeroProps } from '../types'
import { AlertFlow } from './Backdrop'

export function Hero({ session, eyebrow, lead, actions }: HeroProps) {
  return <header className="soc-hero">
    <div className="soc-hero__body">
      <h1>{session.title}</h1>
      {lead && <div className="soc-hero__lead">{lead}</div>}
      {actions && <div className="soc-hero__actions">{actions}</div>}
    </div>
    <div className="soc-hero__flow" aria-hidden="true"><AlertFlow /></div>
    <div className="soc-hero__meta"><span>{eyebrow}</span><span>{session.themes.join(' / ')}</span><span>{session.theory.minutes} + {session.practical.minutes} min</span></div>
  </header>
}
