import { useId, useState } from 'react'
import type { EvidenceBlock as EvidenceBlockType } from '@/types/content'
import { EVIDENCE_META } from '@/types/content'
import type { BlockOverrideProps } from '../types'
import { EvidenceChip, MonoLabel, SyntheticBadge } from '@/components/brand/Brand'
import { BlockHead, Detail, Footer } from './shared'

/* =========================================================================
   EVIDENCE — the alert, written up on a call sheet
   =========================================================================
   Each log line becomes a row of the sheet with its fields in ruled
   columns (split only for display — the full line is kept as the row's
   text, so nothing is reworded). Selecting a row clips its annotation
   slip beneath it. The closing line of silence is set as an empty row,
   because what it records is an absence.

   Every annotation is in the DOM; closed ones are hidden. That keeps
   aria-controls pointing at a real element and lets the print stylesheet
   print every note in full.
   ========================================================================= */

function cells(text: string): string[] {
  const parts = text.split(/\s{2,}/).filter(Boolean)
  return parts.length > 1 ? parts : [text]
}

export function EvidenceBlock({ block, mode }: BlockOverrideProps<EvidenceBlockType>) {
  const [open, setOpen] = useState<number | null>(null)
  const panelId = useId()

  return (
    <section className="block block--evidence soc-ev">
      <BlockHead block={block} kicker="Annotated evidence" />
      {block.lead && <p className="lead">{block.lead}</p>}
      <SyntheticBadge>{block.source}</SyntheticBadge>

      <div className="evidence soc-sheet">
        <div className="soc-sheet__head">
          <MonoLabel>{block.caption}</MonoLabel>
          <span className="soc-sheet__hint">Select a row to annotate it</span>
        </div>

        <ol className="soc-sheet__rows">
          {block.lines.map((line, i) => {
            const isOpen = open === i
            const parts = cells(line.text)
            const silent = parts.length === 1
            const row = (
              <>
                <span className="soc-sheet__marker" aria-hidden="true">
                  {line.note ? EVIDENCE_META[line.note.kind].glyph : '·'}
                </span>
                <code className="soc-sheet__line" data-silent={silent}>
                  {parts.map((p, j) => (
                    <span key={j} className="soc-sheet__cell" data-col={j}>
                      {p}
                      {j < parts.length - 1 ? '  ' : ''}
                    </span>
                  ))}
                </code>
              </>
            )
            return (
              <li key={i} className="soc-sheet__item" data-open={isOpen} data-kind={line.note?.kind}>
                {line.note ? (
                  <button
                    type="button"
                    className="soc-sheet__row"
                    data-kind={line.note.kind}
                    aria-expanded={isOpen}
                    aria-controls={`${panelId}-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    {row}
                  </button>
                ) : (
                  <div className="soc-sheet__row">{row}</div>
                )}

                {line.note && (
                  <div
                    className="evidence__note soc-slip"
                    id={`${panelId}-${i}`}
                    data-kind={line.note.kind}
                    hidden={!isOpen}
                  >
                    <div className="soc-slip__head">
                      <EvidenceChip kind={line.note.kind} />
                      <strong>{line.note.label}</strong>
                    </div>
                    <p>{line.note.body}</p>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      <div className="proves soc-proves">
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
