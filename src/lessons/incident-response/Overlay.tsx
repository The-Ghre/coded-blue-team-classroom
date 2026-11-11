import { useEffect } from 'react'
import type { StageProps } from '../types'
export default function Overlay({ slideIndex, slideCount }: StageProps) {
  useEffect(() => {
    const pane = document.querySelector<HTMLElement>('.present__slide')
    if (!pane) return
    pane.tabIndex = 0
    pane.setAttribute('role', 'region')
    pane.setAttribute('aria-label', 'Lesson reading pane. Scroll to read all content.')
    const stop = (event: KeyboardEvent) => {
      if (event.target === pane && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) event.stopPropagation()
    }
    pane.addEventListener('keydown', stop)
    return () => pane.removeEventListener('keydown', stop)
  }, [slideIndex])
  return <div className="ir-position" aria-hidden="true">
    <span>{String(slideIndex + 1).padStart(2, '0')}</span>
    <div>{Array.from({length: slideCount}, (_, i) => <i key={i} data-state={i < slideIndex ? 'recorded' : i === slideIndex ? 'current' : 'pending'} />)}</div>
    <span>{String(slideCount).padStart(2, '0')}</span>
  </div>
}
