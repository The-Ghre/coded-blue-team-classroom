import { useEffect, useRef, useState } from 'react'
import { Mesh, Program, Renderer, Texture, Triangle } from 'ogl'
import type { StageProps } from '../types'
import { useFrameLoop, useIsVisible } from '@/motion'
import { drawMotif, motifFor, MOTIF_H, MOTIF_W, type Motif } from './motifs'

/* =========================================================================
   THE TRAY
   =========================================================================
   The lesson's ambient layer is a developing tray under an amber safelight.
   The developer rocks slowly; a latent image builds density out of grain;
   every slide change sends one wave across the tray and the next image
   begins to develop. What develops is the slide's argument, drawn without
   words (see motifs.ts) — the timer's roll beside the person's roll, the
   one query that resolved, the region of memory that holds a binary.

   Cheap by construction: one full-screen triangle, two small textures, a
   capped pixel ratio, paused when hidden, one still frame under reduced
   motion. If WebGL is unavailable, a static safelight wash stands in.
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
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;
uniform sampler2D uA;
uniform sampler2D uB;
uniform float uMix;
uniform float uDense;
uniform float uAgit;
uniform float uDir;
uniform float uPage;
uniform float uStill;
uniform sampler2D uMask;
uniform float uMaskOn;

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

vec2 coverUv(vec2 uv) {
  float va = uRes.x / uRes.y;
  float ma = ${(MOTIF_W / MOTIF_H).toFixed(4)};
  vec2 s = va > ma ? vec2(1.0, ma / va) : vec2(va / ma, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  float t = uTime;
  float moving = 1.0 - uStill;

  // The tray rocks: two slow waves across the developer.
  vec2 p = vec2(uv.x * aspect, uv.y);
  float rock = sin(t * 0.55) * moving;
  float w1 = sin(p.x * 5.0 + p.y * 2.0 - t * 0.8 + rock * 1.5);
  float w2 = sin(p.y * 7.0 - p.x * 2.6 + t * 0.63);
  vec2 disp = vec2(w1, w2) * 0.0035 * moving;

  // One wave crosses the tray after each slide change, in the direction of travel.
  float front = uDir > 0.0 ? uv.x : 1.0 - uv.x;
  float band = sin(front * 14.0 - (1.0 - uAgit) * 18.0);
  disp.x += band * 0.007 * uAgit * uDir;
  vec2 q = coverUv(uv + disp);

  // The safelight, above and to the right.
  vec2 d = (uv - vec2(0.66, 1.18)) * vec2(aspect, 1.0);
  float lamp = exp(-dot(d, d) * 1.35);
  vec3 room = vec3(0.071, 0.035, 0.024);
  vec3 amber = vec3(1.0, 0.56, 0.2);
  vec3 col = room + amber * lamp * mix(0.2, 0.12, uPage);

  // Latent image to silver: an induction period, then density climbs.
  float a = texture2D(uA, q).r;
  float b = texture2D(uB, q).r;
  float dev = smoothstep(0.08, 1.0, uMix);
  float clear = 1.0 - smoothstep(0.0, 0.45, uMix);
  float m = max(a * clear, b * dev);
  float clump = vnoise(gl_FragCoord.xy * 0.45 + 3.0) * 0.5 + vnoise(gl_FragCoord.xy * 0.09) * 0.5;
  float silver = smoothstep(0.12, 0.85, m * (0.7 + 0.6 * clump)) * uDense;
  // The reading plane stays clear: no silver develops under text. On a
  // projected slide the mask is measured from the slide's own text blocks;
  // on a reading page the image keeps to the empty right-hand margin.
  silver *= 1.0 - 0.96 * texture2D(uMask, uv).r * uMaskOn;
  silver *= mix(1.0, smoothstep(0.76, 0.9, uv.x) * step(1.25, aspect), uPage);
  col += amber * silver * mix(0.24, 0.14, uPage) * (0.5 + lamp);

  // Glints where the liquid catches the lamp.
  float glint = pow(max(0.0, w1 * w2), 6.0) * lamp;
  col += amber * glint * 0.05 * moving;

  // Grain at film rate. Tiny amplitude, so it reads as texture, never flicker.
  float gt = floor(t * 12.0) * moving;
  col += (hash(gl_FragCoord.xy + gt * 37.0) - 0.5) * 0.028;

  // The tray's walls.
  vec2 v = (uv - 0.5) * vec2(1.0, 1.15);
  col *= 1.0 - 0.55 * dot(v, v);
  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`

interface Tray {
  renderer: Renderer
  program: Program
  mesh: Mesh
  canvasA: HTMLCanvasElement
  canvasB: HTMLCanvasElement
  texA: Texture
  texB: Texture
  mask: HTMLCanvasElement
  texMask: Texture
  motif: Motif | null
  mixStart: number
  agitAt: number
  dir: number
}

const DEVELOP_SECONDS = 2.4
const MASK_SCALE = 1 / 6

/* Elements that carry words. Their boxes are kept clear of silver. */
const TEXT_SELECTOR =
  'h1,h2,h3,h4,p,li,dt,dd,th,td,figcaption,summary,button,label,code,.mono-label,.duration,.ev,.nmf-print,.nmf-xprint,.evidence,.code'

