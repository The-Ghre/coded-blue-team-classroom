import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/motion'

/**
 * A number that travels to its target with VU-meter ballistics: weighted,
 * with a small overshoot, never an instant jump. Under reduced motion it is
 * simply the target.
 */
export function useBallistic(target: number, decimals = 0): number {
  const reduced = useReducedMotion()
  const [value, setValue] = useState(target)
  const s = useRef({ x: target, v: 0 })

  useEffect(() => {
    if (reduced) {
      s.current = { x: target, v: 0 }
      setValue(target)
      return
    }
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now
      const st = s.current
      // Spring: stiffness 170, damping 18 — settles in ~400ms with ~6% overshoot.
      const a = 170 * (target - st.x) - 18 * st.v
      st.v += a * dt
      st.x += st.v * dt
      const done = Math.abs(target - st.x) < 0.02 && Math.abs(st.v) < 0.05
      if (done) st.x = target
      const f = Math.pow(10, decimals)
      setValue(Math.round(st.x * f) / f)
      if (!done) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, reduced, decimals])

  return value
}

/** True while the page is being printed. Canvas art unmounts for paper. */
export function usePrinting(): boolean {
  const [printing, setPrinting] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia?.('print')
    const on = () => setPrinting(true)
    const off = () => setPrinting(false)
    const onMq = (e: MediaQueryListEvent) => setPrinting(e.matches)
    window.addEventListener('beforeprint', on)
    window.addEventListener('afterprint', off)
    mq?.addEventListener?.('change', onMq)
    return () => {
      window.removeEventListener('beforeprint', on)
      window.removeEventListener('afterprint', off)
      mq?.removeEventListener?.('change', onMq)
    }
  }, [])
  return printing
}
