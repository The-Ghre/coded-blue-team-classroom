import type { CSSProperties } from 'react'
import type { ConceptBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { Callout, RedBlue } from '@/components/brand/Brand'
import { Diagram } from '@/components/teaching/Diagram'
import { Head, splitTerm } from './shared'
import { patternGlyphFor } from '../glyphs'

/* =========================================================================
   CONCEPT — set as a Light List page
   =========================================================================
   The Light List gives every light one row: number, name, characteristic,
   remarks. A concept's "Term — explanation" points become those rows,
   each with a small drawing of the pattern itself (a threshold crossing,
   a sequence, one source fanning across many targets…). Points without a
   term become the page's cautionary notes. On the study page the shared
   renderer stays, so its reading layout and print styling are untouched.
   ========================================================================= */

export function Concept({ block, mode, Default }: BlockOverrideProps<ConceptBlock>) {
  if (mode !== 'slide') return <Default block={block} mode={mode} />

  const rows = block.points.map((p) => ({ raw: p, split: splitTerm(p) }))
  const entries = rows.filter((r) => r.split)
  const notes = rows.filter((r) => !r.split)

  return (
    <section className="block block--concept de-concept">
      <Head block={block} />
      {block.lead && <p className="lead de-lead">{block.lead}</p>}

      {entries.length > 0 && (
        <ol className="de-list" aria-label={`${block.title}: entries`}>
          {entries.map(({ split }, i) => {
            const Glyph = patternGlyphFor(split!.term)
            return (
              <li key={i} className="de-list__row" style={{ '--i': i } as CSSProperties}>
                <span className="de-list__no" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="de-list__glyph" aria-hidden="true">
                  {Glyph ? <Glyph /> : null}
                </span>
                <strong className="de-list__term">{split!.term}</strong>
                <span className="de-list__text">{split!.rest}</span>
              </li>
            )
          })}
        </ol>
      )}

      {notes.length > 0 && (
        <ul className="de-notes">
          {notes.map((n, i) => (
            <li key={i} className="de-notes__item" style={{ '--i': i + entries.length } as CSSProperties}>
              {n.raw}
            </li>
          ))}
        </ul>
      )}

      {block.diagram && <Diagram spec={block.diagram} />}
      {block.callout && <Callout tone={block.callout.tone}>{block.callout.text}</Callout>}
      <RedBlue red={block.redView} blue={block.blueView} />
    </section>
  )
}
