import { useCallback, useEffect, useRef } from 'react'
import type { StageProps } from '../types'
import { CanvasStage, usePointerDrift, type CanvasFrame } from '@/motion'

/* =========================================================================
   BACKDROP — the night desk
   =========================================================================
   Presentation: one analyst's desk at 03:00. A single lamp lights the tag
   being worked (the slide); the tag's string runs off into the dark from
   its eyelet; finished tags go onto the paper spike at the right, one per
   slide already worked. The lamp brightens when the room is watching
   (chrome hidden). Under reduced motion the same scene is drawn once.

   Study, workshop and overview: the tag stock itself — manila fibre and
   grain, drawn once and never animated, because those pages are for reading.
   ========================================================================= */

const DESK = '#15130f'

/* Deterministic noise so the grain never shimmers between redraws. */
function mulberry(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeGrain(light: boolean): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = 180
  const g = c.getContext('2d')!
  const rnd = mulberry(light ? 7 : 11)
  for (let i = 0; i < 2600; i++) {
    const a = rnd() * (light ? 0.07 : 0.05)
    g.fillStyle = rnd() > 0.5 ? `rgba(255,248,228,${a})` : `rgba(26,20,9,${a * (light ? 1.4 : 2.4)})`
    g.fillRect(Math.floor(rnd() * 180), Math.floor(rnd() * 180), 1, 1)
  }
  return c
}

/* ---------------------------------------------------------------------------
   Presentation desk
   --------------------------------------------------------------------------- */

interface Spiked {
  rot: number
  dx: number
  shade: number
}

