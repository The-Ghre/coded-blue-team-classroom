import { useId, useState } from 'react'
import type {
  AssessmentBlock,
  Block,
  BriefBlock,
  ChainBlock,
  CheckBlock,
  CompareBlock,
  ConceptBlock,
  DebriefBlock,
  DeliverablesBlock,
  EvidenceBlock,
  HintsBlock,
  InteractionBlock,
  ObjectivesBlock,
  QueryBlock,
  RecapBlock,
  RetrievalBlock,
  ScenarioBlock,
  TasksBlock,
  TimelineBlock,
  TitleBlock,
} from '@/types/content'
import { EVIDENCE_META } from '@/types/content'
import {
  Callout,
  Duration,
  EvidenceChip,
  Eyebrow,
  MonoLabel,
  PillarTag,
  ProvenanceTag,
  RedBlue,
  SourceRefs,
  SyntheticBadge,
} from '@/components/brand/Brand'
import { Diagram } from '@/components/teaching/Diagram'
import { Interaction } from '@/components/interactions/Interaction'

export type RenderMode = 'slide' | 'study'

interface BlockProps<B> {
  block: B
  mode: RenderMode
}

/* =========================================================================
   Shared scaffolding
   ========================================================================= */

function BlockHead({
  block,
  kicker,
}: {
  block: Block
  kicker?: string
}) {
  return (
    <header className="block__head">
      {kicker && <Eyebrow>{kicker}</Eyebrow>}
      <h2 className="block__title">{block.title}</h2>
      {block.minutes !== undefined && (
        <div className="block__meta">
          <Duration minutes={block.minutes} />
        </div>
      )}
    </header>
  )
}

