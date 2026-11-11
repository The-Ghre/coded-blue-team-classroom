import type { CSSProperties } from 'react'
import type { StageProps } from '../types'
import { positionLabel } from './art'

/* =========================================================================
   OVERLAY — the plating key
   =========================================================================
   A specialist always knows which position on the sheet is under the
   glass. A small sheet map in the stage margin: every position examined
   so far carries its tick, the current one is lit, and the label names it
   the way a plating note would (R2/2). Decoration only; the player's own
   counter remains the accessible position.
   ========================================================================= */

const COLS = 5

export function Overlay({ slideIndex, slideCount }: StageProps) {
  const count = Math.max(slideCount, 1)
  const rows = Math.ceil(count / COLS)
  return (
    <div className="th-key" style={{ '--rows': rows } as CSSProperties}>
      <span className="th-key__label">{positionLabel(slideIndex, COLS)}</span>
      <span className="th-key__map">
        {Array.from({ length: rows * COLS }, (_, i) => (
          <span
            key={i}
            className="th-key__cell"
            data-state={i >= count ? 'blank' : i < slideIndex ? 'seen' : i === slideIndex ? 'now' : 'ahead'}
          />
        ))}
      </span>
    </div>
  )
}
