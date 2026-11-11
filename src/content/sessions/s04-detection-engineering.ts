import type { Session } from '@/types/content'

const FILE = 'defensive_day_4_detection_engineering_esl.md'

export const session04: Session = {
  number: 4,
  slug: 'detection-engineering',
  title: 'Detection Engineering',
  summary:
    'You cannot read every log line. Write the rules that read them for you — and keep them precise enough that people still trust the queue.',
  abstract:
    'Three sessions of manual investigation have shown you what attacks look like. This session turns that knowledge into automation. You will learn the anatomy of a detection rule, when to reach for a signature and when for a behaviour, the five correlation patterns, the tuning cycle that keeps a rule alive, Sigma as a portable rule format, and how to find the gaps in your coverage before an attacker does. The practical rebuilds a detection library after a breach.',
  track: 'core',
  themes: ['Rules', 'Tuning', 'Coverage'],
  prerequisites: [
    'Session 2 — Windows Event IDs, Sysmon events and reading a detection query',
    'Session 1 — the false positive feedback loop and why alert quality beats volume',
    'Comfort reading YAML. You will write some.',
  ],
  outcomes: [
    'Decompose any detection rule into its data source, conditions and threshold',
    'Choose between signature and behavioural detection for a given technique, and justify the choice',
    'Select the correct correlation pattern — threshold, sequence, aggregation, anomaly or multi-source — for a detection goal',
    'Tune a noisy rule without destroying the detection it was written for',
    'Write a valid Sigma rule with ATT&CK tags and documented false positives',
    'Identify coverage gaps using a heatmap, purple team results, threat intelligence and a log source audit',
  ],
  sourceFiles: [FILE],
  sourceNotes: [
    'Session 2\'s source file also carries "Detection Engineering" in its title and introduces query writing. This session is built from the Day 4 file, which covers the discipline in full. Where the two overlap — query structure, the specificity/breadth trade-off — this session treats it as revision and moves on.',
  ],

  theory: {
    minutes: 90,
    blocks: [
      {
        kind: 'title',
        id: 'open',
        title: 'Session 4',
        overline: 'Defensive Track · Session 04 of 10',
        lead:
          'You do not sit and watch your house all day waiting for a fire. You install something that watches for you.',
        provenance: 'source',
        sources: [{ file: FILE, section: '2. Introduction' }],
      },

      {
        kind: 'retrieval',
        id: 'retrieval',
        title: 'Recall from Sessions 1 to 3',
        minutes: 6,
        recallPrompt: 'From memory.',
        questions: [
          'In Session 2 you wrote a query detecting Office applications spawning shells. Name two limitations you recorded for it.',
          'What are the five parts of false positive assessment?',
          'Why does a rule that fires five hundred times a day make an organisation less safe, not more?',
          'In Session 3, what would a domain-age check on inbound links have caught, and what would it have missed?',
        ],
        answers: [
          'Any two of: it requires Sysmon deployed and forwarded; it only named three Office binaries; template injection and COM-based execution may not produce a visible child; legitimate deployment tooling can trigger it.',
          'Context, timing, frequency, corroboration, baseline.',
          'Because it trains analysts to dismiss without reading. Alert fatigue is an operational asset to an attacker, and noise in one area buys quiet in another.',
          'It would have caught the two-day-old Microsoft lookalike. It would have missed the HR campaign, whose domain was registered thirty-one days before use — aged deliberately past a thirty-day rule.',
        ],
        provenance: 'supplementary',
      },

      {
        kind: 'scenario',
        id: 'scenario',
        title: 'Opening scenario: six techniques, zero detections',
        minutes: 4,
        synthetic: true,
        setting: 'Three months after a ransomware incident. Your first day on the detection engineering team.',
        narrative: [
          'The post-incident report is on your desk. The attacker entered through a phishing email, moved laterally across twenty-three hosts for fourteen days, and encrypted forty thousand files.',
          'Six distinct techniques were used. Reading down the report\'s detection column: not detected, not detected, not detected, not detected, not detected, not detected.',
          'Your mandate is one sentence: make this attack path detectable, and find every other gap like it.',
        ],
        drivingQuestion:
          'Where do you start — with the six techniques from this incident, or somewhere else entirely?',
        provenance: 'source',
        sources: [{ file: FILE, section: '7. Scenario Walkthrough: Post-Ransomware Detection Rebuild' }],
        detail: [
          'The answer the session builds towards is "both, in a specific order". The six known techniques are the obvious backlog and they are also the techniques you now know this adversary used against you, which makes them higher priority than a generic list. But building only those six leaves you defending against the last attack. The gap analysis methods in section 4.7 are what stop that.',
        ],
      },

      {
        kind: 'objectives',
        id: 'objectives',
        title: 'What you will be able to do',
        minutes: 3,
        provenance: 'supplementary',
        objectives: [
          { verb: 'Decompose', text: 'a detection rule into data source, conditions and threshold' },
          { verb: 'Choose', text: 'between signature and behavioural detection, and justify it' },
          { verb: 'Select', text: 'the correct correlation pattern for a detection goal' },
          { verb: 'Tune', text: 'a noisy rule without destroying its detection value' },
          { verb: 'Write', text: 'a valid Sigma rule with ATT&CK tags and documented false positives' },
          { verb: 'Identify', text: 'coverage gaps by four independent methods' },
        ],
      },

      {
        kind: 'concept',
        id: 'anatomy',
        title: 'Every rule is three things',
        minutes: 7,
        lead:
          'Detection logic looks intimidating in a vendor console and is structurally simple. IF this event happens AND these conditions hold THEN alert.',
        points: [
          'Data source — which logs does this examine? Windows Security, Sysmon, auth.log, web server, cloud audit.',
          'Conditions — what specific pattern triggers it? Failed logons, an encoded command, an unusual parent process.',
          'Threshold — how many, how fast, from where? Ten failures in sixty seconds, not one failure.',
          'Remove the threshold and you have a rule that fires on normal life. Remove the conditions and you have a log search.',
          'A rule without documentation is a rule that will be deleted by someone who cannot tell what it was for.',
        ],
        callout: {
          tone: 'rule',
          text: 'Four questions for any rule: does it catch the real attack; does it fire on legitimate activity; is the logic documented; is it mapped to a technique? A rule that fails the first has no value. A rule that fails the second destroys trust in the queue.',
        },
        redView:
          'Rules have known bypasses because their logic is knowable. A rule matching "-enc" is defeated by "-e", "-ec" or "-enco", all valid abbreviations of -EncodedCommand. A rule matching cmd.exe spawned by Word is defeated by spawning wscript.exe instead.',
        blueView:
          'Documentation is what lets a rule survive staff turnover, a SIEM migration and the eighteen months between writing it and next reading it. Record what it detects, why these conditions, what legitimate activity resembles the pattern, and which technique it covers.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.1 Detection Rule Logic' }],
      },

      {
        kind: 'compare',
        id: 'sig-vs-behav',
        title: 'Signature or behaviour',
        minutes: 7,
        lead:
          'Two fundamentally different approaches. A mature detection library uses both, deliberately, in layers.',
        columns: [{ label: 'Signature' }, { label: 'Behavioural' }],
        rows: [
          {
            label: 'Matches',
            cells: [
              'A known specific pattern — a file hash, an address, a string like UNION SELECT',
              'A pattern of activity — any Office app spawning a shell, any account reading 10,000 files in 2 minutes',
            ],
          },
          { label: 'Known threats', cells: ['Yes', 'Yes'] },
          { label: 'Unknown threats', cells: ['No — by definition', 'Yes, if the technique is unchanged'] },
          { label: 'False positive rate', cells: ['Very low when precise', 'Higher; needs tuning'] },
          {
            label: 'Evaded by',
            cells: [
              'Changing one byte. Recompiling. Renaming a function.',
              'Changing the entire technique — which usually means not achieving the objective',
            ],
          },
          { label: 'Shelf life', cells: ['Until the next variant', 'Until the technique itself changes — often years'] },
          { label: 'Cost to build', cells: ['Minutes', 'Hours, plus a tuning cycle'] },
          { label: 'Typical home', cells: ['Antivirus, IDS, blocklists', 'SIEM correlation rules, EDR behavioural logic'] },
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '4.2 Signature vs Behavioral Detection' }],
        detail: [
          'Signatures are a fast cheap first filter and nothing more. A library built only from signatures has a predictable expiry date, because yesterday\'s hashes do not match today\'s variants and never will.',
          'The durability argument for behavioural rules is the one to internalise: an attacker who replaces every tool still has to execute code, establish persistence and communicate outward. Build detection around those obligations and the rule outlives the tooling.',
        ],
      },

      {
        kind: 'concept',
        id: 'correlation',
        title: 'Five correlation patterns',
        minutes: 8,
        lead:
          'A single event rarely confirms an attack. Correlation combines events across time or sources to produce a higher-confidence finding than any of them alone.',
        points: [
          'Threshold — more than X events of type Y within Z seconds. Brute force and password spraying.',
          'Sequence — event A, then event B, within a window. An account created, then used within five minutes.',
          'Aggregation — the same event across many targets in a short period. One source failing against twenty accounts: credential stuffing.',
          'Anomaly — unusual for this specific entity. An account that has only ever authenticated from the UK, logging in from elsewhere at 03:00.',
          'Multi-source — events from unrelated log sources joining into a chain. Phishing email, then a proxy click, then PowerShell, then an outbound connection, all on one host within ten minutes.',
        ],
        callout: {
          tone: 'note',
          text: 'Multi-source correlation is the most powerful pattern and the most fragile. It only works when every source it references is onboarded and normalised. A rule joining four sources produces nothing when one of them is missing, and it reports no error while doing so.',
        },
        redView:
          'Correlation forces the attacker to avoid traces across several independent sources at once, which is a far harder constraint than evading one rule. The counter is tempo: an operation stretched over six hours falls outside time-window correlation.',
        blueView:
          'Audit log coverage before developing correlation rules. The visibility infrastructure is always the ceiling on correlation capability, and building above it produces rules that look healthy and detect nothing.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.3 Correlation Rule Concepts' }],
      },

      {
        kind: 'interaction',
        id: 'builder',
        title: 'Instructor demonstration: build a rule, then tune it',
        minutes: 18,
        component: 'rule-builder',
        lead:
          'A labelled synthetic corpus of process-creation events: some genuinely malicious, most ordinary. Build a rule by selecting conditions, and watch precision and recall move in opposite directions.',
        teaches:
          'That tuning is a trade, not an improvement — every exclusion that removes a false positive also opens a path for an attacker who satisfies it, and the engineering judgement is knowing which trade is worth making.',
        provenance: 'source',
        sources: [
          { file: FILE, section: '4.4 Alert Tuning & Noise Reduction' },
          { file: FILE, section: '4.1 Detection Rule Logic' },
        ],
        detail: [
          'The corpus is synthetic and labelled, which is what makes precision and recall computable here. In production you do not have labels — you have analyst dispositions, which are themselves noisy and are the reason the tuning cycle in the source material runs over a week of observation rather than instantly.',
          'Watch for the student who reaches 100% precision by excluding until only one exact command line matches. Ask them what the attacker does next. That is the whole lesson.',
        ],
        data: {
          corpusSize: 2000,
          description:
            'Two thousand synthetic process-creation events from a simulated 500-host estate over 24 hours. Twelve are part of genuine attack chains and are labelled as such.',
          conditions: [
            {
              id: 'ps',
              label: 'Image is powershell.exe',
              description: 'The most obvious starting point, and far too broad on its own.',
              truePositives: 12,
              falsePositives: 847,
            },
            {
              id: 'enc',
              label: 'CommandLine contains an encoding flag (-enc, -e, -ec, -encodedcommand)',
              description: 'Covers the abbreviations an attacker would use to defeat a single-string match.',
              truePositives: 11,
              falsePositives: 193,
            },
            {
              id: 'office-parent',
              label: 'ParentImage is an Office application',
              description: 'The relationship-based condition. Very precise, and narrow.',
              truePositives: 7,
              falsePositives: 2,
            },
            {
              id: 'hidden',
              label: 'CommandLine contains a window-hiding flag (-w hidden, -windowstyle hidden)',
              description: 'Suppressing the window from the user has few legitimate interactive uses.',
              truePositives: 9,
              falsePositives: 31,
            },
            {
              id: 'nonadmin',
              label: 'User is not in the administrators or service account groups',
              description: 'Excludes the accounts that legitimately automate with PowerShell.',
              truePositives: 10,
              falsePositives: 48,
            },
            {
              id: 'offhours',
              label: 'Event time is outside 07:00–19:00',
              description: 'Cheap, and it hands the attacker a schedule.',
              truePositives: 5,
              falsePositives: 22,
            },
            {
              id: 'exclude-build',
              label: 'Exclude svc_deploy on hosts in the build-agent group',
              description: 'The narrow, verified exclusion from the Session 1 triage console.',
              truePositives: 0,
              falsePositives: -162,
            },
          ],
          notes: [
            'Condition counts are drawn from the labelled corpus. Combining conditions intersects them, so true positives can only fall as you add more.',
            'The exclusion removes false positives without removing any true positive — which is what a good exclusion looks like, and why it was worth verifying before applying.',
            'A rule at 100% precision that catches 2 of 12 chains is worse than a rule at 70% precision that catches 10. Precision is not the objective; a queue analysts still read while catching real attacks is.',
          ],
        },
      },

      {
        kind: 'query',
        id: 'sigma',
        title: 'Sigma: write once, deploy to any SIEM',
        minutes: 12,
        language: 'sigma',
        assumes:
          'Sigma specification as published by SigmaHQ, converted with sigma-cli. The logsource category and the field names must match what your SIEM actually ingests — conversion maps syntax, not schema.',
        lead:
          'Every SIEM has its own query language, and rules written in one are stranded when the organisation changes product. Sigma is the vendor-neutral format that solves it.',
        code: `title: Office Application Spawning Script Interpreter
id: 8c1f2a44-5e93-4b17-9d2c-f0e4a7b61d38
status: experimental
description: >
  Detects Microsoft Office applications spawning a command shell or script
  interpreter. This parent-child relationship has no routine legitimate use
  on user workstations and is a reliable indicator of macro-based execution.
author: CODED Defensive Track
date: 2026/03/14
references:
  - https://attack.mitre.org/techniques/T1566/001/
  - https://attack.mitre.org/techniques/T1059/001/
tags:
  - attack.execution
  - attack.t1059.001
  - attack.initial_access
  - attack.t1566.001
logsource:
  category: process_creation
  product: windows
detection:
  selection_parent:
    ParentImage|endswith:
      - '\\WINWORD.EXE'
      - '\\EXCEL.EXE'
      - '\\POWERPNT.EXE'
      - '\\MSACCESS.EXE'
      - '\\OUTLOOK.EXE'
  selection_child:
    Image|endswith:
      - '\\cmd.exe'
      - '\\powershell.exe'
      - '\\pwsh.exe'
      - '\\wscript.exe'
      - '\\cscript.exe'
      - '\\mshta.exe'
      - '\\rundll32.exe'
  filter_deployment:
    User|startswith: 'SVC_'
    ParentImage|endswith: '\\EXCEL.EXE'
    CommandLine|contains: 'LicenceCheck.vbs'
  condition: selection_parent and selection_child and not filter_deployment
falsepositives:
  - Software licensing checks that invoke scripts from Excel at startup
  - Some add-in installers spawn shells during first-run configuration
  - Automated report generation tooling in finance environments
level: high`,
        walkthrough: [
          { part: 'title / description', explains: 'Written for the analyst receiving the alert at 03:00, not for the author. It states what fired and why that is unusual.' },
          { part: 'id', explains: 'A UUID. It lets this rule be referenced unambiguously across platforms, teams and organisations.' },
          { part: 'status: experimental', explains: 'Honest maturity signalling. Promote to test, then stable, as production evidence accumulates. Shipping everything as stable is how a library loses meaning.' },
          { part: 'tags', explains: 'Two tactics and two techniques, because this rule covers both the delivery and the execution step. This is what populates the coverage heatmap.' },
          { part: 'logsource', explains: 'Declares the category the rule needs. Conversion uses this to target the right index — and it is the line that silently fails if that source is not onboarded.' },
          { part: 'selection_parent / selection_child', explains: 'Two named selections, combined in condition. Separating them keeps each readable and independently editable.' },
          { part: 'filter_deployment', explains: 'The exclusion. Note it names three conditions together — account prefix, specific parent, specific script. An exclusion on the account alone would be a hole an attacker could walk through.' },
          { part: 'condition', explains: 'The boolean assembly: both selections must match, and the filter must not. This is where the rule\'s actual logic lives.' },
          { part: 'falsepositives', explains: 'Not a disclaimer — operational instructions for the analyst. These are the three things to check before escalating.' },
        ],
        expected:
          'Converted with `sigma convert -t splunk rule.yml` this becomes SPL; with `-t sentinel` it becomes KQL. One rule, any platform. In a healthy environment it should fire rarely enough that every hit is read.',
        limitations: [
          'Conversion maps syntax, not schema. If your Sysmon data uses different field names than the rule assumes, the converted query runs and matches nothing.',
          'It requires process creation logging with command lines. Without it the rule is syntactically valid and permanently silent.',
          'Office applications are not the only maldoc hosts. A PDF reader or an archive tool spawning a shell is the same technique and is not covered here.',
          'The exclusion assumes SVC_ prefixed accounts are trustworthy. If one is compromised and the attacker reproduces the licensing command line, this rule will not fire.',
          'status: experimental means exactly that. It has not been validated against production noise.',
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '4.6 Sigma Rule Fundamentals' }],
        detail: [
          'SigmaHQ on GitHub hosts thousands of community rules covering most ATT&CK techniques, searchable by technique ID. Starting there rather than from a blank file is the single largest time saving available in detection engineering, and it frees the team to spend its effort on environment-specific rules and gap analysis, which no public library can supply.',
          'The red-side observation from the source is worth sitting with: a published Sigma rule confirms the defensive community detects that technique. Techniques with no public rules are, statistically, less likely to be covered anywhere. Monitoring SigmaHQ tells an attacker where defensive attention is going.',
        ],
      },

      {
        kind: 'interaction',
        id: 'coverage',
        title: 'Guided analysis: the coverage map',
        minutes: 15,
        component: 'coverage-map',
        lead:
          'The heatmap for the organisation from the opening scenario, after the ransomware incident. Green is covered, red is not. Select any technique to see what rule covers it — or what it would take to build one.',
        teaches:
          'That a coverage map is a prioritisation tool rather than a scoreboard, and that the right next rule is decided by what adversaries targeting your sector actually use, not by what is easiest to detect.',
        provenance: 'source',
        sources: [
          { file: FILE, section: '4.5 Mapping Detection to MITRE ATT&CK' },
          { file: FILE, section: '4.7 Identifying & Closing Coverage Gaps' },
        ],
        detail: [
          'The four gap-finding methods from the source, in increasing order of reliability: heatmap review tells you what you have never written a rule for; threat-intelligence review tells you which of those gaps matter for your sector; a log source audit tells you which rules cannot fire regardless of what the map claims; and a purple team exercise tells you what actually fired when the technique was executed, which is the only one of the four that tests reality rather than records.',
          'The log source audit is the method that catches the failure mode the heatmap cannot see. A technique can show green because a rule exists and still be entirely undetected because the rule\'s data source stopped reporting. The map records intent; only the audit records capability.',
        ],
        data: {
          tactics: [
            {
              name: 'Initial Access',
              techniques: [
                { id: 'T1566.001', name: 'Spearphishing Attachment', covered: true, rule: 'Office spawning script interpreter (Session 4 rule)', note: 'Covers execution of the attachment, not its delivery. Gateway controls are separate.' },
                { id: 'T1078', name: 'Valid Accounts', covered: true, rule: 'Impossible travel; anomalous logon type', note: 'Tuned after the Session 1 VPN false positive.' },
                { id: 'T1190', name: 'Exploit Public-Facing Application', covered: false, note: 'No WAF logs are forwarded to the SIEM. This is a log source gap, not a rule gap — writing a rule would change nothing.' },
              ],
            },
            {
              name: 'Execution',
              techniques: [
                { id: 'T1059.001', name: 'PowerShell', covered: true, rule: 'Encoded command from non-administrative account', note: 'Tuned to exclude build agents by account and host group.' },
                { id: 'T1047', name: 'Windows Management Instrumentation', covered: false, note: 'WmiPrvSE.exe spawning children is a known high-value signal and no rule exists. Hunted manually in Session 9.' },
                { id: 'T1204.002', name: 'User Execution: Malicious File', covered: true, rule: 'File write to world-writable path followed by execution' },
              ],
            },
            {
              name: 'Persistence',
              techniques: [
                { id: 'T1053.005', name: 'Scheduled Task/Job', covered: true, rule: 'Task creation by non-SYSTEM account', note: 'Noisy. Scheduled for review — patch management generates most of its volume.' },
                { id: 'T1547.001', name: 'Registry Run Keys', covered: true, rule: 'Sysmon Event ID 13 on Run key paths' },
                { id: 'T1546.003', name: 'WMI Event Subscription', covered: false, note: 'Fileless, rarely examined, and specifically chosen by attackers for that reason. Session 6 covers the artefacts.' },
              ],
            },
            {
              name: 'Defense Evasion',
              techniques: [
                { id: 'T1070.001', name: 'Clear Windows Event Logs', covered: true, rule: 'Event ID 1102, always alert, no threshold', note: 'A signature rule, correctly. There is no legitimate volume to threshold against.' },
                { id: 'T1055', name: 'Process Injection', covered: false, note: 'Requires EDR behavioural telemetry the current agent does not export. Session 7 covers detection in memory.' },
                { id: 'T1036', name: 'Masquerading', covered: false, note: 'Name-mimicry such as svchost32.exe. Detectable by comparing image name against expected path.' },
              ],
            },
            {
              name: 'Credential Access',
              techniques: [
                { id: 'T1003.001', name: 'LSASS Memory', covered: true, rule: 'Sysmon Event ID 10 targeting lsass.exe from non-system processes', note: 'Near-zero false positive rate once security products are excluded.' },
                { id: 'T1558.003', name: 'Kerberoasting', covered: false, note: 'Event ID 4769 with RC4 encryption. One of the most precise rules available and not yet built. Session 10.' },
                { id: 'T1003.006', name: 'DCSync', covered: false, note: 'Event ID 4662 with replication GUIDs from a non-DC account. Highest-impact AD gap on this map. Session 10.' },
              ],
            },
            {
              name: 'Lateral Movement',
              techniques: [
                { id: 'T1021.001', name: 'Remote Desktop Protocol', covered: false, note: 'The gap that allowed fourteen days of undetected movement in the incident that prompted this rebuild.' },
                { id: 'T1021.002', name: 'SMB/Windows Admin Shares', covered: false, note: 'Event ID 5140 on ADMIN$ and C$ from non-administrative sources.' },
                { id: 'T1550.002', name: 'Pass the Hash', covered: false, note: 'NTLM network logon from unexpected sources. Session 10.' },
              ],
            },
            {
              name: 'Exfiltration',
              techniques: [
                { id: 'T1041', name: 'Exfiltration Over C2 Channel', covered: false, note: 'Needs an outbound volume baseline per host. None exists yet.' },
                { id: 'T1567.002', name: 'Exfiltration to Cloud Storage', covered: false, note: 'Destinations are on the corporate allowlist. Volume-based detection only.' },
              ],
            },
            {
              name: 'Impact',
              techniques: [
                { id: 'T1486', name: 'Data Encrypted for Impact', covered: true, rule: 'Mass file modification: >200 Event ID 4663 in 60s per session', note: 'Threshold lowered from 500 to 200 after purple team testing showed earlier-stage activity produces lower counts.' },
              ],
            },
          ],
          summary: {
            total: 21,
            covered: 9,
            prompt:
              'Nine of twenty-one covered. The honest reading is not "43% secure" — it is that Lateral Movement has no coverage at all, which is precisely the phase where the last incident ran undetected for fourteen days.',
          },
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
            stem: 'A rule fires 400 times a day, all false positives. The quickest fix is to disable it. What is wrong with that?',
            options: [
              {
                text: 'The technique it covers becomes uncovered, and the heatmap will still show it green unless someone updates it',
                correct: true,
                feedback:
                  'Correct, and the second half is the dangerous part. A disabled rule that still reads as covered is worse than a gap you know about, because it produces false confidence in a document people make decisions from.',
              },
              {
                text: 'Disabling rules requires change management approval',
                correct: false,
                feedback: 'Procedurally true in many organisations and not the substantive problem.',
              },
              {
                text: 'Nothing — a 100% false positive rule has no value',
                correct: false,
                feedback:
                  'It has no value in its current form. The technique still needs covering, so the correct action is tuning, or deliberate deprecation with the map updated.',
              },
              {
                text: 'The rule may fire correctly in future',
                correct: false,
                feedback: 'Vague. The concrete issue is the uncovered technique and the stale coverage record.',
              },
            ],
          },
          {
            id: 'q2',
            stem: 'Which gap-finding method tells you whether a detection actually works, rather than whether it exists?',
            options: [
              {
                text: 'A purple team exercise — execute the technique and observe whether an alert fires',
                correct: true,
                feedback:
                  'Correct. The other three methods examine records: rules, intelligence, log inventories. Only this one tests the system end to end, which is why the source calls it the most direct and reliable.',
              },
              {
                text: 'ATT&CK heatmap review',
                correct: false,
                feedback: 'Tells you a rule exists. It cannot tell you whether the rule fires.',
              },
              {
                text: 'Threat intelligence review',
                correct: false,
                feedback: 'Tells you which gaps matter most for your sector. It does not test anything.',
              },
              {
                text: 'A log source audit',
                correct: false,
                feedback:
                  'Closer than the other two — it catches rules that cannot fire for lack of data. But it still examines inventory rather than observing behaviour.',
              },
            ],
          },
          {
            id: 'q3',
            stem: 'You write a Sigma rule and convert it to your SIEM. It returns zero results against three months of historical data. What is the most likely cause?',
            options: [
              {
                text: 'The field names in the rule do not match the field names in your ingested data',
                correct: true,
                feedback:
                  'Correct, and it is the most common failure in practice. Conversion maps syntax, never schema. The query is valid, runs successfully, and matches nothing.',
              },
              {
                text: 'The technique genuinely has not occurred in three months',
                correct: false,
                feedback:
                  'Possible, and it is the conclusion to reach last rather than first. Validate the rule against data you know contains the pattern before believing a negative.',
              },
              {
                text: 'Sigma rules cannot be run against historical data',
                correct: false,
                feedback: 'They can. A converted rule is an ordinary query and runs over whatever range you give it.',
              },
              {
                text: 'The rule needs status: stable before it will return results',
                correct: false,
                feedback: 'status is documentation metadata. It has no effect on execution.',
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
          'Write rules in Sigma, not in a SIEM\'s native language. Products get replaced; rules should not be.',
          'An untested rule is a hypothesis. Validate against known-bad data and against clean production data.',
          'Tuning is a trade. Every exclusion opens a path — make it as narrow as the evidence you verified.',
          'The coverage heatmap is how detection engineering communicates with leadership.',
          'A log source audit catches the gap a heatmap structurally cannot see.',
        ],
        furtherStudy: [
          { label: 'SigmaHQ rule repository', note: 'Thousands of community rules, searchable by technique. Start here, not from a blank file.', href: 'https://github.com/SigmaHQ/sigma' },
          { label: 'Sigma specification', note: 'The authoritative format reference — taxonomy, modifiers, condition syntax.', href: 'https://github.com/SigmaHQ/sigma-specification' },
          { label: 'Atomic Red Team', note: 'Small, documented technique simulations for validating that a rule actually fires.', href: 'https://github.com/redcanaryco/atomic-red-team' },
          { label: 'MITRE ATT&CK Navigator', note: 'The heatmap tool itself. Layers can be exported and version-controlled alongside rules.', href: 'https://mitre-attack.github.io/attack-navigator/' },
        ],
      },
    ],
  },

  practical: {
    minutes: 90,
    title: 'Workshop: Rebuild the detection library after a breach',
    blocks: [
      {
        kind: 'brief',
        id: 'brief',
        title: 'Briefing',
        minutes: 10,
        synthetic: true,
        resourceDir: 'detection-engineering',
        scenario:
          'You are the detection engineering team from the opening scenario. You have the post-incident report naming six techniques, the current rule inventory, a log source audit, and a threat intelligence summary for your sector. In ninety minutes you must produce a prioritised backlog and three deployable rules.',
        objectives: [
          'Build a coverage map from the existing rule inventory and identify every gap',
          'Prioritise the gaps using threat relevance, log availability and business impact — not ease',
          'Write three Sigma rules with ATT&CK tags, exclusions and documented false positives',
          'Define a validation plan for each rule stating what would prove it works',
          'Present the result in a form a non-technical executive could act on',
        ],
        requires: [
          { item: 'The rebuild pack (downloadable from this page)', note: 'Post-incident report, current rule inventory as a CSV, log source audit, and a sector threat intelligence summary.', file: '00-rebuild-pack.md' },
          { item: 'The Sigma rule template (downloadable)', note: 'Pre-filled with the required fields and inline comments explaining each.', file: '01-sigma-template.yml' },
          { item: 'A text editor', note: 'YAML. Indentation matters; the template is correctly indented already.' },
          { item: 'A browser', note: 'For attack.mitre.org and the SigmaHQ repository. You are encouraged to start from community rules.' },
        ],
        setup: [
          'Download the rebuild pack and the Sigma template.',
          'Create a working folder named detection-rebuild-<your-name>, with a rules/ subfolder.',
          'Read the log source audit before anything else. It constrains everything you can build.',
          'Open the SigmaHQ repository. Starting from an existing community rule is good practice here, not a shortcut — but you must adapt and document it, not copy it.',
        ],
        realism:
          'The rules you write will not be deployed to a live SIEM and will not be executed. They are assessed as engineering artefacts: correct syntax, sound logic, appropriate exclusions, honest documentation. Where a real deployment would differ — conversion schema mismatches, production noise you cannot predict from a pack — the brief says so, and your validation plan is where you are expected to account for it.',
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Detection Rule Development Workflow' }],
      },

      {
        kind: 'tasks',
        id: 'tasks',
        title: 'Your tasks',
        minutes: 55,
        lead:
          'Task 1 constrains tasks 2 and 3. Students who skip the audit write rules for data they do not have and lose the time anyway.',
        tasks: [
          {
            ref: 'T1',
            minutes: 12,
            title: 'Map coverage and find the gaps',
            steps: [
              'Read the rule inventory and tag every rule to its ATT&CK technique.',
              'Mark every technique from the post-incident report as covered or uncovered.',
              'Cross-reference against the log source audit. Mark any rule whose data source is not actually available as a false green.',
              'Produce a gap list separating rule gaps from log source gaps. They need different remediation and different budgets.',
            ],
            produces: 'A coverage table with gaps categorised as rule gaps or log source gaps.',
          },
          {
            ref: 'T2',
            minutes: 10,
            title: 'Prioritise',
            steps: [
              'For each gap, note whether the threat intelligence summary names it as used against your sector.',
              'For each, note whether the log source is available now, available with configuration, or absent.',
              'For each, note the business impact if the technique succeeded undetected.',
              'Rank them. Write one sentence of justification per item — the ranking is what will be challenged, not the list.',
            ],
            produces: 'A ranked backlog with a one-line justification for each position.',
          },
          {
            ref: 'T3',
            minutes: 25,
            title: 'Write three rules',
            steps: [
              'Take your top three gaps that have available log sources. A gap you cannot feed is not a rule, it is a logging project.',
              'Write each as a Sigma rule using the template. Include id, description, tags, logsource, detection, falsepositives and level.',
              'Include at least one exclusion in at least one rule, and make it narrow — name more than one field.',
              'Fill in falsepositives genuinely. If you cannot name a plausible one, you have probably not understood what else produces this pattern.',
              'Set status honestly. Nothing you write today is stable.',
            ],
            produces: 'Three Sigma rules in rules/, each complete and each with documented false positives.',
          },
          {
            ref: 'T4',
            minutes: 8,
            title: 'Validation plan and executive summary',
            steps: [
              'For each rule, state what data would prove it fires correctly and what would measure its false positive rate.',
              'Name the Atomic Red Team test or the equivalent simulation you would use, where one applies.',
              'Write a three-sentence executive summary of the rebuild: what was uncovered, what you are building first, and why that order.',
              'Avoid percentages in the summary. "43% coverage" invites the wrong question; "no coverage in the phase where the last attacker spent fourteen days" invites the right one.',
            ],
            produces: 'A validation plan per rule, and a three-sentence executive summary.',
          },
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Detection Rule Development Workflow' }],
      },

      {
        kind: 'hints',
        id: 'hints',
        title: 'Progressive hints',
        hints: [
          {
            forTask: 'T1',
            tiers: [
              'Work from the rule inventory to techniques, then from the incident report backwards. The gaps are what appears in one list and not the other.',
              'A false green is a rule whose logsource category does not appear in the log source audit as actually forwarding. Check every rule, not just the ones you doubt.',
              'There are at least two false greens in the pack. If you found none, you have not cross-referenced the audit.',
            ],
          },
          {
            forTask: 'T2',
            tiers: [
              'Three inputs: does the sector intelligence name it, is the data available, how bad is the impact. Rank on all three, not on which is easiest to write.',
              'A technique with no log source cannot be ranked first for rule development, however severe. It ranks first for a logging project, which is a different backlog.',
              'If your ranking puts lateral movement low, re-read the incident report. Fourteen days.',
            ],
          },
          {
            forTask: 'T3',
            tiers: [
              'Search SigmaHQ by technique ID. Adapting an existing rule is expected, and you must still document what you changed and why.',
              'For the exclusion, name at least two fields together. An exclusion on an account name alone becomes a hole the moment that account is compromised.',
              'If the falsepositives section is empty, ask what else in a 500-host estate produces this exact pattern. There is always something. An empty section means you have not looked.',
            ],
          },
          {
            forTask: 'T4',
            tiers: [
              'Validation has two halves: does it fire on the real thing, and how often does it fire on normal life. You need a plan for both.',
              'Historical data gives you the false positive rate for free — run the rule over three months of clean production data and count.',
              'For the summary, name the phase rather than the number. Lateral Movement with no coverage is a sentence an executive can act on.',
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
          { ref: 'D1', text: 'Coverage table with gaps categorised as rule gaps or log source gaps', required: true },
          { ref: 'D2', text: 'Ranked backlog with a one-line justification per item', required: true },
          { ref: 'D3', text: 'Three Sigma rules, complete and valid', required: true },
          { ref: 'D4', text: 'Validation plan per rule, covering both detection and false positive rate', required: true },
          { ref: 'D5', text: 'Three-sentence executive summary', required: true },
          { ref: 'D6', text: 'A note on any community rule you adapted, stating what you changed and why', required: false },
        ],
        structure: `detection-rebuild-<your-name>/
  00-coverage.md          → T1: the map, with false greens identified
  01-backlog.md           → T2: ranked, with justifications
  rules/
    <technique>-<name>.yml  → T3: one file per rule
  02-validation.md        → T4: how each rule gets proven
  03-executive-summary.md → T4: three sentences
  04-adaptations.md       → optional: what you changed from community rules`,
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Rule Documentation Template' }],
      },

      {
        kind: 'assessment',
        id: 'assessment',
        title: 'How this is assessed',
        criteria: [
          {
            band: 'Prioritisation reasoning',
            weight: '25%',
            descriptor:
              'The backlog reflects threat relevance, data availability and impact rather than ease of implementation. Rule gaps and log source gaps are distinguished and routed differently.',
          },
          {
            band: 'Rule correctness',
            weight: '25%',
            descriptor:
              'Valid Sigma. Logic matches the stated technique. Field names are plausible for the declared logsource. Conditions are specific enough to be quiet and broad enough to catch variations.',
          },
          {
            band: 'Exclusion quality',
            weight: '15%',
            descriptor:
              'Exclusions name more than one field and are as narrow as the evidence supports. A single-field exclusion on an account name loses most of these marks.',
          },
          {
            band: 'Documented false positives',
            weight: '15%',
            descriptor:
              'Genuine, specific and useful to a receiving analyst. An empty or generic section scores nothing.',
          },
          {
            band: 'Validation plan',
            weight: '10%',
            descriptor: 'Addresses both detection capability and false positive measurement, with named data or simulations.',
          },
          {
            band: 'Executive communication',
            weight: '10%',
            descriptor:
              'Three sentences a non-technical reader can act on. Risk framed by phase and consequence rather than by percentage.',
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
          'How many false greens did the room find? Did anyone build a rule for a log source that does not exist?',
          'Compare the top three in each backlog. Where they differ, is it a different judgement or a different reading of the intelligence?',
          'Read two exclusions aloud. Which would survive the excluded account being compromised?',
          'Did anyone leave a falsepositives section empty? What does that tell you about how well the pattern was understood?',
          'Whose executive summary would survive a board meeting? What made the difference?',
          'If all three of your rules were deployed tomorrow and the same attacker returned, at which step would they first fire — and how many hosts would they already be on?',
        ],
        landingPoint:
          'Detection engineering is the discipline of converting what you learned too late into something that fires early — and the hardest part is not writing the rule, it is being honest about what it will not catch.',
        provenance: 'supplementary',
      },

      {
        kind: 'recap',
        id: 'recap',
        title: 'Recap and further study',
        provenance: 'source',
        sources: [{ file: FILE, section: '13. Summary' }],
        takeaways: [
          'Every rule has three ingredients: data source, conditions, threshold.',
          'Signatures are fast and brittle. Behaviours are durable and need tuning. A mature library layers both.',
          'Five correlation patterns: threshold, sequence, aggregation, anomaly, multi-source.',
          'Alert fatigue is a security failure, not an inconvenience.',
          'Sigma makes rules portable, shareable and documented by construction.',
          'Gap analysis is continuous, and four methods find different kinds of gap.',
        ],
        furtherStudy: [
          { label: 'SigmaHQ', note: 'Community rules and the specification.', href: 'https://github.com/SigmaHQ/sigma' },
          { label: 'MITRE Caldera', note: 'Automated adversary emulation for purple team validation at scale.', href: 'https://caldera.mitre.org/' },
          { label: 'Next: Session 5 — Incident Response and Digital Evidence', note: 'Your rules fire. Now the alert is real, and the order of your next three actions decides whether the evidence survives.' },
        ],
      },
    ],
  },

  terms: [
    { term: 'Sigma', definition: 'A vendor-neutral YAML format for detection rules, convertible to any SIEM query language.' },
    { term: 'Correlation rule', definition: 'A rule combining multiple events across time or sources to produce a higher-confidence detection.' },
    { term: 'Tuning', definition: 'Adjusting a rule to reduce false positives. Always a trade against detection coverage, never a free improvement.' },
    { term: 'Coverage map', definition: 'A visual record of which ATT&CK techniques have detection rules. Records intent; a log source audit records capability.' },
    { term: 'Purple team', definition: 'An exercise where red executes techniques and blue verifies whether detections fire. The only gap-finding method that tests reality.' },
    { term: 'Precision', definition: 'Of the alerts a rule fires, the proportion that are true positives. High precision keeps the queue trusted.' },
    { term: 'Recall', definition: 'Of the real attacks present, the proportion a rule catches. High recall keeps the rule worth having.' },
  ],
}
