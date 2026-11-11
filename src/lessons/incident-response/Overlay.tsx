import type { StageProps } from '../types'
export default function Overlay({ slideIndex, slideCount }: StageProps) {
  return <div className="ir-position" aria-hidden="true">
    <span>{String(slideIndex + 1).padStart(2, '0')}</span>
    <div>{Array.from({length: slideCount}, (_, i) => <i key={i} data-state={i < slideIndex ? 'recorded' : i === slideIndex ? 'current' : 'pending'} />)}</div>
    <span>{String(slideCount).padStart(2, '0')}</span>
  </div>
}
