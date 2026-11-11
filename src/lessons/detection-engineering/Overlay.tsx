import type { StageProps } from '../types'

/**
 * The chart's neatline: a graduated black-and-white border framing the
 * stage, with the reach number in the corner the way a chart panel is
 * numbered. Pure CSS, so it costs nothing per frame.
 */
export function Overlay({ slideIndex, slideCount, half }: StageProps) {
  return (
    <div className="de-neatline" data-half={half}>
      <span className="de-neatline__edge de-neatline__edge--top" />
      <span className="de-neatline__edge de-neatline__edge--bottom" />
      <span className="de-neatline__edge de-neatline__edge--left" />
      <span className="de-neatline__edge de-neatline__edge--right" />
      <span className="de-neatline__panel">
        Reach {String(slideIndex + 1).padStart(2, '0')} of {String(slideCount).padStart(2, '0')}
      </span>
    </div>
  )
}
