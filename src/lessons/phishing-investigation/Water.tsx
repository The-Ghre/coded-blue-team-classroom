import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import type { StageProps } from '../types'
import { useFrameLoop, useIsVisible } from '@/motion'
import { LureRig } from './Lure'

/* =========================================================================
   THE WATER — Session 03's backdrop
   =========================================================================
   A lake seen from below, drawn in one fragment shader: light falling from
   the surface in slanted shafts, caustic ridges near the top, marine snow
   drifting through the depth.

   Two things in it carry the lesson rather than decorate it:

   - The light is time-indexed to the deck. As the slides advance the sun
     moves across the sky and the shafts change angle; the practical half is
     late in the day, low and amber — the clock the analyst cannot see.
   - On the title slide the surface itself comes down into the frame, so the
     line the lure hangs from visibly passes through it: the angler above,
     the lure below.

   On presentation slides a small rig hangs at the right edge on a sounding
   scale. Its depth is how far into the investigation the room has gone.
   ========================================================================= */

const vertex = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform float uProgress;
uniform float uHalf;
uniform float uCalm;
uniform float uFocus;
uniform float uSurface;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float ridge(vec2 p) { return 1.0 - abs(noise(p) * 2.0 - 1.0); }

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime;

  // Where the surface sits: above the frame normally, a fifth down on the title.
  float wave = (noise(vec2(p.x * 3.0 - t * 0.35, t * 0.2)) - 0.5) * 0.012
             + sin(p.x * 14.0 + t * 1.3) * 0.0025;
  float surfaceY = mix(1.06, 0.8, uSurface) + wave;
  float below = 1.0 - smoothstep(-0.002, 0.002, uv.y - surfaceY);

  // Depth from the surface, 0 at the surface.
  float depth = clamp((surfaceY - uv.y) / surfaceY, 0.0, 1.0);

  // Ground: lake green, darker with depth. Practical half: later, warmer, lower.
  vec3 topT = vec3(0.059, 0.294, 0.275);
  vec3 deepT = vec3(0.020, 0.133, 0.125);
  vec3 topP = vec3(0.078, 0.239, 0.212);
  vec3 deepP = vec3(0.016, 0.098, 0.102);
  vec3 top = mix(topT, topP, uHalf);
  vec3 deep = mix(deepT, deepP, uHalf);
  top = mix(top, deep, uCalm * 0.55);
  vec3 col = mix(top, deep, smoothstep(0.0, 0.85, pow(depth, 0.8)));

  // Light shafts. Their slant follows the deck: morning to evening.
  float slant = mix(-0.42, 0.5, uProgress);
  float sx = p.x + (1.0 - uv.y) * slant;
  float shafts = smoothstep(0.5, 0.95, noise(vec2(sx * 4.2, t * 0.035)))
               + 0.6 * smoothstep(0.55, 1.0, noise(vec2(sx * 9.0 + 7.0, t * 0.05)));
  float shaftFade = (1.0 - smoothstep(0.0, 0.75, depth)) * (1.0 - uCalm * 0.7);
  vec3 lightT = vec3(0.62, 0.86, 0.72);
  vec3 lightP = vec3(0.98, 0.72, 0.42);
  vec3 light = mix(lightT, lightP, uHalf);
  float shaftAmt = (0.05 + 0.025 * uFocus) * mix(1.0, 0.8, uHalf);
  col += light * shafts * shaftFade * shaftAmt;

  // Caustic ridges, strongest just under the surface.
  vec2 cp = p * 5.5;
  float c1 = ridge(cp + vec2(t * 0.11, t * 0.07));
  float c2 = ridge(cp * 1.31 - vec2(t * 0.09, -t * 0.05) + 3.7);
  float caustic = pow(c1 * c2, 7.0);
  float causticFade = (1.0 - smoothstep(0.0, 0.32, depth)) * (1.0 - uCalm * 0.8);
  col += light * caustic * causticFade * 0.11;

  // Marine snow: sparse particles drifting slowly down through the column.
  float snow = 0.0;
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    float scale = 26.0 + fi * 22.0;
    vec2 q = p * scale + vec2(sin(t * 0.1 + fi) * 0.6, t * (0.25 + fi * 0.18));
    vec2 cell = floor(q);
    vec2 f = fract(q) - 0.5;
    vec2 off = vec2(hash(cell), hash(cell + 9.1)) - 0.5;
    float d = length(f - off * 0.7);
    float on = step(hash(cell + 3.3), 0.16 - fi * 0.06);
    snow += on * smoothstep(0.09 - fi * 0.03, 0.0, d) * (0.5 - fi * 0.2);
  }
  col += vec3(0.75, 0.9, 0.82) * snow * 0.09 * (1.0 - uCalm * 0.6) * (1.0 - depth * 0.6);

  // Above the surface: the underside mirror, pale and streaked.
  vec3 air = mix(vec3(0.22, 0.42, 0.38), vec3(0.32, 0.5, 0.44), noise(vec2(p.x * 2.0 + t * 0.05, uv.y * 30.0)));
  air = mix(air, air * vec3(1.15, 0.95, 0.8), uHalf);
  col = mix(air, col, below);

  // The meniscus: one bright line where the two meet.
  float meniscus = smoothstep(0.004, 0.0, abs(uv.y - surfaceY)) * uSurface;
  col += vec3(0.82, 0.95, 0.86) * meniscus * 0.55;

  // A slow vignette at the frame edges keeps the eye on the slide.
  vec2 vq = uv - 0.5;
  col *= 1.0 - dot(vq, vq) * 0.35;

  gl_FragColor = vec4(col, 1.0);
}
`

interface Targets {
  progress: number
  half: number
  calm: number
  focus: number
  surface: number
}

function targetsFrom(props: StageProps): Targets {
  const presenting = props.surface === 'present'
  return {
    progress: presenting && props.slideCount > 1 ? props.slideIndex / (props.slideCount - 1) : 0.35,
    half: props.half === 'practical' ? 1 : 0,
    calm: presenting ? 0 : 1,
    focus: props.focusMode ? 1 : 0,
    surface: presenting && props.block?.kind === 'title' ? 1 : 0,
  }
}

export function Water(props: StageProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const glRef = useRef<{
    renderer: Renderer
    program: Program
    mesh: Mesh
  } | null>(null)
  const visible = useIsVisible(hostRef)
  const targets = useRef<Targets>(targetsFrom(props))
  const current = useRef<Targets>({ ...targets.current })
  const { reducedMotion } = props

  targets.current = targetsFrom(props)

  // Set up WebGL once. If it fails the lesson keeps its flat lake ground.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let renderer: Renderer
    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, props.surface === 'present' ? 1.25 : 1),
        alpha: false,
        antialias: false,
        powerPreference: 'low-power',
      })
    } catch {
      return
    }
    const gl = renderer.gl
    gl.clearColor(0.02, 0.13, 0.12, 1)
    const canvas = gl.canvas as HTMLCanvasElement
    canvas.className = 'pi-water__canvas'
    host.prepend(canvas)

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uRes: { value: [1, 1] },
        uTime: { value: 0 },
        uProgress: { value: current.current.progress },
        uHalf: { value: current.current.half },
        uCalm: { value: current.current.calm },
        uFocus: { value: current.current.focus },
        uSurface: { value: current.current.surface },
      },
    })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })
    glRef.current = { renderer, program, mesh }

    const resize = () => {
      const rect = host.getBoundingClientRect()
      renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height))
      program.uniforms.uRes.value = [rect.width, rect.height]
      renderer.render({ scene: mesh })
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    return () => {
      ro.disconnect()
      glRef.current = null
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    }
    // The renderer is built once per mount; props flow in through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const writeUniforms = (t: number, ease: number) => {
    const g = glRef.current
    if (!g) return
    const c = current.current
    const tg = targets.current
    ;(Object.keys(tg) as (keyof Targets)[]).forEach((k) => {
      c[k] += (tg[k] - c[k]) * ease
    })
    const u = g.program.uniforms
    u.uTime.value = t
    u.uProgress.value = c.progress
    u.uHalf.value = c.half
    u.uCalm.value = c.calm
    u.uFocus.value = c.focus
    u.uSurface.value = c.surface
    g.renderer.render({ scene: g.mesh })
  }

  useFrameLoop((t) => writeUniforms(t * 0.8 + 11, 0.035), !reducedMotion && visible)

  // Reduced motion: a composed still, re-drawn whenever the moment changes.
  useEffect(() => {
    if (!reducedMotion) return
    writeUniforms(14, 1)
  })

  const presenting = props.surface === 'present'
  const showRig = presenting && props.block?.kind !== 'title'
  const depth = targets.current.progress

  return (
    <div ref={hostRef} className="pi-water" data-surface={props.surface}>
      {presenting && (
        <div className="pi-sounding" style={{ '--pi-depth': depth } as React.CSSProperties}>
          <svg className="pi-sounding__scale" viewBox="0 0 24 100" preserveAspectRatio="none">
            {Array.from({ length: 33 }, (_, i) => (
              <line
                key={i}
                x1={i % 4 === 0 ? 8 : 15}
                x2="24"
                y1={i * 3.125}
                y2={i * 3.125}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          {showRig && (
            <div className="pi-sounding__rig">
              <LureRig interactive={false} lineAbove={1800} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
