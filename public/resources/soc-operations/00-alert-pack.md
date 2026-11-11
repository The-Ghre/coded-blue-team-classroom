# Session 1 — Alert pack: one night on the Tier 1 queue

> **SYNTHETIC TEACHING DATA — CODED Blue Team Classroom**
> Every host, account, address, domain and hash below is fabricated for this
> workshop. No real environment produced this data. Do not visit any address or
> domain shown. Addresses are written defanged (hxxp://, 185[.]220[.]101[.]45)
> where they would otherwise be clickable.
>
> Eight alerts, 23:00 to 06:00. Two of them are related. Read all eight before deciding anything.

## How to use this pack

Each alert gives you the detection and the context you are allowed to query.
In a real SOC you would run these lookups yourself against the SIEM, the asset
inventory, the threat intel feed and the change management system. Here they
are pre-answered, so the exercise is the judgement rather than the tooling.

Work through `01-triage-worksheet.md` as you go.

---

## ALR-2211 — 23:14

**Rule:** MAL-EXEC-012 · Macro-Enabled Attachment Executed
**Severity as assigned by the rule:** Medium

```
Host: FIN-WS-22 | User: m.alotaibi
EXCEL.EXE spawned powershell.exe with an encoded command at 23:14:08.

Context available to you:
  - Baseline: m.alotaibi is a finance analyst. No prior process-creation
    events involving powershell.exe under this account in 180 days.
  - Asset: FIN-WS-22 is a standard finance workstation, EDR agent healthy,
    last check-in 23:13:58.
  - Change management: no deployment scheduled.
  - Context window: at 23:16 a file was written to C:\Users\Public\svchost32.exe.
    At 23:17 a scheduled task named WindowsUpdate_Helper was created pointing
    at that file.
  - Mail gateway: an .xlsm attachment was delivered to this user at 23:11
    from an external sender.
```

---

## ALR-2212 — 23:48

**Rule:** AUTH-CORR-004 · Failed Logon Burst Followed By Success
**Severity as assigned by the rule:** High

```
Account: svc-dbadmin | Source: 185[.]220[.]101[.]45
3 x Event ID 4625 then 1 x 4624, LogonType 10 (RDP), within 87 seconds.
Session granted SeDebugPrivilege.

Context available to you:
  - Baseline: svc-dbadmin is a service account with 11 months of LogonType 5
    (service) events and zero prior interactive or remote-interactive logons.
  - Threat intel: 185[.]220[.]101[.]45 appears on the ingested Tor exit node
    feed, refreshed 40 minutes ago. No prior business traffic.
  - Asset: destination host DB-PRD-03. The EDR agent on this host last
    reported 9 days ago.
  - Context window: no endpoint telemetry returned for the destination host.
```

---

## ALR-2213 — 00:32

**Rule:** EXFIL-003 · Large Outbound Transfer
**Severity as assigned by the rule:** High

```
Host: BACKUP-SRV-01 | Destination: 52[.]96[.]0[.]0/16 | Volume: 412 GB

Context available to you:
  - Baseline: BACKUP-SRV-01 transfers between 380 GB and 450 GB to this
    destination range every night between 00:15 and 04:00.
  - Process attribution: veeam-agent.exe, running from its installed path.
  - Change management: nightly backup job BKP-NIGHTLY-02, recorded as started
    at 00:15.
  - Destination: the address range belongs to the organisation's contracted
    cloud backup provider and is on the documented allowlist.
  - Context window: nothing else notable on this host.
```

---

## ALR-2214 — 01:05

**Rule:** PERSIST-003 · Scheduled Task Created Outside Business Hours
**Severity as assigned by the rule:** Low

```
Host: FIN-WS-22 | User: m.alotaibi
Event ID 4698 at 01:05:12. Task name: WindowsUpdate_Helper.
Action: C:\Users\Public\svchost32.exe

Context available to you:
  - Baseline: no prior scheduled task creation by this account, ever.
  - Path: C:\Users\Public is world-writable. The genuine Windows binary is
    svchost.exe in System32; svchost32.exe does not exist in Windows.
  - Timing: 01:05. The user badged out at 17:40 the previous evening.
  - Change management: no patch deployment scheduled. The patch management
    system does not create tasks with this name.
  - Context window: see ALR-2211. Same host.
```

---

## ALR-2215 — 02:19

**Rule:** IDENT-007 · Impossible Travel
**Severity as assigned by the rule:** High

```
Account: a.hassan | Kuwait City 02:02 -> Frankfurt 02:19

Context available to you:
  - Baseline: a.hassan authenticates from Kuwait City on almost every working
    day. Frankfurt has appeared 14 times in 90 days, always in short bursts.
  - Source: the Frankfurt address belongs to a commercial VPN provider the
    organisation licenses and deploys to staff laptops.
  - Device: both authentications carry the same managed device identifier and
    the same compliant device posture.
  - Context window: no privilege changes, no unusual resource access, no
    denied MFA prompts.
```

---

## ALR-2216 — 03:41

**Rule:** EXEC-002 · Encoded PowerShell Command
**Severity as assigned by the rule:** Medium

```
Host: BUILD-AGENT-03 | User: svc_deploy
powershell.exe -enc JABzAD0A... | Parent: jenkins-agent.exe

Context available to you:
  - Baseline: svc_deploy runs encoded PowerShell on this host 40-60 times per
    day, every weekday, for the past 8 months.
  - Parent: jenkins-agent.exe, running from its installed path.
  - Change management: pipeline run #4471 recorded in the deployment log at
    03:40.
  - Context window: normal build activity. No outbound connections to
    unrecognised destinations.
```

---

## ALR-2217 — 04:52

**Rule:** CRED-009 · LSASS Process Access
**Severity as assigned by the rule:** High

```
Host: DB-PRD-03 | Source process: C:\Users\Public\dbg.exe
Sysmon Event ID 10, TargetImage lsass.exe, GrantedAccess 0x1410.

Context available to you:
  - Baseline: no process has accessed lsass.exe on this host outside the
    documented security product exclusions in 90 days.
  - Path: C:\Users\Public is world-writable. dbg.exe is not a known tool in
    the software inventory.
  - Access mask: 0x1410 is one of the masks associated with credential
    dumping tooling.
  - Context window: see ALR-2212. Same host, 5 hours later. The EDR agent on
    this host has not reported for 9 days, so this event reached the SIEM via
    the Windows Event Log forwarder only.
```

---

## ALR-2218 — 05:30

**Rule:** NET-014 · Port Scan Detected
**Severity as assigned by the rule:** Medium

```
Source: 10[.]0[.]12[.]40 | 1,400 connection attempts across 10[.]0[.]0[.]0/16

Context available to you:
  - Baseline: 10[.]0[.]12[.]40 is VULN-SCAN-01, the vulnerability management
    appliance.
  - Change management: authorised scan window is 05:00-07:00 on Wednesdays.
    Today is Wednesday.
  - Scan schedule: scan job VM-WEEKLY-INTERNAL recorded as started 05:29.
  - Context window: scan traffic only. No authentication attempts, no data
    transfer.
```

---

## A note on the severity field

The severity on each alert was set by whoever wrote the rule, before this
particular night existed. It is an input to your judgement, not a substitute
for it. At least one alert in this pack is rated lower than it deserves.

