# DESIGN — CODED Blue Team Classroom

The design system: observed CODED brand values, and the original system built on
top of them.

---

## 1. Brand extraction

Colour and typography were read from the rendered CODED reference at
**https://coded-reels-playbook.vercel.app/** — its declared `:root` custom
properties and the computed styles of its live type specimens.

Nothing in this section was guessed, inferred, or sampled from another site.

### How it was extracted

The reference was loaded in a browser and inspected directly:

1. Every `--*` custom property declared in its stylesheets was read off
   `:root`, giving the palette verbatim.
2. Computed styles were taken from live elements — `h1`, lead paragraph, buttons,
   and the uppercase label treatments — giving real font sizes, weights, line
   heights and letter-spacing rather than approximations.
3. The Google Fonts request in its `<head>` confirmed the families and the exact
   weights loaded.

### Colour — observed verbatim

| Token | Value | Source | Role here |
|---|---|---|---|
| `--navy-deep` | `#00112F` | declared | Raised ground, code surfaces |
| *(body background)* | `#00081C` | computed on `body` | Page ground (`--coded-ink`) |
| `--navy` | `#14243F` | declared | Primary surface |
| `--navy-2` | `#16294A` | declared | Surface, one step up |
| `--navy-3` | `#1B3055` | declared | Surface, two steps up |
| `--panel` | `#12294F` | declared | Panel |
| `--blue` | `#004AA3` | declared | Primary action |
| `--blue-bright` | `#2F74D6` | declared | Accent, response actions |
| `--blue-soft` | `#6F9CE8` | declared | Links, observations |
| `--white` | `#FFFFFF` | declared | Primary text |
| `--muted` | `#9FB2D4` | declared | Secondary text |
| `--muted-2` | `#6F83A8` | declared | Tertiary text, labels |
| `--line` | `rgba(255,255,255,.12)` | declared | Hairlines |
| `--card` | `rgba(255,255,255,.045)` | declared | Card wash |
| `--card-brd` | `rgba(255,255,255,.10)` | declared | Card border |
| `--gold` | `#C89A45` | declared | Hypotheses, identity telemetry |
| `--green` | `#37A06A` | declared | Cloud telemetry |
| `--ok` | `#5AD0A0` | declared | Confirmed findings |
| `--red` | `#F84B4B` | declared | Adversary actions |
| `--red-deep` | `#C23030` | declared | Reserved |
| `--no` | `#FF6B6B` | declared | Reserved |
| `--indigo` | `#3E50DD` | declared | Network telemetry |
| `--mauve` | `#A85A66` | declared | Stated uncertainty |
| `--ease` | `cubic-bezier(.22,.61,.36,1)` | declared | The motion curve |

**On blue.** The brief says not to introduce blue unless it exists in the reference
palette. It does — blue *is* the CODED palette, across grounds, surfaces and
accents. It is used here because it is the brand, not because this is a blue team
course. The defensive identity is carried by content, diagrams, evidence encoding
and investigation workflows, exactly as the brief asks.

### Typography — observed verbatim

Families, from the reference's own font request:

- **IBM Plex Sans** — 400, 500, 600, 700
- **IBM Plex Mono** — 500, 600
- *(IBM Plex Sans Arabic is also loaded by the reference; not needed here)*

Measured specimens:

| Element | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| `h1` | 61.44px | 700 | −1.536px (−0.025em) | 1.04 |
| `h3` | 19px | 700 | −0.228px (−0.012em) | 1.25 |
| Lead paragraph | 17.41px | 400 | normal | 1.55 |
| Button | 14px | 700 | 0.28px (0.02em) | normal |
| **Eyebrow** | 13px | 700 | 4.16px (**0.32em**) uppercase | 1.4 |
| **Mono label** | 10–11px | 600 | 2.4–2.86px (**0.24em**) uppercase | 1.4 |

The eyebrow and the mono label are the reference's two most distinctive
typographic signatures — very wide tracking on small uppercase text, one in Sans
for section labels and one in Mono for counters and metadata. Both are reused here
for exactly those jobs.

---

## 2. What is original

Everything below is designed for this course. The brief asks for colour and
typography from the reference and an original everything-else, and that line is held.

- The evidence taxonomy and its visual encoding
- The layout system, navigation and session rail
- The slide language and the presentation chrome behaviour
- All six interactions
- All diagram types
- Spacing, radii, elevation, motion scale
- The print system

---

## 3. The evidence taxonomy

The spine of the whole design. Six kinds of claim, each with **four** independent
carriers so the system never depends on colour alone.

