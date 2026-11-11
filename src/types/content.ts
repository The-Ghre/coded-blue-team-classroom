/* =========================================================================
   CONTENT MODEL
   =========================================================================
   Course content is data, not components. A session is authored once as a
   tree of typed blocks; presentation mode, study mode, the practical
   workshop page and the search index are all projections of that same tree.
   Adding a session or editing a lesson therefore never requires touching
   the interface. See README.md ("Editing lessons") for the workflow.
   ========================================================================= */

/* ---------------------------------------------------------------------------
   Evidence taxonomy — the reasoning vocabulary used throughout the course.
   Students are taught to label every statement as one of these.
   --------------------------------------------------------------------------- */
export type EvidenceKind =
  | 'observation'
  | 'hypothesis'
  | 'confirmed'
  | 'uncertain'
  | 'response'
  | 'attack'

export const EVIDENCE_META: Record<
  EvidenceKind,
  { label: string; glyph: string; shape: string; definition: string }
> = {
  observation: {
    label: 'Observation',
    glyph: '[=]',
    shape: 'square',
    definition: 'Something a source literally recorded. No interpretation added yet.',
  },
  hypothesis: {
    label: 'Hypothesis',
    glyph: '<?>',
    shape: 'dashed square',
    definition: 'A proposed explanation for an observation. Not yet supported by evidence.',
  },
  confirmed: {
    label: 'Confirmed',
    glyph: '(/)',
    shape: 'circle',
    definition:
      'A finding corroborated by two or more independent sources, so it survives one source being wrong or tampered with.',
  },
  uncertain: {
    label: 'Uncertain',
    glyph: '[~]',
    shape: 'dashed circle',
    definition:
      'A known unknown, stated out loud. Writing it down is what stops it being quietly assumed.',
  },
  response: {
    label: 'Response',
    glyph: '>>',
    shape: 'chevron',
    definition: 'An action a human decided to take, and the finding that justified it.',
  },
  attack: {
    label: 'Adversary',
    glyph: '/!\\',
    shape: 'flagged square',
    definition: 'Adversary behaviour — what the attacker did, from the red perspective.',
  },
}

/* Telemetry pillars, used by timelines and diagrams. */
export type Pillar = 'endpoint' | 'network' | 'identity' | 'cloud'

export const PILLAR_META: Record<Pillar, { label: string; glyph: string }> = {
  endpoint: { label: 'Endpoint', glyph: '▣' },
  network: { label: 'Network', glyph: '⇄' },
  identity: { label: 'Identity', glyph: '◆' },
  cloud: { label: 'Cloud', glyph: '◇' },
}

/* ---------------------------------------------------------------------------
   Provenance — every block declares where its content came from.
   'source'       : derived from the supplied CODED lesson files
   'supplementary': added by the course build for teaching scaffolding,
                    verified against primary vendor/project documentation
   'synthetic'    : fabricated example data, always labelled as such in the UI
   --------------------------------------------------------------------------- */
export type Provenance = 'source' | 'supplementary' | 'synthetic'

export interface SourceRef {
  /** The supplied file this content derives from. */
  file: string
  /** Section heading inside that file, e.g. "4.3 Log Collection & Normalization Pipeline". */
  section: string
}

/* =========================================================================
   BLOCKS
   ========================================================================= */

interface BlockBase {
  /** Stable id. Used for slide deep links — do not renumber casually. */
  id: string
  /** Short title shown in the slide overview and study-mode contents. */
  title: string
  provenance?: Provenance
  sources?: SourceRef[]
  /**
   * Study-mode-only expansion. Keeps slides sparse without losing depth:
   * slides show `points`, study mode additionally shows `detail`.
   */
  detail?: string[]
  /** Minutes this block is budgeted in the session plan. */
  minutes?: number
}

/** Section opener — a full-bleed title card. */
export interface TitleBlock extends BlockBase {
  kind: 'title'
  overline: string
  lead?: string
}

/** The 10-minute opener: retrieval questions plus a scenario hook. */
export interface RetrievalBlock extends BlockBase {
  kind: 'retrieval'
  recallPrompt: string
  questions: string[]
  /** Model answers — rendered in study mode and in the instructor view only. */
  answers?: string[]
}

