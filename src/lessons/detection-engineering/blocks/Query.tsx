import { useMemo, useRef, useState, type CSSProperties } from 'react'
import type { QueryBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { EvidenceChip, MonoLabel } from '@/components/brand/Brand'
import { Detail, Footer, Head } from './shared'

/* =========================================================================
   QUERY — the Sigma walkthrough as a traced Light List entry
   =========================================================================
   Every walkthrough part is tied to the exact lines it explains. Choose a
   part and those lines light up in the rule, the way a chart's light list
   entry points at one symbol on the chart and nothing else. The mapping is
   computed from the code and the part names, so a content edit keeps
   working; a part that names nothing in the code simply highlights nothing.
   ========================================================================= */

/** Lines (0-based, inclusive ranges) that a walkthrough part refers to. */
function rangesFor(part: string, lines: string[]): [number, number][] {
  const keys = part
    .split('/')
    .map((s) => s.split(':')[0].trim())
    .filter(Boolean)
  const indent = (l: string) => l.length - l.trimStart().length
  const out: [number, number][] = []
  for (const key of keys) {
    const start = lines.findIndex((l) => l.trimStart().startsWith(`${key}:`))
    if (start < 0) continue
    const base = indent(lines[start])
    let end = start
    for (let j = start + 1; j < lines.length; j++) {
      if (!lines[j].trim()) break
      if (indent(lines[j]) <= base && !lines[j].trimStart().startsWith('-')) break
      if (indent(lines[j]) < base) break
      end = j
    }
    out.push([start, end])
  }
  return out
}

export function Query({ block, mode }: BlockOverrideProps<QueryBlock>) {
  const lines = useMemo(() => block.code.split('\n'), [block.code])
  const parts = useMemo(
    () => block.walkthrough.map((w) => ({ ...w, ranges: rangesFor(w.part, lines) })),
    [block.walkthrough, lines],
  )
  const [active, setActive] = useState<number | null>(mode === 'slide' ? 0 : null)
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLDivElement>(null)

  const lit = new Set<number>()
  if (active !== null) {
    parts[active]?.ranges.forEach(([a, b]) => {
      for (let i = a; i <= b; i++) lit.add(i)
    })
  }

  function choose(i: number) {
    const next = active === i ? null : i
    setActive(next)
    if (next === null) return
    const first = parts[next]?.ranges[0]?.[0]
    const box = codeRef.current
    const row = first !== undefined ? box?.querySelector<HTMLElement>(`[data-line="${first}"]`) : null
    if (box && row) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      box.scrollTo({ top: Math.max(0, row.offsetTop - box.clientHeight * 0.25), behavior: reduce ? 'auto' : 'smooth' })
    }
  }

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
    <section className="block block--query de-query" data-mode={mode}>
      <Head block={block} />
      {block.lead && <p className="lead de-lead">{block.lead}</p>}

      <div className="query__assumes de-query__assumes">
        <MonoLabel>Assumes</MonoLabel>
        <p>{block.assumes}</p>
      </div>

      <div className="de-query__trace">
        <div className="code de-code" data-tracing={active !== null}>
          <div className="code__head">
            <MonoLabel>{block.language}</MonoLabel>
            <button type="button" className="btn btn--ghost btn--sm" onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="de-code__scroll" ref={codeRef} tabIndex={0} role="region" aria-label={`${block.language} rule`}>
            <pre className="code__body de-code__body">
              <code>
                {lines.map((l, i) => (
                  <span key={i} className="de-code__line" data-line={i} data-lit={lit.has(i) || undefined}>
                    <span className="de-code__no" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className="de-code__text">{l || ' '}</span>
                    {'\n'}
                  </span>
                ))}
              </code>
            </pre>
          </div>
        </div>

        <dl className="query__walk de-walk">
          {parts.map((w, i) => {
            const on = active === i
            const span = w.ranges.length
              ? w.ranges.map(([a, b]) => (a === b ? `line ${a + 1}` : `lines ${a + 1}–${b + 1}`)).join(', ')
              : null
            return (
              <div key={i} className="query__walk-item de-walk__item" data-on={on} style={{ '--i': i } as CSSProperties}>
                <dt>
                  <button type="button" className="de-walk__part" aria-pressed={on} onClick={() => choose(i)}>
                    <code>{w.part}</code>
                    {span && <span className="de-walk__lines">{span}</span>}
                  </button>
                </dt>
                <dd>{w.explains}</dd>
              </div>
            )
          })}
        </dl>
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
