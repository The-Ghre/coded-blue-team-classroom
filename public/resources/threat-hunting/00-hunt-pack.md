# Session 9 — Hunt pack

> **SYNTHETIC TEACHING DATA — CODED Blue Team Classroom**
> Every host, account, address, domain and hash below is fabricated for this
> workshop. No real environment produced this data. Do not visit any address or
> domain shown. Addresses are written defanged (hxxp://, 185[.]220[.]101[.]45)
> where they would otherwise be clickable.
>
> Thirty days of VPN, Sysmon and Windows Security events, plus the environment baseline. Write your hypotheses BEFORE opening the data.

## Environment baseline — read this first

```
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
```

---

## Data source 1 — VPN authentication (30 days, abridged)

```
DATE       TIME      USER           SOURCE                 COUNTRY  RESULT
2026-03-01 07:51:39  m.alotaibi     94[.]203[.]14[.]40  KW  SUCCESS
2026-03-02 09:32:07  r.alenezi      94[.]203[.]10[.]108  KW  SUCCESS
2026-03-02 15:43:52  m.alotaibi     94[.]203[.]13[.]33  KW  SUCCESS
2026-03-03 08:57:59  a.hassan       94[.]203[.]13[.]211  KW  SUCCESS
2026-03-03 10:47:31  s.alqattan     94[.]203[.]12[.]237  KW  SUCCESS
2026-03-03 12:41:49  a.hassan       94[.]203[.]12[.]204  KW  SUCCESS
2026-03-03 14:29:14  m.alotaibi     94[.]203[.]13[.]177  KW  SUCCESS
2026-03-03 17:47:59  a.hassan       94[.]203[.]11[.]240  KW  SUCCESS
2026-03-04 07:25:52  s.alqattan     94[.]203[.]12[.]183  KW  SUCCESS
2026-03-04 13:37:41  a.hassan       94[.]203[.]13[.]140  KW  SUCCESS
2026-03-04 14:06:29  n.aldosari     94[.]203[.]12[.]223  KW  SUCCESS
2026-03-04 16:16:23  m.alotaibi     94[.]203[.]12[.]132  KW  SUCCESS
2026-03-04 20:15:34  s.alqattan     94[.]203[.]10[.]98  KW  SUCCESS
2026-03-05 08:59:50  m.alotaibi     94[.]203[.]13[.]204  KW  SUCCESS
2026-03-05 19:58:31  m.alotaibi     94[.]203[.]12[.]22  KW  SUCCESS
2026-03-06 11:20:24  r.alenezi      94[.]203[.]10[.]192  KW  SUCCESS
2026-03-07 07:56:50  r.alenezi      94[.]203[.]12[.]64  KW  SUCCESS
2026-03-07 08:44:24  s.alqattan     94[.]203[.]11[.]136  KW  SUCCESS
2026-03-07 10:15:05  r.alenezi      94[.]203[.]14[.]49  KW  SUCCESS
2026-03-07 11:36:02  s.alqattan     94[.]203[.]12[.]141  KW  SUCCESS
2026-03-07 18:02:57  a.hassan       94[.]203[.]10[.]224  KW  SUCCESS
2026-03-08 08:55:50  f.alsalem      94[.]203[.]10[.]232  KW  SUCCESS
2026-03-08 09:12:03  jsmith         94[.]203[.]12[.]88     KW  SUCCESS
2026-03-08 09:39:30  s.alqattan     94[.]203[.]11[.]198  KW  SUCCESS
2026-03-08 10:40:55  s.alqattan     94[.]203[.]13[.]146  KW  SUCCESS
2026-03-08 11:26:57  y.almutairi    94[.]203[.]11[.]108  KW  SUCCESS
2026-03-08 16:46:02  r.alenezi      94[.]203[.]10[.]242  KW  SUCCESS
2026-03-08 17:57:55  a.hassan       94[.]203[.]13[.]62  KW  SUCCESS
2026-03-09 08:20:45  r.alenezi      94[.]203[.]10[.]205  KW  SUCCESS
2026-03-09 08:41:55  jsmith         94[.]203[.]12[.]88     KW  SUCCESS
2026-03-09 11:28:42  y.almutairi    94[.]203[.]12[.]48  KW  SUCCESS
2026-03-09 20:14:36  a.hassan       94[.]203[.]14[.]65  KW  SUCCESS
2026-03-09 20:32:35  f.alsalem      94[.]203[.]14[.]144  KW  SUCCESS
2026-03-10 06:22:02  s.alqattan     94[.]203[.]10[.]115  KW  SUCCESS
2026-03-10 08:44:31  a.hassan       94[.]203[.]11[.]40  KW  SUCCESS
2026-03-10 09:02:11  jsmith         94[.]203[.]12[.]88     KW  SUCCESS
2026-03-10 09:48:14  s.alqattan     94[.]203[.]13[.]83  KW  SUCCESS
2026-03-10 10:07:05  r.alenezi      94[.]203[.]11[.]93  KW  SUCCESS
2026-03-11 02:04:17  jsmith         86[.]120[.]44[.]19     RO  SUCCESS
2026-03-11 07:48:38  y.almutairi    94[.]203[.]14[.]219  KW  SUCCESS
2026-03-11 13:22:50  y.almutairi    94[.]203[.]13[.]24  KW  SUCCESS
2026-03-11 20:11:51  n.aldosari     94[.]203[.]11[.]43  KW  SUCCESS
2026-03-12 10:22:57  a.hassan       94[.]203[.]12[.]106  KW  SUCCESS
2026-03-12 11:53:41  r.alenezi      94[.]203[.]13[.]239  KW  SUCCESS
2026-03-12 14:09:30  n.aldosari     94[.]203[.]12[.]24  KW  SUCCESS
2026-03-12 17:34:04  f.alsalem      94[.]203[.]14[.]212  KW  SUCCESS
2026-03-12 19:19:13  y.almutairi    94[.]203[.]11[.]130  KW  SUCCESS
2026-03-13 08:55:38  a.hassan       94[.]203[.]14[.]123  KW  SUCCESS
2026-03-13 10:17:12  f.alsalem      94[.]203[.]10[.]118  KW  SUCCESS
2026-03-13 11:09:21  a.hassan       94[.]203[.]14[.]23  KW  SUCCESS
2026-03-13 13:28:40  n.aldosari     94[.]203[.]11[.]221  KW  SUCCESS
2026-03-13 18:05:57  s.alqattan     94[.]203[.]13[.]160  KW  SUCCESS
2026-03-14 06:51:52  n.aldosari     94[.]203[.]12[.]176  KW  SUCCESS
2026-03-14 07:06:40  y.almutairi    94[.]203[.]13[.]101  KW  SUCCESS
2026-03-14 07:31:50  s.alqattan     94[.]203[.]11[.]62  KW  SUCCESS
2026-03-14 10:51:22  y.almutairi    94[.]203[.]10[.]249  KW  SUCCESS
2026-03-14 11:11:14  m.alotaibi     94[.]203[.]14[.]233  KW  SUCCESS
2026-03-14 13:58:15  m.alotaibi     94[.]203[.]10[.]100  KW  SUCCESS
2026-03-14 17:19:45  s.alqattan     94[.]203[.]12[.]5  KW  SUCCESS
2026-03-15 07:47:25  m.alotaibi     94[.]203[.]11[.]27  KW  SUCCESS
... (further entries omitted for length) ...
```

---

## Data source 2 — Sysmon Event ID 1, filtered to WmiPrvSE.exe as parent (30 days)

```
DATE       TIME      HOST             USER       IMAGE                    COMMANDLINE
2026-02-14 11:02:44  WS-0188          SYSTEM     msiexec.exe              msiexec /i package.msi /quiet
2026-02-19 14:33:12  WS-0221          SYSTEM     CompatTelRunner.exe      -m:appraiser.dll
2026-02-26 09:14:08  WS-0045          SYSTEM     msiexec.exe              msiexec /i update.msi /quiet
2026-03-02 16:21:55  WS-0311          SYSTEM     svchost.exe              -k netsvcs
2026-03-11 02:14:33  FILESERVER-01    jsmith     cmd.exe                  cmd.exe /c "net group \"Domain Admins\" /domain"
2026-03-11 02:14:41  FILESERVER-01    jsmith     powershell.exe           powershell -nop -w hidden -enc SQBFAFgA...
2026-03-11 02:18:02  FILESERVER-01    jsmith     cmd.exe                  cmd.exe /c "whoami /priv"
2026-03-14 10:08:19  WS-0092          SYSTEM     msiexec.exe              msiexec /i hotfix.msi /quiet
```

---

## Data source 3 — Windows Security Event ID 4662 (30 days, replication properties only)

The source-host column is pre-correlated enrichment from matching logon IDs in Event ID4624 on the same recording DC. It is not a native4662 field. Validate source roles and authorised replication services; do not exclude accounts solely because their names end in$.

```
DATE       TIME      LOGGING DC  SUBJECT USER  SOURCE HOST      PROPERTIES
2026-02-20 03:00:14  DC-02       DC-01$        DC-01            1131f6aa-9c07-11d1-f79f-00c04fc2dcd2
2026-02-20 03:00:14  DC-03       DC-01$        DC-01            1131f6aa-9c07-11d1-f79f-00c04fc2dcd2
2026-02-27 03:00:11  DC-02       DC-01$        DC-01            1131f6aa-9c07-11d1-f79f-00c04fc2dcd2
2026-03-06 03:00:09  DC-03       DC-02$        DC-02            1131f6ad-9c07-11d1-f79f-00c04fc2dcd2
2026-03-11 02:47:03  DC-01       jsmith        FILESERVER-01    1131f6aa-9c07-11d1-f79f-00c04fc2dcd2
2026-03-11 02:47:03  DC-01       jsmith        FILESERVER-01    1131f6ad-9c07-11d1-f79f-00c04fc2dcd2
2026-03-13 03:00:22  DC-02       DC-01$        DC-01            1131f6aa-9c07-11d1-f79f-00c04fc2dcd2
```

---

## Data source 4 — Windows Security Event ID 4624, LogonType 3 (abridged, 11 March only)

```
TIME      TARGET USER   SOURCE HOST      DEST HOST        AUTH PACKAGE
02:09:41  jsmith        WS-0144          FILESERVER-01    NTLM
02:11:02  jsmith        WS-0144          FILESERVER-02    NTLM
02:12:30  jsmith        WS-0144          FILESERVER-03    NTLM
02:13:55  jsmith        WS-0144          DC-01            NTLM
08:02:11  a.hassan      WS-0088          FILESERVER-01    Kerberos
08:14:55  f.alsalem     WS-0102          FILESERVER-02    Kerberos
09:31:08  n.aldosari    WS-0211          FILESERVER-01    Kerberos
```

