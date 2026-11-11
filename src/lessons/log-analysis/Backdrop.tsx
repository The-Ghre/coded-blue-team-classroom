import type { StageProps } from '../types'

/** Static registration lines: no idle animation, timers or rendering loop. */
export default function Backdrop({ slideIndex, surface }: StageProps) {
  return <svg className="fj-ground" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
    <path d="M40 0V900 M64 0V900 M1376 0V900 M1400 0V900" />
    {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M40 ${i * 40 + 20}h24 M1376 ${i * 40 + 20}h24`} />)}
    <rect className="fj-ground__position" x="40" y={surface === 'present' ? 40 + (slideIndex % 19) * 40 : 180} width="24" height="4" />
  </svg>
}
