import { Fragment, type ReactNode } from 'react'
import type { Block } from '@/types/content'
import type { RenderMode } from '@/components/teaching/blocks'
import { Duration, MonoLabel, ProvenanceTag, SourceRefs } from '@/components/brand/Brand'

/* Study-mode pieces the shared renderer keeps private, mirrored here so a
   re-implemented block loses nothing: the "going deeper" detail, and the
   provenance footer. Never shown on slides. */

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

/** The block heading, without the kind kicker: the title carries itself. */
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

/* ---------------------------------------------------------------------------
   Reading a header line: which domains and addresses does it name?
   --------------------------------------------------------------------------- */

const IP = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
const HOST = /\b(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}\b/gi
const VERDICT = /\b(?:pass|fail|softfail|neutral|none)\b/gi

/** The registrable domain: the last two labels. Read domains right to left. */
export function registrable(host: string): string {
  const labels = host.toLowerCase().split('.')
  return labels.slice(-2).join('.')
}

export interface Indicator {
  kind: 'domain' | 'ip'
  value: string
}

/** Every distinct registrable domain and address a line names, in order. */
export function indicatorsIn(text: string): Indicator[] {
  const found: Indicator[] = []
  const seen = new Set<string>()
  for (const m of text.matchAll(IP)) {
    if (!seen.has(m[0])) {
      seen.add(m[0])
      found.push({ kind: 'ip', value: m[0] })
    }
  }
  const stripped = text.replace(IP, ' ')
  for (const m of stripped.matchAll(HOST)) {
    const d = registrable(m[0])
    if (!seen.has(d)) {
      seen.add(d)
      found.push({ kind: 'domain', value: d })
    }
  }
  return found
}

/** The field name of a header line ("Reply-To"), or the whole line. */
export function fieldOf(text: string): string {
  const i = text.indexOf(':')
  return i > 0 ? text.slice(0, i) : text
}

/**
 * Sets a header line with its domains and addresses marked and its
 * authentication verdicts set back, so the eye reads the domain before the
 * verdict — which is the lesson of the Authentication-Results line.
 */
export function MarkedLine({ text }: { text: string }) {
  const field = fieldOf(text)
  const rest = field === text ? '' : text.slice(field.length)
  const tokens: ReactNode[] = []
  const pattern = new RegExp(`(${IP.source})|(${HOST.source})|(${VERDICT.source})`, 'gi')
  let last = 0
  let k = 0
  for (const m of rest.matchAll(pattern)) {
    const at = m.index ?? 0
    if (at > last) tokens.push(<Fragment key={k++}>{rest.slice(last, at)}</Fragment>)
    if (m[1]) tokens.push(<span key={k++} className="pi-tok pi-tok--ip">{m[0]}</span>)
    else if (m[2]) tokens.push(<Host key={k++} host={m[0]} />)
    else tokens.push(<span key={k++} className="pi-tok pi-tok--verdict">{m[0]}</span>)
    last = at + m[0].length
  }
  if (last < rest.length) tokens.push(<Fragment key={k++}>{rest.slice(last)}</Fragment>)
  return (
    <>
      {field !== text && <span className="pi-tok pi-tok--field">{field}</span>}
      {tokens.length ? tokens : rest || text}
    </>
  )
}

/** A hostname with its registrable part — the part that decides — set apart. */
function Host({ host }: { host: string }) {
  const reg = registrable(host)
  const sub = host.slice(0, host.length - reg.length)
  return (
    <span className="pi-tok pi-tok--host">
      {sub && <span className="pi-tok__sub">{sub}</span>}
      <span className="pi-tok__reg">{host.slice(host.length - reg.length)}</span>
    </span>
  )
}

/* ---------------------------------------------------------------------------
   Lookalike characters: a digit standing in for a letter inside a word.
   --------------------------------------------------------------------------- */

const STAND_INS: Record<string, string> = {
  '0': 'the letter o',
  '1': 'the letter l',
  '3': 'the letter e',
  '5': 'the letter s',
  '4': 'the letter a',
}

const DIGIT_NAMES: Record<string, string> = {
  '0': 'zero',
  '1': 'one',
  '3': 'three',
  '4': 'four',
  '5': 'five',
}

export interface Lookalike {
  domain: string
  index: number
  char: string
  /** e.g. "the digit zero standing in for the letter o" */
  reads: string
}

export function findLookalike(domain: string): Lookalike | null {
  for (let i = 1; i < domain.length - 1; i++) {
    const c = domain[i]
    if (STAND_INS[c] && /[a-z]/i.test(domain[i - 1]) && /[a-z]/i.test(domain[i + 1])) {
      return {
        domain,
        index: i,
        char: c,
        reads: `the digit ${DIGIT_NAMES[c]} standing in for ${STAND_INS[c]}`,
      }
    }
  }
  return null
}
