import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { InteractionBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { EvidenceChip, MonoLabel, SyntheticBadge } from '@/components/brand/Brand'
import { useReducedMotion } from '@/motion'
import { Detail, Footer, Head } from '../parts'

/* =========================================================================
   BEACON ANALYZER — as an exposure print
   =========================================================================
   The shared Beacon Analyzer, rebuilt in the darkroom's vocabulary with its
   teaching behaviour intact: the same seeded series, the same statistics,
   the same presets, notes, verdict, signals table and port list.

   What the darkroom adds is one more way of seeing the same numbers. Each
   interval exposes the paper at its own length on a log scale, so intervals
   that cluster stack their silver into one dark band. A timer prints a
   band; a person prints a smear. One control re-exposes everything: the
   roll, the frame heights and the print all answer the jitter preset.
   ========================================================================= */

interface JitterPreset {
  label: string
  jitter: number
  note: string
}

interface Data {
  intervalSeconds: number
  jitterPresets: JitterPreset[]
  comparison: { label: string; note: string }
  metrics: { label: string; beacon: string; user: string }[]
  ports: { port: string; use: string; note: string }[]
}

function isData(d: unknown): d is Data {
  return !!d && typeof d === 'object' && Array.isArray((d as Data).jitterPresets)
}

/* Same generator and seeds as the shared analyzer, so every room — and
   every lesson world — shows the identical series. */
function makeRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

function beaconIntervals(base: number, jitter: number, count: number): number[] {
  const rng = makeRng(424242)
  return Array.from({ length: count }, () => {
    const delta = (rng() * 2 - 1) * jitter * base
    return Math.max(1, Math.round(base + delta))
  })
}

function userIntervals(count: number): number[] {
  const rng = makeRng(99991)
  return Array.from({ length: count }, () => {
    const r = rng()
    if (r < 0.55) return Math.round(1 + rng() * 12)
    if (r < 0.85) return Math.round(30 + rng() * 240)
    return Math.round(400 + rng() * 2600)
  })
}

function stats(values: number[]) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
  const sd = Math.sqrt(variance)
  return { mean, sd, cv: mean ? sd / mean : 0 }
}

/* ---------- One roll: arrivals on a shared clock, intervals as frames ---- */

