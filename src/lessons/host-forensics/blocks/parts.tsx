import { useId, type CSSProperties } from 'react'
import type { Block } from '@/types/content'
import type { RenderMode } from '@/components/teaching/blocks'
import { Duration, MonoLabel, ProvenanceTag, SourceRefs } from '@/components/brand/Brand'

/* =========================================================================
   SHARED PARTS for this lesson's block overrides
   =========================================================================
   The shared renderers keep Detail and Footer private, so the overrides
   that re-implement a block carry their own copies here. They render the
   same content in the same places: study-only depth, provenance, sources.
   ========================================================================= */

export type Carpet = 'windows' | 'linux' | 'both'

/** Which carpet a label or a prefixed line belongs to, if it names one. */
export function carpetOf(text: string): Carpet | null {
  const t = text.toLowerCase()
  const win = /\bwindows\b/.test(t)
  const lin = /\blinux\b/.test(t)
  if (/\bboth\b/.test(t)) return 'both'
  if (win && !lin) return 'windows'
  if (lin && !win) return 'linux'
  return null
}

/** Splits a "Prefix: rest" point into its prefix and its body. */
export function splitPrefix(point: string): { prefix: string | null; body: string } {
  const m = point.match(/^([^:]{2,40}):\s+(.*)$/)
  if (!m) return { prefix: null, body: point }
  return { prefix: m[1], body: m[2] }
}

/** Splits a question point "What ran? Prove execution…" into question and gloss. */
export function splitQuestion(point: string): { q: string; gloss: string } {
  const i = point.indexOf('?')
  if (i < 0 || i > 90) return { q: point, gloss: '' }
  return { q: point.slice(0, i + 1), gloss: point.slice(i + 1).trim() }
}

export function Head({ block }: { block: Block }) {
  return (
    <header className="block__head">
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

/**
 * A shoe print, drawn: forefoot, waist and heel with cross-tread, the same
 * sole the carpet records. `side` mirrors it for the left foot.
 */
export function Print({
  side = 1,
  className,
  style,
  children,
}: {
  side?: 1 | -1
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
}) {
  const tread = `hf-tread-${useId().replace(/:/g, '')}`
  return (
    <span className={`hf-print${className ? ` ${className}` : ''}`} style={style} aria-hidden="true">
      <svg viewBox="0 0 40 96" width="14" height="34" style={{ transform: side < 0 ? 'scaleX(-1)' : undefined }}>
        <defs>
          <pattern id={tread} width="40" height="5" patternUnits="userSpaceOnUse">
            <rect width="40" height="2.6" fill="currentColor" />
          </pattern>
        </defs>
        <path
          d="M21 2c9 0 16 8 16 22 0 10-3 17-6 23-2 4-3 7-3 10H12c0-4-1-8-2-12-3-6-6-12-6-21C4 10 12 2 21 2Z"
          fill={`url(#${tread})`}
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d="M11 66h18c2 0 3 2 3 5v10c0 8-5 13-12 13S8 89 8 81V71c0-3 1-5 3-5Z" fill={`url(#${tread})`} stroke="currentColor" strokeWidth="1.4" />
      </svg>
      {children}
    </span>
  )
}

/** Small brass plaque: the strip's own label. */
export function Plaque({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={`hf-plaque${className ? ` ${className}` : ''}`}>{children}</span>
}
