# Classroom content review

Reviewed all ten presentation plans, matching Study sections, questions, workshop tasks, marking criteria and affected synthetic resource packs. Corrections preserve the course's teaching objectives and three-hour session timings. The original supplied source files remain provenance records; the authored teaching content now qualifies or corrects demonstrated inaccuracies.

| Lesson | Main review changes |
| --- | --- |
| SOC operations | Expanded acronyms; corrected opening alert count; made service-account baselines specific; distinguished supported ATT&CK behaviour from a compulsory mapping. Incident escalation follows impact and risk. |
| Log analysis | Distinguished recorded process/file/logon events from the analyst's attribution or intent. Legitimate Office child-process cases remain possible. Workshop corroboration acknowledges shared collectors and trust boundaries. |
| Phishing | Corrected From/SPF/DKIM alignment for the synthetic DMARC-pass example. Trusted receiving systems define the header boundary. POST requests, DNS lookups and tracking signals do not establish credential contents or human clicks. Fixed recipient arithmetic, timestamps, host/account mapping and rubric arithmetic. |
| Detection engineering | Clarified tuning metrics, validation beyond the workshop sample and the required narrow exclusion. Kept all five correlation patterns and complete practical coverage. |
| Incident response | Replaced universal memory-first rules with a risk-based collection window. Clarified the six-phase teaching model versus current NIST guidance. Corrected deletion/audit-history claims and existing-session containment. |
| Host forensics | Bounded known_hosts, SRUM and checksum interpretation; removed a fictitious Ubuntu RPM output. Fixed the SSH-key/cron question and scoring that demanded proof absent from the supplied pack. |
| Network/memory forensics | Timing and memory indicators are leads, not standalone proof. Distinguished MZ from validated PE structures, legacy Volatility syntax and observed timing variation from configured jitter. Aligned the DNS timeline with the intended six-hour lead. |
| Malware analysis | Static tooling still requires isolation. Reputation and file signatures need context. Separated possible capability from observed execution and qualified macro behaviour. |
| Threat hunting | A machine-account suffix does not establish a domain-controller role. DCSync hunts require appropriate auditing/SACL coverage and source-logon correlation; an empty result depends on visibility. Corrected search-comment syntax. |
| Active Directory | Replaced the incorrect KRBTGT service-ticket example with svc_sql, including its visual map. RC4 is an investigation lead; AES does not eliminate offline guessing of weak service-account passwords. Corrected KRBTGT reset interval/replication guidance and distinguished TGT validation from existing service tickets or sessions. |

Resource literals and generated files were updated together. Synthetic data remains labelled synthetic; missing evidence is identified as a gap instead of being invented. The beacon interactive also distinguishes timing dispersion from proof of C2, and the key-reset simulation explicitly compresses the ticket-lifetime wait.

## Primary references checked

- [NIST SP 800-61r3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) and [SP 800-86](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-86.pdf)
- [MITRE tactics](https://attack.mitre.org/tactics/enterprise/) and [Kerberoasting](https://attack.mitre.org/techniques/T1558/003/)
- [DMARC RFC 7489](https://www.rfc-editor.org/rfc/rfc7489.html), [Authentication-Results RFC 8601](https://www.rfc-editor.org/rfc/rfc8601.html), [HTTP semantics RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) and [Public Suffix List](https://publicsuffix.org/)
- [Microsoft Sysmon](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon), [Event 4726](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4726), [account revocation](https://learn.microsoft.com/en-us/entra/identity/users/users-revoke-access), [PE format](https://learn.microsoft.com/en-us/windows/win32/debug/pe-format) and [Event 4662](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4662)
- [Microsoft KRBTGT reset](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/forest-recovery-guide/ad-forest-recovery-reset-the-krbtgt-password) and [RC4 guidance](https://learn.microsoft.com/en-us/windows-server/security/kerberos/detect-remediate-rc4-kerberos)
- [OpenSSH host-key scanning](https://man.openbsd.org/ssh-keyscan), [RPM verification](https://rpm.org/docs/4.20.x/man/rpm.8), [Volatility malfind implementation](https://volatility3.readthedocs.io/en/v2.5.0/_modules/volatility3/plugins/windows/malfind.html) and [Splunk search comments](https://help.splunk.com/en/splunk-enterprise/search/search-manual/9.3/using-the-search-app/add-comments-to-searches)

This is an instructional content and consistency review. The synthetic scenarios were not validated against a live enterprise estate. The display layout targets an 85-inch16:9 screen viewed from five metres; browser checks do not substitute for an actual room viewing test.
