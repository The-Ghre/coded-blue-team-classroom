import type { CSSProperties } from 'react'
import type { StageProps } from '../types'

/* =========================================================================
   THE NEGATIVE — every slide is one frame on a 35mm strip
   =========================================================================
   A vertical strip down the left edge of the stage. Frames already shown
   are developed; the current frame sits in the safelight; frames ahead are
   still latent. The strip advances one frame per slide in the direction of
   travel. Edge print carries the frame numbers the way real film does
   (7, 7A, 8…). Decorative: the player already announces the slide.
   ========================================================================= */

export default function Overlay({ session, slideIndex, slideCount, focusMode }: StageProps) {
  const theory = session.theory.blocks.length
  const frames = Array.from({ length: slideCount }, (_, i) => i)
  return (
    <div
      className="ir-strip"
      data-focus={focusMode || undefined}
      style={{ '--i': slideIndex, '--n': slideCount } as CSSProperties}
    >
      <div className="ir-strip__film">
        <span className="ir-strip__leader">CODED · S05 · SAFETY FILM</span>
        {frames.map((i) => (
          <span
            key={i}
            className="ir-strip__frame"
            data-state={i < slideIndex ? 'fixed' : i === slideIndex ? 'current' : 'latent'}
            data-half={i < theory ? 'theory' : 'practical'}
          >
            <span className="ir-strip__num">{i + 1}</span>
            <span className="ir-strip__edge">
              {i + 1}A{i === theory ? ' · WORKSHOP' : ''}
            </span>
          </span>
        ))}
        <span className="ir-strip__leader">END OF ROLL</span>
      </div>
    </div>
  )
}