| Kind | Colour | Shape | Glyph | Word |
|---|---|---|---|---|
| Observation | `--blue-soft` | square | `[=]` | Observation |
| Hypothesis | `--gold` | dashed square | `<?>` | Hypothesis |
| Confirmed | `--ok` | circle | `(/)` | Confirmed |
| Uncertain | `--mauve` | dashed circle | `[~]` | Uncertain |
| Response | `--blue-bright` | chevron | `>>` | Response |
| Adversary | `--red` | flagged square | `/!\` | Adversary |

Implemented as border-radius and border-style variations on `.ev`, so the silhouette
differs before any colour is applied. Timeline markers repeat the same shapes as CSS
clip-paths. The glyphs are ASCII — they survive a monochrome print and a screen
reader reads the accompanying word.

### Telemetry pillars

A secondary axis, also glyph-paired: Endpoint `▣`, Network `⇄`, Identity `◆`,
Cloud `◇`. The source material names three pillars (endpoint, network, cloud);
identity is split out as a fourth lane here because the authentication events the
course spends most of its time on are neither host-execution nor network evidence,
and giving them their own lane makes attack reconstruction legible. This is a
presentation decision and it is flagged in Session 1's content.

---

## 4. Type scale

Fluid, clamped. The floor keeps phone text readable; the ceiling keeps projector
headlines large. Body text never goes below 16px anywhere — extended explanation
lives in study mode rather than in smaller type, as the brief requires.

```
--fs-display  clamp(2.6rem, 1.4rem + 5.2vw, 5.25rem)
--fs-h1       clamp(2rem,   1.2rem + 3.4vw, 3.84rem)    ← 3.84rem = 61.44px, the observed h1
--fs-h2       clamp(1.5rem, 1.1rem + 1.9vw, 2.4rem)
--fs-h3       clamp(1.18rem, 1rem + 0.9vw,  1.6rem)
--fs-lead     clamp(1.0625rem, 1rem + 0.45vw, 1.235rem) ← 1.235rem ≈ the observed 17.41px lead
--fs-body     1rem
--fs-small    0.875rem
--fs-micro    0.75rem
--fs-mono-label 0.6875rem
```

In presentation mode these scale up again against the viewport, so a slide is
legible from the back of a room while the same content reads correctly on a phone.

---

## 5. Layout

- **Roadmap** — a single column of wide editorial rows with a numbered rail, so the
  curriculum reads as a path. Deliberately not a card grid; the brief rules out
  repetitive card grids and a grid would also misrepresent a strict sequence as a
  menu of equivalent options.
- **Study** — a sticky contents rail beside a measured reading column (`68ch`). The
  rail is the session's spine: always visible, always showing position. On a phone
  it collapses to a disclosure so the lesson starts on the first screen.
- **Presentation** — a three-row grid with the stage centred. Chrome fades after
  3.2 seconds of stillness and returns on any input. It is never removed from the
  accessibility tree — it goes transparent, and any focus within it brings it back,
  so a keyboard user is never navigating invisible controls.
- **Session rail** — a horizontally scrollable strip under the header so moving
  between sessions never requires a trip back to the roadmap.

---

## 6. Motion

The observed `cubic-bezier(.22,.61,.36,1)` for everything. Three durations:
120ms for state, 220ms for transitions, 420ms for slide entry.

Motion never delays navigation. The slide transition is an entry animation on the
incoming slide, so the next slide is already present and interactive while it
settles.

`prefers-reduced-motion` collapses all three durations to 1ms rather than disabling
transitions, so state changes still read as deliberate but nothing animates.

---

## 7. Print

Study mode prints as a lesson handout, not a screenshot of a screen.

Tokens invert to ink-on-paper under `@media print`. The interface is removed.
Everything that hides content is forced open: `<details>` blocks expand, evidence
annotations print in full rather than requiring a click, retrieval answers appear,
and diagram text alternatives become visible. Study-mode depth is included, because
depth is the point of a printed handout.

Overflow containers become static so no table is clipped. Grids collapse to one
column. External link destinations print after the link text, since a bare link
label is useless on paper. Interactive exercises print as their teaching point and
debrief with a note explaining where to work through them.

---

## 8. Component inventory

Content blocks, each a reusable typed component driven by data:

`title` · `retrieval` · `scenario` · `objectives` · `concept` · `compare` ·
`evidence` · `timeline` · `query` · `chain` · `check` · `interaction` · `brief` ·
`tasks` · `hints` · `deliverables` · `assessment` · `debrief` · `recap`

Diagrams: `pipeline` · `tiers` · `pillars` · `cycle` · `ladder` · `flow`

All diagrams are laid out with CSS grid and flow rather than fixed SVG coordinates,
so they reflow on a phone instead of scrolling sideways and read as structured text
in a screen reader.

---

## 9. Accessibility decisions worth noting

- **Shape before colour.** Every state has a non-colour carrier. The coverage map
  uses a diagonal hatch for gaps and a solid wash for covered, so it survives
  monochrome printing.
- **No drag-and-drop.** Timeline reconstruction orders with buttons. Drag targets
  are unreachable by keyboard and hostile on touch, and the learning is in the
  sequencing, not the pointer work.
- **Shortcuts stand down.** `isTypingTarget()` suspends presentation shortcuts in
  any input, textarea, select, contenteditable, or element marked `data-keys-own`,
  and all shortcuts ignore modifier combinations so browser and assistive-technology
  shortcuts are never shadowed.
- **Diagram descriptions are visible, not hidden.** The same text serves as the
  `aria-label` and as an expandable description, so a student who cannot parse the
  picture gets the same information rather than a worse version of it.
- **Touch targets** reach 44px on touch viewports. The section permalink, which
  reveals on hover, is removed on touch rather than left as an invisible target —
  its destination is already in the contents list.

---

## 10. Verified

Measured in-browser on the built application:

| Check | Result |
|---|---|
| Body text contrast | 19.97:1 |
| Secondary text contrast | 9.31:1 |
| Eyebrow contrast | 7.22:1 |
| Mono label contrast | 5.22:1 |
| Horizontal overflow at 375px | none |
| Touch targets under 44px at 375px | 5, all inline prose links (WCAG 2.5.5 exempt) |
| Session timing | 10/10 sessions at exactly 90 + 90 |
