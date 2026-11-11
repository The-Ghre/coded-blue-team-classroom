import type { ReactNode } from 'react'
import { EVIDENCE_META, PILLAR_META } from '@/types/content'
import type { EvidenceKind, Pillar, Provenance, SourceRef } from '@/types/content'

/* =========================================================================
   BRAND PRIMITIVES
   ========================================================================= */

export function Eyebrow({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <div className={muted ? 'eyebrow eyebrow--muted' : 'eyebrow'}>{children}</div>
}

export function MonoLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className ? `mono-label ${className}` : 'mono-label'}>{children}</div>
}

/**
 * The classroom mark. A shield outline with a check inside — defence and
 * verification, which is what the whole course is about. Drawn rather than
 * imported so it inherits currentColor and prints cleanly.
 */
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className="mark"
    >
      <path
        d="M16 3.5l11 4.2v8.1c0 6.3-4.4 11.7-11 13.4-6.6-1.7-11-7.1-11-13.4V7.7L16 3.5z"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10.8 16.1l3.6 3.6 6.9-7.1"
        fill="none"
        stroke="var(--ev-confirmed)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Wordmark({ compact }: { compact?: boolean }) {
  return (
    <span className="wordmark">
      <Mark size={compact ? 22 : 26} />
      <span className="wordmark__text">
        <span className="wordmark__coded">CODED</span>
        {!compact && <span className="wordmark__rest">Blue Team Classroom</span>}
      </span>
    </span>
  )
}

/* =========================================================================
   EVIDENCE TAXONOMY
   =========================================================================
   Six kinds of claim, each with a colour, a shape, a glyph and a word.
   Colour is never the only carrier — remove it entirely and the chip still
   reads correctly, which is the accessibility requirement and also just
   better teaching. */

export function EvidenceChip({
  kind,
  label,
  title,
}: {
  kind: EvidenceKind
  label?: string
  title?: string
}) {
  const meta = EVIDENCE_META[kind]
  return (
    <span className={`ev ev--${kind}`} title={title ?? meta.definition}>
      <span className="ev__glyph" aria-hidden="true">
        {meta.glyph}
      </span>
      <span>{label ?? meta.label}</span>
    </span>
  )
}

/** The legend. Shown once per session and on the design reference page. */
export function EvidenceLegend({ compact }: { compact?: boolean }) {
  const kinds: EvidenceKind[] = [
    'observation',
    'hypothesis',
    'confirmed',
    'uncertain',
    'response',
    'attack',
  ]
  return (
    <div className={compact ? 'ev-legend ev-legend--compact' : 'ev-legend'}>
      {!compact && (
        <div className="ev-legend__intro">
          <Eyebrow>How to read this course</Eyebrow>
          <p className="lead">
            Every claim in these lessons is labelled as one of six kinds. Learning to tell them
            apart — and to say which one you are making — is the single most transferable habit in
            defensive work.
          </p>
        </div>
      )}
      <dl className="ev-legend__list">
        {kinds.map((kind) => (
          <div key={kind} className="ev-legend__item">
            <dt>
              <EvidenceChip kind={kind} />
            </dt>
            <dd>{EVIDENCE_META[kind].definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function PillarTag({ pillar }: { pillar: Pillar }) {
  const meta = PILLAR_META[pillar]
  return (
    <span className={`pillar pillar--${pillar}`}>
      <span aria-hidden="true" className="pillar__glyph">
        {meta.glyph}
      </span>
      <span>{meta.label}</span>
    </span>
  )
}

/* =========================================================================
   PROVENANCE
   =========================================================================
   The brief requires source-derived content to be distinguishable from
   supplementary additions, and synthetic data to be labelled. Both are
   surfaced in the interface rather than buried in a document. */

const PROVENANCE_COPY: Record<Provenance, { label: string; note: string }> = {
  source: {
    label: 'From source',
    note: 'Derived from the supplied CODED lesson files. The section is cited below.',
  },
  supplementary: {
    label: 'Supplementary',
    note: 'Added by this course as teaching scaffolding. Technical claims are checked against primary vendor or project documentation.',
  },
  synthetic: {
    label: 'Synthetic data',
    note: 'Fabricated for teaching. No real environment produced this, and no address or domain in it should be visited.',
  },
}

export function ProvenanceTag({ provenance }: { provenance: Provenance }) {
  const copy = PROVENANCE_COPY[provenance]
  return (
    <span className={`prov prov--${provenance}`} title={copy.note}>
      <span aria-hidden="true" className="prov__dot" />
      {copy.label}
    </span>
  )
}

export function SyntheticBadge({ children }: { children?: ReactNode }) {
  return (
    <div className="synthetic-badge">
      <span aria-hidden="true" className="synthetic-badge__glyph">
        ⚗
      </span>
      <span>
        <strong>Synthetic example.</strong>{' '}
        {children ??
          'Fabricated for teaching. No real environment produced this data, and no address or domain shown should be visited.'}
      </span>
    </div>
  )
}

export function SourceRefs({ refs }: { refs?: SourceRef[] }) {
  if (!refs?.length) return null
  return (
    <div className="source-refs">
      <MonoLabel>Source</MonoLabel>
      <ul>
        {refs.map((r, i) => (
          <li key={i}>
            <code>{r.file}</code>
            <span aria-hidden="true"> · </span>
            <span>{r.section}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* =========================================================================
   SMALL SHARED PIECES
   ========================================================================= */

export function Callout({
  tone,
  children,
}: {
  tone: 'note' | 'warn' | 'rule'
  children: ReactNode
}) {
  const label = tone === 'warn' ? 'Warning' : tone === 'rule' ? 'Rule' : 'Note'
  const glyph = tone === 'warn' ? '!' : tone === 'rule' ? '§' : 'i'
  return (
    <aside className={`callout callout--${tone}`}>
      <span className="callout__badge" aria-hidden="true">
        {glyph}
      </span>
      <div className="callout__body">
        <MonoLabel>{label}</MonoLabel>
        <p>{children}</p>
      </div>
    </aside>
  )
}

export function RedBlue({ red, blue }: { red?: string; blue?: string }) {
  if (!red && !blue) return null
  return (
    <div className="redblue">
      {red && (
        <div className="redblue__pane redblue__pane--red">
          <div className="redblue__head">
            <span className="redblue__glyph" aria-hidden="true">
              /!\
            </span>
            <MonoLabel>Adversary view</MonoLabel>
          </div>
          <p>{red}</p>
        </div>
      )}
      {blue && (
        <div className="redblue__pane redblue__pane--blue">
          <div className="redblue__head">
            <span className="redblue__glyph" aria-hidden="true">
              (/)
            </span>
            <MonoLabel>Defender view</MonoLabel>
          </div>
          <p>{blue}</p>
        </div>
      )}
    </div>
  )
}

export function Duration({ minutes }: { minutes?: number }) {
  if (!minutes) return null
  return (
    <span className="duration">
      <span aria-hidden="true">◷</span> {minutes} min
    </span>
  )
}
