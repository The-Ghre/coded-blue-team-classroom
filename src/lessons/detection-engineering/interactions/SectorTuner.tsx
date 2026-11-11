import { useEffect, useMemo, useRef, useState } from 'react'
import { EvidenceChip, MonoLabel } from '@/components/brand/Brand'
import { useIsVisible, useReducedMotion } from '@/motion'
import { rng } from '../chart'
import { readInk } from '../palette'
import { useBallistic, usePrinting } from '../hooks'
import { NoiseGlyph, ObscuredGlyph, SyntheticGlyph, VesselGlyph } from '../glyphs'

/* =========================================================================
   SECTOR TUNER — the rule builder, drawn as a sector light
   =========================================================================
   Same exercise, same arithmetic and the same verdicts as the shared Rule
   Builder (src/components/interactions/RuleBuilder.tsx); only the form is
   this lesson's.

   The rule is a light. Its sector is exactly as wide as the noise it lets
   through: the fan holds one mark for every benign event in the corpus,
   and exactly `falsePositives` of them sit inside the lit sector, nearest
   the axis first. The twelve attack chains sail up the channel and are lit
   or pass dark by the true-positive count. An exclusion is drawn as an
   obscured sector — the chart's own term for an arc the light cannot
   reach — with the path it opens for an attacker who satisfies it.
   ========================================================================= */

interface Condition {
  id: string
  label: string
  description: string
  truePositives: number
  falsePositives: number
}

interface Data {
  corpusSize: number
  description: string
  conditions: Condition[]
  notes: string[]
}

function isData(d: unknown): d is Data {
  return !!d && typeof d === 'object' && Array.isArray((d as Data).conditions)
}

const ATTACK_CHAINS = 12

/** The shared Rule Builder's computation, kept identical. */
function computeResult(conditions: Condition[], selected: string[]) {
  const chosen = conditions.filter((c) => selected.includes(c.id))
  if (!chosen.length) return null
  const positives = chosen.filter((c) => c.falsePositives >= 0)
  const exclusions = chosen.filter((c) => c.falsePositives < 0)
  if (!positives.length) return null

  const truePositives = Math.min(...positives.map((c) => c.truePositives))
  const baseFp = Math.min(...positives.map((c) => c.falsePositives))
  const narrowing = Math.max(0, positives.length - 1)
  let falsePositives = Math.round(baseFp / Math.pow(2.4, narrowing))
  for (const ex of exclusions) {
    falsePositives = Math.max(0, falsePositives + ex.falsePositives)
  }
  falsePositives = Math.max(0, falsePositives)

  const totalAlerts = truePositives + falsePositives
  const precision = totalAlerts ? Math.round((truePositives / totalAlerts) * 100) : 0
  const recall = Math.round((truePositives / 12) * 100)
  return { truePositives, falsePositives, totalAlerts, precision, recall, excluded: exclusions.length > 0 }
}

type Result = NonNullable<ReturnType<typeof computeResult>>

/** The shared Rule Builder's verdicts, word for word. */
function verdictFor(result: Result | null) {
  if (!result) return null
  if (result.recall < 50) {
    return {
      kind: 'uncertain' as const,
      label: 'Too narrow',
      text: `This rule catches ${result.recall}% of the real attack chains in the corpus. Its precision looks excellent because it barely fires. A rule this specific is defeated by an attacker changing one argument — which is exactly what they do when a rule is published.`,
    }
  }
  if (result.falsePositives > 60) {
    return {
      kind: 'uncertain' as const,
      label: 'Too noisy',
      text: `${result.falsePositives} false positives a day is a rule on its way to being ignored. Analysts stop reading it, and the day it is real is the day it gets dismissed in four seconds. Narrow it with a relationship condition or a verified exclusion — not by disabling it.`,
    }
  }
  if (result.precision >= 60 && result.recall >= 70) {
    return {
      kind: 'confirmed' as const,
      label: 'Deployable',
      text: `${result.recall}% recall at ${result.precision}% precision. Every alert is worth a human's time and the rule still catches most of the real chains. Now write the falsepositives section honestly, set status to experimental, and validate it against clean production data before it goes live.`,
    }
  }
  return {
    kind: 'hypothesis' as const,
    label: 'Workable, not yet tuned',
    text: `${result.recall}% recall at ${result.precision}% precision. This would function. Before deploying it, find the specific legitimate activity producing those ${result.falsePositives} false positives and write an exclusion that names more than one field.`,
  }
}

