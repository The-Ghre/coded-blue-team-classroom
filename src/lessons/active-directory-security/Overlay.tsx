import type { StageProps } from '../types'
export default function Overlay({ slideIndex, slideCount }: StageProps) {
  return <div className="ad-position" aria-hidden="true"><span>AD</span><span>{String(slideIndex + 1).padStart(2, '0')} / {slideCount}</span></div>
}
