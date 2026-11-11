import { useEffect, useState } from 'react'
import type { ScenarioBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { usePresentState, useReducedMotion } from '@/motion'

/* =========================================================================
   SCENARIO — with the darkroom timer set to the ten minutes on offer
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
        <svg viewBox="0 0 120 140" width="0" height="0" focusable="false">
          <circle className="ir-timer__face" cx="60" cy="60" r="56" />
          {Array.from({ length: 60 }, (_, i) => (
            <line
              key={i}
              className={i % 5 === 0 ? 'ir-timer__tick ir-timer__tick--major' : 'ir-timer__tick'}
              x1="60"
              y1={i % 5 === 0 ? 8 : 10}
              x2="60"
              y2="14"
              transform={`rotate(${i * 6} 60 60)`}
            />
          ))}
          <path
            className="ir-timer__window"
            d={sector(60, 60, 46, 0, 60 * frac)}
          />
          <line
            className="ir-timer__hand"
            x1="60"
            y1="60"
            x2="60"
            y2="12"
            transform={`rotate(${(left % 60) * -6} 60 60)`}
          />
          <circle className="ir-timer__hub" cx="60" cy="60" r="3.5" />
          <text className="ir-timer__read" x="60" y="134" textAnchor="middle">
            {mins}:{String(secs).padStart(2, '0')}
          </text>
        </svg>
      </div>
    </div>
  )
}

/** A pie sector from 12 o'clock, `deg` degrees clockwise. */
function sector(cx: number, cy: number, r: number, from: number, deg: number) {
  if (deg <= 0.01) return ''
  const a0 = ((from - 90) * Math.PI) / 180
  const a1 = ((from + deg - 90) * Math.PI) / 180
  const large = deg > 180 ? 1 : 0
  return `M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 ${large} 1 ${
    cx + r * Math.cos(a1)
  } ${cy + r * Math.sin(a1)} Z`
}
