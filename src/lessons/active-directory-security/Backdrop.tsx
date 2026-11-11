import { useEffect, useMemo, useRef, useState } from 'react'
import type { StageProps } from '../types'
import { CanvasStage, usePointerDrift, type CanvasFrame } from '@/motion'
import { getSlides } from '@/content'
import {
  CABINET,
  DRAWING,
  PULL,
  ROOMS,
  ROUTE,
  polyCut,
  primLength,
  type Prim,
} from './plan'

/* =========================================================================
   BACKDROP — the floor plan, plotted
   =========================================================================
   The plan plots in once, line by line, then holds still as a cached image.
   What moves is the lesson: a red travel line that follows svc_backup
   through the building as the deck advances (and retracts when you go
   back), the DCSync pull from the second workstation, a revision cloud on
   the key cabinet once persistence is taught, and checker's yellow on what
   the practical must not miss — both workstations.
   ========================================================================= */

const VIEW = { x: -7, y: -5, w: 214, h: 130 }
const INK = '40, 32, 118'
const RED = '176, 16, 44'
const HIGHLIGHT = 'rgba(243, 224, 74, 0.55)'
const PLOT_SECONDS = 2.4
const FONT = "'IBM Plex Mono', ui-monospace, monospace"

interface Targets {
  route: number
  pull: number
  cloud: number
  highlight: number
  presence: number
}

function targetsFor(props: StageProps, scroll: number): Targets {
  const { surface, half, session, block, focusMode } = props
  if (surface === 'overview') return { route: 1, pull: 1, cloud: 0, highlight: 0, presence: 0.62 }
  if (half === 'practical') {
    return { route: 1, pull: 1, cloud: 1, highlight: 1, presence: surface === 'present' ? (focusMode ? 0.75 : 0.6) : 0.5 }
  }
  if (surface === 'study') {
    const r = Math.min(1, scroll * 1.35)
    return { route: r, pull: scroll > 0.62 ? 1 : 0, cloud: scroll > 0.72 ? 1 : 0, highlight: 0, presence: 0.5 }
  }
  // Presentation, theory half: the route is staged against the lesson.
  const slides = getSlides(session)
  const at = (id: string) => slides.findIndex((b) => b.id === id)
  const i = props.slideIndex
  const demo = Math.max(1, at('demo'))
  const persistence = at('persistence')
  const route = Math.min(1, Math.max(0, i / demo))
  const isTitle = block?.kind === 'title'
  return {
    route,
    pull: i >= demo ? 1 : 0,
    cloud: persistence >= 0 && i >= persistence ? 1 : 0,
    highlight: 0,
    presence: isTitle ? 1 : focusMode ? 0.78 : 0.6,
  }
}

function drawPrim(ctx: CanvasRenderingContext2D, p: Prim, s: number, frac: number) {
  if (frac <= 0) return
  switch (p.t) {
    case 'line': {
      ctx.lineWidth = Math.max(0.6, p.w * s * 0.5)
      ctx.setLineDash(p.dash ? p.dash.map((d) => d * s) : [])
      ctx.beginPath()
      ctx.moveTo(p.x1 * s, p.y1 * s)
      ctx.lineTo((p.x1 + (p.x2 - p.x1) * frac) * s, (p.y1 + (p.y2 - p.y1) * frac) * s)
      ctx.stroke()
      break
    }
    case 'arc': {
      ctx.lineWidth = Math.max(0.6, p.w * s * 0.5)
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.arc(p.cx * s, p.cy * s, p.r * s, p.a0, p.a0 + (p.a1 - p.a0) * frac)
      ctx.stroke()
      break
    }
    case 'circle': {
      ctx.lineWidth = Math.max(0.6, p.w * s * 0.5)
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.arc(p.cx * s, p.cy * s, p.r * s, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac)
      ctx.stroke()
      break
    }
    case 'text': {
      if (frac < 1) return
      ctx.font = `${p.weight ?? 500} ${p.size * s}px ${FONT}`
      ctx.textAlign = p.align ?? 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(p.s, p.x * s, p.y * s)
      break
    }
  }
}

/** Draws the plan up to `progress` (0–1) of its ink. */
function drawPlan(ctx: CanvasRenderingContext2D, s: number, progress: number, lengths: number[], total: number) {
  ctx.strokeStyle = `rgb(${INK})`
  ctx.fillStyle = `rgb(${INK})`
  let budget = progress * total
  for (let i = 0; i < DRAWING.length; i++) {
    const L = lengths[i]
    if (budget <= 0) break
    drawPrim(ctx, DRAWING[i], s, Math.min(1, budget / L))
    budget -= L
  }
  ctx.setLineDash([])
}

