# Packet / Page

Session 07 pairs packet timing with process memory pages. The visual evidence is
literal: a train of regularly spaced connections, a page containing MZ, and an
empty disk row. The diagram repeats only the public theory scenario and is
explicitly synthetic. No workshop solution or source markdown is bundled.

## Local tokens

All shipping CSS is inside screen media and the lesson root selector.

| Role | Token / value |
| --- | --- |
| Ground | `--bg: #f1f7f4` |
| Paper | `--bg-raised: #ffffff` |
| Process surface | `--surface: #e3eee8` |
| Primary ink | `--text: #142e28` |
| Secondary ink | `--text-muted: #29483d` |
| Labels | `--text-dim: #29483d` |
| Packets and actions | `--accent: #005b50` |
| Volatile memory and focus | `--focus: #713868` |
| Rules | `--line: #bfd0c6` |

Headings use IBM Plex Sans Condensed. Prose uses IBM Plex Sans. Addresses,
intervals, bytes and page indices use IBM Plex Mono. No fonts or dependencies
were added. All six evidence encodings retain their shared shape, glyph and word.

## Behavior

The overview/study schematic has a native labelled range input with a live
inspection result and accessible value text. It starts at the injected page.
Changing pages moves the selection without remounting the diagram.

Dense presentation blocks have labelled reading panes around the original shared
renderer. No renderer is reimplemented; its controls, copy action, feedback,
synthetic labels, annotations, and state remain intact. The full study and
workshop layout has no reading-pane UI. On phones, the player remains vertically
scrollable so evidence and feedback are reachable without shrinking text.

CanvasStage draws two timestamp lanes only in presentation. It caps DPR at 1.5,
pauses hidden/offscreen animation, and renders a still when motion is reduced.
Navigation reveals the next acquired page with a 320ms clip transition. Packet
entrances are finite. There is no perpetual page animation outside the player.

The schematic uses the shared lesson-layer print exclusion, with screen-only
containment overrides to keep its range input interactive. Print inherits the
base black-on-white handout. No lesson palette applies to paper.

## Scope

This document records only this kit. Shared DESIGN.md, configuration, base tokens,
content data, interactions, and dependencies are unchanged. The direction record
is `.impeccable/surfaces/src-lessons-network-memory-forensics-index-ts.md`.

## Verified delivery

The fresh finish reviewer returned **ship** for the reviewed correction scope.
The 78-state viewport sweep plus focused final checks found no desktop stage
overflow and no horizontal overflow at either viewport. All six expanded malfind
notes fit without internal note overflow. The native range, four jitter presets,
six annotation controls and knowledge feedback were keyboard activated; answers
survived pane changes. Reduced motion, print emulation/PDF and home palette
restoration were checked. `npx tsc -b` and `npm run build` pass. Impeccable detector
returned `[]` in its single initial pass; final fit changes were reviewed from
source and refreshed screenshots. GUI browser control was unavailable, so all
rendered checks used installed headless Chrome through Playwright.

Primary ink contrast is 13.33:1 on mint. Secondary ink is 9.26:1 on mint and at
least 7.22:1 on all local surfaces. Dense phone views intentionally scroll
vertically; projection at 1440×900 fits without scrolling.

Evidence lives locally in `.impeccable/review/`: `final-verification.json`,
`final-interaction-states.json`, viewport PNGs, and `study-print.pdf`.
