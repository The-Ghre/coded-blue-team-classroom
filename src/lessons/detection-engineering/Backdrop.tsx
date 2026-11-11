import { useEffect, useMemo, useRef, useState } from 'react'
import type { StageProps } from '../types'
import { useFrameLoop, useIsVisible } from '@/motion'
import { buildChart, flashLevel, type ChartGeometry, type Pt } from './chart'
import { readInk, type ChartInk } from './palette'

/* =========================================================================
   BACKDROP — the coast
   =========================================================================
   A coastal chart the session sails along. On the presentation every slide
   has a light standing on a headland, and the chart pans one reach per
   slide in the direction of travel. On the reading pages the same coast
   drifts gently with scroll. Lights flash their characteristic; one in
   four is an unlit beacon, because a coast is never fully lit.

   Cost: the static chart (fills, contours, soundings) is drawn into an
   offscreen canvas only when the view moves; each frame composites that
   and paints the light flares on top.
   ========================================================================= */

const MAX_DPR = 1.5

function trace(ctx: CanvasRenderingContext2D, pts: Pt[], move = true) {
  pts.forEach((p, i) => (i === 0 && move ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
}

function drawStatic(
  ctx: CanvasRenderingContext2D,
  g: ChartGeometry,
  ink: ChartInk,
  offset: number,
  vw: number,
  vh: number,
) {
  ctx.clearRect(0, 0, vw, vh)
  ctx.save()
  ctx.translate(-offset, 0)

  const left = offset - 40
  const right = offset + vw + 40
  const visible = (pts: Pt[]) => pts.filter((p) => p.x >= left && p.x <= right)

  const coast = visible(g.coast)
  const upper = visible(g.upper)
  const contours = g.contours.map(visible)
  const upperContours = g.upperContours.map(visible)

  // Shoal tints: darkest nearest the shore, the chart's own depth code.
  const band = (outer: Pt[], inner: Pt[], fill: string) => {
    ctx.beginPath()
    trace(ctx, outer)
    trace(ctx, [...inner].reverse(), false)
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (contours[1]?.length && coast.length) band(contours[1], coast, ink.shoal)
  if (contours[0]?.length && coast.length) band(contours[0], coast, ink.shoalDeep)
  if (upperContours[1]?.length && upper.length) band(upper, upperContours[1], ink.shoal)
  if (upperContours[0]?.length && upper.length) band(upper, upperContours[0], ink.shoalDeep)

  // Land.
  ctx.fillStyle = ink.land
  ctx.beginPath()
  trace(ctx, coast)
  ctx.lineTo(right, vh + 10)
  ctx.lineTo(left, vh + 10)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  trace(ctx, upper)
  ctx.lineTo(right, -10)
  ctx.lineTo(left, -10)
  ctx.closePath()
  ctx.fill()

  // Depth contours: fine, blue-grey, the deeper ones dashed.
  ctx.lineWidth = 0.8
  ctx.strokeStyle = ink.contour
  ;[...contours, ...upperContours].forEach((c, k) => {
    ctx.setLineDash(k % 4 >= 2 ? [5, 4] : [])
    ctx.beginPath()
    trace(ctx, c)
    ctx.stroke()
  })
  ctx.setLineDash([])

  // Coastlines.
  ctx.strokeStyle = ink.ink
  ctx.lineWidth = 1.3
  ctx.beginPath()
  trace(ctx, coast)
  ctx.stroke()
  ctx.beginPath()
  trace(ctx, upper)
  ctx.stroke()

  // Islands with a shoal ring.
  g.islands.forEach((isl) => {
    const cx = isl.reduce((s, p) => s + p.x, 0) / isl.length
    if (cx < left - 120 || cx > right + 120) return
    const cy = isl.reduce((s, p) => s + p.y, 0) / isl.length
    ctx.beginPath()
    trace(
      ctx,
      isl.map((p) => ({ x: cx + (p.x - cx) * 1.9, y: cy + (p.y - cy) * 1.9 })),
    )
    ctx.closePath()
    ctx.fillStyle = ink.shoal
    ctx.fill()
    ctx.beginPath()
    trace(ctx, isl)
    ctx.closePath()
    ctx.fillStyle = ink.land
    ctx.fill()
    ctx.strokeStyle = ink.ink
    ctx.lineWidth = 1
    ctx.stroke()
  })

  // Soundings, in the hydrographic italic.
  ctx.fillStyle = ink.inkSoft
  ctx.font = 'italic 10px "IBM Plex Serif", Georgia, serif'
  ctx.textAlign = 'center'
  g.soundings.forEach((s) => {
    if (s.x < left || s.x > right) return
    ctx.fillText(s.d, s.x, s.y)
  })

  // Recommended track: a dashed line down the channel with arrowheads.
  const trackY = g.height * 0.56
  ctx.strokeStyle = ink.inkSoft
  ctx.lineWidth = 1
  ctx.setLineDash([10, 6])
  ctx.beginPath()
  ctx.moveTo(left, trackY)
  ctx.lineTo(right, trackY)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = ink.inkSoft
  for (let x = Math.ceil(left / 420) * 420; x < right; x += 420) {
    ctx.beginPath()
    ctx.moveTo(x + 8, trackY)
    ctx.lineTo(x - 4, trackY - 5)
    ctx.lineTo(x - 4, trackY + 5)
    ctx.closePath()
    ctx.fill()
  }

  // Light structures and their sector arcs (the flares are drawn per frame).
  g.lights.forEach((L) => {
    if (L.x < left - 120 || L.x > right + 120) return
    if (L.group > 0) {
      const sectors: [number, number, string][] = [
        [-0.72, -0.2, ink.port],
        [-0.2, 0.2, ink.ink],
        [0.2, 0.72, ink.stbd],
      ]
      sectors.forEach(([a0, a1, col]) => {
        ctx.strokeStyle = col
        ctx.lineWidth = col === ink.ink ? 1.2 : 3
        ctx.beginPath()
        ctx.arc(L.x, L.y, 54, L.facing + a0, L.facing + a1)
        ctx.stroke()
      })
      ctx.strokeStyle = ink.inkSoft
      ctx.lineWidth = 0.8
      ctx.setLineDash([3, 3])
      ;[-0.72, -0.2, 0.2, 0.72].forEach((a) => {
        ctx.beginPath()
        ctx.moveTo(L.x, L.y)
        ctx.lineTo(L.x + Math.cos(L.facing + a) * 80, L.y + Math.sin(L.facing + a) * 80)
        ctx.stroke()
      })
      ctx.setLineDash([])
    }
    // Light star / beacon symbol.
    ctx.fillStyle = ink.ink
    ctx.strokeStyle = ink.ink
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.arc(L.x, L.y, 3, 0, Math.PI * 2)
    if (L.group > 0) ctx.fill()
    else {
      ctx.fillStyle = ink.paper
      ctx.fill()
      ctx.stroke()
      // Unlit beacon: a small tower outline.
      ctx.beginPath()
      ctx.moveTo(L.x - 4, L.y - 4)
      ctx.lineTo(L.x, L.y - 16)
      ctx.lineTo(L.x + 4, L.y - 4)
      ctx.stroke()
    }
  })

  ctx.restore()
}

function drawFlares(ctx: CanvasRenderingContext2D, g: ChartGeometry, ink: ChartInk, offset: number, vw: number, t: number, still: boolean) {
  ctx.save()
  ctx.translate(-offset, 0)
  g.lights.forEach((L) => {
    if (L.group === 0 || L.x < offset - 60 || L.x > offset + vw + 60) return
    const f = still ? 0.6 : 0.42 + 0.58 * flashLevel(L, t)
    // The chart's light flare: a magenta teardrop leaning off the light.
    const ang = L.facing + 0.55
    const len = 22 + 6 * f
    const tipX = L.x + Math.cos(ang) * len
    const tipY = L.y + Math.sin(ang) * len
    const nx = -Math.sin(ang) * 5.5
    const ny = Math.cos(ang) * 5.5
    ctx.globalAlpha = f
    ctx.fillStyle = ink.magenta
    ctx.beginPath()
    ctx.moveTo(L.x + Math.cos(ang) * 4, L.y + Math.sin(ang) * 4)
    ctx.quadraticCurveTo(L.x + Math.cos(ang) * 16 + nx, L.y + Math.sin(ang) * 16 + ny, tipX, tipY)
    ctx.quadraticCurveTo(L.x + Math.cos(ang) * 16 - nx, L.y + Math.sin(ang) * 16 - ny, L.x + Math.cos(ang) * 4, L.y + Math.sin(ang) * 4)
    ctx.fill()
    ctx.globalAlpha = 1
  })
  ctx.restore()
}

export function Backdrop(props: StageProps) {
  const { surface, slideIndex, slideCount, reducedMotion, focusMode } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const visible = useIsVisible(canvasRef)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [fontsReady, setFontsReady] = useState(0)
  const offscreen = useRef<HTMLCanvasElement | null>(null)
  const state = useRef({ offset: 0, target: 0, drawnOffset: -1, primed: false })

  // Size tracking.
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ro = new ResizeObserver(([e]) => {
      const r = e.contentRect
      setSize({ w: Math.round(r.width), h: Math.round(r.height) })
    })
    ro.observe(c)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    let alive = true
    document.fonts?.ready.then(() => alive && setFontsReady((n) => n + 1))
    return () => {
      alive = false
    }
  }, [])

  const present = surface === 'present'
  const reach = Math.min(Math.max(size.w * 0.24, 180), 380)

  const geometry = useMemo(() => {
    if (!size.w || !size.h) return null
    if (present) {
      const count = Math.max(1, slideCount)
      const width = size.w + (count - 1) * reach + 200
      const stops = Array.from({ length: count }, (_, i) => i * reach + size.w * 0.93)
      return buildChart(width, size.h, stops)
    }
    const width = size.w * 2.4
    const stops = Array.from({ length: 6 }, (_, i) => size.w * (0.7 + i * 0.32))
    return buildChart(width, size.h, stops)
  }, [size.w, size.h, present, slideCount, reach])

  const ink = useMemo(() => readInk(), [geometry, fontsReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // Where the chart should be.
  useEffect(() => {
    if (present) state.current.target = slideIndex * reach
  }, [present, slideIndex, reach])

  useEffect(() => {
    if (present) return
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      state.current.target = (window.scrollY / max) * size.w * 1.1
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [present, size.w])

  const paint = (t: number, still: boolean) => {
    const c = canvasRef.current
    if (!c || !geometry) return
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    const pw = Math.max(1, Math.round(size.w * dpr))
    const ph = Math.max(1, Math.round(size.h * dpr))
    if (c.width !== pw || c.height !== ph) {
      c.width = pw
      c.height = ph
      state.current.drawnOffset = -1
    }
    if (!offscreen.current) offscreen.current = document.createElement('canvas')
    const off = offscreen.current
    if (off.width !== pw || off.height !== ph) {
      off.width = pw
      off.height = ph
      state.current.drawnOffset = -1
    }
    const s = state.current
    // The first frame lands where the deck already is; only travel animates.
    if (still || !s.primed) {
      s.offset = s.target
      s.primed = true
    }
    else if (s.offset !== s.target) {
      // Critically damped approach: a ship's pace, not a swipe.
      s.offset += (s.target - s.offset) * 0.075
      if (Math.abs(s.target - s.offset) < 0.2) s.offset = s.target
    }
    if (Math.abs(s.drawnOffset - s.offset) > 0.15) {
      const octx = off.getContext('2d')!
      octx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawStatic(octx, geometry, ink, s.offset, size.w, size.h)
      s.drawnOffset = s.offset
    }
    const ctx = c.getContext('2d')!
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, pw, ph)
    ctx.drawImage(off, 0, 0)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawFlares(ctx, geometry, ink, s.offset, size.w, t, still)
  }

  const animate = !reducedMotion
  useFrameLoop((t) => paint(t, false), animate && visible && !!geometry)

  // Reduced motion (or before the loop starts): one composed still frame,
  // redrawn whenever the view should change.
  useEffect(() => {
    if (animate) return
    state.current.drawnOffset = -1
    paint(0, true)
    if (present) return
    const onScroll = () => paint(0, true)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    state.current.drawnOffset = -1
  }, [geometry, ink])

  return (
    <canvas
      ref={canvasRef}
      className="de-backdrop"
      data-surface={surface}
      data-focus={focusMode || undefined}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  )
}
