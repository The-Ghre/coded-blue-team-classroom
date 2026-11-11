# Lesson kits

Each of the ten sessions owns a visual world — its own palette, motifs,
composition and motion — packaged as a **lesson kit** in
`src/lessons/<slug>/`. This file is the contract every kit builds against.

## What a kit can do

`src/lessons/types.ts` is authoritative. In short, a kit's default export is a
`LessonKit` with any of:

| Field | What it is | Where it renders |
|---|---|---|
| `Backdrop` | The ambient world: canvas, WebGL, SVG or DOM | Behind every surface of the lesson. Presentation: absolute behind the stage. Study / workshop / overview: fixed behind the page. |
| `Overlay` | A layer above the slide (lens, scanline, vignette) | Presentation only |
| `Hero` | Replaces the page header | Study, workshop and overview. Must render an `<h1>` with the session title, plus `lead` and `actions` when given. |
| `blocks` | Per-kind replacements for the block renderers | Slides (`mode="slide"`) and study (`mode="study"`) |

Layers receive `StageProps`: the surface, session, slide index and count, the
current block, which half (theory / practical), travel direction, whether the
presentation chrome is hidden (`focusMode`), and `reducedMotion`.

Block overrides receive `{ block, mode, Default }`. **Prefer wrapping `Default`**
over re-implementing it — content edits in `src/content` then flow through.
Re-implement only when the lesson's world needs a structurally different
component, and then keep every piece of content and every behaviour the shared
renderer has (feedback text, gating, scoring, provenance, synthetic labels).

`theme.css` holds the world's palette and component styling.

## Rules

**Stay in your folder.** A kit edits nothing outside `src/lessons/<slug>/`.
Ten kits are built in parallel; touching shared files breaks the merge.

**Scope every rule.** All CSS goes inside `@media screen { :root[data-lesson='<slug>'] … }`.
The app sets `data-lesson` on `<html>` for the lesson's routes, so tokens
redefined there recolour the whole app — header, rail and all — and nothing
leaks into other lessons or onto paper.

**Palette.** Redefine the semantic tokens from `src/styles/tokens.css`
(`--bg`, `--bg-raised`, `--surface*`, `--text*`, `--line*`, `--card*`,
`--accent*`, `--focus`, `--ev-*`, `--ev-*-bg`, `--pillar-*`). Every lesson
has its own palette. Contrast must hold: body text ≥ 7:1 and every other text
≥ 4.5:1 against the surface it sits on. The six evidence kinds must stay
distinguishable from each other, and still carry their glyph, shape and word.

**Type.** The IBM Plex family is the brand face and stays: Plex Sans, Plex
Sans Condensed, Plex Serif and Plex Mono are all loaded, with the weights in
`index.html`. Vary width, weight, size, case and setting freely within it.

**Dependencies.** Available: `motion` (motion/react), `gsap` (every plugin,
including SplitText, DrawSVG, MorphSVG, Flip, ScrollTrigger), `ogl` (WebGL).
Do not add packages — `package.json` is shared.

**Shared helpers** in `src/motion`: `CanvasStage` (DPR-correct 2D canvas that
pauses offscreen and in hidden tabs and draws one still frame under reduced
motion), `useFrameLoop`, `useIsVisible`, `usePointerDrift`, `SplitWords`
(per-word spans that still read as one sentence), `useReducedMotion`,
`usePresentState`.

**Slide transitions.** Navigation runs through View Transitions. Choreograph
them in `theme.css`:

```css
:root[data-lesson='<slug>'][data-slide-dir='forward']::view-transition-new(slide) { … }
:root[data-lesson='<slug>'][data-slide-dir='back']::view-transition-old(slide) { … }
```

Keep them under ~700ms. The DOM has already changed when they run, so they
never delay the next key press. The presentation root also carries
`data-half` (theory / practical) and `data-kind` (the slide's block kind) for
styling.

**Motion never costs content.** Content is visible by default and in its final
position if JavaScript or animation fails. Entrances may not hide text from a
reader who arrives mid-animation for longer than ~600ms. No flashing above
three times a second.

**Reduced motion.** Under `prefers-reduced-motion: reduce`, backdrops show a
composed still frame, transitions become instant, and nothing moves on its
own. The lesson must still look designed, not broken.

**Performance.** Backdrops pause when hidden, cap device pixel ratio
(~1.5), and stay cheap enough to run beside a projected slide — aim for a few
milliseconds a frame. Kits are lazy-loaded per lesson; keep each one lean.

**Accessibility.** Keyboard access and visible focus everywhere, 44px touch
targets, no colour-only meaning, layers stay decorative (they are already
`aria-hidden` and pointer-inert). Presentation shortcuts and chrome behaviour
belong to the shared player; do not change them.

**Truth.** Kits change how a lesson looks and moves, never what it says.
Synthetic data stays labelled. Interactions keep their teaching behaviour.
