import { useState } from 'react'
import { EvidenceChip, MonoLabel } from '@/components/brand/Brand'

/* =========================================================================
   TRIAGE CONSOLE
   =========================================================================
   Signature interaction 1.

   Teaches: that the same raw event is a false positive for one account and
   a critical incident for another, and that the deciding input is always
   baseline — never the severity colour the rule author guessed in advance.

   The student must gather context before the decision controls unlock.
   That gating is the pedagogy: a SOC analyst who decides before checking
   is the failure mode this exercise exists to break.
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

export function TriageConsole({ data }: { data: unknown }) {
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

  function revealCheck(i: number) {
    setRevealed((r) => ({ ...r, [`${alert.id}:${i}`]: true }))
  }

  return (
    <div className="ix ix--triage">
      <div className="ix__bar">
        <div className="ix__bar-left">
          <MonoLabel>Tier 1 queue</MonoLabel>
          <span className="ix__counter">
            Alert {index + 1} of {data.alerts.length}
          </span>
        </div>
        <div className="ix__bar-right">
          <MonoLabel>Correct decisions</MonoLabel>
          <span className="ix__score">
            {solved} / {data.alerts.length}
          </span>
        </div>
      </div>

      <nav className="ix__tabs" aria-label="Alerts in the queue">
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
              className="ix__tab"
              data-state={state}
              aria-current={i === index}
              onClick={() => setIndex(i)}
            >
              <span className="ix__tab-id">{a.id}</span>
              <span className="ix__tab-mark" aria-hidden="true">
                {state === 'correct' ? '✓' : state === 'incorrect' ? '✕' : '○'}
              </span>
            </button>
          )
        })}
      </nav>

      <article className="triage__alert">
        <header className="triage__head">
          <div>
            <MonoLabel>{alert.id}</MonoLabel>
            <h4 className="triage__rule">{alert.rule}</h4>
          </div>
          <span className="triage__sev" data-sev={alert.severity.toLowerCase()}>
            {alert.severity}
          </span>
        </header>

        <p className="triage__summary">{alert.summary}</p>

        <section className="triage__checks">
          <div className="triage__checks-head">
            <MonoLabel>Context checks — run these before deciding</MonoLabel>
            <span className="triage__progress">
              {revealedCount} / {alert.checks.length}
            </span>
          </div>

          <ul className="triage__check-list">
            {alert.checks.map((check, i) => {
              const key = `${alert.id}:${i}`
              const isOpen = !!revealed[key]
              return (
                <li key={i} className="triage__check" data-open={isOpen} data-weight={check.weight}>
                  {isOpen ? (
                    <>
                      <div className="triage__check-label">
                        <span className="triage__check-mark" aria-hidden="true">
                          {check.weight === 'damning'
                            ? '▲'
                            : check.weight === 'exculpatory'
                              ? '▼'
                              : '■'}
                        </span>
                        {check.label}
                      </div>
                      <p className="triage__check-result">{check.result}</p>
                    </>
                  ) : (
                    <button type="button" className="triage__check-btn" onClick={() => revealCheck(i)}>
                      <span className="triage__check-mark" aria-hidden="true">
                        ?
                      </span>
                      <span>{check.label}</span>
                      <span className="triage__check-run">Run check</span>
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <section className="triage__decide">
          <MonoLabel>Your decision</MonoLabel>
          {!allRevealed && !decision && (
            <p className="triage__locked">
              Run all {alert.checks.length} context checks first. Deciding before gathering context
              is the habit this exercise exists to break — and it is how the fourth alert in this
              queue gets closed.
            </p>
          )}
          <div className="triage__options">
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
                  className="triage__option"
                  data-state={state}
                  disabled={!allRevealed || !!decision}
                  onClick={() => setDecisions((d) => ({ ...d, [alert.id]: opt.id }))}
                >
                  <span className="triage__option-mark" aria-hidden="true">
                    {!decision ? '○' : opt.correct ? '✓' : isChosen ? '✕' : '○'}
                  </span>
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>

          {chosen && (
            <div className="triage__feedback" data-correct={chosen.correct}>
              <div className="triage__feedback-head">
                <EvidenceChip
                  kind={chosen.correct ? 'confirmed' : 'uncertain'}
                  label={chosen.correct ? 'Correct' : 'Not the best call'}
                />
              </div>
              <p>{chosen.feedback}</p>
              {!chosen.correct && (
                <>
                  <div className="triage__feedback-head">
                    <EvidenceChip kind="response" label="The better call" />
                  </div>
                  <p>{alert.options.find((o) => o.correct)?.feedback}</p>
                </>
              )}
              <div className="triage__nav">
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
                    Next alert →
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
