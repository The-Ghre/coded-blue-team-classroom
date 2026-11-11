/* =========================================================================
   LESSON KITS
   =========================================================================
   Every session owns a visual world: its palette, its motifs, its motion.
   A lesson kit is that world, packaged so the shared app can mount it
   without knowing anything about it.

   A kit lives entirely in src/lessons/<slug>/ and is loaded lazily, so each
   lesson's code, CSS and generative art ships in its own chunk and a student
   opening Session 3 never downloads Session 7's WebGL.

   Everything here is optional. A kit with no fields renders the lesson in
   the base CODED design, which is the fallback whenever a kit fails to load.
   ========================================================================= */

import type { ComponentType, ReactNode } from 'react'
import type { Block, Session } from '@/types/content'
import type { RenderMode } from '@/components/teaching/blocks'

export type Surface = 'present' | 'study' | 'overview'

/** What the app tells a kit's layers about the moment they are rendering in. */
export interface StageProps {
  surface: Surface
  session: Session
  /** Presentation only. Index into the flattened theory + practical slides. */
  slideIndex: number
  slideCount: number
  /** The block on the current slide (presentation), or undefined elsewhere. */
  block?: Block
  /** Which half of the session the current slide belongs to. */
  half: 'theory' | 'practical'
  /** +1 moving forward, -1 moving back, 0 on first render. */
  direction: -1 | 0 | 1
  /**
   * True when the presentation chrome has faded out — the room is watching
   * the slide. Backdrops may quietly raise their presence here.
   */
  focusMode: boolean
  /** The OS reduced-motion preference, already resolved. */
  reducedMotion: boolean
}

/** What a kit's Hero receives: the stage, plus the page content it must keep. */
export interface HeroProps extends StageProps {
  /** Eyebrow text the default header shows above the title. */
  eyebrow: string
  /** The page's lead paragraph, when it has one. Render it. */
  lead?: ReactNode
  /** The page's primary controls (Present, Study, Resume…). Render them. */
  actions?: ReactNode
}

/** Props for a kit's replacement of one block renderer. */
export interface BlockOverrideProps<B extends Block = Block> {
  block: B
  mode: RenderMode
  /**
   * The shared renderer for this block. Overrides should usually wrap or
   * compose it rather than re-implement it, so content changes made in
   * src/content flow through without the kit having to know.
   */
  Default: ComponentType<{ block: B; mode: RenderMode }>
}

export type BlockOverrides = {
  [K in Block['kind']]?: ComponentType<BlockOverrideProps<Extract<Block, { kind: K }>>>
}

export interface LessonKit {
  slug: string

  /**
   * The ambient layer. Rendered fixed behind all content on every surface of
   * this lesson, aria-hidden and pointer-events: none. Canvas, WebGL, SVG or
   * plain DOM — whatever the world calls for.
   */
  Backdrop?: ComponentType<StageProps>

  /**
   * An optional layer above the slide (presentation only), still
   * pointer-events: none: a cursor lens, a scan line, a vignette that breathes.
   */
  Overlay?: ComponentType<StageProps>

  /**
   * Replaces the header band on the study, workshop and overview pages.
   * MUST render the session title in an <h1>, and MUST render `lead` and
   * `actions` when given — they carry the page's real controls.
   */
  Hero?: ComponentType<HeroProps>

  /** Per-kind replacements for the shared block renderers. */
  blocks?: BlockOverrides
}
