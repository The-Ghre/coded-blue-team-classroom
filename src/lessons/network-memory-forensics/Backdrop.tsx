import { useEffect, useRef } from 'react'
import type { StageProps } from '../types'
import type { Block } from '@/types/content'
import { useFrameLoop, useIsVisible } from '@/motion'
import { rng } from './parts'

/* =========================================================================
   THE MECHANISM
   =========================================================================
   Behind every surface of this lesson a pinned cylinder turns under one
   raking lamp. Each pin that reaches the comb plucks a tooth, which
   trembles and settles. What is pinned is the slide's argument, set
   without words:

     pulse   one tooth plucked on a fixed beat (one destination, a timer),
             the rest plucked irregularly by a person (many destinations)
     dga     tooth after tooth plucked and damped silent, then one rings
     volume  scattered plucks, then one tooth trilled for a long run
     memory  the drum slows to a stop and the lamp finds a cluster of pins
             in blued steel that no score contains
     lanes   three groups of teeth that strike together at one moment

   The mechanism keeps to a strip along the foot of the slide, which the
   stage reserves as padding, so it never sits under a line of text. On
   reading pages the room is the lamp alone: the cylinder appears there as
   the page header's band, not behind the prose.

   Plain 2D canvas, a capped pixel ratio, paused when hidden, and one
   composed still under reduced motion.
   ========================================================================= */

type Motif = 'pulse' | 'dga' | 'volume' | 'memory' | 'lanes'

