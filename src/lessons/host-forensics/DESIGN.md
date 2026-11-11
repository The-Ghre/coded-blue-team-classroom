---
name: Residual Records
description: Session 06 host forensics, expressed as independent surviving records.
colors:
  cold-ground: "#edf0f2"
  paper: "#f9fafb"
  panel: "#f5f7fa"
  surface-secondary: "#e4e9ef"
  surface-tertiary: "#dce3ea"
  graphite: "#17232d"
  text-muted: "#293d4e"
  text-dim: "#405367"
  line: "#b9c4ce"
  line-strong: "#718396"
  tree-line: "#9eacb9"
  windows-cobalt: "#194bb0"
  cobalt-deep: "#163f91"
  linux-oxblood: "#922d43"
  windows-compare-bg: "#e7edf9"
  windows-compare-text: "#153568"
  linux-compare-bg: "#f4e7eb"
  linux-compare-text: "#642337"
  observation: "#194bb0"
  hypothesis: "#744300"
  confirmed: "#16613e"
  uncertain: "#713c87"
  response: "#075a73"
  attack: "#922d43"
  observation-bg: "#e4ebfa"
  hypothesis-bg: "#f4ead7"
  confirmed-bg: "#dfefe5"
  uncertain-bg: "#eee6f4"
  response-bg: "#deedf1"
  attack-bg: "#f4e3e7"
typography:
  display:
    fontFamily: "IBM Plex Sans Condensed, IBM Plex Sans, sans-serif"
    fontSize: "clamp(2.7rem, 5.3vw, 5.5rem)"
    lineHeight: 1
    letterSpacing: "-.035em"
  body:
    fontFamily: "IBM Plex Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
  schematic-controls:
    fontFamily: "IBM Plex Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: ".875rem"
  slide-heading:
    fontFamily: "IBM Plex Sans Condensed, IBM Plex Sans, sans-serif"
    fontSize: "clamp(1.8rem, 2.8vw, 2.7rem)"
  title-slide:
    fontFamily: "IBM Plex Sans Condensed, IBM Plex Sans, sans-serif"
    fontSize: "4rem"
  pane-lead:
    fontFamily: "IBM Plex Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.25rem"
    lineHeight: 1.5
  mobile-pane-controls:
    fontFamily: "IBM Plex Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: ".8rem"
  scenario:
    fontFamily: "IBM Plex Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.2rem"
    lineHeight: 1.5
  concept-point:
    fontFamily: "IBM Plex Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.15rem"
    lineHeight: 1.45
  path:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "18px"
  platform:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "27px"
    fontWeight: 600
rounded:
  surface: "2px"
spacing:
  compact: ".5rem"
  control: ".75rem"
  standard: "1rem"
  section: "1.5rem"
components:
  schematic:
    backgroundColor: "{colors.paper}"
  windows-compare:
    backgroundColor: "{colors.windows-compare-bg}"
    textColor: "{colors.windows-compare-text}"
  linux-compare:
    backgroundColor: "{colors.linux-compare-bg}"
    textColor: "{colors.linux-compare-text}"
  code-surface:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.graphite}"
  code-header:
    backgroundColor: "{colors.surface-tertiary}"
    textColor: "{colors.graphite}"
---

# Design System: Residual Records

## Overview

**Creative North Star: "Residual Records"**

Deleting an executable removes one object while independent execution, registry, and audit records remain. The visual language makes that relationship legible through two forensic file trees: outlined files, directory branches, a dotted missing object, and solid surviving records. A cold light ground and graphite text keep projected lessons and reading pages clear.

This document describes only `src/lessons/host-forensics/**`. It deliberately lives beside the kit because the user forbids shared-file edits. Root `DESIGN.md` and `.impeccable/design.json` remain integrator-owned; this is the explicit documentation scope exception. The surface contract is `.impeccable/surfaces/src-lessons-host-forensics-index-ts.md`; implemented component and stylesheet values govern this extraction. No raster assets are used.

**Key Characteristics:**

- IBM Plex is a binding brand requirement.
- File-tree reconstruction gives evidence a visible relationship.
- Windows and Linux receive consistent platform colors.
- Original content renderers retain their interactions and feedback.

## Colors

The palette uses cool papers, dark graphite, Windows cobalt, and Linux oxblood. Frontmatter records the implemented screen colors; lesson overrides are screen-scoped.

### Primary

- **Windows cobalt:** primary action/accent, Windows schematic, and observation evidence. Its deeper companion supports existing action states.

### Secondary

- **Linux oxblood:** Linux schematic, attack evidence, and the visible keyboard focus outline.
- **Evidence colors:** hypothesis, confirmed, uncertain, and response retain distinct semantic foregrounds and pale backing colors. Endpoint/network/identity/cloud pillar colors reuse cobalt/response/hypothesis/confirmed respectively.

### Neutral

- **Cold ground and papers:** page ground, reading surfaces, and quiet panels.
- **Graphite and muted text:** body copy, secondary labels, and deleted-object context.
- **Lines:** strong rules establish sections; softer rules divide rows; a separate muted tree line connects schematic objects.

