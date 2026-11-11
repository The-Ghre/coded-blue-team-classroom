import type { ReactNode } from 'react'
import type { Block } from '@/types/content'
import type { RenderMode } from '@/components/teaching/blocks'
import { Duration, MonoLabel, ProvenanceTag, SourceRefs } from '@/components/brand/Brand'

/* Shared scaffolding for this world's re-implemented blocks. Mirrors the
   shared renderer's head, study-mode depth and provenance footer exactly,
   so nothing a block carries is lost when the world changes its form. */

export function Head({ block, kicker, children }: { block: Block; kicker: string; children?: ReactNode }) {
  return (
    <header className="block__head la-head">
      {/* The stub carries the slot's time, as a timetable does. The kind
          word is kept for assistive technology only. */}
      <div className="la-head__stub">
        <span className="sr-only">{kicker}</span>
        {block.minutes !== undefined && <Duration minutes={block.minutes} />}
      </div>
      <h2 className="block__title">{block.title}</h2>
      {children}
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
