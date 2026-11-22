import type { HeroProps } from '../types'
import { RuleField } from './RuleField'
export function Hero({ session, eyebrow, lead, actions }: HeroProps) {
  return <header className="de-hero">
    <div className="de-hero__copy"><h1>{session.title}</h1><p className="de-hero__meta">{eyebrow} · {session.themes.join(' / ')}</p>
      {lead && <div className="lead">{lead}</div>}{actions && <div className="de-hero__actions">{actions}</div>}
    </div><RuleField />
  </header>
}
