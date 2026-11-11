import type { ReactNode } from 'react'
import type { Block } from '@/types/content'
import type { RenderMode } from '@/components/teaching/blocks'
import { Duration, Eyebrow, MonoLabel, ProvenanceTag, SourceRefs } from '@/components/brand/Brand'
import { getSession } from '@/content'
import { useLesson } from '@/lessons/LessonContext'

/* =========================================================================
   Shared pieces for the Safelight overrides. They reproduce the markup of
   the shared renderers' head, depth and footer so the shared print rules
   and screen-reader structure keep applying to the blocks this kit
   re-composes.
   ========================================================================= */

export function KitHead({ block, kicker }: { block: Block; kicker: string }) {
  return (
    <header className="block__head">
      <Eyebrow>{kicker}</Eyebrow>
      <h2 className="block__title">{block.title}</h2>
      {block.minutes !== undefined && (
        <div className="block__meta">
          <Duration minutes={block.minutes} />
        </div>
      )}
    </header>
  )
}

export function KitDetail({ detail, mode }: { detail?: string[]; mode: RenderMode }) {
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

export function KitFooter({ block, mode }: { block: Block; mode: RenderMode }) {
  if (mode !== 'study') return null
  if (!block.provenance && !block.sources?.length) return null
  return (
    <footer className="block__footer">
      {block.provenance && <ProvenanceTag provenance={block.provenance} />}
      <SourceRefs refs={block.sources} />
    </footer>
  )
}

/** The session this kit is mounted for. */
export function useKitSession() {
  const { slug } = useLesson()
  return slug ? getSession(slug) : undefined
}

/**
 * A china-marker stroke, drawn on. The path is hand-authored to wobble like
 * a grease pencil rather than a geometric ellipse. Decorative.
 */
export function MarkerRing({ className, tone = 'yellow' }: { className?: string; tone?: 'yellow' | 'red' }) {
  return (
    <svg
      className={`ir-marker ir-marker--${tone}${className ? ` ${className}` : ''}`}
      viewBox="0 0 200 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        pathLength={1}
        d="M118 9C72 4 22 16 11 47c-10 29 25 58 84 63 57 5 98-14 99-46 1-28-34-50-86-55-18-2-35 0-49 4"
      />
    </svg>
  )
}

/** A china-marker cross: the mark a printer puts through a frame to reject it. */
export function MarkerCross({ className }: { className?: string }) {
  return (
    <svg
      className={`ir-cross${className ? ` ${className}` : ''}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path pathLength={1} d="M12 14C38 38 61 62 90 88" />
      <path pathLength={1} d="M86 10C62 36 37 63 10 90" />
    </svg>
  )
}

/** Splits "Name — body" content into its two halves when the shape holds. */
export function splitDash(text: string): { name?: string; body: string } {
  const i = text.indexOf(' — ')
  if (i <= 0 || i > 60) return { body: text }
  return { name: text.slice(0, i), body: text.slice(i + 3) }
}

export function Frag({ children }: { children: ReactNode }) {
  return <>{children}</>
}
