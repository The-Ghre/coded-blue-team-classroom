import type { StageProps } from '../types'

/** Static routing notation: no perpetual animation or background GPU work. */
export function SourceBackdrop({ surface, slideIndex, slideCount }: StageProps) {
  const progress = slideCount > 1 ? slideIndex / (slideCount - 1) : 0
  return <div className="pi-backdrop" data-surface={surface}>
    <svg viewBox="0 0 80 800" preserveAspectRatio="none" aria-hidden="true">
      <path d="M40 40V760" />
      {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M32 ${40 + i * 48}H48`} />)}
      <rect x="31" y={746 - progress * 708} width="18" height="18" />
    </svg>
  </div>
}
