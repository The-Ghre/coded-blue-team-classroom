import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import type { ConceptBlock, DiagramSpec } from '@/types/content'
import type { RenderMode } from '@/components/teaching/blocks'
import type { BlockOverrideProps } from '../../types'
import { Callout, MonoLabel, RedBlue } from '@/components/brand/Brand'
import { KitDetail, KitFooter, KitHead, MarkerCross, splitDash } from '../parts'

/* =========================================================================
   CONCEPT — re-composed where the lesson needs a different form
   =========================================================================
   - a ladder diagram becomes the volatility test strip (the signature
     interaction): collect tiers while the clock advances; a reboot turns
     the white light on;
   - a cycle diagram becomes the developing loop: six frames on a closed
     strip, each of which can be skipped to show what skipping costs;
   - anything else keeps the shared renderer.
   Every point, the diagram's text alternative, the callout, the red/blue
   views, the study depth and the provenance footer are all kept.
   ========================================================================= */

export default function Concept({ block, mode, Default }: BlockOverrideProps<ConceptBlock>) {
  if (block.diagram?.type === 'ladder') return <TestStripConcept block={block} mode={mode} />
  if (block.diagram?.type === 'cycle') return <LoopConcept block={block} mode={mode} />
  return (
    <div className="ir-concept" data-id={block.id}>
      <Default block={block} mode={mode} />
    </div>
  )
}

function Shell({
  block,
  mode,
  className,
  children,
}: {
  block: ConceptBlock
  mode: RenderMode
  className: string
  children: ReactNode
}) {
  return (
    <section className={`block block--concept ${className}`}>
      <KitHead block={block} kicker="Concept" />
      {block.lead && <p className="lead">{block.lead}</p>}
      {children}
      {block.callout && <Callout tone={block.callout.tone}>{block.callout.text}</Callout>}
      <RedBlue red={block.redView} blue={block.blueView} />
      <KitDetail detail={block.detail} mode={mode} />
      <KitFooter block={block} mode={mode} />
    </section>
  )
}

/** The shared diagram frame's contract: a visible, expandable text alternative. */
function Figure({ alt, label, children }: { alt: string; label: string; children: ReactNode }) {
  const [showAlt, setShowAlt] = useState(false)
  const altId = useId()
  return (
    <figure className="diagram ir-figure">
      <div className="diagram__head">
        <MonoLabel>{label}</MonoLabel>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          aria-expanded={showAlt}
          aria-controls={altId}
          onClick={() => setShowAlt((v) => !v)}
        >
          {showAlt ? 'Hide description' : 'Describe this diagram'}
        </button>
      </div>
      {children}
      <figcaption id={altId} className={showAlt ? 'diagram__alt' : 'sr-only'}>
        {alt}
      </figcaption>
    </figure>
  )
}

/* =========================================================================
   VOLATILITY TEST STRIP
   =========================================================================
   A darkroom test strip has one band per exposure step. Here each band is
   one tier of the ladder, most volatile at the top. Collecting a tier takes
   one step of the clock, and the clock is what destroys evidence: a tier is
   lost once as many steps have passed as there are tiers above it. So
   collecting from the top down saves everything that can be saved, and
   any other order loses something — which is the lesson, made physical.

   The tier at the top is lost before anyone can act: the source calls it
   practically uncollectable. "Reboot now" is the service owner's request:
   every tier above the disk is lost if it has not been collected.
   ========================================================================= */

type BandState = { status: 'latent' } | { status: 'fixed'; at: number } | { status: 'lost'; why: 'clock' | 'reboot' }

