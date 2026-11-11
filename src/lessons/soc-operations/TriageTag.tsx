import { useId, useState } from 'react'
import type { InteractionBlock as InteractionBlockType } from '@/types/content'
import type { BlockOverrideProps } from '../types'
import { EvidenceChip, MonoLabel } from '@/components/brand/Brand'
import { BlockHead, Detail, Footer } from './shared'
import { ROUTES, routeOf, StateMark, Stamp, stripsKept, WeightMark, type Route } from './parts'

/* =========================================================================
   TRIAGE CONSOLE, AS A TAG RACK
   =========================================================================
   The shared console's teaching behaviour, kept whole: the same alerts,
   checks, options and feedback; decisions locked until every context check
   has run; scoring; reconsider; next alert.

   What changes is the form. Each alert is a triage tag. Running a check
   fills one of the tag's ruled fields and punches one hole in its check
   row. The options sit on the tag's three routing strips, grouped by where
   they send the alert. Committing tears away every strip beyond the one
   you chose, so the strip left at the end of the tag IS the routing — and
   the torn strips lie beside it, still readable, until you reconsider.
   ========================================================================= */

interface Check {
  label: string
  result: string
  weight: 'damning' | 'exculpatory' | 'neutral'
}

interface Option {
  id: string
  label: string
  correct: boolean
  feedback: string
}

interface Alert {
  id: string
  rule: string
  severity: string
  summary: string
  checks: Check[]
  options: Option[]
}

function isData(d: unknown): d is { alerts: Alert[] } {
  return !!d && typeof d === 'object' && Array.isArray((d as { alerts: unknown }).alerts)
}

const WEIGHT_WORD: Record<Check['weight'], string> = {
  damning: 'Damning',
  exculpatory: 'Exculpatory',
  neutral: 'Neutral',
}

