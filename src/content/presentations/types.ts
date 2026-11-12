/** Authored teaching beats for the room; the complete lesson stays in Study. */
export type BeatKind = 'bullets' | 'flow' | 'compare' | 'evidence' | 'question' | 'activity' | 'recap'

export interface TeachingBeat {
  /** Unique within this lesson. Stable links and presenter navigation use it. */
  id: string
  sourceId: string
  kind: BeatKind
  /** A spoken teaching point, rather than the reading page's section heading. */
  title: string
  /** At most four short, authored bullets. Never pasted paragraphs. */
  points?: string[]
  /** Flow steps: at most five; label <= 5 words, note <= 10 words. */
  steps?: { label: string; note?: string }[]
  /** Two or three sides; at most three short points per side. */
  columns?: { label: string; points: string[] }[]
  /** A focused, synthetic excerpt: at most five lines, <= 48 chars each. */
  lines?: { text: string; note: string }[]
  /** One short conclusion or discussion question; <= 16 words. */
  takeaway?: string
}

export interface TeachingChapter {
  id: string
  title: string
  half: 'theory' | 'practical'
  /** Three or four short items shown on this section's outline slide. */
  outline: string[]
  beats: TeachingBeat[]
}

export interface PresentationPlan {
  slug: string
  /** Concise cover title, at most eight words. */
  title: string
  /** The central question or teaching promise, at most 16 words. */
  throughline: string
  chapters: TeachingChapter[]
}
