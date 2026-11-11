import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { EvidenceBlock } from '@/types/content'
import { EVIDENCE_META } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { EvidenceChip, MonoLabel, SyntheticBadge } from '@/components/brand/Brand'
import { Detail, Footer, Head, MarkedLine, fieldOf, findLookalike, indicatorsIn } from '../shared'

/* =========================================================================
   READING THE LINE — the annotated header, Session 03's way
   =========================================================================
   The header is the line under the lure. Each field is a point on it; the
   student works along it and ties a knot at every field they have read.
   Everything they learn registers onto one record that never moves (the
   plate on the right), so the picture builds rather than resetting:

   - the selected field's annotation, word for word from the content;
   - a lookalike domain, set at specimen scale so the counterfeit character
     can be seen at the size it was designed not to be noticed at;
   - the agreement tally: every domain or address named by two or more
     fields, with a knot per field — corroboration made countable.

   Domains and addresses in each line are marked and authentication
   verdicts are set back, so the eye reads the domain before the verdict.
   ========================================================================= */

function Knot({ state }: { state: 'unread' | 'read' | 'open' }) {
  return (
    <svg className="pi-knot" data-state={state} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      {state === 'unread' ? (
        <circle cx="10" cy="10" r="3.4" />
      ) : (
        <path d="M10 3.5 C14.5 3.5 15.5 9 10 10 C4.5 11 5.5 16.5 10 16.5 C14.5 16.5 15.5 11 10 10 C4.5 9 5.5 3.5 10 3.5 Z" />
      )}
    </svg>
  )
}

