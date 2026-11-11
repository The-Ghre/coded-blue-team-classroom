import { useEffect } from 'react'
import type { StageProps } from '../types'
export default function Overlay({ slideIndex, slideCount }: StageProps) {
  useEffect(() => {
    const attach = () => {
      const pane = document.querySelector<HTMLElement>('.present__slide')
      if (!pane) return
      pane.tabIndex = 0
      pane.setAttribute('role', 'region')
      pane.setAttribute('aria-label', 'Lesson reading pane. Scroll to read all content.')
      pane.onkeydown = (event) => {
        if (event.target === pane && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) event.stopPropagation()
      }
    }
    attach()
    const observer = new MutationObserver(attach)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [slideIndex])
  return <div className="ir-position" aria-hidden="true">
    <span>{String(slideIndex + 1).padStart(2, '0')}</span>
    <div>{Array.from({length: slideCount}, (_, i) => <i key={i} data-state={i < slideIndex ? 'recorded' : i === slideIndex ? 'current' : 'pending'} />)}</div>
    <span>{String(slideCount).padStart(2, '0')}</span>
  </div>
}
