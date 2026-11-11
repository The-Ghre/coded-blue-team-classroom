import { useId, useState, type CSSProperties } from 'react'
import type { EvidenceBlock, EvidenceLine } from '@/types/content'
import { EVIDENCE_META } from '@/types/content'
import type { BlockOverrideProps } from '../../types'
import { EvidenceChip, MonoLabel, SyntheticBadge } from '@/components/brand/Brand'
import { Detail, Footer, Head, Print } from './parts'

/* =========================================================================
   EVIDENCE — what survived the cleanup, on the floor where it was found
   =========================================================================
   Each triage line is a trace lying on its host's carpet: Windows on the
   plum, Linux on the petrol, numbered in the order the instructor reads
   them. A trace is read in three fixed tiers: the command that was run,
   what it returned, and (once selected) what that does and does not mean.

   The trace that names known_hosts is the pivot. Opening it lights the
   threshold and walks a pair of prints across it, because that one file is
   what joins the two machines.

   Lines that carry no host prefix stay in a plain list under the floor, so
   nothing in the block is ever dropped.
   ========================================================================= */

type Host = 'windows' | 'linux'

interface Trace {
  index: number
  line: EvidenceLine
  host: Host | null
  prefix: string
  command: string
  output: string
}

function parse(line: EvidenceLine, index: number): Trace {
  const m = line.text.match(/^\[(LINUX|WINDOWS)\]\s*/i)
  const host = m ? (m[1].toLowerCase() as Host) : null
  const rest = m ? line.text.slice(m[0].length) : line.text
  const arrow = rest.indexOf('→')
  return {
    index,
    line,
    host,
    prefix: m ? m[0].trim() : '',
    command: arrow >= 0 ? rest.slice(0, arrow).trim() : rest,
    output: arrow >= 0 ? rest.slice(arrow + 1).trim() : '',
  }
}

const HOST_NAME: Record<Host, string> = { windows: 'Windows', linux: 'Linux' }

export function Evidence({ block, mode }: BlockOverrideProps<EvidenceBlock>) {
  const [open, setOpen] = useState<number | null>(null)
  const panelId = useId()
  const traces = block.lines.map(parse)
  const pivot = traces.find((t) => /known_hosts/.test(t.line.text))
  const pivotOpen = pivot !== undefined && open === pivot.index
  const loose = traces.filter((t) => !t.host)

  const renderTrace = (t: Trace, order: number) => {
    const isOpen = open === t.index
    const note = t.line.note
    const body = (
      <>
        <span className="hf-trace__num" aria-hidden="true">
          {String(t.index + 1).padStart(2, '0')}
          <span className="hf-sep"> </span>
        </span>
        <span className="hf-trace__marker" data-kind={note?.kind} aria-hidden="true">
          {note ? EVIDENCE_META[note.kind].glyph : '·'}
          <span className="hf-sep"> </span>
        </span>
        <span className="hf-trace__read">
          {t.prefix && <span className="sr-only">{t.prefix} </span>}
          <code className="hf-trace__cmd">{t.command}</code>
          {t.output && (
            <>
              <span className="sr-only"> returns </span>
              <span className="hf-sep" aria-hidden="true">
                {' → '}
              </span>
              <code className="hf-trace__out">{t.output}</code>
            </>
          )}
        </span>
      </>
    )
    return (
      <li
        key={t.index}
        className="hf-trace"
        data-kind={note?.kind}
        data-open={isOpen || undefined}
        data-pivot={t === pivot || undefined}
        style={{ '--o': order } as CSSProperties}
      >
        {note ? (
          <button
            type="button"
            className="hf-trace__btn"
            // Decoration lives on the list item: the button stays neutral on
            // screen and on paper, where no lesson CSS applies.
            style={{ background: 'transparent', border: 0, textAlign: 'left' }}
            data-kind={note.kind}
            aria-expanded={isOpen}
            aria-controls={`${panelId}-${t.index}`}
            onClick={() => setOpen(isOpen ? null : t.index)}
          >
            {body}
          </button>
        ) : (
          <div className="hf-trace__btn hf-trace__btn--plain">{body}</div>
        )}
        {note && (
          // Always in the DOM so the printed handout carries every
          // annotation (print forces .evidence__note open); hidden on screen
          // until the trace is selected.
          <div
            className="hf-trace__note evidence__note"
            id={`${panelId}-${t.index}`}
            data-kind={note.kind}
            hidden={!isOpen}
          >
            <div className="hf-trace__note-head">
              <EvidenceChip kind={note.kind} />
              <strong>{note.label}</strong>
            </div>
            <p>{note.body}</p>
          </div>
        )}
      </li>
    )
  }

  // Reading order across the floor: the order the lines were given.
  let order = 0
  const orderOf = new Map<number, number>()
  traces.forEach((t) => orderOf.set(t.index, order++))

  return (
    <section className="block block--evidence hf-evidence">
      <Head block={block} />
      {block.lead && <p className="lead">{block.lead}</p>}
      <SyntheticBadge>{block.source}</SyntheticBadge>

      <div className="hf-evidence__caption">
        <MonoLabel>{block.caption}</MonoLabel>
        <span className="hf-evidence__hint">Select a trace to read what it proves</span>
      </div>

      <div className="hf-evfloor" data-pivot-open={pivotOpen || undefined}>
        {/* Linux first in the DOM, so keyboard and screen-reader order follow
            the trace numbers; the grid still lays Windows on the left. */}
        {(['linux', 'windows'] as const).map((host) => {
          const list = traces.filter((t) => t.host === host)
          if (!list.length) return null
          return (
            <div key={host} className={`hf-evfloor__carpet hf-carpet hf-carpet--${host}`}>
              <h3 className="hf-carpet__label">
                {HOST_NAME[host]}
                <span className="hf-sep"> · </span>
                <span className="hf-carpet__count">
                  {list.length} {list.length === 1 ? 'trace' : 'traces'}
                </span>
              </h3>
              <ol className="hf-evfloor__traces" style={{ listStyle: 'none', paddingLeft: 0 }}>
                {list.map((t) => renderTrace(t, orderOf.get(t.index) ?? 0))}
              </ol>
            </div>
          )
        })}
        {pivot && (
          <div className="hf-evfloor__strip" aria-hidden="true">
            <Print side={-1} className="hf-evfloor__step hf-evfloor__step--1" />
            <Print side={1} className="hf-evfloor__step hf-evfloor__step--2" />
          </div>
        )}
      </div>
      {pivot && (
        <p className="hf-evfloor__pivot-note" aria-live="polite">
          {pivotOpen ? `Trace ${String(pivot.index + 1).padStart(2, '0')} crosses the threshold: it is the file that joins the two hosts.` : ''}
        </p>
      )}

      {loose.length > 0 && <ol className="hf-evfloor__traces hf-evfloor__traces--loose" style={{ listStyle: 'none', paddingLeft: 0 }}>{loose.map((t) => renderTrace(t, orderOf.get(t.index) ?? 0))}</ol>}

      <div className="proves hf-ledger">
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
