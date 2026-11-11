import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { InteractionBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { EvidenceChip, MonoLabel, SyntheticBadge } from '@/components/brand/Brand'
import { Detail, Footer, Head } from '../parts'

/* =========================================================================
   BEACON ANALYZER — as a pinned cylinder
   =========================================================================
   The shared Beacon Analyzer, rebuilt in the music box's vocabulary with
   its teaching behaviour intact: the same seeded series, the same
   statistics, the same presets, notes, verdict, signals table and ports.

   What the music box adds is two more ways of meeting the same numbers.
   The pin print sets each interval as a pin at its own length on a log
   scale: a timer stacks one tall column, a person scatters. And the two
   series can be heard, opt-in, time-compressed: a beat against a stutter.
   One control re-pins everything: arrivals, teeth, print and sound all
   answer the jitter preset.
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

/* ---------- The pin print ---------------------------------------------------
   Each interval is a pin set at its own length on a log scale, one second
   to one hour. Pins that land on the same beat stack on each other: the
   beacon stacks above the line, the user below it. A timer builds one tall
   column; a person scatters pins along the whole scale.
   --------------------------------------------------------------------------- */

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
const BINS = 56
/* Half the plate's height in px, kept in step with the CSS (the smaller,
   phone value), so the tallest possible stack always fits. */
const HALF_PX = 108

function stacks(values: number[]) {
  const count = new Array(BINS).fill(0)
  return values.map((v) => {
    const b = Math.min(BINS - 1, Math.floor(xOf(v) * BINS))
    return { b, k: count[b]++ }
  })
}

function PinPrint({ beacon, user }: { beacon: number[]; user: number[] }) {
  const sb = stacks(beacon)
  const su = stacks(user)
  const tallest = Math.max(1, ...sb.map((p) => p.k + 1), ...su.map((p) => p.k + 1))
  const pitch = Math.min(10, (HALF_PX - 10) / tallest)
  const size = Math.max(4, Math.min(8, pitch * 0.85))
  const left = (b: number) => `${((b + 0.5) / BINS) * 100}%`
  return (
    <figure className="nmf-pinprint nmf-decor" hidden>
      <div className="nmf-pinprint__plate" aria-hidden="true">
        <span className="nmf-pinprint__label nmf-pinprint__label--beacon">Beacon</span>
        <span className="nmf-pinprint__label nmf-pinprint__label--user">User</span>
        <div className="nmf-pinprint__field" style={{ '--pin': `${size}px` } as CSSProperties}>
          {AXIS.map((a) => (
            <span key={a.s} className="nmf-pinprint__grid" style={{ left: `${xOf(a.s) * 100}%` }} />
          ))}
          <span className="nmf-pinprint__line" />
          {sb.map((p, i) => (
            <span
              key={`b${i}`}
              className="nmf-pinprint__pin nmf-pinprint__pin--beacon"
              style={
                {
                  left: left(p.b),
                  transform: `translateY(${-6 - p.k * pitch}px)`,
                  '--i': i,
                } as CSSProperties
              }
            />
          ))}
          {su.map((p, i) => (
            <span
              key={`u${i}`}
              className="nmf-pinprint__pin nmf-pinprint__pin--user"
              style={{ left: left(p.b), transform: `translateY(${6 + p.k * pitch}px)` } as CSSProperties}
            />
          ))}
        </div>
        <div className="nmf-pinprint__axis">
          {AXIS.map((a) => (
            <span
              key={a.s}
              className="nmf-pinprint__tick"
              data-minor={a.s === 10 || a.s === 600}
              style={{ '--x': xOf(a.s) } as CSSProperties}
            >
              {a.label}
            </span>
          ))}
        </div>
      </div>
      <figcaption className="nmf-pinprint__caption">
        Pin print. Each interval is a pin set at its own length, on a log scale from one second to one hour; pins
        on the same length stack. Intervals that cluster build one tall column; intervals with no central value
        scatter along the scale.
      </figcaption>
    </figure>
  )
}

/* ---------- Listening ------------------------------------------------------
   Opt-in sonification of the same two series. Time is compressed so the
   beacon's 240-second beat becomes a quarter of a second, and the user's
   intervals are compressed by the same factor: the beacon ticks evenly, the
   user's traffic stutters, pauses and bursts. Nothing plays until asked.
   --------------------------------------------------------------------------- */

type Playing = 'beacon' | 'user' | null

function useListen() {
  const ctxRef = useRef<AudioContext | null>(null)
  const stopAt = useRef(0)
  const timer = useRef(0)
  const [playing, setPlaying] = useState<Playing>(null)

  const stop = () => {
    window.clearTimeout(timer.current)
    const ctx = ctxRef.current
    if (ctx) {
      void ctx.close()
      ctxRef.current = null
    }
    setPlaying(null)
  }

  const play = (which: Exclude<Playing, null>, intervals: number[], base: number) => {
    stop()
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    const ctx = new AC()
    ctxRef.current = ctx
    const scale = 0.25 / base
    const freq = which === 'beacon' ? 1046.5 : 783.99
    let t = ctx.currentTime + 0.15
    for (const v of intervals) {
      t += v * scale
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.34)
    }
    stopAt.current = t + 0.4
    setPlaying(which)
    timer.current = window.setTimeout(stop, (stopAt.current - ctx.currentTime) * 1000)
  }

  useEffect(() => stop, [])
  return { playing, play, stop }
}

function Listen({ beacon, user, base }: { beacon: number[]; user: number[]; base: number }) {
  const { playing, play, stop } = useListen()
  const seconds = (v: number[]) => Math.round(v.reduce((a, b) => a + b, 0) * (0.25 / base))
  return (
    <div className="nmf-listen" role="group" aria-label="Listen to the two series">
      <span className="nmf-listen__label">Listen</span>
      <button
        type="button"
        className="nmf-listen__btn"
        aria-pressed={playing === 'beacon'}
        onClick={() => (playing === 'beacon' ? stop() : play('beacon', beacon, base))}
      >
        {playing === 'beacon' ? 'Stop' : 'Beacon'}
      </button>
      <button
        type="button"
        className="nmf-listen__btn"
        aria-pressed={playing === 'user'}
        onClick={() => (playing === 'user' ? stop() : play('user', user, base))}
      >
        {playing === 'user' ? 'Stop' : 'User traffic'}
      </button>
      <span className="nmf-listen__note" aria-live="polite">
        {playing === 'beacon'
          ? `Playing the beacon: 40 connections in about ${seconds(beacon)} seconds.`
          : playing === 'user'
            ? `Playing user traffic: 40 connections in about ${seconds(user)} seconds.`
            : 'Sound plays only when you press. Time is compressed: one 240-second beat becomes a quarter second.'}
      </span>
    </div>
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

      <PinPrint beacon={beacon} user={user} />
      <Listen beacon={beacon} user={user} base={base} />

      <div className="beacon__charts nmf-beacon__rolls">
        <Roll values={beacon} label="C2 beacon — interval between connections" tone="beacon" max={max} span={span} />
        <Roll values={user} label={data.comparison.label} tone="user" max={max} span={span} />
      </div>

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
