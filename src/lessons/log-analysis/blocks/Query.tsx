import { useMemo, useState } from 'react'
import type { QueryBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { EvidenceChip, MonoLabel } from '@/components/brand/Brand'
import { Detail, Footer, Head } from '../parts'

/* =========================================================================
   QUERY WALKTHROUGH — read it clause by clause
   =========================================================================
   The query is a route and its clauses are the stations it calls at. A
   stepper walks the clauses in order; the code lines the current clause
   owns stay inked and the rest drop back to pencil, so the room reads one
   clause at a time. "Show whole query" returns everything to full ink.
   The full walkthrough list stays below, unchanged, for study and print.
   ========================================================================= */

/** Which code lines a walkthrough clause refers to. Matches on the clause's
    leading field or command and follows its continuation lines. */
function linesFor(part: string, code: string[]): number[] {
  const words = part.trim().split(/[\s=]+/).filter(Boolean)
  if (!words.length) return []
  const esc = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pipe = words[0] === '|' && !!words[1]
  const re =
    pipe
      ? new RegExp(`^\\s*\\|\\s*${esc(words[1])}\\b`)
      : new RegExp(`(^|[^A-Za-z])${esc(words[0])}\\b`)
  const out: number[] = []
  code.forEach((l, i) => {
    // A search clause never owns a pipeline command that merely names its field.
    if (!pipe && /^\s*\|/.test(l)) return
    if (re.test(l)) out.push(i)
  })
  return out
}

export default function Query({ block, mode }: BlockOverrideProps<QueryBlock>) {
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState<number | null>(null)
  const code = useMemo(() => block.code.split('\n'), [block.code])
  const owned = useMemo(() => block.walkthrough.map((w) => linesFor(w.part, code)), [block.walkthrough, code])
  const usable = owned.every((o) => o.length > 0)

  async function copy() {
    try {
      await navigator.clipboard.writeText(block.code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* Clipboard denied — the code is selectable either way. */
    }
  }

  const active = step === null || !usable ? null : owned[step]
  const current = step === null ? null : block.walkthrough[step]

  return (
    <section className="block block--query la-query">
      <Head block={block} kicker="Query walkthrough" />
      {block.lead && <p className="lead">{block.lead}</p>}

      <div className="query__assumes">
        <MonoLabel>Assumes</MonoLabel>
        <p>{block.assumes}</p>
      </div>

      <div className="la-query__route">
        <div className="code" data-stepping={active ? '' : undefined}>
          <div className="code__head">
            <MonoLabel>{block.language}</MonoLabel>
            <button type="button" className="btn btn--ghost btn--sm" onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="code__body">
            <code>
              {code.map((l, i) => (
                <span key={i} className={`la-code__line${active?.includes(i) ? ' is-on' : ''}`}>
                  {l || ' '}
                </span>
              ))}
            </code>
          </pre>
        </div>

        {usable && (
          <div className="la-query__stepper">
            <div className="la-query__controls" role="group" aria-label="Walk the query clause by clause">
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => setStep((s) => (s === null ? 0 : Math.max(0, s - 1)))}
                disabled={step === 0}
              >
                <span aria-hidden="true">←</span> {step === null ? 'Start' : 'Previous clause'}
              </button>
              <span className="la-query__count" aria-live="polite">
                {step === null ? `${block.walkthrough.length} clauses` : `Clause ${step + 1} of ${block.walkthrough.length}`}
              </span>
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => setStep((s) => (s === null ? 0 : Math.min(block.walkthrough.length - 1, s + 1)))}
                disabled={step === block.walkthrough.length - 1}
              >
                {step === null ? 'First clause' : 'Next clause'} <span aria-hidden="true">→</span>
              </button>
              {step !== null && (
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setStep(null)}>
                  Show whole query
                </button>
              )}
            </div>
            {current && (
              <div className="la-query__clause" key={step}>
                <code>{current.part}</code>
                <p>{current.explains}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <dl className="query__walk">
        {block.walkthrough.map((w, i) => (
          <div key={i} className={`query__walk-item${step === i ? ' is-current' : ''}`}>
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
