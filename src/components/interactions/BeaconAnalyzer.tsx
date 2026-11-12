import { useMemo, useState } from 'react'
import { EvidenceChip, MonoLabel, SyntheticBadge } from '@/components/brand/Brand'

/* =========================================================================
   BEACON ANALYZER
   =========================================================================
   Signature interaction 4.

   Teaches: that beaconing is detected by statistical regularity rather
   than by any single connection, and that jitter raises the detection
   threshold without removing the signal — because no human activity
   clusters around a central interval the way a timer does.

   The student moves the jitter slider and watches the standard deviation
   climb while the distribution stays obviously clustered, next to a user
   traffic series that has no central tendency at all.
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

/* Deterministic pseudo-random so the chart is identical for every student
   in the room and the instructor can point at a specific spike. */
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

/** Bursty, heavy-tailed, long idle gaps. Nothing like a timer. */
function userIntervals(count: number): number[] {
  const rng = makeRng(99991)
  return Array.from({ length: count }, () => {
    const r = rng()
    if (r < 0.55) return Math.round(1 + rng() * 12) // rapid burst
    if (r < 0.85) return Math.round(30 + rng() * 240) // reading
    return Math.round(400 + rng() * 2600) // idle
  })
}

function stats(values: number[]) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
  const sd = Math.sqrt(variance)
  return { mean, sd, cv: mean ? sd / mean : 0 }
}

function Series({
  values,
  label,
  tone,
  max,
}: {
  values: number[]
  label: string
  tone: 'beacon' | 'user'
  max: number
}) {
  const s = stats(values)
  return (
    <div className="beacon__series" data-tone={tone}>
      <div className="beacon__series-head">
        <MonoLabel>{label}</MonoLabel>
        <span className="beacon__series-stat">
          mean {Math.round(s.mean)}s · sd {Math.round(s.sd)}s · sd/mean{' '}
          <strong>{s.cv.toFixed(2)}</strong>
        </span>
      </div>
      <div
        className="beacon__chart"
        role="img"
        aria-label={`${label}. Mean interval ${Math.round(s.mean)} seconds, standard deviation ${Math.round(
          s.sd,
        )} seconds, ratio of standard deviation to mean ${s.cv.toFixed(
          2,
        )}. ${tone === 'beacon' ? 'Bars are of near-identical height, clustered around the mean.' : 'Bar heights vary enormously with no central value.'}`}
      >
        {values.map((v, i) => (
          <span
            key={i}
            className="beacon__bar"
            style={{ height: `${Math.max(3, (v / max) * 100)}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function BeaconAnalyzer({ data }: { data: unknown }) {
  const [presetIndex, setPresetIndex] = useState(2)

  const valid = isData(data)
  const base = valid ? data.intervalSeconds : 240
  const preset = valid ? data.jitterPresets[presetIndex] : undefined

  const beacon = useMemo(
    () => beaconIntervals(base, preset?.jitter ?? 0.25, 40),
    [base, preset?.jitter],
  )
  const user = useMemo(() => userIntervals(40), [])

  if (!valid || !preset) {
    return <p className="interaction__error">This exercise could not load its data.</p>
  }

  const beaconStats = stats(beacon)
  const userStats = stats(user)
  const max = Math.max(...beacon, ...user)

  return (
    <div className="ix ix--beacon">
      <SyntheticBadge>
        Generated for this exercise with a fixed seed, so every student sees the same series.
      </SyntheticBadge>

      <div className="beacon__controls">
        <div className="beacon__control-head">
          <MonoLabel>Jitter applied to a {base}-second beacon</MonoLabel>
          <span className="beacon__current">{preset.label}</span>
        </div>
        <div className="beacon__presets" role="group" aria-label="Jitter level">
          {data.jitterPresets.map((p, i) => (
            <button
              key={p.label}
              type="button"
              className="beacon__preset"
              aria-pressed={i === presetIndex}
              onClick={() => setPresetIndex(i)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="beacon__preset-note">{preset.note}</p>
      </div>

      <div className="beacon__charts">
        <Series values={beacon} label="C2 beacon — interval between connections" tone="beacon" max={max} />
        <Series values={user} label={data.comparison.label} tone="user" max={max} />
      </div>

      <div className="beacon__verdict">
        <EvidenceChip kind="observation" label="Timing in this synthetic sample" />
        <p>
          At {preset.label.toLowerCase()} the beacon's standard deviation is{' '}
          <strong>{beaconStats.cv.toFixed(2)}×</strong> its mean. User traffic sits at{' '}
          <strong>{userStats.cv.toFixed(2)}×</strong>. An exact-interval rule has already failed
          here. The synthetic series still differ in dispersion, which can support a timing-based
          investigation. Timing alone does not prove command-and-control traffic: legitimate
          automation can also repeat regularly.
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
