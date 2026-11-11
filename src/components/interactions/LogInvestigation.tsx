import { useMemo, useState } from 'react'
import { EvidenceChip, MonoLabel, SyntheticBadge } from '@/components/brand/Brand'

/* =========================================================================
   LOG INVESTIGATION
   =========================================================================
   Signature interaction 2.

   Teaches: that attack evidence is sparse and surrounded by legitimate
   activity, and that the reliable way to find it is to look for broken
   relationships — a wrong parent, a wrong path, a wrong logon type —
   rather than for lines that look sinister.

   Scoring reports precision and recall separately and on purpose. A student
   who flags everything gets perfect recall and terrible precision, which is
   exactly what escalating the whole queue looks like in a real SOC.
   ========================================================================= */

interface Line {
  id: string
  text: string
  malicious: boolean
  why: string
}

interface Data {
  caption: string
  note: string
  lines: Line[]
  debrief: string
}

function isData(d: unknown): d is Data {
  return !!d && typeof d === 'object' && Array.isArray((d as Data).lines)
}

export function LogInvestigation({ data }: { data: unknown }) {
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)

  const valid = isData(data)
  const lines = valid ? data.lines : []

  const score = useMemo(() => {
    const truth = lines.filter((l) => l.malicious)
    const truePositives = truth.filter((l) => flagged.has(l.id)).length
    const falsePositives = [...flagged].filter(
      (id) => !lines.find((l) => l.id === id)?.malicious,
    ).length
    const missed = truth.length - truePositives
    const precision = flagged.size ? Math.round((truePositives / flagged.size) * 100) : 0
    const recall = truth.length ? Math.round((truePositives / truth.length) * 100) : 0
    return { truePositives, falsePositives, missed, precision, recall, total: truth.length }
  }, [flagged, lines])

  if (!valid) {
    return <p className="interaction__error">This exercise could not load its data.</p>
  }

  function toggle(id: string) {
    if (submitted) return
    setFlagged((f) => {
      const next = new Set(f)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="ix ix--loghunt">
      <SyntheticBadge />

      <div className="ix__bar">
        <div className="ix__bar-left">
          <MonoLabel>{data.caption}</MonoLabel>
        </div>
        <div className="ix__bar-right">
          <MonoLabel>Flagged</MonoLabel>
          <span className="ix__score">{flagged.size}</span>
        </div>
      </div>

      <p className="loghunt__note">{data.note}</p>

      <ol className="loghunt__lines">
        {lines.map((line) => {
          const isFlagged = flagged.has(line.id)
          const state = !submitted
            ? isFlagged
              ? 'flagged'
              : 'idle'
            : line.malicious
              ? isFlagged
                ? 'hit'
                : 'missed'
              : isFlagged
                ? 'false-positive'
                : 'correct-reject'
          return (
            <li key={line.id} className="loghunt__row" data-state={state}>
              <button
                type="button"
                className="loghunt__line"
                aria-pressed={isFlagged}
                onClick={() => toggle(line.id)}
                disabled={submitted}
              >
                <span className="loghunt__mark" aria-hidden="true">
                  {!submitted
                    ? isFlagged
                      ? '▣'
                      : '□'
                    : state === 'hit'
                      ? '✓'
                      : state === 'missed'
                        ? '!'
                        : state === 'false-positive'
                          ? '✕'
                          : '·'}
                </span>
                <code>{line.text}</code>
              </button>
              {submitted && (state === 'hit' || state === 'missed' || state === 'false-positive') && (
                <p className="loghunt__why" data-state={state}>
                  {line.why}
                </p>
              )}
            </li>
          )
        })}
      </ol>

      {!submitted ? (
        <div className="loghunt__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setSubmitted(true)}
            disabled={flagged.size === 0}
          >
            Commit {flagged.size} {flagged.size === 1 ? 'line' : 'lines'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => setFlagged(new Set())}>
            Clear
          </button>
        </div>
      ) : (
        <div className="loghunt__result">
          <div className="loghunt__metrics">
            <div className="loghunt__metric">
              <MonoLabel>Found</MonoLabel>
              <span className="loghunt__metric-value">
                {score.truePositives} / {score.total}
              </span>
            </div>
            <div className="loghunt__metric" data-warn={score.falsePositives > 0}>
              <MonoLabel>False positives</MonoLabel>
              <span className="loghunt__metric-value">{score.falsePositives}</span>
            </div>
            <div className="loghunt__metric" data-warn={score.missed > 0}>
              <MonoLabel>Missed</MonoLabel>
              <span className="loghunt__metric-value">{score.missed}</span>
            </div>
            <div className="loghunt__metric">
              <MonoLabel>Precision</MonoLabel>
              <span className="loghunt__metric-value">{score.precision}%</span>
            </div>
            <div className="loghunt__metric">
              <MonoLabel>Recall</MonoLabel>
              <span className="loghunt__metric-value">{score.recall}%</span>
            </div>
          </div>

          <div className="loghunt__debrief">
            <div className="loghunt__debrief-head">
              <EvidenceChip kind="response" label="Debrief" />
            </div>
            <p>{data.debrief}</p>
            {score.falsePositives > 0 && (
              <p className="loghunt__nudge">
                Your {score.falsePositives} false{' '}
                {score.falsePositives === 1 ? 'positive is' : 'positives are'} worth more attention
                than the misses. In a real queue, each one is an escalation that costs Tier 2 time
                and teaches them to trust your judgement a little less.
              </p>
            )}
            {score.missed > 0 && (
              <p className="loghunt__nudge">
                {score.missed} attack {score.missed === 1 ? 'line' : 'lines'} went unflagged. Read
                the explanations above — in every case the parent-child relationship or the argument
                was the tell, not how alarming the line looked.
              </p>
            )}
          </div>

          <button
            type="button"
            className="btn"
            onClick={() => {
              setSubmitted(false)
              setFlagged(new Set())
            }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
