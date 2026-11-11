import type { Block } from '@/types/content'
import type { RenderMode } from '@/components/teaching/blocks'
import { Duration, Eyebrow, MonoLabel, ProvenanceTag, SourceRefs } from '@/components/brand/Brand'

/* The shared renderer's block scaffolding, reproduced with the same classes
   so study mode, print and search treat overridden blocks exactly like the
   rest. Kept identical in behaviour: detail and footer are study-only. */

export function BlockHead({ block, kicker }: { block: Block; kicker?: string }) {
  return (
    <header className="block__head">
      {kicker && <Eyebrow>{kicker}</Eyebrow>}
      <h2 className="block__title">{block.title}</h2>
      {block.minutes !== undefined && (
        <div className="block__meta">
          <Duration minutes={block.minutes} />
        </div>
      )}
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