function TestStripConcept({ block, mode }: { block: ConceptBlock; mode: RenderMode }) {
  const spec = block.diagram as Extract<DiagramSpec, { type: 'ladder' }>
  const rungs = spec.rungs
  const n = rungs.length
  /* The tiers a reboot destroys: everything above the disk. Derived from
     the ladder so a content edit moves it with the content. */
  const diskIndex = rungs.findIndex((r) => /disk/i.test(r.label))
  const rebootLoses = diskIndex > 0 ? diskIndex : Math.min(3, n)

  const [taken, setTaken] = useState<number[]>([])
  const [fixedAt, setFixedAt] = useState<Record<number, number>>({})
  const [rebooted, setRebooted] = useState(false)
  const [flash, setFlash] = useState(0)
  const [message, setMessage] = useState('')

  const clock = taken.length
  const started = clock > 0 || rebooted

  const stateOf = (i: number): BandState => {
    if (fixedAt[i] !== undefined) return { status: 'fixed', at: fixedAt[i] }
    if (rebooted && i < rebootLoses) return { status: 'lost', why: 'reboot' }
    if (i === 0 || (started && clock >= i)) return { status: 'lost', why: 'clock' }
    return { status: 'latent' }
  }

  const done = rebooted || rungs.every((_, i) => stateOf(i).status !== 'latent')
  const saved = rungs.filter((_, i) => stateOf(i).status === 'fixed').length

  function collect(i: number) {
    if (done) return
    const st = stateOf(i)
    if (st.status !== 'latent') return
    const nextClock = clock + 1
    setTaken((t) => [...t, i])
    setFixedAt((f) => ({ ...f, [i]: nextClock }))
    const lostNow = rungs
      .map((r, j) => ({ r, j }))
      .filter(({ j }) => j !== i && fixedAt[j] === undefined && j > 0 && nextClock >= j && !(clock >= j))
    const name = rungs[i].label.replace(/^\d+\s*·\s*/, '')
    setMessage(
      `Collected ${name} at step ${nextClock}.` +
        (lostNow.length
          ? ` While you did, the clock destroyed: ${lostNow.map(({ r }) => r.label.replace(/^\d+\s*·\s*/, '')).join(', ')}.`
          : ''),
    )
  }

  function reboot() {
    if (done) return
    setRebooted(true)
    setFlash((f) => f + 1)
    const lost = rungs
      .slice(0, rebootLoses)
      .filter((_, j) => fixedAt[j] === undefined)
      .map((r) => r.label.replace(/^\d+\s*·\s*/, ''))
    setMessage(
      lost.length
        ? `Rebooted. Lost for good: ${lost.join(', ')}. The disk and the logs survive a reboot.`
        : 'Rebooted, after everything volatile was already collected. Nothing was lost to it.',
    )
  }

  function reset() {
    setTaken([])
    setFixedAt({})
    setRebooted(false)
    setMessage('')
  }

  const best = rungs.length - 1

  return (
    <Shell block={block} mode={mode} className="ir-volatility">
      <ul className="concept__points ir-points">
        {block.points.map((p, i) => (
          <li key={i}>
            <span className="concept__bullet" aria-hidden="true" />
            <span>{p}</span>
          </li>
        ))}
      </ul>

      <Figure alt={spec.alt} label="Test strip · collect from the top">
        <div className="ir-strip-ix" data-done={done || undefined} data-rebooted={rebooted || undefined}>
          {flash > 0 && <span key={flash} className="ir-strip-ix__flash" aria-hidden="true" />}

          <div className="ir-strip-ix__clock" aria-hidden="true">
            <span className="ir-strip-ix__clock-label">Steps taken</span>
            <span className="ir-strip-ix__axis" style={{ '--n': n - 1, '--c': clock } as CSSProperties}>
              {Array.from({ length: n }, (_, k) => (
                <span key={k} className="ir-strip-ix__tick" data-past={k <= clock || undefined}>
                  {k}
                </span>
              ))}
            </span>
          </div>

          <ol className="ir-strip-ix__bands">
            {rungs.map((r, i) => {
              const st = stateOf(i)
              const order = taken.indexOf(i)
              return (
                <li
                  key={r.label}
                  className="ir-band"
                  data-status={st.status}
                  style={{ '--k': i, '--n': n } as CSSProperties}
                >
                  <button
                    type="button"
                    className="ir-band__btn"
                    onClick={() => collect(i)}
                    disabled={done || st.status !== 'latent'}
                  >
                    <span className="ir-band__density" aria-hidden="true" />
                    <span className="ir-band__label">{r.label}</span>
                    <span className="ir-band__note">{r.note}</span>
                    <span className="ir-band__state">
                      {st.status === 'fixed'
                        ? `Fixed · collected ${ordinal(order + 1)}, at step ${st.at}`
                        : st.status === 'lost'
                          ? st.why === 'reboot'
                            ? 'Lost · reboot'
                            : i === 0
                              ? 'Lost · before anyone can act'
                              : 'Lost · the clock got there first'
                          : done
                            ? 'Not collected'
                            : 'Latent · select to collect'}
                    </span>
                    <span className="ir-band__rail" aria-hidden="true" />
                    {st.status === 'lost' && <MarkerCross className="ir-band__cross" />}
                  </button>
                </li>
              )
            })}
          </ol>

          <div className="ir-strip-ix__controls">
            <button type="button" className="btn btn--sm ir-reboot" onClick={reboot} disabled={done}>
              Reboot now
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={reset} disabled={!started}>
              Start again
            </button>
          </div>

          <p className="ir-strip-ix__status" role="status" aria-live="polite">
            {message}
            {done && (
              <>
                {' '}
                <strong>
                  {saved} of {n} tiers saved
                  {saved === best && !rebooted ? ' — the most that can be saved.' : '.'}
                </strong>
              </>
            )}
            {!started && 'Select the tier you would collect first. Every collection takes a step of the clock.'}
          </p>
        </div>
      </Figure>
    </Shell>
  )
}

