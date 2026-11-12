import type { Session } from '@/types/content'

const FILE = 'defensive_day_7_network_memory_forensics_esl.md'

export const session07: Session = {
  number: 7,
  slug: 'network-memory-forensics',
  title: 'Network and Memory Forensics',
  summary:
    'Off-host communication records and volatile memory reveal evidence that disk analysis can miss.',
  abstract:
    'Disk forensics tells you the history. Network evidence tells you what the machine communicated with, when independently collected and protected. Memory tells you what was actually running at the moment of capture, including code that never wrote a file. This session covers PCAP triage, beaconing detection through timing statistics, DNS anomalies, exfiltration patterns, and the Volatility workflow for finding injected code. The practical reconstructs a compromise across all three layers.',
  track: 'core',
  themes: ['Beaconing', 'DNS', 'Injection'],
  prerequisites: [
    'Session 5 — balancing volatile evidence collection with urgent containment',
    'Session 6 — host artefacts, so you can see what network and memory add to them',
    'Basic networking: what a port is, what DNS resolution does, what TCP and UDP are',
  ],
  outcomes: [
    'Triage a packet capture using conversation volume and traffic timing before any packet-level inspection',
    'Identify command-and-control beaconing from timing regularity, including when jitter is applied',
    'Detect domain generation algorithms and DNS tunnelling from query patterns alone',
    'Distinguish exfiltration from legitimate transfer using volume baselines and destination context',
    'Run the core Volatility workflow and interpret its output',
    'Assess writable executable memory, executable headers and process context as possible injection evidence',
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
          'An attacker can erase malware from a disk. Independently protected network logs may preserve communication records that remain after host cleanup.',
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
          'Why can collecting memory before isolation help, and when might containment take priority?',
          'In Session 6, what single artefact linked the Linux host to the Windows workstation?',
          'What did the cron entry */5 * * * * tell you, and what would you expect to see from the network side?',
          'Name two things that exist only in RAM.',
        ],
        answers: [
          'Isolation may change connections or trigger process termination, so volatile evidence can be lost. Balance collection against ongoing harm and follow the incident plan.',
          'known_hosts — the SSH file listing machines connected to from that host.',
          'A five-minute schedule. It could be malicious or legitimate automation; compare the job and its network activity with the baseline.',
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
          'WORKSTATION-07 is making connections to 91.92.251.103 every four minutes. Forty-eight connections in the selected window. Each one is small and almost exactly the same size.',
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
          { verb: 'Explain', text: 'how to evaluate writable executable memory and executable headers in process context' },
        ],
      },

      {
        kind: 'concept',
        id: 'pcap',
        title: 'PCAP triage: volume first, timing second, packets last',
        minutes: 8,
        lead:
          'A packet capture records traffic visible at its capture point, subject to collection and truncation settings. That is exactly why you do not start by reading packets.',
        points: [
          'Statistics → Conversations, sorted by bytes. The highest-volume external conversations appear immediately.',
          'Statistics → IO Graph. Regular peaks continuing outside working hours suggest automation; compare them with legitimate services.',
          'Only then filter: ip.addr for a specific host, http.request.method == POST for uploads, dns for resolution.',
          'Follow TCP Stream reassembles one conversation in full, when you already know which one matters.',
          'A workstation sending 800 MB outbound to an unknown destination at 03:00 warrants investigation; volume alone does not prove data theft.',
        ],
        callout: {
          tone: 'note',
          text: 'Encrypted traffic still reveals metadata: who is talking to whom, how often, how much, and for how long. Metadata can support hypotheses about C2, movement or transfer, but does not alone establish malicious purpose.',
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
        minutes: 18,
        component: 'beacon-analyzer',
        lead:
          'Adjust the jitter and compare the connection timing against real user traffic. Watch what survives the randomisation and what does not.',
        teaches:
          'That beaconing is detected by statistical regularity rather than by any single connection, and that jitter raises the detection threshold without removing the signal — and that benign scheduled software can produce similar regularity.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.2 C2 Beaconing Pattern Detection' }],
        detail: [
          'The point to land: regularity itself is the signature. In this teaching comparison, user activity is bursty while the timer clusters around a mean. Real benign automation can also be regular. Even at ±30% jitter the clustering is visible to a statistical test, where an exact-interval rule may fail. Benign scheduled traffic can also cluster.',
          'Jitter changes interval distributions and can reduce the reliability of timing-only detection. Compare the resulting pattern with benign automation and other telemetry.',
        ],
        data: {
          intervalSeconds: 240,
          jitterPresets: [
            { label: 'None (0%)', jitter: 0, note: 'Metronomic. Trivially detectable by an exact-interval rule.' },
            { label: 'Low (10%)', jitter: 0.1, note: 'Defeats exact-interval matching. Statistical clustering remains obvious.' },
            { label: 'Typical (25%)', jitter: 0.25, note: 'Common C2 framework default. Still clusters clearly around the mean.' },
            { label: 'Aggressive (50%)', jitter: 0.5, note: 'Less regular; compare the distribution and other signals with the baseline.' },
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
        minutes: 8,
        lead:
          'Many connections depend on DNS. Collected query logs show observed resolution activity; cached answers, literal addresses and encrypted DNS can leave gaps.',
        points: [
          'DGA — hundreds of NXDOMAIN responses to random-looking names, then one that resolves. Benign automation can also produce failures; investigate the context.',
          'DNS tunnelling — data encoded in subdomains. Very long labels, very high query volume to one domain, larger-than-normal packets, TXT or NULL record types.',
          'Fast flux — one domain rotating its addresses every few seconds, with a very low TTL. Can reduce the durability of address-based blocking.',
          'Illustrative starting thresholds to test against the local baseline: more than ten NXDOMAIN responses in sixty seconds from one host; DNS packets over 200 bytes; subdomain strings over fifty characters.',
          'In the opening scenario, the DGA ran six hours before the beacon started. DNS logging would have given six hours of warning.',
        ],
        redView:
          'Firewalls almost always permit outbound port 53, and DNS volume is naturally high, which makes it good cover. The detection risks are packet size and query volume per domain, which is why careful tunnels limit their data rate.',
        blueView:
          'DNS logging is low cost, low overhead and available everywhere, and organisations routinely do not collect it. Two rules — NXDOMAIN volume per host, and subdomain length — provide useful starting points, with tuning and validation required.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.3 DNS Anomaly Detection' }],
      },

      {
        kind: 'concept',
        id: 'exfil',
        title: 'Exfiltration, and why the destination rarely helps',
        minutes: 7,
        lead:
          'Once data has left, network evidence is often the only record of what went. The difficulty is that the best exfiltration destinations are ones you have already allowed.',
        points: [
          'HTTP/HTTPS POST — large uploads to an unknown destination, or to a bare address with no domain. Unusual Content-Type such as application/octet-stream.',
          'DNS tunnelling — slow, and it passes through controls that block everything else.',
          'Cloud storage abuse — OneDrive, Dropbox, Google Drive, Mega. An allowed destination still requires volume, identity, process and activity context.',
          'Volume baselines help detect cloud abuse, but legitimate uploads can be large and theft can be slow. Correlate identity, application, timing and data access.',
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
        minutes: 14,
        language: 'bash',
        assumes:
          'The commands below illustrate legacy Volatility 2 profile syntax; profile names are examples, not a runnable setup for this output-only workshop. Volatility 3 uses symbol tables and different plugin names. Verify the installed version, supported image and required symbols before an incident.',
        lead:
          'This example orders common memory questions. Adapt the commands to the installed Volatility version and captured operating system.',
        code: `# Legacy Volatility 2 example; not Volatility 3 syntax.
# 1. Identify the image — OS version and architecture
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
          { part: 'malfind', explains: 'Uses memory-protection and mapping heuristics to surface suspicious regions. Validate the bytes, backing and process context; it is not a conclusive injection detector.' },
          { part: 'cmdline', explains: 'Arguments for each process. Encoded commands and script paths surface here even when the parent chain looks ordinary.' },
          { part: 'memdump + strings', explains: 'Extracts a process and searches its memory for addresses, domains and commands. A useful follow-up when extraction and deeper inspection are justified.' },
        ],
        expected:
          'On a clean image, malfind returns little and what it returns is explicable — some legitimate software uses just-in-time compilation, which produces writable executable memory. On a compromised image, malfind plus netscan together name the process, the injected region and the destination it is talking to.',
        limitations: [
          'This legacy example requires a matching profile; Volatility 3 requires suitable symbols. Validate version-specific prerequisites.',
          'Memory is a snapshot that may retain traces of earlier activity; it is not a complete historical record.',
          'Some legitimate software — .NET, Java, browsers with JIT compilation — produces writable executable memory. An MZ header is a lead to validate as a PE structure, not a universal test separating injection from legitimate activity.',
          'A sufficiently sophisticated implant can separate the write and execute phases so that the combined permission never appears at capture time.',
          'malfind surfaces suspicious regions; netscan attributes socket artefacts. Correlate both with process context and other evidence before concluding malicious injection.',
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '4.6 Memory Artifacts & Volatility' }],
      },

      {
        kind: 'evidence',
        id: 'malfind',
        title: 'Instructor demonstration: reading malfind output',
        minutes: 12,
        synthetic: true,
        lead: 'Inspect a suspicious memory region and its connection. Select each line and distinguish observations from conclusions.',
        caption: 'Synthetic Volatility malfind and netscan output',
        source: 'Fabricated for teaching. The supplied exercise also validates the PE structure and private, unbacked mapping for PID2344, and attributes the other regions to legitimate runtimes. The bytes alone are not conclusive.',
        lines: [
          {
            text: 'Process: explorer.exe   Pid: 2344   Address: 0x7ff000200000',
            note: {
              kind: 'observation',
              label: 'A trusted process, and that is the point',
              body: 'explorer.exe is the Windows shell. Its familiar name is not evidence of innocence. Inspect its path, parentage, memory regions and network activity; attackers can inject into legitimate processes.',
            },
          },
          {
            text: 'Vad Tag: VadS   Protection: PAGE_EXECUTE_READWRITE',
            note: {
              kind: 'hypothesis',
              label: 'Writable and executable at the same time',
              body: 'Memory permissions vary with loader behaviour, runtime and mapping. Writable executable memory warrants inspection, but legitimate JIT engines can use it and malicious code can change permissions between writing and execution.',
            },
          },
          {
            text: '0x7ff000200000  4d 5a 90 00 03 00 00 00  MZ......',
            note: {
              kind: 'confirmed',
              label: 'MZ — inspect the executable structure and mapping',
              body: '4d 5a marks an MZ header. Validate the PE signature and structure, determine whether the region is file-backed, and assess its purpose. The excerpt is suspicious but the two bytes alone do not prove a complete injected binary.',
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
                text: 'It can defeat exact-interval matching; assess remaining timing patterns against benign scheduled traffic',
                correct: true,
                feedback:
                  'Correct. The detection moves from matching an interval to measuring a distribution. Human traffic has no central tendency; a timer does, whatever noise is added.',
              },
              {
                text: 'Yes — randomised intervals cannot be distinguished from normal traffic',
                correct: false,
                feedback:
                  'Jittered intervals may still cluster, but benign automation can also be regular. Compare timing with the baseline and independent signals.',
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
                  'Correct. malfind surfaces a suspicious region; netscan adds connection context. The two-source finding is what justifies immediate escalation, and either alone is incomplete.',
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
                  'There will not be one. Inspect file backing as well as memory; malfind is a heuristic, not proof that no related file exists.',
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
          'Preserve volatile evidence before disruptive actions when safe and authorised; urgent containment may take priority. Document the decision.',
          'DNS logs are the highest-value early warning available and are routinely not collected.',
          'Beaconing is detected by statistical regularity, not by any single connection.',
          'Correlate suspicious executable memory, validated headers, process context and network activity; no single pattern proves injection.',
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
          'WORKSTATION-07 from the opening scenario. You have the DNS log for the previous twelve hours, selected network conversation and timing summaries, and parsed Volatility output from a memory image taken before isolation. Disk forensics found nothing.',
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
              'Report relative interval variation and explain any distribution assumption used to estimate jitter.',
            ],
            produces: 'The suspected beacon destination, interval, relative variation and supporting statistics.',
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
              'Standard deviation divided by mean gives the coefficient of variation. To estimate configured jitter, state and justify the assumed interval distribution.',
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
              'Not every malfind hit is injection. Validate headers, file backing and process context; the MZ bytes alone do not distinguish injection from benign memory.',
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
              'Beacon detection is argued from interval statistics rather than asserted. Relative variation is supported by working; any estimate of configured jitter states its distribution assumption.',
          },
          {
            band: 'Memory interpretation',
            weight: '20%',
            descriptor:
              'Injection identified correctly. JIT-explicable regions distinguished from suspicious regions using validated headers, mapping and context. Socket attribution corroborated by another plugin; malicious purpose still needs process and network context.',
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
            descriptor: 'Confidence labels applied correctly. Corroborate findings with process, mapping and independent network context; two plugins reading one image are not independent acquisitions.',
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
          'Each forensic layer has a blind spot the others cover: disk misses what never touched it, network misses what the code was, memory is an incomplete snapshot rather than a full history — and an investigation that uses one layer reports confidently on a third of the event.',
        provenance: 'supplementary',
      },

      {
        kind: 'recap',
        id: 'recap',
        title: 'Recap and further study',
        provenance: 'source',
        sources: [{ file: FILE, section: '13. Summary' }],
        takeaways: [
          'Independently collected, protected network logs can survive host cleanup; their integrity depends on logging controls.',
          'PCAP triage: conversations for volume, IO Graph for timing, packets last.',
          'Beaconing is timing regularity, small consistent payloads, one destination, unchanged outside hours.',
          'Many NXDOMAIN responses followed by a resolution can suggest a DGA; validate the source and benign explanations.',
          'Volatility: pstree, netscan, malfind, cmdline, memdump.',
          'Writable executable memory, validated headers and a related connection are leads to investigate together.',
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
    { term: 'NXDOMAIN', definition: 'A DNS response meaning the domain does not exist. High volume from one host can suggest a DGA, misconfiguration or other automation.' },
    { term: 'malfind', definition: 'The Volatility plugin that scans for executable memory not backed by a file on disk — a heuristic that requires further investigation.' },
    { term: 'PAGE_EXECUTE_READWRITE', definition: 'Memory that is both writable and executable. Legitimate code is normally one or the other.' },
    { term: 'MZ header', definition: 'The two bytes 4d 5a marking an MZ header, normally present before the PE signature. In unbacked memory it warrants validating the PE structure and process context.' },
  ],
}
