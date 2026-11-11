---
name: Threat Hunting — The Long Tail
description: Plotting paper, ranked observations, testable questions.
colors:
  bg: "#faf9fc"
  bg-raised: "#ffffff"
  surface: "#f0edf3"
  surface-2: "#e9e3ed"
  surface-3: "#ded5e4"
  surface-panel: "#f0edf3"
  text: "#201d27"
  text-muted: "#494150"
  text-dim: "#605367"
  line: "#d5ccd9"
  line-strong: "#a593ae"
  card: "#ffffff"
  card-brd: "#d5ccd9"
  accent: "#99104e"
  accent-deep: "#770a3b"
  accent-soft: "#99104e"
  focus: "#99104e"
  ev-observation: "#204f85"
  ev-hypothesis: "#813e08"
  ev-confirmed: "#166044"
  ev-uncertain: "#693b82"
  ev-response: "#354d9c"
  ev-attack: "#a52836"
  ev-observation-bg: "#e9f0f9"
  ev-hypothesis-bg: "#fff0dd"
  ev-confirmed-bg: "#e5f3ec"
  ev-uncertain-bg: "#f1e8f7"
  ev-response-bg: "#e9edf9"
  ev-attack-bg: "#fae8eb"
  pillar-endpoint: "#204f85"
  pillar-network: "#693b82"
  pillar-identity: "#813e08"
  pillar-cloud: "#166044"
  coded-ok: "#166044"
  coded-no: "#a52836"
  coded-gold: "#813e08"
  coded-red: "#a52836"
  coded-blue-soft: "#204f85"
  coded-blue-bright: "#99104e"
typography:
  display:
    fontFamily: "IBM Plex Sans Condensed, sans-serif"
    fontSize: "clamp(3rem,6.3vw,6rem)"
    lineHeight: 1
    letterSpacing: "-.035em"
  headline:
    fontFamily: "IBM Plex Sans Condensed, sans-serif"
    fontSize: "clamp(1.8rem,3vw,2.65rem)"
    lineHeight: 1.1
  body:
    fontFamily: "IBM Plex Sans, Helvetica Neue, Arial, sans-serif"
  hypothesis:
    fontFamily: "IBM Plex Serif, serif"
    fontSize: "clamp(1.4rem,2.3vw,2rem)"
    lineHeight: 1.7
  process:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: ".8rem"
    fontWeight: 400
rounded:
  sm: "2px"
  md: "2px"
  lg: "2px"
  xl: "2px"
spacing:
  half: ".5rem"
  three-quarter: ".75rem"
  one: "1rem"
  one-half: "1.5rem"
  two: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.bg-raised}"
  toggle-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.bg-raised}"
  query-clause:
    padding: ".75rem 0"
  coverage-cell:
    backgroundColor: "{colors.bg-raised}"
---

# Design System: Threat Hunting

## Overview

**Creative North Star: “The Long Tail.”** A precise question meets a distribution of behaviour. White plotting paper, graphite text, magenta selection and muted violet rules frame the lesson's hypothesis → telemetry → rare events → documented outcome sequence.

This is a lesson-local, code-led record of the current implementation, not a shared application theme or finish-review verdict. The kit overrides title, selected concepts, query walkthrough and the coverage wrapper; other content retains shared renderers. No raster assets are used.

## Colors

Deep magenta (`accent`) marks rare observations, selected controls, clause pins and focus. `accent-deep` supports highlighted query text. Paper (`bg`), white (`bg-raised`), violet surfaces and graphite (`text`) carry reading content. Muted and dim text remain distinct from rules.

Evidence colors and tinted backgrounds retain the shared observation, hypothesis, confirmed, uncertain, response and attack vocabulary. Their glyphs and labels carry meaning alongside color. An accent on a rare process pair is an invitation to investigate, never a verdict. Literal plot colors are recorded in the companion snippets and canvas notes; custom-property values above are normative.

## Typography

IBM Plex Sans Condensed carries headings; IBM Plex Sans carries reading text. IBM Plex Mono identifies process pairs, counts, code and ordered annotations. IBM Plex Serif distinguishes the hypothesis sentence. Counts use tabular numerals. The hero lead stops at 74ch. Presentation headings use the headline token; presentation leads are 1.15rem/1.45, with selected larger desktop opening text.

