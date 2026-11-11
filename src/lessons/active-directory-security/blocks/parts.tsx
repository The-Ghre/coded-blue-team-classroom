import { Fragment, type ReactNode } from 'react'
import type { Block } from '@/types/content'
import type { RenderMode } from '@/components/teaching/blocks'
import { Duration, MonoLabel, ProvenanceTag, SourceRefs } from '@/components/brand/Brand'

/* Shared pieces for this lesson's re-implemented blocks. They mirror the
   shared renderer's scaffolding (head, study-only detail, provenance
   footer) so nothing the shared renderer shows is lost. */

export function SheetHead({ block, kicker }: { block: Block; kicker: string }) {
  return (
    <header className="block__head adw-head">
      <div className="adw-head__text">
        <h2 className="block__title">{block.title}</h2>
        <div className="adw-head__scale">
          <span>{kicker}</span>
          {block.minutes !== undefined && <Duration minutes={block.minutes} />}
        </div>
      </div>
    </header>
  )
}

export function Detail({ detail, mode }: { detail?: string[]; mode: RenderMode }) {
  if (mode !== 'study' || !detail?.length) return null
  return (
    <div className="detail">
      <MonoLabel>Going deeper</MonoLabel>
      <div className="prose">
        {detail.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  )
}

export function Footer({ block, mode }: { block: Block; mode: RenderMode }) {
  if (mode !== 'study') return null
  if (!block.provenance && !block.sources?.length) return null
  return (
    <footer className="block__footer">
      {block.provenance && <ProvenanceTag provenance={block.provenance} />}
      <SourceRefs refs={block.sources} />
    </footer>
  )
}

/* -------------------------------------------------------------------------
   Keynotes: the identifiers a detection is written against, picked out in
   the running text so the one field that gives an attack away reads as a
   field. The words are untouched; only their setting changes.
   ------------------------------------------------------------------------- */

const KEYNOTE =
  /(\bEvent IDs? (?:4[6-7]\d{2}|51[34]\d)\b)|(\b(?:4[6-7]\d{2}|51[34]\d)\b)|(\b0x[0-9a-fA-F]{2}\b)|(\bT1\d{3}(?:\.\d{3})?\b)|(\bPreAuthType 0\b)/g

export function Keynoted({ text }: { text: string }): ReactNode {
  const out: ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(KEYNOTE)) {
    const i = m.index ?? 0
    if (i > last) out.push(text.slice(last, i))
    const kind = m[1] || m[2] ? 'event' : m[3] || m[5] ? 'field' : 'attack'
    out.push(
      <span key={i} className={`adw-kn adw-kn--${kind}`}>
        {m[0]}
      </span>,
    )
    last = i + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return <Fragment>{out}</Fragment>
}
