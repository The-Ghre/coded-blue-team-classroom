import { useMemo, useState } from 'react'
import { EvidenceChip, MonoLabel, SyntheticBadge } from '@/components/brand/Brand'

/* =========================================================================
   RULE BUILDER
   =========================================================================
   Signature interaction 5.

   Teaches: that tuning is a trade rather than an improvement — every
   exclusion that removes a false positive also opens a path for an
   attacker who satisfies it — and that the engineering judgement is
   knowing which trade is worth making.

   Conditions intersect, so true positives can only fall as the student
   adds more. The counter-example the exercise is built to produce is the
   student who reaches perfect precision by narrowing until only one exact
   command line matches, and then has to answer what the attacker does next.
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

export function RuleBuilder({ data }: { data: unknown }) {
  const [selected, setSelected] = useState<string[]>([])

  const valid = isData(data)
  const conditions = useMemo(() => (valid ? data.conditions : []), [valid, data])

  const result = useMemo(() => {
    const chosen = conditions.filter((c) => selected.includes(c.id))
    if (!chosen.length) return null

    // Positive conditions intersect: the narrowest bounds the result.
    const positives = chosen.filter((c) => c.falsePositives >= 0)
    const exclusions = chosen.filter((c) => c.falsePositives < 0)

    if (!positives.length) return null

    const truePositives = Math.min(...positives.map((c) => c.truePositives))
    // Intersecting independent-ish conditions: approximate by the minimum,
    // scaled down for each additional narrowing condition.
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

    return { truePositives, falsePositives, totalAlerts, precision, recall }
  }, [conditions, selected])

  if (!valid) {
    return <p className="interaction__error">This exercise could not load its data.</p>
  }

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  const verdict = (() => {
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
  })()

  return (
    <div className="ix ix--rule">
      <SyntheticBadge>{data.description}</SyntheticBadge>

      <div className="rule__layout">
        <section className="rule__conditions">
          <MonoLabel>Conditions — combine them</MonoLabel>
          <ul className="rule__condition-list">
            {conditions.map((c) => {
              const on = selected.includes(c.id)
              const isExclusion = c.falsePositives < 0
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    className="rule__condition"
                    data-on={on}
                    data-exclusion={isExclusion}
                    aria-pressed={on}
                    onClick={() => toggle(c.id)}
                  >
                    <span className="rule__condition-box" aria-hidden="true">
                      {on ? '▣' : '□'}
                    </span>
                    <span className="rule__condition-body">
                      <span className="rule__condition-label">
                        {isExclusion && (
                          <span className="rule__not" aria-hidden="true">
                            NOT
                          </span>
                        )}
                        {c.label}
                      </span>
                      <span className="rule__condition-desc">{c.description}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="rule__output">
          <MonoLabel>Result against the corpus</MonoLabel>
          {!result ? (
            <p className="rule__empty">
              Select at least one positive condition. Start with the broadest one and watch what
              happens to precision.
            </p>
          ) : (
            <>
              <div className="rule__metrics">
                <div className="rule__metric">
                  <MonoLabel>Alerts / day</MonoLabel>
                  <span className="rule__metric-value">{result.totalAlerts}</span>
                </div>
                <div className="rule__metric" data-good>
                  <MonoLabel>True positives</MonoLabel>
                  <span className="rule__metric-value">{result.truePositives} / 12</span>
                </div>
                <div className="rule__metric" data-warn={result.falsePositives > 40}>
                  <MonoLabel>False positives</MonoLabel>
                  <span className="rule__metric-value">{result.falsePositives}</span>
                </div>
              </div>

              <div className="rule__bars">
                <div className="rule__bar-row">
                  <MonoLabel>Precision</MonoLabel>
                  <div className="rule__bar">
                    <span
                      className="rule__bar-fill"
                      data-metric="precision"
                      style={{ width: `${result.precision}%` }}
                    />
                  </div>
                  <span className="rule__bar-value">{result.precision}%</span>
                </div>
                <div className="rule__bar-row">
                  <MonoLabel>Recall</MonoLabel>
                  <div className="rule__bar">
                    <span
                      className="rule__bar-fill"
                      data-metric="recall"
                      style={{ width: `${result.recall}%` }}
                    />
                  </div>
                  <span className="rule__bar-value">{result.recall}%</span>
                </div>
              </div>

              {verdict && (
                <div className="rule__verdict" data-kind={verdict.kind}>
                  <EvidenceChip kind={verdict.kind} label={verdict.label} />
                  <p>{verdict.text}</p>
                </div>
              )}
            </>
          )}

          <div className="rule__notes">
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
