/* =========================================================================
   SEARCH — a small in-memory index over every block of every session
   =========================================================================
   The whole course is a few hundred kilobytes of structured data, so the
   index is built once at module load and queried synchronously. No worker,
   no network, no dependency.
   ========================================================================= */

import type { Block, Session } from '@/types/content'
import { sessions } from '@/content'

export interface SearchDoc {
  sessionNumber: number
  sessionSlug: string
  sessionTitle: string
  blockId: string
  blockTitle: string
  kind: Block['kind']
  area: 'theory' | 'practical'
  /** Lower-cased haystack. */
  text: string
  /** A short readable excerpt for the result list. */
  excerpt: string
}

export interface SearchResult extends SearchDoc {
  score: number
  /** Excerpt with matched terms wrapped in <mark>. Pre-escaped. */
  highlighted: string
}

/* ---------- Text extraction ---------------------------------------------- */

/**
 * Walk any block and collect its human-readable strings. Deliberately
 * structural rather than per-kind: a new block type becomes searchable
 * without touching this function.
 */
function collectText(value: unknown, depth = 0, out: string[] = []): string[] {
  if (depth > 8) return out
  if (typeof value === 'string') {
    out.push(value)
    return out
  }
  if (Array.isArray(value)) {
    for (const item of value) collectText(item, depth + 1, out)
    return out
  }
  if (value && typeof value === 'object') {
    for (const [key, v] of Object.entries(value)) {
      // Skip keys that carry no meaning for a reader.
      if (key === 'id' || key === 'kind' || key === 'provenance') continue
      collectText(v, depth + 1, out)
    }
  }
  return out
}

function buildExcerpt(block: Block): string {
  const lead = (block as { lead?: string }).lead
  if (lead) return lead
  const parts = collectText(block)
  // Skip the title, which is already shown as the result heading.
  const body = parts.filter((p) => p !== block.title && p.length > 40)
  return body[0] ?? parts.find((p) => p !== block.title) ?? ''
}

function docsForSession(session: Session): SearchDoc[] {
  const make = (block: Block, area: 'theory' | 'practical'): SearchDoc => {
    const text = collectText(block).join(' ').toLowerCase()
    return {
      sessionNumber: session.number,
      sessionSlug: session.slug,
      sessionTitle: session.title,
      blockId: block.id,
      blockTitle: block.title,
      kind: block.kind,
      area,
      text,
      excerpt: buildExcerpt(block),
    }
  }
  return [
    ...session.theory.blocks.map((b) => make(b, 'theory')),
    ...session.practical.blocks.map((b) => make(b, 'practical')),
  ]
}

export const searchIndex: SearchDoc[] = sessions.flatMap(docsForSession)

/* ---------- Query -------------------------------------------------------- */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Builds the highlighted excerpt. The excerpt is HTML-escaped first and
 * only then has <mark> inserted, so course text can never inject markup.
 */
function highlight(excerpt: string, terms: string[]): string {
  const escaped = escapeHtml(excerpt)
  if (!terms.length) return escaped
  const pattern = new RegExp(`(${terms.map(escapeRegex).join('|')})`, 'gi')
  return escaped.replace(pattern, '<mark>$1</mark>')
}

export function search(query: string, limit = 40): SearchResult[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1)

  if (!terms.length) return []

  const results: SearchResult[] = []

  for (const doc of searchIndex) {
    let score = 0
    let matchedAll = true

    for (const term of terms) {
      const inTitle = doc.blockTitle.toLowerCase().includes(term)
      const inSessionTitle = doc.sessionTitle.toLowerCase().includes(term)
      const bodyMatches = doc.text.split(term).length - 1

      if (!inTitle && !inSessionTitle && bodyMatches === 0) {
        matchedAll = false
        break
      }
      // Title hits are worth far more than body frequency.
      if (inTitle) score += 24
      if (inSessionTitle) score += 10
      score += Math.min(bodyMatches, 12) * 2
    }

    if (!matchedAll) continue

    // A small nudge so theory appears above practical at equal relevance,
    // since students usually search for a concept before its exercise.
    if (doc.area === 'theory') score += 1

    results.push({
      ...doc,
      score,
      highlighted: highlight(doc.excerpt, terms),
    })
  }

  return results.sort((a, b) => b.score - a.score || a.sessionNumber - b.sessionNumber).slice(0, limit)
}
