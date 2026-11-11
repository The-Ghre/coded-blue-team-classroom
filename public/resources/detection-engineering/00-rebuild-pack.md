# Session 4 — Detection rebuild pack

> **SYNTHETIC TEACHING DATA — CODED Blue Team Classroom**
> Every host, account, address, domain and hash below is fabricated for this
> workshop. No real environment produced this data. Do not visit any address or
> domain shown. Addresses are written defanged (hxxp://, 185[.]220[.]101[.]45)
> where they would otherwise be clickable.
>
> Post-incident report, current rule inventory, log source audit, and sector threat intelligence.

## 1. Post-incident report (extract)

```
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
```

---

## 2. Current rule inventory

```csv
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
```

---

## 3. Log source audit

```
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
```

> Two rules in the inventory above reference a category that is not
> forwarding. Those rules read as green on a coverage map and cannot fire.
> Finding them is task T1.

---

## 4. Sector threat intelligence summary

```
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
```

