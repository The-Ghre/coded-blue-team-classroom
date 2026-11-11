import { useEffect, useMemo, useRef } from 'react'
import type { StageProps } from '../types'
import { useFrameLoop, useIsVisible } from '@/motion'
import {
  clockForSlide,
  formatClock,
  graphWindow,
  scheduledTraffic,
  sessionRoute,
  stationOffsets,
  type Route,
  type Run,
} from './graph'

/* =========================================================================
   BACKDROP — the working graph
   =========================================================================
   The scheduled lattice and the minute ruling are painted once into an
   offscreen canvas per resize. Each frame only blits that sheet and draws
   what moves: the now-line, the position of every run where it crosses
   the now-line, and the unscheduled route up to the present moment.

   Presentation: the clock follows the slide (see clockForSlide) and the
   route plunges on the demo slide. Study and overview: the clock follows
   reading progress down the page. Practical half: no route is drawn — the
   workshop is the student's to reconstruct.
   ========================================================================= */

interface Inks {
  rule: string
  ruleStrong: string
  graphite: string
  vermilion: string
  sheet: string
}

function readInks(): Inks {
  const cs = getComputedStyle(document.documentElement)
  const v = (n: string, f: string) => cs.getPropertyValue(n).trim() || f
  return {
    rule: v('--la-rule', '#5e8a6a'),
    ruleStrong: v('--la-rule-strong', '#2f6a49'),
    graphite: v('--la-graphite', '#121a16'),
    vermilion: v('--la-vermilion', '#d23b1e'),
    sheet: v('--bg', '#e2ebdd'),
  }
}

interface Geometry {
  w: number
  h: number
  x0: number
  x1: number
  y0: number
  y1: number
  labels: boolean
}

function geometry(w: number, h: number, surface: StageProps['surface']): Geometry {
  if (surface === 'present') {
    const narrow = w < 720
    return {
      w,
      h,
      x0: narrow ? 16 : Math.min(176, w * 0.13),
      x1: w - (narrow ? 12 : 28),
      y0: narrow ? 92 : 104,
      y1: h - (narrow ? 110 : 132),
      labels: !narrow,
    }
  }
  return { w, h, x0: 0, x1: w, y0: h * 0.06, y1: h * 0.94, labels: false }
}

