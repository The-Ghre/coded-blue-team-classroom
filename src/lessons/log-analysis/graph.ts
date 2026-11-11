/* =========================================================================
   THE WORKING GRAPH — model
   =========================================================================
   Session 2 is drawn as a dispatcher's graphic timetable. Log sources are
   stations stacked down the left margin, time runs left to right, and
   every event is a stop. Ordinary activity is scheduled traffic: a regular
   lattice of runs known in advance — the baseline. The attack is the
   unscheduled train: it waits at one station for minutes, then plunges
   through the rest faster than anything on the sheet.

   Everything here is derived from the lesson's own content (the annotated
   evidence block), so an edit in src/content redraws the route truthfully.
   ========================================================================= */

import type { Block, EvidenceBlock, EvidenceKind, Session } from '@/types/content'

/** "02:14:33" → seconds since midnight. */
export function parseClock(text: string): number | null {
  const m = /(\d{2}):(\d{2}):(\d{2})/.exec(text)
  if (!m) return null
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
}

export function formatClock(seconds: number, withSeconds = true): string {
  const s = Math.max(0, Math.round(seconds))
  const hh = String(Math.floor(s / 3600) % 24).padStart(2, '0')
  const mm = String(Math.floor(s / 60) % 60).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return withSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`
}

/**
 * The station a log line was recorded at, from the token after its time.
 * "4624" → Security 4624, "Sysmon:1" → Sysmon 1, "[decoded]" → the
 * analyst's own decode, which is drawn hollow because no source logged it.
 */
export function stationOf(text: string): { name: string; derived: boolean } {
  const rest = text.replace(/^\s*\d{2}:\d{2}:\d{2}\s+/, '')
  const token = rest.split(/\s+/)[0] ?? ''
  const sysmon = /^Sysmon:(\d+)/i.exec(token)
  if (sysmon) return { name: `Sysmon ${sysmon[1]}`, derived: false }
  if (/^\d{4}$/.test(token)) {
    return { name: token === '7045' ? `System ${token}` : `Security ${token}`, derived: false }
  }
  const bracket = /^\[(.+)\]$/.exec(token)
  if (bracket) return { name: bracket[1].charAt(0).toUpperCase() + bracket[1].slice(1), derived: true }
  return { name: token, derived: false }
}

export interface Stop {
  t: number
  station: number
  derived: boolean
  kind?: EvidenceKind
  /** Index of the evidence line this stop came from. */
  line: number
}

export interface Route {
  stations: { name: string; derived: boolean }[]
  stops: Stop[]
  start: number
  end: number
}

export function findEvidence(session: Session): EvidenceBlock | undefined {
  return session.theory.blocks.find((b): b is EvidenceBlock => b.kind === 'evidence')
}

/** Builds the route for one evidence block: stations in order of first call. */
export function routeFromEvidence(block: Pick<EvidenceBlock, 'lines'>): Route | null {
  const stations: Route['stations'] = []
  const stops: Stop[] = []
  block.lines.forEach((line, i) => {
    const t = parseClock(line.text)
    if (t === null) return
    const st = stationOf(line.text)
    let idx = stations.findIndex((s) => s.name === st.name)
    if (idx < 0) {
      stations.push(st)
      idx = stations.length - 1
    }
    stops.push({ t, station: idx, derived: st.derived, kind: line.note?.kind, line: i })
  })
  if (stops.length < 2) return null
  return { stations, stops, start: stops[0].t, end: stops[stops.length - 1].t }
}

export function sessionRoute(session: Session): Route | null {
  const ev = findEvidence(session)
  return ev ? routeFromEvidence(ev) : null
}

/* ---------------------------------------------------------------------------
   Scheduled traffic — the baseline, drawn in advance
   --------------------------------------------------------------------------- */

/** Small deterministic PRNG so the timetable is identical on every visit. */
function mulberry(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A scheduled run: points of [time, station index]. */
export type Run = [number, number][]

/**
 * Regular services in both directions. Every run keeps the same running time
 * between stations and the same dwell, which is what makes the lattice read
 * as "normal" — and what makes one run that breaks it visible at a glance.
 */
export function scheduledTraffic(stationCount: number, start: number, end: number, seed = 2): Run[] {
  const rand = mulberry(seed)
  const runs: Run[] = []
  const hop = 26 // seconds between adjacent stations
  const dwell = 7
  const span = (stationCount - 1) * (hop + dwell)
  for (let dir = 0; dir < 2; dir++) {
    const headway = dir === 0 ? 34 : 47
    let t0 = start - span - (dir === 0 ? 0 : 19)
    while (t0 < end + 10) {
      const run: Run = []
      let t = t0 + Math.round((rand() - 0.5) * 4)
      for (let k = 0; k < stationCount; k++) {
        const st = dir === 0 ? k : stationCount - 1 - k
        run.push([t, st])
        t += dwell
        run.push([t, st])
        t += hop
      }
      runs.push(run)
      t0 += headway
    }
  }
  return runs
}

/** Relative spacing between stations, as on a real graph (distance, not count). */
export function stationOffsets(count: number): number[] {
  const weights = [1, 1.35, 0.72, 1.12, 0.86, 1.28, 0.95, 1.18]
  const out: number[] = [0]
  for (let i = 1; i < count; i++) out.push(out[i - 1] + weights[(i - 1) % weights.length])
  const total = out[count - 1] || 1
  return out.map((v) => v / total)
}

/* ---------------------------------------------------------------------------
   The clock a slide stands at
   --------------------------------------------------------------------------- */

/**
 * Maps a slide to a moment on the graph. Before the instructor demo the
 * clock creeps through the long wait at the first station — the alert with
 * no story. On the demo slide it passes the whole plunge, and after it the
 * route stays fully drawn.
 */
export function clockForSlide(
  route: Route,
  blocks: Block[],
  slideIndex: number,
): number {
  const demoIdx = blocks.findIndex((b) => b.kind === 'evidence')
  const waitEnd = route.stops[1]?.t ?? route.end
  const from = route.start + 4
  if (demoIdx < 0) return route.end
  if (slideIndex >= demoIdx) {
    const after = blocks.length - 1 - demoIdx
    const k = after > 0 ? (slideIndex - demoIdx) / after : 1
    return route.end + 12 + k * 30
  }
  const k = demoIdx > 0 ? slideIndex / demoIdx : 0
  return from + (waitEnd - 8 - from) * k
}

export function graphWindow(route: Route): [number, number] {
  return [route.start - 70, route.end + 60]
}

/**
 * The graphs are screen decoration over facts the text already states.
 * They start hidden and theme.css (screen only) shows them, so a printed
 * handout never carries an unstyled drawing.
 */
export const HIDDEN_ON_PAPER = { display: 'none' } as const
