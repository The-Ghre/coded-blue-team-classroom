import { CanvasStage } from '@/motion'
import type { StageProps } from '../types'
export function Backdrop({ reducedMotion, slideIndex }: StageProps) {
  return <CanvasStage animate={!reducedMotion} maxDpr={1.5} draw={({ ctx, width, height, t }) => {
    ctx.clearRect(0, 0, width, height)
    // Only the margins carry ambient file-system branches; text stays on a quiet ground.
    for (let side = 0; side < 2; side++) {
      const x = side ? width - 21 : 21
      ctx.strokeStyle = side ? '#922d4320' : '#194bb020'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
      for (let j = 0; j < 12; j++) {
        const y = j * 92 + 30
        const dx = side ? -12 : 12
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y)
        ctx.rect(x + dx - 3, y - 5, 6, 10); ctx.stroke()
      }
      const y = ((t * 18 + slideIndex * 41) % (height + 30)) - 15
      ctx.fillStyle = side ? '#922d4350' : '#194bb050'
      ctx.fillRect(x - 1, y, 2, 14)
    }
  }} />
}