/* ---------------------------------------------------------------------------
   The fan
   --------------------------------------------------------------------------- */

const MAX_DEG = 82
const WEDGE: [number, number] = [19, 27] // obscured sector, degrees from the axis
const CAUGHT_ORDER = [5, 2, 9, 0, 7, 11, 3, 8, 1, 10, 4, 6]

interface Mark {
  a: number // degrees from the axis, signed
  r: number // 0..1 of the radius
  alpha: number
}

function useMarks(benign: number) {
  return useMemo(() => {
    const r = rng(2000)
    const marks: Mark[] = Array.from({ length: benign }, () => ({
      a: (r() * 2 - 1) * MAX_DEG,
      r: 0.2 + 0.78 * Math.sqrt(r()),
      alpha: 0,
    }))
    const order = marks.map((_, i) => i).sort((i, j) => Math.abs(marks[i].a) - Math.abs(marks[j].a))
    const vessels = Array.from({ length: ATTACK_CHAINS }, (_, i) => ({
      a: ((i % 2 ? 1 : -1) * (1 + (i * 7) % 5)) * 0.9,
      r: 0.3 + (0.62 * i) / (ATTACK_CHAINS - 1),
      alpha: 0,
    }))
    return { marks, order, vessels }
  }, [benign])
}

function Fan({ result }: { result: Result | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const visible = useIsVisible(canvasRef)
  const reduced = useReducedMotion()
  const { marks, order, vessels } = useMarks(1988)
  const anim = useRef({ theta: 0, raf: 0 })
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }))
    ro.observe(c)
    return () => ro.disconnect()
  }, [])

  // Targets: exactly `falsePositives` marks lit, nearest the axis first,
  // skipping the obscured sector when an exclusion is in the rule.
  const targets = useMemo(() => {
    const lit = new Uint8Array(marks.length)
    let theta = 3
    if (result) {
      let n = result.falsePositives
      for (const i of order) {
        if (n <= 0) break
        const m = marks[i]
        if (result.excluded && m.a >= WEDGE[0] && m.a <= WEDGE[1]) continue
        lit[i] = 1
        theta = Math.max(theta, Math.abs(m.a))
        n--
      }
    }
    const caught = new Uint8Array(ATTACK_CHAINS)
    const tp = result?.truePositives ?? 0
    CAUGHT_ORDER.forEach((v, k) => {
      if (k < tp) caught[v] = 1
    })
    return { lit, caught, theta: result ? theta : 0 }
  }, [marks, order, result])

  useEffect(() => {
    const c = canvasRef.current
    if (!c || !size.w) return
    const ink = readInk()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    c.width = Math.round(size.w * dpr)
    c.height = Math.round(size.h * dpr)
    const ctx = c.getContext('2d')!
    const W = size.w
    const H = size.h
    const ox = W / 2
    const oy = H - 22
    const R = Math.min(W / 2 - 16, H - 40)
    const toXY = (deg: number, rr: number) => {
      const a = ((deg - 90) * Math.PI) / 180
      return { x: ox + Math.cos(a) * rr * R, y: oy + Math.sin(a) * rr * R }
    }

    const frame = (snap: boolean) => {
      const st = anim.current
      let moving = false
      const ease = snap ? 1 : 0.16
      const dTheta = targets.theta - st.theta
      st.theta += dTheta * ease
      if (Math.abs(dTheta) > 0.05) moving = true
      for (let i = 0; i < marks.length; i++) {
        const d = targets.lit[i] - marks[i].alpha
        if (d !== 0) {
          marks[i].alpha = Math.abs(d) < 0.02 || snap ? targets.lit[i] : marks[i].alpha + d * 0.2
          moving = true
        }
      }
      for (let i = 0; i < vessels.length; i++) {
        const d = targets.caught[i] - vessels[i].alpha
        if (d !== 0) {
          vessels[i].alpha = Math.abs(d) < 0.02 || snap ? targets.caught[i] : vessels[i].alpha + d * 0.2
          moving = true
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      // Range rings.
      ctx.strokeStyle = ink.contour
      ctx.lineWidth = 0.8
      ctx.setLineDash([3, 5])
      ;[0.33, 0.66, 1].forEach((k) => {
        ctx.beginPath()
        ctx.arc(ox, oy, R * k, Math.PI * (1 + (90 - MAX_DEG) / 180), Math.PI * (2 - (90 - MAX_DEG) / 180))
        ctx.stroke()
      })
      ctx.setLineDash([])

      // Lit sector.
      const th = st.theta
      if (th > 0.2) {
        const a0 = ((-th - 90) * Math.PI) / 180
        const a1 = ((th - 90) * Math.PI) / 180
        ctx.beginPath()
        ctx.moveTo(ox, oy)
        ctx.arc(ox, oy, R, a0, a1)
        ctx.closePath()
        ctx.fillStyle = ink.magenta
        ctx.globalAlpha = 0.07
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.strokeStyle = ink.magenta
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.arc(ox, oy, R, a0, a1)
        ctx.stroke()
        ctx.lineWidth = 1
        ctx.setLineDash([4, 3])
        ;[a0, a1].forEach((a) => {
          ctx.beginPath()
          ctx.moveTo(ox, oy)
          ctx.lineTo(ox + Math.cos(a) * (R + 10), oy + Math.sin(a) * (R + 10))
          ctx.stroke()
        })
        ctx.setLineDash([])
      }

      // Obscured sector and the path it opens.
      if (result?.excluded) {
        const a0 = ((WEDGE[0] - 90) * Math.PI) / 180
        const a1 = ((WEDGE[1] - 90) * Math.PI) / 180
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(ox, oy)
        ctx.arc(ox, oy, R + 6, a0, a1)
        ctx.closePath()
        ctx.fillStyle = ink.paper
        ctx.fill()
        ctx.clip()
        ctx.strokeStyle = ink.ink
        ctx.globalAlpha = 0.55
        ctx.lineWidth = 1
        for (let k = -H; k < W + H; k += 6) {
          ctx.beginPath()
          ctx.moveTo(k, H)
          ctx.lineTo(k + H, 0)
          ctx.stroke()
        }
        ctx.restore()
        ctx.strokeStyle = ink.ink
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(ox, oy)
        ctx.arc(ox, oy, R + 6, a0, a1)
        ctx.closePath()
        ctx.stroke()
        // The attacker's path through the blind arc.
        const mid = (WEDGE[0] + WEDGE[1]) / 2
        const p0 = toXY(mid, 1.08)
        const p1 = toXY(mid, 0.28)
        ctx.strokeStyle = ink.attack
        ctx.lineWidth = 1.6
        ctx.setLineDash([6, 4])
        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y)
        ctx.lineTo(p1.x, p1.y)
        ctx.stroke()
        ctx.setLineDash([])
        const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x)
        ctx.fillStyle = ink.attack
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p1.x - Math.cos(ang - 0.45) * 9, p1.y - Math.sin(ang - 0.45) * 9)
        ctx.lineTo(p1.x - Math.cos(ang + 0.45) * 9, p1.y - Math.sin(ang + 0.45) * 9)
        ctx.closePath()
        ctx.fill()
      }

      // Benign events: faint water marks; lit ones are black squares, sized
      // to the plot so they stay countable on a phone.
      const k = Math.max(0.45, Math.min(1, W / 620))
      const lh = 1.6 * k
      const dh = 0.8 * k
      for (let i = 0; i < marks.length; i++) {
        const m = marks[i]
        const p = toXY(m.a, m.r)
        if (m.alpha < 0.99) {
          ctx.globalAlpha = 0.32 * (1 - m.alpha)
          ctx.fillStyle = ink.contour
          ctx.fillRect(p.x - dh, p.y - dh, dh * 2, dh * 2)
        }
        if (m.alpha > 0.01) {
          ctx.globalAlpha = m.alpha
          ctx.fillStyle = ink.ink
          ctx.fillRect(p.x - lh, p.y - lh, lh * 2, lh * 2)
        }
      }
      ctx.globalAlpha = 1

      // Attack chains: filled triangles when lit, dashed outlines when dark.
      vessels.forEach((v, i) => {
        const p = toXY(0, v.r)
        p.x += i % 2 ? 7 : -7
        const s = 5.5
        ctx.beginPath()
        ctx.moveTo(p.x, p.y - s)
        ctx.lineTo(p.x + s * 0.9, p.y + s * 0.7)
        ctx.lineTo(p.x - s * 0.9, p.y + s * 0.7)
        ctx.closePath()
        ctx.fillStyle = ink.paper
        ctx.fill()
        if (v.alpha > 0.01) {
          ctx.globalAlpha = v.alpha
          ctx.fillStyle = ink.attack
          ctx.fill()
          ctx.globalAlpha = 1
        }
        ctx.strokeStyle = ink.attack
        ctx.lineWidth = 1.4
        ctx.setLineDash(v.alpha > 0.5 ? [] : [2.5, 2])
        ctx.stroke()
        ctx.setLineDash([])
      })

      // Headland and the light.
      ctx.fillStyle = ink.land
      ctx.beginPath()
      ctx.moveTo(ox - 90, H)
      ctx.quadraticCurveTo(ox - 40, oy + 2, ox, oy + 4)
      ctx.quadraticCurveTo(ox + 40, oy + 2, ox + 90, H)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = ink.ink
      ctx.lineWidth = 1.2
      ctx.stroke()
      ctx.fillStyle = ink.ink
      ctx.beginPath()
      ctx.arc(ox, oy, 4.5, 0, Math.PI * 2)
      ctx.fill()

      return moving
    }

    const st = anim.current
    cancelAnimationFrame(st.raf)
    if (reduced || !visible) {
      frame(true)
      return
    }
    const loop = () => {
      if (frame(false)) st.raf = requestAnimationFrame(loop)
    }
    st.raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(st.raf)
  }, [size, targets, reduced, visible, marks, vessels, result])

  return <canvas ref={canvasRef} className="de-fan__canvas" aria-hidden="true" />
}

