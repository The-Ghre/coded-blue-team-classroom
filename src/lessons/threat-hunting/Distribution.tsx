import { useState } from 'react'
import { motion } from 'motion/react'
import { useReducedMotion } from '@/motion'

/** Two process pairs are taken verbatim from the lesson. No finding is implied. */
export function Distribution() {
  const [ascending, setAscending] = useState(false)
  const reduced = useReducedMotion()
  const bars = Array.from({ length: 36 }, (_, i) => ({ id: i, height: 5 + 178 / (1 + i * 0.38) ** 1.5 }))
  if (ascending) bars.reverse()
  return (
    <figure className="hunt-distribution" hidden>
      <div className="hunt-distribution__heading">
        <figcaption>Stack counting · parent → child process</figcaption>
        <button type="button" className="btn" aria-pressed={ascending} onClick={() => setAscending(v => !v)}>
          {ascending ? 'Most frequent first' : 'Rarest first'}
        </button>
      </div>
      <div className="hunt-distribution__plot" aria-hidden="true">
        {bars.map(bar => <motion.div layout={!reduced} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} key={bar.id} className="hunt-distribution__bar" data-rare={bar.id === 35} style={{ height: bar.height }} />)}
      </div>
      <div className="hunt-distribution__ends" data-ascending={ascending}>
        <p><code>explorer.exe → notepad.exe</code><strong>50,000</strong></p>
        <p><code>WINWORD.EXE → powershell.exe</code><strong>1</strong></p>
      </div>
      <p className="hunt-distribution__note">Illustrative distribution · endpoint counts from the lesson · rarity invites investigation, not a verdict.</p>
      <span className="sr-only" aria-live="polite">{ascending ? 'Rarest process pair first.' : 'Most frequent process pair first.'}</span>
    </figure>
  )
}
