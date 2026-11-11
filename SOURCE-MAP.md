# SOURCE MAP

Traceability between the supplied CODED Defensive track files and this course.

A live version of this mapping, generated from the content itself, is on the
**About this course** page of the application.

---

## 1. File → session

Ten files were supplied. Each became one session, preserving the sequence the files
themselves establish.

| Source file | Session | Track |
|---|---|---|
| `defensive_day_1_soc_operations_esl.md` | 01 · The SOC: Detection, Triage and Response | Core |
| `defensive_day_2_log_analysis_esl.md` | 02 · Log Analysis: Reading the Raw Evidence | Core |
| `defensive_day_3_phishing_investigation_esl.md` | 03 · Phishing Investigation | Core |
| `defensive_day_4_detection_engineering_esl.md` | 04 · Detection Engineering | Core |
| `defensive_day_5_incident_response_and_evidence_esl.md` | 05 · Incident Response and Digital Evidence | Core |
| `defensive_day_6_host_forensics_esl.md` | 06 · Host Forensics: Windows and Linux | Core |
| `defensive_day_7_network_memory_forensics_esl.md` | 07 · Network and Memory Forensics | Core |
| `defensive_day_8_malware_analysis_esl.md` | 08 · Malware Analysis | Core |
| `defensive_day_9_threat_hunting_esl (OPTIONAL).md` | 09 · Threat Hunting | Extension |
| `defensive_day_10_active_directory_security_esl (OPTIONAL).md` | 10 · Active Directory Security | Extension |

All ten files were read in full. None was inaccessible.

---

## 2. How the sequence was determined

The files share an identical thirteen-section structure and each opens with a
*Yesterday → Today → Tomorrow* table.

**The backward-pointing "Yesterday" chain is internally consistent across all ten
files and agrees with the file numbering.** Day 2 looks back to the SOC, Day 3 to
log analysis, Day 5 to detection engineering, and so on without a break. That chain
is what this course follows.

**The forward-pointing "Tomorrow" entries do not agree with it.** Day 1, Day 2 and
Day 4 each name threat hunting as the next day, but the files that follow them are
log analysis, phishing investigation and incident response respectively. These
forward references appear to survive from an earlier ordering of the material. They
are recorded in each affected session's source notes rather than silently corrected.

---

## 3. Section mapping

The thirteen sections of each source file map consistently onto the course:

| Source section | Becomes |
|---|---|
| 1 · Opening Context | Session abstract and the *Yesterday* material in retrieval questions |
| 2 · Introduction | Opening scenario and the session's driving question |
| 3 · Why This Matters | Red/blue view panes on the relevant concept blocks |
| 4 · Core Concepts (4.1–4.7) | `concept` and `compare` blocks — the 25-minute concept segment |
| 5 · Attack Chain | `chain` blocks, and the attack-side rows of timelines |
| 6 · Reporting Mindset | Workshop deliverables and the finding format used in every practical |
| 7 · Scenario Walkthrough | The instructor demonstration (`evidence` blocks) and interaction data |
| 8 · Defender's View | Blue view panes, assessment criteria, debrief landing points |
| 9 · Tools / Workflow | Workshop task structure and submission folder layouts |
| 10 · AI Integration | Study-mode `detail` on the relevant concepts |
| 11 · Discussion Prompts | Debrief questions and workshop scenarios |
| 12 · Actionable Takeaways | Pre-practical recap |
| 13 · Summary | End-of-session recap |

Every block in the application carries a `sources` array citing the specific section
it derives from. These are rendered in study mode under each section.

---

## 4. Provenance marking

Three states, visible in the interface:

| Marker | Meaning |
|---|---|
| **From source** | Derived from the supplied files. The section is cited. |
| **Supplementary** | Added by this course as teaching scaffolding. Technical claims beyond the source are verified against primary vendor or project documentation, linked in the session recap. |
| **Synthetic data** | Fabricated for teaching. Labelled inline wherever it appears. |

---

## 5. What the source material does not contain

These are recorded rather than quietly worked around. All six are also shown on the
application's **About this course** page.

### 5.1 The Foundation track is referenced but was not supplied

Every file assumes a prior Foundation series covering attacker technique — the Kill
Chain, lateral movement, credential theft, persistence, web application attacks, DNS
and file analysis. Specific references appear to Foundation Days 1, 4, 5, 6, 7, 8
and 9.

Those files were not in the supplied folder.

**Handled by:** each session lists the specific prerequisites it depends on, rather
than assuming that knowledge silently. Session 1's retrieval questions surface the
four Foundation facts the course actually needs, with model answers, so a cohort
arriving without that track can still start.

### 5.2 Forward references contradict the file order

See section 2. **Handled by:** following the consistent backward chain, with the
discrepancy noted in the source notes of each affected session.

### 5.3 Day 2 and Day 4 overlap on detection engineering

Day 2 is titled "Log Analysis and Detection Engineering" and its section 8
introduces detection query writing. Day 4 covers the discipline in full.

**Handled by:** Session 2 treats query writing as the bridge it is — enough to read
and modify a query — and leaves rule design, tuning cycles, Sigma and coverage
mapping to Session 4. No content was dropped; the overlap exists in the source.

### 5.4 Day 10 points to a session that does not exist

The final file ends by naming threat intelligence as the following day. No such file
was supplied.

**Handled by:** the course ends at Session 10. The dangling reference is recorded in
Session 10's source notes and on the About page, because it indicates the supplied
set is a subset of a longer intended track.

### 5.5 No dates appear anywhere

The files contain no cohort dates, no schedule and no calendar. The dates that do
appear — 14 March 2026 and similar — are inside synthetic incident scenarios, not
delivery dates.

**Handled by:** sessions are numbered and durations stated. No dates are assigned.

### 5.6 There are no practical exercises in the source

All ten files are theory documents with discussion prompts, scenario walkthroughs
and tool workflows. They contain no student tasks, no lab infrastructure, no
datasets and no assessment criteria.

**Handled by:** every practical in this course was written for it, built from the
source material's own scenarios, workflows and reporting templates. All are
self-contained, use labelled synthetic data, and require no SIEM, EDR console or
remote lab. Each briefing states explicitly what is simulated and what would differ
with real tooling.

---

## 6. Technical additions beyond the source

Where this course states something the source does not, it was checked against
primary documentation. The main ones, with the authority each was checked against:

| Addition | Verified against |
|---|---|
| Windows Event ID field semantics, logon types, status codes | Microsoft Windows security auditing reference |
| Sysmon event IDs and configuration behaviour | Microsoft Sysinternals Sysmon documentation |
| Sigma rule structure, modifiers, condition syntax | SigmaHQ specification |
| Order of volatility | RFC 3227 |
| Incident response phase model | NIST SP 800-61r2 |
| SPF / DKIM / DMARC semantics | RFC 7208, RFC 6376, RFC 7489 |
| Volatility plugin behaviour | Volatility Foundation documentation |
| ATT&CK technique identifiers | attack.mitre.org |

Each session's recap links the relevant primary sources, so a student can check any
claim against its authority rather than against this course.

**Standing caveat on ATT&CK:** technique identifiers are reproduced as written in
the source material. MITRE revises, renames and deprecates techniques between
framework versions. The application states this where techniques are introduced and
on the About page.