function motifFor(surface: StageProps['surface'], half: StageProps['half'], block?: Block): Motif {
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

interface DrumPin {
  tooth: number
  angle: number
  kind: 'beacon' | 'human' | 'damped' | 'ring' | 'inject'
}

const TEETH = 44
const TAU = Math.PI * 2
const PLUCK_AT = 1.32 // drum angle (rad from the front) where the comb catches a pin

function pinsFor(motif: Motif): DrumPin[] {
  const r = rng(motif.length * 977 + 3)
  const pins: DrumPin[] = []
  const human = (count: number, avoid: number[] = []) => {
    for (let i = 0; i < count; i++) {
      let tooth = Math.floor(r() * TEETH)
      if (avoid.includes(tooth)) tooth = (tooth + 3) % TEETH
      pins.push({ tooth, angle: r() * TAU, kind: 'human' })
    }
  }
  switch (motif) {
    case 'pulse':
      for (let i = 0; i < 12; i++) pins.push({ tooth: 27, angle: (i / 12) * TAU, kind: 'beacon' })
      human(46, [27])
      break
    case 'dga':
      for (let i = 0; i < 60; i++) pins.push({ tooth: Math.floor(r() * TEETH), angle: r() * TAU, kind: 'damped' })
      pins.push({ tooth: 31, angle: 0.4, kind: 'ring' })
      break
    case 'volume':
      human(30, [12])
      for (let i = 0; i < 26; i++) pins.push({ tooth: 12, angle: 1.2 + i * 0.09, kind: 'beacon' })
      break
    case 'memory':
      for (let t = 0; t < TEETH; t++)
        for (let k = 0; k < 18; k++) if (r() < 0.32) pins.push({ tooth: t, angle: (k / 18) * TAU, kind: 'human' })
      for (let t = 29; t <= 33; t++)
        for (let k = 0; k < 3; k++) pins.push({ tooth: t, angle: -0.3 + k * 0.17, kind: 'inject' })
      break
    case 'lanes':
      for (const g of [6, 22, 38]) {
        for (let i = 0; i < 9; i++) pins.push({ tooth: g - 2 + Math.floor(r() * 5), angle: r() * TAU, kind: 'human' })
        pins.push({ tooth: g, angle: 0.9, kind: 'beacon' })
      }
      break
  }
  return pins
}

interface Mech {
  w: number
  h: number
  dpr: number
  angle: number
  speed: number
  pins: DrumPin[]
  motif: Motif
  amp: Float32Array
  sweepAt: number
  sweepDir: number
  t: number
}

export function Backdrop({ surface, half, block, slideIndex, direction, focusMode, reducedMotion }: StageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layerRef = useRef<HTMLCanvasElement | null>(null)
  const visible = useIsVisible(canvasRef)
  const motif = motifFor(surface, half, block)
  const page = surface !== 'present'
  const focusRef = useRef(focusMode)
  focusRef.current = focusMode

  const state = useRef<Mech>({
    w: 0,
    h: 0,
    dpr: 1,
    angle: 0.6,
    speed: 0.16,
    pins: pinsFor(motif),
    motif,
    amp: new Float32Array(TEETH),
    sweepAt: -10,
    sweepDir: 1,
    t: 0,
  })

  function draw(dt: number, still: boolean) {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const s = state.current
    const { w, h, dpr } = s
    if (!w || !h) return

    /* ---- advance ---- */
    const target = still || s.motif === 'memory' ? 0 : focusRef.current ? 0.22 : 0.16
    s.speed += (target - s.speed) * Math.min(1, dt * 1.4)
    const prev = s.angle
    if (still && s.motif === 'memory') s.angle = 0.42
    if (!still) {
      s.angle += s.speed * dt
      for (const p of s.pins) {
        const a0 = (((p.angle + prev) % TAU) + TAU) % TAU
        const a1 = (((p.angle + s.angle) % TAU) + TAU) % TAU
        if (a0 < PLUCK_AT && a1 >= PLUCK_AT) {
          s.amp[p.tooth] = p.kind === 'damped' ? 0.12 : p.kind === 'ring' ? 1.4 : p.kind === 'beacon' ? 1 : 0.7
        }
      }
      const g = (s.t - s.sweepAt) / 0.55
      if (g >= 0 && g <= 1) {
        const k = Math.floor(g * TEETH)
        const tooth = s.sweepDir > 0 ? k : TEETH - 1 - k
        if (tooth >= 0 && tooth < TEETH && s.amp[tooth] < 0.5) s.amp[tooth] = 0.55
      }
      for (let i = 0; i < TEETH; i++) s.amp[i] *= Math.exp(-dt * 2.4)
    }

    /* ---- the room ---- */
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#0b0c0f'
    ctx.fillRect(0, 0, w, h)
    const lamp = ctx.createRadialGradient(w * 0.12, -h * 0.25, 0, w * 0.12, -h * 0.25, Math.max(w, h) * 1.1)
    lamp.addColorStop(0, 'rgba(214, 222, 236, 0.11)')
    lamp.addColorStop(1, 'rgba(214, 222, 236, 0)')
    ctx.fillStyle = lamp
    ctx.fillRect(0, 0, w, h)

    /* A reading page: the lamp alone. */
    if (page) return

    /* ---- the mechanism, on its own layer ---- */
    let layer = layerRef.current
    if (!layer) {
      layer = document.createElement('canvas')
      layerRef.current = layer
    }
    if (layer.width !== canvas.width || layer.height !== canvas.height) {
      layer.width = canvas.width
      layer.height = canvas.height
    }
    const lc = layer.getContext('2d')
    if (!lc) return
    lc.setTransform(1, 0, 0, 1, 0, 0)
    lc.clearRect(0, 0, layer.width, layer.height)
    lc.setTransform(dpr, 0, 0, dpr, 0, 0)
    lc.filter = 'none'
    paintMechanism(lc, w, h, s, still)
    lc.setTransform(dpr, 0, 0, dpr, 0, 0)

    /* the strip's upper edge falls off into the room */
    lc.setTransform(dpr, 0, 0, dpr, 0, 0)
    lc.globalCompositeOperation = 'destination-in'
    const fade = lc.createLinearGradient(0, h - stripHeight(h) - 34, 0, h - stripHeight(h) - 4)
    fade.addColorStop(0, 'rgba(0,0,0,0)')
    fade.addColorStop(1, 'rgba(0,0,0,1)')
    lc.fillStyle = fade
    lc.fillRect(0, 0, w, h)
    lc.globalCompositeOperation = 'source-over'
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.drawImage(layer, 0, 0)
  }

  /* New argument: re-pin the drum. */
  useEffect(() => {
    const s = state.current
    if (s.motif !== motif) {
      s.motif = motif
      s.pins = pinsFor(motif)
      s.amp.fill(0)
      /* Opening the lid: the drum coasts to a stop with the blued cluster
         facing the lamp. */
      if (motif === 'memory') s.angle = reducedMotion ? 0.42 : 0.3
    }
    if (reducedMotion) draw(0, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motif])

  /* Each slide change runs a glissando across the comb, in the direction of travel. */
  useEffect(() => {
    if (direction === 0) return
    const s = state.current
    s.sweepAt = s.t
    s.sweepDir = direction
  }, [slideIndex, direction])

  /* Size. */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      const s = state.current
      s.w = rect.width
      s.h = rect.height
      s.dpr = dpr
      draw(0, reducedMotion)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion])

  useFrameLoop((t, dt) => {
    state.current.t = t
    draw(dt, false)
  }, !reducedMotion && visible)

  return <canvas ref={canvasRef} className={`nmf-mech nmf-mech--${surface}`} />
}

