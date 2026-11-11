# PRODUCT — CODED Blue Team Classroom

The CODED Defensive Security track, delivered as an interactive teaching platform:
ten three-hour sessions, each pairing a 90-minute theory lesson with a 90-minute
practical workshop that applies it.

---

## 1. What this is

A static web application that an instructor can teach from and a student can study
from, built entirely from the ten supplied CODED Defensive track source files.

Three connected modes over one body of content:

| Mode | For | What it does |
|---|---|---|
| **Roadmap** | Orientation | The whole curriculum as a sequence, with outcomes, prerequisites, durations and resume controls. |
| **Presentation** | Classroom projection | A slide player with keyboard control, full screen, slide overview, shareable per-slide links and auto-hiding chrome. |
| **Study / Workshop** | Independent study and lab time | The same content expanded, with contents navigation, progress marking, search and print-ready layouts. |

Everything is client-side. No accounts, no server, no database, no tracking.

---

## 2. Who it is for

**Instructors** teaching the Defensive track. They need to project a session
without the interface intruding, move through it by keyboard, jump to a specific
slide, and hand students a workshop that runs without infrastructure.

**Students** working through the course, during a session and afterwards. They need
readable lesson content, searchable reference, a workshop brief they can follow
alone, and the ability to resume where they stopped.

**The course owner** maintaining the material. They need to edit a lesson or add a
session by changing data, not components — see `README.md`.

---

## 3. The curriculum

Derived from the supplied material, not assumed. The ten files establish their own
sequence through an internally consistent "Yesterday" chain that agrees with the
file numbering; this course follows it.

| # | Session | Track | Workshop |
|---|---|---|---|
| 01 | The SOC: Detection, Triage and Response | Core | One night on the Tier 1 queue |
| 02 | Log Analysis: Reading the Raw Evidence | Core | Reconstruct the compromise from logs alone |
| 03 | Phishing Investigation | Core | A phishing investigation against the clock |
| 04 | Detection Engineering | Core | Rebuild the detection library after a breach |
| 05 | Incident Response and Digital Evidence | Core | Run the incident |
| 06 | Host Forensics: Windows and Linux | Core | Cross-platform reconstruction |
| 07 | Network and Memory Forensics | Core | Three layers, one compromise |
| 08 | Malware Analysis | Core | From one file to a campaign blocklist |
| 09 | Threat Hunting | Extension | A three-hypothesis hunt |
| 10 | Active Directory Security | Extension | Investigate the DCSync, plan the recovery |

**30 contact hours.** Eight core sessions, two extension sessions (marked OPTIONAL
in the source material).

No dates are assigned. The supplied files contain no cohort dates or schedule — the
dates that appear in them (14 March 2026 and similar) are inside synthetic incident
scenarios, not delivery dates.

---

## 4. Session structure

Every session is exactly 90 minutes of theory and 90 minutes of practical. This is
enforced by a check computed from the content itself — `checkTimings()` in
`src/content/index.ts` — which warns in development and is displayed on the
**About** page, so a content edit that breaks the timetable is visible immediately.

**Theory (90 min)** follows the brief's suggested shape, adapted per session:

- 10 min — retrieval questions and an opening scenario
- ~25 min — concepts with original diagrams
- ~20 min — instructor demonstration (annotated evidence or a query walkthrough)
- ~25 min — worked examples and guided analysis, usually an interaction
- 10 min — knowledge check and the practical briefing

**Practical (90 min)**:

- 10 min — briefing: scenario, objectives, requirements, environment setup, and an
  explicit statement of what is simulated
- 55 min — scoped tasks with per-task timings and a named deliverable each
- 15 min — evidence organisation and submission
- 10 min — debrief

Progressive hints and assessment criteria sit alongside as reference, consulted
during the 55 minutes rather than budgeted separately.

---

## 5. The teaching idea

The course has one organising principle, and the design system is built on it:

> **Every statement in defensive work is one of six kinds, and knowing which one you
> are making is the discipline.**

