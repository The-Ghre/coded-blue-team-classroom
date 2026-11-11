import type { StageProps } from '../types'
import { CanvasStage } from '@/motion'

/** Five survival traces cross the acquisition boundary into a stable record. */
export default function Backdrop({ reducedMotion, surface }: StageProps) {
  return <div className="ir-backdrop" data-surface={surface}>
    <CanvasStage animate={!reducedMotion} maxDpr={1.5} stillTime={4} draw={({ ctx, width: w, height: h, t }) => {
      ctx.clearRect(0, 0, w, h)
      const x0 = w * .72, boundary = w * .87
      ctx.lineWidth = 1
      ctx.strokeStyle = '#c7d5cf'
      ctx.beginPath(); ctx.moveTo(boundary, 0); ctx.lineTo(boundary, h); ctx.stroke()
      for (let lane = 0; lane < 5; lane++) {
        const y = h * .24 + lane * 42
        ctx.strokeStyle = '#a12c46'
        ctx.globalAlpha = .14
        ctx.beginPath()
        for (let i = 0; i <= 60; i++) {
          const x = x0 + i * (boundary - x0) / 60
          const decay = Math.max(0, 1 - i / (10 + lane * 14))
          const yy = y + Math.sin(i * 1.9 + t * (5-lane) * .4) * 10 * decay
          if (i % (lane + 3) === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy)
        }
        ctx.stroke(); ctx.globalAlpha = .2; ctx.strokeStyle = '#006158'
        ctx.beginPath(); ctx.moveTo(boundary, y); ctx.lineTo(w, y); ctx.stroke()
        ctx.fillStyle = '#006158'; ctx.fillRect(boundary - 2, y - 2, 4, 4)
      }
      ctx.globalAlpha = 1
    }} />
  </div>
}
