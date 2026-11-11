import { useCallback, useEffect, useRef } from 'react'
import type { StageProps } from '../types'
import { useFrameLoop, useIsVisible, usePointerDrift } from '@/motion'
import { CHECK_DOTS, OVAL, PERF_R, ROSETTES, STAMP_H, STAMP_W, TICK_PATH, perfHoles } from './art'

/* =========================================================================
   BACKDROP — the sheet under the lamp
   =========================================================================
   A sheet of twenty numeral-09 stamps lies on the black stockbook page.
   In the dark it is barely there: dull paper, faint engraving. A UV lamp
   pools light on one position, and only there does the paper fluoresce
   and the two phosphor bands of each stamp show.

   In presentation, each slide is a position on the sheet. Moving through
   the deck slides the sheet under the lamp, and every position already
   examined keeps a pencil tick — the record of looking, whatever was found.
   The variety (inverted centre, phosphor omitted) sits at the position of
   the stack-counting slide: the long tail.

   On study and overview pages the sheet rests to the right and the lamp
   drifts with the pointer. Under reduced motion every surface draws one
   composed still frame, redrawn only when the slide changes.

   Cost per frame: three drawImage calls from two cached sheet renders,
   one radial mask and a handful of ticks.
   ========================================================================= */

const COLS = 5
const ROWS = 4
const SELV = { left: 30, top: 34, right: 16, bottom: 20 }
const MAX_DPR = 1.5
const HOLES = perfHoles()
const ROSETTE_PATHS = typeof Path2D !== 'undefined' ? ROSETTES.map((d) => new Path2D(d)) : []
const TICK = typeof Path2D !== 'undefined' ? new Path2D(TICK_PATH) : null

interface Look {
  paper: string
  ink: string
  hole: string
  numeral: string
  band: string | null
  dots: number
  text: string
}

const DARK: Look = {
  paper: '#141210',
  ink: '#1e1b17',
  hole: '#0f0e0c',
  numeral: '#1d1a16',
  band: null,
  dots: 0.2,
  text: '#2e2a23',
}

const LIT: Look = {
  paper: '#1c1b15',
  ink: '#2d2b22',
  hole: '#0f0e0c',
  numeral: '#27261d',
  band: 'rgba(216, 240, 122, 0.06)',
  dots: 0.65,
  text: '#4f4a3c',
}

function renderSheet(look: Look, scale: number, variety: number): HTMLCanvasElement {
  const w = SELV.left + COLS * STAMP_W + SELV.right
  const h = SELV.top + ROWS * STAMP_H + SELV.bottom
  const c = document.createElement('canvas')
  c.width = Math.ceil(w * scale)
  c.height = Math.ceil(h * scale)
  const g = c.getContext('2d')
  if (!g) return c
  g.scale(scale, scale)

  // Selvage paper
  g.fillStyle = look.paper
  g.fillRect(0, 0, w, h)

  // Selvage inscriptions
  g.fillStyle = look.text
  g.font = '600 11px "IBM Plex Sans Condensed", "IBM Plex Sans", sans-serif'
  g.textBaseline = 'alphabetic'
  g.fillText('PLATE 9', SELV.left, 20)
  g.font = '500 9px "IBM Plex Mono", monospace'
  g.textAlign = 'center'
  for (let col = 0; col < COLS; col++)
    g.fillText(String(col + 1), SELV.left + col * STAMP_W + STAMP_W / 2, SELV.top - 8)
  for (let row = 0; row < ROWS; row++)
    g.fillText(String(row + 1), SELV.left - 13, SELV.top + row * STAMP_H + STAMP_H / 2 + 3)
  g.textAlign = 'left'
  g.globalAlpha = look.dots
  CHECK_DOTS.forEach((col, i) => {
    g.fillStyle = col
    g.beginPath()
    g.arc(w - SELV.right - 8 - i * 15, 16, 4.6, 0, Math.PI * 2)
    g.fill()
  })
  g.globalAlpha = 1

  for (let i = 0; i < COLS * ROWS; i++) {
    const x = SELV.left + (i % COLS) * STAMP_W
    const y = SELV.top + Math.floor(i / COLS) * STAMP_H
    const isV = i === variety
    g.save()
    g.translate(x, y)

    // Engraved line ground
    g.strokeStyle = look.ink
    g.lineWidth = 0.5
    g.beginPath()
    for (let yy = 10; yy < 111; yy += 1.9) {
      g.moveTo(9, yy)
      g.lineTo(91, yy)
    }
    g.stroke()
    g.lineWidth = 1.3
    g.strokeRect(9, 9, 82, 102)
    g.fillStyle = look.ink
    g.fillRect(9, 9, 82, 13)
    g.fillRect(9, 98, 82, 13)

    // Phosphor bands — present on every stamp but the variety
    if (look.band && !isV) {
      g.fillStyle = look.band
      g.fillRect(24, 0, 7, STAMP_H)
      g.fillRect(69, 0, 7, STAMP_H)
    }

    // Vignette, inverted on the variety
    g.save()
    if (isV) {
      g.translate(OVAL.cx, OVAL.cy)
      g.rotate(Math.PI)
      g.translate(-OVAL.cx, -OVAL.cy)
    }
    g.fillStyle = look.paper
    g.beginPath()
    g.ellipse(OVAL.cx, OVAL.cy, OVAL.rx, OVAL.ry, 0, 0, Math.PI * 2)
    g.fill()
    g.lineWidth = 0.9
    g.stroke()
    g.lineWidth = 0.45
    ROSETTE_PATHS.forEach((p) => g.stroke(p))
    g.fillStyle = look.numeral
    g.font = '600 44px "IBM Plex Serif", Georgia, serif'
    g.textAlign = 'center'
    g.fillText('9', OVAL.cx, OVAL.cy + 15)
    g.textAlign = 'left'
    g.restore()

    g.restore()
  }

  // Perforations: punched through to the stockbook beneath
  g.fillStyle = look.hole
  for (let i = 0; i < COLS * ROWS; i++) {
    const x = SELV.left + (i % COLS) * STAMP_W
    const y = SELV.top + Math.floor(i / COLS) * STAMP_H
    for (const [hx, hy] of HOLES) {
      g.beginPath()
      g.arc(x + hx, y + hy, PERF_R, 0, Math.PI * 2)
      g.fill()
    }
  }
  return c
}