/** Opening scenario narrative. */
export interface ScenarioBlock extends BlockBase {
  kind: 'scenario'
  setting: string
  narrative: string[]
  /** The question the whole session exists to answer. */
  drivingQuestion: string
  synthetic?: boolean
}

/** Measurable learning objectives. */
export interface ObjectivesBlock extends BlockBase {
  kind: 'objectives'
  objectives: { verb: string; text: string }[]
  prerequisites?: string[]
}

/** Core concept explanation. */
export interface ConceptBlock extends BlockBase {
  kind: 'concept'
  lead?: string
  points: string[]
  /** Optional named diagram, rendered by DiagramFrame. */
  diagram?: DiagramSpec
  /** Red/blue framing, preserved from the source material's structure. */
  redView?: string
  blueView?: string
  callout?: { tone: 'note' | 'warn' | 'rule'; text: string }
}

/** Two-to-four column comparison. */
export interface CompareBlock extends BlockBase {
  kind: 'compare'
  lead?: string
  columns: { label: string; glyph?: string; accent?: EvidenceKind | Pillar }[]
  rows: { label: string; cells: string[] }[]
  callout?: { tone: 'note' | 'warn' | 'rule'; text: string }
}

/** An annotated evidence / log excerpt. */
export interface EvidenceBlock extends BlockBase {
  kind: 'evidence'
  lead?: string
  caption: string
  /** Always true for this course — we never ship real customer telemetry. */
  synthetic: true
  source: string
  lines: EvidenceLine[]
  /** What this excerpt proves, and what it specifically does not prove. */
  proves: string[]
  doesNotProve: string[]
}

export interface EvidenceLine {
  text: string
  /** When present, the line is clickable and reveals this annotation. */
  note?: {
    kind: EvidenceKind
    label: string
    body: string
  }
}

/** An investigation timeline across telemetry pillars. */
export interface TimelineBlock extends BlockBase {
  kind: 'timeline'
  lead?: string
  synthetic?: boolean
  events: TimelineEvent[]
  /** Detection opportunities that were available but unused. */
  missedDetections?: { at: string; text: string }[]
}

export interface TimelineEvent {
  time: string
  pillar: Pillar
  kind: EvidenceKind
  title: string
  body: string
  /** MITRE ATT&CK technique id, e.g. "T1059.001". */
  attack?: string
  /** Where the evidence came from, e.g. "Sysmon Event ID 1". */
  evidence?: string
}

/** A query walkthrough: syntax, expected result, limits. */
export interface QueryBlock extends BlockBase {
  kind: 'query'
  lead?: string
  language: 'splunk' | 'kql' | 'sigma' | 'bash' | 'wireshark' | 'text'
  /** The tool and schema this query assumes. Never left implicit. */
  assumes: string
  code: string
  /** Line-by-line or clause-by-clause explanation. */
  walkthrough: { part: string; explains: string }[]
  expected: string
  limitations: string[]
}

/** Attack chain: adversary action mapped to defensive opportunity. */
export interface ChainBlock extends BlockBase {
  kind: 'chain'
  lead?: string
  /** Column headers after the phase column. */
  lanes: string[]
  phases: { phase: string; attack: string; cells: string[]; attackId?: string }[]
}

/** Knowledge check with evidence-based feedback on every option. */
export interface CheckBlock extends BlockBase {
  kind: 'check'
  questions: CheckQuestion[]
}

export interface CheckQuestion {
  id: string
  stem: string
  options: {
    text: string
    correct: boolean
    /** Why this option is right or wrong — always explained, never just marked. */
    feedback: string
  }[]
}

/** Embeds one of the signature interactions. */
export interface InteractionBlock extends BlockBase {
  kind: 'interaction'
  component:
    | 'triage-console'
    | 'log-investigation'
    | 'timeline-reconstruct'
    | 'beacon-analyzer'
    | 'rule-builder'
    | 'coverage-map'
  lead?: string
  /** What the student should take away. Rendered above the interaction. */
  teaches: string
  /** Interaction-specific data, validated by the component. */
  data: unknown
}