export function HeaderEvidence({ block, mode }: BlockOverrideProps<EvidenceBlock>) {
  const [open, setOpen] = useState<number | null>(null)
  const [read, setRead] = useState<Set<number>>(() => new Set())
  const plateId = useId()
  const listRef = useRef<HTMLOListElement>(null)

  /* Which lines name the same domain or address. */
  const agreement = useMemo(() => {
    const byValue = new Map<string, { kind: 'domain' | 'ip'; lines: number[] }>()
    block.lines.forEach((line, i) => {
      for (const ind of indicatorsIn(line.text)) {
        const entry = byValue.get(ind.value) ?? { kind: ind.kind, lines: [] }
        entry.lines.push(i)
        byValue.set(ind.value, entry)
      }
    })
    return [...byValue.entries()]
      .filter(([, v]) => v.lines.length >= 2)
      .map(([value, v]) => ({ value, ...v }))
  }, [block.lines])

  /* Runs of Received lines: the hops, read from the bottom up. */
  const hop = (i: number): 'first' | 'mid' | 'last' | undefined => {
    const isR = (j: number) => fieldOf(block.lines[j]?.text ?? '') === 'Received'
    if (!isR(i)) return undefined
    const prev = i > 0 && isR(i - 1)
    const next = i < block.lines.length - 1 && isR(i + 1)
    if (!prev && !next) return undefined
    return !prev ? 'first' : !next ? 'last' : 'mid'
  }

  function choose(i: number) {
    setOpen((cur) => (cur === i ? null : i))
    setRead((r) => {
      if (r.has(i)) return r
      const next = new Set(r)
      next.add(i)
      return next
    })
  }

  function onKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const buttons = [...(listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
    const at = buttons.indexOf(e.currentTarget)
    const next = buttons[at + (e.key === 'ArrowDown' ? 1 : -1)]
    if (next) {
      e.preventDefault()
      next.focus()
    }
  }

  const current = open !== null ? block.lines[open] : null
  const lookalike =
    current &&
    indicatorsIn(current.text)
      .filter((d) => d.kind === 'domain')
      .map((d) => findLookalike(d.value))
      .find(Boolean)

  return (
    <section className="block block--evidence pi-read" data-mode={mode}>
      <Head block={block} />
      {block.lead && <p className="lead">{block.lead}</p>}
      <SyntheticBadge>{block.source}</SyntheticBadge>

      <div className="pi-read__bench">
        <div className="pi-read__record">
          <div className="pi-read__cap">
            <MonoLabel>{block.caption}</MonoLabel>
            <span className="pi-read__hint">
              Select a line to annotate it · {read.size} of{' '}
              {block.lines.filter((l) => l.note).length} read
            </span>
          </div>

          <ol className="pi-read__lines" ref={listRef}>
            {block.lines.map((line, i) => {
              const isOpen = open === i
              const h = hop(i)
              return (
                <li key={i} className="pi-read__row" data-hop={h}>
                  {line.note ? (
                    <button
                      type="button"
                      className="pi-read__line"
                      data-kind={line.note.kind}
                      aria-expanded={isOpen}
                      aria-controls={plateId}
                      onClick={() => choose(i)}
                      onKeyDown={onKey}
                    >
                      <Knot state={isOpen ? 'open' : read.has(i) ? 'read' : 'unread'} />
                      <span className="pi-read__glyph" aria-hidden="true">
                        {EVIDENCE_META[line.note.kind].glyph}
                      </span>
                      <code>
                        <MarkedLine text={line.text} />
                      </code>
                    </button>
                  ) : (
                    <div className="pi-read__line pi-read__line--plain">
                      <span className="pi-knot-spacer" aria-hidden="true" />
                      <span className="pi-read__glyph" aria-hidden="true">
                        ·
                      </span>
                      <code>
                        <MarkedLine text={line.text} />
                      </code>
                    </div>
                  )}
                  {h === 'last' && (
                    <span className="pi-read__hops" aria-hidden="true">
                      <svg viewBox="0 0 12 40" preserveAspectRatio="none" focusable="false">
                        <path d="M6 40 V4 M2 9 L6 3 L10 9" />
                      </svg>
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
          {block.lines.some((_, i) => hop(i) === 'last') && (
            <p className="pi-read__hops-note">Received hops stack newest first. The bottom one is the origin.</p>
          )}
        </div>

        <div className="pi-read__plate" id={plateId} aria-live="polite">
          {current?.note ? (
            <div className="pi-read__note" data-kind={current.note.kind} key={open ?? -1}>
              <div className="pi-read__note-head">
                <EvidenceChip kind={current.note.kind} />
                <span className="pi-read__note-field">{fieldOf(current.text)}</span>
              </div>
              <h3 className="pi-read__note-label">{current.note.label}</h3>
              <p>{current.note.body}</p>
              {lookalike && (
                <figure className="pi-specimen">
                  <div className="pi-specimen__word" aria-hidden="true">
                    {lookalike.domain.slice(0, lookalike.index)}
                    <span className="pi-specimen__char">{lookalike.char}</span>
                    {lookalike.domain.slice(lookalike.index + 1)}
                  </div>
                  <figcaption>
                    <code>{lookalike.domain}</code>: {lookalike.reads}.
                  </figcaption>
                </figure>
              )}
            </div>
          ) : (
            <p className="pi-read__empty">
              Work along the header and select each line. What you read registers here, and the
              tally below counts every field that names the same domain or address.
            </p>
          )}

          {agreement.length > 0 && (
            <div className="pi-tally">
              <MonoLabel>Where fields agree</MonoLabel>
              <ul>
                {agreement.map((a) => {
                  const readCount = a.lines.filter((l) => read.has(l)).length
                  return (
                    <li key={a.value} data-complete={readCount === a.lines.length}>
                      <code className="pi-tally__value" data-kind={a.kind}>
                        {a.value}
                      </code>
                      <span className="pi-tally__knots">
                        {a.lines.map((l) => (
                          <span
                            key={l}
                            className="pi-tally__field"
                            data-read={read.has(l)}
                            title={fieldOf(block.lines[l].text)}
                          >
                            <Knot state={read.has(l) ? 'read' : 'unread'} />
                            <span className="pi-tally__field-name">{fieldOf(block.lines[l].text)}</span>
                          </span>
                        ))}
                      </span>
                      <span className="pi-tally__count">
                        named by {a.lines.length} fields · {readCount} read
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
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
