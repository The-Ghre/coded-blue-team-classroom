import { useRef } from 'react'
import { CanvasStage } from '@/motion'
import type { StageProps } from '../types'

/** A ranked distribution at the margin, never behind reading text.
 * CanvasStage caps DPR, suspends hidden rendering and composes a still frame. */
export function Backdrop({ slideIndex, reducedMotion, surface }: StageProps) {
  const position = useRef(slideIndex)
  return <div className="hunt-backdrop" aria-hidden="true"><CanvasStage maxDpr={1.5} animate={!reducedMotion} draw={({ ctx, width, height, dt, still }) => {
    ctx.clearRect(0, 0, width, height)
    position.current += (slideIndex - position.current) * (still ? 1 : Math.min(1, dt * 6))
    const baseline = height - 24
    const start = surface === 'present' ? width * 0.72 : width * 0.8
    const step = (width - start - 16) / 32
    for (let i = 0; i < 32; i++) {
      const h = 8 + 95 / (1 + i * 0.4) ** 1.3
      const active = i === Math.round(position.current) % 32
      ctx.fillStyle = active ? '#99104e' : '#d9d1df'
      ctx.fillRect(start + i * step, baseline - h, Math.max(2, step - 3), h)
    }
    ctx.strokeStyle = '#c4b8cc'
    ctx.beginPath(); ctx.moveTo(start, baseline + 4); ctx.lineTo(width - 16, baseline + 4); ctx.stroke()
  }} /></div>
}
