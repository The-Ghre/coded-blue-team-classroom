import type { Block } from '@/types/content'
import type { Surface } from '../types'

/* =========================================================================
   LATENT IMAGES
   =========================================================================
   What develops in the tray behind each part of the lesson. Each motif is
   drawn white-on-black into a small offscreen canvas and handed to the
   shader as an exposure map: brighter means more silver once developed.

   The motifs are the lesson's arguments, drawn without words:
     pulse   a timer's roll (48 identical marks, evenly spaced) under a
             person's roll (bursts and long gaps)
     dga     rows of queries that never resolve, and one that does
     volume  kilobyte uploads, then one transfer that dwarfs them
     memory  a process's address space; one region holds a whole binary
     lanes   three evidence lanes that line up on one moment
   ========================================================================= */

export type Motif = 'pulse' | 'dga' | 'volume' | 'memory' | 'lanes'

export const MOTIF_W = 960
export const MOTIF_H = 540

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

export function motifFor(surface: Surface, half: 'theory' | 'practical', block?: Block): Motif {
  if (half === 'practical') return 'lanes'
  if (surface !== 'present' || !block) return 'pulse'
  switch (block.id) {
    case 'dns':
      return 'dga'
    case 'exfil':
      return 'volume'
    case 'volatility':
    case 'malfind':
    case 'check':
    case 'theory-recap':
      return 'memory'
    default:
      return 'pulse'
  }
}

export function drawMotif(ctx: CanvasRenderingContext2D, motif: Motif) {
  const W = MOTIF_W
  const H = MOTIF_H
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#fff'
  const r = rng(motif.length * 7919 + 11)

  switch (motif) {
    case 'pulse': {
      /* The timer's roll: 48 marks, one every four minutes. */
      const n = 48
      const x0 = W * 0.06
      const x1 = W * 0.94
      const y = H * 0.7
      for (let i = 0; i < n; i++) {
        const x = x0 + ((x1 - x0) * i) / (n - 1)
        ctx.globalAlpha = 1
        ctx.fillRect(x - 2.5, y - 26, 5, 26)
      }
      ctx.globalAlpha = 0.5
      ctx.fillRect(x0, y + 4, x1 - x0, 1.5)
      /* The person's roll: bursts, reading, long idle gaps. */
      let x = x0
      const yu = H * 0.38
      while (x < x1) {
        const p = r()
        const gap = p < 0.55 ? 3 + r() * 9 : p < 0.85 ? 20 + r() * 60 : 90 + r() * 160
        const h = 6 + r() * 48
        ctx.globalAlpha = 0.35 + r() * 0.4
        ctx.fillRect(x, yu - h, 3 + r() * 3, h)
        x += gap
      }
      ctx.globalAlpha = 0.35
      ctx.fillRect(x0, yu + 4, x1 - x0, 1.5)
      break
    }
    case 'dga': {
      const rows = 26
      for (let i = 0; i < rows; i++) {
        const y = H * 0.12 + i * ((H * 0.76) / rows)
        const cols = 3
        for (let c = 0; c < cols; c++) {
          const x = W * 0.08 + c * W * 0.3
          const len = 60 + r() * 150
          const resolves = i === 19 && c === 1
          ctx.globalAlpha = resolves ? 1 : 0.22 + r() * 0.12
          ctx.fillRect(x, y, len, resolves ? 7 : 4)
          if (!resolves) {
            /* struck through: NXDOMAIN */
            ctx.globalAlpha = 0.5
            ctx.fillRect(x - 4, y + 1, len + 8, 1)
          }
        }
      }
      break
    }
    case 'volume': {
      const y = H * 0.78
      const n = 60
      for (let i = 0; i < n; i++) {
        const x = W * 0.06 + i * ((W * 0.62) / n)
        const h = 3 + r() * 10
        ctx.globalAlpha = 0.55
        ctx.fillRect(x, y - h, 4, h)
      }
      ctx.globalAlpha = 1
      ctx.fillRect(W * 0.74, H * 0.16, W * 0.16, y - H * 0.16)
      ctx.globalAlpha = 0.4
      ctx.fillRect(W * 0.06, y + 4, W * 0.86, 1.5)
      break
    }
    case 'memory': {
      /* Pages of an address space; mapped pages faint, one region dense. */
      const cols = 36
      const rows = 16
      const cw = (W * 0.84) / cols
      const ch = (H * 0.68) / rows
      const ox = W * 0.08
      const oy = H * 0.16
      for (let row = 0; row < rows; row++) {
        for (let c = 0; c < cols; c++) {
          const mapped = r() < 0.58
          if (!mapped) continue
          const injected = row >= 9 && row <= 10 && c >= 23 && c <= 27
          ctx.globalAlpha = injected ? 1 : 0.16 + r() * 0.16
          ctx.fillRect(ox + c * cw + 1.5, oy + row * ch + 1.5, cw - 3, ch - 3)
        }
      }
      /* the injected region is mapped in full, whatever the dice said */
      ctx.globalAlpha = 1
      for (let row = 9; row <= 10; row++)
        for (let c = 23; c <= 27; c++) ctx.fillRect(ox + c * cw + 1.5, oy + row * ch + 1.5, cw - 3, ch - 3)
      break
    }
    case 'lanes': {
      const lanes = [0.3, 0.5, 0.7]
      const align = W * 0.62
      lanes.forEach((ly, li) => {
        const y = H * ly
        ctx.globalAlpha = 0.35
        ctx.fillRect(W * 0.06, y, W * 0.88, 1.5)
        for (let i = 0; i < 16; i++) {
          const x = W * 0.08 + r() * W * 0.84
          ctx.globalAlpha = 0.3 + r() * 0.3
          ctx.fillRect(x, y - 10 - li * 2, 4, 20)
        }
        ctx.globalAlpha = 1
        ctx.fillRect(align - 3, y - 18, 6, 36)
      })
      ctx.globalAlpha = 0.5
      ctx.fillRect(align - 0.75, H * 0.2, 1.5, H * 0.6)
      break
    }
  }
  ctx.globalAlpha = 1
}
