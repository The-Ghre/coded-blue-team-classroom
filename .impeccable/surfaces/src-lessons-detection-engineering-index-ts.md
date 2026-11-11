---
version: 1
slug: "src-lessons-detection-engineering-index-ts"
primary_target: "src/lessons/detection-engineering/index.ts"
related_targets: []
---

# Session 04 — Detection Engineering lesson world

Scope: the lesson kit for Session 04 (`src/lessons/detection-engineering/`), covering the projected slide player (showpiece), the study and workshop reading pages, and the session overview. Mode: Experience on slides; the study pages read as Read inside the same world.

Audience: CODED Defensive track cohort (ESL, Gulf), projected in a classroom, then read on laptops and phones. Job: understand that a rule is data source + conditions + threshold, that tuning trades precision against recall, and that a coverage map is a prioritised record of where nothing watches.

Constraints: content and interaction behaviour are fixed by `src/content`; palette contrast per `src/lessons/README.md`; type within IBM Plex; no image generation, so art is code (canvas, SVG, CSS). Other nine sessions build their own worlds; this one must read as different with all text removed.

Seven grounded candidates, ordered by resonance: 1 signal-detection plate (ROC, overlapping distributions); 2 seismic network trigger bulletin; 3 Gulf pearl merchant's grading sieves; 4 fire-protection floor plan (the lead's literal reading); 5 gargoor trap and mesh regulation; 6 Admiralty coastal chart with sector lights and the Light List; 7 Jacquard punched instructions. Roll assigned 6.

Challenger verdicts: Jacquard brocade declined (raise: traceability); daylight section declined (raise: composed still state); HyperCard stack declined (raise: reader writes the rule); VU-meter bridge declined (raise: ballistics); Push Pin poster declined (raise: flat fills); boarding pass and gate board competitive on product clarity (prioritisation as a ranking), kept as the alternate.

## Direction contract

THESIS: A detection library is a system of lights along the attacker's coast. Each rule is a light with a declared character, range and sector; tuning sets the sector; coverage is the chart showing which stretches of the coast are lit and which are dark. It refuses the category default: a near-black SOC console with neon gauges, a heatmap grid and a terminal.

OWN-WORLD: An Admiralty-style chart by day. Chart-white deep water, two blue shoal tints, buff land, chart-black linework, chart magenta for lights and cautionary notes, port red and starboard green only on sector arcs. Graduated black-and-white neatline border. Depth contours, scattered soundings, light flares and sector arcs drawn as code. Plex Serif upright for titles (chart title), Plex Serif italic for water/lead text (hydrographic italic), Plex Sans Condensed spaced capitals for labels, Plex Mono for light characteristics and rule text. Flat fills, no glow, no gradients (Push Pin raise).

STORY: The room sails the coast slide by slide; lights appear where the lesson builds detections. In the rule builder the student narrows a beam and sees noise fall dark, attack vessels go unlit, and an exclusion cut an obscured sector an attacker can pass through. On the coverage chart the student sees Lateral Movement as an unlit reach and decides what to light next.

FIRST VIEWPORT: Title slide is a chart title cartouche on the left third (overline, "Session 4" in Plex Serif at display size, italic lead) and, filling the right two thirds, a headland with one sector light whose red, white and green arcs draw in and whose flare flashes its character slowly; the neatline frames the stage; the chart pans along the coast as slides advance. Study and overview open on the same cartouche with the session's Light List entry and the real Present / Study actions inside it.

FORM: Admiralty coastal chart and Light List, candidate 6 of 7 on the ordered list. seed:3e6baad1f2488c54. Signature interaction: the Sector Light Tuner (rule builder) — conditions narrow the sector, exactly falsePositives lit noise marks, 12 attack vessels lit or dark, exclusion drawn as an obscured sector with the path it opens; the condition line writes itself as the student selects (HyperCard raise). Motion grammar: chart pans with travel direction; slide transitions wipe like a chart unrolling; numbers settle with weighted ballistics (VU raise); Sigma walkthrough highlights the exact lines each part explains (Jacquard raise); reduced motion shows a composed still chart with every number present (daylight raise).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Note: DESIGN.md for the merged ten-lesson system is written once by the parent session after merge; this kit ships no rasters.
