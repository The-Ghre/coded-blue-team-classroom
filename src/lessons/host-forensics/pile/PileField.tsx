import { useEffect, useRef, useState } from 'react'
import { Renderer, Program, Mesh, Triangle, RenderTarget, type OGLRenderingContext } from 'ogl'
import { useIsVisible } from '@/motion'
import { pileFragment, trailFragment, vertex } from './shaders'
import { THRESHOLD, layoutWalk, vacuumLanes, type Footprint, type TrailEvent } from './trail'

/* =========================================================================
   PILE FIELD — the carpet, in WebGL
   =========================================================================
   Imperative renderer wrapped in a small React component. The component
   owns lifecycle (visibility, reduced motion, resize); the renderer owns
   the GPU and the slow physics of the pile.
   ========================================================================= */

export interface EventSource {
  events: readonly TrailEvent[]
  subscribe(l: () => void): () => void
}

export interface PileFieldProps {
  source: EventSource
  /** 0 on a projected slide, 1 on a reading page. */
  quiet: number
  /** Where the lamp rests when nobody is pointing: 'walker' follows the newest step, 'retrace' walks the trail from the start. */
  lamp: 'walker' | 'retrace'
  reducedMotion: boolean
  /** Lets the pointer brush the pile and carry the lamp. */
  interactive: boolean
  /** Lamp strength; raised a little when the room is only watching the slide. */
  power?: number
  /** Threshold x at the top and at the bottom, 0..1. */
  threshold?: readonly [number, number]
}

const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const PALETTE = {
  petrolA: hex('#061b1e'),
  petrolB: hex('#22504f'),
  plumA: hex('#150b19'),
  plumB: hex('#472a52'),
  // Worn bronze edges; the shader brushes a brass highlight down the middle.
  brass: hex('#9a7a3c'),
}

const TRAIL_SCALE = 1 / 3
const MAX_DPR = 1.25

interface Sweep {
  lanes: [number, number][]
  lane: number
  head: number
  down: boolean
}

