import type { Block } from '@/types/content'
import type { RenderMode } from '@/components/teaching/blocks'
import { Duration, MonoLabel, ProvenanceTag, SourceRefs } from '@/components/brand/Brand'

/**
 * Block heading in this world: the title, with the duration set as a chart
 * note on the same line. Uses the shared class names so study layout and
 * print styling still apply.
 */
export function Head({ block, note }: { block: Block; note?: string }) {
  return (
    <header className="block__head de-head">
      <h2 className="block__title">{block.title}</h2>
      {(block.minutes !== undefined || note) && (
        <div className="block__meta de-head__meta">
          {note && <span className="de-head__note">{note}</span>}
          {block.minutes !== undefined && <Duration minutes={block.minutes} />}
        </div>
      )}
    </header>
  )
}

/** Study-mode expansion, identical in content to the shared renderer's. */
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

/** Provenance and sources, study mode only, as the shared renderer does. */
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

/** Splits "Term — explanation" into its parts; null when there is no term. */
export function splitTerm(text: string): { term: string; rest: string } | null {
  const m = text.match(/^([^—]{2,40}?)\s+—\s+(.+)$/)
  if (!m) return null
  return { term: m[1], rest: m[2] }
}