**The Platform Continuity Rule.** Keep Windows in the cobalt family and Linux in the oxblood family. Comparison tables use the corresponding pale backgrounds and dark text pairs from the frontmatter. Labels and structural cues carry meaning alongside color.

## Typography

IBM Plex Sans Condensed supplies large titles and headings. IBM Plex Sans supplies reading text and platform names; IBM Plex Mono supplies technical paths and schematic record labels. Existing shared technical-code treatments remain intact.

The hero display has tight leading and a maximum width of 20 characters. Its lead stays within 74 characters. Presentation block headings use a responsive size from 1.8rem to 2.7rem; the title slide heading is 4rem. Reading-pane lead text uses 1.25rem with 1.5 leading, and concept points use 1.15rem with 1.45 leading. Schematic labels remain deliberately larger than utility labels for projection.

## Layout

The hero places a large left-aligned subject above the schematic and preserves the original lead and actions. Desktop schematic trees share a two-column grid, each with its own intrinsic SVG. The title slide stacks title content above the wide schematic; its title block arranges heading and supporting content across columns.

At the 700px breakpoint, the trees stack and the title block becomes a vertical flow. Phone presentation scrolls vertically; it is not a viewport-fit slide guarantee. Comparison tables retain a minimum width of 620px on narrow screens so their platform relationship stays readable through horizontal overflow.

Desktop presentation uses a stage inset of 1.5rem vertically and 3rem horizontally. Dense content is split into local reading panes to fit the desktop projection target. Lesson verification reports that the rendered matrix passed all 19 slides and 52 panes at 1440×900 with no stage overflow. This is a verified target size, not a guarantee for every viewport. The mobile matrix checked 52 panes: 38 need vertical scrolling inside the stage; overview, study, and practical pages had no page-level horizontal overflow. These checks were performed during lesson verification, not independently repeated during this documentation pass.

## Elevation & Depth

The system is mostly flat: paper tones, section rules, and file outlines establish hierarchy. Small shadows are disabled. Existing medium and large shared surfaces can use the restrained graphite shadows recorded in the local sidecar; do not add decorative floating layers to the trees. The backdrop limits low-opacity branches and travelling marks to the margins so prose sits on quiet ground.

## Shapes

Surfaces use a restrained 2px corner radius. Schematic files use folded-corner outlines and rectangular record sheets, with check marks on surviving records. Concept bullets use small unfilled rectangular marks. Solid and dotted strokes explain survival and deletion; they are part of the evidence story rather than ornament.

## Components

### Schematic

Two labelled SVG trees show an executable and independent records on each platform. The button starts in the deleted state, exposes `aria-pressed`, and can restore or delete the schematic executable. A polite live status and per-host image descriptions explain the current state. The schematic is illustrative and contains no host addresses, timestamps, or investigation answers.

The branch pulse repeats every six seconds with linear timing. It pauses when the schematic is outside the visible area. Reduced motion removes the pulse animation and makes its stroke solid. Margin animation receives the reduced-motion preference through the backdrop. Directional slide transitions use a restrained 380ms registration movement with the easing recorded in the sidecar; reduced motion removes those animations.

SVGs carry intrinsic dimensions, view boxes, font attributes, and a current-color stroke. They remain legible in print without depending on the screen-only theme. Print inherits the shared print renderer; this document does not promise screen palette or animation in printed output.

### Reading panes

Presentation mode divides comparisons into groups of three rows and splits concepts, evidence, questions, tasks, hints, brief sections, deliverables, and recap material into smaller panes. Every pane still renders through the original `Default` renderer. Panes remain mounted while hidden, preserving selected answers and feedback when a learner moves between them. Previous/next controls announce the current count and disable at the boundaries. A block change resets pane selection through the block ID key.

Study/workshop rendering returns directly to `Default`. Do not replace original task controls, quiz feedback, or interactive state with static text. Empty supporting sections are hidden locally to avoid blank projection containers.

### Code surfaces

Screen code containers use the secondary surface, graphite text, and the standard line border. Their headers use the tertiary surface with the same text and border. Code bodies and nested code keep transparent backgrounds and graphite text, preserving a continuous light reading surface. These are color-only overrides; shared sizing remains intact. Print inherits the global white-paper treatment unchanged.

### Controls and reading surfaces

Buttons and summaries have a minimum screen target height of 44px. Focus uses a 3px oxblood outline with a 4px offset. Existing shared button semantics remain in force. Evidence rows use thin separators on paper; overview panels use a strong top rule instead of a card shell. Section headers gather title and metadata above a strong divider.

## Do's and Don'ts

- **Do** preserve IBM Plex and the distinction between condensed display, prose, and technical paths.
- **Do** retain original renderer behavior and mounted learner state when paging.
- **Do** keep deletion understandable through outline, strike, labels, and status text.
- **Do** verify desktop pane fit against the actual target viewport before claiming completion.
- **Don't** turn the trees into decorative terminals or metaphorical rooms.
- **Don't** apply this kit's screen overrides to other lessons or overwrite integrator-owned design files.
- **Don't** introduce raster imagery into this schematic-led implementation.
