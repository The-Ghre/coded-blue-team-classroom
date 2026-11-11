import type { Block, Course, Session } from '@/types/content'
import { session01 } from './sessions/s01-soc-operations'
import { session02 } from './sessions/s02-log-analysis'
import { session03 } from './sessions/s03-phishing-investigation'
import { session04 } from './sessions/s04-detection-engineering'
import { session05 } from './sessions/s05-incident-response'
import { session06 } from './sessions/s06-host-forensics'
import { session07 } from './sessions/s07-network-memory-forensics'
import { session08 } from './sessions/s08-malware-analysis'
import { session09 } from './sessions/s09-threat-hunting'
import { session10 } from './sessions/s10-active-directory'

export const sessions: Session[] = [
  session01,
  session02,
  session03,
  session04,
  session05,
  session06,
  session07,
  session08,
  session09,
  session10,
]

export const course: Course = {
  title: 'CODED Blue Team Classroom',
  tagline: 'Defensive Security Track',
  description:
    'Ten three-hour sessions built from the CODED Defensive track source material. Each session pairs ninety minutes of theory with a ninety-minute practical workshop that applies it. Eight core sessions take you from the SOC floor to malware analysis; two extension sessions add threat hunting and Active Directory defence.',
  sessions,
  knownGaps: [
    {
      title: 'The Foundation track is referenced but not supplied',
      detail:
        'Every source file assumes a prior Foundation series covering attacker technique — the Kill Chain, lateral movement, credential theft, persistence, web application attacks, DNS and file analysis. Those files were not in the supplied folder. Rather than assume that knowledge silently, each session lists the specific prerequisites it depends on, and the retrieval questions at the start of Session 1 surface them explicitly. Students arriving without the Foundation track will need those four facts before Session 1.',
    },
    {
      title: 'Forward references point to a sequence the files do not follow',
      detail:
        'Several files end by naming threat hunting as "tomorrow" when the next supplied file is something else — Day 2 points at hunting but is followed by phishing investigation, and Day 4 does the same before incident response. The backward-pointing "Yesterday" chain is internally consistent across all ten files and agrees with the file numbering, so this course follows that chain. The forward pointers appear to survive from an earlier ordering of the material.',
    },
    {
      title: 'Day 2 and Day 4 overlap on detection engineering',
      detail:
        'The Day 2 file is titled "Log Analysis and Detection Engineering" and its section 8 introduces detection query writing. Day 4 covers the discipline in full. This course treats the Day 2 content as the bridge it is — enough to read and modify a query — and leaves rule design, tuning cycles, Sigma and coverage mapping to Session 4. No content was dropped; the overlap is in the source.',
    },
    {
      title: 'Day 10 points onward to a threat intelligence session that does not exist',
      detail:
        'The final supplied file ends by naming threat intelligence as the following day. No such file was provided, so the course ends at Session 10. The reference is recorded here rather than quietly removed, because it indicates the source set is a subset of a longer intended track.',
    },
    {
      title: 'No dates appear in the source material',
      detail:
        'The supplied files contain no cohort dates, no schedule and no calendar. The dates that do appear — 14 March 2026 and similar — are inside synthetic incident scenarios, not delivery dates. This course therefore numbers sessions and states durations, and assigns no dates at all.',
    },
    {
      title: 'The source contains no practical exercises',
      detail:
        'All ten files are theory documents with discussion prompts, scenario walkthroughs and tool workflows. They contain no student tasks, no lab infrastructure, no datasets and no assessment criteria. Every practical in this course was written for it, built from the source material\'s own scenarios, workflows and reporting templates. All practicals are self-contained and use labelled synthetic data; none requires a SIEM, an EDR console or a remote lab.',
    },
  ],
}

/* ---------------------------------------------------------------------------
   Lookups
   --------------------------------------------------------------------------- */

