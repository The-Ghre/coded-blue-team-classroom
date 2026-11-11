import type { Session } from '@/types/content'

const FILE = 'defensive_day_10_active_directory_security_esl (OPTIONAL).md'

export const session10: Session = {
  number: 10,
  slug: 'active-directory-security',
  title: 'Active Directory Security: Detection and Defence',
  summary:
    'Whoever controls Active Directory controls everything. Here is what that compromise looks like in the logs, and what it takes to actually remove the attacker.',
  abstract:
    'Active Directory is the master key cabinet for a Windows estate, and compromising it bypasses every other control at once. This extension session covers Kerberos abuse detection, Pass-the-Hash, suspicious SMB behaviour, domain privilege escalation, abnormal administrative logons and domain persistence. It also covers the remediation steps that are not obvious — above all the KRBTGT double reset, without which a cleaned domain is still owned. The practical investigates a DCSync and plans the recovery.',
  track: 'extension',
  themes: ['Kerberos', 'Escalation', 'Recovery'],
  prerequisites: [
    'Session 2 — Windows Event IDs and logon types',
    'Session 9 — the DCSync hunt, which this session completes',
    'Session 5 — incident response sequencing, which the recovery plan applies',
  ],
  outcomes: [
    'Detect Kerberoasting and AS-REP Roasting from their specific event signatures',
    'Identify Pass-the-Hash from the combination of logon type, authentication package and source',
    'Recognise domain privilege escalation through ACL abuse, group changes and AdminSDHolder modification',
    'Detect DCSync from Event ID 4662 and explain why it is the highest-impact AD detection available',
    'Identify domain persistence mechanisms designed to survive incident response',
    'Produce a remediation plan including the KRBTGT double reset, with the replication verification step',
  ],
  sourceFiles: [FILE],
  sourceNotes: [
    'This file is marked OPTIONAL in the supplied material and is taught as an extension session. Its forward pointer names threat intelligence as the next day; no such file was supplied, so the Defensive track ends here. That dangling reference is recorded on the course roadmap as a known gap rather than silently dropped.',
  ],

  theory: {
    minutes: 90,
    blocks: [
      {
        kind: 'title',
        id: 'open',
        title: 'Session 10',
        overline: 'Defensive Track · Session 10 of 10 · Extension',
        lead:
          'A burglar who gets into one office looks for the master key cabinet. They do not want the office.',
        provenance: 'source',
        sources: [{ file: FILE, section: '2. Introduction' }],
      },

      {
        kind: 'retrieval',
        id: 'retrieval',
        title: 'Recall from Sessions 2, 5 and 9',
        minutes: 6,
        recallPrompt: 'From memory.',
        questions: [
          'What does Event ID 4624 LogonType 3 mean, and why would NTLM in that context be suspicious?',
          'In Session 9 you hunted DCSync. What two GUIDs did you search for, and what do they represent?',
          'Why is a compromised account disabled rather than deleted?',
          'Which Session 9 hypothesis required you to verify the data source before trusting a clean result?',
        ],
        answers: [
          'A network logon — a file share or remote service, not an interactive session. NTLM is suspicious because modern AD prefers Kerberos; a fallback to NTLM for internal access is unusual.',
          '1131f6aa (DS-Replication-Get-Changes) and 1131f6ad (DS-Replication-Get-Changes-All). They are the replication permissions DCSync abuses.',
          'Disabling preserves the audit history, which is evidence. Both stop access.',
          'The DCSync hunt. Without directory service object access auditing enabled, Event ID 4662 is never generated and the query returns clean on a compromised domain.',
        ],
        provenance: 'supplementary',
      },

      {
        kind: 'scenario',
        id: 'scenario',
        title: 'Opening scenario: 04:07, replication from a workstation',
        minutes: 4,
        synthetic: true,
        setting: 'A SIEM alert at 04:07.',
        narrative: [
          'Event ID 4662: replication rights invoked by WORKSTATION-22. WORKSTATION-22 is not a domain controller.',
          'By the time you read this, every password hash in the domain has been extracted. Every account. Including KRBTGT, the account that signs every Kerberos ticket in the environment.',
          'Resetting every user password will not remove the attacker.',
        ],
        drivingQuestion:
          'Why does a full password reset not fix this — and what does?',
        provenance: 'source',
        sources: [{ file: FILE, section: '7. Scenario Walkthrough: DCSync from a Workstation' }],
      },

      {
        kind: 'objectives',
        id: 'objectives',
        title: 'What you will be able to do',
        minutes: 3,
        provenance: 'supplementary',
        objectives: [
          { verb: 'Detect', text: 'Kerberoasting and AS-REP Roasting from their event signatures' },
          { verb: 'Identify', text: 'Pass-the-Hash from logon type, authentication package and source' },
          { verb: 'Recognise', text: 'privilege escalation through ACL abuse, group changes and AdminSDHolder' },
          { verb: 'Detect', text: 'DCSync, and explain why it is the highest-impact AD detection' },
          { verb: 'Identify', text: 'domain persistence designed to survive incident response' },
          { verb: 'Produce', text: 'a remediation plan including the KRBTGT double reset' },
        ],
      },

      {
        kind: 'concept',
        id: 'kerberos',
        title: 'Kerberos abuse, and the one field that gives it away',
        minutes: 11,
        lead:
          'Kerberos issues a Ticket Granting Ticket at logon, then service tickets on request. Attackers abuse the process at several points, and most of the abuse is visible in one field.',
        points: [
          'Kerberoasting (T1558.003) — any domain user can request a service ticket for any service. The ticket is encrypted with the service account\'s password hash and cracked offline. No network noise, no account lockout.',
          'The signature: Event ID 4769 with TicketEncryptionType 0x17 (RC4) for an account not ending in $. Modern AD uses AES (0x11 or 0x12). An RC4 service ticket request for a user service account is the finding.',
          'AS-REP Roasting (T1558.004) — targets accounts with Kerberos pre-authentication disabled. The KDC returns a crackable response with no credentials required at all.',
          'The signature: Event ID 4768 with PreAuthType 0. A secure environment should have almost no such accounts.',
          'Golden Ticket (T1558.001) — forges TGTs using the KRBTGT hash. Grants access as any user, including accounts that do not exist, and can be set valid for ten years.',
          'Silver Ticket (T1558.002) — forges a service ticket directly, bypassing the KDC. Hardest to detect, because no ticket request event is generated at all.',
        ],
        callout: {
          tone: 'warn',
          text: 'Silver Ticket detection requires correlating across two hosts: a service authentication at the target (Event ID 4624) with no matching service ticket request (Event ID 4769) on the domain controller beforehand. A single-machine view cannot see it.',
        },
        redView:
          'Kerberoasting is valuable because it generates almost no noise. Every domain user can legitimately request service tickets, so the requests themselves are unremarkable. One detail reveals it: RC4 encryption where AES is expected.',
        blueView:
          'The RC4 filter on Event ID 4769 is one of the most precise rules in enterprise security. In an environment enforcing AES for service accounts, a single RC4 service ticket request is near-certain Kerberoasting. It is cheap to write and it catches one of the most common AD techniques.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.1 Kerberos Abuse Detection' }],
        detail: [
          'Defensive controls for Kerberoasting, in order of value: configure service accounts for AES only and disable RC4 where possible, which removes the cracking opportunity entirely rather than merely detecting it; use Group Managed Service Accounts, whose automatically rotated long passwords make a cracked hash useless; and monitor service accounts for unusual authentication patterns.',
          'For AS-REP Roasting the control is simply to audit which accounts have pre-authentication disabled and enable it. The attack requires no credentials at all, which makes any such account a standing invitation.',
        ],
      },

      {
        kind: 'concept',
        id: 'pth',
        title: 'Pass-the-Hash: three fields together',
        minutes: 7,
        lead:
          'NTLM accepts a password hash directly. An attacker who dumps hashes can authenticate across the network without ever learning a password.',
        points: [
          'The signature is a combination, not a single field: Event ID 4624, LogonType 3 (network), AuthenticationPackageName NTLM, LogonProcessName NtLmSsp, from an unexpected source.',
          'Modern Active Directory prefers Kerberos. Internal network logons falling back to NTLM are unusual by default.',
          'The highest-priority variant is a Domain Admin account authenticating over NTLM. This should essentially never happen for internal lateral movement.',
          'Restricted Admin Mode for RDP stops credentials being cached on the remote machine, reducing the material available to steal.',
          'Credential Guard uses virtualisation-based security to make hashes and tickets unreachable from the normal OS, blocking most extraction techniques at source.',
        ],
        redView:
          'Pass-the-Hash needs no cracking — the hash is the credential. The detection risk is the protocol choice itself, which is why environments that enforce Kerberos and restrict NTLM make the technique unavailable rather than merely visible.',
        blueView:
          'Configure the Domain Admin NTLM alert for immediate escalation at any hour. The combination of a DA account, NTLM, a network logon and an unusual source is near-certain credential theft or badly misconfigured tooling, and both need attention tonight.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.2 Pass-the-Hash Detection' }],
      },

      {
        kind: 'concept',
        id: 'escalation',
        title: 'Domain escalation happens through configuration, not exploits',
        minutes: 10,
        lead:
          'Most AD privilege escalation abuses permissions that were granted years ago, by someone solving a different problem, and never audited since.',
        points: [
          'AdminSDHolder — a security template whose permissions propagate to all privileged accounts within about an hour. Event ID 5136 on that object almost never fires legitimately.',
          'ACL abuse — GenericAll on a user permits a password reset; GenericWrite on a group permits adding members; WriteDACL on anything permits granting yourself any permission on it.',
          'Group membership — Event IDs 4728, 4732 and 4756 for Domain Admins, Enterprise Admins, Schema Admins, Backup Operators and Account Operators. In a stable environment the change frequency should be near zero.',
          'DCSync (T1003.006) — abuses the replication service to request all credential data without touching a domain controller directly. Event ID 4662 with the replication GUIDs from a non-DC account.',
          'BloodHound maps every ACL relationship and finds the escalation paths that already exist. PingCastle and Purple Knight score the configuration.',
        ],
        callout: {
          tone: 'rule',
          text: 'Event ID 5136 — directory service object modified — is one of the most powerful AD detection events and one of the least monitored. A single rule covering AdminSDHolder, the domain root security descriptor and GPO objects catches three of the most common escalation and persistence techniques from one log source.',
        },
        redView:
          'BloodHound maps paths that already exist in the ACL graph, created by migrations, decommissioned projects and administrative shortcuts years earlier. Many organisations have escalation paths that have existed unnoticed for years.',
        blueView:
          'Run BloodHound against your own environment before an attacker does. Finding that a helpdesk account has GenericAll on a server with unconstrained delegation is intelligence that changes your remediation priorities immediately.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.4 Domain Privilege Escalation Indicators' }],
      },

      {
        kind: 'evidence',
        id: 'demo',
        title: 'Instructor demonstration: twenty minutes of a domain falling',
        minutes: 19,
        synthetic: true,
        lead:
          'Six events, one account, twenty minutes. Select each line and watch the privilege climb.',
        caption: 'Synthetic SIEM output, 03:00–03:22',
        source: 'Fabricated for teaching. Event IDs and field names follow the Windows Security schema.',
        lines: [
          {
            text: '03:00  4624  LogonType=3  NTLM  user=svc_backup  src=WORKSTATION-14  dest=FILESERVER-01',
            note: {
              kind: 'hypothesis',
              label: 'NTLM where Kerberos is expected',
              body: 'A service account authenticating over NTLM from a workstation. Two things are wrong: the protocol, in an environment that prefers Kerberos, and the source — a service account should not be originating connections from a user workstation. This is the Pass-the-Hash signature. T1550.002.',
            },
          },
          {
            text: '03:04  4624  LogonType=3  NTLM  user=svc_backup  src=WORKSTATION-14  dest=FILESERVER-02',
            note: {
              kind: 'observation',
              label: 'Second destination, same source',
              body: 'The same credential reaching a second server. One of these is an event; a sequence is a pattern. This is the start of the one-to-many authentication shape from Session 9.',
            },
          },
          {
            text: '03:08  4624  LogonType=3  NTLM  user=svc_backup  src=WORKSTATION-14  dest=DC-01',
            note: {
              kind: 'confirmed',
              label: 'Three destinations in eight minutes, now including a domain controller',
              body: 'The one-to-many pattern is confirmed, and the third destination is a domain controller. Whatever this account was intended for, systematically authenticating to three servers from a workstation in eight minutes is not it.',
            },
          },
          {
            text: '03:12  4769  user=svc_backup  ServiceName=krbtgt  TicketEncryptionType=0x17',
            note: {
              kind: 'confirmed',
              label: 'RC4, and the service name is the alarming part',
              body: '0x17 is RC4 where AES is expected — the Kerberoasting signature. But read the service name: krbtgt. A service ticket request targeting the account that signs every ticket in the domain is an attempt at the keys to the entire estate. T1558.003.',
            },
          },
          {
            text: '03:18  4728  GroupName="Domain Admins"  MemberAdded=svc_backup',
            note: {
              kind: 'confirmed',
              label: 'Escalation complete',
              body: 'The account has been added to Domain Admins. In a stable environment this event should fire approximately never without a change ticket. Six minutes after the Kerberos request, the attacker holds domain administrative privilege.',
            },
          },
          {
            text: '03:22  4662  user=svc_backup  Properties=DS-Replication-Get-Changes  src=WORKSTATION-22',
            note: {
              kind: 'confirmed',
              label: 'DCSync — every credential in the domain',
              body: 'Replication rights invoked from a workstation. The attacker now holds every password hash in the domain, including KRBTGT. From this moment, resetting user passwords does not remove them: with the KRBTGT hash they can forge a Golden Ticket valid for any user, including users that do not exist. T1003.006.',
            },
          },
        ],
        proves: [
          'The svc_backup credential was used from WORKSTATION-14 over NTLM to three servers including a domain controller',
          'A service ticket for krbtgt was requested with RC4 encryption',
          'svc_backup was added to Domain Admins at 03:18',
          'Directory replication rights were invoked from WORKSTATION-22, a non-domain-controller, at 03:22',
          'All domain credential hashes, including KRBTGT, must be presumed compromised',
        ],
        doesNotProve: [
          'How the svc_backup hash was originally obtained — that requires investigating WORKSTATION-14',
          'Whether a Golden Ticket has actually been created. The capability is confirmed; the act is not.',
          'That WORKSTATION-14 was the first compromised host',
          'That no other persistence was established alongside this. Assume it was until checked.',
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '11. Discussion Prompts — Technical Scenario' }],
        detail: [
          'Two source hosts appear: WORKSTATION-14 for the lateral movement and WORKSTATION-22 for the DCSync. Both are compromised and both need isolating. Students frequently isolate only the one named in the final alert.',
          'The ordering is the lesson. Each event is individually detectable and individually survivable. Together, in twenty minutes, they are a complete domain compromise — and the only one of the six with an existing rule was the last.',
        ],
      },

      {
        kind: 'concept',
        id: 'persistence',
        title: 'Domain persistence is designed to survive your response',
        minutes: 9,
        lead:
          'These mechanisms exist specifically to outlast the remediation that follows discovery.',
        points: [
          'Golden Ticket — forged TGTs from the KRBTGT hash. Survives every password reset in the domain. Can be valid for ten years.',
          'Skeleton Key (T1556.001) — patches LSASS on a domain controller to accept one universal password while normal passwords keep working. Survives until the DC reboots.',
          'DSRM account abuse (T1003.006) — changing the Directory Services Restore Mode password and enabling network authentication creates a local administrator backdoor on a DC. Event ID 4794, which almost never fires legitimately.',
          'SID History injection (T1134.005) — injects a privileged SID into an account\'s SID History, granting invisible elevated access. Event ID 4765. Should never fire outside a migration.',
          'Malicious GPO (T1484.001) — a single Group Policy Object can deploy a backdoor to every machine in an organisational unit, and redeploy it on every policy refresh. Event IDs 5136, 5137, 5141.',
        ],
        callout: {
          tone: 'warn',
          text: 'These share a detection pattern: most generate Event ID 5136 for the relevant object. One alert set covering AdminSDHolder, the domain root, KRBTGT, privileged group membership, GPO containers and SID History attributes gives broad persistence coverage from a single event ID — with a suppression list for known-good administration, because 5136 fires often during legitimate work.',
        },
        redView:
          'Each of these targets a specific weakness in the standard response. Skeleton Key patches a process antivirus does not clean. SID History survives password resets. A malicious GPO redeploys on every refresh. The objective is that a thorough response still leaves one mechanism intact.',
        blueView:
          'Three of these — DSRM password change, SID History modification, AdminSDHolder change — have near-zero legitimate use. They should alert the moment they fire, at any hour, with no threshold.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.6 Domain Persistence Detection' }],
      },

      {
        kind: 'concept',
        id: 'krbtgt',
        title: 'The KRBTGT double reset, and why once is not enough',
        minutes: 11,
        lead:
          'This is the most non-obvious and most critical AD recovery procedure. Document it before you need it, because you will be executing it at 04:00.',
        points: [
          'Confirm every domain controller is online and replicating normally. Starting with a broken replication topology makes the rest unverifiable.',
          'Reset the KRBTGT password. Wait for replication to complete across all DCs — at least ten minutes.',
          'Verify replication has completed. Do not assume it; check it.',
          'Reset the KRBTGT password a second time. Wait for replication again.',
          'Verify the second reset has replicated.',
          'All previously issued Kerberos tickets are now invalid. Coordinate with the helpdesk — every user will re-authenticate.',
        ],
        callout: {
          tone: 'rule',
          text: 'Why twice: Active Directory retains the previous KRBTGT password so that tickets issued just before a reset keep working. One reset leaves forged tickets valid within that window. The second reset invalidates the retained previous password, closing it. Resetting twice in rapid succession without verifying replication between them can break authentication domain-wide — the verification step is not optional padding.',
        },
        blueView:
          'After a confirmed DCSync or Golden Ticket, the full remediation is: reset KRBTGT twice with verification between, reset all Domain Admin passwords, force a reset for every domain account, remove any attacker-added group memberships, delete persistence from every domain controller, isolate every compromised host, and assess for Golden Ticket usage. Any one of those omitted leaves the attacker a route back.',
        provenance: 'source',
        sources: [{ file: FILE, section: '8. Defender\'s View — The KRBTGT Double-Reset Procedure' }],
        detail: [
          'The organisational dimension is as hard as the technical one. Forcing a password reset on thousands of accounts at 04:00 will break service account authentication and automated processes. Legal may be asking about breach notification simultaneously. The source material is explicit that the coordination plan for this must exist before the incident, because there is no time to invent it during one.',
          'Microsoft publishes guidance and tooling for the KRBTGT reset. Use the vendor procedure rather than this summary when executing it for real — this page teaches why, and the vendor documentation is the authority on how.',
        ],
      },

      {
        kind: 'check',
        id: 'check',
        title: 'Knowledge check',
        minutes: 6,
        provenance: 'supplementary',
        questions: [
          {
            id: 'q1',
            stem: 'After a confirmed DCSync, you reset every user password in the domain. Is the attacker removed?',
            options: [
              {
                text: 'No — with the KRBTGT hash they can forge tickets for any account, so KRBTGT must be reset twice',
                correct: true,
                feedback:
                  'Correct. DCSync extracted every hash including KRBTGT. A Golden Ticket forged from it authenticates as anyone, including accounts that do not exist, and is unaffected by password resets.',
              },
              {
                text: 'Yes — all credentials are now changed',
                correct: false,
                feedback:
                  'All user credentials are changed. KRBTGT is the exception that makes the rest insufficient, which is exactly why this procedure is taught.',
              },
              {
                text: 'Only if Domain Admin passwords were included',
                correct: false,
                feedback: 'Necessary and insufficient for the same reason.',
              },
              {
                text: 'Yes, provided MFA is also enforced',
                correct: false,
                feedback: 'A forged Kerberos ticket does not go through an interactive authentication flow, so MFA is not in the path.',
              },
            ],
          },
          {
            id: 'q2',
            stem: 'Event ID 4769 with TicketEncryptionType 0x17 for an account not ending in $. What is this?',
            options: [
              {
                text: 'Kerberoasting — an RC4 service ticket request for a user service account',
                correct: true,
                feedback:
                  'Correct. Modern AD uses AES. RC4 for a non-machine account is one of the highest-precision detections available.',
              },
              {
                text: 'AS-REP Roasting',
                correct: false,
                feedback: 'That is Event ID 4768 with PreAuthType 0. Different event, different signature.',
              },
              {
                text: 'A Golden Ticket in use',
                correct: false,
                feedback:
                  'Golden Ticket indicators are unusual ticket lifetimes and authentication from accounts that do not exist. This is a ticket request, not a forged ticket.',
              },
              {
                text: 'Normal service authentication',
                correct: false,
                feedback: 'Normal service authentication in a modern environment uses AES — 0x11 or 0x12.',
              },
            ],
          },
          {
            id: 'q3',
            stem: 'Why reset KRBTGT twice rather than once?',
            options: [
              {
                text: 'AD retains the previous password so recently issued tickets keep working; one reset leaves forged tickets valid in that window',
                correct: true,
                feedback:
                  'Correct. The second reset invalidates the retained previous password and closes the window — and the replication verification between the two is what stops the procedure itself breaking authentication.',
              },
              {
                text: 'Because the first reset often fails silently',
                correct: false,
                feedback: 'It does not. The reason is the retained previous password, which is a deliberate design feature.',
              },
              {
                text: 'To force all users to re-authenticate twice',
                correct: false,
                feedback: 'Re-authentication is a consequence, not the purpose.',
              },
              {
                text: 'Because two different domain controllers each hold a copy',
                correct: false,
                feedback:
                  'Every DC holds a copy and replication handles it — which is why the verification step exists between the resets.',
              },
            ],
          },
        ],
      },

      {
        kind: 'recap',
        id: 'theory-recap',
        title: 'Before the practical',
        minutes: 4,
        provenance: 'source',
        sources: [{ file: FILE, section: '12. Actionable Takeaways' }],
        takeaways: [
          'Deploy the Event ID 4662 non-DC replication filter before any other AD rule. It catches the most damaging technique available.',
          'Run BloodHound against your own environment before an attacker does.',
          'Document and rehearse the KRBTGT double reset before you need it.',
          'Event ID 5136 is the most powerful and least monitored AD detection event.',
          'DSRM changes, SID History modifications and AdminSDHolder changes have near-zero legitimate use. Alert on all three.',
        ],
        furtherStudy: [
          { label: 'Microsoft — AD Security Best Practices', note: 'Authoritative guidance on privileged access, tiering and administrative workstations.', href: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/security-best-practices/best-practices-for-securing-active-directory' },
          { label: 'BloodHound', note: 'Maps ACL relationships and escalation paths. Run it defensively.', href: 'https://github.com/SpecterOps/BloodHound' },
          { label: 'PingCastle', note: 'AD security risk scoring and misconfiguration detection.', href: 'https://www.pingcastle.com/' },
          { label: 'Microsoft — KRBTGT reset guidance', note: 'The vendor procedure. Use this, not a summary, when executing for real.', href: 'https://learn.microsoft.com/en-us/defender-for-identity/' },
        ],
      },
    ],
  },

  practical: {
    minutes: 90,
    title: 'Workshop: Investigate the DCSync, plan the recovery',
    blocks: [
      {
        kind: 'brief',
        id: 'brief',
        title: 'Briefing',
        minutes: 10,
        synthetic: true,
        resourceDir: 'active-directory-security',
        scenario:
          'The DCSync alert from the opening scenario has fired. You must reconstruct how the attacker reached domain compromise, find every persistence mechanism, and produce a recovery plan that will survive review by the AD team, legal, and a CISO who wants to know when it will be over.',
        objectives: [
          'Reconstruct the escalation chain from initial credential access to DCSync',
          'Determine how the service account credential was originally obtained',
          'Find every persistence mechanism, including those designed to survive password resets',
          'Produce a sequenced recovery plan including the KRBTGT double reset',
          'Identify which detection rules existed, which fired, and which should have',
        ],
        requires: [
          { item: 'The AD incident pack (downloadable)', note: 'Windows Security events across domain controllers and workstations, a group membership change log, a scheduled task inventory from the DCs, and a current detection rule inventory.', file: '00-ad-incident-pack.md' },
          { item: 'The recovery plan template (downloadable)', note: 'Sequenced, with dependency and verification columns.', file: '01-recovery-plan-template.md' },
          { item: 'A text editor', note: 'For the timeline, findings and plan.' },
          { item: 'A browser', note: 'For attack.mitre.org.' },
        ],
        setup: [
          'Download the AD incident pack and the recovery plan template.',
          'Create a working folder named ad-incident-<your-name>.',
          'Note that two workstations appear in this pack. Both matter.',
          'Read the detection rule inventory early. Knowing which rules existed changes how you read the gaps.',
        ],
        realism:
          'No domain is touched. You are reconstructing from log evidence and producing a plan, which is what an incident lead actually does — the KRBTGT reset itself is executed by the AD team against Microsoft\'s documented procedure, and the recap links it. What is assessed is the reconstruction, the completeness of the persistence hunt, and whether your plan is correctly sequenced with its verification steps intact.',
        provenance: 'source',
        sources: [{ file: FILE, section: '7. Scenario Walkthrough: DCSync from a Workstation' }],
      },

      {
        kind: 'tasks',
        id: 'tasks',
        title: 'Your tasks',
        minutes: 55,
        lead: 'Reconstruct before you remediate. A recovery plan written before the scope is known will miss something.',
        tasks: [
          {
            ref: 'T1',
            minutes: 10,
            title: 'Confirm the DCSync and establish scope',
            steps: [
              'Find the Event ID 4662 entries with replication GUIDs from non-machine accounts.',
              'Record the account, the source host and the time, and confirm the source is not a domain controller.',
              'Verify that directory service auditing is enabled, so you know what a clean result elsewhere means.',
              'State plainly what must now be presumed compromised, and why.',
            ],
            produces: 'The confirmed DCSync finding with its scope statement.',
          },
          {
            ref: 'T2',
            minutes: 14,
            title: 'Trace the escalation chain backwards',
            steps: [
              'From the DCSync account, find every earlier authentication event for it.',
              'Identify the Pass-the-Hash pattern: logon type, authentication package, and the source host.',
              'Find the group membership change that granted domain administrative privilege.',
              'Find the Kerberos ticket request and note both the encryption type and the service name.',
              'Determine how the original credential was obtained — this requires looking at the first source workstation.',
            ],
            produces: 'The full escalation chain with timestamps, techniques and ATT&CK IDs.',
          },
          {
            ref: 'T3',
            minutes: 13,
            title: 'Hunt for persistence',
            steps: [
              'Check scheduled tasks on every domain controller in the inventory.',
              'Check for group membership additions you have not already accounted for.',
              'Check for Event IDs 4794, 4765 and 5136 across the window.',
              'Check for new or modified Group Policy Objects.',
              'For each mechanism found, state whether it would survive a domain-wide password reset.',
            ],
            produces: 'A persistence inventory, each entry marked for whether a password reset removes it.',
          },
          {
            ref: 'T4',
            minutes: 12,
            title: 'Write the recovery plan',
            steps: [
              'Sequence every remediation action, with dependencies stated.',
              'Include the KRBTGT double reset with its replication verification between resets.',
              'Include isolation for both compromised workstations, not only the one in the alert.',
              'Include removal of every persistence mechanism you found, by name and location.',
              'For each step, state how you would verify it succeeded. A step with no verification is a hope.',
            ],
            produces: 'A sequenced recovery plan with dependencies and verification per step.',
          },
          {
            ref: 'T5',
            minutes: 6,
            title: 'Detection gap analysis',
            steps: [
              'For each stage of the chain, note whether a rule existed and whether it fired.',
              'Order the gaps by how much earlier each would have detected the intrusion.',
              'Write the single highest-value rule you would deploy tomorrow, with its data source and condition.',
              'Answer the Session 5 question: if this happened again tomorrow, would you detect it in the first ten minutes?',
            ],
            produces: 'A gap analysis ordered by lead time, and one specific rule recommendation.',
          },
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '7. Scenario Walkthrough — Incident Response Actions Required' }],
      },

      {
        kind: 'hints',
        id: 'hints',
        title: 'Progressive hints',
        hints: [
          {
            forTask: 'T1',
            tiers: [
              'The GUIDs are 1131f6aa and 1131f6ad in the Properties field.',
              'Exclude accounts ending in $ — those are machine accounts and DC-to-DC replication is legitimate.',
              'The scope statement should name KRBTGT explicitly. That is what makes this different from any other credential theft.',
            ],
          },
          {
            forTask: 'T2',
            tiers: [
              'Filter all events for the DCSync account and sort by time ascending. The whole chain is there.',
              'For Pass-the-Hash, look for LogonType 3 with NTLM from a workstation source. The source host is where the hash came from.',
              'For the original credential: go to the first source workstation and look for credential access evidence there. The chain starts before the first domain event.',
            ],
            },
          {
            forTask: 'T3',
            tiers: [
              'Scheduled tasks on domain controllers are rare. Any task not matching a documented deployment is worth reading in full.',
              'The near-zero-false-positive events are 4794 (DSRM), 4765 (SID History) and 5136 on AdminSDHolder. Check all three.',
              'For the survival question: password resets remove credential-based access only. Scheduled tasks, GPOs, SID History and anything derived from the KRBTGT hash all survive.',
            ],
          },
          {
            forTask: 'T4',
            tiers: [
              'Sequence matters. Isolating compromised hosts comes before resetting credentials, or the attacker watches the reset happen and re-establishes.',
              'The KRBTGT reset is: verify replication, reset, wait, verify, reset, wait, verify. Six steps, not two.',
              'For verification: name the specific check. "Confirm replication" is a step; "run repadmin /showrepl and confirm all DCs report success" is a verifiable one.',
            ],
          },
          {
            forTask: 'T5',
            tiers: [
              'Compare each chain stage against the rule inventory. Most stages have no rule — that is the finding.',
              'The DCSync rule fired. Everything before it did not. Order the gaps by how far before 03:22 each would have fired.',
              'For the single highest-value rule: the NTLM network logon filter would have fired at 03:00, twenty-two minutes earlier and before any privilege was gained.',
            ],
          },
        ],
        provenance: 'supplementary',
      },

      {
        kind: 'deliverables',
        id: 'deliverables',
        title: 'Organise your evidence and submit',
        minutes: 15,
        items: [
          { ref: 'D1', text: 'Confirmed DCSync finding with an explicit scope statement naming KRBTGT', required: true },
          { ref: 'D2', text: 'Full escalation chain with timestamps, techniques and ATT&CK IDs', required: true },
          { ref: 'D3', text: 'The original credential access finding from the first workstation', required: true },
          { ref: 'D4', text: 'Persistence inventory, each entry marked for password-reset survival', required: true },
          { ref: 'D5', text: 'Sequenced recovery plan with dependencies and per-step verification', required: true },
          { ref: 'D6', text: 'Detection gap analysis ordered by lead time, with one rule recommendation', required: true },
        ],
        structure: `ad-incident-<your-name>/
  00-dcsync.md        → T1: the confirmed finding and scope
  01-chain.md         → T2: escalation reconstructed backwards
  02-origin.md        → T2: how the credential was first obtained
  03-persistence.md   → T3: inventory, with survival marked
  04-recovery-plan.md → T4: sequenced, with verification
  05-gaps.md          → T5: ordered by lead time, plus the rule`,
        provenance: 'source',
        sources: [{ file: FILE, section: '6. Reporting Mindset' }],
      },

      {
        kind: 'assessment',
        id: 'assessment',
        title: 'How this is assessed',
        criteria: [
          {
            band: 'Chain reconstruction',
            weight: '25%',
            descriptor:
              'Every stage identified in order with correct techniques. The original credential access is traced back beyond the first domain event.',
          },
          {
            band: 'Persistence completeness',
            weight: '25%',
            descriptor:
              'Every mechanism found and correctly marked for whether a password reset removes it. Missing a mechanism that survives the reset loses most of this band, because that is the one that brings the attacker back.',
          },
          {
            band: 'Recovery sequencing',
            weight: '25%',
            descriptor:
              'Correctly ordered with dependencies. KRBTGT double reset present with replication verification between resets. Both workstations isolated. Each step has a named verification.',
          },
          {
            band: 'Gap analysis',
            weight: '15%',
            descriptor:
              'Gaps ordered by lead time. The rule recommendation names a data source and a condition and would genuinely have fired earliest.',
          },
          {
            band: 'Scope communication',
            weight: '10%',
            descriptor:
              'The scope statement names KRBTGT and explains in plain language why a password reset alone is insufficient.',
          },
        ],
        provenance: 'supplementary',
      },

      {
        kind: 'debrief',
        id: 'debrief',
        title: 'Debrief',
        minutes: 10,
        questions: [
          'Who traced the chain back to the original credential access on the first workstation? Who stopped at the first domain event?',
          'Did everyone isolate both workstations? Which one is easier to miss, and why?',
          'How many persistence mechanisms did the room find? How many of those survive a password reset?',
          'Compare recovery plans. Whose sequence would an AD team actually follow at 04:00?',
          'Did anyone omit the replication verification between the two KRBTGT resets? What happens if you do?',
          'Answer the ten-minute question. What one rule would change the answer most?',
        ],
        landingPoint:
          'Active Directory compromise is the incident where thorough response and complete response diverge — because the mechanisms that matter most are the ones built specifically to survive a thorough one, and knowing that is the difference between recovering a domain and rebuilding it.',
        provenance: 'supplementary',
      },

      {
        kind: 'recap',
        id: 'recap',
        title: 'Recap — and the end of the Defensive track',
        provenance: 'source',
        sources: [{ file: FILE, section: '13. Summary' }],
        takeaways: [
          'AD is the highest-value target in a Windows estate. Compromising it bypasses every other control at once.',
          'Kerberoasting is Event ID 4769 with RC4 for a non-machine account — one of the most precise rules available.',
          'Pass-the-Hash is a combination: 4624, LogonType 3, NTLM, unexpected source.',
          'DCSync is Event ID 4662 with replication GUIDs from a non-DC account, and it is the highest-impact AD detection.',
          'Event ID 5136 covers AdminSDHolder, ACL changes and GPO modification from one log source.',
          'The KRBTGT double reset, with replication verification between, is mandatory after a confirmed DCSync or Golden Ticket.',
        ],
        furtherStudy: [
          { label: 'Microsoft — Securing Active Directory', note: 'The authoritative guidance on privileged access and administrative tiering.', href: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/security-best-practices/best-practices-for-securing-active-directory' },
          { label: 'BloodHound', note: 'Map your own ACL graph before an attacker does.', href: 'https://github.com/SpecterOps/BloodHound' },
          { label: 'Purple Knight', note: 'A free AD security assessment tool.', href: 'https://www.purple-knight.com/' },
          {
            label: 'What comes next',
            note: 'The supplied material points onward to threat intelligence as a following day. No such file was provided, so the course ends here — see the roadmap for the full list of known gaps in the source set.',
          },
        ],
      },
    ],
  },

  terms: [
    { term: 'Kerberoasting', definition: 'Requesting RC4-encrypted service tickets to crack offline. Event ID 4769 with TicketEncryptionType 0x17.' },
    { term: 'AS-REP Roasting', definition: 'Targeting accounts with Kerberos pre-authentication disabled. Event ID 4768 with PreAuthType 0.' },
    { term: 'Golden Ticket', definition: 'A forged Ticket Granting Ticket made with the KRBTGT hash. Grants access as any user and survives password resets.' },
    { term: 'Silver Ticket', definition: 'A forged service ticket bypassing the KDC. Hardest to detect — no ticket request event is generated.' },
    { term: 'Pass-the-Hash', definition: 'Authenticating with an NTLM hash instead of a password. Event ID 4624, LogonType 3, NTLM, unexpected source.' },
    { term: 'DCSync', definition: 'Abusing directory replication rights to extract all domain credentials. Event ID 4662 with the replication GUIDs.' },
    { term: 'KRBTGT', definition: 'The account whose key signs every Kerberos ticket in a domain. Its hash is the keys to the estate.' },
    { term: 'AdminSDHolder', definition: 'An AD object whose permissions propagate to all privileged accounts within about an hour. Event ID 5136.' },
    { term: 'SID History', definition: 'An attribute designed for domain migrations. Injecting a privileged SID grants invisible elevated access.' },
  ],
}
