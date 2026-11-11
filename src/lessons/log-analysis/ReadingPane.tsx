import { useEffect, useId, useRef, useState } from 'react'
import type { BlockOverrideProps } from '../types'

/** Keep the shared renderer mounted: scrolling must never reset an answer. */
export default function ReadingPane({ block, mode, Default }: BlockOverrideProps) {
  const pane = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const id = useId()
  const [position, setPosition] = useState({ dense: false, start: true, end: false })
  useEffect(() => {
    const node = pane.current
    if (!node) return
    const measure = () => setPosition({
      dense: node.scrollHeight > node.clientHeight + 2,
      start: node.scrollTop < 2,
      end: node.scrollTop + node.clientHeight >= node.scrollHeight - 2,
    })
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    if (content.current) observer.observe(content.current)
    node.addEventListener('scroll', measure, { passive: true })
    measure()
    return () => { observer.disconnect(); node.removeEventListener('scroll', measure) }
  }, [mode])
  if (mode !== 'slide') return <Default block={block} mode={mode} />
  const move = (direction: number) => {
    const node = pane.current
    if (node) node.scrollBy({ top: direction * node.clientHeight * .8, behavior: 'instant' })
  }
  return <div className="fj-reader" data-keys-own="" data-dense={position.dense}>
    <div className="fj-reader__nav" aria-label="Slide reading controls">
      <span>Reading pane · scroll or use controls</span>
      <button className="btn btn--sm" type="button" aria-controls={id} disabled={position.start} onClick={() => move(-1)}>↑ Previous reading</button>
      <button className="btn btn--sm" type="button" aria-controls={id} disabled={position.end} onClick={() => move(1)}>↓ Next reading</button>
    </div>
    <div id={id} ref={pane} className="fj-reader__pane" role="region" aria-label={`${block.title} — reading pane`} tabIndex={0}
      onKeyDown={event => {
        // A focused reading region owns reading keys, never the deck shortcuts.
        if (event.target !== event.currentTarget) return
        if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
          event.stopPropagation()
          event.preventDefault()
          const region = event.currentTarget
          const node = region.scrollHeight > region.clientHeight + 2
            ? region
            : region.closest<HTMLElement>('.present__stage') ?? region
          if (event.key === 'Home') node.scrollTop = 0
          else if (event.key === 'End') node.scrollTop = node.scrollHeight
          else node.scrollTop += (['ArrowUp', 'PageUp'].includes(event.key) ? -1 : 1) * (event.key.startsWith('Arrow') ? 80 : node.clientHeight * .8)
        }
      }}>
      <div ref={content}><Default block={block} mode={mode} /></div>
    </div>
  </div>
}
