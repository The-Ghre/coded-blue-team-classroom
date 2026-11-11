import type { Block } from '@/types/content'
import type { BlockOverrideProps } from '../../types'

/** Keep the shared renderer mounted as the reader scrolls and reveals feedback. */
export function ReadingPane<B extends Block>({ block, mode, Default }: BlockOverrideProps<B>) {
  if (mode !== 'slide') return <Default block={block} mode={mode} />
  return <section className="pi-reader" aria-label={`${block.title} — reading pane`}>
    <p className="pi-reader__cue">Read the evidence · Scroll or focus the pane and use ↑ ↓</p>
    <div className="pi-reader__body" tabIndex={0} role="region" aria-label={`${block.title} content`}
      onKeyDown={event => {
        if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) event.stopPropagation()
      }}>
      <Default block={block} mode={mode} />
    </div>
  </section>
}