function Roll({
  values,
  label,
  tone,
  max,
  span,
}: {
  values: number[]
  label: string
  tone: 'beacon' | 'user'
  max: number
  span: number
}) {
  const s = stats(values)
  let t = 0
  const arrivals = values.map((v) => (t += v))
  return (
    <div className="beacon__series nmf-roll2" data-tone={tone}>
      <div className="beacon__series-head">
        <MonoLabel>{label}</MonoLabel>
        <span className="beacon__series-stat">
          mean {Math.round(s.mean)}s · sd {Math.round(s.sd)}s · sd/mean <strong>{s.cv.toFixed(2)}</strong>
        </span>
      </div>
      <div
        className="nmf-roll2__body"
        role="img"
        aria-label={`${label}. Mean interval ${Math.round(s.mean)} seconds, standard deviation ${Math.round(
          s.sd,
        )} seconds, ratio of standard deviation to mean ${s.cv.toFixed(2)}. ${
          tone === 'beacon'
            ? 'Bars are of near-identical height, clustered around the mean.'
            : 'Bar heights vary enormously with no central value.'
        }`}
      >
        <div className="nmf-roll2__arrivals" aria-hidden="true">
          {arrivals.map((a, i) => (
            <span key={i} className="nmf-roll2__arrival" style={{ '--x': a / span } as CSSProperties} />
          ))}
        </div>
        <div className="beacon__chart nmf-roll2__frames" aria-hidden="true">
          {values.map((v, i) => (
            <span
              key={i}
              className="beacon__bar"
              style={{ height: `${Math.max(3, (v / max) * 100)}%`, '--i': i } as CSSProperties}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---------- The exposure print --------------------------------------------- */

const LOG_MAX = Math.log10(3600)
const AXIS = [
  { s: 1, label: '1 s' },
  { s: 10, label: '10 s' },
  { s: 60, label: '1 min' },
  { s: 240, label: '4 min' },
  { s: 600, label: '10 min' },
  { s: 3600, label: '1 h' },
]
const xOf = (sec: number) => Math.log10(Math.max(1, sec)) / LOG_MAX

function exposure(values: number[], width: number) {
  const acc = new Float32Array(width)
  const sigma = 0.012 * width
  for (const v of values) {
    const cx = xOf(v) * (width - 1)
    const lo = Math.max(0, Math.floor(cx - sigma * 3))
    const hi = Math.min(width - 1, Math.ceil(cx + sigma * 3))
    for (let x = lo; x <= hi; x++) acc[x] += Math.exp(-((x - cx) ** 2) / (2 * sigma * sigma))
  }
  return acc
}

function ExposurePrint({ beacon, user }: { beacon: number[]; user: number[] }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const raf = useRef(0)

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const ctx = el.getContext('2d')
    if (!ctx) return
    const styles = getComputedStyle(el)
    const paper = styles.getPropertyValue('--nmf-paper').trim() || '#efe6d6'
    const ink = styles.getPropertyValue('--nmf-ink').trim() || '#1c1410'

    let start = 0
    const paint = (progress: number) => {
      const rect = el.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(1, Math.round(rect.width * dpr))
      const h = Math.max(1, Math.round(rect.height * dpr))
      if (el.width !== w || el.height !== h) {
        el.width = w
        el.height = h
      }
      ctx.fillStyle = paper
      ctx.fillRect(0, 0, w, h)
      const rows = [beacon, user]
      const rowH = h / 2
      /* A developer curve: nothing, then density climbs and settles. */
      const dev = 1 - Math.pow(1 - progress, 3)
      rows.forEach((values, r) => {
        const acc = exposure(values, w)
        for (let x = 0; x < w; x++) {
          const d = (1 - Math.exp(-acc[x] * 0.22)) * dev
          if (d < 0.01) continue
          ctx.globalAlpha = Math.min(1, d)
          ctx.fillStyle = ink
          ctx.fillRect(x, r * rowH + 4 * dpr, 1, rowH - 8 * dpr)
        }
      })
      ctx.globalAlpha = 1
    }

    const draw = (now: number) => {
      if (!start) start = now
      const p = Math.min(1, (now - start) / 520)
      paint(p)
      if (p < 1) raf.current = requestAnimationFrame(draw)
    }

    cancelAnimationFrame(raf.current)
    if (reduced) paint(1)
    else raf.current = requestAnimationFrame(draw)

    const ro = new ResizeObserver(() => paint(1))
    ro.observe(el)
    return () => {
      cancelAnimationFrame(raf.current)
      ro.disconnect()
    }
  }, [beacon, user, reduced])

  return (
    /* Screen only: `hidden` keeps it off paper, the screen stylesheet reveals it. */
    <figure className="nmf-xprint nmf-decor" hidden>
      <div className="nmf-xprint__plate" aria-hidden="true">
        <span className="nmf-xprint__row-label">Beacon</span>
        <span className="nmf-xprint__row-label">User</span>
        <canvas ref={canvas} className="nmf-xprint__canvas" />
        <div className="nmf-xprint__axis">
          {AXIS.map((a) => (
            <span key={a.s} className="nmf-xprint__tick" style={{ '--x': xOf(a.s) } as CSSProperties}>
              {a.label}
            </span>
          ))}
        </div>
      </div>
      <figcaption className="nmf-xprint__caption">
        Exposure print. Each interval adds density at its own length, on a log scale from one second to one
        hour. Intervals that cluster stack into one dark band; intervals with no central value spread into a
        smear.
      </figcaption>
    </figure>
  )
}

/* ---------- The analyzer ------------------------------------------------- */

function BeaconDarkroom({ data }: { data: unknown }) {
  const [presetIndex, setPresetIndex] = useState(2)
  const valid = isData(data)
  const base = valid ? data.intervalSeconds : 240
  const preset = valid ? data.jitterPresets[presetIndex] : undefined

  const beacon = useMemo(() => beaconIntervals(base, preset?.jitter ?? 0.25, 40), [base, preset?.jitter])
  const user = useMemo(() => userIntervals(40), [])

  if (!valid || !preset) {
    return <p className="interaction__error">This exercise could not load its data.</p>
  }

  const beaconStats = stats(beacon)
  const userStats = stats(user)
  const max = Math.max(...beacon, ...user)
  const sum = (v: number[]) => v.reduce((a, b) => a + b, 0)
  const span = Math.max(sum(beacon), sum(user))

  return (
    <div className="ix ix--beacon nmf-beacon">
      <SyntheticBadge>
        Generated for this exercise with a fixed seed, so every student sees the same series.
      </SyntheticBadge>

      <div className="beacon__controls nmf-beacon__controls">
        <div className="beacon__control-head">
          <MonoLabel>Jitter applied to a {base}-second beacon</MonoLabel>
          <span className="beacon__current">{preset.label}</span>
        </div>
        <div className="beacon__presets nmf-beacon__presets" role="group" aria-label="Jitter level">
          {data.jitterPresets.map((p, i) => (
            <button
              key={p.label}
              type="button"
              className="beacon__preset nmf-beacon__preset"
              aria-pressed={i === presetIndex}
              style={{ '--step': i, '--steps': data.jitterPresets.length } as CSSProperties}
              onClick={() => setPresetIndex(i)}
            >
              <span className="nmf-beacon__preset-density" aria-hidden="true" />
              <span className="nmf-beacon__preset-label">{p.label}</span>
            </button>
          ))}
        </div>
        <p className="beacon__preset-note" aria-live="polite">
          {preset.note}
        </p>
      </div>

      <div className="beacon__charts nmf-beacon__rolls">
        <Roll values={beacon} label="C2 beacon — interval between connections" tone="beacon" max={max} span={span} />
        <Roll values={user} label={data.comparison.label} tone="user" max={max} span={span} />
      </div>

      <ExposurePrint beacon={beacon} user={user} />

      <div className="beacon__verdict">
        <EvidenceChip kind="confirmed" label="What survives the jitter" />
        <p>
          At {preset.label.toLowerCase()} the beacon's standard deviation is{' '}
          <strong>{beaconStats.cv.toFixed(2)}×</strong> its mean. User traffic sits at{' '}
          <strong>{userStats.cv.toFixed(2)}×</strong>. An exact-interval rule has already failed here — and a test
          that asks whether intervals cluster around a central value has not, because{' '}
          {userStats.cv > 1 ? 'user traffic has no central value to cluster around' : 'the shapes remain different in kind'}.
        </p>
      </div>

      <div className="beacon__metrics">
        <MonoLabel>Beyond timing — the other signals</MonoLabel>
        <table className="beacon__table">
          <thead>
            <tr>
              <th scope="col">Signal</th>
              <th scope="col">Beacon</th>
              <th scope="col">User traffic</th>
            </tr>
          </thead>
          <tbody>
            {data.metrics.map((m) => (
              <tr key={m.label}>
                <th scope="row">{m.label}</th>
                <td>{m.beacon}</td>
                <td>{m.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="beacon__ports">
        <summary>Common C2 ports and what each one costs the attacker</summary>
        <ul>
          {data.ports.map((p) => (
            <li key={p.port}>
              <code>{p.port}</code>
              <span className="beacon__port-use">{p.use}</span>
              <span className="beacon__port-note">{p.note}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}

/* ---------- Block override ------------------------------------------------ */

export function Interaction({ block, mode, Default }: BlockOverrideProps<InteractionBlock>) {
  if (block.component !== 'beacon-analyzer') return <Default block={block} mode={mode} />
  return (
    <section className="block block--interaction nmf-ix">
      <Head block={block} />
      {block.lead && <p className="lead">{block.lead}</p>}
      <div className="interaction__teaches">
        <MonoLabel>What this teaches</MonoLabel>
        <p>{block.teaches}</p>
      </div>
      <BeaconDarkroom data={block.data} />
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}