export function getSession(numberOrSlug: string | number): Session | undefined {
  if (typeof numberOrSlug === 'number') {
    return sessions.find((s) => s.number === numberOrSlug)
  }
  const asNumber = Number(numberOrSlug)
  if (!Number.isNaN(asNumber)) {
    return sessions.find((s) => s.number === asNumber)
  }
  return sessions.find((s) => s.slug === numberOrSlug)
}

/** Slide order for presentation mode: theory blocks, then practical blocks. */
export function getSlides(session: Session): Block[] {
  return [...session.theory.blocks, ...session.practical.blocks]
}

export function getBlock(session: Session, blockId: string): Block | undefined {
  return getSlides(session).find((b) => b.id === blockId)
}

/** Index of a block within the flattened slide order; -1 when absent. */
export function getSlideIndex(session: Session, blockId: string): number {
  return getSlides(session).findIndex((b) => b.id === blockId)
}

export function isPracticalBlock(session: Session, blockId: string): boolean {
  return session.practical.blocks.some((b) => b.id === blockId)
}

/* ---------------------------------------------------------------------------
   Integrity checks
   ---------------------------------------------------------------------------
   The brief requires exactly 90 minutes of theory and 90 of practical per
   session. These run in development so a content edit that breaks the
   timetable is caught while editing, not in a classroom.
   --------------------------------------------------------------------------- */

export interface TimingReport {
  session: number
  title: string
  theoryMinutes: number
  practicalMinutes: number
  ok: boolean
}

function sumMinutes(blocks: Block[]): number {
  return blocks.reduce((total, block) => total + (block.minutes ?? 0), 0)
}

export function checkTimings(): TimingReport[] {
  return sessions.map((s) => {
    const theoryMinutes = sumMinutes(s.theory.blocks)
    const practicalMinutes = sumMinutes(s.practical.blocks)
    return {
      session: s.number,
      title: s.title,
      theoryMinutes,
      practicalMinutes,
      ok: theoryMinutes === 90 && practicalMinutes === 90,
    }
  })
}

export function checkDuplicateIds(): string[] {
  const problems: string[] = []
  for (const s of sessions) {
    const seen = new Set<string>()
    for (const block of getSlides(s)) {
      if (seen.has(block.id)) {
        problems.push(`Session ${s.number}: duplicate block id "${block.id}"`)
      }
      seen.add(block.id)
    }
  }
  return problems
}

if (import.meta.env?.DEV) {
  const timings = checkTimings().filter((t) => !t.ok)
  if (timings.length) {
    // eslint-disable-next-line no-console
    console.warn(
      '[content] Session timing does not total 90/90:',
      timings.map((t) => `S${t.session} ${t.theoryMinutes}/${t.practicalMinutes}`).join(', '),
    )
  }
  const dupes = checkDuplicateIds()
  if (dupes.length) {
    // eslint-disable-next-line no-console
    console.warn('[content] Duplicate block ids:', dupes)
  }
}

/* ---------------------------------------------------------------------------
   Glossary — flattened from per-session terms
   --------------------------------------------------------------------------- */

export interface GlossaryEntry {
  term: string
  definition: string
  session: number
  sessionTitle: string
  slug: string
}

export const glossary: GlossaryEntry[] = sessions
  .flatMap((s) =>
    (s.terms ?? []).map((t) => ({
      ...t,
      session: s.number,
      sessionTitle: s.title,
      slug: s.slug,
    })),
  )
  .sort((a, b) => a.term.localeCompare(b.term))

/* ---------------------------------------------------------------------------
   Source material mapping — every session traced to its supplied file
   --------------------------------------------------------------------------- */

export interface SourceMapEntry {
  file: string
  sessions: { number: number; title: string; track: Session['track'] }[]
}

export const sourceMap: SourceMapEntry[] = (() => {
  const byFile = new Map<string, SourceMapEntry>()
  for (const s of sessions) {
    for (const file of s.sourceFiles) {
      if (!byFile.has(file)) byFile.set(file, { file, sessions: [] })
      byFile.get(file)!.sessions.push({ number: s.number, title: s.title, track: s.track })
    }
  }
  return [...byFile.values()].sort((a, b) => a.file.localeCompare(b.file))
})()
