import type { HeroProps } from '../types'
import { TraceMap } from './TraceMap'
export function Hero({ session, eyebrow, lead, actions }: HeroProps) {
  return <header className="hf-hero">
    <h1>{session.title}</h1>
    <p className="hf-hero__meta">{eyebrow}</p>
    <TraceMap />
    {lead && <div className="hf-hero__lead lead">{lead}</div>}
    {actions && <div className="hf-hero__actions">{actions}</div>}
  </header>
}
