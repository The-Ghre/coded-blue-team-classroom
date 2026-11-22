import type { HeroProps } from '../types'
import { AccessGraph } from './AccessGraph'
export default function Hero({ session, eyebrow, lead, actions }: HeroProps) {
  return <header className="ad-hero">
    <h1>{session.title}</h1>
    <p className="ad-hero__meta">{eyebrow}</p>
    <figure className="ad-hero__map"><AccessGraph/><figcaption>Synthetic relationship map · privilege follows granted permissions</figcaption></figure>
    {lead && <div className="lead ad-hero__lead">{lead}</div>}
    {actions && <div className="ad-hero__actions">{actions}</div>}
  </header>
}
