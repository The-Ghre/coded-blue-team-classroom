import type { ReactNode } from 'react'

/* =========================================================================
   TRIAGE TAG PARTS
   =========================================================================
   The lesson's world is a dispatch triage tag. These are its printed parts:
   the routing strips, the violet time-stamp and the ruled field. Every part
   is drawn in code; nothing here is a raster.

   Routing law: the three strip colours mean CLOSE, TIER 2 and INCIDENT and
   appear only where a routing decision lives. They are never decoration.
   ========================================================================= */

export type Route = 'close' | 'escalate' | 'incident'

export const ROUTES: { id: Route; label: string; long: string }[] = [
  { id: 'incident', label: 'Incident', long: 'Confirmed incident · Incident Response' },
  { id: 'escalate', label: 'Tier 2', long: 'Escalate to Tier 2' },
  { id: 'close', label: 'Close', long: 'Close as false positive' },
]

/** Which strip an option belongs on, read from the option's own id. */
export function routeOf(optionId: string): Route | null {
  if (optionId.startsWith('close')) return 'close'
  if (optionId.startsWith('escalate')) return 'escalate'
  if (optionId === 'ir' || optionId.startsWith('incident')) return 'incident'
  return null
}

/**
 * The strips a tag keeps once it is routed. On a real tag you tear off
 * every strip beyond the category you decide, so the outermost strip left
 * on the tag IS the decision: close tears nothing, Tier 2 tears the green
 * strip, an incident tears green and yellow.
 */
export function stripsKept(route: Route): Route[] {
  if (route === 'close') return ['incident', 'escalate', 'close']
  if (route === 'escalate') return ['incident', 'escalate']
  return ['incident']
}

/** A violet time-stamp, punched once. Decorative: callers repeat its text. */
export function Stamp({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`soc-stamp ${className}`} aria-hidden="true">
      <span className="soc-stamp__ink">{children}</span>
    </span>
  )
}

/** Labelled routing strips — the session's three possible decisions. */
export function RouteStrips({ className = '' }: { className?: string }) {
  return (
    <div className={`soc-strips ${className}`}>
      {ROUTES.map((r) => (
        <span key={r.id} className="soc-strip" data-route={r.id}>
          <span className="soc-strip__label">{r.label}</span>
        </span>
      ))}
    </div>
  )
}

/** A small drawn mark for a check's weight. The word always travels with it. */
export function WeightMark({ weight }: { weight: 'damning' | 'exculpatory' | 'neutral' }) {
  return (
    <svg className="soc-weight" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
      {weight === 'damning' && <path d="M6 1.2 11 10.6H1z" fill="currentColor" />}
      {weight === 'exculpatory' && <path d="M6 10.8 1 1.4h10z" fill="currentColor" />}
      {weight === 'neutral' && <rect x="2" y="2" width="8" height="8" fill="currentColor" />}
    </svg>
  )
}

/** Decision state marks, drawn rather than typed. */
export function StateMark({ state }: { state: 'pending' | 'correct' | 'incorrect' }) {
  return (
    <svg className="soc-state" viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
      {state === 'pending' && (
        <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      )}
      {state === 'correct' && (
        <path d="M2.6 7.4 5.8 10.4 11.4 3.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {state === 'incorrect' && (
        <path d="M3.4 3.4 10.6 10.6M10.6 3.4 3.4 10.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  )
}
