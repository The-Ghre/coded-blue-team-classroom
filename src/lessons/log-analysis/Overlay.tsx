import { useEffect, useMemo, useRef } from 'react'
import type { StageProps } from '../types'
import { clockForSlide, formatClock, graphWindow, sessionRoute } from './graph'

/* =========================================================================
   OVERLAY — the time cursor
   =========================================================================
   On every slide change a graphite hairline sweeps across the slide with
   the clock reading it now stands at. It runs on the same 560ms curve as
   the view-transition wipe in theme.css, so the hard edge of the incoming
   slide and the cursor are one line. Reduced motion: nothing is drawn.
   ========================================================================= */

const SWEEP_MS = 560
const EASE = 'cubic-bezier(0.65, 0, 0.2, 1)'

export default function Overlay({ session, slideIndex, direction, half, reducedMotion }: StageProps) {
  const lineRef = useRef<HTMLDivElement>(null)
  const route = useMemo(() => sessionRoute(session), [session])

  const reading = useMemo(() => {
    if (!route) return ''
    const t =
      half === 'practical' ? graphWindow(route)[1] : clockForSlide(route, session.theory.blocks, slideIndex)
    return formatClock(t)
  }, [route, session, slideIndex, half])

  useEffect(() => {
    const el = lineRef.current
    if (!el || reducedMotion || direction === 0) return
    const slide = document.querySelector('.present__slide')
    const host = el.parentElement?.getBoundingClientRect()
    const box = slide?.getBoundingClientRect()
    if (!host || !box) return
    const left = box.left - host.left
    const right = box.right - host.left
    const [from, to] = direction > 0 ? [left, right] : [right, left]
    el.style.top = `${box.top - host.top}px`
    el.style.height = `${Math.min(box.height, host.height - (box.top - host.top))}px`
    const anim = el.animate(
      [
        { transform: `translateX(${from}px)`, opacity: 1 },
        { transform: `translateX(${to}px)`, opacity: 1, offset: 0.92 },
        { transform: `translateX(${to}px)`, opacity: 0 },
      ],
      { duration: SWEEP_MS + 120, easing: EASE, fill: 'none' },
    )
    return () => anim.cancel()
  }, [slideIndex, direction, reducedMotion])

  if (reducedMotion) return null
  return (
    <div ref={lineRef} className="la-cursor">
      <span className="la-cursor__reading">{reading}</span>
    </div>
  )
}
