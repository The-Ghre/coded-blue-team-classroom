import { useEffect, useRef, useState } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import type { StageProps } from '../types'
import { useFrameLoop, useIsVisible } from '@/motion'

/* =========================================================================
   SAFELIGHT — the darkroom the lesson is developed in
   =========================================================================
   One fragment shader. An amber safelight hangs above the top-right corner
   (dark green for the workshop half: the panchromatic safelight). Below it
   the developer tray: slow caustics, a periodic agitation wave rocking
   across the tray, and a wave pushed through the liquid on every slide
   change, in the direction of travel. Silver grain runs at twelve frames a
   second, and its clumping densifies as the deck advances — the session
   developing.

   Cheap by construction: rendered at a fraction of CSS resolution (grain is
   meant to be coarse), paused offscreen and in hidden tabs, and a single
   composed frame under reduced motion.
   ========================================================================= */

const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform float uDev;
uniform float uHalf;
uniform float uFocus;
uniform float uKick;
uniform float uKickDir;
uniform float uPage;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime;

  vec3 amber = vec3(1.0, 0.36, 0.09);
  vec3 green = vec3(0.16, 0.55, 0.26);
  vec3 lamp = mix(amber, green, uHalf);
  vec3 ground = mix(vec3(0.062, 0.036, 0.026), vec3(0.026, 0.044, 0.032), uHalf);

  /* The lamp: above the frame, top right. Its pool is the only bright
     region and it stays clear of where text sits. */
  vec2 lp = vec2(aspect * 0.86, 1.32);
  vec2 dl = (p - lp) * vec2(0.62, 1.0);
  float pool = exp(-dot(dl, dl) * 1.35);
  float lampLevel = (0.30 + 0.06 * uFocus) * mix(1.0, 0.62, uPage);

  /* Developer tray liquid. */
  vec2 q = p * 2.6;
  float w1 = noise(q + vec2(t * 0.045, t * 0.03));
  float w2 = noise(q * 1.8 - vec2(t * 0.035, -t * 0.05));
  float caustic = pow(1.0 - abs(w1 - w2), 7.0);

  /* Agitation: the tray is rocked every fourteen seconds. */
  float cycle = fract(t / 14.0);
  float front = cycle * (aspect + 0.9) - 0.45;
  float rock = exp(-pow((p.x - front - 0.08 * sin(p.y * 5.0)) * 5.5, 2.0)) * smoothstep(0.0, 0.08, cycle) * (1.0 - smoothstep(0.7, 1.0, cycle));

  /* A print slid into the tray on navigation. */
  float kfront = uKickDir > 0.0 ? (uKick * 1.5 - 0.25) : (aspect + 0.25 - uKick * 1.5);
  float kick = exp(-pow((p.x - kfront - 0.05 * sin(p.y * 7.0 + t)) * 7.0, 2.0)) * exp(-uKick * 1.4);

  float liquid = caustic * 0.55 + rock * 0.5 + kick * 0.9;
  vec3 col = ground;
  col += lamp * pool * lampLevel;
  col += lamp * liquid * (0.035 + pool * 0.10) * mix(1.0, 0.6, uPage);

  /* Silver grain, twelve frames a second, clumping as the session develops. */
  float tf = floor(t * 12.0);
  float g = hash(gl_FragCoord.xy + tf * vec2(17.0, 31.0)) - 0.5;
  float clump = noise(gl_FragCoord.xy * 0.18 + tf) - 0.5;
  float grain = mix(g, clump, 0.35 + 0.4 * uDev) * (0.05 + 0.03 * uDev);
  col += grain * (0.4 + pool) * vec3(1.0, 0.9, 0.82);

  /* The room falls off into the corners. */
  vec2 v = vUv - 0.5;
  col *= 1.0 - dot(v, v) * 0.9;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`

export default function Backdrop(props: StageProps) {
  const { surface, slideIndex, slideCount, half, focusMode, direction, reducedMotion } = props
  const hostRef = useRef<HTMLDivElement>(null)
  const visible = useIsVisible(hostRef)
  const [failed, setFailed] = useState(false)
  const gl = useRef<{
    renderer: Renderer
    program: Program
    mesh: Mesh
  } | null>(null)
  const clock = useRef({ t: 0, kickAt: -10, kickDir: 1, dev: 0.4, focus: 0, half: half === 'practical' ? 1 : 0 })

  const devTarget =
    surface === 'present' && slideCount > 0 ? (slideIndex + 1) / slideCount : 0.45
  const halfTarget = half === 'practical' ? 1 : 0

  /* Create the GL context once. */
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let renderer: Renderer
    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, 1.5) * 0.5,
        alpha: false,
        antialias: false,
        powerPreference: 'low-power',
      })
    } catch {
      setFailed(true)
      return
    }
    const ctx = renderer.gl
    ctx.clearColor(0.06, 0.035, 0.025, 1)
    const canvas = ctx.canvas as HTMLCanvasElement
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    host.appendChild(canvas)

    const program = new Program(ctx, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: [1, 1] },
        uDev: { value: clock.current.dev },
        uHalf: { value: clock.current.half },
        uFocus: { value: 0 },
        uKick: { value: 10 },
        uKickDir: { value: 1 },
        uPage: { value: surface === 'present' ? 0 : 1 },
      },
    })
    const mesh = new Mesh(ctx, { geometry: new Triangle(ctx), program })
    gl.current = { renderer, program, mesh }

    const resize = () => {
      const r = host.getBoundingClientRect()
      renderer.setSize(Math.max(1, r.width), Math.max(1, r.height))
      program.uniforms.uRes.value = [r.width, r.height]
      renderer.render({ scene: mesh })
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    return () => {
      ro.disconnect()
      gl.current = null
      ctx.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* A slide change pushes a wave through the tray. */
  useEffect(() => {
    if (direction === 0) return
    clock.current.kickAt = clock.current.t
    clock.current.kickDir = direction
  }, [slideIndex, direction])

  const draw = (dt: number) => {
    const g = gl.current
    if (!g) return
    const c = clock.current
    c.t += dt
    const k = 1 - Math.exp(-dt * 2.2)
    c.dev += (devTarget - c.dev) * k
    c.half += (halfTarget - c.half) * k
    c.focus += ((focusMode ? 1 : 0) - c.focus) * k
    const u = g.program.uniforms
    u.uTime.value = c.t
    u.uDev.value = c.dev
    u.uHalf.value = c.half
    u.uFocus.value = c.focus
    u.uKick.value = c.t - c.kickAt
    u.uKickDir.value = c.kickDir
    g.renderer.render({ scene: g.mesh })
  }

  useFrameLoop((_t, dt) => draw(dt), !reducedMotion && visible && !failed)

  /* Reduced motion: one composed frame, redrawn only when the room changes. */
  useEffect(() => {
    if (!reducedMotion || !gl.current) return
    const c = clock.current
    c.t = 6.5
    c.dev = devTarget
    c.half = halfTarget
    c.focus = focusMode ? 1 : 0
    c.kickAt = -10
    draw(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, devTarget, halfTarget, focusMode])

  return <div ref={hostRef} className="ir-backdrop" data-failed={failed || undefined} />
}
