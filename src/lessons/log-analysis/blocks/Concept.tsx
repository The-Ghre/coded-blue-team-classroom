import type { ConceptBlock } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { Callout, RedBlue } from '@/components/brand/Brand'
import { Diagram } from '@/components/teaching/Diagram'
import { Detail, Footer, Head } from '../parts'

/* =========================================================================
   CONCEPT — set as a timetable
   =========================================================================
   Most of this lesson's concepts are lists of named things with a meaning:
   Event IDs, log files, status codes, binaries, assessment criteria. A
   timetable sets exactly that shape — a code in the stub column, its
   service note beside it — so the reader scans the codes down the margin
   the way a dispatcher scans stations. A point with no code runs the full
   width as a footnote to the table.
   ========================================================================= */

/** "4624 — successful logon…" → ["4624", "successful logon…"] */
function split(point: string): [string, string] | null {
  const i = point.indexOf(' — ')
  if (i < 1 || i > 90) return null
  return [point.slice(0, i), point.slice(i + 3)]
}

export default function Concept({ block, mode }: BlockOverrideProps<ConceptBlock>) {
  const rows = block.points.map(split)
  const coded = rows.filter(Boolean).length
  const asTable = coded >= Math.ceil(block.points.length / 2)

  return (
    <section className="block block--concept la-concept">
      <Head block={block} kicker="Concept" />
      {block.lead && <p className="lead">{block.lead}</p>}
      {asTable ? (
        <ol className="la-table" role="list">
          {block.points.map((p, i) => {
            const r = rows[i]
            return (
              <li key={i} className={r ? 'la-table__row' : 'la-table__row la-table__row--note'} style={{ ['--i' as string]: i }}>
                {r ? (
                  <>
                    <span className="la-table__code">{r[0]}</span>
                    <span className="la-table__text">{r[1]}</span>
                  </>
                ) : (
                  <span className="la-table__text">{p}</span>
                )}
              </li>
            )
          })}
        </ol>
      ) : (
        <ul className="concept__points">
          {block.points.map((p, i) => (
            <li key={i}>
              <span className="concept__bullet" aria-hidden="true" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
      {block.diagram && <Diagram spec={block.diagram} />}
      {block.callout && <Callout tone={block.callout.tone}>{block.callout.text}</Callout>}
      <RedBlue red={block.redView} blue={block.blueView} />
      <Detail detail={block.detail} mode={mode} />
      <Footer block={block} mode={mode} />
    </section>
  )
}
