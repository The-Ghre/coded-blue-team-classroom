import type { CSSProperties } from 'react'
import type { StageProps } from '../types'

/* =========================================================================
   THE ROLL
   =========================================================================
   A strip of film rebate runs down the left edge of the projected slide.
   Its edge print counts frames; each slide advances the roll by one frame,
   so the deck itself is a roll being wound through — and the room can see
   how much film is left. Decorative: the player already announces position.
   ========================================================================= */

export function Overlay({ slideIndex, slideCount, half, focusMode }: StageProps) {
  const frames = Array.from({ length: slideCount }, (_, i) => i)
  return (
    <div
      className="nmf-roll"
      data-half={half}
      data-focus={focusMode}
      style={{ '--i': slideIndex, '--n': slideCount } as CSSProperties}
    >
      <div className="nmf-roll__track">
        {frames.map((i) => (
          <div key={i} className="nmf-roll__frame" data-current={i === slideIndex}>
            <span className="nmf-roll__num">
              {i + 1}
              <span className="nmf-roll__arrow">▸</span>
              {i + 1}A
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
