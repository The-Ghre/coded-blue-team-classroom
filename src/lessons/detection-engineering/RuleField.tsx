import { useState } from 'react'

/** A schematic population, not the scored corpus used by RuleBuilder. */
export function RuleField() {
  const [threshold, setThreshold] = useState(38)
  const events = Array.from({ length: 80 }, (_, i) => ({
    x: 28 + (i % 10) * 42, y: 48 + Math.floor(i / 10) * 25,
    attack: [8, 17, 29, 36, 49, 58, 67, 79].includes(i),
  }))
  const boundary = 28 + threshold * 3.78
  return <figure className="de-field">
    <figcaption>Synthetic rule-boundary illustration</figcaption>
    <svg viewBox="0 0 450 290" role="img" aria-label="Squares are ordinary events; triangles are attacks. Moving the rule boundary excludes both ordinary events and some attacks.">
      <text x="26" y="22">EVENT POPULATION</text>
      <rect x={boundary} y="32" width={430-boundary} height="216" className="de-field__selection" />
      {events.map((e,i) => <g key={i} className={e.attack ? 'de-field__attack' : 'de-field__normal'} opacity={e.x >= boundary ? 1 : .22}>
        {e.attack ? <path d={`M${e.x} ${e.y-6}l6 11h-12z`} /> : <rect x={e.x-3} y={e.y-3} width="6" height="6" />}
      </g>)}
      <path d={`M${boundary} 31V251`} className="de-field__boundary" />
      <text x="26" y="276">□ ORDINARY EVENT</text><text x="246" y="276">△ ATTACK</text>
    </svg>
    <label>Rule boundary <input type="range" min="0" max="95" value={threshold} onChange={e=>setThreshold(Number(e.target.value))} /></label>
    <p>Narrower match → fewer alerts, more missed attacks.</p>
  </figure>
}