/* ---------------------------------------------------------------------------
   Scale bar — a chart's distance scale, here measuring a percentage
   --------------------------------------------------------------------------- */

function ScaleBar({ label, value, metric }: { label: string; value: number; metric: 'precision' | 'recall' }) {
  const shown = useBallistic(value)
  return (
    <div className="de-scale" data-metric={metric}>
      <MonoLabel>{label}</MonoLabel>
      <div className="de-scale__bar" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="de-scale__seg" data-on={i * 10 < shown} />
        ))}
        <span className="de-scale__pointer" style={{ left: `${Math.max(0, Math.min(100, shown))}%` }} />
      </div>
      <span className="de-scale__value">
        {Math.round(shown)}%
      </span>
    </div>
  )
}

function Count({ value, of }: { value: number; of?: number }) {
  const shown = useBallistic(value)
  return (
    <span className="de-tuner__count">
      {Math.round(shown)}
      {of !== undefined && <span className="de-tuner__of"> / {of}</span>}
    </span>
  )
}

/* ---------------------------------------------------------------------------
   The exercise
   --------------------------------------------------------------------------- */

export function SectorTuner({ data }: { data: unknown }) {
  const [selected, setSelected] = useState<string[]>([])
  const printing = usePrinting()
  const valid = isData(data)
  const conditions = useMemo(() => (valid ? data.conditions : []), [valid, data])
  const result = useMemo(() => computeResult(conditions, selected), [conditions, selected])
  const verdict = verdictFor(result)

  if (!valid) {
    return <p className="interaction__error">This exercise could not load its data.</p>
  }

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  // The condition line, written as the student builds. Ordered as listed.
  const chosen = conditions.filter((c) => selected.includes(c.id))
  const line = chosen.length
    ? chosen
        .map((c, i) => `${c.falsePositives < 0 ? (i ? 'and not ' : 'not ') : i ? 'and ' : ''}${c.id}`)
        .join(' ')
    : null

  const summary = result
    ? `${result.totalAlerts} alerts a day. ${result.truePositives} of 12 attack chains caught, ${result.falsePositives} false positives. Precision ${result.precision}%, recall ${result.recall}%. ${verdict?.label ?? ''}.`
    : 'No positive condition selected.'

  return (
    <div className="ix ix--rule de-tuner">
      {/* The shared synthetic badge, with a drawn mark in place of its character icon. */}
      <div className="synthetic-badge de-synthetic">
        <SyntheticGlyph size={20} className="synthetic-badge__glyph" />
        <span>
          <strong>Synthetic example.</strong> {data.description}
        </span>
      </div>

      <div className="de-tuner__layout">
        <section className="de-tuner__conditions" aria-label="Conditions">
          <MonoLabel>Conditions — combine them</MonoLabel>
          <ul className="rule__condition-list de-tuner__list">
            {conditions.map((c) => {
              const on = selected.includes(c.id)
              const isExclusion = c.falsePositives < 0
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    className="de-cond"
                    data-on={on}
                    data-exclusion={isExclusion}
                    aria-pressed={on}
                    onClick={() => toggle(c.id)}
                  >
                    <span className="de-cond__box" aria-hidden="true">
                      {isExclusion ? <ObscuredGlyph size={18} /> : <span className="de-cond__check" />}
                    </span>
                    <span className="de-cond__body">
                      <span className="de-cond__label">
                        {isExclusion && <span className="de-cond__not">NOT</span>}
                        {c.label}
                      </span>
                      <span className="de-cond__desc">{c.description}</span>
                    </span>
                    <code className="de-cond__id" aria-hidden="true">
                      {c.id}
                    </code>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="rule__output de-tuner__output" aria-label="Result against the corpus">
          <MonoLabel>Result against the corpus</MonoLabel>

          {!printing && (
            <div className="de-fan" data-empty={!result}>
              <Fan result={result} />
              <ul className="de-fan__key" aria-label="Chart key">
                <li>
                  <NoiseGlyph size={14} /> benign event that alerts
                </li>
                <li>
                  <VesselGlyph size={14} caught /> attack chain lit
                </li>
                <li>
                  <VesselGlyph size={14} caught={false} /> attack chain passed dark
                </li>
                {result?.excluded && (
                  <li>
                    <ObscuredGlyph size={14} /> obscured sector: the exclusion, and the path it opens
                  </li>
                )}
              </ul>
            </div>
          )}

          <p className="sr-only" aria-live="polite">
            {summary}
          </p>

          {!result ? (
            <p className="rule__empty de-tuner__empty">
              Select at least one positive condition. Start with the broadest one and watch what
              happens to precision.
            </p>
          ) : (
            <>
              <dl className="de-tuner__metrics">
                <div className="de-tuner__metric">
                  <dt>
                    <MonoLabel>Alerts / day</MonoLabel>
                  </dt>
                  <dd>
                    <Count value={result.totalAlerts} />
                  </dd>
                </div>
                <div className="de-tuner__metric" data-good>
                  <dt>
                    <MonoLabel>True positives</MonoLabel>
                  </dt>
                  <dd>
                    <Count value={result.truePositives} of={12} />
                  </dd>
                </div>
                <div className="de-tuner__metric" data-warn={result.falsePositives > 40}>
                  <dt>
                    <MonoLabel>False positives</MonoLabel>
                  </dt>
                  <dd>
                    <Count value={result.falsePositives} />
                  </dd>
                </div>
              </dl>

              <div className="de-tuner__scales">
                <ScaleBar label="Precision" value={result.precision} metric="precision" />
                <ScaleBar label="Recall" value={result.recall} metric="recall" />
              </div>

              {verdict && (
                <div className="rule__verdict de-notice" data-kind={verdict.kind}>
                  <EvidenceChip kind={verdict.kind} label={verdict.label} />
                  <p>{verdict.text}</p>
                </div>
              )}
            </>
          )}

          {line && (
            <p className="de-tuner__line">
              <span className="de-tuner__line-label">Your condition line, as you have built it</span>
              <code>condition: {line}</code>
            </p>
          )}

          <div className="rule__notes de-tuner__notes">
            <MonoLabel>How to read this</MonoLabel>
            <ul>
              {data.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>

          {selected.length > 0 && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setSelected([])}>
              Clear conditions
            </button>
          )}
        </section>
      </div>
    </div>
  )
}
