import type { Session } from '@/types/content'

const FILE = 'defensive_day_7_network_memory_forensics_esl.md'

export const session07: Session = {
  number: 7,
  slug: 'network-memory-forensics',
  title: 'Network and Memory Forensics',
  summary:
    'The one layer an attacker cannot clean from inside the host, and the one that holds what never touched disk.',
  abstract:
    'Disk forensics tells you the history. Network evidence tells you what the machine communicated with, and it is preserved outside the attacker\'s reach. Memory tells you what was actually running at the moment of capture, including code that never wrote a file. This session covers PCAP triage, beaconing detection through timing statistics, DNS anomalies, exfiltration patterns, and the Volatility workflow for finding injected code. The practical reconstructs a compromise across all three layers.',
  track: 'core',
  themes: ['Beaconing', 'DNS', 'Injection'],
  prerequisites: [
    'Session 5 — why memory is captured before isolation',
    'Session 6 — host artefacts, so you can see what network and memory add to them',
    'Basic networking: what a port is, what DNS resolution does, what TCP and UDP are',
  ],
  outcomes: [
    'Triage a packet capture using conversation volume and traffic timing before any packet-level inspection',
    'Identify command-and-control beaconing from timing regularity, including when jitter is applied',
    'Detect domain generation algorithms and DNS tunnelling from query patterns alone',
    'Distinguish exfiltration from legitimate transfer using volume baselines and destination context',
    'Run the core Volatility workflow and interpret its output',
    'Explain why PAGE_EXECUTE_READWRITE memory containing an MZ header is a near-certain injection indicator',
  ],
  sourceFiles: [FILE],

  theory: {
    minutes: 90,
    blocks: [
      {
        kind: 'title',
        id: 'open',
        title: 'Session 7',
        overline: 'Defensive Track · Session 07 of 10',
        lead:
          'An attacker can erase malware from a disk. They cannot reach into your firewall and remove the connection records.',
        provenance: 'source',
        sources: [{ file: FILE, section: '2. Introduction' }],
      },

      {
        kind: 'retrieval',
        id: 'retrieval',
        title: 'Recall from Sessions 5 and 6',
        minutes: 6,
        recallPrompt: 'From memory.',
        questions: [
          'Why is memory captured before EDR isolation, rather than after?',
          'In Session 6, what single artefact linked the Linux host to the Windows workstation?',
          'What did the cron entry */5 * * * * tell you, and what would you expect to see from the network side?',
          'Name two things that exist only in RAM.',
        ],
        answers: [
          'Isolation may terminate the injected process, destroying the evidence of the connection at the same moment it ends the connection.',
          'known_hosts — the SSH file listing machines connected to from that host.',
          'A five-minute interval, which is a beacon schedule rather than a maintenance job. From the network side: regular, small, evenly spaced outbound connections to one destination.',
          'Injected code with no file on disk, decrypted credentials, encryption keys, and the live connection table at the moment of capture.',
        ],
        provenance: 'supplementary',
      },

      {
        kind: 'scenario',
        id: 'scenario',
        title: 'Opening scenario: 48 connections, perfectly spaced',
        minutes: 4,
        synthetic: true,
        setting: 'An NDR alert at 03:00.',
        narrative: [
          'WORKSTATION-07 is making connections to 91.92.251.103 every four minutes. Forty-eight connections in three hours. Each one is small and almost exactly the same size.',
          'No user is logged in. The machine should be idle.',
          'The disk forensics report, completed yesterday, found nothing.',
        ],
        drivingQuestion:
          'The disk is clean and the machine is clearly talking to something. Where is the code?',
        provenance: 'source',
        sources: [{ file: FILE, section: '7. Scenario Walkthrough: Beacon Detection to Full Compromise Reconstruction' }],
      },

      {
        kind: 'objectives',
        id: 'objectives',
        title: 'What you will be able to do',
        minutes: 3,
        provenance: 'supplementary',
        objectives: [
          { verb: 'Triage', text: 'a packet capture by conversation volume and timing before packet inspection' },
          { verb: 'Identify', text: 'beaconing from timing regularity, including under jitter' },
          { verb: 'Detect', text: 'DGA and DNS tunnelling from query patterns' },
          { verb: 'Distinguish', text: 'exfiltration from legitimate transfer using baselines' },
          { verb: 'Run', text: 'the core Volatility workflow and interpret its output' },
          { verb: 'Explain', text: 'why executable-and-writable memory containing a PE header is near-certain injection' },
        ],
      },

      {
        kind: 'concept',
        id: 'pcap',
        title: 'PCAP triage: volume first, timing second, packets last',
        minutes: 6,
        lead:
          'A packet capture records every byte. That is exactly why you do not start by reading packets.',
        points: [
          'Statistics → Conversations, sorted by bytes. The highest-volume external conversations appear immediately.',
          'Statistics → IO Graph. Regular, evenly spaced peaks that continue outside working hours are a beacon signature.',
          'Only then filter: ip.addr for a specific host, http.request.method == POST for uploads, dns for resolution.',
          'Follow TCP Stream reassembles one conversation in full, when you already know which one matters.',
          'A workstation sending 800 MB outbound to an unknown destination at 03:00 needs no packet-level analysis to be a finding.',
        ],
        callout: {
          tone: 'note',
          text: 'Encrypted traffic still reveals metadata: who is talking to whom, how often, how much, and for how long. That metadata alone confirms C2, lateral movement and exfiltration without decrypting anything.',
        },
        redView:
          'A capture contains the full payload of anything unencrypted — credentials, file contents, tokens. This is why HTTPS is the minimum for any sensitive communication, including the attacker\'s own.',
        blueView:
          'The Conversations view is the fastest first look available. Sorting by bytes puts the anomaly at the top of the screen in about two seconds, before any filter is written.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.1 PCAP Analysis Fundamentals' }],
      },

      {
        kind: 'interaction',
        id: 'beacon',
        title: 'Instructor demonstration: the shape of a beacon',
        minutes: 14,
        component: 'beacon-analyzer',
        lead:
          'Adjust the jitter and compare the connection timing against real user traffic. Watch what survives the randomisation and what does not.',
        teaches:
          'That beaconing is detected by statistical regularity rather than by any single connection, and that jitter raises the detection threshold without removing the signal — because no human activity clusters around a central interval the way a timer does.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.2 C2 Beaconing Pattern Detection' }],
        detail: [
          'The point to land: regularity itself is the signature. A user generates irregular bursts with long gaps. A timer generates a distribution clustered around a mean. Even at ±30% jitter the clustering is visible to a statistical test, where an exact-interval rule would already have failed.',
          'Jitter has an operational cost to the attacker as well. Widening it enough to defeat statistical detection means the implant\'s responsiveness becomes unpredictable, which degrades interactive use of the channel.',
        ],
        data: {
          intervalSeconds: 240,
          jitterPresets: [
            { label: 'None (0%)', jitter: 0, note: 'Metronomic. Trivially detectable by an exact-interval rule.' },
            { label: 'Low (10%)', jitter: 0.1, note: 'Defeats exact-interval matching. Statistical clustering remains obvious.' },
            { label: 'Typical (25%)', jitter: 0.25, note: 'Common C2 framework default. Still clusters clearly around the mean.' },
            { label: 'Aggressive (50%)', jitter: 0.5, note: 'Noticeably irregular — and still nothing like user traffic, which has no central tendency at all.' },
          ],
          comparison: {
            label: 'Real user traffic, same host, same duration',
            note: 'Irregular bursts, long idle gaps, highly variable payload sizes, dozens of distinct destinations.',
          },
          metrics: [
            { label: 'Destinations contacted', beacon: '1', user: '60+' },
            { label: 'Payload size variance', beacon: 'Very low — 180 bytes ±5', user: 'Very high — 200 bytes to 4 MB' },
            { label: 'Activity outside working hours', beacon: 'Unchanged', user: 'Drops to near zero' },
            { label: 'Interval standard deviation', beacon: 'Small relative to the mean', user: 'Larger than the mean' },
          ],
          ports: [
            { port: '443', use: 'HTTPS. Most common; blends with legitimate traffic.', note: 'Needs certificate or JA3 fingerprint analysis to go further.' },
            { port: '80', use: 'HTTP. Payload visible in the capture.', note: 'Plaintext C2 or stripped TLS.' },
            { port: '53', use: 'DNS tunnelling.', note: 'Unusually long subdomains; very high query volume to one domain.' },
            { port: '4444', use: 'Metasploit default.', note: 'An obvious flag. Alert immediately.' },
            { port: '8080 / 8443', use: 'Alternate web ports.', note: 'Less likely to be deeply inspected than 443.' },
            { port: 'ICMP', use: 'Ping-based C2.', note: 'Unusually large or patterned payloads.' },
          ],
        },
      },

      {
        kind: 'concept',
        id: 'dns',
        title: 'DNS: the cheapest high-value telemetry there is',
        minutes: 6,
        lead:
          'Every connection begins with a resolution. Logging every DNS query gives you a complete record of what every device tried to reach.',
        points: [
          'DGA — hundreds of NXDOMAIN responses to random-looking names, then one that resolves. No human produces that pattern.',
          'DNS tunnelling — data encoded in subdomains. Very long labels, very high query volume to one domain, larger-than-normal packets, TXT or NULL record types.',
          'Fast flux — one domain rotating its addresses every few seconds, with a very low TTL. Defeats address-based blocking.',
          'Detection thresholds that work: more than ten NXDOMAIN responses in sixty seconds from one host; DNS packets over 200 bytes; subdomain strings over fifty characters.',
          'In the opening scenario, the DGA ran six hours before the beacon started. DNS logging would have given six hours of warning.',
        ],
        redView:
          'Firewalls almost always permit outbound port 53, and DNS volume is naturally high, which makes it good cover. The detection risks are packet size and query volume per domain, which is why careful tunnels limit their data rate.',
        blueView:
          'DNS logging is low cost, low overhead and available everywhere, and organisations routinely do not collect it. Two rules — NXDOMAIN volume per host, and subdomain length — cover the main DNS attack techniques with few false alarms.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.3 DNS Anomaly Detection' }],
      },

      {
        kind: 'concept',
        id: 'exfil',
        title: 'Exfiltration, and why the destination rarely helps',
        minutes: 5,
        lead:
          'Once data has left, network evidence is often the only record of what went. The difficulty is that the best exfiltration destinations are ones you have already allowed.',
        points: [
          'HTTP/HTTPS POST — large uploads to an unknown destination, or to a bare address with no domain. Unusual Content-Type such as application/octet-stream.',
          'DNS tunnelling — slow, and it passes through controls that block everything else.',
          'Cloud storage abuse — OneDrive, Dropbox, Google Drive, Mega. The destination is on your allowlist, so only volume distinguishes it.',
          'Volume baselines are the only reliable detection for cloud abuse. Normal users upload kilobytes; an exfiltration event moves gigabytes.',
          'Correlate three sources: outbound volume from the network, tool attribution from SRUM, and staging evidence from the disk.',
        ],
        callout: {
          tone: 'rule',
          text: 'Session 6 gave you SRUM, which attributes transferred bytes to an application. The network layer gives you volume and destination. Neither alone names both the tool and the destination; together they do.',
        },
        provenance: 'source',
        sources: [{ file: FILE, section: '4.5 Data Exfiltration Patterns' }],
      },

      {
        kind: 'query',
        id: 'volatility',
        title: 'The Volatility workflow',
        minutes: 10,
        language: 'bash',
        assumes:
          'Volatility with a memory image and a matching profile for the captured operating system version. Profiles must be prepared in advance for every OS build in your environment — this is a preparation task, not an incident task.',
        lead:
          'Six commands answer most memory forensics questions. Run them in this order; each narrows what the next one has to look at.',
        code: `# 1. Identify the image — OS version and architecture
volatility -f memory.dmp imageinfo

# 2. Process list, then the tree with parent-child relationships
volatility -f memory.dmp --profile=Win10x64 pslist
volatility -f memory.dmp --profile=Win10x64 pstree

# 3. Network connections visible to the OS at capture time
volatility -f memory.dmp --profile=Win10x64 netscan

# 4. Injected code: executable memory not backed by a file on disk
volatility -f memory.dmp --profile=Win10x64 malfind

# 5. Command lines for every process
volatility -f memory.dmp --profile=Win10x64 cmdline

# 6. Extract a specific process for deeper analysis
volatility -f memory.dmp --profile=Win10x64 memdump -p 2344 -D /output/
strings /output/2344.dmp | grep -E "http|https|\\.exe|powershell"`,
        walkthrough: [
          { part: 'imageinfo', explains: 'Determines the profile. Everything after this depends on getting it right; a wrong profile produces plausible nonsense rather than an error.' },
          { part: 'pslist / pstree', explains: 'pslist enumerates processes; pstree shows parentage. The parent-child reasoning from Session 2 applies here identically.' },
          { part: 'netscan', explains: 'Connections as the OS saw them at capture, including recently closed ones. Attributes a connection to a process, which firewall logs cannot do.' },
          { part: 'malfind', explains: 'Scans for memory regions that are executable but not backed by a file. This is the signature of code written into a process rather than loaded from disk.' },
          { part: 'cmdline', explains: 'Arguments for each process. Encoded commands and script paths surface here even when the parent chain looks ordinary.' },
          { part: 'memdump + strings', explains: 'Extracts a process and searches its memory for addresses, domains and commands. The last resort, and often the most productive one.' },
        ],
        expected:
          'On a clean image, malfind returns little and what it returns is explicable — some legitimate software uses just-in-time compilation, which produces writable executable memory. On a compromised image, malfind plus netscan together name the process, the injected region and the destination it is talking to.',
        limitations: [
          'Requires a matching profile. Without one for the exact OS build, output is unreliable.',
          'Memory shows the moment of capture only. Activity before it is not there.',
          'Some legitimate software — .NET, Java, browsers with JIT compilation — produces writable executable memory. The MZ header is what distinguishes injected binaries from JIT output.',
          'A sufficiently sophisticated implant can separate the write and execute phases so that the combined permission never appears at capture time.',
          'malfind confirms injection, not communication. netscan confirms communication, not malice. The finding requires both.',
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '4.6 Memory Artifacts & Volatility' }],
      },

      {
        kind: 'evidence',
        id: 'malfind',
        title: 'Instructor demonstration: reading malfind output',
        minutes: 8,
        synthetic: true,
        lead: 'This is what injected code looks like. Select each line.',
        caption: 'Synthetic Volatility malfind and netscan output',
        source: 'Fabricated for teaching. Output format follows Volatility conventions.',
        lines: [
          {
            text: 'Process: explorer.exe   Pid: 2344   Address: 0x7ff000200000',
            note: {
              kind: 'observation',
              label: 'A trusted process, and that is the point',
              body: 'explorer.exe is the Windows shell. It always runs, it is never stopped, it has broad network permissions and security software trusts it. Those four properties are exactly why it is a preferred injection target, along with svchost.exe — of which many instances run at once, so one more is hard to notice.',
            },
          },
          {
            text: 'Vad Tag: VadS   Protection: PAGE_EXECUTE_READWRITE',
            note: {
              kind: 'hypothesis',
              label: 'Writable and executable at the same time',
              body: 'Legitimate code is normally one or the other. It is written once by the loader and then executed from read-only memory. Code that must be written into a process and then run from that same region needs both permissions simultaneously — which is the structural signature of injection, not a quirk.',
            },
          },
          {
            text: '0x7ff000200000  4d 5a 90 00 03 00 00 00  MZ......',
            note: {
              kind: 'confirmed',
              label: 'MZ — a complete executable, in memory, with no file',
              body: '4d 5a is the magic number marking the start of a Windows PE executable. A full binary is present in writable executable memory inside explorer.exe, and no corresponding file exists on disk. Combined with the permission above, this is a near-certain injection indicator — there is no innocent reason for a process with no need to load an additional binary to contain one this way.',
            },
          },
          {
            text: '[netscan]  TCPv4  10.0.0.22:51204 → 91.92.251.103:443  ESTABLISHED  explorer.exe  2344',
            note: {
              kind: 'confirmed',
              label: 'The second source — and the reason the finding holds',
              body: 'The same PID as the injection, with an established connection to the beacon destination. malfind alone proves injection but not communication. netscan alone proves a connection but not malice. Together they prove that injected code in a named process is talking to a specific external address. Neither is sufficient; the pair is decisive.',
            },
          },
          {
            text: '[cmdline]  powershell.exe  pid 4102  parent 2344  -nop -w hidden -enc SQBFAFgA...',
            note: {
              kind: 'confirmed',
              label: 'And the injected code acted',
              body: 'A PowerShell process whose parent is the injected explorer.exe, with no profile loaded, window hidden, command encoded. This is the injected beacon executing a task. The parent-child reasoning from Session 2 works identically in memory.',
            },
          },
          {
            text: '[pstree]  explorer.exe(2344)  →  powershell.exe(4102)  →  cmd.exe(4188)',
            note: {
              kind: 'confirmed',
              label: 'Corroboration from a third plugin',
              body: 'The process tree independently shows the same parentage that cmdline reported. Three plugins — malfind, netscan, cmdline — plus pstree now agree. This is a finding you can defend.',
            },
          },
        ],
        proves: [
          'A PE binary is present in writable executable memory inside explorer.exe (PID 2344), with no corresponding file on disk',
          'That process holds an established connection to 91.92.251.103:443',
          'The injected code spawned PowerShell with an encoded command and a hidden window',
        ],
        doesNotProve: [
          'How the injection occurred — the initial access vector is a disk and log question, not a memory one',
          'What the encoded command does, until it is decoded',
          'What data left the machine. Memory shows the connection, not the payload history.',
          'That this is the only injected process in the image',
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '4.7 Process Injection Detection' }],
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
            stem: 'Disk forensics on a compromised host reports nothing suspicious. What does that tell you?',
            options: [
              {
                text: 'Nothing conclusive — fileless malware runs in memory and leaves no file for disk analysis to find',
                correct: true,
                feedback:
                  'Correct. A clean disk report on a machine that is demonstrably beaconing is itself a finding: it points at memory. This is exactly the opening scenario.',
              },
              {
                text: 'The host is clean and the alert was a false positive',
                correct: false,
                feedback:
                  'Disk analysis has a specific blind spot and this is it. Fileless technique exists precisely to produce this result.',
              },
              {
                text: 'The attacker deleted everything successfully',
                correct: false,
                feedback:
                  'Possible, and Session 6 showed that deletion usually leaves traces in Prefetch and the registry. A genuinely clean disk points more strongly at memory than at thorough deletion.',
              },
              {
                text: 'The disk image was corrupted',
                correct: false,
                feedback: 'A hash verification would have caught that. It is a separate question.',
              },
            ],
          },
          {
            id: 'q2',
            stem: 'An implant uses 25% jitter on a five-minute beacon. Does that defeat detection?',
            options: [
              {
                text: 'It defeats exact-interval matching, and the timing still clusters around a mean in a way user traffic never does',
                correct: true,
                feedback:
                  'Correct. The detection moves from matching an interval to measuring a distribution. Human traffic has no central tendency; a timer does, whatever noise is added.',
              },
              {
                text: 'Yes — randomised intervals cannot be distinguished from normal traffic',
                correct: false,
                feedback:
                  'Jittered intervals are randomised around a value. Normal traffic is not randomised around anything, which is the whole difference.',
              },
              {
                text: 'No — jitter has no effect on any detection method',
                correct: false,
                feedback:
                  'It genuinely defeats naive exact-interval rules, which is why it exists. It raises the bar; it does not clear it.',
              },
              {
                text: 'Only if the beacon also varies its packet size',
                correct: false,
                feedback:
                  'Size variance is a second signal worth watching, and the timing distribution remains detectable independently of it.',
              },
            ],
          },
          {
            id: 'q3',
            stem: 'malfind reports PAGE_EXECUTE_READWRITE memory with an MZ header in svchost.exe. What do you do next?',
            options: [
              {
                text: 'Run netscan to establish whether that PID holds a network connection',
                correct: true,
                feedback:
                  'Correct. malfind establishes injection; netscan establishes communication. The two-source finding is what justifies immediate escalation, and either alone is incomplete.',
              },
              {
                text: 'Escalate immediately — injection is confirmed',
                correct: false,
                feedback:
                  'Defensible under time pressure, and netscan takes seconds and transforms the finding from "injected code present" to "injected code communicating with this address", which is what IR needs to act.',
              },
              {
                text: 'Check the disk for the corresponding file',
                correct: false,
                feedback:
                  'There will not be one. Memory not backed by a file is the definition of what malfind found.',
              },
              {
                text: 'Dismiss it — svchost.exe is a legitimate Windows process',
                correct: false,
                feedback:
                  'That is why it was chosen. Many instances run at once, making one more injected instance harder to notice.',
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
          'Capture memory before EDR isolation, without exception. Isolation can kill the process you were capturing.',
          'DNS logs are the highest-value early warning available and are routinely not collected.',
          'Beaconing is detected by statistical regularity, not by any single connection.',
          'PAGE_EXECUTE_READWRITE plus an MZ header, confirmed by netscan, is the strongest memory evidence of active compromise.',
          'Disk, network and memory each close gaps the others leave. An investigation missing one has holes an attacker operates in.',
        ],
        furtherStudy: [
          { label: 'Volatility Foundation documentation', note: 'The authoritative plugin reference and profile guidance.', href: 'https://volatilityfoundation.org/' },
          { label: 'Wireshark User Guide — Statistics', note: 'Conversations and IO Graph, which are the two views this session relies on.', href: 'https://www.wireshark.org/docs/wsug_html_chunked/ChStatistics.html' },
          { label: 'Malware Traffic Analysis', note: 'Freely published capture exercises with answers. The best way to build PCAP fluency.', href: 'https://www.malware-traffic-analysis.net/' },
        ],
      },
    ],
  },

  practical: {
    minutes: 90,
    title: 'Workshop: Three layers, one compromise',
    blocks: [
      {
        kind: 'brief',
        id: 'brief',
        title: 'Briefing',
        minutes: 10,
        synthetic: true,
        resourceDir: 'network-memory-forensics',
        scenario:
          'WORKSTATION-07 from the opening scenario. You have the DNS log for the previous twelve hours, a summarised packet capture for three hours, and parsed Volatility output from a memory image taken before isolation. Disk forensics found nothing.',
        objectives: [
          'Establish the beacon interval and the destination, with evidence',
          'Find the DGA activity that preceded the beacon and state how much earlier it was detectable',
          'Confirm exfiltration: when, how much, and to where',
          'Locate the injected code in memory and attribute the connection to a process',
          'Identify lateral movement from internal traffic patterns',
          'Produce a finding naming every detection opportunity that was missed, in order',
        ],
        requires: [
          { item: 'The three-layer pack (downloadable)', note: 'DNS query log, PCAP conversation and timing summaries with a POST request extract, and parsed Volatility output.', file: '00-three-layer-pack.md' },
          { item: 'The multi-layer timeline template (downloadable)', note: 'Lanes for network, memory and endpoint.', file: '01-timeline-template.md' },
          { item: 'A spreadsheet or calculator', note: 'For the interval statistics in task 1. Mean and standard deviation are enough.' },
          { item: 'A text editor', note: 'For findings and the timeline.' },
        ],
        setup: [
          'Download the three-layer pack and the timeline template.',
          'Create a working folder named three-layer-<your-name>.',
          'Open the DNS log first. It covers the longest window and the earliest activity is in it.',
          'Note that the PCAP is provided as conversation and timing summaries rather than a raw capture — the brief explains what that changes.',
        ],
        realism:
          'You are given exported summaries rather than a raw .pcap, because opening a real capture in Wireshark is a tooling exercise and this workshop is about inference across layers. The summaries contain exactly what Statistics → Conversations and the IO Graph would show you, and the pack says so per section. If you want the raw-capture practice, the Malware Traffic Analysis link in the recap has dozens of real exercises with published answers.',
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Network Forensic Investigation Workflow' }],
      },

      {
        kind: 'tasks',
        id: 'tasks',
        title: 'Your tasks',
        minutes: 55,
        lead: 'Work the layers in the order given. Each one constrains where to look in the next.',
        tasks: [
          {
            ref: 'T1',
            minutes: 12,
            title: 'Network: establish the beacon',
            steps: [
              'From the conversation summary, identify the highest-volume and highest-count external destinations.',
              'For the suspected C2, calculate the mean interval between connections and the standard deviation.',
              'Compare the payload size variance against the user-traffic baseline included in the pack.',
              'State what the jitter percentage appears to be, and show your working.',
            ],
            produces: 'The beacon destination, interval, jitter estimate and the statistics supporting it.',
          },
          {
            ref: 'T2',
            minutes: 10,
            title: 'DNS: find the earlier warning',
            steps: [
              'Count NXDOMAIN responses per hour per host.',
              'Identify the window containing the DGA activity.',
              'Find the query that successfully resolved, and confirm it resolves to the beacon destination.',
              'Calculate how many hours earlier a DNS-based alert would have fired. Write the number down — it is the most important figure in your report.',
            ],
            produces: 'The DGA window, the resolving domain, and the detection lead time in hours.',
          },
          {
            ref: 'T3',
            minutes: 12,
            title: 'Memory: find the code',
            steps: [
              'From the malfind output, identify every process with executable and writable memory.',
              'Note which of those contain an MZ header, and which may be explicable as JIT compilation.',
              'Cross-reference against netscan to find which injected process holds a connection.',
              'Read cmdline for the injected PID and its children, and decode any encoded command.',
            ],
            produces: 'The injected process, its connection, and the decoded command it executed.',
          },
          {
            ref: 'T4',
            minutes: 12,
            title: 'Exfiltration and lateral movement',
            steps: [
              'Find the largest outbound transfer in the conversation summary. Record size, time, destination and Content-Type.',
              'Determine whether it went to the same destination as the beacon.',
              'Filter the internal traffic for SMB and RDP between internal hosts.',
              'Record which internal machines were contacted and when, relative to the exfiltration.',
            ],
            produces: 'The exfiltration finding and a list of internal hosts contacted with timings.',
          },
          {
            ref: 'T5',
            minutes: 9,
            title: 'Assemble and report',
            steps: [
              'Build one timeline with network, memory and endpoint lanes.',
              'Mark every point where a detection opportunity existed and no alert fired.',
              'Order the missed detections by how much earlier each would have fired.',
              'Write one finding in the standard format, with the missed detection list in the remediation section.',
            ],
            produces: 'A three-lane timeline and one finding with an ordered list of missed detections.',
          },
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Network Forensic Investigation Workflow' }],
      },

      {
        kind: 'hints',
        id: 'hints',
        title: 'Progressive hints',
        hints: [
          {
            forTask: 'T1',
            tiers: [
              'Sort conversations by connection count as well as by bytes. A beacon is many small connections, so it may not top a byte-sorted list.',
              'Jitter estimate: standard deviation divided by mean, expressed as a percentage.',
              'Compare against the user baseline in the pack. The number that separates them most clearly is the standard deviation relative to the mean.',
            ],
          },
          {
            forTask: 'T2',
            tiers: [
              'NXDOMAIN is response code 3. Group by source host and by hour.',
              'The DGA window is the hour with an anomalous NXDOMAIN count. It will be obvious once grouped.',
              'The resolving domain is the one query in that window that returned an A record. Check its address against your T1 answer.',
            ],
          },
          {
            forTask: 'T3',
            tiers: [
              'Not every malfind hit is injection. Look for the MZ header — 4d 5a — to separate injected binaries from JIT compilation output.',
              'Match PIDs between malfind and netscan. The overlap is your answer.',
              'Decode the command with CyberChef. It will name what the beacon was instructed to do.',
            ],
          },
          {
            forTask: 'T4',
            tiers: [
              'The exfiltration is a single large POST. Filter by method and sort by content length.',
              'Lateral movement is internal-to-internal traffic on port 445 or 3389. Workstation to workstation is the suspicious shape.',
              'Check the timing relationship: did lateral movement precede the exfiltration? That ordering tells you where the data was collected from.',
            ],
          },
          {
            forTask: 'T5',
            tiers: [
              'There are at least three missed detection opportunities across the layers.',
              'Order them by lead time — the DGA is the earliest and by a wide margin.',
              'In remediation, give each missed detection a specific rule: a data source, a condition and a threshold. "Monitor DNS" is not actionable; "alert on >10 NXDOMAIN responses in 60 seconds from a single host" is.',
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
          { ref: 'D1', text: 'Beacon analysis with interval, jitter estimate and supporting statistics', required: true },
          { ref: 'D2', text: 'DGA finding with the resolving domain and the detection lead time in hours', required: true },
          { ref: 'D3', text: 'Memory findings: injected process, connection attribution, decoded command', required: true },
          { ref: 'D4', text: 'Exfiltration finding with volume, timing, destination and Content-Type', required: true },
          { ref: 'D5', text: 'Three-lane timeline across network, memory and endpoint', required: true },
          { ref: 'D6', text: 'One finding in the standard format, with missed detections ordered by lead time', required: true },
        ],
        structure: `three-layer-<your-name>/
  00-beacon.md       → T1: interval statistics and the destination
  01-dns.md          → T2: the DGA window and the lead time
  02-memory.md       → T3: injection, attribution, decoded command
  03-exfil-lateral.md → T4: what left, and where it went internally first
  04-timeline.md     → T5: three lanes, one sequence
  05-finding.md      → T5: the formal finding and the missed detections`,
        provenance: 'source',
        sources: [{ file: FILE, section: '6. Reporting Mindset' }],
      },

      {
        kind: 'assessment',
        id: 'assessment',
        title: 'How this is assessed',
        criteria: [
          {
            band: 'Cross-layer synthesis',
            weight: '30%',
            descriptor:
              'Findings from network, memory and endpoint are connected into one account. The memory finding is attributed to the network destination; the DNS finding is connected to the beacon.',
          },
          {
            band: 'Statistical reasoning',
            weight: '20%',
            descriptor:
              'Beacon detection is argued from interval statistics rather than asserted. The jitter estimate is supported by working.',
          },
          {
            band: 'Memory interpretation',
            weight: '20%',
            descriptor:
              'Injection identified correctly. JIT-explicable regions distinguished from genuine injection by the MZ header. Attribution confirmed by a second plugin.',
          },
          {
            band: 'Missed detection analysis',
            weight: '20%',
            descriptor:
              'Opportunities identified and ordered by lead time. Each remediation names a data source, a condition and a threshold.',
          },
          {
            band: 'Evidence discipline',
            weight: '10%',
            descriptor: 'Confidence labels applied correctly. Two independent sources required before any finding is marked confirmed.',
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
          'What lead time did the DNS evidence give? Compare numbers across the room — anyone who found the DGA window should have the same figure.',
          'Did anyone mark a JIT-compiled region as injection? What distinguishes the two?',
          'Which layer gave you the most, and which would you have given up?',
          'The disk forensics found nothing. Was the disk analysis wrong, or was it answering a different question?',
          'How many missed detections did the room find? Which one would you build first, and why that one?',
          'If the memory capture had been taken after isolation instead of before, which of your findings disappears?',
        ],
        landingPoint:
          'Each forensic layer has a blind spot the others cover: disk misses what never touched it, network misses what the code was, memory misses everything before the capture — and an investigation that uses one layer reports confidently on a third of the event.',
        provenance: 'supplementary',
      },

      {
        kind: 'recap',
        id: 'recap',
        title: 'Recap and further study',
        provenance: 'source',
        sources: [{ file: FILE, section: '13. Summary' }],
        takeaways: [
          'Network evidence cannot be deleted from inside the compromised host.',
          'PCAP triage: conversations for volume, IO Graph for timing, packets last.',
          'Beaconing is timing regularity, small consistent payloads, one destination, unchanged outside hours.',
          'DGA is hundreds of NXDOMAIN responses then one resolution — detectable from DNS logs alone.',
          'Volatility: pstree, netscan, malfind, cmdline, memdump.',
          'PAGE_EXECUTE_READWRITE plus MZ plus a netscan connection is the strongest memory finding available.',
        ],
        furtherStudy: [
          { label: 'Volatility Foundation', note: 'Plugin reference and profile documentation.', href: 'https://volatilityfoundation.org/' },
          { label: 'Malware Traffic Analysis', note: 'Real capture exercises with published answers. The fastest route to PCAP fluency.', href: 'https://www.malware-traffic-analysis.net/' },
          { label: 'Next: Session 8 — Malware Analysis', note: 'You found the beacon and the injected code. Next: the file that started it, and what it actually does.' },
        ],
      },
    ],
  },

  terms: [
    { term: 'PCAP', definition: 'A packet capture file recording raw network traffic at a point on the network.' },
    { term: 'Beaconing', definition: 'Regular timed outbound connections from an implant to its C2 server. Detected by timing regularity.' },
    { term: 'Jitter', definition: 'Random variation added to beacon intervals to defeat exact-interval detection. Raises the threshold; does not remove the signal.' },
    { term: 'DGA', definition: 'Domain Generation Algorithm. Malware generates many candidate domains and queries each until one resolves.' },
    { term: 'NXDOMAIN', definition: 'A DNS response meaning the domain does not exist. High volume from one host is the DGA signature.' },
    { term: 'malfind', definition: 'The Volatility plugin that scans for executable memory not backed by a file on disk — the injection signature.' },
    { term: 'PAGE_EXECUTE_READWRITE', definition: 'Memory that is both writable and executable. Legitimate code is normally one or the other.' },
    { term: 'MZ header', definition: 'The two bytes 4d 5a marking the start of a Windows PE executable. In unbacked memory, it means an injected binary.' },
  ],
}