function ordinal(k: number) {
  return ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'][k - 1] ?? `${k}th`
}

/* =========================================================================
   THE DEVELOPING LOOP — six phases on a closed strip of film
   =========================================================================
   Each phase is a frame on a loop; Lessons Learned feeds Preparation. Skip
   a phase and its frame is fogged and crossed, and the consequence the
   source gives for skipping it is marked in the list beside the loop.
   ========================================================================= */

function LoopConcept({ block, mode }: { block: ConceptBlock; mode: RenderMode }) {
  const spec = block.diagram as Extract<DiagramSpec, { type: 'cycle' }>
  const steps = spec.steps
  const [skipped, setSkipped] = useState<Record<number, boolean>>({})
  const [said, setSaid] = useState('')

  /* Point i belongs to step i when the point starts with the step's name. */
  const pointFor = (i: number) => {
    const name = steps[i].toLowerCase()
    return block.points.findIndex((p) => p.toLowerCase().startsWith(name))
  }

  function toggle(i: number) {
    const nowSkipped = !skipped[i]
    setSkipped((s) => ({ ...s, [i]: nowSkipped }))
    const pi = pointFor(i)
    const point = pi >= 0 ? block.points[pi] : ''
    const cost = /Skip[^.]*\.|The most valuable phase and the most commonly skipped\./i.exec(point)?.[0]
    setSaid(nowSkipped ? `${steps[i]} skipped. ${cost ?? ''}` : `${steps[i]} restored.`)
  }

  return (
    <Shell block={block} mode={mode} className="ir-phases">
      <div className="ir-loop-wrap">
        <Figure alt={spec.alt} label="Cycle · select a phase to skip it">
          <div className="ir-loop" style={{ '--n': steps.length } as CSSProperties}>
            <svg className="ir-loop__film" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
              <circle className="ir-loop__base" cx="100" cy="100" r="74" />
              <circle className="ir-loop__sprocket" cx="100" cy="100" r="88" pathLength={120} />
              <circle className="ir-loop__sprocket" cx="100" cy="100" r="60" pathLength={90} />
            </svg>
            <ol className="ir-loop__frames">
              {steps.map((step, i) => (
                <li key={step} className="ir-loop__frame" style={{ '--i': i } as CSSProperties}>
                  <button
                    type="button"
                    aria-pressed={!!skipped[i]}
                    aria-label={`${step}${skipped[i] ? ', skipped' : ''}. Select to ${skipped[i] ? 'restore' : 'skip'} this phase`}
                    onClick={() => toggle(i)}
                    data-skipped={skipped[i] || undefined}
                  >
                    <span className="ir-loop__num" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className="ir-loop__name" aria-hidden="true">
                      {step}
                    </span>
                    {skipped[i] && <MarkerCross className="ir-loop__cross" />}
                  </button>
                </li>
              ))}
            </ol>
            <p className="ir-loop__centre" aria-hidden="true">
              <span>{steps[steps.length - 1]}</span>
              <span className="ir-loop__arrow">feeds</span>
              <span>{steps[0]}</span>
            </p>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {said}
          </p>
        </Figure>

        <ul className="concept__points ir-points ir-points--phases">
          {block.points.map((p, i) => {
            const stepIndex = steps.findIndex((s) => p.toLowerCase().startsWith(s.toLowerCase()))
            const isSkipped = stepIndex >= 0 && !!skipped[stepIndex]
            const { name, body } = splitDash(p)
            const cost = /(Skip[^.]*\.|The most valuable phase and the most commonly skipped\.)/.exec(body)
            return (
              <li key={i} data-skipped={isSkipped || undefined}>
                <span className="concept__bullet" aria-hidden="true">
                  {stepIndex >= 0 ? stepIndex + 1 : ''}
                </span>
                <span>
                  {name && <strong className="ir-points__name">{name}</strong>}
                  {name && ' — '}
                  {cost ? (
                    <>
                      {body.slice(0, cost.index)}
                      <mark className="ir-points__cost">{cost[0]}</mark>
                      {body.slice(cost.index + cost[0].length)}
                    </>
                  ) : (
                    body
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </Shell>
  )
}
