import { useEffect, useState } from 'react'
import type { ScenarioBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { usePresentState, useReducedMotion } from '@/motion'

/* =========================================================================
   SCENARIO — the remaining evidence-preservation window
   =========================================================================
   The shared scenario renderer, untouched, beside a process timer. On a
   projected slide the timer runs the scenario's ten minutes down in real
   time from the moment the slide appears; in study, and under reduced
   motion, it rests at the full ten. Decorative: the narrative carries it.
   ========================================================================= */

const WINDOW = 10 * 60

export default function Scenario({ block, mode, Default }: BlockOverrideProps<ScenarioBlock>) {
  const { presenting } = usePresentState()
  const reduced = useReducedMotion()
  const live = presenting && mode === 'slide' && !reduced
  const [left, setLeft] = useState(WINDOW)

  useEffect(() => {
    if (!live) {
      setLeft(WINDOW)
      return
    }
    const start = performance.now()
    const id = window.setInterval(() => {
      setLeft(Math.max(0, WINDOW - (performance.now() - start) / 1000))
    }, 250)
    return () => window.clearInterval(id)
  }, [live])

  const mins = Math.floor(left / 60)
  const secs = Math.floor(left % 60)
  const frac = left / WINDOW

  return (
    <div className="ir-scenario" data-live={live || undefined}>
      <Default block={block} mode={mode} />
      <div className="ir-timer" aria-hidden="true">
        <span className="ir-timer__read">{mins}:{String(secs).padStart(2, '0')}</span>
        <svg viewBox="0 0 120 8" width="120" height="8" focusable="false">
          <path className="ir-timer__track" d="M0 4H120" />
          <path className="ir-timer__remaining" d={`M0 4H${120 * frac}`} />
        </svg>
      </div>
    </div>
  )
}
