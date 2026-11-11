import { useState } from 'react'
import type { InteractionBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { EvidenceChip, MonoLabel } from '@/components/brand/Brand'
import { Detail, Footer, Head } from '../shared'

/* =========================================================================
   THE TRIAGE CONSOLE, AS SOUNDINGS
   =========================================================================
   Same exercise, same data, same rules as the shared triage console:
   every context check must be run before the decision unlocks; feedback
   explains the chosen option and, when it was wrong, the better call;
   Reconsider and Next behave identically.

   What changes is the form. Each check is a sounding: the line drops one
   mark deeper each time a check is run, and the decision unlocks only when
   the weight touches bottom — you decide when you have reached the bottom
   of it, not before. State is a mark rather than a hue: an open ring for a
   report not yet decided, a tied knot for the right call, a cut line for
   the wrong one, each also said in words.
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
interface Data {
  alerts: Alert[]
}

function isData(d: unknown): d is Data {
  return !!d && typeof d === 'object' && Array.isArray((d as Data).alerts)
}

const WEIGHT_WORD: Record<Check['weight'], string> = {
  damning: 'Points to harm',
  exculpatory: 'Points away from harm',
  neutral: 'Context',
}

function WeightMark({ weight }: { weight: Check['weight'] | 'unknown' }) {
  return (
    <svg className="pi-wmark" data-weight={weight} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      {weight === 'damning' && <path d="M10 3 L17 16 H3 Z" />}
      {weight === 'exculpatory' && <path d="M10 17 L17 4 H3 Z" />}
      {weight === 'neutral' && <rect x="4.5" y="4.5" width="11" height="11" />}
      {weight === 'unknown' && <circle cx="10" cy="10" r="5" />}
    </svg>
  )
}

function StateMark({ state }: { state: 'pending' | 'correct' | 'incorrect' }) {
  return (
    <svg className="pi-smark" data-state={state} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      {state === 'pending' && <circle cx="10" cy="10" r="5" />}
      {state === 'correct' && (
        <path d="M10 3.5 C14.5 3.5 15.5 9 10 10 C4.5 11 5.5 16.5 10 16.5 C14.5 16.5 15.5 11 10 10 C4.5 9 5.5 3.5 10 3.5 Z" />
      )}
      {state === 'incorrect' && <path d="M10 2 V8 M10 12 V18 M6 8.5 L14 11.5" />}
    </svg>
  )
}

const STATE_WORD = {
  pending: 'not decided',
  correct: 'decided correctly',
  incorrect: 'decided, not the best call',
} as const

export function TriageSoundings({ data }: { data: unknown }) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [decisions, setDecisions] = useState<Record<string, string>>({})

  if (!isData(data)) {
    return <p className="interaction__error">This exercise could not load its data.</p>
  }

  const alert = data.alerts[index]
  const revealedCount = alert.checks.filter((_, i) => revealed[`${alert.id}:${i}`]).length
  const allRevealed = revealedCount === alert.checks.length
  const decision = decisions[alert.id]
  const chosen = alert.options.find((o) => o.id === decision)
  const solved = data.alerts.filter((a) => {
    const d = decisions[a.id]
    return d && a.options.find((o) => o.id === d)?.correct
  }).length
  const depth = alert.checks.length ? revealedCount / alert.checks.length : 1

  return (
    <div className="ix ix--triage pi-sound" data-bottom={allRevealed}>
      <div className="pi-sound__bar">
        <div>
          <MonoLabel>Tier 1 queue</MonoLabel>
          <span className="pi-sound__counter">
            Alert {index + 1} of {data.alerts.length}
          </span>
        </div>
        <div className="pi-sound__score">
          <MonoLabel>Correct decisions</MonoLabel>
          <span>
            {solved} / {data.alerts.length}
          </span>
        </div>
      </div>

      <nav className="pi-sound__tabs" aria-label="Alerts in the queue">
        {data.alerts.map((a, i) => {
          const d = decisions[a.id]
          const state = !d
            ? 'pending'
            : a.options.find((o) => o.id === d)?.correct
              ? 'correct'
              : 'incorrect'
          return (
            <button
              key={a.id}
              type="button"
              className="pi-sound__tab"
              data-state={state}
              aria-current={i === index}
              onClick={() => setIndex(i)}
            >
              <StateMark state={state} />
              <span className="pi-sound__tab-id">{a.id}</span>
              <span className="sr-only">, {STATE_WORD[state]}</span>
            </button>
          )
        })}
      </nav>

      <article className="pi-sound__alert" key={alert.id}>
        <header className="pi-sound__head">
          <div>
            <MonoLabel>{alert.id}</MonoLabel>
            <h3 className="pi-sound__rule">{alert.rule}</h3>
          </div>
          <span className="pi-sound__sev" data-sev={alert.severity.toLowerCase()}>
            {alert.severity}
          </span>
        </header>

        <p className="pi-sound__summary">{alert.summary}</p>

        <section className="pi-sound__checks" style={{ '--pi-sounded': depth } as React.CSSProperties}>
          <div className="pi-sound__checks-head">
            <MonoLabel>Context checks — run these before deciding</MonoLabel>
            <span className="pi-sound__progress">
              {revealedCount} / {alert.checks.length}
            </span>
          </div>

          <div className="pi-sound__column">
            <div className="pi-sound__plumb" aria-hidden="true">
              <span className="pi-sound__plumb-line" />
              <span className="pi-sound__plumb-weight" />
              <span className="pi-sound__plumb-bed" />
            </div>
            <ol className="pi-sound__list">
              {alert.checks.map((check, i) => {
                const key = `${alert.id}:${i}`
                const isOpen = !!revealed[key]
                return (
                  <li key={i} className="pi-sound__check" data-open={isOpen} data-weight={check.weight}>
                    {isOpen ? (
                      <div className="pi-sound__check-body">
                        <div className="pi-sound__check-label">
                          <WeightMark weight={check.weight} />
                          <span>{check.label}</span>
                          <span className="pi-sound__weight-word">{WEIGHT_WORD[check.weight]}</span>
                        </div>
                        <p className="pi-sound__result">{check.result}</p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="pi-sound__run"
                        onClick={() => setRevealed((r) => ({ ...r, [key]: true }))}
                      >
                        <WeightMark weight="unknown" />
                        <span>{check.label}</span>
                        <span className="pi-sound__run-word">Run check</span>
                      </button>
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
        </section>

        <section className="pi-sound__decide">
          <MonoLabel>Your decision</MonoLabel>
          {!allRevealed && !decision && (
            <p className="pi-sound__locked">
              Run all {alert.checks.length} context checks first. Deciding before gathering context is
              the habit this exercise exists to break — and it is how the fourth alert in this queue
              gets closed.
            </p>
          )}
          <div className="pi-sound__options">
            {alert.options.map((opt) => {
              const isChosen = decision === opt.id
              const state = !decision
                ? 'idle'
                : isChosen
                  ? opt.correct
                    ? 'correct'
                    : 'incorrect'
                  : opt.correct
                    ? 'correct-unchosen'
                    : 'idle'
              return (
                <button
                  key={opt.id}
                  type="button"
                  className="pi-sound__option"
                  data-state={state}
                  disabled={!allRevealed || !!decision}
                  onClick={() => setDecisions((d) => ({ ...d, [alert.id]: opt.id }))}
                >
                  <StateMark
                    state={!decision ? 'pending' : opt.correct ? 'correct' : isChosen ? 'incorrect' : 'pending'}
                  />
                  <span>{opt.label}</span>
                  {decision && (isChosen || opt.correct) && (
                    <span className="pi-sound__option-word">
                      {opt.correct ? 'Best call' : 'Your call'}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {chosen && (
            <div className="pi-sound__feedback" data-correct={chosen.correct}>
              <div className="pi-sound__feedback-head">
                <EvidenceChip
                  kind={chosen.correct ? 'confirmed' : 'uncertain'}
                  label={chosen.correct ? 'Correct' : 'Not the best call'}
                />
              </div>
              <p>{chosen.feedback}</p>
              {!chosen.correct && (
                <>
                  <div className="pi-sound__feedback-head">
                    <EvidenceChip kind="response" label="The better call" />
                  </div>
                  <p>{alert.options.find((o) => o.correct)?.feedback}</p>
                </>
              )}
              <div className="pi-sound__nav">
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
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    onClick={() => setIndex(index + 1)}
                  >
                    Next alert <span aria-hidden="true">→</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </article>
    </div>
  )
}

/** The interaction block: triage runs as soundings; anything else stays shared. */
export function InteractionPlate({ block, mode, Default }: BlockOverrideProps<InteractionBlock>) {
  if (block.component !== 'triage-console') return <Default block={block} mode={mode} />
  return (
    <section className="block block--interaction pi-interaction" data-mode={mode}>
      <Head block={block} />
      {block.lead && <p className="lead">{block.lead}</p>}
      <div className="interaction__teaches">
        <MonoLabel>What this teaches</MonoLabel>
        <p>{block.teaches}</p>
      </div>
      <TriageSoundings data={block.data} />
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}
