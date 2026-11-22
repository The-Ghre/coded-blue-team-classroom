---
version: 1
slug: "src-lessons-soc-operations-index-ts"
primary_target: "src/lessons/soc-operations/index.ts"
related_targets: []
---

# Signal / Decision
Mode: Experience in projection, Read in study, Operate in the exercise. Code-led, as requested.
THESIS: A SOC turns a noisy stream into a defensible decision through context.
OWN-WORLD: Mint-white ground #edf5ef, near-black green #102e29, coral #a33527. IBM Plex Sans Condensed headlines; Sans reading; Mono only evidence and counters. Incoming alert rows, selection brackets, context gates, branching handovers.
STORY: Many incoming alerts converge on one selected alert. Five check nodes illuminate in sequence; the selected row splits to closed or escalated paths. This is schematic, not live telemetry or an answer key.
FIRST VIEWPORT: Large left-aligned title takes two thirds of the hero, an alert-flow drawing occupies the remaining third, separated by a hairline. Actions remain immediately beneath the lead. A full-width metadata row anchors the hero. Reading surfaces use open ruled sections instead of cards.
FORM: Every shared block and TriageConsole is rendered by Default. Its gates, labels, provenance, answers and feedback are untouched. Context results expand into ruled evidence rows. Slide navigation brings the next alert into the same working position.
SIGNATURE: Canvas selection gate, with many short neutral alerts and a few outlined deviations; an evidence check sequence precedes routing. CanvasStage pauses hidden/offscreen, max DPR 1.5, composed still for reduced motion.
Candidates ordered by resonance: 1. Alert queue and handover; 2. Six-question worksheet; 3. Signal / Decision correlation schematic; 4. Shift handover register; 5. Log-source coverage plan; 6. Baseline comparison plot; 7. Detection feedback loop.
Seed 760ec3ff assigned candidate 3. Challenger verdicts: vertical feed declined (loses identification and clarity; keep single selected-item focus); fight poster declined (both; keep hierarchy courage); Versailles declined (both; keep navigational sequence); cloud quarry declined (both; keep density contrast); datamatics competitive on identification but loses clarity and colour taxonomy; retain grounded candidate; nixie counter declined (both; keep state change precision). No foreign motifs borrowed. User delegated choice and forbade decision pages.
Risk: schematic motion must stay peripheral to real evidence, and must not imply severity proves maliciousness.
Scope: only this lesson kit and this surface brief. Shared DESIGN.md intentionally preserved by user scope.

## Verification — 2026-11-11
- Full lesson TypeScript and markdown sources read; kit contract and motion helpers inspected.
- `npx tsc -b`: PASS. `npm run build`: PASS (261 modules). Required commands needed escalation because node_modules points outside the writable worktree and TypeScript writes its cache there.
- Final `impeccable detect src/lessons/soc-operations --json`: PASS, `[]` using installed engine 0.1.5; current launcher engine 0.1.21 could not install in sandbox.
- Source-level palette calculation across four main backgrounds: primary body minimum 11.32:1, secondary body minimum 7.22:1, dim label minimum 6.07:1. Evidence foregrounds minimum 6.24:1 across those grounds. Rendered combinations remain unverified.
- All teaching blocks use shared Default renderers; title override only adds an aria-hidden diagram alongside Default. Shared TriageConsole untouched. No new dependencies, source content changes, or answer-key files.
- CSS entirely under screen media and lesson root; scoped base aliases cover shared components with direct brand-token references. Print inherits shared print CSS. CanvasStage supplies hidden/offscreen pause and reduced-motion still, DPR capped 1.5.
- Preview running from this worktree at http://127.0.0.1:5181. An existing IPv6 localhost:5181 listener serves the old kit; use the IPv4 URL explicitly.
- CUA browser host unavailable. No screenshots could be captured. Every-slide desktop/mobile fit, overview/study/workshop at both viewports, keyboard-only operation, rendered reduced motion, print preview, and console errors are NOT verified.
- Independent finish reviewer verdict: RECAPTURE. Required desktop.png/mobile.png, every-slide captures and keyboard/reduced-motion/print evidence missing. No visual ship verdict claimed; integration needs that review before approval.

## Resume verification — 2026-11-11 (supersedes prior preview/browser status)

Preview: **http://127.0.0.1:5281/session/soc-operations**. Port 5181 was occupied by PID 21261 on IPv6; it was left untouched. New Vite listener PID 82771 binds IPv4 127.0.0.1:5281. `lsof -a -p 82771 -d cwd` resolved exactly to `/Users/coded/Desktop/CODED/CyS-Bootcamp/Current-Cohort/3-Defensive/Lessons-ESL/worktrees-v2/01-soc-operations`. The Vite `__vite__css` string from `/src/lessons/soc-operations/theme.css` was decoded and compared byte-for-byte to the local file: true (pre-fix CSS SHA-256 `d66898c8f196e5ade344457678bfdbf96cf9a1a4c06820d8ac82dd92e4801b33`). This is not the old `../worktrees` server.

Native Chrome became available after the first getApp timeout, although browser inventory still reported `The browser access host is unavailable`. Via permitted CUA native controls, DevTools Responsive dimensions were visibly confirmed at **1440×900** and **390×844**. Arrow-key navigation traversed all 21 slides at both sizes, saving screenshots and AX transcripts. This verifies slide navigation, not the entire keyboard-only exercise flow.