/** Study-mode expansion. Never shown on slides, so slides stay sparse. */
function Detail({ detail, mode }: { detail?: string[]; mode: RenderMode }) {
  if (mode !== 'study' || !detail?.length) return null
  return (
    <div className="detail">
      <MonoLabel>Going deeper</MonoLabel>
      <div className="prose">
        {detail.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  )
}

function Footer({ block, mode }: { block: Block; mode: RenderMode }) {
  if (mode !== 'study') return null
  if (!block.provenance && !block.sources?.length) return null
  return (
    <footer className="block__footer">
      {block.provenance && <ProvenanceTag provenance={block.provenance} />}
      <SourceRefs refs={block.sources} />
    </footer>
  )
}

/* =========================================================================
   Block renderers
   ========================================================================= */

function TitleView({ block }: BlockProps<TitleBlock>) {
  return (
    <section className="block block--title">
      <Eyebrow>{block.overline}</Eyebrow>
      <h1 className="block--title__h">{block.title}</h1>
      {block.lead && <p className="block--title__lead">{block.lead}</p>}
    </section>
  )
}

function RetrievalView({ block, mode }: BlockProps<RetrievalBlock>) {
  const [revealed, setRevealed] = useState(false)
  return (
    <section className="block block--retrieval">
      <BlockHead block={block} kicker="Retrieval" />
      <p className="lead">{block.recallPrompt}</p>
      <ol className="retrieval__list">
        {block.questions.map((q, i) => (
          <li key={i}>
            <span className="retrieval__q">{q}</span>
            {revealed && block.answers?.[i] && (
              <div className="retrieval__a">
                <MonoLabel>Answer</MonoLabel>
                <p>{block.answers[i]}</p>
              </div>
            )}
          </li>
        ))}
      </ol>
      {block.answers?.length ? (
        <button
          type="button"
          className="btn btn--sm"
          onClick={() => setRevealed((v) => !v)}
          aria-expanded={revealed}
        >
          {revealed ? 'Hide answers' : 'Reveal answers'}
        </button>
      ) : null}
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

function ScenarioView({ block, mode }: BlockProps<ScenarioBlock>) {
  return (
    <section className="block block--scenario">
      <BlockHead block={block} kicker="Opening scenario" />
      {block.synthetic && <SyntheticBadge />}
      <p className="scenario__setting">
        <MonoLabel>Setting</MonoLabel>
        {block.setting}
      </p>
      <div className="scenario__narrative prose">
        {block.narrative.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="scenario__driver">
        <MonoLabel>The question this session answers</MonoLabel>
        <p>{block.drivingQuestion}</p>
      </div>
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

function ObjectivesView({ block, mode }: BlockProps<ObjectivesBlock>) {
  return (
    <section className="block block--objectives">
      <BlockHead block={block} kicker="Learning objectives" />
      <ul className="objectives__list">
        {block.objectives.map((o, i) => (
          <li key={i}>
            <span className="objectives__verb">{o.verb}</span>
            <span className="objectives__text">{o.text}</span>
          </li>
        ))}
      </ul>
      {block.prerequisites?.length ? (
        <div className="objectives__prereq">
          <MonoLabel>Assumes</MonoLabel>
          <ul>
            {block.prerequisites.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

function ConceptView({ block, mode }: BlockProps<ConceptBlock>) {
  return (
    <section className="block block--concept">
      <BlockHead block={block} kicker="Concept" />
      {block.lead && <p className="lead">{block.lead}</p>}
      <ul className="concept__points">
        {block.points.map((p, i) => (
          <li key={i}>
            <span className="concept__bullet" aria-hidden="true" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      {block.diagram && <Diagram spec={block.diagram} />}
      {block.callout && <Callout tone={block.callout.tone}>{block.callout.text}</Callout>}
      <RedBlue red={block.redView} blue={block.blueView} />
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

function CompareView({ block, mode }: BlockProps<CompareBlock>) {
  return (
    <section className="block block--compare">
      <BlockHead block={block} kicker="Comparison" />
      {block.lead && <p className="lead">{block.lead}</p>}
      <div className="compare__scroll">
        <table className="compare__table">
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">Attribute</span>
              </th>
              {block.columns.map((c) => (
                <th key={c.label} scope="col">
                  {c.glyph && (
                    <span className="compare__glyph" aria-hidden="true">
                      {c.glyph}
                    </span>
                  )}
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.cells.map((cell, i) => (
                  <td key={i}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.callout && <Callout tone={block.callout.tone}>{block.callout.text}</Callout>}
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

/* ---------- Evidence annotator ------------------------------------------- */

function EvidenceView({ block, mode }: BlockProps<EvidenceBlock>) {
  const [open, setOpen] = useState<number | null>(null)
  const panelId = useId()

  return (
    <section className="block block--evidence">
      <BlockHead block={block} kicker="Annotated evidence" />
      {block.lead && <p className="lead">{block.lead}</p>}
      <SyntheticBadge>{block.source}</SyntheticBadge>

      <div className="evidence">
        <div className="evidence__head">
          <MonoLabel>{block.caption}</MonoLabel>
          <span className="evidence__hint">Select a line to annotate it</span>
        </div>

        <ol className="evidence__lines">
          {block.lines.map((line, i) => {
            const isOpen = open === i
            const hasNote = !!line.note
            return (
              <li key={i} className="evidence__line-wrap">
                {hasNote ? (
                  <button
                    type="button"
                    className={`evidence__line evidence__line--interactive${
                      isOpen ? ' is-open' : ''
                    }`}
                    data-kind={line.note!.kind}
                    aria-expanded={isOpen}
                    aria-controls={`${panelId}-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="evidence__marker" aria-hidden="true">
                      {EVIDENCE_META[line.note!.kind].glyph}
                    </span>
                    <code>{line.text}</code>
                  </button>
                ) : (
                  <div className="evidence__line">
                    <span className="evidence__marker evidence__marker--none" aria-hidden="true">
                      ·
                    </span>
                    <code>{line.text}</code>
                  </div>
                )}

                {hasNote && isOpen && (
                  <div className="evidence__note" id={`${panelId}-${i}`} data-kind={line.note!.kind}>
                    <div className="evidence__note-head">
                      <EvidenceChip kind={line.note!.kind} />
                      <strong>{line.note!.label}</strong>
                    </div>
                    <p>{line.note!.body}</p>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      <div className="proves">
        <div className="proves__col proves__col--yes">
          <div className="proves__head">
            <EvidenceChip kind="confirmed" label="This establishes" />
          </div>
          <ul>
            {block.proves.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="proves__col proves__col--no">
          <div className="proves__head">
            <EvidenceChip kind="uncertain" label="This does not establish" />
          </div>
          <ul>
            {block.doesNotProve.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

/* ---------- Timeline ----------------------------------------------------- */

function TimelineView({ block, mode }: BlockProps<TimelineBlock>) {
  return (
    <section className="block block--timeline">
      <BlockHead block={block} kicker="Timeline" />
      {block.lead && <p className="lead">{block.lead}</p>}
      {block.synthetic && <SyntheticBadge />}

      <ol className="tl">
        {block.events.map((e, i) => (
          <li key={i} className="tl__event" data-kind={e.kind} data-pillar={e.pillar}>
            <div className="tl__time">
              <time>{e.time}</time>
            </div>
            <div className="tl__rail" aria-hidden="true">
              <span className="tl__dot" />
            </div>
            <div className="tl__body">
              <div className="tl__tags">
                <EvidenceChip kind={e.kind} />
                <PillarTag pillar={e.pillar} />
                {e.attack && <span className="tl__attack">{e.attack}</span>}
              </div>
              <h4 className="tl__title">{e.title}</h4>
              <p className="tl__text">{e.body}</p>
              {e.evidence && (
                <p className="tl__evidence">
                  <MonoLabel>Evidence</MonoLabel>
                  {e.evidence}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {block.missedDetections?.length ? (
        <div className="tl__missed">
          <div className="tl__missed-head">
            <EvidenceChip kind="uncertain" label="Detection opportunities missed" />
          </div>
          <ul>
            {block.missedDetections.map((m, i) => (
              <li key={i}>
                <code>{m.at}</code> {m.text}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

/* ---------- Query walkthrough -------------------------------------------- */

function QueryView({ block, mode }: BlockProps<QueryBlock>) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(block.code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* Clipboard denied — the code is selectable either way. */
    }
  }

  return (
    <section className="block block--query">
      <BlockHead block={block} kicker="Query walkthrough" />
      {block.lead && <p className="lead">{block.lead}</p>}

      <div className="query__assumes">
        <MonoLabel>Assumes</MonoLabel>
        <p>{block.assumes}</p>
      </div>

      <div className="code">
        <div className="code__head">
          <MonoLabel>{block.language}</MonoLabel>
          <button type="button" className="btn btn--ghost btn--sm" onClick={copy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="code__body">
          <code>{block.code}</code>
        </pre>
      </div>

      <dl className="query__walk">
        {block.walkthrough.map((w, i) => (
          <div key={i} className="query__walk-item">
            <dt>
              <code>{w.part}</code>
            </dt>
            <dd>{w.explains}</dd>
          </div>
        ))}
      </dl>

      <div className="query__result">
        <div className="query__result-col">
          <div className="query__result-head">
            <EvidenceChip kind="observation" label="Expected result" />
          </div>
          <p>{block.expected}</p>
        </div>
        <div className="query__result-col">
          <div className="query__result-head">
            <EvidenceChip kind="uncertain" label="Limitations" />
          </div>
          <ul>
            {block.limitations.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      </div>

      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

/* ---------- Attack chain ------------------------------------------------- */

function ChainView({ block, mode }: BlockProps<ChainBlock>) {
  return (
    <section className="block block--chain">
      <BlockHead block={block} kicker="Attack chain" />
      {block.lead && <p className="lead">{block.lead}</p>}
      <div className="chain">
        {block.phases.map((phase) => (
          <div key={phase.phase} className="chain__phase">
            <div className="chain__label">
              <h4>{phase.phase}</h4>
              {phase.attackId && <span className="chain__id">{phase.attackId}</span>}
            </div>
            <div className="chain__attack">
              <EvidenceChip kind="attack" label="Adversary" />
              <p>{phase.attack}</p>
            </div>
            <div className="chain__defence">
              {phase.cells.map((cell, i) => (
                <div key={i} className="chain__cell">
                  <MonoLabel>{block.lanes[i]}</MonoLabel>
                  <p>{cell}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

/* ---------- Knowledge check ---------------------------------------------- */

function CheckView({ block, mode }: BlockProps<CheckBlock>) {
  const [answers, setAnswers] = useState<Record<string, number>>({})

  return (
    <section className="block block--check">
      <BlockHead block={block} kicker="Knowledge check" />
      <ol className="check__list">
        {block.questions.map((q) => {
          const chosen = answers[q.id]
          const answered = chosen !== undefined
          return (
            <li key={q.id} className="check__q">
              <p className="check__stem">{q.stem}</p>
              <ul className="check__options" role="list">
                {q.options.map((opt, i) => {
                  const isChosen = chosen === i
                  const state = !answered
                    ? 'idle'
                    : isChosen
                      ? opt.correct
                        ? 'correct'
                        : 'incorrect'
                      : opt.correct
                        ? 'correct-unchosen'
                        : 'idle'
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        className="check__option"
                        data-state={state}
                        aria-pressed={isChosen}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                      >
                        <span className="check__marker" aria-hidden="true">
                          {!answered ? '○' : opt.correct ? '✓' : isChosen ? '✕' : '○'}
                        </span>
                        <span>{opt.text}</span>
                      </button>
                      {answered && (isChosen || opt.correct) && (
                        <p className="check__feedback" data-correct={opt.correct}>
                          {opt.feedback}
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>
              {answered && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() =>
                    setAnswers((a) => {
                      const next = { ...a }
                      delete next[q.id]
                      return next
                    })
                  }
                >
                  Try again
                </button>
              )}
            </li>
          )
        })}
      </ol>
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

/* ---------- Interaction wrapper ------------------------------------------ */

function InteractionView({ block, mode }: BlockProps<InteractionBlock>) {
  return (
    <section className="block block--interaction">
      <BlockHead block={block} kicker="Interactive exercise" />
      {block.lead && <p className="lead">{block.lead}</p>}
      <div className="interaction__teaches">
        <MonoLabel>What this teaches</MonoLabel>
        <p>{block.teaches}</p>
      </div>
      <Interaction component={block.component} data={block.data} />
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

/* ---------- Practical blocks --------------------------------------------- */

function BriefView({ block, mode }: BlockProps<BriefBlock>) {
  return (
    <section className="block block--brief">
      <BlockHead block={block} kicker="Practical briefing" />
      <div className="brief__scenario">
        <MonoLabel>Scenario</MonoLabel>
        <p className="lead">{block.scenario}</p>
      </div>

      <div className="brief__grid">
        <div className="brief__panel">
          <MonoLabel>Objectives</MonoLabel>
          <ul>
            {block.objectives.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>
        <div className="brief__panel">
          <MonoLabel>You will need</MonoLabel>
          <ul className="brief__requires">
            {block.requires.map((r, i) => {
              /* A `file` makes this a real download. Items without one are
                 tools the student brings, not resources we ship — and a link
                 to nothing would be a dead control. */
              const href =
                r.file && block.resourceDir
                  ? `${import.meta.env.BASE_URL}resources/${block.resourceDir}/${r.file}`
                  : undefined
              return (
                <li key={i} data-downloadable={!!href}>
                  {href ? (
                    <a className="brief__download" href={href} download>
                      <span className="brief__download-glyph" aria-hidden="true">
                        ↓
                      </span>
                      <span className="brief__download-text">
                        <strong>{r.item}</strong>
                        <span>{r.note}</span>
                      </span>
                      <span className="brief__download-file">{r.file}</span>
                    </a>
                  ) : (
                    <>
                      <strong>{r.item}</strong>
                      <span>{r.note}</span>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="brief__panel">
        <MonoLabel>Environment setup</MonoLabel>
        <ol className="brief__setup">
          {block.setup.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>

      <Callout tone="note">{block.realism}</Callout>

      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

function TasksView({ block, mode }: BlockProps<TasksBlock>) {
  const total = block.tasks.reduce((t, task) => t + task.minutes, 0)
  return (
    <section className="block block--tasks">
      <BlockHead block={block} kicker="Student tasks" />
      {block.lead && <p className="lead">{block.lead}</p>}
      <div className="tasks__budget">
        <MonoLabel>Suggested timing</MonoLabel>
        <span>
          {block.tasks.length} tasks · {total} minutes total
        </span>
      </div>
      <ol className="tasks__list">
        {block.tasks.map((task) => (
          <li key={task.ref} className="tasks__task">
            <div className="tasks__head">
              <span className="tasks__ref">{task.ref}</span>
              <h4>{task.title}</h4>
              <Duration minutes={task.minutes} />
            </div>
            <ol className="tasks__steps">
              {task.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            <p className="tasks__produces">
              <MonoLabel>Produces</MonoLabel>
              {task.produces}
            </p>
          </li>
        ))}
      </ol>
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

function HintsView({ block, mode }: BlockProps<HintsBlock>) {
  const [revealed, setRevealed] = useState<Record<string, number>>({})

  return (
    <section className="block block--hints">
      <BlockHead block={block} kicker="Progressive hints" />
      {block.lead && <p className="lead">{block.lead}</p>}
      <div className="hints__grid">
        {block.hints.map((h) => {
          const shown = revealed[h.forTask] ?? 0
          return (
            <div key={h.forTask} className="hints__group">
              <div className="hints__head">
                <span className="tasks__ref">{h.forTask}</span>
                <MonoLabel>
                  {shown} of {h.tiers.length} revealed
                </MonoLabel>
              </div>
              <ol className="hints__tiers">
                {h.tiers.slice(0, shown).map((tier, i) => (
                  <li key={i}>
                    <span className="hints__tier-num" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span>{tier}</span>
                  </li>
                ))}
              </ol>
              {shown < h.tiers.length ? (
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={() => setRevealed((r) => ({ ...r, [h.forTask]: shown + 1 }))}
                >
                  {shown === 0 ? 'Reveal first hint' : 'Reveal next hint'}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setRevealed((r) => ({ ...r, [h.forTask]: 0 }))}
                >
                  Hide hints
                </button>
              )}
            </div>
          )
        })}
      </div>
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

function DeliverablesView({ block, mode }: BlockProps<DeliverablesBlock>) {
  const [ticked, setTicked] = useState<Record<string, boolean>>({})
  return (
    <section className="block block--deliverables">
      <BlockHead block={block} kicker="Deliverables" />
      {block.lead && <p className="lead">{block.lead}</p>}
      <ul className="deliverables__list">
        {block.items.map((item) => (
          <li key={item.ref}>
            <label className="deliverables__item">
              <input
                type="checkbox"
                checked={!!ticked[item.ref]}
                onChange={() => setTicked((t) => ({ ...t, [item.ref]: !t[item.ref] }))}
              />
              <span className="deliverables__box" aria-hidden="true" />
              <span className="deliverables__text">
                <span className="tasks__ref">{item.ref}</span>
                {item.text}
                {!item.required && <span className="deliverables__optional">optional</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {block.structure && (
        <div className="code">
          <div className="code__head">
            <MonoLabel>Submission structure</MonoLabel>
          </div>
          <pre className="code__body">
            <code>{block.structure}</code>
          </pre>
        </div>
      )}
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

function AssessmentView({ block, mode }: BlockProps<AssessmentBlock>) {
  return (
    <section className="block block--assessment">
      <BlockHead block={block} kicker="Assessment criteria" />
      {block.lead && <p className="lead">{block.lead}</p>}
      <ul className="assess__list">
        {block.criteria.map((c) => (
          <li key={c.band} className="assess__item">
            <div className="assess__head">
              <h4>{c.band}</h4>
              <span className="assess__weight">{c.weight}</span>
            </div>
            <p>{c.descriptor}</p>
          </li>
        ))}
      </ul>
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

function DebriefView({ block, mode }: BlockProps<DebriefBlock>) {
  return (
    <section className="block block--debrief">
      <BlockHead block={block} kicker="Debrief" />
      {block.lead && <p className="lead">{block.lead}</p>}
      <ol className="debrief__list">
        {block.questions.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ol>
      <div className="debrief__landing">
        <MonoLabel>The point to land</MonoLabel>
        <p>{block.landingPoint}</p>
      </div>
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

function RecapView({ block, mode }: BlockProps<RecapBlock>) {
  return (
    <section className="block block--recap">
      <BlockHead block={block} kicker="Recap" />
      <ul className="recap__takeaways">
        {block.takeaways.map((t, i) => (
          <li key={i}>
            <span className="recap__num" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
      {block.furtherStudy.length > 0 && (
        <div className="recap__further">
          <MonoLabel>Further study</MonoLabel>
          <ul>
            {block.furtherStudy.map((f, i) => (
              <li key={i}>
                {f.href ? (
                  <a href={f.href} target="_blank" rel="noopener noreferrer">
                    {f.label}
                    <span className="recap__ext" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                ) : (
                  <strong>{f.label}</strong>
                )}
                <span className="recap__note">{f.note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}

/* =========================================================================
   Dispatcher
   ========================================================================= */

export function BlockView({ block, mode }: { block: Block; mode: RenderMode }) {
  switch (block.kind) {
    case 'title':
      return <TitleView block={block} mode={mode} />
    case 'retrieval':
      return <RetrievalView block={block} mode={mode} />
    case 'scenario':
      return <ScenarioView block={block} mode={mode} />
    case 'objectives':
      return <ObjectivesView block={block} mode={mode} />
    case 'concept':
      return <ConceptView block={block} mode={mode} />
    case 'compare':
      return <CompareView block={block} mode={mode} />
    case 'evidence':
      return <EvidenceView block={block} mode={mode} />
    case 'timeline':
      return <TimelineView block={block} mode={mode} />
    case 'query':
      return <QueryView block={block} mode={mode} />
    case 'chain':
      return <ChainView block={block} mode={mode} />
    case 'check':
      return <CheckView block={block} mode={mode} />
    case 'interaction':
      return <InteractionView block={block} mode={mode} />
    case 'brief':
      return <BriefView block={block} mode={mode} />
    case 'tasks':
      return <TasksView block={block} mode={mode} />
    case 'hints':
      return <HintsView block={block} mode={mode} />
    case 'deliverables':
      return <DeliverablesView block={block} mode={mode} />
    case 'assessment':
      return <AssessmentView block={block} mode={mode} />
    case 'debrief':
      return <DebriefView block={block} mode={mode} />
    case 'recap':
      return <RecapView block={block} mode={mode} />
  }
}
