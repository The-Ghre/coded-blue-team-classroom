# Session 04 verification

Direction: Rule Test Bench. Screen palette: mint, evergreen, vermilion. Shared RuleBuilder and CoverageMap own all exercise scoring, feedback and data. Sigma tracing retains its supplied code, walkthrough, expected result, limitations and provenance.

## Executed

- `npx tsc -b`: pass. `npm run build`: pass, including after the final UI corrections.
- All 19 presentation routes measured at 1440×900 and 390×844. Desktop stage overflow: 0/19. Horizontal document overflow: 0/19 at both sizes. Phone slides retain vertical reading scroll. Long code, walkthroughs and exercises use local scroll regions on desktop.
- Overview, theory study and practical: no horizontal document overflow at either target size. Final desktop/mobile screenshots are in local `.impeccable/review/`.
- Keyboard: range ArrowRight changes 38→39; Space toggles RuleBuilder conditions and coverage cells, activates Sigma trace and quiz feedback without advancing the slide; ArrowRight outside exercises advances the presentation.
- Shared RuleBuilder broad condition: 859 alerts, 12/12 attacks, 847 false positives. Adding encoding condition: 91 alerts, 11/12 attacks, 80 false positives. Feedback remains shared.
- Coverage: selecting T1021.001 exposes the supplied fourteen-day lateral-movement gap note. Sigma filter selection highlights lines 38–41. Quiz selection exposes supplied feedback.
- Reduced motion: captured with emulation; event lane uses CanvasStage still-frame handling, local transitions are disabled, Sigma scroll is instant.
- Print media: white `--bg: #ffffff`, ink `--text: #0a1526`; population diagram has monochrome intrinsic attributes. Print-media screenshot inspected; PDF generated. The native OS print dialog was not used; every printed page was not individually reviewed.
- Home after navigating from the lesson: no `data-lesson`, background restored to CODED `#00081c` under screen media.
- Browser page errors during route audit: none.
- Impeccable detector ran once: one width-transition warning. Removed the local width animation and disabled the inherited bar width transition. No second detector run, following the skill's one-run rule.

## Evidence and limits

Local evidence: `verification.json`, `states.json`, final-slide desktop/mobile/top/bottom captures, selected rule/coverage/Sigma/quiz states, print preview, overview/study/practical captures in `.impeccable/review/`. These are ignored review artifacts and are not included in the commit.

The independent finish reviewer evaluated the rendered evidence and requested surface-contrast, projection, monochrome-print and mobile intrinsic-width corrections, all implemented. Review verdict is reported in the handoff.

No automated exhaustive accessibility audit, full device/browser matrix, frame-time benchmark, or ten-lesson side-by-side comparison was performed. Canvas visibility, DPR cap and still frames use the shared helper. All original lesson content remains outside this kit and unchanged. Global Impeccable context reported legacy product/config metadata; it was not repaired outside scope. The direction roll used a preinstalled engine in degraded mode without challenger boards.
