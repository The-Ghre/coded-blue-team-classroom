import type { StageProps } from '../types'
import { CanvasStage, type CanvasFrame } from '@/motion'

export default function Backdrop({ slideIndex }: StageProps) {
  function draw({ ctx, width, height, t, still }: CanvasFrame) {
    ctx.clearRect(0, 0, width, height)
    // Sparse directory relationships stay at the margin, clear of reading ink.
    ctx.strokeStyle = '#be8990'; ctx.globalAlpha = 0.1; ctx.lineWidth = 1
    const x = width - 30
    for (let i = 0; i < 9; i++) {
      const y = 50 + i * 110
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 40, y + 40); ctx.lineTo(x - 40, y + 90); ctx.stroke()
      ctx.strokeRect(x - 46, y + 84, 12, 12)
    }
    ctx.globalAlpha = 0.5; ctx.fillStyle = '#ffc0ad'
    const y = still ? height * 0.55 : height + 15 - ((t * 28 + slideIndex * 71) % (height + 30))
    ctx.fillRect(x - 43, y, 6, 6); ctx.globalAlpha = 1
  }
  return <CanvasStage draw={draw} maxDpr={1.5} />
}
