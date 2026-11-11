import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { BlockOverrideProps } from '../../types'
import type { QueryBlock } from '@/types/content'
import { EvidenceChip, MonoLabel } from '@/components/brand/Brand'
import { Detail, Footer, Head } from '../parts'

/* =========================================================================
   QUERY — every clause pinned to its explanation
   =========================================================================
   The walkthrough items are controls. Choosing one pins its number to the
   lines of the query it explains, the way a specialist's annotation pins a
   leader to the exact flaw on the stamp. Lines are matched by the tokens
   the walkthrough itself names, so a content edit keeps working; an item
   whose tokens match nothing simply pins nothing.
   ========================================================================= */

function matchLines(lines: string[], part: string): number[] {
  const code = lines.join('\n')
  const tokens = part
    .split(/\s+|\s\+\s/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 4 && t !== '+' && code.includes(t))
  const hits = new Set<number>()
  lines.forEach((line, i) => {
    if (tokens.some((t) => line.includes(t))) hits.add(i)
  })
  return [...hits]
}

export function QueryOverride({ block, mode }: BlockOverrideProps<QueryBlock>) {
  const [chosen, setChosen] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const lines = useMemo(() => block.code.split('\n'), [block.code])
  const pins = useMemo(() => block.walkthrough.map((w) => matchLines(lines, w.part)), [block.walkthrough, lines])
  const active = hover ?? chosen
  const lit = new Set(active !== null ? pins[active] : [])
  const preRef = useRef<HTMLPreElement>(null)

  // A chosen clause scrolls its first pinned line into the code panel's own
  // view when the panel overflows; the page itself never moves.
  useEffect(() => {
    const pre = preRef.current
    if (chosen === null || !pre || pre.scrollHeight <= pre.clientHeight) return
    const first = pre.querySelector<HTMLElement>(`[data-line="${pins[chosen]?.[0]}"]`)
    if (!first) return
    const top = first.offsetTop - pre.clientHeight / 3
    pre.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [chosen, pins])

  async function copy() {
    try {
      await navigator.clipboard.writeText(block.code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* Clipboard denied — the code is selectable either way. */
    }
  }

  let inComment = false

  return (
    <section className={`block block--query th-query th-query--${mode}`}>
      <Head block={block} />
      {block.lead && <p className="lead">{block.lead}</p>}

      <div className="query__assumes th-query__assumes">
        <MonoLabel>Assumes</MonoLabel>
        <p>{block.assumes}</p>
      </div>

      <div className="th-query__plate">
        <div className="code th-query__code">
          <div className="code__head">
            <MonoLabel>{block.language}</MonoLabel>
            <button type="button" className="btn btn--ghost btn--sm" onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="code__body th-query__body" ref={preRef}>
            <code>
              {lines.map((line, i) => {
                const startsComment = line.trim().startsWith('/*')
                if (startsComment) inComment = true
                const comment = inComment
                if (line.includes('*/')) inComment = false
                const isLit = lit.has(i)
                return (
                  <span
                    key={i}
                    className="th-query__line"
                    data-comment={comment}
                    data-lit={isLit}
                    data-line={i}
                    data-head={startsComment && /hypothesis/i.test(line)}
                  >
                    <span className="th-query__pin" aria-hidden="true">
                      {isLit && active !== null ? active + 1 : ''}
                    </span>
                    {line || ' '}
                    {'\n'}
                  </span>
                )
              })}
            </code>
          </pre>
        </div>

        <ol className="th-query__walk" aria-label="What each clause does">
          {block.walkthrough.map((w, i) => (
            <li key={i} style={{ '--k': i } as CSSProperties}>
              <button
                type="button"
                className="th-query__item"
                aria-pressed={chosen === i}
                data-active={active === i}
                onClick={() => setChosen(chosen === i ? null : i)}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              >
                <span className="th-query__num" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="th-query__item-body">
                  <code>{w.part}</code>
                  <span>{w.explains}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

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
