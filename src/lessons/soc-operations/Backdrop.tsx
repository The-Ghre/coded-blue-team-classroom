import { CanvasStage, type CanvasFrame } from '@/motion'
import type { StageProps } from '../types'

/** Decorative correlation schematic; never represents live or scored data. */
export function AlertFlow({ quiet = false }: { quiet?: boolean }) {
  function draw({ ctx: c, width: w, height: h, t, still }: CanvasFrame) {
    c.clearRect(0, 0, w, h)
    const sx = w / 520, sy = h / 340
    c.save(); c.scale(sx, sy)
    const phase = still ? 0.64 : (t % 12) / 12
    c.lineWidth = 1
    c.strokeStyle = '#9ab5a8'
    for (let i = 0; i < 13; i++) {
      const y = 22 + i * 24
      const x = still ? 0 : Math.sin(t * 0.24 + i) * 4
      c.strokeRect(x + 5, y, 120 - (i % 3) * 15, 13)
      c.beginPath(); c.moveTo(135, y + 6); c.bezierCurveTo(180, y + 6, 165, 170, 220, 170); c.stroke()
    }
    c.fillStyle = '#edf5ef'; c.fillRect(216, 130, 130, 80)
    c.strokeStyle = '#102e29'; c.lineWidth = 2; c.strokeRect(216, 130, 130, 80)
    for (let i = 0; i < 5; i++) {
      c.fillStyle = phase > 0.12 + i * 0.1 ? '#28694d' : '#cadbd0'
      c.fillRect(231 + i * 22, 153, 12, 12)
    }
    c.fillStyle = '#102e29'; c.fillRect(231, 184, 76, 3)
    c.strokeStyle = '#76998a'; c.lineWidth = 1
    for (const y of [82, 258]) {
      c.beginPath(); c.moveTo(346, 170); c.bezierCurveTo(395, 170, 380, y, 432, y); c.lineTo(505, y); c.stroke()
    }
    c.strokeStyle = '#a33527'; c.lineWidth = 2
    c.strokeRect(438, 70, 66, 24)
    c.strokeStyle = '#28694d'; c.beginPath(); c.moveTo(444, 256); c.lineTo(451, 263); c.lineTo(468, 246); c.stroke()
    if (!quiet && phase > 0.67) {
      const p = (phase - 0.67) / 0.33
      c.fillStyle = '#a33527'; c.fillRect(350 + p * 143, 166 - Math.sin(p * Math.PI / 2) * 88, 8, 8)
    }
    c.restore()
  }
  return <CanvasStage draw={draw} maxDpr={1.5} animate={quiet ? false : undefined} stillTime={7.7} />
}

export function Backdrop({ surface }: StageProps) {
  return <div className="soc-ground" data-surface={surface} />
}
