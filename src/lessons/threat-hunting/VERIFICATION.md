# Session 09 — The Long Tail

Branch: `redesign-v2/lesson-09-threat-hunting`.

## Direction

The analyst asks a falsifiable question, verifies telemetry, ranks observed behaviour and investigates the rare tail. Cool plotting paper `#faf9fc`, graphite `#201d27`, deep magenta `#99104e`; IBM Plex Condensed/Sans/Serif/Mono. No raster assets or new dependencies. The overview plot reorders on demand; stack counting retains FLIP sorting, queries retain clause-to-line highlighting, and CoverageMap uses the shared implementation unchanged. CanvasStage supplies the sparse distribution margin, hidden-tab suspension, DPR cap 1.5 and reduced-motion still frame.

## Verification

- `npx tsc -b`: pass.
- `npm run build`: pass (682 modules).
- Impeccable `detect --json src/lessons/threat-hunting`: `[]`, using installed engine 0.1.5. Requested engine 0.1.21 could not initialize in the sandbox; concept roll degraded, no challenger boards. No second detector run, following the skill.
- Headless Chromium: overview, theory study and workshop at 1440×900 and 390×844. No page horizontal overflow at either size.
- All 19 slides captured at both sizes. Desktop stage 729px: all scrollHeight = clientHeight, zero clipped slides. Densest frames: stack counting 695px, query 693px within 697px content area.
- 38 keyboard slide steps: pass (19 at each size).
- Keyboard hero sorting, stack sorting, query clause selection (two highlighted matching lines), CoverageMap selection: pass. Visible focused control outline 3px.
- All ten CoverageMap selection states fit desktop stage (729px scroll/client height).
- Mobile uses vertical reading scroll for dense slides. Comparison table remains a native horizontal scroller: 608px content inside 356px, reachable to scrollLeft 252px. Deliverable right edge 374px, inside 390px viewport.
- Reduced-motion capture made; plot still frame and instant transitions retained through shared helpers and scoped CSS.
- Browser print-media screenshot and A4 PDF generated: background `#ffffff`, accent `#004aa3`; lesson layers and distribution hidden. Native print dialog/physical printing not tested.
- Home after lesson: lesson attribute cleared; base navy `#00081c` restored.
- Body/paper contrast 15.81:1, muted/paper 9.29:1, muted/surface 8.40:1; secondary dim/surface 6.18:1; white/accent 8.27:1. Evidence labels retain shape/glyph/word, with measured color contrast 6.02–7.26:1 on their tinted backgrounds.
- No uncaught page errors. One pre-existing shared React development warning remains: ScenarioView nests MonoLabel's div inside a paragraph. Shared renderer is outside this lesson's write boundary.
- `git diff --check`: pass.

## Review

Fresh Impeccable finish reviewer: initial `fix`; two bounded correction rounds. Final `ship` for scored fixes: desktop fit, mobile containment, CoverageMap/submission-panel contrast and thick side borders resolved; no regressions identified. This is a verdict on the scored corrections, not an independent certification of every state.

Evidence is local and gitignored under `.impeccable/review/`: `desktop-{overview,study,workshop}.png`, `mobile-{overview,study,workshop}.png`, `desktop-slide-0.png` through `desktop-slide-18.png` and mobile counterparts, `verification.json`, `interaction-checks.json`, `keyboard-checks.json`, selected-state captures, `desktop-reduced-motion.png`, `study-print.png`, `study-print.pdf`.

Design documentation is kit-local in `DESIGN.md` and `.impeccable/design.json`; shared design files, content, dependencies and other lesson kits remain untouched. No push, merge or deployment performed. Cross-lesson comparison belongs to the integrator.
