# Session 5 — Incident pack

> **SYNTHETIC TEACHING DATA — CODED Blue Team Classroom**
> Every host, account, address, domain and hash below is fabricated for this
> workshop. No real environment produced this data. Do not visit any address or
> domain shown. Addresses are written defanged (hxxp://, 185[.]220[.]101[.]45)
> where they would otherwise be clickable.
>
> Initial alert plus five timed injects. DO NOT read ahead — open each inject only when the clock reaches it.

## Initial alert — T+0

```
09:00:12  SIEM ALERT  P3
Rule     : EXEC-002 · Encoded PowerShell Command
Host     : FINANCE-PC-04
User     : jsmith
Detail   : EXCEL.EXE -> powershell.exe -enc SQBFAFgAIAAoAE4AZQB3...

Supporting evidence attached:
  - Sysmon Event ID 1 at 08:47:09, parent EXCEL.EXE
  - Sysmon Event ID 3 at 08:48:31, outbound to 91[.]92[.]251[.]103:443
  - Sysmon Event ID 11 at 08:48:44, C:\Users\Public\stage2.exe created
  - Security Event ID 4698 at 08:52:40, task "AdobeUpdateSvc" created
  - Browser download artefact at 08:46:55, Q3_Update.xlsm
```

The machine is running. The user is at their desk. Your shift clock starts now.

---

<details>
<summary><strong>INJECT 1 — open at T+10 minutes</strong></summary>

```
09:11:47  EDR CROSS-MACHINE QUERY RESULT
Two further hosts have contacted 91[.]92[.]251[.]103 in the last hour:
  FINANCE-PC-11   first contact 08:58:02
  FINANCE-PC-07   first contact 09:04:19

Both are running. Both have the same scheduled task present.
```

</details>

---

<details>
<summary><strong>INJECT 2 — open at T+20 minutes</strong></summary>

```
09:21:30  SERVICE OWNER, BY PHONE
"FINANCE-PC-04 is the month-end close machine. We need it back in forty
minutes or we miss the reporting deadline. Can you just reboot it?"
```

</details>

---

<details>
<summary><strong>INJECT 3 — open at T+30 minutes</strong></summary>

```
09:31:08  SIEM
Event ID 4624 on FILESERVER-02, LogonType 3, AuthPkg NTLM,
source FINANCE-PC-11, account svc_finance.

Event ID 4663 on FILESERVER-02: 2,847 file read events in 4 minutes,
path \\FILESERVER-02\Finance\Payroll\
```

</details>

---

<details>
<summary><strong>INJECT 4 — open at T+40 minutes</strong></summary>

```
09:41:55  SIEM
Event ID 1102 on FINANCE-PC-11: the Security log was cleared.
SubjectUserName: svc_finance

Note: events from this host up to 09:41:50 were already forwarded to the
SIEM and are intact.
```

</details>

---

<details>
<summary><strong>INJECT 5 — open at T+50 minutes</strong></summary>

```
09:52:14  LEGAL COUNSEL, BY EMAIL
"If payroll data was accessed we have a 72-hour regulatory notification
clock. I need to know, today, whether personal data left the environment.
What can you tell me and when?"
```

</details>

---

## Evidence inventory — what is available to collect

```
FINANCE-PC-04   running, EDR healthy, 16 GB RAM, 512 GB NVMe
FINANCE-PC-11   running, EDR healthy, 16 GB RAM, 512 GB NVMe
FINANCE-PC-07   running, EDR healthy, 16 GB RAM, 512 GB NVMe
FILESERVER-02   running, no EDR agent, Windows Event Log forwarding only

Available tooling (pre-deployed, tested):
  Magnet RAM Capture      memory acquisition
  FTK Imager + Tableau    disk imaging, hardware write blocker
  EDR console             network isolation, process termination
  SIEM                    log export for a given window
```

---

## Artefact fragments for the timeline (task T3)

These are out of order on purpose.

```
[A] Prefetch: STAGE2.EXE-7F2A41C8.pf, run count 3, last run 09:30:41
[B] Security 4698: task "AdobeUpdateSvc" -> C:\Users\Public\stage2.exe, 08:52:40
[C] Browser download artefact: Q3_Update.xlsm from hxxps://filedrop-eu[.]net, 08:46:55
[D] Sysmon 3: stage2.exe -> 91[.]92[.]251[.]103:443, repeating every 240s from 08:49:02
[E] Security 1102: Security log cleared on FINANCE-PC-11, 09:41:50
[F] Sysmon 1: EXCEL.EXE -> powershell.exe -enc, 08:47:09
[G] Security 4663: 2,847 file reads on \\FILESERVER-02\Finance\Payroll\, 09:31:12
[H] Sysmon 11: C:\Users\Public\stage2.exe written, 08:48:44
[I] Security 4624 LogonType 3 NTLM, FINANCE-PC-11 -> FILESERVER-02, 09:31:08
[J] Sysmon 10: stage2.exe opened handle to lsass.exe, GrantedAccess 0x1410, 08:55:17
[K] SRUM: stage2.exe, 1,284,221,440 bytes sent, window 09:32-09:40
[L] Sysmon 1: EXCEL.EXE spawned on FINANCE-PC-11 at 08:57:44 (same document name)
```

