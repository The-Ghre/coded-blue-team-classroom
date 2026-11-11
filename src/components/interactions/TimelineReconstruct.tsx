import { useMemo, useState } from 'react'
import type { EvidenceKind, Pillar } from '@/types/content'
import { EvidenceChip, MonoLabel, PillarTag, SyntheticBadge } from '@/components/brand/Brand'

/* =========================================================================
   TIMELINE RECONSTRUCTION
   =========================================================================
   Signature interaction 3.

   Teaches: that a timeline is assembled from independent sources that each
   see only part of the event, and that the gaps between lanes are where
   both the attacker operated and the detection failed.

   Events are shuffled and the student places them in order. Ordering is
   done with buttons rather than drag-and-drop, deliberately: drag targets
   are hostile on touch screens and unreachable by keyboard, and the
   learning is in the sequencing, not the pointer work.
   ========================================================================= */

interface Event {
  id: string
  time: string
  pillar: Pillar
  kind: EvidenceKind
  title: string
  body: string
  evidence?: string
  attack?: string
}

interface Data {
  caption: string
  events: Event[]
  missedDetections: { at: string; text: string }[]
  debrief: string
}

function isData(d: unknown): d is Data {
  return !!d && typeof d === 'object' && Array.isArray((d as Data).events)
}

/** Deterministic shuffle so the exercise is the same for everyone in a room. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  let seed = 20260314
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) % 2147483648
    const j = seed % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function TimelineReconstruct({ data }: { data: unknown }) {
  const valid = isData(data)
  const events = useMemo(() => (valid ? data.events : []), [valid, data])
  const [pool, setPool] = useState<Event[]>(() => shuffle(events))
  const [placed, setPlaced] = useState<Event[]>([])
  const [submitted, setSubmitted] = useState(false)

  const correctOrder = useMemo(
    () => [...events].sort((a, b) => a.time.localeCompare(b.time)).map((e) => e.id),
    [events],
  )

  const score = useMemo(() => {
    let correct = 0
    placed.forEach((e, i) => {
      if (correctOrder[i] === e.id) correct += 1
    })
    return { correct, total: correctOrder.length }
  }, [placed, correctOrder])

  if (!valid) {
    return <p className="interaction__error">This exercise could not load its data.</p>
  }

  function place(event: Event) {
    setPool((p) => p.filter((e) => e.id !== event.id))
    setPlaced((p) => [...p, event])
  }

  function unplace(event: Event) {
    setPlaced((p) => p.filter((e) => e.id !== event.id))
    setPool((p) => [...p, event])
  }

  function move(index: number, direction: -1 | 1) {
    setPlaced((p) => {
      const next = [...p]
      const target = index + direction
      if (target < 0 || target >= next.length) return p
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function reset() {
    setPool(shuffle(events))
    setPlaced([])
    setSubmitted(false)
  }

  return (
    <div className="ix ix--timeline">
      <SyntheticBadge />

      <div className="ix__bar">
        <div className="ix__bar-left">
          <MonoLabel>{data.caption}</MonoLabel>
        </div>
        <div className="ix__bar-right">
          <MonoLabel>Placed</MonoLabel>
          <span className="ix__score">
            {placed.length} / {events.length}
          </span>
        </div>
      </div>

      {pool.length > 0 && (
        <section className="tlr__pool">
          <MonoLabel>
            Evidence fragments — place each one in sequence ({pool.length} remaining)
          </MonoLabel>
          <ul className="tlr__pool-list">
            {pool.map((event) => (
              <li key={event.id}>
                <button type="button" className="tlr__fragment" onClick={() => place(event)}>
                  <span className="tlr__fragment-tags">
                    <EvidenceChip kind={event.kind} />
                    <PillarTag pillar={event.pillar} />
                  </span>
                  <span className="tlr__fragment-title">{event.title}</span>
                  <span className="tlr__fragment-body">{event.body}</span>
                  {event.evidence && (
                    <span className="tlr__fragment-evidence">{event.evidence}</span>
                  )}
                  <span className="tlr__fragment-add" aria-hidden="true">
                    + place
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="tlr__board">
        <MonoLabel>Your timeline</MonoLabel>
        {placed.length === 0 ? (
          <p className="tlr__empty">
            Nothing placed yet. Start with whichever fragment you think happened first — the
            adversary actions come before the response, and the response has its own internal
            order.
          </p>
        ) : (
          <ol className="tlr__placed">
            {placed.map((event, i) => {
              const isCorrect = submitted && correctOrder[i] === event.id
              return (
                <li
                  key={event.id}
                  className="tlr__slot"
                  data-state={submitted ? (isCorrect ? 'correct' : 'wrong') : 'idle'}
                  data-pillar={event.pillar}
                >
                  <div className="tlr__slot-index" aria-hidden="true">
                    {i + 1}
                  </div>
                  <div className="tlr__slot-body">
                    <div className="tlr__slot-tags">
                      <EvidenceChip kind={event.kind} />
                      <PillarTag pillar={event.pillar} />
                      {submitted && <time className="tlr__slot-time">{event.time}</time>}
                      {submitted && event.attack && (
                        <span className="tlr__slot-attack">{event.attack}</span>
                      )}
                    </div>
                    <h5>{event.title}</h5>
                    <p>{event.body}</p>
                    {submitted && event.evidence && (
                      <p className="tlr__slot-evidence">
                        <MonoLabel>Evidence</MonoLabel>
                        {event.evidence}
                      </p>
                    )}
                  </div>
                  {!submitted && (
                    <div className="tlr__slot-controls">
                      <button
                        type="button"
                        className="btn btn--icon btn--sm"
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label={`Move ${event.title} earlier`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="btn btn--icon btn--sm"
                        onClick={() => move(i, 1)}
                        disabled={i === placed.length - 1}
                        aria-label={`Move ${event.title} later`}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="btn btn--icon btn--sm"
                        onClick={() => unplace(event)}
                        aria-label={`Remove ${event.title} from the timeline`}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </section>

      {!submitted ? (
        <div className="tlr__actions">
          <button
            type="button"
            className="btn btn--primary"
            disabled={placed.length !== events.length}
            onClick={() => setSubmitted(true)}
          >
            {placed.length === events.length
              ? 'Check the sequence'
              : `Place all ${events.length} fragments first`}
          </button>
          {placed.length > 0 && (
            <button type="button" className="btn btn--ghost" onClick={reset}>
              Start over
            </button>
          )}
        </div>
      ) : (
        <div className="tlr__result">
          <div className="tlr__result-head">
            <EvidenceChip
              kind={score.correct === score.total ? 'confirmed' : 'hypothesis'}
              label={`${score.correct} of ${score.total} in the right position`}
            />
          </div>

          <div className="tlr__missed">
            <div className="tlr__missed-head">
              <EvidenceChip kind="uncertain" label="Detection opportunities that passed" />
            </div>
            <ul>
              {data.missedDetections.map((m, i) => (
                <li key={i}>
                  <code>{m.at}</code>
                  <span>{m.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="tlr__debrief">{data.debrief}</p>

          <button type="button" className="btn" onClick={reset}>
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
