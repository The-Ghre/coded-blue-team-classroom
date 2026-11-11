# Session 5 — Chain of custody forms and post-incident report template

> **SYNTHETIC TEACHING DATA — CODED Blue Team Classroom**
> Every host, account, address, domain and hash below is fabricated for this
> workshop. No real environment produced this data. Do not visit any address or
> domain shown. Addresses are written defanged (hxxp://, 185[.]220[.]101[.]45)
> where they would otherwise be clickable.
>
> A custody gap, even a brief and innocent one, is the gap an opposing expert will ask about.

## Decision log

Every classification, capture and containment decision, with the real clock
time at which you made it. **The sequence is 30% of the assessment.**

| Real time | Decision | Reason | What this would have changed if done later |
|---|---|---|---|
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |

---

## Severity reassessment record

| Time | Level | What triggered the change |
|---|---|---|
| | P | Initial classification |
| | P | |
| | P | |

---

## Chain of custody — one form per item

```
CASE NUMBER     :
ITEM            :                     (identify the physical item, not its role)
COLLECTED BY    :                     (a named person — custody attaches to individuals)
DATE/TIME (UTC) :                     (UTC always; note clock skew separately)
CLOCK SKEW      :                     (system clock vs actual, at collection)
METHOD          :                     (tool AND version)
WRITE BLOCKER   :                     (make/model, or N/A with reason)
HASH (SOURCE)   : sha256
HASH (IMAGE)    : sha256
MATCH?          : ☐ yes  ☐ no -> STOP, document, escalate
STORAGE         :
ACCESS LOG      : ☐ attached

SUBSEQUENT ACCESS
  Date/time     Who            Purpose                 Hash verified?
  ------------  -------------  ----------------------  --------------
```

*(Duplicate this block for every item you collect.)*

---

## Forensic timeline

| Time | Fragment | Host | Source | Confidence | Notes |
|---|---|---|---|---|---|
| | | | | obs/hyp/confirmed | |

**Anti-forensic activity identified:**

| What | When | What survived it |
|---|---|---|
| | | |

**Detection opportunities that passed with no alert:**

| Time | What was detectable | Lead time gained if detected |
|---|---|---|
| | | |

---

## Post-incident report

### Executive summary
*Three to five plain-language sentences.*

>

### Root cause
*One specific thing. "Phishing" is a category, not a root cause.*

>

### Evidence and custody position
*Including anything you could not verify.*

>

### Response actions
>

### Recommendations
*Three. Each naming the technique it covers and what it would NOT catch.*

1.
2.
3.

### The question every report must answer

> *If this exact attack happened again tomorrow, would we detect it in the
> first ten minutes?*

**Answer, honestly:**

>