export default function Backdrop(props: StageProps) {
  const { surface, session, slideIndex, half, focusMode, reducedMotion } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sheetRef = useRef<HTMLCanvasElement | null>(null)
  const geoRef = useRef<Geometry | null>(null)
  const inksRef = useRef<Inks | null>(null)
  const visible = useIsVisible(canvasRef)

  const route = useMemo(() => sessionRoute(session), [session])
  const [tStart, tEnd] = useMemo<[number, number]>(
    () => (route ? graphWindow(route) : [0, 600]),
    [route],
  )
  const runs = useMemo<Run[]>(
    () => (route ? scheduledTraffic(route.stations.length, tStart, tEnd) : []),
    [route, tStart, tEnd],
  )
  const offsets = useMemo(() => stationOffsets(route?.stations.length ?? 2), [route])

  /* Where the clock should stand right now. */
  const target = useRef(route ? route.start : 0)
  const clock = useRef(target.current)
  const velocity = useRef(0)
  const dirty = useRef(true)
  const drift = useRef(0)
  const presence = useRef(focusMode ? 1 : 0)

  const showRoute = half === 'theory' && !!route

  useEffect(() => {
    if (!route) return
    if (surface === 'present') {
      target.current = clockForSlide(route, session.theory.blocks, slideIndex)
      if (half === 'practical') target.current = tEnd - 4
      // Fold the in-slide creep into the clock so it never jumps back.
      clock.current += drift.current
      drift.current = 0
      dirty.current = true
    }
  }, [route, surface, slideIndex, half, session, tEnd])

  /* Study and overview: reading progress is the clock. */
  useEffect(() => {
    if (!route || surface === 'present') return
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      target.current = reducedMotion ? route.end + 10 : tStart + 30 + p * (tEnd - tStart - 40)
      dirty.current = true
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [route, surface, reducedMotion, tStart, tEnd])

  useEffect(() => {
    dirty.current = true
  }, [focusMode])

  /* ---------------- coordinate helpers ---------------- */
  const xOf = (t: number, g: Geometry) => g.x0 + ((t - tStart) / (tEnd - tStart)) * (g.x1 - g.x0)
  const yOf = (s: number, g: Geometry) => g.y0 + offsets[s] * (g.y1 - g.y0)

  /* ---------------- the static sheet ---------------- */
  function paintSheet(g: Geometry, dpr: number) {
    if (!route) return
    const inks = (inksRef.current = readInks())
    const sheet = sheetRef.current ?? document.createElement('canvas')
    sheetRef.current = sheet
    sheet.width = Math.round(g.w * dpr)
    sheet.height = Math.round(g.h * dpr)
    const ctx = sheet.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, g.w, g.h)
    const present = surface === 'present'

    /* Ruling: a hairline every ten seconds, a stronger rule every minute. */
    for (let t = Math.ceil(tStart / 10) * 10; t <= tEnd; t += 10) {
      const x = Math.round(xOf(t, g)) + 0.5
      const minute = t % 60 === 0
      ctx.strokeStyle = minute ? inks.ruleStrong : inks.rule
      ctx.globalAlpha = minute ? (present ? 0.3 : 0.2) : present ? 0.14 : 0.08
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, g.y0 - (minute ? 14 : 6))
      ctx.lineTo(x, g.y1 + (minute ? 14 : 0))
      ctx.stroke()
      if (minute && present && g.labels) {
        ctx.globalAlpha = 0.62
        ctx.fillStyle = inks.ruleStrong
        ctx.font = '500 11px "IBM Plex Mono", monospace'
        ctx.textAlign = 'center'
        ctx.fillText(formatClock(t, false), x, g.y0 - 22)
      }
    }

    /* Station lines. */
    route.stations.forEach((st, i) => {
      const y = Math.round(yOf(i, g)) + 0.5
      ctx.globalAlpha = present ? 0.34 : 0.18
      ctx.strokeStyle = inks.ruleStrong
      ctx.setLineDash(st.derived ? [2, 4] : [])
      ctx.beginPath()
      ctx.moveTo(g.x0 - (g.labels ? 10 : 0), y)
      ctx.lineTo(g.x1, y)
      ctx.stroke()
      ctx.setLineDash([])
      if (g.labels) {
        ctx.globalAlpha = 0.7
        ctx.fillStyle = inks.graphite
        ctx.font = '600 11px "IBM Plex Sans Condensed", sans-serif'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        ctx.fillText(st.name.toUpperCase(), g.x0 - 16, y)
        ctx.textBaseline = 'alphabetic'
      }
    })

    /* Scheduled traffic: the baseline lattice. */
    ctx.strokeStyle = inks.graphite
    ctx.lineWidth = present ? 1 : 0.9
    ctx.globalAlpha = present ? 0.17 : 0.085
    for (const run of runs) {
      ctx.beginPath()
      run.forEach(([t, s], k) => {
        const x = xOf(t, g)
        const y = yOf(s, g)
        if (k === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  /* ---------------- per-frame ---------------- */
  function drawFrame(still: boolean) {
    const canvas = canvasRef.current
    const g = geoRef.current
    const inks = inksRef.current
    if (!canvas || !g || !inks || !route) return
    const ctx = canvas.getContext('2d')!
    const dpr = canvas.width / Math.max(1, g.w)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (sheetRef.current) ctx.drawImage(sheetRef.current, 0, 0)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const present = surface === 'present'
    const now = Math.min(tEnd, Math.max(tStart, clock.current + drift.current))
    const nx = xOf(now, g)
    const lift = presence.current

    /* Where each scheduled run is at this moment. */
    ctx.fillStyle = inks.graphite
    ctx.globalAlpha = present ? 0.32 + 0.2 * lift : 0.16
    for (const run of runs) {
      for (let k = 0; k < run.length - 1; k++) {
        const [ta, sa] = run[k]
        const [tb, sb] = run[k + 1]
        if (now >= ta && now <= tb) {
          const f = tb === ta ? 0 : (now - ta) / (tb - ta)
          const y = yOf(sa, g) + (yOf(sb, g) - yOf(sa, g)) * f
          ctx.fillRect(nx - 2, y - 2, 4, 4)
          break
        }
      }
    }

    /* The now-line. */
    ctx.globalAlpha = present ? 0.55 + 0.25 * lift : 0.28
    ctx.strokeStyle = inks.graphite
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(Math.round(nx) + 0.5, g.y0 - 30)
    ctx.lineTo(Math.round(nx) + 0.5, g.y1 + 30)
    ctx.stroke()

    /* The unscheduled run, drawn only as far as the clock has reached. */
    if (showRoute) drawRoute(ctx, g, inks, route, now, present, lift)
    ctx.globalAlpha = 1
    void still
  }

  function drawRoute(
    ctx: CanvasRenderingContext2D,
    g: Geometry,
    inks: Inks,
    r: Route,
    now: number,
    present: boolean,
    lift: number,
  ) {
    const pts = r.stops.map((s) => [xOf(s.t, g), yOf(s.station, g), s.t] as const)
    ctx.strokeStyle = inks.vermilion
    ctx.fillStyle = inks.vermilion
    ctx.lineWidth = present ? 2.25 : 1.6
    ctx.lineJoin = 'round'
    ctx.globalAlpha = present ? 0.78 + 0.2 * lift : 0.42
    ctx.beginPath()
    let headX = pts[0][0]
    let headY = pts[0][1]
    ctx.moveTo(pts[0][0], pts[0][1])
    for (let k = 1; k < pts.length; k++) {
      const [xa, ya, ta] = pts[k - 1]
      const [xb, yb, tb] = pts[k]
      if (now <= ta) break
      // The run holds at its station until the next departure, then travels.
      if (now >= tb) {
        ctx.lineTo(xb, ya)
        ctx.lineTo(xb, yb)
        headX = xb
        headY = yb
      } else {
        const f = (now - ta) / (tb - ta)
        const x = xa + (xb - xa) * f
        ctx.lineTo(x, ya)
        headX = x
        headY = ya
        break
      }
    }
    if (now > pts[0][2]) ctx.stroke()

    /* Stops recorded so far: a square for a source, hollow for the decode. */
    r.stops.forEach((s, k) => {
      if (now < s.t) return
      const [x, y] = pts[k]
      const size = present ? 7 : 5
      if (s.derived) {
        ctx.lineWidth = 1.5
        ctx.strokeRect(x - size / 2, y - size / 2, size, size)
      } else {
        ctx.fillRect(x - size / 2, y - size / 2, size, size)
      }
    })

    if (now >= r.start && now <= r.end + 2) {
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.arc(headX, headY, present ? 4.5 : 3.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  /* ---------------- resize ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      const g = geometry(rect.width, rect.height, surface)
      geoRef.current = g
      paintSheet(g, dpr)
      if (reducedMotion) {
        clock.current = target.current
        presence.current = focusMode ? 1 : 0
      }
      drawFrame(true)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    // Fonts arrive after first paint; repaint the labels once they do.
    document.fonts?.ready.then(resize).catch(() => undefined)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surface, route, runs, reducedMotion])

  /* Reduced motion: one composed still per slide, no movement. */
  useEffect(() => {
    if (!reducedMotion) return
    clock.current = target.current
    presence.current = focusMode ? 1 : 0
    drawFrame(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, slideIndex, half, focusMode])

  /* Ballistics: the clock has mass. It accelerates toward the target,
     overshoots a hair and settles, like a plotter pen arriving. */
  useFrameLoop((_t, dt) => {
    const k = 38
    const c = 10.5
    const x = clock.current - target.current
    velocity.current += (-k * x - c * velocity.current) * dt
    clock.current += velocity.current * dt
    const settled = Math.abs(x) < 0.05 && Math.abs(velocity.current) < 0.05
    if (settled) {
      clock.current = target.current
      velocity.current = 0
    }
    let moving = !settled
    if (surface === 'present') {
      // Inside a slide the clock creeps on, up to twenty seconds.
      if (drift.current < 20) {
        drift.current += dt * 0.35
        moving = true
      }
    }
    const want = focusMode ? 1 : 0
    if (Math.abs(presence.current - want) > 0.01) {
      presence.current += (want - presence.current) * Math.min(1, dt * 3)
      moving = true
    }
    if (moving || dirty.current) {
      dirty.current = false
      drawFrame(false)
    }
  }, visible && !reducedMotion && !!route)

  return <canvas ref={canvasRef} className="la-backdrop" />
}
