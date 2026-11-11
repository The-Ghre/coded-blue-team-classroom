import { useId, useState, type CSSProperties } from 'react'
import type { EvidenceBlock } from '@/types/content'
import { EVIDENCE_META } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { EvidenceChip, MonoLabel, SyntheticBadge } from '@/components/brand/Brand'
import { Cylinder, Decor, Detail, Footer, Head, IndexBracket, rng, type Pin } from '../parts'

/* =========================================================================
   EVIDENCE — the cylinder, read pin by pin
   =========================================================================
   The annotated excerpt is written out on manuscript paper, each line in a
   fixed cell with its bar number in the margin. Selecting a line sets the
   blued index bracket on it and raises its note. Only the note changes;
   the lines never move.

   Behaviour matches the shared annotator — buttons with aria-expanded and
   aria-controls, one note open at a time, proves / does-not-prove. Every
   note is in the DOM so a printed handout carries all of them; on screen
   only the open one shows.
   ========================================================================= */

/* ---------------------------------------------------------------------------
   The lid, open: explorer.exe's address space as a pinned cylinder. Mapped
   pages are faint pins; one region holds a whole binary, set in blued steel,
   that no score (no file on disk) contains. Selecting the malfind lines
   brackets that region; selecting netscan, cmdline or pstree brackets the
   tooth it plays, the connection.
   --------------------------------------------------------------------------- */

const LID_ROWS = 6
const LID_COLS = 40
const INJECT = { row: 2, from: 26, to: 30 }

function lidPins(): Pin[] {
  const r = rng(2344)
  const pins: Pin[] = []
  for (let row = 0; row < LID_ROWS; row++)
    for (let col = 0; col < LID_COLS; col++) {
      const inRegion = row >= INJECT.row && row <= INJECT.row + 1 && col >= INJECT.from && col <= INJECT.to
      if (inRegion) pins.push({ row, col, kind: 'inject' })
      else if (r() < 0.3) pins.push({ row, col, kind: 'human' })
    }
  return pins
}

function Lid({ focus }: { focus: 'region' | 'tooth' | null }) {
  const centre = Math.round((INJECT.from + INJECT.to) / 2)
  return (
    <Decor className="nmf-lid">
      <Cylinder
        rows={LID_ROWS}
        cols={LID_COLS}
        pins={lidPins()}
        rowLabels={[{ row: 0, label: 'EXPLORER.EXE · PID 2344' }]}
        timeLabels={[{ col: centre, label: '0x7ff000200000 · RWX · MZ' }]}
        bracket={
          focus === 'region'
            ? { row: INJECT.row + 0.5, col: centre, w: (INJECT.to - INJECT.from + 1) * 26 + 6, h: 50 }
            : focus === 'tooth'
              ? { row: INJECT.row + 0.5, col: LID_COLS + 1.9, w: 70, h: 50 }
              : undefined
        }
      />
      <p className="nmf-lid__caption">explorer.exe · PID 2344 · 0x7ff000200000 · PAGE_EXECUTE_READWRITE · MZ</p>
    </Decor>
  )
}

export function Evidence({ block, mode }: BlockOverrideProps<EvidenceBlock>) {
  const [open, setOpen] = useState<number | null>(null)
  const panelId = useId()
  const focus = open === null ? null : open <= 2 ? 'region' : 'tooth'

  return (
    <section className="block block--evidence nmf-ev">
      <Head block={block} />
      {block.lead && <p className="lead">{block.lead}</p>}
      <SyntheticBadge>{block.source}</SyntheticBadge>
      <Lid focus={focus} />

      <div className="evidence nmf-ev__sheet">
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
                <span className="nmf-ev__bar" aria-hidden="true">
                  {i + 1}
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
                    <IndexBracket active={isOpen} />
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
