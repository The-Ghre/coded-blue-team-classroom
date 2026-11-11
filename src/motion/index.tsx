/* =========================================================================
   MOTION TOOLKIT — shared primitives for lesson kits
   =========================================================================
   Kits may use motion (motion/react), gsap (every plugin ships free, including
   SplitText, DrawSVG, MorphSVG, Flip and ScrollTrigger) and ogl for WebGL.
   These helpers cover the parts every kit would otherwise re-solve, and get
   wrong in the same ways: device pixel ratio, pausing when nobody can see
   the animation, and honouring reduced motion.
   ========================================================================= */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
} from 'react'
import { usePrefersReducedMotion } from '@/lib/hooks'

export { usePrefersReducedMotion as useReducedMotion }

/* ---------------------------------------------------------------------------
   Visibility — is anyone able to see this element right now?
   --------------------------------------------------------------------------- */

/** True while the element intersects the viewport AND the tab is visible. */
export function useIsVisible<T extends Element>(ref: React.RefObject<T>, rootMargin = '0px'): boolean {
  const [inView, setInView] = useState(true)
  const [tabVisible, setTabVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible',
  )

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])

  useEffect(() => {
    const onChange = () => setTabVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  return inView && tabVisible
}

/* ---------------------------------------------------------------------------
   Animation frame loop that stops when it should
   --------------------------------------------------------------------------- */

/**
 * Runs `tick(t, dt)` every frame while `active`. `t` is seconds since the
 * loop first started (it keeps counting across pauses, so a resumed scene
 * continues rather than jumping), `dt` is seconds since the last frame,
 * clamped so a backgrounded tab does not lurch forward on return.
 */
export function useFrameLoop(tick: (t: number, dt: number) => void, active: boolean) {
  const tickRef = useRef(tick)
  tickRef.current = tick
  const elapsed = useRef(0)

  useEffect(() => {
    if (!active) return
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20)
      last = now
      elapsed.current += dt
      tickRef.current(elapsed.current, dt)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active])
}

/* ---------------------------------------------------------------------------
   CanvasStage — a 2D canvas with the plumbing done
   --------------------------------------------------------------------------- */

export interface CanvasFrame {
  ctx: CanvasRenderingContext2D
  /** CSS pixel size. The context is already scaled for the device pixel ratio. */
  width: number
  height: number
  t: number
  dt: number
  /** True on the single frame drawn under reduced motion. */
  still: boolean
}

export interface CanvasStageProps {
  draw: (frame: CanvasFrame) => void
  /** Called on mount and on every resize, before the next draw. */
  setup?: (frame: Omit<CanvasFrame, 't' | 'dt' | 'still'>) => void
  className?: string
  style?: CSSProperties
  /** Hard cap on device pixel ratio. Backdrops rarely need more than 1.5. */
  maxDpr?: number
  /** Override the reduced-motion decision (e.g. a slide that must animate to teach). */
  animate?: boolean
  /** Time used for the single still frame under reduced motion. */
  stillTime?: number
}

/**
 * Sized to its container via ResizeObserver, DPR-correct, paused when
 * offscreen or the tab is hidden, and — under reduced motion — draws one
 * composed still frame instead of animating.
 */
export function CanvasStage({
  draw,
  setup,
  className,
  style,
  maxDpr = 1.5,
  animate,
  stillTime = 2,
}: CanvasStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sizeRef = useRef({ width: 0, height: 0 })
  const reduced = usePrefersReducedMotion()
  const visible = useIsVisible(canvasRef)
  const shouldAnimate = animate ?? !reduced
  const drawRef = useRef(draw)
  drawRef.current = draw
  const setupRef = useRef(setup)
  setupRef.current = setup

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { width: rect.width, height: rect.height }
      setupRef.current?.({ ctx, width: rect.width, height: rect.height })
      if (!shouldAnimate) {
        drawRef.current({ ctx, width: rect.width, height: rect.height, t: stillTime, dt: 0, still: true })
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [maxDpr, shouldAnimate, stillTime])

  useFrameLoop((t, dt) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { width, height } = sizeRef.current
    drawRef.current({ ctx, width, height, t, dt, still: false })
  }, shouldAnimate && visible)

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  )
}

/* ---------------------------------------------------------------------------
   Pointer — normalised pointer position, for parallax and lenses
   --------------------------------------------------------------------------- */

/**
 * The pointer position in -1..1 on both axes, eased toward the true position
 * so consumers get smooth motion without their own spring. Stays at 0,0 on
 * touch devices and under reduced motion.
 */
export function usePointerDrift(ease = 0.08) {
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return
    const onMove = (e: PointerEvent) => {
      target.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced])

  /** Call once per frame; returns the eased position. */
  return () => {
    current.current.x += (target.current.x - current.current.x) * ease
    current.current.y += (target.current.y - current.current.y) * ease
    return current.current
  }
}

/* ---------------------------------------------------------------------------
   SplitWords — word-by-word text that stays one sentence to a screen reader
   --------------------------------------------------------------------------- */

/**
 * Renders text as one span per word, each carrying --i (its index) and
 * --n (the word count) for CSS-driven staggers. The visible spans are
 * aria-hidden; the element itself carries the full text as its label, so
 * assistive technology reads a sentence rather than a list of fragments.
 */
export function SplitWords({
  text,
  as: Tag = 'span',
  className,
  wordClassName = 'split-word',
}: {
  text: string
  as?: ElementType
  className?: string
  wordClassName?: string
}) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={wordClassName}
          style={{ '--i': i, '--n': words.length } as CSSProperties}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}

/* ---------------------------------------------------------------------------
   Presentation state — for block overrides that orchestrate their entrance
   --------------------------------------------------------------------------- */

export interface PresentState {
  /** True when the block is being shown as a projected slide. */
  presenting: boolean
  slideIndex: number
  direction: -1 | 0 | 1
  focusMode: boolean
}

export const PresentCtx = createContext<PresentState>({
  presenting: false,
  slideIndex: 0,
  direction: 0,
  focusMode: false,
})

export function usePresentState(): PresentState {
  return useContext(PresentCtx)
}
