import type { Session } from '@/types/content'

const FILE = 'defensive_day_9_threat_hunting_esl (OPTIONAL).md'

export const session09: Session = {
  number: 9,
  slug: 'threat-hunting',
  title: 'Threat Hunting',
  summary:
    'Detection rules catch what you already thought to look for. Hunting is the search for what nobody wrote a rule for.',
  abstract:
    'Everything so far has been reactive: an alert fires, you investigate. This extension session covers the proactive discipline. You will learn the hypothesis format that turns vague searching into a repeatable, auditable process, the difference between IOC-based and behavioural hunting, stack counting and statistical baselining, MITRE-driven gap hunting, and the hunting-to-detection pipeline that stops you hunting the same technique twice. The practical runs a three-hypothesis hunt from a threat intelligence report.',
  track: 'extension',
  themes: ['Hypothesis', 'Baseline', 'Pipeline'],
  prerequisites: [
    'Session 4 — ATT&CK coverage mapping and Sigma, which hunting feeds back into',
    'Session 2 — the log sources every hunting query runs against',
    'Sessions 6 and 7 — the artefacts and behaviours you will be hunting for',
  ],
  outcomes: [
    'Write a hunting hypothesis in the standard format, naming behaviour, reason, expected evidence and data source',
    'Choose between IOC-based and behavioural hunting, and explain the limits of each',
    'Apply stack counting and statistical deviation to surface outliers in a large dataset',
    'Use ATT&CK coverage gaps to prioritise what to hunt for',
    'Document a hunt so that a negative result carries operational and regulatory value',
    'Convert a confirmed hunt finding into a deployable detection rule',
  ],
  sourceFiles: [FILE],
  sourceNotes: [
    'This file is marked OPTIONAL in the supplied material and is taught here as an extension session. Its forward pointer names Active Directory security as the following day, which matches the supplied sequence.',
  ],

  theory: {
    minutes: 90,
    blocks: [
      {
        kind: 'title',
        id: 'open',
        title: 'Session 9',
        overline: 'Defensive Track · Session 09 of 10 · Extension',
        lead:
          'Smoke detectors catch fires after they start. A fire marshal walks the building looking for the conditions that cause them.',
        provenance: 'source',
        sources: [{ file: FILE, section: '2. Introduction' }],
      },

      {
        kind: 'retrieval',
        id: 'retrieval',
        title: 'Recall from Sessions 4, 6 and 7',
        minutes: 6,
        recallPrompt: 'From memory.',
        questions: [
          'In Session 4, which gap-finding method tells you whether a detection actually works?',
          'Which technique on the Session 4 coverage map was uncovered and allowed fourteen days of undetected movement?',
          'What makes WmiPrvSE.exe spawning a child process interesting, and when did you first see that process?',
          'Why is a documented hunt that found nothing worth more than an undocumented one?',
        ],
        answers: [
          'A purple team exercise — execute the technique and observe whether an alert fires. The others examine records rather than behaviour.',
          'T1021.001, Remote Desktop Protocol. Lateral movement had no coverage at all.',
          'WmiPrvSE.exe is the WMI provider host. Spawning cmd.exe or powershell.exe from it indicates WMI-based lateral movement. It appeared as benign line 21 in the Session 2 log exercise, with svchost.exe as its parent.',
          'Because you cannot distinguish an undocumented hunt that found nothing from a hunt that never happened — so it provides no assurance, no regulatory evidence and no reusable query.',
        ],
        provenance: 'supplementary',
      },

      {
        kind: 'scenario',
        id: 'scenario',
        title: 'Opening scenario: the report that names no indicators',
        minutes: 4,
        synthetic: true,
        setting: 'A threat intelligence briefing, Monday morning.',
        narrative: [
          'The intelligence team circulates a report: an actor targeting financial firms uses valid VPN credentials for initial access, WMI for lateral movement, and DCSync for credential harvesting.',
          'There are no addresses in the report. No hashes. No domains. The actor rotates infrastructure within days, so there would be no point.',
          'Your SIEM has fired nothing. Your coverage map is green where you have rules and red where you do not — and none of the three named techniques has a rule.',
        ],
        drivingQuestion:
          'With no indicators to search for and no alerts to investigate, what exactly do you do first?',
        provenance: 'source',
        sources: [{ file: FILE, section: '7. Scenario Walkthrough: APT Threat Intel Driven Hunt' }],
      },

      {
        kind: 'objectives',
        id: 'objectives',
        title: 'What you will be able to do',
        minutes: 3,
        provenance: 'supplementary',
        objectives: [
          { verb: 'Write', text: 'a hypothesis naming behaviour, reason, expected evidence and data source' },
          { verb: 'Choose', text: 'between IOC-based and behavioural hunting, with their limits' },
          { verb: 'Apply', text: 'stack counting and statistical deviation to surface outliers' },
          { verb: 'Prioritise', text: 'hunts using ATT&CK coverage gaps and sector threat intelligence' },
          { verb: 'Document', text: 'a hunt so a negative result carries value' },
          { verb: 'Convert', text: 'a confirmed finding into a deployable detection rule' },
        ],
      },

      {
        kind: 'concept',
        id: 'hypothesis',
        title: 'The hypothesis is what separates hunting from browsing',
        minutes: 7,
        lead:
          'A vague hunt — "look for anything suspicious" — produces results that cannot be interpreted, documented or repeated. The format fixes that.',
        points: [
          'The format: I believe [behaviour] may be occurring because [reason], and I would expect to see [evidence] in [data source].',
          'Behaviour names a specific technique, not a feeling.',
          'Reason connects it to something real — a threat report, a peer incident, an observed anomaly, a coverage gap.',
          'Expected evidence makes the hunt falsifiable. Without it, a negative result means nothing.',
          'Data source makes the hunt runnable, and exposes immediately whether you have the telemetry at all.',
        ],
        callout: {
          tone: 'rule',
          text: 'The hypothesis is what gives a negative result meaning. If you queried the right source for the right evidence and found none, the technique probably is not present. Without the hypothesis, a null result could equally mean the query was wrong or the data source was missing — and you cannot tell which.',
        },
        redView:
          'Hypothesis-driven hunting is the defensive technique that most threatens a slow, careful operation, because it looks in places no alert is watching. The only counter is to operate so close to normal behaviour that no anomaly reaches significance — which severely limits operational tempo.',
        blueView:
          'The format enforces analytical discipline and produces a documented question, a reproducible query and a defensible conclusion. It turns hunting from an art practised by one person into a process a team can run.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.1 Hypothesis-Based Hunting' }],
        detail: [
          'Worked examples from the source: "I believe an attacker may be using encoded PowerShell for lateral movement because our EDR detected a similar technique at a peer organisation, and I would expect to see -enc or -encodedcommand flags in Sysmon Event ID 1 combined with unusual parent processes."',
          'And: "I believe a compromised service account is being used for lateral movement because one service account has authentication events outside its normal hours, and I would expect to see Logon Type 3 events from that account across multiple machines in a short timeframe."',
          'Three outcomes, three actions. Confirmed: escalate to IR, preserve evidence, write the rule. Refuted: document that the technique was searched for — this is evidence of resilience. Inconclusive: identify what additional data would resolve it and raise a logging improvement ticket.',
        ],
      },

      {
        kind: 'compare',
        id: 'ioc-vs-behav',
        title: 'IOC-based or behavioural',
        minutes: 5,
        lead: 'Two hunting modes. Fast and narrow, or slow and durable. You need both.',
        columns: [{ label: 'IOC-based' }, { label: 'Behavioural' }],
        rows: [
          { label: 'Starts from', cells: ['Known-bad indicators from a report or an incident', 'A hypothesis about attacker behaviour'] },
          { label: 'Speed', cells: ['Minutes — it is a search', 'Hours — it needs a baseline and interpretation'] },
          { label: 'Catches', cells: ['This specific known campaign', 'The technique, whatever tool implements it'] },
          { label: 'Misses', cells: ['Anything novel, and anything after infrastructure rotation', 'Rarely misses the technique; may miss it under the noise floor'] },
          { label: 'Staleness', cells: ['Days. Addresses rotate; hashes change on recompile.', 'Years. The technique outlives the tooling.'] },
          { label: 'A clean result means', cells: ['This specific campaign has not touched you', 'This technique does not appear above your detection threshold'] },
          { label: 'Use when', cells: ['A report lands, or you find one compromised host and need to check the rest', 'Closing a coverage gap, or acting on intelligence with no indicators'] },
        ],
        provenance: 'source',
        sources: [
          { file: FILE, section: '4.2 IOC-Based Hunting' },
          { file: FILE, section: '4.3 Behavioral Anomaly Hunting' },
        ],
        detail: [
          'The pairing rule from the source: always run the IOC sweep first because it is fast, and then immediately follow it with a behavioural hunt for the techniques those indicators represent. A clean IOC result is not a clearance — attackers rotate infrastructure faster than intelligence feeds publish it.',
          'The opening scenario is precisely the case where IOC hunting is unavailable. The report names no indicators because the actor rotates within days. Behavioural hunting is the only option.',
        ],
      },

      {
        kind: 'concept',
        id: 'baseline',
        title: 'Stack counting and the long tail',
        minutes: 6,
        lead:
          'Behavioural hunting looks for deviation from normal. That requires knowing what normal is, which is the part organisations skip.',
        points: [
          'Stack counting — count occurrences of each event type, then examine the rarest. Sort ascending, not descending.',
          'A rare parent-child pair is not automatically malicious. WINWORD.EXE spawning powershell.exe once is worth investigating; explorer.exe spawning notepad.exe fifty thousand times is not.',
          'Time-based — the same activity, restricted to outside working hours.',
          'Volume-based — outbound bytes per host above a threshold derived from the baseline.',
          'First-seen — a process name, a destination, or a source country that has never appeared before.',
          'Statistical deviation — events more than three standard deviations above the per-host mean.',
        ],
        callout: {
          tone: 'warn',
          text: 'Baselines take thirty to ninety days of clean data to establish. That means building them before you need them. An organisation that has never defined normal cannot identify abnormal, and discovering this during an active hunt is too late.',
        },
        redView:
          'Behavioural hunting is the hardest detection to evade, because it targets the actions rather than their implementation. Replacing every tool still leaves the lateral movement. The only counter is tempo reduction — operating slowly enough that each individual anomaly stays inside the noise band.',
        blueView:
          'Hunt quality is bounded by baseline quality. Investment in baselines is investment in detection infrastructure, and it is the least visible and most load-bearing work a hunting programme does.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.3 Behavioral Anomaly Hunting' }],
      },

      {
        kind: 'query',
        id: 'queries',
        title: 'Hunting queries for the three scenario techniques',
        minutes: 11,
        language: 'splunk',
        assumes:
          'Splunk SPL with Windows Security and Sysmon forwarded. Field names follow the Splunk CIM. In Sentinel or Elastic the logic is identical and the syntax is not. These are hunting queries, run interactively — not detection rules, which fire automatically.',
        lead:
          'One query per hypothesis from the opening scenario. Read what each is actually asking.',
        code: `/* Hypothesis 1 — VPN credential abuse.
   Expect: authentication from a country this account has never used. */
index=vpn_logs
| iplocation src_ip
| stats values(Country) as countries, dc(Country) as country_count by user
| where country_count > 1
| sort -country_count

/* Hypothesis 2 — WMI lateral movement.
   Expect: WmiPrvSE.exe spawning processes that are not its usual children. */
index=sysmon EventCode=1
ParentImage="*\\\\WmiPrvSE.exe"
NOT Image IN ("*\\\\WmiPrvSE.exe", "*\\\\msiexec.exe", "*\\\\svchost.exe")
| table _time, host, user, Image, CommandLine
| sort _time

/* Hypothesis 3 — DCSync.
   Expect: directory replication rights invoked from a machine that is not a DC. */
index=windows EventCode=4662
(Properties="*1131f6aa*" OR Properties="*1131f6ad*")
NOT SubjectUserName="*$"
| table _time, host, SubjectUserName, Properties
| sort _time`,
        walkthrough: [
          { part: 'iplocation + dc(Country)', explains: 'Resolves each source address to a country and counts distinct countries per account. An account with more than one is worth a look; it is not by itself a finding.' },
          { part: 'ParentImage WmiPrvSE.exe with exclusions', explains: 'The WMI provider host legitimately spawns a small, known set of children. Excluding those leaves only the unusual ones — a textbook stack-counting narrowing.' },
          { part: 'EventCode=4662 with replication GUIDs', explains: '1131f6aa is DS-Replication-Get-Changes and 1131f6ad is DS-Replication-Get-Changes-All. These are the exact permissions DCSync abuses.' },
          { part: 'NOT SubjectUserName="*$"', explains: 'Accounts ending in $ are machine accounts. Domain controllers legitimately replicate with each other; a user account invoking replication rights does not.' },
          { part: 'sort and table rather than alert', explains: 'These are interactive hunting queries producing a list for a human to read, not automated rules. Converting them to rules is the final step of the hunt, not the first.' },
        ],
        expected:
          'Hypothesis 1 returns a handful of accounts, mostly explicable by travel and VPN egress — exactly the false positive from Session 1. Hypothesis 2 should return nothing in a healthy environment. Hypothesis 3 should return nothing at all; it is one of the highest-precision queries in enterprise security.',
        limitations: [
          'Query 1 produces the corporate VPN false positive from Session 1 unless egress addresses are resolved to the user\'s home region first.',
          'Query 1 also depends on geolocation accuracy, which is approximate and worse for some ranges than others.',
          'Query 2 only catches WMI execution that spawns a visible child process. WMI event subscriptions — the fileless persistence from Session 6 — do not appear here.',
          'Query 3 requires directory service object access auditing to be enabled. It is not on by default, and without it the query runs clean on a compromised domain.',
          'All three are point-in-time hunts over whatever range you give them. They do not run continuously, which is why a confirmed finding must become a rule.',
        ],
        provenance: 'source',
        sources: [
          { file: FILE, section: '7. Scenario Walkthrough: APT Threat Intel Driven Hunt' },
          { file: FILE, section: '4.7 Building Structured Hunting Queries' },
        ],
      },

      {
        kind: 'concept',
        id: 'pipeline',
        title: 'The hunting-to-detection pipeline',
        minutes: 6,
        lead:
          'A hunting programme that does not produce rules is a programme that hunts the same technique forever.',
        points: [
          'Hunt manually. Find the behaviour. Write a Sigma rule. Test it. Deploy it. Confirm the coverage.',
          'Every confirmed finding must produce a rule before the hunt is closed.',
          'Every refuted hunt must produce a documented query, so the next hunter does not rebuild it.',
          'Every inconclusive hunt must produce a logging improvement ticket naming the missing data.',
          'Over a year, the automated coverage grows and the manual workload shrinks onto genuinely hard techniques.',
        ],
        callout: {
          tone: 'rule',
          text: 'Hunt frequency by priority: critical techniques used against your sector weekly; high-priority coverage gaps monthly; remaining uncovered techniques quarterly; IOC sweeps on receipt of every report.',
        },
        redView:
          'A hunt on a predictable schedule is a known defensive capability. An operator who knows WMI lateral movement is hunted every Monday can finish and clean up before Monday. Unpredictable scheduling is itself a defensive property.',
        blueView:
          'Documentation serves two purposes simultaneously: it builds a reusable query library that compounds, and it creates a record of due diligence for regulators. Both depend on writing up hunts that found nothing.',
        provenance: 'source',
        sources: [{ file: FILE, section: '8. Defender\'s View — Building a Hunting Program' }],
      },

      {
        kind: 'interaction',
        id: 'coverage',
        title: 'Guided analysis: choose what to hunt',
        minutes: 12,
        component: 'coverage-map',
        lead:
          'The same coverage map from Session 4, now read as a hunting backlog rather than a development backlog. Which uncovered techniques do you hunt first?',
        teaches:
          'That hunting priority comes from the intersection of coverage gap, sector threat relevance and available telemetry — and that a gap with no telemetry is not a hunt at all, it is a logging project wearing a hunt\'s clothes.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.4 MITRE-Driven Hunting' }],
        detail: [
          'The high-priority techniques the source names as commonly missed, with the reason each is missed: Scheduled Task (T1053.005) because legitimate tasks are numerous and hard to baseline; Valid Accounts (T1078) because it looks like authorised login; WMI Execution (T1047) because it is a built-in tool with no new binary; Living off the Land (T1218) because the binaries are signed; DNS Tunnelling (T1071.004) because it looks like DNS; Log Clearing (T1070.001) because it is a single event; and DCSync (T1003.006) because replication traffic resembles legitimate DC activity.',
        ],
        data: {
          mode: 'hunting',
          tactics: [
            {
              name: 'Initial Access',
              techniques: [
                { id: 'T1078', name: 'Valid Accounts', covered: false, note: 'Named in the sector intelligence. Telemetry available. Hunt first — this is hypothesis 1.' },
                { id: 'T1190', name: 'Exploit Public-Facing Application', covered: false, note: 'No WAF logs forwarded. Not huntable. This is a logging project, not a hunt.' },
              ],
            },
            {
              name: 'Execution',
              techniques: [
                { id: 'T1047', name: 'Windows Management Instrumentation', covered: false, note: 'Named in the intelligence. Sysmon available. Hunt — this is hypothesis 2.' },
                { id: 'T1218', name: 'Signed Binary Proxy Execution', covered: false, note: 'LOLBins. Huntable by stack counting command-line arguments. Monthly priority.' },
              ],
            },
            {
              name: 'Persistence',
              techniques: [
                { id: 'T1546.003', name: 'WMI Event Subscription', covered: false, note: 'Fileless and rarely examined. Needs Event IDs 5857–5861, which are not currently collected. Logging project first.' },
              ],
            },
            {
              name: 'Credential Access',
              techniques: [
                { id: 'T1003.006', name: 'DCSync', covered: false, note: 'Named in the intelligence. Highest impact on the map. Hunt — this is hypothesis 3. Needs directory service auditing enabled; verify before concluding anything from a clean result.' },
                { id: 'T1558.003', name: 'Kerberoasting', covered: false, note: 'Event ID 4769 with RC4. Very high precision. Quarterly if not named in intelligence, and trivially cheap to run.' },
              ],
            },
            {
              name: 'Lateral Movement',
              techniques: [
                { id: 'T1021.001', name: 'Remote Desktop Protocol', covered: false, note: 'The fourteen-day gap. Huntable by the one-to-many authentication pattern. Weekly until a rule exists.' },
                { id: 'T1550.002', name: 'Pass the Hash', covered: false, note: 'NTLM network logon from unexpected sources. Huntable now.' },
              ],
            },
            {
              name: 'Exfiltration',
              techniques: [
                { id: 'T1041', name: 'Exfiltration Over C2 Channel', covered: false, note: 'Requires a per-host outbound volume baseline. None exists. Baseline project before hunt.' },
              ],
            },
          ],
          summary: {
            total: 9,
            covered: 0,
            prompt:
              'Nine uncovered techniques. Three are named in the sector intelligence and have the telemetry — those are this week. Three more are huntable but not named. Three are not huntable at all until the logging changes, and calling those "hunts" would be a way of not noticing that the real task is different.',
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
            stem: 'You hunt for DCSync and find nothing. What have you established?',
            options: [
              {
                text: 'Nothing yet — first verify that directory service object access auditing is actually enabled',
                correct: true,
                feedback:
                  'Correct, and this is the trap. Without that auditing, Event ID 4662 is never generated, so the query returns clean on a fully compromised domain. Confirm the telemetry exists before interpreting a null result.',
              },
              {
                text: 'That no DCSync attack has occurred in the queried window',
                correct: false,
                feedback:
                  'Only if the data source was present and correct. That is exactly what the hypothesis format forces you to check.',
              },
              {
                text: 'That the domain is secure',
                correct: false,
                feedback: 'One technique, one window. A refuted hypothesis is narrow by design.',
              },
              {
                text: 'That the hunt was wasted effort',
                correct: false,
                feedback:
                  'A documented negative is evidence of due diligence and narrows the known-good state — provided the data source was verified.',
              },
            ],
          },
          {
            id: 'q2',
            stem: 'Why sort a stack count ascending rather than descending?',
            options: [
              {
                text: 'Because attacker activity is rare, and the rarest events are where it hides',
                correct: true,
                feedback:
                  'Correct. The top of a descending list is the most normal thing in the environment. The long tail is where the single anomalous parent-child pair sits.',
              },
              {
                text: 'Because ascending sorts run faster',
                correct: false,
                feedback: 'Sort direction has no meaningful performance implication here.',
              },
              {
                text: 'Because the most frequent events are the most dangerous',
                correct: false,
                feedback: 'The inverse. High frequency almost always means legitimate activity.',
              },
              {
                text: 'Because it matches how SIEM dashboards display data',
                correct: false,
                feedback: 'Dashboards typically do the opposite, which is part of why hunting requires leaving them.',
              },
            ],
          },
          {
            id: 'q3',
            stem: 'A hunt confirms WMI lateral movement. What must happen before the hunt is closed?',
            options: [
              {
                text: 'A Sigma detection rule is written, tested and deployed for the behaviour found',
                correct: true,
                feedback:
                  'Correct. Without it, the next occurrence requires another manual hunt. The pipeline — hunt, find, rule, deploy — is what makes a programme compound instead of repeat.',
              },
              {
                text: 'The affected hosts are reimaged',
                correct: false,
                feedback: 'Part of the IR response that the finding triggers, and not what closes the hunt.',
              },
              {
                text: 'The hypothesis is rewritten to match what was found',
                correct: false,
                feedback:
                  'Never. The hypothesis is the record of what you asked before you knew the answer. Rewriting it destroys the audit value of the whole exercise.',
              },
              {
                text: 'The coverage map is updated',
                correct: false,
                feedback: 'It is — once the rule exists. The map records automated coverage, and a hunt alone does not provide that.',
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
          'Write the hypothesis before running a single query. It is what makes a negative result mean anything.',
          'Every confirmed finding produces a Sigma rule before the hunt closes.',
          'A documented hunt that found nothing has value; an undocumented one has none.',
          'Stack counting ascending surfaces the long tail where attacker activity sits.',
          'Baselines take thirty to ninety days. Build them before you need them.',
          'Verify the data source exists before interpreting a clean result.',
        ],
        furtherStudy: [
          { label: 'MITRE ATT&CK Navigator', note: 'Build and export the coverage layer that drives hunt prioritisation.', href: 'https://mitre-attack.github.io/attack-navigator/' },
          { label: 'TaHiTI methodology', note: 'A published, formal hypothesis-driven hunting methodology.', href: 'https://www.betaalvereniging.nl/en/safety/tahiti/' },
          { label: 'SigmaHQ', note: 'Where confirmed hunt findings become deployable rules.', href: 'https://github.com/SigmaHQ/sigma' },
        ],
      },
    ],
  },

  practical: {
    minutes: 90,
    title: 'Workshop: A three-hypothesis hunt',
    blocks: [
      {
        kind: 'brief',
        id: 'brief',
        title: 'Briefing',
        minutes: 10,
        synthetic: true,
        resourceDir: 'threat-hunting',
        scenario:
          'The threat intelligence report from the opening scenario. Three techniques, no indicators. You have thirty days of VPN authentication logs, Sysmon process creation events, and Windows Security events including directory service object access. Hunt all three.',
        objectives: [
          'Write three hypotheses in the standard format before running any query',
          'Execute each hunt and reach a documented conclusion: confirmed, refuted or inconclusive',
          'Separate genuine findings from the baseline false positives you have already met in this course',
          'Convert every confirmed finding into a Sigma rule',
          'Document all three hunts so a colleague could rerun them in six months',
        ],
        requires: [
          { item: 'The hunt pack (downloadable)', note: 'Thirty days of synthetic VPN logs, Sysmon events and Windows Security events, with a baseline summary for the environment.', file: '00-hunt-pack.md' },
          { item: 'The hunt record template (downloadable)', note: 'The documentation template from the source material, one per hypothesis.', file: '01-hunt-record-template.md' },
          { item: 'A spreadsheet', note: 'For stack counting and the distinct-count aggregations.' },
          { item: 'The Sigma template from Session 4', note: 'For converting confirmed findings into rules.' },
        ],
        setup: [
          'Download the hunt pack and the hunt record template.',
          'Create a working folder named hunt-<date>-<your-name>.',
          'Read the baseline summary first. Every behavioural hunt in this workshop is measured against it.',
          'Write all three hypotheses before running any query. Writing them afterwards is the single most common way this exercise is done wrongly, and it invalidates every negative result.',
        ],
        realism:
          'The data is synthetic and generated for this workshop, with the environment\'s baseline supplied rather than derived from thirty days of real collection. The aggregations are done in a spreadsheet rather than in SPL — the query logic is given in the pack for each hypothesis, and what is assessed is hypothesis quality, interpretation and the decision about what each result means. Those are the parts that transfer to any SIEM.',
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Hunting Workflow' }],
      },

      {
        kind: 'tasks',
        id: 'tasks',
        title: 'Your tasks',
        minutes: 55,
        lead: 'Hypotheses first, all three, before any data is touched.',
        tasks: [
          {
            ref: 'T1',
            minutes: 10,
            title: 'Write three hypotheses',
            steps: [
              'For each technique in the intelligence report, write a hypothesis in the full standard format.',
              'Name the specific data source and the specific event IDs or fields you expect the evidence in.',
              'For each, write what a confirmed result would look like and what a refuted result would look like.',
              'Verify that the data source you named is actually present in the pack. If it is not, that is your result for that hypothesis.',
            ],
            produces: 'Three hypotheses in the standard format, with data sources verified as available.',
          },
          {
            ref: 'T2',
            minutes: 12,
            title: 'Hypothesis 1 — credential abuse',
            steps: [
              'Aggregate the VPN logs by account and count distinct countries per account.',
              'For every account with more than one, check it against the baseline summary.',
              'Eliminate the ones explained by the corporate VPN egress — you have met this false positive before.',
              'For anything remaining, check the device identifier and the timing. Record your conclusion with its evidence.',
            ],
            produces: 'Hypothesis 1 result: confirmed, refuted or inconclusive, with the eliminations shown.',
          },
          {
            ref: 'T3',
            minutes: 12,
            title: 'Hypothesis 2 — WMI lateral movement',
            steps: [
              'Filter Sysmon Event ID 1 for WmiPrvSE.exe as the parent process.',
              'Exclude the known legitimate children listed in the baseline summary.',
              'For anything remaining, record the host, the user context, the time and the full command line.',
              'Cross-reference the user context against your hypothesis 1 result. If they match, that is a chain, not a coincidence.',
            ],
            produces: 'Hypothesis 2 result with any finding fully detailed, and any link to hypothesis 1 stated.',
          },
          {
            ref: 'T4',
            minutes: 12,
            title: 'Hypothesis 3 — DCSync',
            steps: [
              'First, verify that directory service object access auditing is enabled in the environment. The pack tells you. A clean result means nothing without this.',
              'Filter Event ID 4662 for the two replication GUIDs.',
              'Exclude machine accounts — those ending in $.',
              'For anything remaining, record the account, the source host and the time, and check whether that host is a domain controller.',
            ],
            produces: 'Hypothesis 3 result, with the auditing verification recorded explicitly.',
          },
          {
            ref: 'T5',
            minutes: 9,
            title: 'Document and convert',
            steps: [
              'Complete a hunt record for each hypothesis, whatever its outcome.',
              'For every confirmed finding, write a Sigma rule using the Session 4 template.',
              'For every refuted hunt, record the query and the parameters so it can be rerun.',
              'For every inconclusive hunt, write the logging improvement ticket naming the missing data.',
              'If the three findings form a chain, write the chain out as a single sequence with times.',
            ],
            produces: 'Three hunt records, Sigma rules for confirmed findings, and any chain written as one sequence.',
          },
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Hunt Documentation Template' }],
      },

      {
        kind: 'hints',
        id: 'hints',
        title: 'Progressive hints',
        hints: [
          {
            forTask: 'T1',
            tiers: [
              'Fill the four slots literally: behaviour, reason, expected evidence, data source. If any slot is vague, the hunt will be too.',
              'The reason for all three is the same intelligence report. Say so — provenance is part of the record.',
              'For expected evidence, name the event ID and the field. "Authentication logs" is a category; "Event ID 4624, the IpAddress field" is a data source.',
            ],
          },
          {
            forTask: 'T2',
            tiers: [
              'Count distinct countries per account first, then investigate only the accounts with more than one.',
              'The corporate VPN false positive from Session 1 is present in this data. Identify its egress addresses from the baseline before you investigate anything.',
              'After eliminating VPN egress, check the remaining accounts\' device identifiers. The same managed device at both locations is exculpatory; a new unmanaged device is not.',
            ],
          },
          {
            forTask: 'T3',
            tiers: [
              'WmiPrvSE.exe legitimately spawns a short list of children. The baseline summary names them.',
              'Anything outside that list is worth reading in full — host, user, time, command line.',
              'When you find something, look at which account it ran as and compare with your hypothesis 1 result. The two hunts may be looking at the same intrusion from different angles.',
            ],
          },
          {
            forTask: 'T4',
            tiers: [
              'Check the auditing status before you filter anything. It is stated in the pack and it determines what a null result means.',
              'The two GUIDs are 1131f6aa and 1131f6ad. Match on the Properties field containing either.',
              'A machine account ends with $. A user account invoking replication rights from a host that is not a domain controller is the finding — note both halves.',
            ],
          },
          {
            forTask: 'T5',
            tiers: [
              'Complete a record for every hypothesis including the refuted ones. The refuted record is the one with regulatory value.',
              'For the Sigma rules, start from the hunting query logic and add the exclusions you had to apply by hand.',
              'For the chain: order by time across all three hunts, with the account as the thread tying them together.',
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
          { ref: 'D1', text: 'Three hypotheses in the standard format, written before any query', required: true },
          { ref: 'D2', text: 'Three completed hunt records with conclusions and evidence', required: true },
          { ref: 'D3', text: 'The data source verification for hypothesis 3, recorded explicitly', required: true },
          { ref: 'D4', text: 'Sigma rules for every confirmed finding', required: true },
          { ref: 'D5', text: 'Documented queries for refuted hunts, reusable in six months', required: true },
          { ref: 'D6', text: 'The attack chain written as one sequence, if the findings connect', required: true },
          { ref: 'D7', text: 'A logging improvement ticket for any inconclusive hunt', required: false },
        ],
        structure: `hunt-<date>-<your-name>/
  00-hypotheses.md    → T1: all three, written first
  01-hunt-vpn.md      → T2: hypothesis 1 record
  02-hunt-wmi.md      → T3: hypothesis 2 record
  03-hunt-dcsync.md   → T4: hypothesis 3 record, with auditing verification
  rules/              → T5: Sigma rules for confirmed findings
  04-chain.md         → T5: the connected sequence, if there is one
  05-logging-gaps.md  → T5: tickets for inconclusive hunts`,
        provenance: 'source',
        sources: [{ file: FILE, section: '6. Reporting Mindset — Hunt Documentation Template' }],
      },

      {
        kind: 'assessment',
        id: 'assessment',
        title: 'How this is assessed',
        criteria: [
          {
            band: 'Hypothesis quality',
            weight: '25%',
            descriptor:
              'All four components present and specific. Data source named precisely enough to verify. Written before the queries — evident from the record, and heavily penalised if reverse-engineered from the findings.',
          },
          {
            band: 'Interpretation discipline',
            weight: '25%',
            descriptor:
              'Null results interpreted correctly, with the data source verified first. Known false positives eliminated with reasoning shown rather than ignored.',
          },
          {
            band: 'Chain recognition',
            weight: '20%',
            descriptor:
              'Where findings connect, the connection is identified and written as one sequence. Treating three related findings as three separate incidents loses this band.',
          },
          {
            band: 'Documentation completeness',
            weight: '20%',
            descriptor:
              'A record for every hypothesis, including refuted ones. Queries recorded well enough to rerun. Outcomes stated unambiguously.',
          },
          {
            band: 'Pipeline completion',
            weight: '10%',
            descriptor: 'Confirmed findings converted to valid Sigma rules. Inconclusive hunts converted to logging tickets.',
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
          'Did everyone write all three hypotheses before querying? Be honest — what changed in the ones written afterwards?',
          'Who eliminated the VPN false positive, and who investigated it as a finding?',
          'Did the room notice that the three findings share an account? Who saw it first, and at which hypothesis?',
          'For hypothesis 3, who checked the auditing status before interpreting the result?',
          'What would a refuted hunt record be worth to you in twelve months? What would an undocumented one be worth?',
          'Which of your Sigma rules would have caught this chain earliest, and how much earlier?',
        ],
        landingPoint:
          'Hunting is not searching harder — it is asking a question precisely enough that both answers are informative, which is the only way a search that finds nothing can still be worth the morning it took.',
        provenance: 'supplementary',
      },

      {
        kind: 'recap',
        id: 'recap',
        title: 'Recap and further study',
        provenance: 'source',
        sources: [{ file: FILE, section: '13. Summary' }],
        takeaways: [
          'Hunting operates in the gap between what rules cover and where skilled attackers deliberately work.',
          'The hypothesis format makes a hunt documentable, repeatable and interpretable in both directions.',
          'IOC hunting is fast and goes stale. Behavioural hunting is durable and needs baselines.',
          'Stack counting ascending surfaces the long tail. Statistical deviation surfaces the outliers.',
          'The one-to-many authentication pattern is the most reliable lateral movement signal available.',
          'Every hunt produces something: a rule, a documented query, or a logging ticket.',
        ],
        furtherStudy: [
          { label: 'TaHiTI methodology', note: 'Formal hypothesis-driven hunting methodology, published and free.', href: 'https://www.betaalvereniging.nl/en/safety/tahiti/' },
          { label: 'MITRE ATT&CK Navigator', note: 'Coverage layers to drive hunt prioritisation.', href: 'https://mitre-attack.github.io/attack-navigator/' },
          { label: 'Next: Session 10 — Active Directory Security', note: 'Your third hypothesis found DCSync. Next: the full picture of how a domain falls, and what it takes to get it back.' },
        ],
      },
    ],
  },

  terms: [
    { term: 'Threat hunting', definition: 'Proactively searching for threats that have not triggered an alert, in the gap between rule coverage and attacker behaviour.' },
    { term: 'Hypothesis', definition: 'A specific, testable statement of expected attacker behaviour, expected evidence and data source. What makes a negative result meaningful.' },
    { term: 'Stack counting', definition: 'Counting occurrences of each event type and examining the rarest. Sorted ascending, not descending.' },
    { term: 'Long tail', definition: 'The rare events at the bottom of a frequency distribution, where attacker activity hides.' },
    { term: 'Baseline', definition: 'The established normal for an environment. Takes 30–90 days of clean data and must exist before a hunt needs it.' },
    { term: 'One-to-many pattern', definition: 'One source authenticating to many destinations in a short window. The most reliable lateral movement signal, independent of tooling.' },
    { term: 'Hunting-to-detection pipeline', definition: 'Hunt manually, find the behaviour, write a rule, deploy it. How a hunting programme compounds instead of repeating.' },
  ],
}
