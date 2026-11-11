import type { CSSProperties } from 'react'
import type { StageProps } from '../types'

/* =========================================================================
   THE COMB
   =========================================================================
   A steel comb runs down the left edge of the projected slide: one tuned
   tooth per slide, longest first. The current slide's tooth is blued and
   plucked as you arrive; the teeth already played stay bright, the rest
   wait. Decorative: the player already announces position.
   ========================================================================= */

export function Overlay({ slideIndex, slideCount, half, focusMode }: StageProps) {
  return (
    <div className="nmf-comb" data-half={half} data-focus={focusMode} aria-hidden="true">
      <div className="nmf-comb__base" />
      <ol className="nmf-comb__teeth">
        {Array.from({ length: slideCount }, (_, i) => (
          <li
            key={i}
            className="nmf-comb__tooth"
            data-state={i === slideIndex ? 'current' : i < slideIndex ? 'played' : 'waiting'}
            style={{ '--len': 1 - (i / Math.max(1, slideCount - 1)) * 0.55 } as CSSProperties}
          >
            {/* Remount the current tooth on every slide so its pluck replays. */}
            <span key={i === slideIndex ? `p${slideIndex}` : 'rest'} className="nmf-comb__steel" />
            {i === slideIndex && <span className="nmf-comb__num">{i + 1}</span>}
          </li>
        ))}
      </ol>
    </div>
  )
}
