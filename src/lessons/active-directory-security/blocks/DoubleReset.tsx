import { useEffect, useRef, useState } from 'react'
import type { ConceptBlock } from '@/types/content'
import { Callout, EvidenceChip, MonoLabel, RedBlue } from '@/components/brand/Brand'
import { useReducedMotion } from '@/motion'
import type { RenderMode } from '@/components/teaching/blocks'
import { Detail, Footer, SheetHead } from './parts'

/* =========================================================================
   THE DOUBLE RESET — a key revision issued twice, confirmed with every
   holder in between
   =========================================================================
   The six procedure points stay the lesson's own text and stay readable as
   a list. Beside them, a working register lets a student run the
   procedure: two fixed-position key slots (current, and the previous one
   Active Directory retains), a ticket forged from the key DCSync took, and
   a transmittal of three domain controllers that must each acknowledge the
   new revision before the next reset is allowed. Doing the steps out of
   order is answered with the lesson's own words for why not.
   ========================================================================= */

type Action = 'verify' | 'reset'
/** The action each stage waits for; stage 5 is the procedure's last point. */
const EXPECT: (Action | 'done')[] = ['verify', 'reset', 'verify', 'reset', 'verify', 'done']
const DCS = ['DC-01', 'DC-02', 'DC-03']

export function canDoubleReset(block: ConceptBlock): boolean {
  return block.points.length === EXPECT.length
}

/** The callout sentence that says what skipping verification breaks. */
function skipWarning(block: ConceptBlock): string | null {
  const text = block.callout?.text ?? ''
  const sentences = text.match(/[^.]+\./g) ?? []
  return sentences.find((s) => /without verifying/i.test(s))?.trim() ?? null
}

/** The callout sentence that says why one reset is not enough. */
function retainedWhy(block: ConceptBlock): string | null {
  const text = block.callout?.text ?? ''
  const sentences = text.match(/[^.]+\./g) ?? []
  return sentences.find((s) => /retains the previous/i.test(s))?.trim() ?? null
}