class PileRenderer {
  gl: OGLRenderingContext
  renderer: Renderer
  mesh: Mesh
  trailMesh: Mesh
  pile: Program
  trailProg: Program
  read!: RenderTarget
  write!: RenderTarget
  w = 1
  h = 1
  walk: Footprint[] = []
  stampQueue: { fp: Footprint; fresh: number }[] = []
  sweeps: Sweep[] = []
  brush: { from: [number, number]; to: [number, number]; dir: [number, number] } | null = null
  lastPointerAt = -10
  pointer: [number, number] = [0, 0]
  light: [number, number] = [0, 0]
  latest: [number, number] | null = null
  stampTimer = 0
  quiet = 0
  lamp: 'walker' | 'retrace' = 'walker'
  threshold: readonly [number, number] = [THRESHOLD.top, THRESHOLD.bottom]

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer({
      canvas,
      dpr: Math.min(window.devicePixelRatio || 1, MAX_DPR),
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: 'low-power',
    })
    this.gl = this.renderer.gl
    const geometry = new Triangle(this.gl)
    this.trailProg = new Program(this.gl, {
      vertex,
      fragment: trailFragment,
      uniforms: {
        tPrev: { value: null },
        uRes: { value: [1, 1] },
        uDecay: { value: 1 },
        uBrush: { value: [0, 0, 0, 0] },
        uBrushDir: { value: [0, 0] },
        uBrushR: { value: 26 },
        uBrushOn: { value: 0 },
        // A plain array: ogl only resolves uniform arrays given as Array.
        uStamps: { value: new Array<number>(24).fill(0) },
        uStampLen: { value: 30 },
        uStampFresh: { value: 1 },
        uVac: { value: [0, 0, 0, 0] },
        uVacDir: { value: [0, 1] },
        uVacOn: { value: 0 },
      },
      depthTest: false,
      depthWrite: false,
    })
    this.pile = new Program(this.gl, {
      vertex,
      fragment: pileFragment,
      uniforms: {
        tTrail: { value: null },
        uRes: { value: [1, 1] },
        uLight: { value: [0, 0] },
        uLightPower: { value: 1 },
        uTile: { value: 96 },
        uQuiet: { value: 0 },
        uPetrolA: { value: PALETTE.petrolA },
        uPetrolB: { value: PALETTE.petrolB },
        uPlumA: { value: PALETTE.plumA },
        uPlumB: { value: PALETTE.plumB },
        uBrass: { value: PALETTE.brass },
        uSplit: { value: [0, 0, 10] },
      },
      depthTest: false,
      depthWrite: false,
    })
    this.mesh = new Mesh(this.gl, { geometry, program: this.pile })
    this.trailMesh = new Mesh(this.gl, { geometry, program: this.trailProg })
  }

  resize(w: number, h: number) {
    this.w = Math.max(1, w)
    this.h = Math.max(1, h)
    this.renderer.setSize(this.w, this.h)
    const tw = Math.max(8, Math.round(this.w * TRAIL_SCALE))
    const th = Math.max(8, Math.round(this.h * TRAIL_SCALE))
    const opts = { width: tw, height: th, depth: false }
    this.read = new RenderTarget(this.gl, opts)
    this.write = new RenderTarget(this.gl, opts)
    const gl = this.gl
    for (const rt of [this.read, this.write]) {
      this.renderer.bindFramebuffer(rt)
      gl.viewport(0, 0, tw, th)
      gl.clearColor(0.5, 0.5, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
    }
    this.renderer.bindFramebuffer()
    gl.clearColor(0, 0, 0, 1)
    this.walk = layoutWalk(this.w, this.h)
    this.stampQueue = []
    this.sweeps = []
    this.latest = null
    const tile = Math.round(Math.max(56, Math.min(112, Math.min(this.w, this.h) * 0.11)))
    this.pile.uniforms.uTile.value = tile
    this.pile.uniforms.uRes.value = [this.w, this.h]
    this.trailProg.uniforms.uRes.value = [this.w, this.h]
    this.pile.uniforms.uSplit.value = [
      this.threshold[0] * this.w,
      this.threshold[1] * this.w,
      Math.max(7, Math.min(14, this.w * 0.008)),
    ]
    this.trailProg.uniforms.uStampLen.value = this.walk[0]?.length ?? 30
    this.trailProg.uniforms.uBrushR.value = Math.max(16, Math.min(30, this.w * 0.02))
    if (this.light[0] === 0 && this.light[1] === 0) this.light = [this.w * 0.2, this.h * 0.15]
  }

  /** Apply events instantly (replay, reduced motion) or queue them to play out. */
  ingest(events: readonly TrailEvent[], animate: boolean) {
    const lastStep = [...events].reverse().find((e) => e.type === 'step')
    for (const e of events) {
      if (e.type === 'step') {
        const fp = this.walk[e.index]
        if (!fp) continue
        const fresh = animate ? 1 : e === lastStep ? 0.7 : 0
        if (animate) this.stampQueue.push({ fp, fresh })
        else this.stampNow([{ fp, fresh }])
      } else {
        const lanes = vacuumLanes(e.side, this.w)
        if (animate) this.sweeps.push({ lanes, lane: 0, head: -12, down: true })
        else this.vacuumNow(lanes)
      }
    }
  }

  private pass() {
    this.trailProg.uniforms.tPrev.value = this.read.texture
    this.renderer.render({ scene: this.trailMesh, target: this.write })
    const t = this.read
    this.read = this.write
    this.write = t
  }

  private resetPassUniforms() {
    const u = this.trailProg.uniforms
    u.uBrushOn.value = 0
    u.uVacOn.value = 0
    u.uDecay.value = 1
    ;(u.uStamps.value as number[]).fill(0)
  }

  stampNow(batch: { fp: Footprint; fresh: number }[]) {
    for (let i = 0; i < batch.length; i += 6) {
      this.resetPassUniforms()
      const arr = this.trailProg.uniforms.uStamps.value as number[]
      const slice = batch.slice(i, i + 6)
      let fresh = 0
      slice.forEach(({ fp, fresh: f }, k) => {
        arr.splice(k * 4, 4, fp.x, fp.y, fp.angle, fp.side)
        fresh = Math.max(fresh, f)
        this.latest = [fp.x, fp.y]
      })
      this.trailProg.uniforms.uStampFresh.value = fresh
      this.pass()
    }
  }

  vacuumNow(lanes: [number, number][]) {
    lanes.forEach((lane, i) => {
      this.resetPassUniforms()
      const u = this.trailProg.uniforms
      u.uVacOn.value = 1
      u.uVac.value = [lane[0], -10, lane[1], this.h + 10]
      u.uVacDir.value = [0, i % 2 === 0 ? -1 : 1]
      this.pass()
    })
  }

  setPointer(x: number, y: number, t: number) {
    const [px, py] = this.pointer
    const dx = x - px
    const dy = y - py
    const len = Math.hypot(dx, dy)
    if (len > 1.5 && t - this.lastPointerAt < 0.25) {
      // Several moves can land inside one frame: keep the first origin.
      const from = this.brush ? this.brush.from : ([px, py] as [number, number])
      this.brush = { from, to: [x, y], dir: [dx / len, -dy / len] }
    }
    this.pointer = [x, y]
    this.lastPointerAt = t
  }

  frame(t: number, dt: number) {
    const u = this.trailProg.uniforms

    // 1. Walk: release one queued footprint at a time.
    this.stampTimer -= dt
    if (this.stampQueue.length && this.stampTimer <= 0) {
      const next = this.stampQueue.shift()!
      this.stampNow([next])
      this.stampTimer = this.stampQueue.length > 8 ? 0.06 : 0.17
    }

    // 2. Physics pass: decay, pointer brush, vacuum head.
    this.resetPassUniforms()
    u.uDecay.value = Math.pow(0.5, dt / 5)
    if (this.brush) {
      u.uBrushOn.value = 1
      u.uBrush.value = [...this.brush.from, ...this.brush.to]
      u.uBrushDir.value = this.brush.dir
      this.brush = null
    }
    let head: [number, number, number] | null = null
    const sweep = this.sweeps[0]
    if (sweep && !this.stampQueue.length) {
      const lane = sweep.lanes[sweep.lane]
      const speed = this.h / 0.75
      const from = sweep.head
      sweep.head += speed * dt
      const to = sweep.head
      const y0 = sweep.down ? from : this.h - from
      const y1 = sweep.down ? to : this.h - to
      u.uVacOn.value = 1
      u.uVac.value = [lane[0], y0, lane[1], y1]
      u.uVacDir.value = [0, sweep.down ? -1 : 1]
      head = [lane[0], lane[1], y1]
      if (sweep.head > this.h + 12) {
        sweep.lane += 1
        sweep.head = -12
        sweep.down = !sweep.down
        if (sweep.lane >= sweep.lanes.length) this.sweeps.shift()
      }
    }
    this.pass()

    // 3. Lamp.
    let target: [number, number]
    if (t - this.lastPointerAt < 2.2) target = this.pointer
    else if (head) target = [(head[0] + head[1]) / 2, head[2]]
    else if (this.lamp === 'retrace' && this.walk.length) {
      const k = (t * 0.9) % (this.walk.length + 6)
      const fp = this.walk[Math.min(this.walk.length - 1, Math.floor(k))]
      target = [fp.x - 60, fp.y - 90]
    } else if (this.latest) target = [this.latest[0] - 80, this.latest[1] - 120]
    else target = [this.w * 0.2, this.h * 0.15]
    const ease = 1 - Math.pow(0.02, dt)
    this.light = [this.light[0] + (target[0] - this.light[0]) * ease, this.light[1] + (target[1] - this.light[1]) * ease]
    this.render()
  }

  render() {
    this.pile.uniforms.tTrail.value = this.read.texture
    this.pile.uniforms.uLight.value = this.light
    this.pile.uniforms.uQuiet.value = this.quiet
    this.renderer.render({ scene: this.mesh })
  }

  /** A composed still frame: lamp raking from the upper left of the walk. */
  still() {
    this.light = this.latest ? [this.latest[0] - 140, this.latest[1] - 160] : [this.w * 0.18, this.h * 0.12]
    this.render()
  }

  dispose() {
    const ext = this.gl.getExtension('WEBGL_lose_context')
    ext?.loseContext()
  }
}

