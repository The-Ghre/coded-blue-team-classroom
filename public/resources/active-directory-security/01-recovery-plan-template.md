# Session 10 — Recovery plan template

> **SYNTHETIC TEACHING DATA — CODED Blue Team Classroom**
> Every host, account, address, domain and hash below is fabricated for this
> workshop. No real environment produced this data. Do not visit any address or
> domain shown. Addresses are written defanged (hxxp://, 185[.]220[.]101[.]45)
> where they would otherwise be clickable.
>
> A step with no verification is a hope. Every step needs one.

## Confirmed finding and scope

**Finding:**

>

**Scope statement** — name explicitly what must now be presumed compromised,
and why a password reset alone is insufficient:

>

**Directory Service Object Access auditing status at the time:**

>

---

## Escalation chain, reconstructed

| Time | Event ID | Host | Technique | ATT&CK ID |
|---|---|---|---|---|
| | | | | |

**How the original credential was obtained** *(this happens before the first
domain event — look at the first source workstation)*:

>

---

## Persistence inventory

| Mechanism | Location | Event ID | Removed by a password reset? |
|---|---|---|---|
| | | | ☐ yes ☐ no |
| | | | ☐ yes ☐ no |
| | | | ☐ yes ☐ no |
| | | | ☐ yes ☐ no |

**Which of these would survive a thorough but conventional response?**

>

---

## Recovery plan

Sequenced. Dependencies stated. Every step verified.

| # | Action | Depends on | How you verify it succeeded |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |
| 7 | | | |
| 8 | | | |
| 9 | | | |
| 10 | | | |

### The KRBTGT procedure — six steps, not two

| # | Step | Verification | Done |
|---|---|---|---|
| 1 | Confirm all DCs online and replicating | `repadmin /showrepl` — all success, 0 failures | ☐ |
| 2 | Reset KRBTGT password (first) | | ☐ |
| 3 | Wait for replication, then **verify** | | ☐ |
| 4 | Reset KRBTGT password (second) | | ☐ |
| 5 | Wait for replication, then **verify** | | ☐ |
| 6 | Coordinate helpdesk for domain-wide re-authentication | | ☐ |

**Why twice, in your own words:**

>

**What happens if you skip the verification between resets:**

>

---

## Detection gap analysis, ordered by lead time

| # | Stage | Rule existed? | Fired? | Lead time it would have given |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |

**The single highest-value rule to deploy tomorrow:**

| Field | Value |
|---|---|
| Data source | |
| Condition | |
| Lead time it would have given | |

---

## The ten-minute question

> If this happened again tomorrow, would you detect it in the first ten
> minutes?

**Answer, honestly:**

>