/* ---------------------------------------------------------------------------
   The drum and comb, in a frame w×h with the drum lying along the bottom
   --------------------------------------------------------------------------- */

/** Height of the strip the mechanism occupies at the foot of the frame. */
export function stripHeight(h: number) {
  const R = drumRadius(h)
  return R * 1.27 + 9
}

function drumRadius(h: number) {
  return Math.min(h * 0.11, 96)
}

function paintMechanism(c: CanvasRenderingContext2D, w: number, h: number, s: Mech, still: boolean) {
  const R = drumRadius(h)
  const cy = h + R * 0.18
  const x0 = w * 0.04
  const x1 = w * 0.96
  const pitch = (x1 - x0) / (TEETH - 1)
  const xs = (i: number) => x0 + i * pitch

  /* the drum, shaded by its own curvature in bands */
  const bands = 24
  for (let b = 0; b < bands; b++) {
    const a0 = -Math.PI / 2 + (b / bands) * Math.PI
    const a1 = -Math.PI / 2 + ((b + 1) / bands) * Math.PI
    const y0 = cy - R * Math.sin(a1)
    const y1 = cy - R * Math.sin(a0)
    const light = Math.pow(Math.max(0, Math.cos((a0 + a1) / 2 - 0.35)), 2)
    const v = Math.round(16 + light * 34)
    c.fillStyle = `rgb(${v}, ${v + 3}, ${v + 9})`
    c.fillRect(x0 - pitch, y0, x1 - x0 + pitch * 2, y1 - y0 + 0.5)
  }

  /* pins on the visible face */
  for (const p of s.pins) {
    const a = (((p.angle + s.angle) % TAU) + TAU) % TAU
    const phi = a > Math.PI ? a - TAU : a
    if (Math.abs(phi) >= Math.PI / 2) continue
    const y = cy - R * Math.sin(phi)
    const face = Math.cos(phi)
    const size = (p.kind === 'human' ? 2.2 : 3.2) * (0.55 + 0.45 * face)
    let col: string
    switch (p.kind) {
      case 'beacon':
        col = `rgba(236, 240, 246, ${0.5 + 0.5 * face})`
        break
      case 'ring':
      case 'inject':
        col = `rgba(138, 162, 255, ${0.55 + 0.45 * face})`
        break
      case 'damped':
        col = `rgba(160, 166, 176, ${0.16 + 0.18 * face})`
        break
      default:
        col = `rgba(190, 196, 206, ${0.2 + 0.28 * face})`
    }
    c.fillStyle = col
    c.beginPath()
    c.ellipse(xs(p.tooth), y, size, size * (0.45 + 0.55 * face), 0, 0, TAU)
    c.fill()
  }

  /* the comb: a steel bar with one tuned tooth per column, plucked at the crown */
  const barY = cy - R - R * 0.45
  const tipY = cy - R * Math.sin(PLUCK_AT) - 2
  c.fillStyle = 'rgba(110, 117, 127, 0.35)'
  c.fillRect(x0 - pitch, barY - 9, x1 - x0 + pitch * 2, 9)
  c.lineCap = 'round'
  c.lineWidth = Math.max(1, Math.min(4, pitch * 0.14))
  for (let i = 0; i < TEETH; i++) {
    const len = tipY - barY
    const tune = 0.86 + 0.14 * Math.sin(i * 0.7)
    const sway = still ? 0 : s.amp[i] * Math.sin(s.t * (38 - i * 0.4)) * 3.2
    const lit = Math.min(1, s.amp[i])
    c.strokeStyle = `rgba(${Math.round(150 + lit * 90)}, ${Math.round(157 + lit * 85)}, ${Math.round(
      170 + lit * 80,
    )}, ${0.22 + lit * 0.6})`
    c.beginPath()
    c.moveTo(xs(i), barY)
    c.quadraticCurveTo(xs(i), barY + len * 0.6, xs(i) + sway, barY + len * tune)
    c.stroke()
  }
}
