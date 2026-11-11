import type { Session } from '@/types/content'

const FILE = 'defensive_day_1_soc_operations_esl.md'

export const session01: Session = {
  number: 1,
  slug: 'soc-operations',
  title: 'The SOC: Detection, Triage and Response',
  summary:
    'Who watches for the attacks you already know how to run — and how an alert becomes an incident.',
  abstract:
    'The Foundation track taught you how attackers get in. This session introduces the organisation that watches for it. You will learn what each SOC tier actually decides, what SIEM, EDR and XDR each see and miss, why a detection rule is worthless without the log pipeline underneath it, and how a raw event becomes a triaged alert, an investigation, and finally an incident. The practical puts you on a Tier 1 shift.',
  track: 'core',
  themes: ['Tiers', 'Telemetry', 'Triage'],
  prerequisites: [
    'Foundation track: the Kill Chain, lateral movement, credential theft and persistence (supplied separately — see the source notes)',
    'Comfort reading a table of log fields; no query language required yet',
  ],
  outcomes: [
    'Describe what each SOC tier decides, and name the exact point at which an alert is handed on',
    'Choose the right telemetry source (SIEM, EDR or XDR) for a given investigative question, and state what that source cannot see',
    'Apply the six-question triage context checklist to an alert and reach a documented close-or-escalate decision',
    'Map a confirmed finding to a MITRE ATT&CK technique and explain what the mapping tells you about attack phase',
    'Write a Tier 1 escalation note that a Tier 2 analyst can act on without asking a follow-up question',
  ],
  sourceFiles: [FILE],
  sourceNotes: [
    'The source file closes with a forward pointer to "detection engineering … and proactive threat hunting" as the next day. In the supplied sequence the next file is Day 2 (log analysis), and detection engineering is Day 4. The backward-pointing "Yesterday" chain across all ten files is internally consistent, so this course follows that chain. The forward pointer appears to survive from an earlier ordering.',
    'The file repeatedly references a "Foundation series" (Days 1, 4, 5, 6, 7, 8 and 9) as assumed prior knowledge. Those files were not supplied, so this session states the specific prerequisites inline rather than assuming them silently.',
  ],

  theory: {
    minutes: 90,
    blocks: [
      {
        kind: 'title',
        id: 'open',
        title: 'Session 1',
        overline: 'Defensive Track · Session 01 of 10',
        lead: 'Cameras record whether or not anyone is watching. This session is about the room where someone watches.',
        provenance: 'source',
        sources: [{ file: FILE, section: '2. Introduction' }],
      },

      {
        kind: 'retrieval',
        id: 'retrieval',
        title: 'What you already know',
        minutes: 6,
        recallPrompt:
          'Answer from memory first, then check. These come from the Foundation track — they are the attacker-side facts this session turns around.',
        questions: [
          'An attacker lands on a workstation and needs to reach a file server. Name two things they must do that a defender could, in principle, see.',
          'Why does an attacker prefer a tool that is already installed on the target over one they bring with them?',
          'Persistence means surviving a reboot. Name one Windows and one Linux mechanism that achieves it.',
          'If an organisation has no record of what happened on a machine last Tuesday, what has it lost?',
        ],
        answers: [
          'They must authenticate to the destination, and they must move data across the network between the two hosts. Both are recordable: authentication in the identity logs, the connection in the network logs.',
          'Because a tool that ships with the operating system is signed, trusted, and frequently excluded from monitoring — so it is less likely to match a signature. This is the idea behind LOLBins, covered properly in Session 2.',
          'Windows: a scheduled task or a registry Run key. Linux: a cron job or an entry in SSH authorized_keys.',
          'The ability to prove anything. Without logs there is no investigation, no incident report, no regulatory answer and no legal case — only an assertion.',
        ],
        provenance: 'supplementary',
        detail: [
          'These retrieval questions are a course addition, not from the source file. They exist because the source assumes the Foundation track as prior knowledge and this session needs that knowledge active, not merely present.',
        ],
      },

      {
        kind: 'scenario',
        id: 'scenario',
        title: 'Opening scenario: 03:04, Tuesday',
        minutes: 4,
        synthetic: true,
        setting: 'Tier 1 queue, retail bank SOC. Night shift. One analyst on duty.',
        narrative: [
          'An alert lands at the top of your queue. The rule name reads AUTH-CORR-004: Failed Logon Burst Followed By Success. The account is svc-dbadmin. The source address is 185.220.101.45.',
          'You have fourteen other alerts open. Eleven of them have been sitting there since the evening shift. Your shift ends at 07:00 and your performance is measured on queue depth.',
          'The entire difference between a four-minute dismissal and a contained breach is what you do in the next ninety seconds.',
        ],
        drivingQuestion:
          'What would you need to know before you could responsibly close this alert — and where would each of those facts come from?',
        provenance: 'source',
        sources: [{ file: FILE, section: '7. Scenario Walkthrough: Tor Node Login at 3am' }],
        detail: [
          'This scenario is the source file\'s own walkthrough, re-staged as a cold open so that the structural content that follows has somewhere to land. Every detail — the account, the address, the correlation rule — is synthetic. 185.220.0.0/16 is used here because ranges in that block are commonly associated with Tor exit infrastructure and will look familiar to students later; no live lookup is implied.',
          'The pressure in the scenario is deliberate. The source material identifies alert fatigue as an attacker ally, and a scenario with no time pressure teaches triage as a leisurely activity, which is not what it is.',
        ],
      },

      {
        kind: 'objectives',
        id: 'objectives',
        title: 'What you will be able to do',
        minutes: 3,
        provenance: 'supplementary',
        objectives: [
          { verb: 'Describe', text: 'what each SOC tier decides, and the exact handover point between tiers' },
          { verb: 'Choose', text: 'the right telemetry source for an investigative question, and state its blind spot' },
          { verb: 'Apply', text: 'the six-question context checklist to reach a documented triage decision' },
          { verb: 'Map', text: 'a confirmed finding to an ATT&CK technique and infer the attack phase from it' },
          { verb: 'Write', text: 'an escalation note that needs no follow-up question' },
        ],
        prerequisites: [
          'Foundation track attacker fundamentals (see Session overview for the specific assumptions)',
        ],
      },

      {
        kind: 'concept',
        id: 'tiers',
        title: 'The SOC runs in tiers, and a tier is a decision, not a seniority',
        minutes: 5,
        lead: 'Each tier is defined by the question it is allowed to answer and the point at which it must hand the problem on.',
        points: [
          'Tier 1 answers one question: is this real, or is it noise? They do not investigate — they route, and they document.',
          'Tier 2 answers two: how did it happen, and how far did it go? They build the timeline and determine scope.',
          'Incident Response starts from confirmed findings, never from suspicion. Its job is contain, eradicate, recover.',
          'Detection Engineering does not watch anything. It builds the rules, and it owns the ATT&CK coverage map.',
          'The loop closes when Tier 1 feeds a documented false positive back to Detection Engineering. Without that step, a SOC never improves — it just gets older.',
        ],
        diagram: {
          type: 'tiers',
          alt: 'Four SOC functions in sequence. Tier 1 asks "is this real?" and hands off a triaged alert with context. Tier 2 asks "how did it happen and how far did it go?" and hands off a confirmed incident. Incident Response asks "how do we contain, eradicate and recover?" and hands off lessons learned. Detection Engineering asks "what rule would have caught this sooner?" and hands improved rules back to Tier 1, closing the loop.',
          tiers: [
            {
              label: 'Tier 1 · Triage',
              question: 'Is this real, or is it noise?',
              handsOff: 'A triaged alert with context, or a documented closure',
            },
            {
              label: 'Tier 2 · Investigation',
              question: 'How did it happen? How far did it go?',
              handsOff: 'A confirmed incident with scope and a timeline',
            },
            {
              label: 'Incident Response',
              question: 'How do we contain, eradicate and recover?',
              handsOff: 'A restored environment and lessons learned',
            },
            {
              label: 'Detection Engineering',
              question: 'What rule would have caught this sooner?',
              handsOff: 'Tuned rules and a current coverage map — back to Tier 1',
            },
          ],
        },
        redView:
          'The tier structure is predictable, and predictability is targetable. Tier 1 handles high volume with low context. Activity engineered to look like noise at Tier 1 survives triage, because nobody at Tier 1 has the time or the mandate to connect it to anything else.',
        blueView:
          'The structure is a force multiplier only if escalation criteria are written down and Tier 1 documentation is complete. An undocumented closure is indistinguishable from an alert nobody read.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.1 SOC Roles & Structure' }],
        detail: [
          'The 911-operator analogy in the source material is worth keeping in mind: a dispatcher does not investigate the crime, and is not failing when they do not. They route correctly and ensure nothing is dropped. Measuring a Tier 1 analyst on investigative depth is measuring the wrong thing; measure them on decision rate and documentation quality.',
          'The failure mode at each tier is specific. Tier 1 fails by dismissing without review. Tier 2 fails by declaring scope prematurely. IR fails by removing the obvious payload and missing the second persistence mechanism. Detection Engineering fails by writing more rules instead of better ones.',
          'Note that "tier" describes scope of decision, not skill. A good Tier 1 analyst with a complete context checklist outperforms a distracted senior analyst with none, because the checklist is what makes the decision reproducible.',
        ],
      },

      {
        kind: 'compare',
        id: 'stack',
        title: 'SIEM, EDR and XDR see different things',
        minutes: 5,
        lead: 'These are not competing products. They answer different questions, and each one is blind where another sees.',
        columns: [
          { label: 'SIEM', glyph: '▤' },
          { label: 'EDR', glyph: '▣' },
          { label: 'XDR', glyph: '⬢' },
        ],
        rows: [
          {
            label: 'Watches',
            cells: [
              'Logs forwarded from every system',
              'The individual endpoint, live',
              'Endpoint, network, email, cloud and identity, correlated',
            ],
          },
          {
            label: 'Core strength',
            cells: [
              'Breadth and historical search across years of data',
              'Depth of host behaviour, plus the ability to act — kill, isolate, roll back',
              'Automated correlation across layers a single tool cannot join',
            ],
          },
          {
            label: 'Answers',
            cells: [
              '"Has this ever happened before, anywhere?"',
              '"Why did Word just launch PowerShell on this machine?"',
              '"Is the email, the endpoint and the cloud login the same incident?"',
            ],
          },
          {
            label: 'Blind spot',
            cells: [
              'Anything not logged, or logged but not forwarded. A SIEM sees what systems reported, not what happened.',
              'Everything off the host. No view of the network path or of another machine.',
              'Activity spread over a window longer than its correlation rules look back.',
            ],
          },
          {
            label: 'Fails when',
            cells: [
              'A system is deployed without log onboarding',
              'The agent is uninstalled, disabled, or never deployed',
              'One of the feeding layers is missing, which silently degrades it to the layers it still has',
            ],
          },
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '4.2 SIEM, EDR & XDR: The Detection Stack' }],
        detail: [
          'The practical upgrade of EDR over antivirus is the shift from "is this file known to be bad?" to "is this behaviour explicable?" Antivirus matches a hash against a list. EDR asks why a process that has no business reading ten thousand files in thirty seconds is doing so. The first fails against anything new by definition; the second does not care whether the tool is new.',
          'A SOC with a SIEM and no EDR has history but no live host visibility — it knows what machines chose to report. A SOC with EDR and no SIEM has deep host detail with nothing to correlate it against. Both gaps are common and both are expensive to discover during an incident.',
          'Vendors use "XDR" inconsistently. Treat the term as a claim about correlation scope and verify which layers actually feed it before relying on it. A product badged XDR that only receives endpoint telemetry is an EDR with a different label.',
        ],
      },

      {
        kind: 'concept',
        id: 'pipeline',
        title: 'Every detection rests on a pipeline that can quietly fail',
        minutes: 5,
        lead: 'Logs arrive in a hundred formats. Normalisation turns them into one searchable shape. Each stage is a place where coverage disappears without an error message.',
        points: [
          'Source systems emit events — Windows Event Log, syslog, web server logs, cloud audit logs.',
          'A collector agent forwards them. If nobody installed it, that system is invisible and nothing says so.',
          'Parsing extracts structured fields: timestamp, source address, user, action, outcome.',
          'Normalisation maps those fields onto one schema, so one query reaches every source at once.',
          'Only then do correlation rules run. A rule cannot fire on data that never arrived.',
        ],
        diagram: {
          type: 'pipeline',
          alt: 'A five-stage log pipeline. Source systems emit events; a collector agent forwards them; a parser extracts structured fields; normalisation maps those fields onto a single schema; and finally storage, search and alerting run on the normalised data. A failure at any earlier stage silently removes coverage from every later stage.',
          stages: [
            { label: 'Source', note: 'Windows Event Log, syslog, web server, cloud audit' },
            { label: 'Collector', note: 'Filebeat, Winlogbeat, Syslog-NG — the silent failure point' },
            { label: 'Parse', note: 'Pull out timestamp, source.ip, user.name, event.action' },
            { label: 'Normalise', note: 'Map onto one schema — ECS in Elastic, CIM in Splunk' },
            { label: 'Search & alert', note: 'Correlation rules run here, and only here' },
          ],
        },
        callout: {
          tone: 'rule',
          text: 'Without normalisation, searching fifty sources means writing fifty queries — src_ip here, source_address there, client_ip somewhere else. With it, source.ip reaches all fifty.',
        },
        redView:
          'A gap in the pipeline is a gap in detection, and it is invisible from the console. Legacy systems, newly deployed cloud workloads and network appliances are the usual blind spots, and they are deliberately sought out.',
        blueView:
          'Pipeline health deserves the same attention as rule quality. A rule that should fire will not fire if its source stopped reporting three weeks ago. Log onboarding belongs on the deployment checklist, not in the backlog.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.3 Log Collection & Normalization Pipeline' }],
        detail: [
          'The dangerous property of this pipeline is that absence of logs and absence of attacks look identical from a dashboard. A quiet system is either healthy or unmonitored, and the console renders both as nothing. This is why log source coverage is audited separately from alert volume.',
          'Elastic Common Schema (ECS) and Splunk\'s Common Information Model (CIM) are the two schemas named in the source. Both are vendor-published field-naming standards; if you are working in either platform, the schema documentation is the authority on field names, not this course.',
        ],
      },

      {
        kind: 'concept',
        id: 'pillars',
        title: 'Three visibility pillars, and the gaps between them',
        minutes: 5,
        lead: 'You cannot detect what you are blind to. A real attack crosses all three pillars, and attackers move most freely in the seams.',
        points: [
          'Endpoint — what ran, what changed, what connected. Covered by EDR, Windows Event Logs, auditd.',
          'Network — who talked to whom, on what port, at what volume. Covered by firewall, IDS, NetFlow, DNS and proxy logs.',
          'Identity and cloud — who authenticated, who changed permissions, what storage was read. Covered by directory logs, CloudTrail, Azure Monitor, GCP Audit.',
          'Credential theft and persistence live on the endpoint. C2 and exfiltration cross the network. Permission changes live in identity and cloud.',
          'An attack that moves endpoint → cloud → cloud storage may never touch the network pillar at all. If cloud is the least mature pillar, that path is free.',
        ],
        diagram: {
          type: 'pillars',
          alt: 'Three telemetry pillars shown side by side. Endpoint covers execution, file changes and persistence, and is blind to anything that happens off the host. Network covers command-and-control traffic, lateral movement and data transfer volume, and is blind to what code was actually running. Identity and cloud cover authentication, permission changes and storage access, and are blind to host-level execution.',
          pillars: [
            {
              pillar: 'endpoint',
              covers: 'Execution, file writes, persistence, credential access',
              blindSpot: 'Anything that happens off this host',
            },
            {
              pillar: 'network',
              covers: 'C2 channels, lateral movement, transfer volume and timing',
              blindSpot: 'What code was running, and what was in encrypted payloads',
            },
            {
              pillar: 'identity',
              covers: 'Authentication, privilege changes, group membership',
              blindSpot: 'What the authenticated session then did on the host',
            },
            {
              pillar: 'cloud',
              covers: 'API calls, permission changes, storage reads, new resources',
              blindSpot: 'The on-premises half of a hybrid attack path',
            },
          ],
        },
        redView:
          'The seams are the target. An operator who compromises an endpoint, pivots to a cloud console with cached credentials and exfiltrates cloud-to-cloud generates no network-layer alert, because the traffic never crosses the perimeter being watched.',
        blueView:
          'Map coverage before writing rules. A lateral movement rule that joins two hosts is worth nothing if only one of them has endpoint visibility. Build visibility first, then build detection on top of it.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.4 Visibility Pillars: Endpoint, Network & Cloud' }],
        detail: [
          'The source file names three pillars: endpoint, network and cloud. This course splits identity out of cloud as a fourth lane in its timelines, because the authentication events the course spends most of its time on — Event IDs 4624, 4625, 4648, 4769 — are neither host-execution evidence nor network evidence, and tracking them in their own lane makes attack reconstruction clearer. The underlying content is unchanged; it is a presentation decision, and it is flagged here so you can map it back to the source cleanly.',
        ],
      },

      {
        kind: 'concept',
        id: 'attack',
        title: 'ATT&CK is a shared vocabulary, not paperwork',
        minutes: 4,
        lead: 'MITRE ATT&CK catalogues adversary techniques by tactic — the goal — and technique — the method. For a defender it does four specific jobs.',
        points: [
          'It is a shared language. T1078 means the same thing in every team, in every country, with no ambiguity in handovers.',
          'It identifies phase. Knowing the technique tells you where the attacker is: early discovery, or active exfiltration.',
          'It drives coverage mapping. Every rule is tagged; untagged techniques are visible gaps rather than unknown ones.',
          'It connects threat intelligence to action. A report saying a group uses T1055 becomes a specific thing to hunt for.',
          'The goal is not full coverage of all techniques. It is strong coverage of the techniques that matter to your sector.',
        ],
        callout: {
          tone: 'note',
          text: 'Technique identifiers in this course are given as written in the source material. Always confirm the current technique name and scope against attack.mitre.org before quoting it in a report — MITRE revises, renames and deprecates techniques between framework versions.',
        },
        redView:
          'A published coverage map tells an attacker precisely which techniques will and will not be seen. Some organisations treat their heatmap as sensitive operational information for exactly this reason.',
        blueView:
          'Mapping is what converts a closed incident into a correction to the coverage map. A SOC that closes incidents without mapping them never learns what it is blind to.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.5 MITRE ATT&CK: The Defender\'s Map' }],
        detail: [
          'Worked mappings from the source file: an account export at 23:00 is T1087.002, Account Discovery: Domain Account — a Discovery tactic, so the attacker is early and mapping the environment. PowerShell with an encoded command is T1059.001, Execution — code is running now. A new scheduled task is T1053.005, Persistence — they are settling in. A large outbound transfer is T1041, Exfiltration — data is leaving, and the window for prevention has closed.',
          'Read that list again as a sequence and notice what the mapping bought you: not four labels, but a position on a timeline and an answer to "how urgent is this?"',
        ],
      },

      {
        kind: 'evidence',
        id: 'demo-evidence',
        title: 'Instructor demonstration: reading the alert',
        minutes: 10,
        synthetic: true,
        lead:
          'Here is the alert from the opening scenario, as it actually appears in the queue. Select any line to see what it establishes — and what it does not.',
        caption: 'SIEM correlation alert AUTH-CORR-004, expanded to its constituent events',
        source: 'Synthetic Windows Security log excerpt, normalised. Not from a live environment.',
        lines: [
          {
            text: '03:04:11  4625  svc-dbadmin  185.220.101.45  LogonType=10  Status=0xC000006A',
            note: {
              kind: 'observation',
              label: 'Failed logon, wrong password',
              body: 'Event ID 4625 is a failed logon. Status 0xC000006A specifically means the password was wrong, as opposed to the account not existing or being locked out. LogonType 10 is RemoteInteractive — an RDP session. This line establishes that someone tried an RDP logon and got the password wrong. It establishes nothing about who.',
            },
          },
          {
            text: '03:04:29  4625  svc-dbadmin  185.220.101.45  LogonType=10  Status=0xC000006A',
            note: {
              kind: 'observation',
              label: 'Second failure, 18 seconds later',
              body: 'The interval matters more than the repetition. Eighteen seconds is fast for a human retyping a password they believe they know, and slow for an automated brute-force tool. That pattern is consistent with someone working from a list of candidate passwords by hand or through a slow script.',
            },
          },
          {
            text: '03:05:02  4625  svc-dbadmin  185.220.101.45  LogonType=10  Status=0xC000006A',
            note: {
              kind: 'observation',
              label: 'Third failure',
              body: 'Three failures from one source against one account. Still not an incident. An administrator returning from leave with a stale password in their client produces exactly this shape.',
            },
          },
          {
            text: '03:05:38  4624  svc-dbadmin  185.220.101.45  LogonType=10  AuthPkg=Negotiate',
            note: {
              kind: 'hypothesis',
              label: 'Success — and the reason the rule fired',
              body: 'Event ID 4624 is a successful logon. Failures followed by a success from the same source within a short window is the correlation this rule exists to catch. Note what this is: a hypothesis of credential compromise, not a confirmation. The same shape is produced by a human who remembered their password on the fourth attempt.',
            },
          },
          {
            text: '03:05:39  4672  svc-dbadmin  SeDebugPrivilege SeBackupPrivilege SeTakeOwnershipPrivilege',
            note: {
              kind: 'observation',
              label: 'Administrative privileges assigned to the session',
              body: 'Event ID 4672 fires when a logon is granted sensitive privileges. It tells you this session is administrative. SeDebugPrivilege is the one to notice: it permits reading the memory of other processes, which is the prerequisite for credential dumping. Its presence does not mean dumping occurred — only that the session could.',
            },
          },
          {
            text: '— no further events from this account in the alert window —',
            note: {
              kind: 'uncertain',
              label: 'The most important line on the screen',
              body: 'The alert contains authentication events and nothing else. What the session did after 03:05:39 is not in this alert, and the absence is not evidence of absence. It may mean nothing happened; it may mean the endpoint telemetry for this host is not reaching the SIEM. Those two possibilities look identical here, and distinguishing them is a separate check — not an assumption.',
            },
          },
        ],
        proves: [
          'Three failed RDP logons and one success occurred for svc-dbadmin from 185.220.101.45 between 03:04:11 and 03:05:38',
          'The successful session was granted administrative privileges, including SeDebugPrivilege',
          'All four authentication events reached the SIEM, so identity telemetry for this host is working',
        ],
        doesNotProve: [
          'That the person at the keyboard was not the legitimate owner of svc-dbadmin',
          'That anything was done with the session after it was established',
          'That 185.220.101.45 is hostile — that requires enrichment, which has not been run yet',
          'That endpoint telemetry exists for this host. The alert would look the same either way.',
        ],
        provenance: 'source',
        sources: [
          { file: FILE, section: '7. Scenario Walkthrough: Tor Node Login at 3am' },
          { file: FILE, section: '4.6 Alert Lifecycle & Triage Methodology' },
        ],
        detail: [
          'The Event IDs, logon types and status codes used here are from the Windows Security auditing schema and are stable across supported Windows versions. The events themselves are fabricated for teaching. Microsoft publishes the authoritative field reference; confirm against it rather than against this page before writing production detection logic.',
          'Spend real time on the final line in the classroom. Students reliably treat "no further events" as "nothing further happened". Training them to read silence as a question rather than an answer is the single highest-value habit in this session.',
        ],
      },

      {
        kind: 'concept',
        id: 'checklist',
        title: 'The six questions that turn an alert into a decision',
        minutes: 9,
        lead:
          'A good analyst does not ask "is this bad?" They ask "is this unusual for this environment?" These six questions are how that gets asked consistently, by anyone, at 03:00.',
        points: [
          'Baseline — is this the first time this account has done this? Deviation is the signal; the event is just the trigger.',
          'Reputation — is the source address known? Threat intel, Tor exit lists, VPN ranges, prior incidents.',
          'Timing — is this normal for this hour and this day? A night-shift admin at 03:00 is not an anomaly.',
          'Correlation — has this account or address appeared in other recent alerts? One alert is an event; three are a pattern.',
          'Context window — what happened in the thirty minutes either side? The alert is a slice, not the story.',
          'Technique — which ATT&CK technique is this, and therefore which attack phase?',
        ],
        callout: {
          tone: 'rule',
          text: 'Never close without documentation. Never escalate without context. Those two rules are the whole of Tier 1 discipline.',
        },
        redView:
          'Alert fatigue is an operational asset to an attacker. A queue full of low-quality alerts trains analysts to dismiss quickly, and noise generated deliberately in one area buys quiet in another.',
        blueView:
          'Alert quality beats alert volume every time. Ten thousand alerts a day at a 95% false positive rate is a worse SOC than five hundred at 20%, because the first one has trained its analysts not to look.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.6 Alert Lifecycle & Triage Methodology' }],
        detail: [
          'Apply the six questions to the opening scenario and watch the alert change character. Baseline: svc-dbadmin is a service account, and service accounts should not be producing RDP logons at all — they authenticate as services, LogonType 5. That single answer moves this from "possible mistyped password" to "something is structurally wrong" before any enrichment has run.',
          'Timing: 03:00 is meaningless on its own. It becomes meaningful when combined with the baseline answer — a service account has no working hours to deviate from, which is exactly why the interactive logon is the anomaly rather than the hour.',
          'The checklist is also a defence for the analyst. A documented closure that walked all six questions and concluded "false positive" is a defensible professional judgement even if it later proves wrong. An undocumented closure is not defensible under any outcome.',
        ],
      },

      {
        kind: 'interaction',
        id: 'triage',
        title: 'Guided analysis: work the queue',
        minutes: 14,
        component: 'triage-console',
        lead:
          'Four alerts from one night shift. For each one, gather context, then decide. The console will not tell you whether you are right until you commit — and then it will tell you exactly why.',
        teaches:
          'That the same raw event is a false positive for one account and a critical incident for another, and that the deciding factor is always baseline, never severity colour.',
        provenance: 'source',
        sources: [
          { file: FILE, section: '4.6 Alert Lifecycle & Triage Methodology' },
          { file: FILE, section: '8. Defender\'s View' },
        ],
        detail: [
          'Every alert in this console is synthetic. The decision structure, the context checks and the feedback are drawn from the source material\'s Tier 1 triage workflow.',
          'Students commonly escalate everything on the first pass, which feels safe and is not: escalating without triage context simply moves the queue to Tier 2 and destroys the value of having a Tier 1 at all. The console scores escalation-without-context as a wrong answer for this reason, and says so.',
        ],
        data: {
          alerts: [
            {
              id: 'ALR-1041',
              rule: 'AUTH-CORR-004 · Failed Logon Burst Followed By Success',
              severity: 'High',
              summary:
                'Account svc-dbadmin: 3 × Event ID 4625 then 1 × 4624 from 185.220.101.45, LogonType 10 (RDP), within 87 seconds. Session granted SeDebugPrivilege.',
              checks: [
                {
                  label: 'Baseline — account behaviour',
                  result:
                    'svc-dbadmin is a service account. It has 11 months of LogonType 5 (service) events and zero prior interactive or remote-interactive logons.',
                  weight: 'damning',
                },
                {
                  label: 'Reputation — source address',
                  result:
                    '185.220.101.45 appears on the ingested Tor exit node feed, refreshed 40 minutes ago. No prior business traffic from this address.',
                  weight: 'damning',
                },
                {
                  label: 'Timing',
                  result:
                    'A service account has no working pattern to deviate from. The hour is not itself the anomaly — the logon type is.',
                  weight: 'neutral',
                },
                {
                  label: 'Correlation — other alerts',
                  result:
                    'No other alerts reference this account or this address in the past 7 days.',
                  weight: 'neutral',
                },
                {
                  label: 'Context window — ±30 minutes',
                  result:
                    'No endpoint telemetry returned for the destination host. Checking the asset inventory: the EDR agent on this host last reported 9 days ago.',
                  weight: 'damning',
                },
              ],
              options: [
                {
                  id: 'close',
                  label: 'Close as false positive',
                  correct: false,
                  feedback:
                    'A service account produced an interactive logon it has never produced before, from an anonymising network, and was granted debug privileges. Every one of those is a baseline break. This is the closure the source material describes as the moment a real attack hides behind the noise.',
                },
                {
                  id: 'escalate-nocontext',
                  label: 'Escalate to Tier 2 — "suspicious logon, please investigate"',
                  correct: false,
                  feedback:
                    'The decision is right and the note is not. Tier 2 now has to re-run every check you already ran. An escalation without context is a queue transfer, not a handover — and it is what makes organisations believe Tier 1 adds no value.',
                },
                {
                  id: 'escalate-context',
                  label: 'Escalate to Tier 2 with full triage context and ATT&CK mapping',
                  correct: true,
                  feedback:
                    'Correct. Three independent baseline breaks — logon type, source reputation, privilege grant — plus one discovery that outlives this alert entirely: the EDR agent on the destination host has been silent for nine days. That is a visibility gap, it was found by triage rather than by an audit, and it belongs in the escalation note. Map as T1078 (Valid Accounts) with T1021.001 (Remote Desktop Protocol).',
                },
                {
                  id: 'ir',
                  label: 'Activate Incident Response directly',
                  correct: false,
                  feedback:
                    'Too early. IR starts from confirmed findings, not from a strong hypothesis. Nothing here yet establishes what the session did — and with the EDR agent dead on that host, Tier 2 has real scoping work to do first. Activating IR on every strong suspicion exhausts the capacity you need for the real ones.',
                },
              ],
            },
            {
              id: 'ALR-1042',
              rule: 'EXEC-002 · Encoded PowerShell Command',
              severity: 'Medium',
              summary:
                'powershell.exe -enc JABzAD0A… executed on BUILD-AGENT-03 under account svc_deploy. Parent process: jenkins-agent.exe.',
              checks: [
                {
                  label: 'Baseline — account behaviour',
                  result:
                    'svc_deploy runs encoded PowerShell on this host between 40 and 60 times per day, every weekday, for the past 8 months.',
                  weight: 'exculpatory',
                },
                {
                  label: 'Reputation — source',
                  result: 'Local execution. Parent process is the build agent, running from its installed path.',
                  weight: 'exculpatory',
                },
                {
                  label: 'Timing',
                  result: '14:12 on a Wednesday — squarely inside the normal build window.',
                  weight: 'exculpatory',
                },
                {
                  label: 'Correlation — change management',
                  result: 'Pipeline run #4471 is recorded in the deployment log at 14:11.',
                  weight: 'exculpatory',
                },
                {
                  label: 'Context window — ±30 minutes',
                  result: 'Normal build activity. No outbound connections to unrecognised destinations.',
                  weight: 'exculpatory',
                },
              ],
              options: [
                {
                  id: 'escalate',
                  label: 'Escalate — encoded PowerShell is always suspicious',
                  correct: false,
                  feedback:
                    '"-enc is always suspicious" is a rule of thumb, not a finding. On this host, under this account, inside this window, with a matching pipeline run, it is the most normal thing that happens all day. Escalating it costs Tier 2 time and teaches the queue to distrust this rule.',
                },
                {
                  id: 'close-nodoc',
                  label: 'Close as false positive',
                  correct: false,
                  feedback:
                    'Right decision, incomplete action. Closing without documenting why means this fires again tomorrow, and the day after, and eventually nobody reads it — including the day it is real. The closure is half the job; the tuning request is the other half.',
                },
                {
                  id: 'close-tune',
                  label: 'Close as false positive, document, and raise a tuning request',
                  correct: true,
                  feedback:
                    'Correct, and note what the tuning request should say. Not "suppress encoded PowerShell" — that removes a genuinely valuable detection. The precise request is: exclude svc_deploy on build agents where the parent process is jenkins-agent.exe. Narrow the exclusion to the thing you actually verified, so the rule keeps working everywhere else.',
                },
              ],
            },
            {
              id: 'ALR-1043',
              rule: 'IDENT-007 · Impossible Travel',
              severity: 'High',
              summary:
                'Account a.hassan authenticated from Kuwait City at 08:02 and from Frankfurt at 08:19. Distance implies travel at roughly 11,000 km/h.',
              checks: [
                {
                  label: 'Baseline — account behaviour',
                  result:
                    'a.hassan authenticates from Kuwait City on almost every working day. Frankfurt has appeared 14 times in the past 90 days, always in short bursts.',
                  weight: 'neutral',
                },
                {
                  label: 'Reputation — source address',
                  result:
                    'The Frankfurt address belongs to a commercial VPN provider that the organisation licenses and deploys to staff laptops.',
                  weight: 'exculpatory',
                },
                {
                  label: 'Timing',
                  result: 'Both events fall inside normal working hours for this user.',
                  weight: 'exculpatory',
                },
                {
                  label: 'Correlation — device',
                  result:
                    'Both authentications carry the same managed device identifier and the same compliant device posture.',
                  weight: 'exculpatory',
                },
                {
                  label: 'Context window — ±30 minutes',
                  result:
                    'No privilege changes, no unusual resource access, no MFA prompts denied.',
                  weight: 'exculpatory',
                },
              ],
              options: [
                {
                  id: 'escalate',
                  label: 'Escalate — impossible travel means stolen credentials',
                  correct: false,
                  feedback:
                    'Impossible travel is a strong signal and it is not a verdict. Here, the same managed device appears at both locations, which is the thing credential theft cannot easily fake, and the second location is the corporate VPN egress. The physics is impossible; the explanation is mundane.',
                },
                {
                  id: 'close-tune',
                  label: 'Close as false positive, document, and raise a tuning request',
                  correct: true,
                  feedback:
                    'Correct. The tuning request is specific: the impossible-travel rule should resolve corporate VPN egress addresses to the user\'s home region before computing travel velocity. Note the honest caveat for your documentation — device identifiers can be spoofed by an attacker on a compromised managed device, so this closure rests on the device posture signal being trustworthy. Say so; do not pretend to more certainty than you have.',
                },
                {
                  id: 'close-nodoc',
                  label: 'Close as false positive with no further action',
                  correct: false,
                  feedback:
                    'This rule will now fire every time any member of staff uses the corporate VPN. That is a rule on its way to being ignored, and impossible travel is too valuable a detection to let die that way.',
                },
              ],
            },
            {
              id: 'ALR-1044',
              rule: 'PERSIST-003 · Scheduled Task Created Outside Business Hours',
              severity: 'Low',
              summary:
                'Event ID 4698 on FIN-WS-22 at 02:47. Task name: WindowsUpdate_Helper. Action: C:\\Users\\Public\\svchost32.exe. Created by user m.alotaibi.',
              checks: [
                {
                  label: 'Baseline — account behaviour',
                  result:
                    'm.alotaibi is a finance analyst. No prior scheduled task creation by this account, ever.',
                  weight: 'damning',
                },
                {
                  label: 'Reputation — task path',
                  result:
                    'C:\\Users\\Public is world-writable and is not a location any legitimate update mechanism installs to. The real binary is svchost.exe in System32; svchost32.exe does not exist in Windows.',
                  weight: 'damning',
                },
                {
                  label: 'Timing',
                  result: '02:47. The user badged out at 17:40 the previous evening.',
                  weight: 'damning',
                },
                {
                  label: 'Correlation — patch management',
                  result:
                    'No patch deployment was scheduled. The patch management system does not create tasks with this name.',
                  weight: 'damning',
                },
                {
                  label: 'Context window — ±30 minutes',
                  result:
                    'At 02:44, EXCEL.EXE spawned powershell.exe with an encoded command on the same host. At 02:46, a file was written to C:\\Users\\Public\\svchost32.exe.',
                  weight: 'damning',
                },
              ],
              options: [
                {
                  id: 'close',
                  label: 'Close — severity is Low and scheduled tasks are routine',
                  correct: false,
                  feedback:
                    'The severity field is the rule author\'s prior guess, made before this event existed. It is an input to your judgement, not a substitute for it. Everything in the context window contradicts it.',
                },
                {
                  id: 'escalate-context',
                  label: 'Escalate to Tier 2 with full triage context',
                  correct: false,
                  feedback:
                    'Defensible, and too slow. You are not looking at a suspicion — you have a document spawning a shell, a payload written to disk, and a persistence mechanism created, all within three minutes on one host. That is a confirmed chain, and a confirmed chain with live persistence is an incident.',
                },
                {
                  id: 'ir',
                  label: 'Escalate as a confirmed incident and activate Incident Response',
                  correct: true,
                  feedback:
                    'Correct — and notice that the judgement came from the context window, not from the alert. The alert was rated Low. What makes this an incident is a corroborated chain across three independent event types within three minutes: execution (T1059.001), payload write (T1105) and persistence (T1053.005). Severity is reassessed on evidence, continuously. A P4 at 02:47 is a P1 at 02:48.',
                },
              ],
            },
          ],
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
            stem: 'A SIEM correlation rule for lateral movement has never fired in eighteen months. What is the first thing you check?',
            options: [
              {
                text: 'Whether the log sources the rule depends on are still reporting',
                correct: true,
                feedback:
                  'Right. A silent rule and a healthy environment look identical from the console. The pipeline is the first thing to verify, because it is the failure that announces nothing.',
              },
              {
                text: 'Whether the rule logic contains an error',
                correct: false,
                feedback:
                  'Worth checking second. But a rule can be logically perfect and still never fire if its source stopped forwarding — and that failure is both more common and more silent.',
              },
              {
                text: 'Nothing — eighteen months without lateral movement is good news',
                correct: false,
                feedback:
                  'This is exactly the inference the source material warns against. Absence of alerts is not evidence of absence of attacks; it is evidence of absence of alerts.',
              },
              {
                text: 'Whether the rule is mapped to an ATT&CK technique',
                correct: false,
                feedback:
                  'Mapping matters for coverage reporting, but it has no bearing on whether a rule fires. It would not explain the silence.',
              },
            ],
          },
          {
            id: 'q2',
            stem: 'Which single piece of information most changes how you read "administrator logged in at 03:00"?',
            options: [
              {
                text: 'Whether that administrator has logged in at 03:00 before',
                correct: true,
                feedback:
                  'Correct. Baseline is the deciding input. For a night-shift admin this is Tuesday; for an account that has never worked outside business hours it is the whole alert.',
              },
              {
                text: 'The severity the rule assigned to the alert',
                correct: false,
                feedback:
                  'Severity was set by the rule author in advance, without knowledge of this account or this night. Session 1\'s fourth triage alert exists specifically to break this habit.',
              },
              {
                text: 'Whether the organisation uses a SIEM or an XDR',
                correct: false,
                feedback:
                  'That changes what else you can pull, but not how you read this event.',
              },
              {
                text: 'The ATT&CK technique the alert maps to',
                correct: false,
                feedback:
                  'Mapping tells you the phase once you have decided the event is suspicious. It does not help you decide that.',
              },
            ],
          },
          {
            id: 'q3',
            stem: 'You close an alert as a false positive and write a clear justification in the ticket. What remains undone?',
            options: [
              {
                text: 'Sending a tuning request to Detection Engineering',
                correct: true,
                feedback:
                  'Correct. Documentation records your reasoning; the tuning request is what stops the alert firing again tomorrow. Without the second step, the loop is open and the rule degrades until nobody reads it.',
              },
              {
                text: 'Nothing — a documented closure is a complete closure',
                correct: false,
                feedback:
                  'The documentation is the record. The improvement is the tuning request. The source material is explicit that the feedback loop is what makes a SOC improve rather than simply age.',
              },
              {
                text: 'Escalating to Tier 2 so they can confirm the closure',
                correct: false,
                feedback:
                  'That inverts the tier structure. If every closure needed Tier 2 confirmation there would be no point having Tier 1.',
              },
              {
                text: 'Notifying the account owner',
                correct: false,
                feedback:
                  'Sometimes appropriate, often not, and never the structural gap. The missing piece is the feedback to Detection Engineering.',
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
          'Context separates signal from noise. Ask "is this unusual here?", never only "is this bad?"',
          'A false positive that is not fed back to Detection Engineering is an improvement thrown away.',
          'Map every confirmed finding to ATT&CK before closing it, or your coverage map never learns anything.',
          'Visibility gaps are detection gaps. A rule cannot fire on data that never arrived.',
          'Severity is reassessed continuously on evidence. The number on the alert is a prior, not a verdict.',
        ],
        furtherStudy: [
          {
            label: 'MITRE ATT&CK Enterprise matrix',
            note: 'The authoritative technique reference. Confirm IDs and names here before quoting them in a report.',
            href: 'https://attack.mitre.org/',
          },
          {
            label: 'MITRE ATT&CK Navigator',
            note: 'The tool used to build and present coverage heatmaps. Returns in Session 4.',
            href: 'https://mitre-attack.github.io/attack-navigator/',
          },
          {
            label: 'Microsoft — Windows security auditing event reference',
            note: 'Authoritative definitions for Event IDs 4624, 4625, 4672 and 4698, used throughout this course.',
            href: 'https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/basic-audit-logon-events',
          },
        ],
      },
    ],
  },

  practical: {
    minutes: 90,
    title: 'Workshop: One night on the Tier 1 queue',
    blocks: [
      {
        kind: 'brief',
        id: 'brief',
        title: 'Briefing',
        minutes: 10,
        synthetic: true,
        resourceDir: 'soc-operations',
        scenario:
          'You are the sole Tier 1 analyst on the night shift at a mid-sized retail bank. Eight alerts arrived between 23:00 and 05:00. Your shift ends at 07:00 and the handover meeting expects a decision on every one of them — not a queue.',
        objectives: [
          'Triage eight alerts to a documented close-or-escalate decision using the six-question checklist',
          'Produce one escalation note that a Tier 2 analyst could act on with no follow-up question',
          'Produce one tuning request precise enough for Detection Engineering to implement without guessing',
          'Identify at least one visibility gap that triage exposed, and record it separately from the alerts',
        ],
        requires: [
          {
            item: 'The alert pack (downloadable from this page)',
            note: 'Eight synthetic alerts with their supporting events and the context you are allowed to query.', file: '00-alert-pack.md',
          },
          {
            item: 'The triage worksheet (downloadable)',
            note: 'One row per alert: the six questions, your decision, and your justification.', file: '01-triage-worksheet.md',
          },
          {
            item: 'Any text editor',
            note: 'Markdown or plain text. Submissions are read, not executed.',
          },
          {
            item: 'A browser',
            note: 'For the in-page triage console and for the ATT&CK matrix.',
          },
        ],
        setup: [
          'Download the alert pack and the triage worksheet from the resources on this page.',
          'Create a working folder named tier1-shift-<your-name>.',
          'Open attack.mitre.org in a second tab. You will map every escalation.',
          'Read the whole alert pack before deciding anything. Two of the eight alerts are related, and you will not see that if you work strictly top to bottom.',
        ],
        realism:
          'Everything in this workshop is self-contained and synthetic. There is no live SIEM, no connected EDR and no real telemetry — the "queries" are lookups into a prepared context file. This is a simulation of the triage decision, which is the skill being assessed, and it is deliberately not a simulation of operating a SIEM product. Where a real SIEM would differ in a way that matters, the alert pack says so inline.',
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Tier 1 Triage Workflow' }],
      },

      {
        kind: 'tasks',
        id: 'tasks',
        title: 'Your tasks',
        minutes: 55,
        lead:
          'Suggested timings assume you work alone. If you are paired, split alerts 4/4 for task 2 and reconcile before task 3 — disagreement between partners is the most useful thing that can happen in this workshop.',
        tasks: [
          {
            ref: 'T1',
            minutes: 8,
            title: 'Read the queue and set an order of work',
            steps: [
              'Read all eight alerts without deciding anything.',
              'Rank them by how much damage would be done if you got each one wrong in the direction of closing it.',
              'Write that ranking down with one line of reasoning each. This is your working order.',
              'Note any alerts that reference the same account, host or address — these may be one incident wearing eight hats.',
            ],
            produces: 'A ranked work order with a one-line justification per alert.',
          },
          {
            ref: 'T2',
            minutes: 25,
            title: 'Triage every alert against the six questions',
            steps: [
              'For each alert, answer all six questions on the worksheet: baseline, reputation, timing, correlation, context window, technique.',
              'Record the answer even when it is "no data available" — that answer is a finding in its own right.',
              'Reach one of three decisions per alert: close as false positive, escalate to Tier 2, or escalate as a confirmed incident.',
              'Write the justification before you write the decision. If the justification will not support the decision, change the decision.',
              'Map every escalation to at least one ATT&CK technique, with the identifier, not just the name.',
            ],
            produces:
              'A completed worksheet: eight alerts, six answers each, one decision each, one justification each.',
          },
          {
            ref: 'T3',
            minutes: 12,
            title: 'Write the escalation note for your highest-severity finding',
            steps: [
              'Pick the alert you rated most serious.',
              'Write a note covering: what happened, who and what is involved, why it is suspicious, what you checked, and your ATT&CK mapping.',
              'State explicitly what you could not determine and why. A Tier 2 analyst needs your uncertainty as much as your findings.',
              'Re-read it as the receiving analyst. Any question you have to ask is a defect in the note.',
            ],
            produces: 'One escalation note, roughly 150–250 words.',
          },
          {
            ref: 'T4',
            minutes: 10,
            title: 'Write one tuning request and one visibility gap',
            steps: [
              'Choose a false positive you closed and write a tuning request for Detection Engineering.',
              'Make the exclusion as narrow as the evidence you actually verified. "Suppress this rule" is almost always wrong.',
              'State what the tuned rule would still catch, so the reviewer can see what you have not broken.',
              'Separately, record any visibility gap that triage exposed — a missing agent, an unmonitored host, a log source with no data. These are not alerts and must not be filed as alerts.',
            ],
            produces: 'One tuning request and one visibility gap record.',
          },
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Tier 1 Triage Workflow' }],
      },

      {
        kind: 'hints',
        id: 'hints',
        title: 'Progressive hints',
        lead:
          'Use these only when you are genuinely stuck. Take one tier at a time — the first tier is usually enough, and working it out yourself is the point of the exercise.',
        hints: [
          {
            forTask: 'T1',
            tiers: [
              'Ranking by alert severity is not ranking by consequence. Which of these alerts, if you closed it wrongly, would still be doing damage at the handover meeting?',
              'Three of the eight involve persistence or privilege. Those are the ones where a wrong closure keeps costing you after you have gone home.',
              'Alerts 3 and 7 share a host. Alerts 2 and 7 share an account. Read those three together before ranking any of them.',
            ],
          },
          {
            forTask: 'T2',
            tiers: [
              'Start with baseline every time. Until you know what this account or host normally does, no other answer means anything.',
              'If the pack gives you no baseline for an account, that is your answer: "no baseline available." Record it — it is a finding about your monitoring, not a dead end in the exercise.',
              'For the alerts involving service accounts, ask what logon type the account should be producing. Service accounts authenticate as services. An interactive logon from one is a structural anomaly before you look at anything else.',
            ],
          },
          {
            forTask: 'T3',
            tiers: [
              'Write the five parts as five separate labelled lines first, then join them into prose. The structure is what makes the note usable.',
              'Your "what you checked" section should include checks that came back clean. Tier 2 needs to know what they can skip.',
              'The uncertainty sentence is the hardest to write and the most valuable. Try completing: "I was unable to determine X because Y, which means Z remains open."',
            ],
          },
          {
            forTask: 'T4',
            tiers: [
              'A good tuning request names a field and a value, not a feeling. Which specific field distinguishes the benign case you verified from the malicious case you still want to catch?',
              'If your exclusion is an account name alone, ask what happens when that account is compromised. Pair it with a second condition — a host, a parent process, a path.',
              'For the visibility gap: say which host, which telemetry source, how long it has been silent, and what detection it silently disables. "EDR is broken" is not actionable.',
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
        lead:
          'This folder structure is used for every practical in this course. It is adapted from the investigation folder layout in the source material, and the habit of building it matters more than any single file in it.',
        items: [
          { ref: 'D1', text: 'Completed triage worksheet — eight alerts, six answers, one decision and one justification each', required: true },
          { ref: 'D2', text: 'Ranked work order with reasoning (from T1)', required: true },
          { ref: 'D3', text: 'One escalation note, 150–250 words', required: true },
          { ref: 'D4', text: 'One tuning request naming a specific field and value', required: true },
          { ref: 'D5', text: 'One visibility gap record', required: true },
          { ref: 'D6', text: 'A short note on any alert you changed your mind about, and what changed it', required: false },
        ],
        structure: `tier1-shift-<your-name>/
  00-work-order.md        → T1: ranked order with reasoning
  01-triage-worksheet.md  → T2: the eight decisions and their justifications
  02-escalation-note.md   → T3: the handover to Tier 2
  03-tuning-request.md    → T4: the specific rule change requested
  04-visibility-gaps.md   → T4: what triage revealed about monitoring coverage
  05-reflection.md        → optional: what you changed your mind about`,
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Investigation Folder Structure' }],
      },

      {
        kind: 'assessment',
        id: 'assessment',
        title: 'How this is assessed',
        lead:
          'Note where the weight sits. A defensible wrong decision scores better here than a correct guess, because in a real SOC the reasoning is the only part that transfers to the next alert.',
        criteria: [
          {
            band: 'Reasoning quality',
            weight: '40%',
            descriptor:
              'Each decision follows from the evidence recorded. Baseline is consulted first. Uncertainty is stated rather than smoothed over. A well-reasoned decision that turns out wrong scores highly; a correct decision with no reasoning does not.',
          },
          {
            band: 'Decision correctness',
            weight: '20%',
            descriptor:
              'Close, escalate and incident are distinguished appropriately. Confirmed chains are escalated as incidents, not as suspicions. Nothing is escalated without context.',
          },
          {
            band: 'Escalation note usability',
            weight: '20%',
            descriptor:
              'A Tier 2 analyst could act on it without asking a follow-up question. Covers what, who, why, checked, and mapped. Names what could not be determined.',
          },
          {
            band: 'Tuning precision',
            weight: '10%',
            descriptor:
              'The exclusion is as narrow as the evidence supports, names a specific field and value, and states what the rule would still catch.',
          },
          {
            band: 'Evidence discipline',
            weight: '10%',
            descriptor:
              'Folder structure complete. Observations, hypotheses and confirmed findings are labelled distinctly rather than blended into one narrative.',
          },
        ],
        provenance: 'supplementary',
      },

      {
        kind: 'debrief',
        id: 'debrief',
        title: 'Debrief',
        minutes: 10,
        lead: 'Fifteen minutes of discussion, in this order. The disagreements are the content.',
        questions: [
          'Which alert did the room most disagree about? Reconstruct the disagreement: was it about the evidence, or about what the evidence meant?',
          'Did anyone close an alert they would now escalate? What specific fact would have changed the decision, and was that fact available at the time?',
          'Who escalated everything? What does that do to Tier 2 over a full week, and how is it different from closing everything?',
          'What visibility gaps did the room find? Count how many were found by triage rather than by an audit.',
          'Two alerts were related. Who noticed, and what made it visible — reading the whole queue first, or working through it in order?',
          'If this queue arrived again tomorrow with the tuning requests applied, how many of the eight would still fire?',
        ],
        landingPoint:
          'Triage is not sorting. It is the construction of a defensible decision under time pressure, from incomplete evidence — and the documentation is not an administrative tax on that work, it is the only part of it that outlives the shift.',
        provenance: 'supplementary',
      },

      {
        kind: 'recap',
        id: 'recap',
        title: 'Recap and further study',
        provenance: 'source',
        sources: [
          { file: FILE, section: '12. Actionable Takeaways' },
          { file: FILE, section: '13. Summary' },
        ],
        takeaways: [
          'The SOC is a chain of decisions, not a room of people. Each tier owns one question and one handover.',
          'SIEM gives breadth and history, EDR gives host depth and the ability to act, XDR correlates across layers. Each is blind somewhere.',
          'Normalisation is what makes one query reach fifty sources. The pipeline beneath it fails silently.',
          'Endpoint, network, identity and cloud must all be covered, because real attacks cross all of them.',
          'The six-question checklist is what makes triage reproducible by anyone, at any hour.',
          'Alert quality beats alert volume. A noisy rule is a rule being trained out of the analyst.',
        ],
        furtherStudy: [
          {
            label: 'NIST SP 800-61r2 — Computer Security Incident Handling Guide',
            note: 'The framework behind the escalation and response structure. Session 5 works through it properly.',
            href: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final',
          },
          {
            label: 'MITRE ATT&CK Enterprise matrix',
            note: 'Confirm every technique ID here before putting it in a report.',
            href: 'https://attack.mitre.org/',
          },
          {
            label: 'Elastic Common Schema (ECS) field reference',
            note: 'A concrete example of what "normalisation" means in practice, from a primary source.',
            href: 'https://www.elastic.co/guide/en/ecs/current/index.html',
          },
          {
            label: 'Next: Session 2 — Log Analysis',
            note: 'You triaged alerts built from logs. Next you read the logs themselves, and learn what Windows does not record by default.',
          },
        ],
      },
    ],
  },

  terms: [
    { term: 'SOC', definition: 'Security Operations Center — the team and process providing continuous detection, triage and response.' },
    { term: 'SIEM', definition: 'Security Information and Event Management — collects, normalises, stores and correlates logs from every source.' },
    { term: 'EDR', definition: 'Endpoint Detection and Response — agent-based host monitoring with behavioural detection and active response.' },
    { term: 'XDR', definition: 'Extended Detection and Response — correlation across endpoint, network, email, cloud and identity.' },
    { term: 'Normalisation', definition: 'Mapping differently named fields from many log sources onto one schema so a single query reaches all of them.' },
    { term: 'Baseline', definition: 'The established normal behaviour of an account, host or network segment. The reference point that makes anomaly meaningful.' },
    { term: 'False positive', definition: 'An alert that fired on activity with a legitimate explanation. Closing one without documenting why is how rules decay.' },
    { term: 'Dwell time', definition: 'The interval between initial compromise and detection. The number IR capability is ultimately measured against.' },
    { term: 'Alert fatigue', definition: 'The degradation of analyst attention caused by a high-volume, low-precision alert queue.' },
  ],
}
