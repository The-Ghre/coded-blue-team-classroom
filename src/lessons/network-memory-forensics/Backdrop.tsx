import { CanvasStage } from '@/motion'
import type { StageProps } from '../types'

export function Backdrop({ surface, block, reducedMotion }: StageProps) {
  const memory = ['volatility', 'malfind', 'check'].includes(block?.id ?? '')
  return <div className="nm-packet-backdrop"><CanvasStage animate={!reducedMotion} draw={({ ctx: c, width: w, height: h, t, still }) => {
    c.clearRect(0, 0, w, h)
    if (surface !== 'present') return
    // Two event lanes at the foot of the stage; the timer remains regular.
    const y = h - 24
    for (let row = 0; row < 2; row++) {
      c.strokeStyle = '#b9cdc8'
      c.beginPath(); c.moveTo(0, y + row * 12); c.lineTo(w, y + row * 12); c.stroke()
      for (let i = 0; i < 40; i++) {
        const x = ((i * (w / 16) + (row ? Math.sin(i * 17) * 45 : 0) - (still ? 0 : t * 12)) % w + w) % w
        c.fillStyle = memory && i % 7 === 0 ? '#713868' : row ? '#6d8e85' : '#005b50'
        c.fillRect(x, y + row * 12 - 4, row ? 3 : 6, 8)
      }
    }
  }} /></div>
}
