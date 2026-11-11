import { useEffect } from 'react'
import type { StageProps } from '../types'

/** Enhance the shared slide shell without replacing or remounting its content. */
export function ReadingPane({ slideIndex, block }: StageProps) {
  useEffect(() => {
    const pane = document.querySelector<HTMLElement>('.present__slide')
    if (!pane) return
    pane.tabIndex = 0
    pane.setAttribute('role', 'region')
    pane.setAttribute('aria-label', `${block?.title ?? 'Lesson'} — scroll to read`)
    const scrollKeys = (event: KeyboardEvent) => {
      // Let native scrolling work while keeping the player's shortcuts out.
      if (event.target === pane && ['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp', ' '].includes(event.key)) {
        event.stopPropagation()
      }
    }
    pane.addEventListener('keydown', scrollKeys)
    return () => {
      pane.removeEventListener('keydown', scrollKeys)
      pane.removeAttribute('tabindex')
      pane.removeAttribute('role')
      pane.removeAttribute('aria-label')
    }
  }, [slideIndex, block?.title])
  return null
}
