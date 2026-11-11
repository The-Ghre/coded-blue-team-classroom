import { useId, useState, type CSSProperties } from 'react'
import type { EvidenceBlock } from '@/types/content'
import { EVIDENCE_META } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { EvidenceChip, MonoLabel, SyntheticBadge } from '@/components/brand/Brand'
import { Detail, Footer, Head, MarkerRing } from '../parts'

/* =========================================================================
   EVIDENCE — the print on the inspection table
   =========================================================================
   The annotated excerpt is a developed print: silver-black text on fibre
   paper, each line in a fixed cell with its frame number in the margin.
   Selecting a line rings it with the china marker and develops its note.
   Only the developed note changes; the lines never move.

   Behaviour matches the shared annotator — buttons with aria-expanded and
   aria-controls, one note open at a time, proves / does-not-prove. Every
   note is in the DOM so a printed handout carries all of them; on screen
   only the open one shows.
   ========================================================================= */

export function Evidence({ block, mode }: BlockOverrideProps<EvidenceBlock>) {
  const [open, setOpen] = useState<number | null>(null)
  const panelId = useId()

  return (
    <section className="block block--evidence nmf-ev">
      <Head block={block} />
      {block.lead && <p className="lead">{block.lead}</p>}
      <SyntheticBadge>{block.source}</SyntheticBadge>

      <div className="evidence nmf-ev__print">
        <div className="evidence__head nmf-ev__head">
          <MonoLabel>{block.caption}</MonoLabel>
          <span className="evidence__hint">Select a line to annotate it</span>
        </div>

        <ol className="evidence__lines nmf-ev__lines">
          {block.lines.map((line, i) => {
            const isOpen = open === i
            const note = line.note
            return (
              <li key={i} className="evidence__line-wrap nmf-ev__cell" style={{ '--i': i } as CSSProperties}>
                <span className="nmf-ev__frame" aria-hidden="true">
                  {i + 1}
                  <span className="nmf-ev__frame-a">{i + 1}A</span>
                </span>
                {note ? (
                  <button
                    type="button"
                    className={`evidence__line evidence__line--interactive nmf-ev__line${isOpen ? ' is-open' : ''}`}
                    data-kind={note.kind}
                    aria-expanded={isOpen}
                    aria-controls={`${panelId}-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="evidence__marker" aria-hidden="true">
                      {EVIDENCE_META[note.kind].glyph}
                    </span>
                    <code>{line.text}</code>
                    <MarkerRing active={isOpen} />
                  </button>
                ) : (
                  <div className="evidence__line nmf-ev__line">
                    <span className="evidence__marker evidence__marker--none" aria-hidden="true">
                      ·
                    </span>
                    <code>{line.text}</code>
                  </div>
                )}

                {note && (
                  <div
                    className="evidence__note nmf-ev__note"
                    id={`${panelId}-${i}`}
                    data-kind={note.kind}
                    data-open={isOpen}
                  >
                    <div className="evidence__note-head">
                      <EvidenceChip kind={note.kind} />
                      <strong>{note.label}</strong>
                    </div>
                    <p>{note.body}</p>
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