Evidence (machine-local, intentionally ignored by Git): `.impeccable/review/` contains **51 PNGs**, with SHA-256 manifest `capture-sha256.json`:
- `desktop-slide-00.png` through `desktop-slide-20.png`, matching `.txt` AX transcripts: first fix-round desktop recaptures.
- `mobile-slide-00.png` through `mobile-slide-20.png`, matching `.txt` AX transcripts: initial mobile captures, before width correction.
- `desktop-overview.png`, `desktop-study.png`, `desktop-practical.png`, and corresponding `mobile-*.png`: initial viewport captures, not exhaustive full-page checks.
- `overview-native.png`, `desktop.png` (initial opening slide), `print-study.png`, `print-study.txt` (18-page native print preview), `console.txt`.

Independent reviewer: separate `finish_review` agent, read-only review of source and native captures; no browser contention or reviewer edits. First verdict **FIX**: numerous dense slides overflowed, mobile console clipped horizontally, diagrams inherited a dark translucent ground, and print retained decorative mint/coral canvas and collapsed metadata spacing. Two scoped fix rounds were implemented in commit `a04c6a3`: presentation spacing and two-column composition; console width containment; actual concept list-item sizing; task/check/evidence/brief/deliverable reflow; light diagram surface; print-only removal of decorative flows and spaced metadata. All teaching content, shared renderers, interaction gates and feedback remain unchanged.

Reviewer’s latest rendered verdict remains **FIX**, not SHIP. On the first-round desktop recaptures, zero-based slides **2, 6, 9, 14, 15** still clipped (scenario closing question, pipeline callout, evidence conclusions, briefing setup, tasks 3–4). The second fix round addresses these areas and diagram contrast in source, but final recapture was blocked. Mobile width and print corrections also remain visually unverified. No issue is claimed resolved solely from CSS inspection.

Precise remaining native-control blocker: after the desktop recapture, DevTools focus/command-menu actions ceased reliably changing state. Coordinate click returned `Computer Use server error -10005: noWindowsAvailable`; clicking a freshly observed Run command menu target returned `Accessibility error: AXError.invalidUIElement`. Reacquiring Chrome, raising its exposed window, and resetting/reinitializing CUA did not recover navigation: Cmd+L, paste of `/present/0`, Return left both URL and AX tree at `/present/20`. Repeated no-op input was stopped. No alternate browser automation or OS input mechanism was used.

Still required: final screenshots of all corrected slides/surfaces; complete reading-page scroll coverage at both sizes; keyboard-only TriageConsole checks → decision → feedback and visible focus; rendered reduced-motion still/instant transitions; post-fix print recapture; rendered contrast measurements. These checks are **blocked/unverified**, not passes.

Console evidence: React development warning `validateDOMNesting: <div> cannot appear as a descendant of <p>` traces to shared `MonoLabel` (`src/components/brand/Brand.tsx`) inside shared `ScenarioView` (`src/components/teaching/blocks.tsx`). It occurs in presentation and study. Fixing shared markup is outside the lesson-agent scope and needs integrator action. No uncaught runtime exception was observed during captured navigation; a clean-console verdict is not claimed.

Tooling: current Impeccable launcher 0.1.21 still cannot create its external cache; existing installed engine 0.1.5 detector returned `[]`. UI-edit design hook also reported no deterministic findings. Detector cleanliness is not visual approval.

Final committed source checks: `npx tsc -b` PASS; `npm run build` PASS (261 modules, SOC CSS `soc-operations-CoHOluoU.css`, 11.03 kB); `git diff --check` PASS. Final port-5281 served CSS again equals local bytes, SHA-256 `0a0ba71339052347aa184560d926dcffe2e4d34dd1cfc51c51c06616b758e760`. Source build and server identity are cleared; the visual/interaction gate remains open.

## Focused integrator correction — final 2026-11-11

Supersedes the blocking FIX verdict above. Kept Signal / Decision mint/green/coral palette and all lesson content. Added a bounded reading pane rather than shrinking body copy. Stage and navigation remain stationary; dense content and expanded feedback scroll fully inside the pane. Layout/paint containment prevents diagram overflow propagation. Lesson-only ReadingPane overlay adds a labelled focusable region and preserves native scrolling keys without invoking player shortcuts; it does not replace or remount the shared blocks or interaction state.

Verification from this exact worktree: isolated IPv4 Vite server `http://127.0.0.1:5381`, cache `/private/tmp/soc-vite-final-cache` (other listeners/caches untouched). Headless Chrome at exact 1440×900 and 390×844, reduced motion: all 21 slides at each size, **42/42 stage overflow 0px, horizontal overflow 0px, bottom reachable**. Overview/study/practical at both sizes also have 0px document horizontal overflow. New top/bottom captures for every slide and all six reading/overview views are in ignored `.impeccable/review/final-*`; measurements `final-fit.json`. Expanded TriageConsole: four decisions locked initially, all context checks reveal, decision produces feedback, pane bottom reachable with zero overflow at both sizes (`final-interaction.json`, expanded screenshots). Keyboard Tab focuses named pane; ArrowDown scrolls 0→40px without leaving slide6 (`final-keyboard.txt`). Print styling unchanged in this correction; no fresh print preview claimed. Shared invalid-DOM warnings deliberately left to integrator.

Final `npx tsc -b`, `npm run build`, `git diff --check`: PASS. Installed Impeccable 0.1.5 detector: `[]`; launcher 0.1.21 remains unavailable. Independent fresh_finish_review inspected refreshed dense desktop/mobile top/bottom captures, expanded interaction screenshots, source and measurements: **SHIP**, fit/content reachability 9/10, typography 9/10, responsive 9/10, interaction preservation 9/10. No blocking issue remains in focused correction. Screenshot files are intentionally local ignored evidence rather than new lesson assets.