/** Paint the boxes of every text element on the slide into the mask. */
function paintMask(mask: HTMLCanvasElement, host: HTMLElement) {
  const ctx = mask.getContext('2d')
  if (!ctx) return
  const hr = host.getBoundingClientRect()
  const w = Math.max(1, Math.round(hr.width * MASK_SCALE))
  const h = Math.max(1, Math.round(hr.height * MASK_SCALE))
  if (mask.width !== w || mask.height !== h) {
    mask.width = w
    mask.height = h
  }
  ctx.filter = 'none'
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, w, h)
  const slide = host.closest('.present')?.querySelector('.present__slide')
  if (!slide) return
  ctx.filter = 'blur(3px)'
  ctx.fillStyle = '#fff'
  const pad = 18
  slide.querySelectorAll(TEXT_SELECTOR).forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.width < 1 || r.height < 1 || r.bottom < hr.top || r.top > hr.bottom) return
    ctx.fillRect(
      (r.left - hr.left - pad) * MASK_SCALE,
      (r.top - hr.top - pad) * MASK_SCALE,
      (r.width + pad * 2) * MASK_SCALE,
      (r.height + pad * 2) * MASK_SCALE,
    )
  })
  ctx.filter = 'none'
}

export function Backdrop(props: StageProps) {
  const { surface, half, block, slideIndex, direction, focusMode, reducedMotion } = props
  const host = useRef<HTMLDivElement>(null)
  const tray = useRef<Tray | null>(null)
  /* Seconds on the tray's clock. Starts at 3 so the frame loop (which
     reports t + 3) continues it rather than jumping, and the first image
     develops from blank paper on arrival. */
  const clock = useRef(3)
  const visible = useIsVisible(host)
  const [failed, setFailed] = useState(false)
  const motif = motifFor(surface, half, block)
  const page = surface === 'present' ? 0 : 1

  /* Build once. */
  useEffect(() => {
    const el = host.current
    if (!el) return
    let renderer: Renderer
    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, 1.5) * 0.6,
        alpha: false,
        antialias: false,
        powerPreference: 'low-power',
      })
    } catch {
      setFailed(true)
      return
    }
    const gl = renderer.gl
    gl.clearColor(0.071, 0.035, 0.024, 1)
    const makeCanvas = () => {
      const c = document.createElement('canvas')
      c.width = MOTIF_W
      c.height = MOTIF_H
      const ctx = c.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, MOTIF_W, MOTIF_H)
      }
      return c
    }
    const canvasA = makeCanvas()
    const canvasB = makeCanvas()
    const texOpts = {
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    }
    const texA = new Texture(gl, { image: canvasA, ...texOpts })
    const texB = new Texture(gl, { image: canvasB, ...texOpts })
    const mask = document.createElement('canvas')
    mask.width = 1
    mask.height = 1
    const texMask = new Texture(gl, { image: mask, ...texOpts })
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: [1, 1] },
        uA: { value: texA },
        uB: { value: texB },
        uMix: { value: 0 },
        uDense: { value: 0.75 },
        uAgit: { value: 0 },
        uDir: { value: 1 },
        uPage: { value: page },
        uStill: { value: 0 },
        uMask: { value: texMask },
        uMaskOn: { value: page ? 0 : 1 },
      },
    })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })
    const canvas = gl.canvas as HTMLCanvasElement
    canvas.className = 'nmf-tray__gl'
    el.appendChild(canvas)

    const resize = () => {
      const r = el.getBoundingClientRect()
      renderer.setSize(Math.max(1, r.width), Math.max(1, r.height))
      program.uniforms.uRes.value = [r.width, r.height]
    }
    resize()
    const ro = new ResizeObserver(() => {
      resize()
      // A resize clears the buffer; a still frame must be redrawn.
      if (tray.current) {
        refreshMask(tray.current)
        renderOnce(tray.current)
      }
    })
    ro.observe(el)

    tray.current = {
      renderer,
      program,
      mesh,
      canvasA,
      canvasB,
      texA,
      texB,
      mask,
      texMask,
      motif: null,
      mixStart: 0,
      agitAt: -100,
      dir: 1,
    }

    return () => {
      ro.disconnect()
      canvas.remove()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      tray.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function uniformsAt(tr: Tray, t: number, still: boolean) {
    const u = tr.program.uniforms
    u.uTime.value = t
    u.uStill.value = still ? 1 : 0
    /* Development and agitation run on the wall clock, not the frame clock:
       a throttled or backgrounded tab still finishes developing. */
    const wall = performance.now() / 1000
    u.uMix.value = still ? 1 : Math.min(1, (wall - tr.mixStart) / DEVELOP_SECONDS)
    u.uAgit.value = still ? 0 : Math.max(0, 1 - (wall - tr.agitAt) / 1.1)
    u.uDir.value = tr.dir
    u.uPage.value = page
    let dense = page ? 0.62 : focusMode ? 1 : 0.8
    if (page && !still) {
      /* On a reading page the print develops further the deeper you read. */
      const max = document.documentElement.scrollHeight - window.innerHeight
      dense += 0.3 * (max > 0 ? window.scrollY / max : 0)
    }
    u.uDense.value = dense
  }

  function refreshMask(tr: Tray) {
    const el = host.current
    if (!el || page) return
    paintMask(tr.mask, el)
    tr.texMask.image = tr.mask
    tr.texMask.needsUpdate = true
  }

  function renderOnce(tr: Tray) {
    uniformsAt(tr, clock.current, reducedMotion)
    tr.renderer.render({ scene: tr.mesh })
  }

  /* A new latent image: the old one clears while the new one develops. */
  useEffect(() => {
    const tr = tray.current
    if (!tr || tr.motif === motif) return
    const ctxA = tr.canvasA.getContext('2d')
    const ctxB = tr.canvasB.getContext('2d')
    if (!ctxA || !ctxB) return
    if (tr.motif) drawMotif(ctxA, tr.motif)
    drawMotif(ctxB, motif)
    tr.texA.image = tr.canvasA
    tr.texA.needsUpdate = true
    tr.texB.image = tr.canvasB
    tr.texB.needsUpdate = true
    tr.motif = motif
    tr.mixStart = performance.now() / 1000
    if (reducedMotion || !visible) renderOnce(tr)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motif, failed])

  /* Each slide change sends one wave across the tray. */
  useEffect(() => {
    const tr = tray.current
    if (!tr || direction === 0) return
    tr.agitAt = performance.now() / 1000
    tr.dir = direction
  }, [slideIndex, direction])

  /* Keep the clear field under the text current: after each slide change
     (once the DOM has swapped and again once transitions settle), when the
     slide scrolls, and after any click that may open or close content. */
  useEffect(() => {
    if (page) return
    let raf = 0
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const tr = tray.current
        if (!tr) return
        refreshMask(tr)
        if (reducedMotion || !visible) renderOnce(tr)
      })
    }
    const timers = [0, 120, 720].map((ms) => window.setTimeout(schedule, ms))
    const stage = host.current?.closest('.present')?.querySelector('.present__stage')
    const onClick = () => {
      window.setTimeout(schedule, 40)
      window.setTimeout(schedule, 520)
    }
    stage?.addEventListener('scroll', schedule, { passive: true })
    document.addEventListener('click', onClick, true)
    return () => {
      timers.forEach(clearTimeout)
      cancelAnimationFrame(raf)
      stage?.removeEventListener('scroll', schedule)
      document.removeEventListener('click', onClick, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIndex, page, reducedMotion])

  /* Still frame under reduced motion, and whenever focus mode changes it. */
  useEffect(() => {
    const tr = tray.current
    if (tr && reducedMotion) renderOnce(tr)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, focusMode, motif])

  useFrameLoop((t) => {
    clock.current = t + 3
    const tr = tray.current
    if (!tr) return
    uniformsAt(tr, clock.current, false)
    tr.renderer.render({ scene: tr.mesh })
  }, !reducedMotion && visible && !failed)

  return <div ref={host} className={`nmf-tray nmf-tray--${surface}${failed ? ' nmf-tray--fallback' : ''}`} />
}
