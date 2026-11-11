---
name: Detection Engineering — Rule Test Bench
description: A graphite and acid-yellow teaching surface for event selection, tuning, source tracing and coverage.
colors:
  background: "#202224"
  raised: "#282b2e"
  surface: "#303437"
  surface-2: "#363b3f"
  text: "#f5f3e9"
  text-muted: "#e0ded4"
  text-dim: "#c7c8bf"
  line: "#555b5e"
  line-strong: "#8d9496"
  primary: "#e5f454"
  primary-deep: "#d3e044"
  attack-focus: "#ffad98"
  selection: "#3c4228"
  observation: "#a4d6f5"
  hypothesis: "#f3d77f"
  confirmed: "#a9dfb6"
  uncertain: "#e1bce6"
  response: "#bacdff"
typography:
  display:
    fontFamily: "IBM Plex Sans Condensed, IBM Plex Sans, sans-serif"
    fontSize: "clamp(3rem, 5.4vw, 5.5rem)"
    lineHeight: 1
  body:
    fontFamily: "IBM Plex Sans, Helvetica Neue, Arial, sans-serif"
  code:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.85rem"
rounded:
  sm: "2px"
  md: "3px"
spacing:
  compact: "0.5rem"
  regular: "1rem"
  section: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#202224"
  source-line-selected:
    backgroundColor: "{colors.selection}"
---

# Design System: Detection Engineering

## Overview

**Creative North Star: “Rule Test Bench”** (the established surface brief).

The lesson shows the actual materials of detection engineering: event populations, logical boundaries, scored conditions, Sigma source and ATT&CK coverage. Flat, precise surfaces and condensed headings give projection a clear hierarchy; ordinary prose stays readable in study mode. This document describes the lesson kit only; shared foundations remain authoritative outside its scope.

## Colors

Off-white text sits on charcoal graphite. Acid-yellow marks condition boundaries and focus; coral marks attacks and recall; labels and shapes disambiguate these uses. The population uses squares for ordinary events and triangles for attacks. Coverage retains patterns and pressed-state outlines. Evidence retains the shared six-kind vocabulary, with lesson-specific semantic foreground and background colors in `theme.css`; never communicate state through color alone.

## Typography

Condensed IBM Plex Sans serves headings. IBM Plex Sans carries prose and controls; IBM Plex Mono serves source, event labels and inherited technical metadata. The hero display scale is recorded above; slide titles use a separate responsive scale (`clamp(3rem, 7vw, 6rem)`). Desktop projected block headings are compact (2.1rem), reducing to 1.75rem at the lesson's narrow breakpoint.

## Layout

All lesson CSS is inside `@media screen` and rooted at `:root[data-lesson='detection-engineering']`. Preserve this boundary for every override. The kit registers hero, backdrop, title, query and keyboard-ownership wrappers; remaining content comes from shared renderers.

The desktop hero and title place a dense four-row event population across the full horizontal bench below the copy; source and walkthrough use two columns. At 700px and below they stack. Mobile presentation retains the shared stage's vertical scrolling; never force a phone into a clipped projector frame. Study and practical remain vertically readable documents.

Projection uses the shared fixed presentation shell. At 1000px and above, compact grids fit teaching material within that shell, with a maximum slide width of 86rem. Long material gets bounded local scrolling: Rule Builder and Coverage Map (450px), source (235px), walkthrough (290px), query results and check feedback (150px). In ordinary study, source is bounded at 34rem and walkthrough at 38rem; the narrow walkthrough expands naturally. Keep code horizontally scrollable rather than clipping its preformatted lines.

## Elevation & Depth

Flat tonal layers, hairlines and selected fills establish hierarchy. A selected source line has an inset acid-yellow marker; do not turn the lesson into a stack of floating cards. The backdrop is a sparse horizontal event lane, managed through the shared CanvasStage visibility, DPR and reduced-motion contract.

## Shapes

Corners are nearly square: small controls inherit the small radius; larger containers share the medium radius. Rule conditions and coverage cells are square. Thin borders and a dashed rule boundary carry structure without decorative framing.

## Components

- **Rule boundary:** a labelled native range input moves the synthetic illustration directly. It is explicitly a schematic, separate from the scored Rule Builder corpus. Its target is at least 44px high.
- **Rule Builder and coverage:** shared logic owns scoring, toggles, verdicts and teaching copy. This kit changes their visual presentation only. Precision is acid-yellow; recall is coral. Covered and uncovered cells retain non-color cues.
- **Sigma trace:** pressed walkthrough buttons highlight matching source lines and scroll the labelled, keyboard-focusable source region. Source remains selectable and has a Copy control. Reduced motion uses immediate scrolling.
- **Keyboard ownership:** query content and shared interaction, check, hint, retrieval and deliverable wrappers use `data-keys-own`. The shared player suspends shortcuts inside those regions and native inputs, so arrows, Space and activation belong to the exercise instead of advancing the deck. Preserve the visible focus outline (3px, offset 4px).
- **Print:** preserve the shared print route and renderer. The screen-only palette and presentation compaction must not leak into print; shared print semantics and readable content take precedence over the kit's projection treatment.
- **Motion:** event membership fades and source highlighting are brief state transitions. The lesson's reduced-motion rule removes animations, transitions and smooth scrolling.

## Do's and Don'ts

- **Do** retain synthetic-data labels, evidence glyphs, accessible descriptions and shared teaching copy.
- **Do** keep interactive controls keyboard reachable and preserve local scrolling where long content needs it.
- **Do** scope future visual changes to this lesson and screen media.
- **Don't** add nautical motifs, decorative console chrome, decorative gradients or cards as the page composition.
- **Don't** duplicate shared scoring, interaction state or print rendering in the kit.

The shared `.impeccable/design.json` sidecar is intentionally not generated: it lies outside the authorized lesson-only write boundary. Its usual extensions (motion, responsive behavior, focus and component details) are documented here instead.
