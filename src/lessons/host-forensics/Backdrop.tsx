import { useEffect, useMemo } from 'react'
import { getSlides } from '@/content'
import type { StageProps } from '../types'
import { PileField, type EventSource } from './pile/PileField'
import { TOTAL_STEPS, trail, type TrailEvent } from './pile/trail'

/* =========================================================================
   BACKDROP — who walks, and when the cleaner comes
   =========================================================================
   Presentation: one stretch of the walk per slide, completed on the
   demonstration slide. The cleaner vacuums the Linux carpet on the
   anti-forensics slide and the Windows carpet on the demonstration. Going
   back adds nothing and removes nothing.

   Study: the reader's scroll is the walk. Workshop: the walk has already
   happened; the lamp retraces it. Overview: the whole floor, composed, with
   no effect on what the other surfaces remember.
   ========================================================================= */

/* On a slide the strip runs straight down the middle, so it lines up with
   the brass strip the compare and evidence slides draw between columns. */
const PRESENT_THRESHOLD = [0.5, 0.5] as const
/* On the overview the strip leans further left, so the hero title is laid
   across both carpets. */
const OVERVIEW_THRESHOLD = [0.4, 0.5] as const

const ANTI_ID = 'antiforensics'
const DEMO_ID = 'demo'

/** The finished floor, for the overview. Its own record, never the shared one. */
const COMPLETE: EventSource = {
  events: [
    ...Array.from({ length: TOTAL_STEPS }, (_, i): TrailEvent => ({ type: 'step', index: i })),
    { type: 'vacuum', side: 'linux' },
    { type: 'vacuum', side: 'windows' },
  ],
  subscribe: () => () => undefined,
}

export function Backdrop(props: StageProps) {
  const { surface, session, slideIndex, half, focusMode, reducedMotion } = props
  const slides = useMemo(() => getSlides(session), [session])
  const antiIndex = slides.findIndex((b) => b.id === ANTI_ID)
  const demoIndex = slides.findIndex((b) => b.id === DEMO_ID)

  // Presentation: walk with the slides.
  useEffect(() => {
    if (surface !== 'present') return
    const end = demoIndex >= 0 ? demoIndex + 1 : Math.ceil(slides.length / 2)
    trail.walkTo((TOTAL_STEPS * Math.min(slideIndex + 1, end)) / end)
    if (antiIndex >= 0 && slideIndex >= antiIndex) trail.vacuum('linux')
    if (demoIndex >= 0 && slideIndex >= demoIndex) trail.vacuum('windows')
  }, [surface, slideIndex, slides.length, antiIndex, demoIndex])

  // Study: the scroll is the walk.
  useEffect(() => {
    if (surface !== 'study') return
    if (half === 'practical') {
      trail.walkTo(TOTAL_STEPS)
      trail.vacuum('linux')
      trail.vacuum('windows')
      return
    }
    let raf = 0
    const read = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 0
      trail.walkTo(2 + progress * (TOTAL_STEPS - 2))
      const mid = window.innerHeight * 0.55
      const anti = document.getElementById(ANTI_ID)?.getBoundingClientRect()
      const demo = document.getElementById(DEMO_ID)?.getBoundingClientRect()
      if (anti && anti.top < mid) trail.vacuum('linux')
      if (demo && demo.top < mid) trail.vacuum('windows')
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [surface, half])

  const source = surface === 'overview' ? COMPLETE : trail
  const quiet = surface === 'present' ? 0 : surface === 'overview' ? 0.55 : 1
  const lamp = half === 'practical' || surface === 'overview' ? 'retrace' : 'walker'

  return (
    <PileField
      source={source}
      quiet={quiet}
      lamp={lamp}
      power={focusMode ? 1.18 : 1}
      threshold={surface === 'present' ? PRESENT_THRESHOLD : surface === 'overview' ? OVERVIEW_THRESHOLD : undefined}
      reducedMotion={reducedMotion}
      interactive
    />
  )
}