interface Layout {
  cell: number // CSS px per stamp unit
  lampX: number
  lampY: number
  lampR: number
  angle: number
  restX: number
  restY: number
}

function layoutFor(surface: StageProps['surface'], w: number, h: number): Layout {
  if (surface === 'present') {
    const stampPx = Math.max(96, Math.min(w * 0.125, h * 0.2))
    return {
      cell: stampPx / STAMP_W,
      lampX: w * (w < 700 ? 0.62 : 0.72),
      lampY: h * 0.58,
      lampR: stampPx * 1.05,
      angle: -0.07,
      restX: 0,
      restY: 0,
    }
  }
  const stampPx = Math.max(84, Math.min(w * 0.09, 132))
  return {
    cell: stampPx / STAMP_W,
    lampX: w * (w < 700 ? 0.7 : 0.8),
    lampY: h * 0.42,
    lampR: stampPx * 1.5,
    angle: -0.09,
    restX: w * (w < 700 ? 0.52 : 0.66),
    restY: h * 0.08,
  }
}

export function Backdrop(props: StageProps) {
  const { surface, slideIndex, reducedMotion, focusMode, session } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const visible = useIsVisible(canvasRef)
  const drift = usePointerDrift(0.035)

  const sheets = useRef<{
    dark: HTMLCanvasElement
    lit: HTMLCanvasElement
    scale: number
  } | null>(null)
  const lampBuf = useRef<HTMLCanvasElement | null>(null)
  const size = useRef({ w: 0, h: 0, dpr: 1 })
  const offset = useRef<{ x: number; y: number } | null>(null)
  const glow = useRef(focusMode ? 1 : 0.78)

  // The variety sits at the stack-counting slide's position.
  const slides = [...session.theory.blocks, ...session.practical.blocks]
  const varietyAt = slides.findIndex((b) => b.id === 'baseline')
  const variety = varietyAt >= 0 && varietyAt < COLS * ROWS ? varietyAt : 6

  const position = surface === 'present' ? Math.min(slideIndex, COLS * ROWS - 1) : -1

  const target = useCallback(
    (L: Layout) => {
      if (position < 0) return { x: L.restX, y: L.restY }
      const cx = SELV.left + (position % COLS) * STAMP_W + STAMP_W / 2
      const cy = SELV.top + Math.floor(position / COLS) * STAMP_H + STAMP_H / 2
      // Rotate the cell centre by the sheet angle, then place it under the lamp.
      const s = L.cell
      const rx = (cx * Math.cos(L.angle) - cy * Math.sin(L.angle)) * s
      const ry = (cx * Math.sin(L.angle) + cy * Math.cos(L.angle)) * s
      return { x: L.lampX - rx, y: L.lampY - ry }
    },
    [position],
  )

  const ensureSheets = useCallback(
    (cell: number, dpr: number) => {
      const scale = Math.min(cell * dpr, 3)
      if (sheets.current && Math.abs(sheets.current.scale - scale) < 0.01) return
      sheets.current = {
        dark: renderSheet(DARK, scale, variety),
        lit: renderSheet(LIT, scale, variety),
        scale,
      }
    },
    [variety],
  )

  const draw = useCallback(
    (t: number, dt: number) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      const { w, h, dpr } = size.current
      if (!w || !h) return
      const L = layoutFor(surface, w, h)
      ensureSheets(L.cell, dpr)
      const sh = sheets.current
      if (!sh) return

      const goal = target(L)
      if (!offset.current || dt === 0) offset.current = { ...goal }
      else {
        const k = 1 - Math.exp(-dt * 4.2)
        offset.current.x += (goal.x - offset.current.x) * k
        offset.current.y += (goal.y - offset.current.y) * k
      }
      const glowGoal = focusMode ? 1 : 0.78
      glow.current += (glowGoal - glow.current) * (dt === 0 ? 1 : 1 - Math.exp(-dt * 2))

      const p = dt === 0 ? { x: 0, y: 0 } : drift()
      const ox = offset.current.x + p.x * 10
      const oy = offset.current.y + p.y * 8
      const sheetW = sh.dark.width / sh.scale
      const sheetH = sh.dark.height / sh.scale

      const place = (g: CanvasRenderingContext2D) => {
        g.translate(ox, oy)
        g.rotate(L.angle)
        g.scale(L.cell, L.cell)
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // Soft shadow of the sheet on the stockbook page
      ctx.save()
      place(ctx)
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)'
      ctx.shadowBlur = 30
      ctx.shadowOffsetY = 12
      ctx.drawImage(sh.dark, 0, 0, sheetW, sheetH)
      ctx.restore()

      // Pencil ticks on every examined position
      if (TICK && position > 0) {
        ctx.save()
        place(ctx)
        ctx.strokeStyle = 'rgba(143, 134, 118, 0.32)'
        ctx.lineWidth = 1.4
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        for (let i = 0; i < position; i++) {
          ctx.save()
          ctx.translate(SELV.left + (i % COLS) * STAMP_W, SELV.top + Math.floor(i / COLS) * STAMP_H)
          ctx.stroke(TICK)
          ctx.restore()
        }
        ctx.restore()
      }

      // The lamp: the lit sheet, masked to a pool of light
      const lampX = position < 0 ? L.lampX + p.x * w * 0.12 : L.lampX
      const lampY = position < 0 ? L.lampY + p.y * h * 0.1 : L.lampY
      const breathe = reducedMotion || dt === 0 ? 1 : 1 + Math.sin(t * 0.7) * 0.025
      const R = L.lampR * breathe * (0.92 + glow.current * 0.12)
      const size2 = Math.ceil(R * 2 * dpr)
      if (!lampBuf.current) lampBuf.current = document.createElement('canvas')
      const lb = lampBuf.current
      if (lb.width !== size2 || lb.height !== size2) {
        lb.width = size2
        lb.height = size2
      }
      const lg = lb.getContext('2d')
      if (!lg) return
      lg.setTransform(1, 0, 0, 1, 0, 0)
      lg.globalCompositeOperation = 'source-over'
      lg.clearRect(0, 0, size2, size2)
      lg.setTransform(dpr, 0, 0, dpr, -(lampX - R) * dpr, -(lampY - R) * dpr)
      lg.save()
      place(lg)
      lg.drawImage(sh.lit, 0, 0, sheetW, sheetH)
      lg.restore()
      lg.setTransform(1, 0, 0, 1, 0, 0)
      lg.globalCompositeOperation = 'destination-in'
      const grad = lg.createRadialGradient(size2 / 2, size2 / 2, 0, size2 / 2, size2 / 2, size2 / 2)
      grad.addColorStop(0, `rgba(0,0,0,${glow.current})`)
      grad.addColorStop(0.55, `rgba(0,0,0,${glow.current * 0.7})`)
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      lg.fillStyle = grad
      lg.fillRect(0, 0, size2, size2)
      ctx.drawImage(lb, lampX - R, lampY - R, R * 2, R * 2)
    },
    [surface, ensureSheets, target, focusMode, position, reducedMotion, drift],
  )

  const drawRef = useRef(draw)
  drawRef.current = draw

  // Size the canvas; refresh the cached sheets when the fonts arrive.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      size.current = { w: rect.width, h: rect.height, dpr }
      sheets.current = null
      drawRef.current(2, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    let alive = true
    document.fonts?.ready.then(() => {
      if (!alive) return
      sheets.current = null
      drawRef.current(2, 0)
    })
    return () => {
      alive = false
      ro.disconnect()
    }
  }, [])

  // Reduced motion: one composed frame per change, nothing moves on its own.
  useEffect(() => {
    if (reducedMotion) drawRef.current(2, 0)
  }, [reducedMotion, slideIndex, focusMode, surface])

  useFrameLoop((t, dt) => drawRef.current(t, Math.max(dt, 1e-4)), !reducedMotion && visible)

  return <canvas ref={canvasRef} className="th-backdrop" />
}