function DeskBackdrop({ slideIndex, direction, focusMode, reducedMotion }: StageProps) {
  const drift = usePointerDrift(0.06)
  const grain = useRef<CanvasPattern | null>(null)
  const swing = useRef({ x: 0, v: 0 })
  const lamp = useRef(0)
  const spikes = useRef<Spiked[]>([])
  const drop = useRef({ index: slideIndex, t0: -10 })
  const clock = useRef(0)
  const props = useRef({ slideIndex, direction, focusMode })
  props.current = { slideIndex, direction, focusMode }

  /* A slide change jerks the string: the tag was just torn off the pad. */
  useEffect(() => {
    if (direction !== 0) swing.current.v += direction * 190
    drop.current = { index: slideIndex, t0: clock.current }
  }, [slideIndex, direction])

  /* A tag longer than the projector scrolls inside itself. Mark it so the
     tag can print a "continues" cue, and make it reachable by keyboard
     (Tab to it, then the arrow-down / arrow-up keys scroll it). */
  useEffect(() => {
    const slide = document.querySelector<HTMLElement>('.present__slide')
    const body = slide?.querySelector<HTMLElement>(':scope > .block')
    if (!slide || !body) return
    const update = () => {
      const overflows = body.scrollHeight > body.clientHeight + 4
      const atEnd = body.scrollTop + body.clientHeight >= body.scrollHeight - 4
      slide.dataset.socMore = overflows && !atEnd ? 'true' : 'false'
      if (overflows) {
        body.tabIndex = 0
        body.setAttribute('role', 'region')
        body.setAttribute('aria-label', `${body.querySelector('h1, h2')?.textContent ?? 'Slide'} — scrollable`)
      } else {
        body.removeAttribute('tabindex')
        body.removeAttribute('role')
        body.removeAttribute('aria-label')
      }
    }
    update()
    /* Watch the content as well as the box: once the body sits at its
       max-height, an annotation opening inside it changes neither. */
    const ro = new ResizeObserver(update)
    ro.observe(body)
    Array.from(body.children).forEach((child) => ro.observe(child))
    const later = () => requestAnimationFrame(update)
    body.addEventListener('scroll', update, { passive: true })
    body.addEventListener('click', later)
    body.addEventListener('toggle', later, true)
    return () => {
      ro.disconnect()
      body.removeEventListener('scroll', update)
      body.removeEventListener('click', later)
      body.removeEventListener('toggle', later, true)
    }
  }, [slideIndex])

  if (spikes.current.length === 0) {
    const rnd = mulberry(1)
    spikes.current = Array.from({ length: 40 }, () => ({
      rot: (rnd() - 0.5) * 0.5,
      dx: (rnd() - 0.5) * 6,
      shade: 0.75 + rnd() * 0.25,
    }))
  }

  const setup = useCallback(({ ctx }: { ctx: CanvasRenderingContext2D }) => {
    grain.current = ctx.createPattern(makeGrain(false), 'repeat')
  }, [])

  const draw = useCallback(
    ({ ctx, width: w, height: h, t, dt, still }: CanvasFrame) => {
      clock.current = t
      const { slideIndex: index, focusMode: focus } = props.current

      /* Where the tag lies, in this canvas's coordinates. */
      const canvasRect = ctx.canvas.getBoundingClientRect()
      const slideEl = document.querySelector('.present__slide')
      const r = slideEl?.getBoundingClientRect()
      const tag = r
        ? {
            x: r.left - canvasRect.left,
            y: r.top - canvasRect.top,
            w: r.width,
            h: Math.min(r.height, h),
          }
        : { x: w * 0.12, y: h * 0.15, w: w * 0.76, h: h * 0.6 }
      const interaction = slideEl?.getAttribute('data-kind') === 'interaction'

      ctx.fillStyle = DESK
      ctx.fillRect(0, 0, w, h)
      if (grain.current) {
        ctx.fillStyle = grain.current
        ctx.fillRect(0, 0, w, h)
      }

      /* The lamp: one warm pool, centred on the tag being worked. It
         breathes very slowly (no flicker) and rises when the chrome hides. */
      const target = focus ? 1 : 0
      lamp.current += (target - lamp.current) * (still ? 1 : Math.min(1, dt * 2.2))
      const breathe = still ? 0 : Math.sin(t * 0.7) * 0.012
      const intensity = 0.2 + lamp.current * 0.08 + breathe
      const cx = tag.x + tag.w * 0.46
      const cy = tag.y + Math.min(tag.h, h * 0.7) * 0.32
      const radius = Math.max(w, h) * (0.62 + lamp.current * 0.06)
      const pool = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      pool.addColorStop(0, `rgba(255, 205, 138, ${intensity})`)
      pool.addColorStop(0.38, `rgba(240, 178, 104, ${intensity * 0.42})`)
      pool.addColorStop(1, 'rgba(240, 178, 104, 0)')
      ctx.fillStyle = pool
      ctx.fillRect(0, 0, w, h)

      /* Room falloff, deeper when the room is watching. */
      const edge = ctx.createRadialGradient(cx, cy, radius * 0.45, cx, cy, Math.max(w, h) * 1.05)
      edge.addColorStop(0, 'rgba(8, 7, 5, 0)')
      edge.addColorStop(1, `rgba(8, 7, 5, ${0.55 + lamp.current * 0.2})`)
      ctx.fillStyle = edge
      ctx.fillRect(0, 0, w, h)

      if (interaction) return

      /* The string, from the eyelet off into the dark. A damped spring
         swings it; the pointer leans it slightly. */
      const p = drift()
      const s = swing.current
      if (!still) {
        const k = 26
        const damping = 3.4
        const goal = p.x * 14
        s.v += (-(s.x - goal) * k - s.v * damping) * dt
        s.x += s.v * dt
      }
      const ex = tag.x + 38
      const ey = tag.y + 52
      const leftRoom = tag.x > 72
      const ax = leftRoom ? -40 : ex - 60
      const ay = leftRoom ? ey - h * 0.16 : -40
      const mx = (ax + ex) / 2 + s.x
      const my = Math.max(ay, ey) + (leftRoom ? 70 : 20) + Math.abs(s.x) * 0.4
      ctx.lineCap = 'round'
      ctx.strokeStyle = 'rgba(206, 188, 142, 0.82)'
      ctx.lineWidth = 2.2
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.quadraticCurveTo(mx, my, ex, ey)
      ctx.stroke()
      ctx.strokeStyle = 'rgba(255, 244, 214, 0.28)'
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.moveTo(ax, ay - 0.6)
      ctx.quadraticCurveTo(mx, my - 0.6, ex, ey - 0.6)
      ctx.stroke()

      /* The paper spike: one finished tag per slide already worked. */
      const room = w - (tag.x + tag.w)
      if (room < 96) return
      const sx = tag.x + tag.w + room / 2
      const baseY = Math.min(h - 70, tag.y + Math.min(tag.h, h * 0.8) * 0.92)
      const spikeH = Math.min(220, baseY - 60)
      ctx.fillStyle = '#0b0a08'
      ctx.beginPath()
      ctx.ellipse(sx, baseY + 4, 30, 8, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#2a2721'
      ctx.beginPath()
      ctx.ellipse(sx, baseY, 28, 7, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#8f8a80'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(sx, baseY)
      ctx.lineTo(sx, baseY - spikeH)
      ctx.stroke()

      const count = Math.min(index, spikes.current.length)
      const sinceDrop = t - drop.current.t0
      for (let i = 0; i < count; i++) {
        const sp = spikes.current[i]
        let y = baseY - 6 - i * 5.5
        /* The newest tag falls onto the spike. */
        if (!still && i === count - 1 && drop.current.index === index && sinceDrop < 0.5) {
          const k = sinceDrop / 0.5
          const ease = 1 - Math.pow(1 - k, 3)
          y = baseY - spikeH - 10 + (y - (baseY - spikeH - 10)) * ease
        }
        ctx.save()
        ctx.translate(sx + sp.dx, y)
        ctx.rotate(sp.rot)
        const light = Math.round(150 * sp.shade)
        ctx.fillStyle = `rgb(${light + 40}, ${light + 22}, ${light - 18})`
        ctx.fillRect(-26, -7, 52, 12)
        ctx.fillStyle = 'rgba(20, 16, 10, 0.55)'
        ctx.fillRect(-26, 4, 52, 1.2)
        ctx.restore()
      }
      ctx.strokeStyle = '#a7a196'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(sx, baseY - count * 5.5 - 8)
      ctx.lineTo(sx, baseY - spikeH)
      ctx.stroke()
    },
    [drift],
  )

  return (
    <CanvasStage
      key={reducedMotion ? `still-${slideIndex}-${focusMode}` : 'live'}
      className="soc-desk-canvas"
      setup={setup}
      draw={draw}
      maxDpr={1.5}
    />
  )
}

/* ---------------------------------------------------------------------------
   Reading pages: the tag stock
   --------------------------------------------------------------------------- */

function StockBackdrop() {
  const draw = useCallback(({ ctx, width: w, height: h }: CanvasFrame) => {
    ctx.clearRect(0, 0, w, h)
    const pattern = ctx.createPattern(makeGrain(true), 'repeat')
    if (pattern) {
      ctx.fillStyle = pattern
      ctx.fillRect(0, 0, w, h)
    }
    /* Long paper fibres, very faint. */
    const rnd = mulberry(23)
    const fibres = Math.round((w * h) / 9000)
    for (let i = 0; i < fibres; i++) {
      const x = rnd() * w
      const y = rnd() * h
      const len = 8 + rnd() * 26
      const a = rnd() * Math.PI
      ctx.strokeStyle = rnd() > 0.5 ? 'rgba(120, 92, 40, 0.10)' : 'rgba(255, 246, 220, 0.22)'
      ctx.lineWidth = 0.7
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.quadraticCurveTo(
        x + Math.cos(a) * len * 0.5 + (rnd() - 0.5) * 6,
        y + Math.sin(a) * len * 0.5 + (rnd() - 0.5) * 6,
        x + Math.cos(a) * len,
        y + Math.sin(a) * len,
      )
      ctx.stroke()
    }
  }, [])
  return <CanvasStage className="soc-stock-canvas" draw={draw} animate={false} maxDpr={1.25} />
}

export function Backdrop(props: StageProps) {
  if (props.surface === 'present') return <DeskBackdrop {...props} />
  return <StockBackdrop />
}