/** Practical briefing. */
export interface BriefBlock extends BlockBase {
  kind: 'brief'
  scenario: string
  objectives: string[]
  /**
   * Tools, files and access the student needs before starting. When `file` is
   * set it names a real file under public/resources/<session-slug>/ and the
   * interface renders a working download link — never a link to nothing.
   */
  requires: { item: string; note: string; file?: string }[]
  setup: string[]
  /** Explicit statement of what is simulated vs. what is a real tool. */
  realism: string
  synthetic?: boolean
  /** Session slug, used to resolve `file` paths. */
  resourceDir?: string
}

/** Scoped student tasks with suggested timings. */
export interface TasksBlock extends BlockBase {
  kind: 'tasks'
  lead?: string
  tasks: {
    ref: string
    minutes: number
    title: string
    steps: string[]
    /** The artefact this task must produce. */
    produces: string
  }[]
}

/** Progressive hints — revealed one at a time. */
export interface HintsBlock extends BlockBase {
  kind: 'hints'
  lead?: string
  hints: { forTask: string; tiers: string[] }[]
}

/** Deliverables the student submits. */
export interface DeliverablesBlock extends BlockBase {
  kind: 'deliverables'
  lead?: string
  items: { ref: string; text: string; required: boolean }[]
  /** Folder layout for the submission, mirroring the source's case structure. */
  structure?: string
}

/** Assessment criteria. */
export interface AssessmentBlock extends BlockBase {
  kind: 'assessment'
  lead?: string
  criteria: { band: string; weight: string; descriptor: string }[]
}

/** Debrief questions for the closing 10 minutes. */
export interface DebriefBlock extends BlockBase {
  kind: 'debrief'
  lead?: string
  questions: string[]
  /** The one sentence the instructor should land. */
  landingPoint: string
}

/** Session recap and further study. */
export interface RecapBlock extends BlockBase {
  kind: 'recap'
  takeaways: string[]
  furtherStudy: { label: string; note: string; href?: string }[]
}

export type Block =
  | TitleBlock
  | RetrievalBlock
  | ScenarioBlock
  | ObjectivesBlock
  | ConceptBlock
  | CompareBlock
  | EvidenceBlock
  | TimelineBlock
  | QueryBlock
  | ChainBlock
  | CheckBlock
  | InteractionBlock
  | BriefBlock
  | TasksBlock
  | HintsBlock
  | DeliverablesBlock
  | AssessmentBlock
  | DebriefBlock
  | RecapBlock

/* =========================================================================
   DIAGRAMS
   ========================================================================= */

export type DiagramSpec =
  | { type: 'pipeline'; stages: { label: string; note: string }[]; alt: string }
  | {
      type: 'tiers'
      tiers: { label: string; question: string; handsOff: string }[]
      alt: string
    }
  | {
      type: 'pillars'
      pillars: { pillar: Pillar; covers: string; blindSpot: string }[]
      alt: string
    }
  | { type: 'cycle'; steps: string[]; alt: string }
  | {
      type: 'ladder'
      rungs: { label: string; note: string; tone?: EvidenceKind }[]
      alt: string
    }
  | {
      type: 'flow'
      nodes: { id: string; label: string; note?: string; tone?: EvidenceKind }[]
      edges: { from: string; to: string; label?: string }[]
      alt: string
    }

/* =========================================================================
   SESSION
   ========================================================================= */

export interface Session {
  /** 1-based session number used in URLs. */
  number: number
  /** URL slug, e.g. "soc-operations". */
  slug: string
  title: string
  /** One line shown on the roadmap card. */
  summary: string
  /** Longer framing for the session overview page. */
  abstract: string
  /** 'core' sessions are required; 'extension' sessions are the optional days. */
  track: 'core' | 'extension'
  /** Short verbs for the roadmap, e.g. ["Triage", "Escalate"]. */
  themes: string[]
  prerequisites: string[]
  outcomes: string[]
  /** The supplied file(s) this session is built from. */
  sourceFiles: string[]
  /** Any gap, duplication or ambiguity found in the source. Shown in the UI. */
  sourceNotes?: string[]
  theory: {
    minutes: 90
    blocks: Block[]
  }
  practical: {
    minutes: 90
    title: string
    blocks: Block[]
  }
  /** Flat glossary of terms first introduced here. */
  terms?: { term: string; definition: string }[]
}

export interface Course {
  title: string
  tagline: string
  description: string
  sessions: Session[]
  /** Material referenced by the sources but not supplied. */
  knownGaps: { title: string; detail: string }[]
}