export function PileField({
  source,
  quiet,
  lamp,
  reducedMotion,
  interactive,
  power = 1,
  threshold = [THRESHOLD.top, THRESHOLD.bottom],
}: PileFieldProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<PileRenderer | null>(null)
  const appliedRef = useRef(0)
  const [failed, setFailed] = useState(false)
  const visible = useIsVisible(wrapRef)
  const animate = !reducedMotion
  const live = useRef({ quiet, lamp, power })
  live.current = { quiet, lamp, power }

  // Create, size, replay.
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    // A fresh canvas per mount: a context released on unmount can never be
    // handed back to the next mount of the same element.
    const canvas = document.createElement('canvas')
    canvas.className = 'hf-pile__canvas'
    wrap.appendChild(canvas)
    let r: PileRenderer
    try {
      r = new PileRenderer(canvas)
      if (r.gl.isContextLost()) throw new Error('context lost')
    } catch {
      canvas.remove()
      setFailed(true)
      return
    }
    rendererRef.current = r
    r.threshold = threshold
    r.quiet = live.current.quiet
    r.lamp = live.current.lamp
    r.pile.uniforms.uLightPower.value = live.current.power
    const size = () => {
      const rect = wrap.getBoundingClientRect()
      r.resize(rect.width, rect.height)
      r.ingest(source.events, false)
      appliedRef.current = source.events.length
      r.still()
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(wrap)
    return () => {
      ro.disconnect()
      r.dispose()
      canvas.remove()
      rendererRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, threshold[0], threshold[1]])

  // Props the shader reads every frame.
  useEffect(() => {
    const r = rendererRef.current
    if (!r) return
    r.quiet = quiet
    r.lamp = lamp
    r.pile.uniforms.uLightPower.value = power
    if (!animate) r.still()
  }, [quiet, lamp, animate, power])

  // New events: play them out, or apply them at once under reduced motion.
  useEffect(() => {
    const onChange = () => {
      const r = rendererRef.current
      if (!r) return
      const fresh = source.events.slice(appliedRef.current)
      appliedRef.current = source.events.length
      r.ingest(fresh, animate)
      if (!animate) r.still()
    }
    return source.subscribe(onChange)
  }, [source, animate])

  // Pointer: brushes the pile and carries the lamp.
  useEffect(() => {
    if (!interactive || !animate || !window.matchMedia('(pointer: fine)').matches) return
    const onMove = (e: PointerEvent) => {
      const r = rendererRef.current
      const wrap = wrapRef.current
      if (!r || !wrap) return
      const rect = wrap.getBoundingClientRect()
      r.setPointer(e.clientX - rect.left, e.clientY - rect.top, performance.now() / 1000)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [interactive, animate])

  // Frame loop, only while someone can see it.
  useEffect(() => {
    if (!animate || !visible) return
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20)
      last = now
      rendererRef.current?.frame(now / 1000, dt)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [animate, visible])

  return (
<div ref={wrapRef} className="hf-pile" data-failed={failed || undefined} />
  )
}