export function DoubleReset({ block, mode }: { block: ConceptBlock; mode: RenderMode }) {
  const reduced = useReducedMotion()
  const [stage, setStage] = useState(0)
  const [current, setCurrent] = useState(0)
  /** The previous key AD keeps; -1 stands for the one before the incident. */
  const [previous, setPrevious] = useState(-1)
  const [held, setHeld] = useState<number[]>([0, 0, 0])
  const [acked, setAcked] = useState<boolean[]>([false, false, false])
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'stop' | 'warn'; text: string } | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const expect = EXPECT[Math.min(stage, EXPECT.length - 1)]
  const complete = stage >= EXPECT.length - 1
  const replicated = held.every((h) => h === current)
  const forgedAccepted = current === 0 || previous === 0

  function replicate(rev: number) {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    if (reduced) {
      setHeld([rev, rev, rev])
      return
    }
    DCS.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(
          () => setHeld((h) => h.map((v, j) => (j === i ? rev : v))),
          700 + i * 650,
        ),
      )
    })
  }

  function verify() {
    if (complete) return
    if (expect !== 'verify') {
      setFeedback({ tone: 'stop', text: `Replication is already confirmed. The next step is: ${block.points[stage]}` })
      return
    }
    if (!replicated) {
      const lagging = DCS.filter((_, i) => held[i] !== current).join(', ')
      setFeedback({
        tone: 'stop',
        text: `${lagging} still ${lagging.includes(',') ? 'hold' : 'holds'} the old revision. ${block.points[2]}`,
      })
      return
    }
    setAcked([true, true, true])
    const next = stage + 1
    setStage(next)
    setFeedback(
      next === EXPECT.length - 1
        ? { tone: 'ok', text: block.points[EXPECT.length - 1] }
        : { tone: 'ok', text: `Confirmed on every domain controller. Next: ${block.points[next]}` },
    )
  }

  function reset() {
    if (complete) return
    if (expect !== 'reset') {
      const why =
        stage === 0 ? block.points[0] : (skipWarning(block) ?? block.points[stage])
      setFeedback({ tone: 'stop', text: why })
      return
    }
    const rev = current + 1
    setPrevious(current)
    setCurrent(rev)
    setAcked([false, false, false])
    replicate(rev)
    const next = stage + 1
    setStage(next)
    setFeedback(
      rev === 1
        ? {
            tone: 'warn',
            text: `Revision 1 issued. The ticket forged from revision 0 still works: ${retainedWhy(block) ?? 'the previous key is retained.'}`,
          }
        : { tone: 'ok', text: 'Revision 2 issued. Revision 0 is no longer held anywhere, so the forged ticket no longer validates.' },
    )
  }

  function restart() {
    timers.current.forEach((t) => window.clearTimeout(t))
    setStage(0)
    setCurrent(0)
    setPrevious(-1)
    setHeld([0, 0, 0])
    setAcked([false, false, false])
    setFeedback(null)
  }

  const revLabel = (r: number) => (r < 0 ? 'earlier' : String(r))

  return (
    <section className="block block--concept adw-concept adw-reset" data-stage={stage}>
      <SheetHead block={block} kicker="Procedure · Revision issued twice" />
      {block.lead && <p className="lead">{block.lead}</p>}

      <div className="adw-reset__layout">
        <ol className="adw-reset__steps">
          {block.points.map((p, i) => {
            const state = i < stage ? 'done' : i === stage ? 'now' : 'todo'
            return (
              <li key={i} data-state={state} aria-current={state === 'now' ? 'step' : undefined}>
                <span className="adw-reset__num" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="adw-reset__text">{p}</span>
                {state === 'done' && <span className="sr-only"> (done)</span>}
              </li>
            )
          })}
        </ol>

        <div className="adw-reset__register" aria-label="KRBTGT key register, a simulation" role="group">
          <div className="adw-reset__register-head">
            <MonoLabel>KRBTGT key register</MonoLabel>
            <span className="adw-reset__sim">Simulation · three DCs, illustrative</span>
          </div>

          <div className="adw-reset__keys">
            <div className="adw-reset__slot" data-slot="current">
              <span className="adw-reset__slot-label">Current key</span>
              <span className="adw-reset__counter" aria-live="polite">
                <span className="sr-only">Revision </span>
                <b key={current}>{revLabel(current)}</b>
              </span>
            </div>
            <div className="adw-reset__slot" data-slot="previous">
              <span className="adw-reset__slot-label">Previous key, retained</span>
              <span className="adw-reset__counter">
                <span className="sr-only">Revision </span>
                <b key={previous}>{revLabel(previous)}</b>
              </span>
            </div>
          </div>

          <div className="adw-reset__ticket" data-accepted={forgedAccepted}>
            <span className="adw-reset__ticket-label">Any ticket forged with revision 0, the key DCSync took</span>
            {forgedAccepted ? (
              <EvidenceChip kind="attack" label="Still accepted" />
            ) : (
              <EvidenceChip kind="confirmed" label="Rejected" />
            )}
          </div>

          <table className="adw-reset__transmittal">
            <caption className="sr-only">Replication of the current revision to each domain controller</caption>
            <thead>
              <tr>
                <th scope="col">Holder</th>
                <th scope="col">Holds revision</th>
                <th scope="col">Confirmed</th>
              </tr>
            </thead>
            <tbody>
              {DCS.map((dc, i) => (
                <tr key={dc} data-current={held[i] === current} data-acked={acked[i]}>
                  <th scope="row">{dc}</th>
                  <td>
                    <span className="adw-reset__held" key={held[i]}>
                      {revLabel(held[i])}
                    </span>
                    {held[i] !== current && <span className="adw-reset__pending"> · replicating</span>}
                  </td>
                  <td>{acked[i] ? <span className="adw-reset__ack">Checked</span> : <span className="adw-reset__unack">Not yet</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="adw-reset__actions">
            <button type="button" className="btn btn--sm" onClick={verify} disabled={complete}>
              Verify replication
            </button>
            <button type="button" className="btn btn--sm btn--primary" onClick={reset} disabled={complete}>
              Reset the KRBTGT password
            </button>
            <button type="button" className="btn btn--sm btn--ghost" onClick={restart} disabled={stage === 0 && !feedback}>
              Start again
            </button>
          </div>

          <p className="adw-reset__feedback" data-tone={feedback?.tone} aria-live="polite">
            {feedback ? feedback.text : `Start at step 1: ${block.points[0]}`}
          </p>
        </div>
      </div>

      {block.callout && <Callout tone={block.callout.tone}>{block.callout.text}</Callout>}
      <RedBlue red={block.redView} blue={block.blueView} />
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}