function TriageRack({ data }: { data: unknown }) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [decisions, setDecisions] = useState<Record<string, string>>({})
  const uid = useId()

  if (!isData(data) || data.alerts.length === 0) {
    return <p className="interaction__error">This exercise could not load its data.</p>
  }

  const alert = data.alerts[Math.min(index, data.alerts.length - 1)]
  const runCount = alert.checks.filter((_, i) => revealed[`${alert.id}:${i}`]).length
  const allRun = runCount === alert.checks.length
  const decision = decisions[alert.id]
  const chosen = alert.options.find((o) => o.id === decision)
  const chosenRoute = chosen ? routeOf(chosen.id) : null
  const kept: Route[] = chosenRoute ? stripsKept(chosenRoute) : ROUTES.map((r) => r.id)
  const torn = ROUTES.filter((r) => !kept.includes(r.id))
  const solved = data.alerts.filter((a) => {
    const d = decisions[a.id]
    return d && a.options.find((o) => o.id === d)?.correct
  }).length

  function stateOf(a: Alert): 'pending' | 'correct' | 'incorrect' {
    const d = decisions[a.id]
    if (!d) return 'pending'
    return a.options.find((o) => o.id === d)?.correct ? 'correct' : 'incorrect'
  }

  function optionState(opt: Option) {
    if (!decision) return 'idle'
    if (decision === opt.id) return opt.correct ? 'correct' : 'incorrect'
    return opt.correct ? 'correct-unchosen' : 'idle'
  }

  function renderStrip(route: (typeof ROUTES)[number], where: 'kept' | 'torn') {
    const options = alert.options.filter((o) => routeOf(o.id) === route.id)
    return (
      <div
        key={`${alert.id}-${route.id}-${where}`}
        className="soc-band"
        data-route={route.id}
        data-where={where}
        role="group"
        aria-label={`${route.long}${where === 'torn' ? ' (torn off)' : ''}`}
      >
        <span className="soc-band__label" aria-hidden="true">
          {route.label}
        </span>
        <div className="soc-band__options">
          {options.length === 0 ? (
            <span className="soc-band__empty">No option on this strip for {alert.id}</span>
          ) : (
            options.map((opt) => {
              const state = optionState(opt)
              const isChosen = decision === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  className="soc-option"
                  data-state={state}
                  aria-pressed={isChosen}
                  disabled={!allRun || !!decision}
                  onClick={() => setDecisions((d) => ({ ...d, [alert.id]: opt.id }))}
                >
                  <span className="soc-option__mark">
                    <StateMark
                      state={
                        state === 'correct' || state === 'correct-unchosen'
                          ? 'correct'
                          : state === 'incorrect'
                            ? 'incorrect'
                            : 'pending'
                      }
                    />
                  </span>
                  <span className="soc-option__text">{opt.label}</span>
                  {state === 'correct-unchosen' && (
                    <span className="soc-option__note">The better call</span>
                  )}
                  {isChosen && <span className="soc-option__note">Your call</span>}
                </button>
              )
            })
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="ix ix--triage soc-rack">
      <div className="soc-rack__bar">
        <div className="soc-rack__count">
          <MonoLabel>Tier 1 queue</MonoLabel>
          <span>
            Alert {index + 1} of {data.alerts.length}
          </span>
        </div>
        <div className="soc-rack__count soc-rack__count--score">
          <MonoLabel>Correct decisions</MonoLabel>
          <span>
            {solved} / {data.alerts.length}
          </span>
        </div>
      </div>

      {/* The queue: every alert hangs on the wire as a small tag. A routed
          tag shows the strip it kept. */}
      <nav className="soc-wire" aria-label="Alerts in the queue">
        <ol>
          {data.alerts.map((a, i) => {
            const state = stateOf(a)
            const d = decisions[a.id]
            const r = d ? routeOf(d) : null
            return (
              <li key={a.id}>
                <button
                  type="button"
                  className="soc-wire__tag"
                  data-state={state}
                  data-route={r ?? 'none'}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                >
                  <span className="soc-wire__id">{a.id}</span>
                  <span className="soc-wire__state">
                    <StateMark state={state} />
                    <span className="sr-only">
                      {state === 'pending' ? 'not decided' : state === 'correct' ? 'correct' : 'not the best call'}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="soc-desk-slot">
        <div className="soc-tag-lay">
        <article
          className="soc-tag"
          data-decided={!!decision}
          data-route={chosenRoute ?? 'none'}
          aria-labelledby={`${uid}-rule`}
          key={alert.id}
        >
          <span className="soc-tag__eyelet" aria-hidden="true" />

          <div className="soc-tag__main">
            <dl className="soc-fields soc-tag__fields">
              <div className="soc-field">
                <dt>Alert</dt>
                <dd className="soc-field__mono">{alert.id}</dd>
              </div>
              <div className="soc-field">
                <dt>Severity</dt>
                <dd>{alert.severity}</dd>
              </div>
              <div className="soc-field soc-field--punch">
                <dt>Checks run</dt>
                <dd>
                  <span className="soc-punch" aria-hidden="true">
                    {alert.checks.map((_, i) => (
                      <span key={i} data-on={!!revealed[`${alert.id}:${i}`]} />
                    ))}
                  </span>
                  {runCount} / {alert.checks.length}
                </dd>
              </div>
            </dl>

            <h4 className="soc-tag__rule" id={`${uid}-rule`}>
              {alert.rule}
            </h4>
            <p className="soc-tag__summary triage__summary">{alert.summary}</p>

            <section className="soc-checks">
              <MonoLabel>Context checks — run these before deciding</MonoLabel>
              <ul className="soc-checks__list triage__check-list">
                {alert.checks.map((check, i) => {
                  const key = `${alert.id}:${i}`
                  const isRun = !!revealed[key]
                  return (
                    <li key={key} className="soc-check" data-run={isRun} data-weight={check.weight}>
                      {isRun ? (
                        <div className="soc-check__filled">
                          <div className="soc-check__head">
                            <span className="soc-check__label">{check.label}</span>
                            <span className="soc-check__weight">
                              <WeightMark weight={check.weight} />
                              {WEIGHT_WORD[check.weight]}
                            </span>
                          </div>
                          <p className="soc-check__result">{check.result}</p>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="soc-check__run"
                          onClick={() => setRevealed((r) => ({ ...r, [key]: true }))}
                        >
                          <span className="soc-check__label">{check.label}</span>
                          <span className="soc-check__cta">Run check</span>
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>

            {!allRun && !decision && (
              <p className="soc-tag__locked">
                Run all {alert.checks.length} context checks first. Deciding before gathering context
                is the habit this exercise exists to break — and it is how the fourth alert in this
                queue gets closed.
              </p>
            )}
          </div>

          <div className="soc-tag__strips" data-locked={!allRun && !decision}>
            <MonoLabel className="soc-tag__strips-label">Your decision</MonoLabel>
            {ROUTES.filter((r) => kept.includes(r.id)).map((r) => renderStrip(r, 'kept'))}
          </div>

          {chosenRoute && (
            <Stamp className="soc-tag__stamp">
              Routed · {ROUTES.find((r) => r.id === chosenRoute)?.label}
            </Stamp>
          )}
        </article>
        </div>

        {torn.length > 0 && (
          <div className="soc-torn">
            <MonoLabel>Torn off</MonoLabel>
            {torn.map((r) => renderStrip(r, 'torn'))}
          </div>
        )}
      </div>

      <div className="soc-verdict-live" aria-live="polite">
        {chosen && (
          <div className="soc-verdict triage__feedback" data-correct={chosen.correct}>
            <div className="soc-verdict__head">
              <EvidenceChip
                kind={chosen.correct ? 'confirmed' : 'uncertain'}
                label={chosen.correct ? 'Correct' : 'Not the best call'}
              />
            </div>
            <p>{chosen.feedback}</p>
            {!chosen.correct && (
              <>
                <div className="soc-verdict__head">
                  <EvidenceChip kind="response" label="The better call" />
                </div>
                <p>{alert.options.find((o) => o.correct)?.feedback}</p>
              </>
            )}
            <div className="soc-verdict__nav">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() =>
                  setDecisions((d) => {
                    const next = { ...d }
                    delete next[alert.id]
                    return next
                  })
                }
              >
                Reconsider
              </button>
              {index < data.alerts.length - 1 && (
                <button type="button" className="btn btn--primary btn--sm" onClick={() => setIndex(index + 1)}>
                  Next alert <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function InteractionBlock({ block, mode, Default }: BlockOverrideProps<InteractionBlockType>) {
  if (block.component !== 'triage-console') return <Default block={block} mode={mode} />
  return (
    <section className="block block--interaction soc-ix">
      <BlockHead block={block} kicker="Interactive exercise" />
      {block.lead && <p className="lead">{block.lead}</p>}
      <div className="interaction__teaches">
        <MonoLabel>What this teaches</MonoLabel>
        <p>{block.teaches}</p>
      </div>
      <TriageRack data={block.data} />
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}
