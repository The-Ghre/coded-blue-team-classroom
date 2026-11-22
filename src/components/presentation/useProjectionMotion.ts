import { useLayoutEffect, useRef } from 'react'
import type { ProjectionFrame } from '@/content/presentations'

/** Bounded teaching builds. Existing points stay still; only new evidence moves. */
export function useProjectionMotion(frame: ProjectionFrame, build: number, enabled: boolean, identity: string) {
  const article = useRef<HTMLElement>(null)
  const previous = useRef({ id: '', build: -1 })
  const running = useRef<Animation[]>([])

  useLayoutEffect(() => {
    const element = article.current
    if (!element) return
    const last = previous.current
    const entering = last.id !== identity
    const advancing = !entering && build > last.build
    previous.current = { id: identity, build }
    if (!enabled || !element.animate) {
      running.current.forEach(animation => animation.cancel())
      running.current = []
      return
    }
    // Rapid navigation and reversing a build must never finish an old reveal later.
    if (entering || !advancing) {
      running.current.forEach(animation => animation.cancel())
      running.current = []
    }
    const animate = (target: Element | null, frames: Keyframe[], duration: number, delay = 0) => {
      if (!target) return
      const animation = target.animate(frames, { duration, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' })
      animation.id = `projector-${frame.kind}`
      running.current.push(animation)
      void animation.finished.catch(() => undefined).finally(() => {
        running.current = running.current.filter(value => value !== animation)
      })
    }
    if (entering && frame.kind === 'cover') {
      const parts = element.querySelectorAll('.projector-cover-mark > *')
      parts.forEach((part, index) => animate(part, part.tagName === 'I'
        ? [{ scale: '0 1', transformOrigin: 'left' }, { scale: '1 1', transformOrigin: 'left' }]
        : [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0)' }], 360, index * 75))
      return
    }
    if (entering && ['agenda', 'section'].includes(frame.kind)) {
      element.querySelectorAll('.projector-points li').forEach((item, index) => {
        animate(item, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0)' }], 300, index * 35)
      })
      return
    }
    if (!entering && !advancing) return
    const items = Array.from(element.querySelectorAll<HTMLElement>('[data-revealed]'))
    // Reveal-all includes every newly exposed item, with at most 180ms of stagger.
    items.forEach((item, index) => {
      if (item.dataset.revealed !== 'true' || (!entering && index <= last.build)) return
      const delay = advancing ? Math.min(180, Math.max(0, index - last.build - 1) * 45) : 0
      if (frame.kind === 'flow') {
        animate(item.querySelector('.projector-connector'), [{ scale: '0 1', transformOrigin: 'left' }, { scale: '1 1', transformOrigin: 'left' }], 280, delay)
        animate(item.querySelector('.projector-node'), [{ scale: '.65', opacity: .3 }, { scale: '1', opacity: 1 }], 300, delay + (index ? 110 : 0))
        animate(item.querySelector('.projector-step-copy'), [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0)' }], 320, delay + 100)
      } else if (frame.kind === 'evidence') {
        animate(item.querySelector('code'), [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0)' }], 320, delay)
        animate(item.querySelector('.projector-annotation'), [{ opacity: .15 }, { opacity: 1 }], 240, delay + 120)
      } else if (frame.kind === 'compare') {
        animate(item, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0)' }], 360, delay)
      } else if (frame.kind === 'bullets') {
        animate(item.querySelector('.projector-point-index'), [{ scale: '.5' }, { scale: '1' }], 260, delay)
        animate(item.querySelector('.projector-point-copy'), [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0)' }], 260, delay + 60)
      }
    })
  }, [frame, build, enabled, identity])

  useLayoutEffect(() => () => {
    running.current.forEach(animation => animation.cancel())
    running.current = []
    previous.current = { id: '', build: -1 }
  }, [])
  return article
}