| Kind | Glyph | Means |
|---|---|---|
| Observation | `[=]` | Something a source literally recorded |
| Hypothesis | `<?>` | A proposed explanation, not yet supported |
| Confirmed | `(/)` | Corroborated by two or more independent sources |
| Uncertain | `[~]` | A known unknown, stated out loud |
| Response | `>>` | An action a human decided to take |
| Adversary | `/!\` | What the attacker did |

This vocabulary appears everywhere: annotated evidence lines, timeline events,
interaction feedback, and the "this establishes / this does not establish" pair that
closes every evidence block. It is what turns the brief's six blue-team reasoning
questions from a list into a habit students practise in every session.

It also solves an accessibility requirement directly. Each kind carries a colour,
a shape, a glyph and a word, so none of the meaning depends on colour perception.

---

## 6. Signature interactions

Six, each teaching one specific thing. All use labelled synthetic data.

1. **Triage Console** (S1, S3) — Work a queue of alerts. Decision controls stay
   locked until every context check is run, because deciding before checking is the
   habit being broken. Feedback explains every option, not just the chosen one.
   *Teaches: the same event is a false positive for one account and a critical
   incident for another; baseline decides, never the severity colour.*

2. **Log Investigation** (S2) — Find the attack chain hidden in a realistic log
   window. Scores precision and recall separately, so flagging everything produces
   perfect recall and visibly terrible precision.
   *Teaches: attack evidence is found by looking for broken relationships, not for
   lines that look sinister.*

3. **Timeline Reconstruction** (S5) — Order shuffled evidence fragments across
   telemetry lanes, then see the detection opportunities that passed. Ordering uses
   buttons rather than drag-and-drop, which is unreachable by keyboard and hostile
   on touch.
   *Teaches: a timeline is assembled from independent partial sources, and the gaps
   between lanes are where the attacker operated.*

4. **Beacon Analyzer** (S7) — Move a jitter control and watch the timing
   distribution against real user traffic. At 50% jitter the beacon still clusters
   at sd/mean 0.28 while user traffic sits at 1.97.
   *Teaches: beaconing is statistical regularity; jitter raises the detection
   threshold without removing the signal.*

5. **Rule Builder** (S4) — Combine conditions against a labelled corpus and watch
   precision and recall move in opposite directions. The verdict changes as the rule
   becomes too noisy, too narrow, or deployable.
   *Teaches: tuning is a trade, not an improvement — every exclusion opens a path.*

6. **Coverage Map** (S4, S9) — An ATT&CK heatmap read as a prioritisation tool.
   Covered and uncovered use fill pattern and glyph as well as colour, so the map
   survives a monochrome print.
   *Teaches: the honest reading of a coverage map is never a percentage.*

---

## 7. Content integrity

The brief requires source-derived content to be distinguishable from supplementary
additions. Every block carries a provenance marker, surfaced in study mode:

- **From source** — derived from the supplied files, with the section cited
- **Supplementary** — added as teaching scaffolding; technical claims verified
  against primary vendor or project documentation, linked in the session recap
- **Synthetic data** — fabricated, labelled inline wherever it appears

All logs, alerts, addresses, domains, hashes and host names are synthetic. Addresses
are defanged (`hxxp://`) in report-facing content. MITRE technique identifiers are
reproduced as written in the source, with a standing instruction to confirm against
`attack.mitre.org` before quoting them, because MITRE revises and deprecates
techniques between framework versions.

**Instructor answer keys, full investigation walkthroughs and solution files are not
in this bundle.** Hiding them behind an interface control would not make them
private — anything shipped to a browser is readable. They are distributed
separately. What ships here is student-facing material only.

---

## 8. Practical workshop design

Every practical is feasible in 90 minutes and self-contained. None requires a SIEM,
an EDR console, a remote lab or any infrastructure.

Where a real exercise would need tooling that cannot be shipped, the workshop says
so explicitly in its **realism** statement and explains what is being assessed
instead. For example, Session 5 assesses incident sequencing and chain-of-custody
documentation rather than FTK Imager operation, on the stated grounds that tool
operation is a half-day of supervised practice while decision sequencing under
incomplete information is what actually fails in real incidents.

Each workshop provides: scenario, objectives, requirements, setup, scoped tasks with
timings, expected deliverables, a submission folder structure, progressive hints,
weighted assessment criteria, and debrief questions with a landing point.

---

## 9. Accessibility

- Semantic landmarks, one `h1` per view, skip link, live region for slide changes
- Visible focus ring everywhere; never removed
- Full keyboard operation, including presentation mode
- Presentation shortcuts suspend while typing or inside a control, so a knowledge
  check never advances the deck
- Reduced motion collapses durations rather than disabling transitions
- Colour is never the sole carrier: shape, glyph and word accompany every state
- Measured contrast on the dark ground: body 19.97:1, secondary 9.31:1, eyebrow
  7.22:1, mono labels 5.22:1 — all above WCAG AA
- Every diagram carries a text alternative that is both the accessible description
  and a visible, expandable one
- 44px minimum touch targets throughout on touch viewports
- Logs and code wrap or scroll in a labelled container rather than clipping

## 10. Data and privacy

No accounts, no server, no analytics, no network calls after load.

Progress is stored in `localStorage`, on one device in one browser. The interface
states this in plain language wherever progress is shown, and handles storage being
unavailable — private browsing, blocked site data — by saying so and continuing to
work. Knowledge check and interaction answers are held in memory for the current
page only and are never persisted.
