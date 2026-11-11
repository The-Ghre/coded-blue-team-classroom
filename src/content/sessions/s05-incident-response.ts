import type { Session } from '@/types/content'

const FILE = 'defensive_day_5_incident_response_and_evidence_esl.md'

export const session05: Session = {
  number: 5,
  slug: 'incident-response',
  title: 'Incident Response and Digital Evidence',
  summary:
    'Containment and evidence preservation are the same ninety seconds. The order you do them in decides whether the investigation is possible at all.',
  abstract:
    'Detection is not enough — well-defended organisations are still breached. This session covers the structured response that limits damage and the evidence discipline that makes every action defensible afterwards. These are taught together because they happen together: the moment you contain a machine you are either preserving evidence or destroying it. You will learn the six IR phases, severity classification, containment strategies, order of volatility, chain of custody, and timeline construction. The practical runs a live incident under time pressure.',
  track: 'core',
  themes: ['Containment', 'Volatility', 'Custody'],
  prerequisites: [
    'Session 1 — escalation paths and severity',
    'Session 2 — reading log evidence and building a timeline from it',
    'Session 4 — the detection rules that produce the alert this session starts from',
  ],
  outcomes: [
    'Sequence the six IR phases and name the specific failure that results from skipping each',
    'Classify an incident P1 to P4 and reclassify it correctly as evidence changes',
    'Choose a containment action that stops the damage without destroying volatile evidence',
    'Apply order of volatility to decide what to collect first, and justify the sequence',
    'Maintain a chain of custody record with hash verification at every stage',
    'Construct a forensic timeline from multiple artefact sources and identify anti-forensic activity in it',
  ],
  sourceFiles: [FILE],
  sourceNotes: [
    'The source file merges incident response and digital evidence collection into one day, and states explicitly why: they are two halves of the same event. This session preserves that structure rather than separating them, because separating them is exactly the mistake the material warns against.',
  ],

  theory: {
    minutes: 90,
    blocks: [
      {
        kind: 'title',
        id: 'open',
        title: 'Session 5',
        overline: 'Defensive Track · Session 05 of 10',
        lead:
          'A building that reopens fast, and nobody can explain what caused the fire.',
        provenance: 'source',
        sources: [{ file: FILE, section: '2. Introduction' }],
      },

      {
        kind: 'retrieval',
        id: 'retrieval',
        title: 'Recall from Sessions 1 to 4',
        minutes: 6,
        recallPrompt: 'From memory.',
        questions: [
          'What distinguishes an alert Tier 2 escalates to IR from one they close with a recommendation?',
          'In Session 3, what was the correct first action when a credential submission was confirmed, and why that one first?',
          'What does "confirmed" require in this course\'s evidence vocabulary?',
          'Name two things that exist in a running machine\'s memory and nowhere on its disk.',
        ],
        answers: [
          'A confirmed incident — something has definitely happened, with scope established. IR starts from confirmed findings, never from suspicion.',
          'Reset the credentials and revoke sessions. Because the exposure is live and growing, while the remaining analysis does not get worse while you wait.',
          'Two or more independent sources supporting the same finding, so it survives one source being wrong, missing or tampered with.',
          'Decrypted credentials, injected code with no file on disk, encryption keys, and active network connections. All destroyed by a reboot.',
        ],
        provenance: 'supplementary',
      },

      {
        kind: 'scenario',
        id: 'scenario',
        title: 'Opening scenario: ten minutes, and the business wants a reboot',
        minutes: 4,
        synthetic: true,
        setting: '02:00. On-call. A domain controller.',
        narrative: [
          'The alert reads: CORP-DC-01 was accessed by a previously unseen account, svc_backup_new, which ran ntdsutil.exe. Ten minutes later, 4.2 GB was transferred to an external address.',
          'The machine is still running. Users are affected. The service owner is on the phone asking you to reboot it to restore service, and says they can give you ten minutes.',
          'Everything you need is in RAM right now. In ten minutes it may not be.',
        ],
        drivingQuestion:
          'What do you do in the next ten minutes, in what order, and what exactly is lost if you get the order wrong?',
        provenance: 'source',
        sources: [{ file: FILE, section: '11. Discussion Prompts — Technical Scenario' }],
      },

      {
        kind: 'objectives',
        id: 'objectives',
        title: 'What you will be able to do',
        minutes: 3,
        provenance: 'supplementary',
        objectives: [
          { verb: 'Sequence', text: 'the six IR phases and name the failure from skipping each' },
          { verb: 'Classify', text: 'an incident P1 to P4, and reclassify as evidence changes' },
          { verb: 'Choose', text: 'containment that stops damage without destroying volatile evidence' },
          { verb: 'Apply', text: 'order of volatility to sequence collection' },
          { verb: 'Maintain', text: 'a chain of custody with hash verification at every stage' },
          { verb: 'Construct', text: 'a forensic timeline and identify anti-forensic activity within it' },
        ],
      },

      {
        kind: 'concept',
        id: 'phases',
        title: 'Six phases, and what skipping each one costs',
        minutes: 8,
        lead:
          'Every major IR framework — NIST SP 800-61, SANS, ISO 27035 — uses a version of these six. The phases are not bureaucracy; each exists because skipping it reliably produces worse outcomes than the attack.',
        points: [
          'Preparation — plan, named on-call, tested runbooks, pre-deployed tools, out-of-band comms, legal contacts, tabletop exercises. Skip it and you improvise under pressure.',
          'Identification — confirm the alert, determine scope and start time, establish whether the attacker is still active. Skip it and you waste capacity or extend dwell time.',
          'Containment — freeze the situation without fixing the cause. Skip the evidence capture inside it and the investigation ends before it starts.',
          'Eradication — remove the attacker and everything left behind. Skip thoroughness and you are reinfected within hours by the second persistence mechanism.',
          'Recovery — deliberate, monitored return to service with enhanced monitoring for thirty days. Skip the staging and you reintroduce the risk.',
          'Lessons learned — timeline, root cause, detection gaps, specific changes. The most valuable phase and the most commonly skipped.',
        ],
        diagram: {
          type: 'cycle',
          alt: 'The six incident response phases arranged as a cycle: Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned, with Lessons Learned feeding back into Preparation. The cycle emphasises that the quality of any response is largely determined by the preparation done before the incident began.',
          steps: [
            'Preparation',
            'Identification',
            'Containment',
            'Eradication',
            'Recovery',
            'Lessons Learned',
          ],
        },
        callout: {
          tone: 'rule',
          text: 'Preparation is the most important and most neglected phase. A tabletop exercise that reveals nobody knows who the incident commander is, or that the out-of-band channel does not exist, is a very cheap discovery compared with finding out during a breach.',
        },
        redView:
          'A long dwell time lets an operator observe an improvised response in real time and adapt to it. A slow, disorganised response buys the time to deepen persistence and finish the data theft before eradication begins.',
        blueView:
          'Pre-approve low-risk containment. EDR isolation, DNS blocking and account disabling should never require escalation approval — requiring sign-off for routine steps costs twenty to thirty minutes that ransomware uses well. Save the approval chain for decisions above that threshold.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.1 The Six IR Phases' }],
      },

      {
        kind: 'compare',
        id: 'severity',
        title: 'Severity is a judgement that gets revisited',
        minutes: 7,
        lead:
          'Classification scales the response to the threat. It is reassessed with every new finding, not set once at the top of the ticket.',
        columns: [{ label: 'Definition' }, { label: 'Response target' }, { label: 'Escalates to' }],
        rows: [
          {
            label: 'P1 — Critical',
            cells: [
              'Active breach, data theft, or ransomware spreading in real time',
              'Immediate, all hands',
              'IR Lead and CISO at once; legal and PR on standby',
            ],
          },
          {
            label: 'P2 — High',
            cells: [
              'Confirmed compromise, contained, investigation ongoing',
              'Within 1 hour',
              'IR Lead, who decides whether the CISO is needed',
            ],
          },
          {
            label: 'P3 — Medium',
            cells: [
              'Suspicious activity confirmed, compromise not yet verified',
              'Within 4 hours',
              'Tier 2, with the full triage context',
            ],
          },
          {
            label: 'P4 — Low',
            cells: [
              'Likely false positive or minor policy violation',
              'Next business day',
              'Nobody — closed at Tier 1 with documentation',
            ],
          },
        ],
        callout: {
          tone: 'warn',
          text: 'Escalate immediately, without waiting, for: ransomware anywhere on the network, confirmed data theft, compromise of privileged accounts, anything touching critical infrastructure, or anything likely to require breach notification.',
        },
        provenance: 'source',
        sources: [{ file: FILE, section: '4.2 Severity Classification & Escalation' }],
        detail: [
          'Every escalation message states, in plain language: what happened, when it started, what is affected, what has been done, what you need, and the current severity and trajectory. Trajectory matters as much as the level — "P2 and stable" and "P2 and climbing" require different responses from the person receiving it.',
          'Communications rule: use out-of-band channels. If the attacker has mail access they can read your response plan. Limit information to those who need it. And say what you know, say what you do not know, say what you are doing about it, and do not guess.',
          'A conservative initial classification is always safer. An unnecessary P1 costs analyst time. A missed P1 is measured in encrypted files and regulatory fines.',
        ],
      },

      {
        kind: 'concept',
        id: 'volatility',
        title: 'Order of volatility: collect what disappears first',
        minutes: 9,
        lead:
          'This is the hinge between response and forensics. Before you change anything, capture everything — in the order of how fast it vanishes.',
        points: [
          'CPU registers and cache — lost the instant the processor state changes. Practically uncollectable.',
          'RAM — lost on any reboot or power loss. Contains credentials, injected code, encryption keys, live connections.',
          'Active network connections and running processes — change continuously.',
          'Disk contents — stable, but can be overwritten.',
          'Remote and archival logs — most stable, but rotation eventually loses them too.',
        ],
        diagram: {
          type: 'ladder',
          alt: 'Order of volatility shown as a descending ladder from most to least volatile. CPU registers and cache are lost instantly. RAM is lost on reboot. Active connections and running processes change continuously. Disk contents are stable but overwritable. Remote and archival logs are the most stable. Collection proceeds from the top of the ladder downwards.',
          rungs: [
            { label: '1 · CPU registers and cache', note: 'Gone the moment state changes', tone: 'attack' },
            { label: '2 · RAM', note: 'Credentials, injected code, encryption keys, live connections — gone on reboot', tone: 'attack' },
            { label: '3 · Connections and processes', note: 'Changing continuously while you read them', tone: 'hypothesis' },
            { label: '4 · Disk', note: 'Stable, but overwritable', tone: 'observation' },
            { label: '5 · Remote and archival logs', note: 'Most stable — and already off the host, beyond the attacker\'s reach', tone: 'confirmed' },
          ],
        },
        callout: {
          tone: 'warn',
          text: 'Never reboot a potentially compromised machine before capturing memory. This is the single most common evidence-destruction mistake in incident response. The non-negotiable sequence is: memory capture, then log and network export, then isolation.',
        },
        redView:
          'Memory forensics is what fileless technique exists to defeat, and it works only if the defender captures memory before shutting down. The race between an attacker destroying evidence and a defender capturing it is won by whoever rehearsed.',
        blueView:
          'For most incidents involving active malware, the volatile evidence in RAM is worth more than the marginal quality gain of a cleaner disk image from a powered-off machine. Memory capture on a 16 GB host takes three to five minutes.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.4 Chain of Custody & Order of Volatility' }],
      },

      {
        kind: 'concept',
        id: 'containment',
        title: 'Containment freezes the situation — it does not fix it',
        minutes: 7,
        lead:
          'Four methods, and a list of four things that destroy evidence while appearing to help.',
        points: [
          'EDR network isolation — freezes the host for investigation while keeping the management channel. Fastest and cleanest.',
          'Account disable, never delete — stops access while preserving the audit history, which is itself evidence.',
          'Firewall block or DNS sinkhole — cuts the C2 channel at the perimeter.',
          'VLAN isolation — separates several affected systems where some connectivity is still required.',
        ],
        callout: {
          tone: 'warn',
          text: 'Do not reboot before capturing memory. Do not delete suspicious files before imaging the disk. Do not discuss the incident on systems that may be compromised. Do not wipe a machine before imaging it — a wiped machine cannot be investigated.',
        },
        redView:
          'Immediate isolation warns the operator, who may then take destructive action. Monitoring for longer risks more damage but reveals more scope. This is a judgement, and an attacker benefits either way if you have not decided the criteria in advance.',
        blueView:
          'The containment dilemma belongs in the IR plan with written criteria, decided in advance, not improvised at 02:00 under pressure from a service owner.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.3 Containment Strategies' }],
      },

      {
        kind: 'evidence',
        id: 'custody',
        title: 'Instructor demonstration: a chain of custody record',
        minutes: 14,
        synthetic: true,
        lead:
          'This record is what makes an investigation survive challenge. Select each line to see what it is defending against.',
        caption: 'Synthetic chain of custody entry for a disk image',
        source: 'Fabricated for teaching. Structure follows standard forensic custody practice.',
        lines: [
          {
            text: 'Case:          IR-2026-0314-FINANCE',
            note: {
              kind: 'observation',
              label: 'Assigned before collection begins',
              body: 'The case number is created at the start of the response, not when the first item is collected. Every artefact, note and action references it. Without it, items collected by different responders cannot be reliably related to one another afterwards.',
            },
          },
          {
            text: 'Item:          Disk image of FINANCE-PC-04, internal NVMe, 512GB',
            note: {
              kind: 'observation',
              label: 'Specific enough to be unambiguous',
              body: 'Identify the physical item, not the role. "The finance laptop" is not an identification — there may be forty. Serial numbers where available.',
            },
          },
          {
            text: 'Collected by:  S. Chen, Senior Forensic Analyst',
            note: {
              kind: 'observation',
              label: 'A named person, not a team',
              body: 'Custody attaches to individuals. "The IR team" cannot testify to what it did. If this is challenged, a specific person must be able to account for a specific action.',
            },
          },
          {
            text: 'Date/Time:     2026-03-14 09:47 UTC',
            note: {
              kind: 'observation',
              label: 'UTC, always',
              body: 'Timezone ambiguity destroys timelines. Record UTC and record it consistently. Separately, note the machine\'s own clock against actual time — clock skew shifts every timestamp in every artefact you will later correlate.',
            },
          },
          {
            text: 'Method:        FTK Imager v4.7.1, hardware write-blocker (Tableau T35u), E01 format',
            note: {
              kind: 'observation',
              label: 'Tool, version, and the write blocker',
              body: 'Tool version matters because tool behaviour changes between versions. The write blocker is the part defending against the specific objection that your examination modified the evidence — connecting a drive without one lets Windows alone update access timestamps and volume metadata.',
            },
          },
          {
            text: 'Hash (source): sha256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            note: {
              kind: 'confirmed',
              label: 'Taken before imaging',
              body: 'Hash the source first. This is the reference value everything later is compared against. Without a pre-image hash you can prove the image has not changed since you made it, but not that it matches what you collected.',
            },
          },
          {
            text: 'Hash (image):  sha256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            note: {
              kind: 'confirmed',
              label: 'Identical — the acquisition is verified',
              body: 'Two matching hashes establish that the image is a faithful copy. This is the technical foundation of the whole custody argument: not a procedural claim, a cryptographic one.',
            },
          },
          {
            text: 'Storage:       Evidence locker #7, sealed, access log attached',
            note: {
              kind: 'response',
              label: 'Custody continues after collection',
              body: 'The chain does not end at acquisition. Every subsequent access is logged. An undocumented gap — even a brief one, even an innocent one — is the gap an opposing expert will ask about.',
            },
          },
          {
            text: 'Analysis hash: sha256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  (2026-04-02)',
            note: {
              kind: 'confirmed',
              label: 'Re-hashed before analysis, weeks later',
              body: 'Hash again before analysis and again before presenting findings. If the values ever differ, stop. Do not continue the analysis. Document the discrepancy and escalate — a mismatch is a finding about the evidence, and proceeding past it contaminates everything that follows.',
            },
          },
        ],
        proves: [
          'The image is a byte-faithful copy of the source drive as it existed at 09:47 UTC on 2026-03-14',
          'A hardware write blocker was used, so the source was not modified during acquisition',
          'The image was unchanged between acquisition and the start of analysis nineteen days later',
        ],
        doesNotProve: [
          'That the source drive was not modified before 09:47 — only that it has not been since',
          'That the contents of the image are accurate records of what occurred, which is a separate question about the system, not about the evidence',
          'That the system clock was correct. Clock skew is recorded separately and must be, or every correlated timestamp is wrong by an unknown amount.',
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '4.4 Chain of Custody & Order of Volatility' }],
        detail: [
          'The hash is the whole argument. It is a unique fingerprint of the data, and a single changed bit produces a completely different value. Two matching hashes are a mathematical statement that the evidence is intact; a mismatch is a mathematical statement that it is not.',
          'E01 is preferred over raw .dd for legal proceedings because it carries the hash and acquisition metadata inside the image format itself, rather than in a separate file that can be lost or edited independently.',
        ],
      },

      {
        kind: 'interaction',
        id: 'timeline',
        title: 'Guided analysis: build the incident timeline',
        minutes: 22,
        component: 'timeline-reconstruct',
        lead:
          'Evidence fragments from three sources, out of order. Place each one in the right lane and the right sequence, then see what the assembled timeline reveals that no single fragment did.',
        teaches:
          'That a timeline is built from independent sources that each see part of the event, and that the gaps between lanes are where both the attacker operated and your detection failed.',
        provenance: 'source',
        sources: [
          { file: FILE, section: '4.6 Timeline Construction & Artifact Prioritization' },
          { file: FILE, section: '7. Scenario Walkthrough: Finance Machine Compromise & Forensic Follow-Up' },
        ],
        data: {
          caption: 'Synthetic incident: FINANCE-PC-04, 08:47–09:30',
          events: [
            { id: 'e1', time: '08:47:02', pillar: 'endpoint', kind: 'attack', title: 'Phishing attachment opened', body: 'jsmith opens Q3_Update.xlsm. The macro executes.', evidence: 'Browser download artefact; LNK file; Prefetch for EXCEL.EXE', attack: 'T1566.001' },
            { id: 'e2', time: '08:47:09', pillar: 'endpoint', kind: 'attack', title: 'Encoded PowerShell executed', body: 'EXCEL.EXE spawns powershell.exe with an encoded command.', evidence: 'Sysmon Event ID 1; Event ID 4688; Prefetch for powershell.exe', attack: 'T1059.001' },
            { id: 'e3', time: '08:48:31', pillar: 'network', kind: 'attack', title: 'Secondary payload downloaded', body: 'Outbound connection retrieves a second-stage binary.', evidence: 'Sysmon Event ID 3; proxy log; firewall connection record', attack: 'T1105' },
            { id: 'e4', time: '08:49:14', pillar: 'endpoint', kind: 'attack', title: 'Credential harvesting begins', body: 'An infostealer reads browser credential stores.', evidence: 'Sysmon Event ID 10; file access events on browser profile paths', attack: 'T1555' },
            { id: 'e5', time: '08:52:40', pillar: 'endpoint', kind: 'attack', title: 'Persistence established', body: 'A scheduled task is created to re-run the payload at logon.', evidence: 'Event ID 4698; task XML on disk; registry TaskCache', attack: 'T1053.005' },
            { id: 'e6', time: '09:00:12', pillar: 'identity', kind: 'observation', title: 'SIEM alert fires', body: 'Correlation rule for encoded PowerShell triggers. P3 assigned automatically.', evidence: 'SIEM alert record' },
            { id: 'e7', time: '09:05:33', pillar: 'identity', kind: 'hypothesis', title: 'Tier 1 confirms true positive', body: 'Analyst decodes the command, confirms the download and the dropped file. Escalates as P2.', evidence: 'Ticket notes; CyberChef decode output' },
            { id: 'e8', time: '09:11:47', pillar: 'network', kind: 'confirmed', title: 'Two further hosts found contacting the same C2', body: 'Cross-machine query finds the same destination from two other endpoints. Severity raised to P1.', evidence: 'EDR cross-machine query; firewall logs' },
            { id: 'e9', time: '09:13:20', pillar: 'endpoint', kind: 'response', title: 'Memory captured on all three hosts', body: 'RAM acquired before any containment action. This is the decision the rest of the investigation depends on.', evidence: 'Magnet RAM Capture; hashes recorded at acquisition' },
            { id: 'e10', time: '09:15:05', pillar: 'network', kind: 'response', title: 'Hosts isolated, C2 blocked', body: 'EDR network isolation applied; destination blocked at firewall and DNS.', evidence: 'EDR console action log; firewall change record' },
            { id: 'e11', time: '09:16:40', pillar: 'identity', kind: 'response', title: 'Accounts disabled, not deleted', body: 'Three accounts disabled. Audit history preserved as evidence.', evidence: 'Directory service change log' },
            { id: 'e12', time: '09:30:00', pillar: 'endpoint', kind: 'response', title: 'Disk imaging begins', body: 'Hardware write blockers connected; E01 images created; hashes recorded.', evidence: 'FTK Imager log; chain of custody forms' },
          ],
          missedDetections: [
            { at: '08:47:09', text: 'The Office-spawning-interpreter rule from Session 4 would have fired here — thirteen minutes before the rule that actually caught it.' },
            { at: '08:48:31', text: 'No outbound download detection existed. The connection to an unrecognised destination passed without comment.' },
            { at: '08:49:14', text: 'LSASS and credential store access had no alert. Thirteen minutes of credential theft went unobserved.' },
            { at: '08:52:40', text: 'Persistence creation was logged and not alerted. The event existed; nothing read it.' },
          ],
          debrief:
            'Thirteen minutes elapsed between the first detectable event and the alert that actually fired, and four separate detection opportunities passed in that window. The response from 09:00 onwards is textbook — and the entire margin was lost before it began.',
        },
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
            stem: 'A compromised server is running. The business needs it rebooted in ten minutes. What do you do?',
            options: [
              {
                text: 'Capture memory first, then export logs and network state, then allow the reboot',
                correct: true,
                feedback:
                  'Correct. Memory capture on a typical host takes three to five minutes, which fits. The sequence is non-negotiable because RAM is the only place some evidence exists, and a reboot is irreversible.',
              },
              {
                text: 'Refuse the reboot until the full investigation is complete',
                correct: false,
                feedback:
                  'Rarely tenable and usually unnecessary. The volatile evidence is capturable in minutes; demanding hours when you need minutes damages the relationship you will need for the next incident.',
              },
              {
                text: 'Allow the reboot and rely on disk forensics afterwards',
                correct: false,
                feedback:
                  'This discards fileless malware evidence, injected code, live connections and any credentials or keys in memory. Disk forensics on a machine running fileless malware can legitimately report nothing wrong.',
              },
              {
                text: 'Isolate the host with EDR first, then capture memory',
                correct: false,
                feedback:
                  'Plausible and backwards. Network isolation may terminate the injected process you were trying to capture, destroying the connection evidence at the same moment it ends the connection. Capture first, isolate second.',
              },
            ],
          },
          {
            id: 'q2',
            stem: 'Three weeks after imaging a disk, you re-hash it before analysis and the value differs from the acquisition hash. What do you do?',
            options: [
              {
                text: 'Stop, document the discrepancy, and escalate before any analysis',
                correct: true,
                feedback:
                  'Correct. The mismatch is itself a finding about the integrity of the evidence. Analysing past it contaminates every conclusion you would draw and cannot be undone by noting it later.',
              },
              {
                text: 'Re-image from the source and continue',
                correct: false,
                feedback:
                  'The source may no longer exist, may have changed, and you have not established why the first image differs. This hides the problem rather than resolving it.',
              },
              {
                text: 'Note the difference in the report and proceed',
                correct: false,
                feedback:
                  'Proceeding is the error. Every finding you then produce rests on evidence you have just demonstrated is not intact.',
              },
              {
                text: 'Use the MD5 hash instead to check whether it also differs',
                correct: false,
                feedback: 'A second algorithm agreeing or disagreeing does not resolve the integrity question. The chain is already broken.',
              },
            ],
          },
          {
            id: 'q3',
            stem: 'Why disable a compromised account rather than delete it?',
            options: [
              {
                text: 'Deleting destroys the audit history attached to the account, which is itself evidence',
                correct: true,
                feedback:
                  'Correct. Both actions stop access. Only one preserves the record of what the account did, which you will need for scope, for the report, and potentially for proceedings.',
              },
              {
                text: 'Deleted accounts can be recreated by an attacker with the same name',
                correct: false,
                feedback:
                  'Technically possible and not the reason. A recreated account has a different SID and different permissions. The reason is evidence preservation.',
              },
              {
                text: 'Disabling is faster than deleting',
                correct: false,
                feedback: 'Both are near-instantaneous. Speed is not the distinction.',
              },
              {
                text: 'Deletion requires higher privileges',
                correct: false,
                feedback: 'Varies by environment and is not the forensic reason.',
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
          'Capture memory before any other action, every time. This rule is broken more often than any other.',
          'Hash at every stage. A mismatch is a stop event, not a footnote.',
          'Containment freezes; it does not fix. Evidence comes first in the same breath.',
          'Severity is reassessed continuously. A P3 at 09:00 can be a P1 at 09:11.',
          'Multiple evidence sources resist anti-forensics. An attacker who clears one log cannot clear them all.',
          'Lessons learned is where an incident becomes a detection improvement, and it depends entirely on what you preserved.',
        ],
        furtherStudy: [
          { label: 'NIST SP 800-61r2', note: 'The authoritative incident handling guide behind the six-phase model.', href: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final' },
          { label: 'RFC 3227 — Guidelines for Evidence Collection and Archiving', note: 'The primary source for order of volatility.', href: 'https://datatracker.ietf.org/doc/html/rfc3227' },
          { label: 'Volatility Foundation', note: 'The memory analysis framework. Used properly in Session 7.', href: 'https://volatilityfoundation.org/' },
        ],
      },
    ],
  },

  practical: {
    minutes: 90,
    title: 'Workshop: Run the incident',
    blocks: [
      {
        kind: 'brief',
        id: 'brief',
        title: 'Briefing',
        minutes: 10,
        synthetic: true,
        resourceDir: 'incident-response',
        scenario:
          'You are the incident lead. An alert has fired on a finance workstation. As you work, new information arrives on a timer — and some of it changes the severity. Your decisions are recorded with timestamps, and the sequence is what is assessed.',
        objectives: [
          'Classify the incident and reclassify it correctly as the injects arrive',
          'Sequence evidence capture and containment so that nothing volatile is lost',
          'Produce a complete chain of custody record for every item collected',
          'Build a forensic timeline from the evidence available and identify the anti-forensic activity in it',
          'Write a post-incident report with a root cause and specific detection recommendations',
        ],
        requires: [
          { item: 'The incident pack (downloadable from this page)', note: 'Initial alert, five timed injects in sealed sections, evidence inventory, and the artefact fragments for the timeline.', file: '00-incident-pack.md' },
          { item: 'Chain of custody forms and the post-incident report template (downloadable)', note: 'Standard forensic forms, pre-structured.', file: '01-custody-and-report.md' },
          { item: 'A clock', note: 'Real elapsed time. The injects are released on a schedule and your decision times are part of the record.' },
          { item: 'A text editor', note: 'For the decision log, custody records and report.' },
        ],
        setup: [
          'Download the incident pack, custody forms and report template.',
          'Create a working folder named IR-2026-<your-initials>, with the subfolder structure given in the deliverables section.',
          'Open the decision log and record your start time before reading the alert.',
          'Do not open the inject sections ahead of time. Open each only when the clock reaches it — reading ahead removes the decision-under-uncertainty that this workshop exists to teach.',
        ],
        realism:
          'No machine is imaged and no memory is captured — you are recording the decisions and producing the documentation, not operating FTK Imager. That is deliberate: tool operation is a half-day of supervised practice with the real software, while decision sequencing under incomplete information is the part that takes a career to learn and the part that fails in real incidents. The pack states which tool each step would use, and the recap links the vendor documentation.',
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Combined IR + Evidence Workflow' }],
      },

      {
        kind: 'tasks',
        id: 'tasks',
        title: 'Your tasks',
        minutes: 55,
        lead:
          'Injects arrive at 10, 20, 30 and 40 minutes into the task window. Everything is timestamped. Work the incident, do not read ahead.',
        tasks: [
          {
            ref: 'T1',
            minutes: 10,
            title: 'Identification and initial classification',
            steps: [
              'Read the initial alert and the supporting evidence provided with it.',
              'Confirm whether it is a true positive, and record what evidence establishes that.',
              'Assign an initial severity and justify it in one sentence.',
              'Record the incident start time — the attacker\'s start time, not yours. These are different and the difference matters.',
            ],
            produces: 'An initial classification with justification, and the incident start time with its evidence.',
          },
          {
            ref: 'T2',
            minutes: 15,
            title: 'Evidence capture and containment — in the right order',
            steps: [
              'Decide what evidence to capture and in what order. Write the order down before you write the actions.',
              'Record each capture as a decision with a timestamp and a reason.',
              'Decide your containment actions and record when each is taken relative to the captures.',
              'For every item you would collect, complete a chain of custody record.',
              'When inject 1 arrives, reassess severity and record whether it changed and why.',
            ],
            produces: 'A timestamped decision log and a complete custody record per item.',
          },
          {
            ref: 'T3',
            minutes: 18,
            title: 'Build the timeline',
            steps: [
              'Assemble the artefact fragments in the pack into one chronological timeline.',
              'Record the source of each entry. Entries with no named source do not belong in a forensic timeline.',
              'Mark each entry: observation, hypothesis or confirmed. Confirmed requires two independent sources.',
              'Identify the anti-forensic activity. There is at least one instance, and finding what survived it is the point.',
              'Note every point where a detection opportunity existed and no alert fired.',
            ],
            produces: 'A sourced, classified timeline with anti-forensic activity and missed detections marked.',
          },
          {
            ref: 'T4',
            minutes: 12,
            title: 'Post-incident report',
            steps: [
              'Write the executive summary: what happened, impact, current status, in plain language.',
              'State the root cause — the specific initial access method, not a category.',
              'Summarise the evidence and custody position, including anything you could not verify.',
              'Write three detection recommendations, each naming the technique it covers and what it would not catch.',
              'Answer the question the source material requires every report to answer: if this exact attack happened again tomorrow, would we detect it in the first ten minutes?',
            ],
            produces: 'A post-incident report with root cause, evidence summary and three specific recommendations.',
          },
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Combined IR + Evidence Workflow' }],
      },

      {
        kind: 'hints',
        id: 'hints',
        title: 'Progressive hints',
        hints: [
          {
            forTask: 'T1',
            tiers: [
              'Incident start time is when the attacker started, which the alert does not tell you. Work backwards from the earliest artefact in the pack.',
              'Initial severity: is anything spreading right now, is anything confirmed, is data confirmed to have left? Those three questions place it.',
              'If you are uncertain between two levels, take the higher one and say why. The cost of being conservative is analyst time; the cost of being optimistic is measured in encrypted files.',
            ],
          },
          {
            forTask: 'T2',
            tiers: [
              'Order of volatility is the answer to "what first". Read down the ladder from the theory section.',
              'Ask of each containment action: does this change the state of something I have not captured yet? Network isolation changes network state. Rebooting changes everything.',
              'If an inject raises severity, your containment scope probably needs to widen too. Record that reasoning explicitly — the reassessment is assessed, not just the final level.',
            ],
          },
          {
            forTask: 'T3',
            tiers: [
              'Sort by timestamp first, then attribute sources. Do not interpret anything until both are done.',
              'Anti-forensic activity leaves its own trace. A log clear is an event. A truncated file has a modification time. An unexpectedly empty history file is itself evidence.',
              'For "what survived": anything already forwarded off the host before the clear is untouched. That is the argument for centralised logging, and it is the most important sentence in your report.',
            ],
          },
          {
            forTask: 'T4',
            tiers: [
              'Root cause is one specific thing. "Phishing" is a category. "A macro-enabled attachment from an external sender, opened by a user, with macros not disabled by policy" is a root cause you can act on.',
              'Each recommendation should name a technique ID and a data source. Without those it is a wish.',
              'For the ten-minute question, be honest. "No, because we still have no outbound download detection" is a far more valuable answer than an optimistic yes.',
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
        lead: 'This structure is the case file layout from the source material. Build it first and populate as you go.',
        items: [
          { ref: 'D1', text: 'Timestamped decision log covering classification, capture and containment', required: true },
          { ref: 'D2', text: 'Chain of custody record for every item collected, with hashes', required: true },
          { ref: 'D3', text: 'Forensic timeline, sourced and classified, with anti-forensic activity marked', required: true },
          { ref: 'D4', text: 'Severity reassessment record showing each change and what triggered it', required: true },
          { ref: 'D5', text: 'Post-incident report with root cause and three detection recommendations', required: true },
          { ref: 'D6', text: 'An honest answer to the ten-minute question', required: true },
        ],
        structure: `IR-2026-<your-initials>/
  evidence/
    memory_dumps/       → what you would capture, with custody records
    disk_images/        → what you would image, with custody records
    log_exports/        → the SIEM export for the incident window
  timeline/             → the assembled forensic timeline
  iocs/                 → addresses, domains, hashes, accounts
  mitre_mapping/        → techniques with supporting evidence for each
  chain_of_custody/     → all custody forms and hash records
  decisions/            → the timestamped decision log
  report/               → the post-incident report`,
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Case Documentation Template' }],
      },

      {
        kind: 'assessment',
        id: 'assessment',
        title: 'How this is assessed',
        criteria: [
          {
            band: 'Evidence sequencing',
            weight: '30%',
            descriptor:
              'Memory before isolation, isolation before shutdown. Every containment action is checked against what it would change. Any sequence that would destroy volatile evidence loses most of this band regardless of the rest.',
          },
          {
            band: 'Chain of custody completeness',
            weight: '20%',
            descriptor:
              'Every item has a named collector, a UTC timestamp, a method with tool version, hashes at each stage, and a storage record. Gaps are identified rather than papered over.',
          },
          {
            band: 'Timeline quality',
            weight: '20%',
            descriptor:
              'Chronological, sourced per entry, classified by confidence. Anti-forensic activity identified, with a statement of what survived it.',
          },
          {
            band: 'Severity judgement',
            weight: '15%',
            descriptor:
              'Classification is justified and reassessed as injects arrive. The reasoning for each change is recorded, not just the new level.',
          },
          {
            band: 'Report quality',
            weight: '15%',
            descriptor:
              'A specific root cause, not a category. Three recommendations naming techniques and data sources. An honest answer to the ten-minute question.',
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
          'Who captured memory before isolating? Who did it the other way round, and what would have been lost?',
          'Compare incident start times across the room. Who worked back furthest, and what artefact let them?',
          'At which inject did severity change for you? Did everyone change at the same one?',
          'Did anyone take a containment action that would have destroyed evidence they had not yet captured?',
          'What anti-forensic activity did the room find, and what survived it?',
          'Answer the ten-minute question aloud. How many in the room answered no, and what would have to change?',
        ],
        landingPoint:
          'Response and evidence are a single activity performed under time pressure, and the sequence is the skill — because every containment action is simultaneously an act of preservation or an act of destruction, and you do not get to decide which one afterwards.',
        provenance: 'supplementary',
      },

      {
        kind: 'recap',
        id: 'recap',
        title: 'Recap and further study',
        provenance: 'source',
        sources: [{ file: FILE, section: '13. Summary' }],
        takeaways: [
          'IR and evidence collection are one event. The order of operations determines whether the investigation is possible.',
          'The six phases exist because skipping any one reliably causes worse outcomes than the attack.',
          'Order of volatility: RAM before connections before disk before archived logs.',
          'Chain of custody with hash verification is what makes findings defensible.',
          'Disk shows history; memory shows the live state. Fileless malware is invisible to the first.',
          'Timelines built from many sources resist anti-forensic cleanup far better than single-source timelines.',
        ],
        furtherStudy: [
          { label: 'NIST SP 800-86 — Integrating Forensic Techniques into Incident Response', note: 'The companion to 800-61, covering acquisition and analysis.', href: 'https://csrc.nist.gov/pubs/sp/800/86/final' },
          { label: 'Plaso / log2timeline', note: 'The super-timeline tool referenced throughout this session.', href: 'https://plaso.readthedocs.io/' },
          { label: 'Next: Session 6 — Host Forensics', note: 'You preserved the evidence. Next: reading it, on Windows and Linux, when the attacker has deleted their tools.' },
        ],
      },
    ],
  },

  terms: [
    { term: 'Order of volatility', definition: 'The rule for sequencing evidence collection by how quickly each type disappears. RAM before disk, always.' },
    { term: 'Chain of custody', definition: 'The documented, unbroken record of who handled evidence, when, and what they did with it.' },
    { term: 'Write blocker', definition: 'A hardware device preventing any write to an evidence drive during acquisition. Hardware is preferred to software for legal proceedings.' },
    { term: 'E01', definition: 'The Expert Witness forensic image format. Carries hashes and acquisition metadata inside the image itself.' },
    { term: 'Timestomping', definition: 'Altering file timestamps to hide activity. Detectable through inconsistency between NTFS timestamp sets.' },
    { term: 'Super-timeline', definition: 'A combined chronological timeline built from every artefact source at once, typically with log2timeline/Plaso.' },
    { term: 'Dead acquisition', definition: 'Imaging a powered-off machine. Cleanest disk image, and it sacrifices everything that was in RAM.' },
  ],
}
