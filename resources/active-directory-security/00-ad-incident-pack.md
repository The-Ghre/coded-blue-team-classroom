# Session 10 — Active Directory incident pack

> **SYNTHETIC TEACHING DATA — CODED Blue Team Classroom**
> Every host, account, address, domain and hash below is fabricated for this
> workshop. No real environment produced this data. Do not visit any address or
> domain shown. Addresses are written defanged (hxxp://, 185[.]220[.]101[.]45)
> where they would otherwise be clickable.
>
> Two workstations appear in this pack. Both matter. Read the detection rule inventory early.

## The alert

```
04:07:12  SIEM ALERT  P1
Rule   : AD-DCSYNC-001 · Unexpected directory replication activity
Detail : Event ID 4662, SubjectUserName=jsmith, source WORKSTATION-22,
         Properties contains 1131f6aa and 1131f6ad
Note   : WORKSTATION-22 is not a domain controller. The SIEM source field
         is correlated from4624 on the recording DC, not native4662 data.
```

---

## 1. Windows Security events (domain controllers + workstations, 11 March)

```
TIME      EVENT  HOST             DETAIL
------    -----  ---------------  ------------------------------------------------------
17:02:11  4624   WORKSTATION-14   LogonType=2  user=jsmith  AuthPkg=Kerberos   (10 Mar)
01:48:30  4688   WORKSTATION-14   user=jsmith  Image=rundll32.exe
                                  CommandLine=rundll32.exe C:\Windows\System32\comsvcs.dll,
                                  MiniDump 684 C:\Users\Public\l.bin full
01:48:31  4673   WORKSTATION-14   user=jsmith  Privilege=SeDebugPrivilege  Service=LSASS
02:00:04  4624   FILESERVER-01    LogonType=3  user=svc_backup  AuthPkg=NTLM
                                  source=WORKSTATION-14
02:04:19  4624   FILESERVER-02    LogonType=3  user=svc_backup  AuthPkg=NTLM
                                  source=WORKSTATION-14
02:08:44  4624   DC-01            LogonType=3  user=svc_backup  AuthPkg=NTLM
                                  source=WORKSTATION-14
02:12:30  4624   WORKSTATION-22   LogonType=3  user=svc_backup  AuthPkg=NTLM
                                  source=WORKSTATION-14
02:14:02  5140   FILESERVER-01    ShareName=\\*\ADMIN$  user=svc_backup
                                  source=WORKSTATION-14
03:12:55  4769   DC-01            user=svc_backup  ServiceName=svc_sql
                                  TicketEncryptionType=0x17
03:18:40  4728   DC-01            GroupName="Domain Admins"  MemberAdded=svc_backup
                                  SubjectUserName=svc_backup
03:52:18  4698   DC-01            TaskName=\WindowsUpdateHelper
                                  TaskContent=C:\Windows\Temp\wuh.exe
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
```

---

## 2. Group membership change log (30 days)

```
DATE        TIME      GROUP                 MEMBER ADDED    BY              CHANGE TICKET
2026-02-18  10:04:22  Backup Operators      svc_backup      admin.rashid    CHG-11204
2026-03-11  03:18:40  Domain Admins         svc_backup      svc_backup      (none)
```

---

## 3. Scheduled task inventory — domain controllers

```
HOST    TASK NAME                        ACTION                               CREATED
DC-01   \Microsoft\Windows\...\SyncTime   %windir%\system32\sc.exe             (built-in)
DC-01   \CorpBackupPreflight             D:\Scripts\preflight.ps1             2025-06-02
DC-01   \WindowsUpdateHelper             C:\Windows\Temp\wuh.exe              2026-03-11
DC-02   \Microsoft\Windows\...\SyncTime   %windir%\system32\sc.exe             (built-in)
DC-02   \CorpBackupPreflight             D:\Scripts\preflight.ps1             2025-06-02
DC-03   \Microsoft\Windows\...\SyncTime   %windir%\system32\sc.exe             (built-in)
DC-03   \CorpBackupPreflight             D:\Scripts\preflight.ps1             2025-06-02
```

---

## 4. Detection rule inventory (AD-relevant rules only)

```csv
rule_id,title,event_id,status,fired_this_incident
AD-DCSYNC-001,Unexpected directory replication activity,4662,stable,YES
AD-GRP-002,Privileged group membership change,4728/4732/4756,stable,NO (disabled 2026-01-12 for noise)
AD-NTLM-003,NTLM network logon from non-admin source,4624,not deployed,NO
AD-KRB-004,RC4 service ticket for non-computer account,4769,not deployed,NO
AD-DSRM-005,DSRM password change,4794,not deployed,NO
AD-SDH-006,AdminSDHolder modification,5136,not deployed,NO
AD-SMB-007,Admin share access from non-admin source,5140,not deployed,NO
CRED-009,LSASS process access from non-system process,4673/Sysmon 10,stable,NO (Sysmon not deployed on WORKSTATION-14)
```

> One rule fired. One was disabled for noise three months ago. Six were never
> deployed. One could not fire because its data source is absent on the host
> where it mattered. Task T5 is ordering these by the lead time each would
> have given.

---

## 5. Domain controller replication status

```
$ repadmin /showrepl /csv  (abridged)

Source DC   Dest DC   Last success         Consecutive failures
DC-01       DC-02     2026-03-11 04:45:02  0
DC-01       DC-03     2026-03-11 04:45:08  0
DC-02       DC-01     2026-03-11 04:44:51  0
DC-02       DC-03     2026-03-11 04:45:11  0
DC-03       DC-01     2026-03-11 04:44:58  0
DC-03       DC-02     2026-03-11 04:45:04  0

All replication healthy.
```