## Layout

Open ruled sections replace boxed overview panels. The hero uses 2rem/3rem vertical padding and a 195px distribution with 36 bars. Its heading aligns title and metadata on one baseline. Stack content uses 1.1fr/1fr columns, query content 1.25fr/1fr, notes two columns, outcomes three columns. Gaps are generally 1–2rem.

At 700px and below, the hero heading stacks; stack, query, hypothesis notes and outcomes become one column; pipeline steps become vertical. Presentation coverage becomes two columns. Presentation stage padding changes from 1.5rem 3rem to 1.5rem 1rem. Code and tables wrap or scroll within their own containers.

At 1000px and above, presentation-specific compact grids arrange stack, query, workshop brief, tasks and recap within a 79rem slide maximum. The final desktop query split is .85fr/1.5fr and its code panel maximum height is 190px; mobile presentation allows 350px. Desktop task lists use five columns. These are projection-specific adaptations, not study defaults.

All kit CSS is scoped to `:root[data-lesson='threat-hunting']` inside `@media screen`. Native print uses the shared ink palette and handout rules; decorative lesson layers disappear. Hidden decorative spans and the distribution's HTML `hidden` attribute provide print fallbacks while screen selectors reveal intended graphics. Keep the explicit print-only separators and hypothesis brackets.

## Elevation & Depth

Rules and tonal grounds provide structure. Existing local shadow tokens are `0 2px 5px #201d2710` and `0 8px 24px #201d2712`; active query explanations use an inset magenta underline. The margin canvas has .45 opacity and stays away from reading text.

## Shapes

Local radii are 2px at every named size. Bars have square ends; the rare hero bar has a 1px magenta outline offset 5px. Ruled lists, underlined hypothesis slots and dashed uncovered coverage cells provide distinctions without stamp imagery.

## Components

- **Controls:** buttons have a 44px minimum height. Selected sort buttons use magenta with white text and `aria-pressed`. Focus is a 3px magenta outline offset 4px. Shared navigation, fields and ordinary buttons retain their shared behavior under the lesson palette.
- **Distribution:** a labelled illustrative 36-bar plot reverses the same keyed bars; endpoint counts are 50,000 and 1. The button names the next sort action. A polite live region announces order. Bars are decorative.
- **Hypothesis:** source bracket fields become magenta underlined slots. Hovering a corresponding note highlights its slot; note text remains available without hover. Confirmed, refuted and inconclusive outcomes pair words with tick, double rule and wave glyphs.
- **Stack count:** eight labelled illustrative process pairs retain identity while sorting. Log-scale strips supplement exact counts. Buttons, ordered-list labels and a live region expose sort state. FLIP uses 640ms with 18ms row stagger and cubic-bezier(.16,1,.3,1); reduced motion skips row animation.
- **Query:** walkthrough buttons toggle persistent selection; pointer hover previews matching source clauses. Matching SPL lines receive a numeric pin and pink ground. Selection scrolls only the code panel to its first matching line; reduced motion uses immediate scrolling. Copy feedback lasts 1800ms; selectable code remains available if clipboard access fails.
- **Coverage:** shared interaction owns techniques, feedback and keyboard operation. White cells use dashed borders when uncovered; selected cells use pink fill and a 2px magenta outline.
- **Canvas and slide motion:** 32 margin bars track examined rank. CanvasStage caps DPR at 1.5, pauses offscreen/hidden rendering and composes a still frame for reduced motion. Slide entry reveals by clip-path over 360ms with cubic-bezier(.16,1,.3,1); reduced motion removes this animation. Hero distribution layout transition is 550ms with the same easing.

## Do's and Don'ts

- **Do** preserve source text, study-only provenance and deeper explanations, expected-result limitations and labelled synthetic data.
- **Do** accompany state with words, glyphs, patterns or pressed semantics; preserve visible keyboard focus.
- **Do** keep sorted items identifiable and treat rarity as a question.
- **Don't** let decorative plots sit behind reading text or move the whole page when selecting a query clause.
- **Don't** apply this screen palette to print or promote lesson-local tokens into the shared design system without explicit scope.