/** A revision cloud: scallops on an ellipse, drawn to fraction `frac`. */
function cloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, frac: number) {
  const n = 14
  const shown = Math.floor(n * frac)
  ctx.beginPath()
  for (let i = 0; i < shown; i++) {
    const a0 = (i / n) * Math.PI * 2
    const a1 = ((i + 1) / n) * Math.PI * 2
    const x0 = cx + Math.cos(a0) * rx
    const y0 = cy + Math.sin(a0) * ry
    const x1 = cx + Math.cos(a1) * rx
    const y1 = cy + Math.sin(a1) * ry
    const mx = (x0 + x1) / 2 + Math.cos((a0 + a1) / 2) * rx * 0.16
    const my = (y0 + y1) / 2 + Math.sin((a0 + a1) / 2) * ry * 0.16
    if (i === 0) ctx.moveTo(x0, y0)
    ctx.quadraticCurveTo(mx, my, x1, y1)
  }
  ctx.stroke()
}

function polyline(ctx: CanvasRenderingContext2D, pts: [number, number][], s: number) {
  ctx.beginPath()
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * s, y * s) : ctx.moveTo(x * s, y * s)))
  ctx.stroke()
}

export default function Backdrop(props: StageProps) {
  const drift = usePointerDrift(0.05)
  const scrollRef = useRef(0)
  const live = useRef<Targets | null>(null)
  const plotStart = useRef<number | null>(null)
  const cache = useRef<{ canvas: HTMLCanvasElement; key: string } | null>(null)
  const [fontsReady, setFontsReady] = useState(false)

  const lengths = useMemo(() => DRAWING.map(primLength), [])
  const total = useMemo(() => lengths.reduce((a, b) => a + b, 0), [lengths])

  useEffect(() => {
    let alive = true
    document.fonts?.ready.then(() => alive && setFontsReady(true))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (props.surface !== 'study') return
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      scrollRef.current = max > 0 ? window.scrollY / max : 0
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [props.surface])

  const target = targetsFor(props, scrollRef.current)
  const propsRef = useRef(props)
  propsRef.current = props

  const draw = ({ ctx, width, height, dt, t, still }: CanvasFrame) => {
    const goal = targetsFor(propsRef.current, scrollRef.current)
    if (!live.current || still) live.current = { ...goal }
    const cur = live.current
    const k = Math.min(1, dt * 2.6)
    cur.route += (goal.route - cur.route) * k
    cur.pull += (goal.pull - cur.pull) * k
    cur.cloud += (goal.cloud - cur.cloud) * Math.min(1, dt * 1.6)
    cur.highlight += (goal.highlight - cur.highlight) * Math.min(1, dt * 1.6)
    cur.presence += (goal.presence - cur.presence) * Math.min(1, dt * 2)

    // Cover the viewport with the drawing, nudged by the pointer like a
    // tracing sheet lying loose on the plan.
    // Cover the viewport, but never past drawing scale: on a tall window the
    // plan stays at its plotted size and sits at the top, rather than
    // ballooning lettering and pencil weight behind the reading column.
    const s = Math.min(Math.max(width / VIEW.w, height / VIEW.h), Math.max(width / VIEW.w, 7.2))
    const ox = (width - VIEW.w * s) / 2 - VIEW.x * s
    const oy = Math.min(0, (height - VIEW.h * s) / 2) - VIEW.y * s
    const d = still ? { x: 0, y: 0 } : drift()

    // Plot progress: the drawing lays itself down once, then is cached.
    if (plotStart.current === null) plotStart.current = t
    const plot = still ? 1 : Math.min(1, (t - plotStart.current) / PLOT_SECONDS)
    const eased = 1 - Math.pow(1 - plot, 3)

    ctx.clearRect(0, 0, width, height)

    const key = `${width}x${height}:${fontsReady}`
    if (plot >= 1 && (!cache.current || cache.current.key !== key)) {
      const c = cache.current?.canvas ?? document.createElement('canvas')
      const dpr = ctx.getTransform().a
      c.width = Math.round(width * dpr)
      c.height = Math.round(height * dpr)
      const cc = c.getContext('2d')!
      cc.setTransform(dpr, 0, 0, dpr, 0, 0)
      cc.clearRect(0, 0, width, height)
      cc.translate(ox, oy)
      drawPlan(cc, s, 1, lengths, total)
      cache.current = { canvas: c, key }
    }

    ctx.save()
    ctx.translate(d.x * -10, d.y * -6)

    // Checker's yellow, laid under the ink like a real highlighter pass.
    if (cur.highlight > 0.01) {
      ctx.save()
      ctx.translate(ox, oy)
      ctx.globalAlpha = Math.min(1, cur.presence + 0.2)
      ctx.fillStyle = HIGHLIGHT
      for (const id of ['ws14', 'ws22']) {
        const r = ROOMS.find((room) => room.id === id)!
        ctx.fillRect((r.x + 2) * s, (r.y + 2) * s, (r.w - 4) * s * cur.highlight, (r.h - 4) * s)
      }
      ctx.restore()
    }

    ctx.globalAlpha = 0.34 * cur.presence
    if (plot >= 1 && cache.current) {
      const dpr = ctx.getTransform().a
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.translate(d.x * -10 * dpr, d.y * -6 * dpr)
      ctx.drawImage(cache.current.canvas, 0, 0)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.translate(d.x * -10, d.y * -6)
    } else {
      ctx.save()
      ctx.translate(ox, oy)
      drawPlan(ctx, s, eased, lengths, total)
      ctx.restore()
    }

    // The route and the pull, in drafting-red pencil.
    ctx.save()
    ctx.translate(ox, oy)
    ctx.globalAlpha = Math.min(1, 0.4 + cur.presence * 0.55) * Math.min(1, plot * 1.4)
    ctx.strokeStyle = `rgb(${RED})`
    ctx.fillStyle = `rgb(${RED})`
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    const lw = Math.max(1.6, s * 0.42)
    if (cur.route > 0.004) {
      const pts = polyCut(ROUTE, cur.route)
      ctx.lineWidth = lw
      ctx.setLineDash([lw * 3.2, lw * 2.2])
      ctx.lineDashOffset = still ? 0 : -t * lw * 5
      polyline(ctx, pts, s)
      ctx.setLineDash([])
      // Arrowhead at the head of the route.
      const [hx, hy] = pts[pts.length - 1]
      const [px, py] = pts[Math.max(0, pts.length - 2)]
      const ang = Math.atan2(hy - py, hx - px) || 0
      ctx.beginPath()
      ctx.moveTo(hx * s + Math.cos(ang) * lw * 2.4, hy * s + Math.sin(ang) * lw * 2.4)
      ctx.lineTo(hx * s + Math.cos(ang + 2.5) * lw * 2.4, hy * s + Math.sin(ang + 2.5) * lw * 2.4)
      ctx.lineTo(hx * s + Math.cos(ang - 2.5) * lw * 2.4, hy * s + Math.sin(ang - 2.5) * lw * 2.4)
      ctx.closePath()
      ctx.fill()
      // Origin mark.
      ctx.beginPath()
      ctx.arc(ROUTE[0][0] * s, ROUTE[0][1] * s, lw * 1.4, 0, Math.PI * 2)
      ctx.stroke()
    }
    if (cur.pull > 0.004) {
      ctx.lineWidth = lw * 0.7
      ctx.setLineDash([lw * 0.8, lw * 1.6])
      ctx.lineDashOffset = still ? 0 : -t * lw * 3
      polyline(ctx, polyCut(PULL, cur.pull), s)
      ctx.setLineDash([])
    }
    if (cur.cloud > 0.01) {
      ctx.lineWidth = Math.max(1.2, s * 0.28)
      cloud(ctx, CABINET.x * s, CABINET.y * s, 11 * s, 8 * s, cur.cloud)
      if (cur.cloud > 0.98) {
        // Revision delta beside the cloud.
        const tx = (CABINET.x - 13) * s
        const ty = (CABINET.y - 7) * s
        const r = 2.4 * s
        ctx.beginPath()
        ctx.moveTo(tx, ty - r)
        ctx.lineTo(tx + r * 0.95, ty + r * 0.6)
        ctx.lineTo(tx - r * 0.95, ty + r * 0.6)
        ctx.closePath()
        ctx.stroke()
        ctx.font = `600 ${1.9 * s}px ${FONT}`
        ctx.textAlign = 'center'
        ctx.fillText('2', tx, ty + r * 0.42)
      }
    }
    ctx.restore()
    ctx.restore()
  }

  // Under reduced motion CanvasStage paints a single still frame, so a new
  // key per lesson state repaints it when the slide changes.
  const stillKey = `${props.surface}:${props.half}:${target.route.toFixed(2)}:${target.pull}:${target.cloud}:${target.highlight}:${target.presence}:${fontsReady}`

  return (
    <CanvasStage
      key={props.reducedMotion ? stillKey : 'live'}
      draw={draw}
      className="adw-backdrop"
      maxDpr={1.5}
    />
  )
}
