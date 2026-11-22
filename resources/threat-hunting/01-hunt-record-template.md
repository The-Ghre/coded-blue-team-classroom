# Session 9 — Hunt record template

> **SYNTHETIC TEACHING DATA — CODED Blue Team Classroom**
> Every host, account, address, domain and hash below is fabricated for this
> workshop. No real environment produced this data. Do not visit any address or
> domain shown. Addresses are written defanged (hxxp://, 185[.]220[.]101[.]45)
> where they would otherwise be clickable.
>
> Complete one record per hypothesis, INCLUDING the refuted ones. A refuted record is the one with regulatory value.

# HUNT RECORD

> Complete the hypothesis section **before** you run a single query. Writing
> it afterwards invalidates every negative result and is visible in the
> record. It is 25% of the assessment.

---

## Hypothesis

> I believe **[behaviour]** may be occurring because **[reason]**, and I would
> expect to see **[evidence]** in **[data source]**.

**Filled in:**

>

| Component | Your answer |
|---|---|
| Behaviour (specific technique) | |
| Reason (what prompted this hunt) | |
| Expected evidence (event ID AND field) | |
| Data source | |
| **Is that data source actually available?** | ☐ verified present ☐ absent |

**What a confirmed result would look like:**

>

**What a refuted result would look like:**

>

---

## Metadata

| Field | Value |
|---|---|
| Hunt title | |
| Date | |
| Hunter | |
| MITRE technique | |
| Time range covered | |

---

## Queries run

### Query 1
```

```
**Result summary:**

>

### Query 2
```

```
**Result summary:**

>

---

## Eliminations

Known false positives you ruled out, and what ruled them out. Showing the
working here is worth more than the conclusion.

| Candidate | Why it is not a finding |
|---|---|
| | |

---

## Outcome

☐ **CONFIRMED** — escalate to IR, preserve evidence, write the detection rule
☐ **REFUTED** — document the query; this is a coverage confirmation
☐ **INCONCLUSIVE** — identify the missing data; raise a logging ticket

**Evidence:**

>

**Actions taken:**

>

**Detection rule created:** *(mandatory for every confirmed finding)*

>

**Known false positives for future hunters:**

>

**Notes for whoever runs this hunt next:**

>

---

## Chain check

If more than one hypothesis confirmed, do the findings share an account, a
host or a time window? Three related findings are one intrusion, not three
incidents.

| Time | Hypothesis | Finding | Shared element |
|---|---|---|---|
| | | | |

