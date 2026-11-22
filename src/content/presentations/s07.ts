import type { PresentationPlan } from './types'

export const presentation07: PresentationPlan = {
  "slug": "network-memory-forensics",
  "title": "Find the Code Beyond the Disk",
  "throughline": "Connect network timing, DNS history and live memory into one defensible finding.",
  "chapters": [
    {
      "id": "three-layers",
      "title": "Three layers, three questions",
      "half": "theory",
      "outline": [
        "Recall volatile evidence",
        "Read the opening alert",
        "Choose the next layer"
      ],
      "beats": [
        {
          "id": "recall-ram",
          "sourceId": "retrieval",
          "kind": "question",
          "title": "What disappears when a process ends?",
          "points": [
            "Name two artefacts that exist only in RAM.",
            "Why might isolation change the evidence?"
          ]
        },
        {
          "id": "opening-signal",
          "sourceId": "scenario",
          "kind": "bullets",
          "title": "The disk is clean. The connections continue.",
          "points": [
            "WORKSTATION-07 makes small, repeated outbound connections.",
            "No user is logged in.",
            "Yesterday’s disk analysis found nothing."
          ]
        },
        {
          "id": "opening-question",
          "sourceId": "scenario",
          "kind": "question",
          "title": "Where would you look for the code?",
          "points": [
            "Choose network, disk or memory.",
            "Explain what your chosen layer can establish."
          ]
        },
        {
          "id": "layer-questions",
          "sourceId": "objectives",
          "kind": "compare",
          "title": "Each layer answers a different question",
          "columns": [
            {
              "label": "Disk",
              "points": [
                "What persisted?",
                "What happened before capture?"
              ]
            },
            {
              "label": "Network",
              "points": [
                "Who communicated?",
                "When and how much?"
              ]
            },
            {
              "label": "Memory",
              "points": [
                "What was running?",
                "Which process held the connection?"
              ]
            }
          ]
        },
        {
          "id": "triage-order",
          "sourceId": "pcap",
          "kind": "flow",
          "title": "Start wide, then inspect one conversation",
          "steps": [
            {
              "label": "Conversations",
              "note": "Sort by bytes and connection count"
            },
            {
              "label": "Timing",
              "note": "Look for repeated intervals"
            },
            {
              "label": "Filter",
              "note": "Narrow to the host or protocol"
            },
            {
              "label": "Stream",
              "note": "Reassemble the conversation that matters"
            }
          ]
        }
      ]
    },
    {
      "id": "beacon-shape",
      "title": "Read the shape of communication",
      "half": "theory",
      "outline": [
        "Volume and metadata",
        "Timing distributions",
        "Jitter demonstration"
      ],
      "beats": [
        {
          "id": "encrypted-metadata",
          "sourceId": "pcap",
          "kind": "bullets",
          "title": "Encryption leaves useful metadata",
          "points": [
            "Destination, timing and byte counts remain visible.",
            "Compare traffic with the host’s normal activity.",
            "A pattern guides the next investigation step."
          ]
        },
        {
          "id": "timer-or-user",
          "sourceId": "beacon",
          "kind": "compare",
          "title": "Compare timing patterns with the baseline",
          "columns": [
            {
              "label": "Beacon",
              "points": [
                "One recurring destination",
                "Similar payload sizes",
                "Activity continues outside working hours"
              ]
            },
            {
              "label": "User",
              "points": [
                "Many destinations",
                "Variable payload sizes",
                "Bursts separated by idle gaps"
              ]
            }
          ],
          "takeaway": "Benign scheduled software can also be regular; corroborate the pattern."
        },
        {
          "id": "jitter-build",
          "sourceId": "beacon",
          "kind": "flow",
          "title": "Jitter moves the intervals around a centre",
          "steps": [
            {
              "label": "Fixed interval",
              "note": "Exact spacing"
            },
            {
              "label": "Add jitter",
              "note": "Spacing varies"
            },
            {
              "label": "Measure distribution",
              "note": "Look for clustering"
            },
            {
              "label": "Compare baseline",
              "note": "Check ordinary traffic"
            }
          ]
        },
        {
          "id": "beacon-demo",
          "sourceId": "beacon",
          "kind": "activity",
          "title": "Watch what changes as jitter increases",
          "points": [
            "Predict the timing shape before adjusting the control.",
            "Compare interval spread with the mean.",
            "Check whether payload size and destination also support suspicion."
          ]
        },
        {
          "id": "beacon-check",
          "sourceId": "check",
          "kind": "question",
          "title": "Does irregular timing rule out a beacon?",
          "points": [
            "Explain why exact-interval matching can fail.",
            "Name another signal you would compare."
          ]
        }
      ]
    },
    {
      "id": "dns-and-volume",
      "title": "Find the earlier network warning",
      "half": "theory",
      "outline": [
        "DGA and tunnelling",
        "Fast flux",
        "Exfiltration context"
      ],
      "beats": [
        {
          "id": "dga-pattern",
          "sourceId": "dns",
          "kind": "flow",
          "title": "Many failed names, then one resolution",
          "steps": [
            {
              "label": "Generated names",
              "note": "Random-looking domain queries"
            },
            {
              "label": "NXDOMAIN",
              "note": "NXDOMAIN means the queried name does not exist"
            },
            {
              "label": "Resolution",
              "note": "A candidate finally resolves"
            },
            {
              "label": "Connection",
              "note": "Compare with the beacon destination"
            }
          ],
          "takeaway": "This pattern suggests a domain generation algorithm; investigate benign automation too."
        },
        {
          "id": "dns-patterns",
          "sourceId": "dns",
          "kind": "compare",
          "title": "DNS anomalies have different shapes",
          "columns": [
            {
              "label": "Tunnelling",
              "points": [
                "Long subdomains",
                "High volume to one domain",
                "Unusual record sizes or types"
              ]
            },
            {
              "label": "Fast flux",
              "points": [
                "One domain changes addresses",
                "Very short TTLs",
                "Address blocking loses durability"
              ]
            }
          ]
        },
        {
          "id": "dns-cues",
          "sourceId": "dns",
          "kind": "evidence",
          "title": "Read a small DNS excerpt",
          "lines": [
            {
              "text": "a8f2.example.invalid  NXDOMAIN",
              "note": "Synthetic failed candidate"
            },
            {
              "text": "c9d1.example.invalid  NXDOMAIN",
              "note": "Look at the pattern across queries"
            },
            {
              "text": "edge.example.invalid  A  192.0.2.24",
              "note": "Pivot to this destination’s traffic"
            }
          ]
        },
        {
          "id": "exfil-context",
          "sourceId": "exfil",
          "kind": "bullets",
          "title": "An allowed destination can still carry stolen data",
          "points": [
            "Compare outbound volume with the host’s baseline.",
            "Check timing, destination and upload method.",
            "An allowlist entry does not explain an unusual transfer."
          ]
        },
        {
          "id": "exfil-correlation",
          "sourceId": "exfil",
          "kind": "flow",
          "title": "Connect the transfer to its tool and staging",
          "steps": [
            {
              "label": "Network",
              "note": "Volume and destination"
            },
            {
              "label": "SRUM",
              "note": "Application responsible for bytes"
            },
            {
              "label": "Disk",
              "note": "Staged data and execution traces"
            },
            {
              "label": "Finding",
              "note": "State what the sources establish together"
            }
          ]
        }
      ]
    },
    {
      "id": "memory-attribution",
      "title": "Attribute the connection to running code",
      "half": "theory",
      "outline": [
        "Prepare the image",
        "Find suspicious memory",
        "Join by process ID"
      ],
      "beats": [
        {
          "id": "memory-preparation",
          "sourceId": "volatility",
          "kind": "bullets",
          "title": "The image and tool configuration must match",
          "points": [
            "Confirm the captured operating system and architecture.",
            "Use the workflow appropriate to the installed Volatility version.",
            "Memory describes the moment of capture."
          ]
        },
        {
          "id": "memory-workflow",
          "sourceId": "volatility",
          "kind": "flow",
          "title": "Narrow from processes to suspicious regions",
          "steps": [
            {
              "label": "Processes",
              "note": "List processes and parent relationships"
            },
            {
              "label": "Connections",
              "note": "Associate sockets with PIDs"
            },
            {
              "label": "Regions",
              "note": "Examine suspicious executable memory"
            },
            {
              "label": "Commands",
              "note": "Read arguments and extract for analysis"
            }
          ]
        },
        {
          "id": "memory-excerpt",
          "sourceId": "malfind",
          "kind": "evidence",
          "title": "Read permissions, bytes and ownership together",
          "lines": [
            {
              "text": "Process: explorer.exe  PID: 2344",
              "note": "Synthetic process identity"
            },
            {
              "text": "Protection: PAGE_EXECUTE_READWRITE",
              "note": "Writable and executable"
            },
            {
              "text": "4d 5a 90 00  MZ..",
              "note": "MZ header: validate the PE structure"
            },
            {
              "text": "netscan: PID 2344 -> 192.0.2.24:443",
              "note": "The same PID owns the connection"
            }
          ]
        },
        {
          "id": "memory-limits",
          "sourceId": "malfind",
          "kind": "compare",
          "title": "A suspicious region needs context",
          "columns": [
            {
              "label": "Observation",
              "points": [
                "Writable executable memory",
                "PE header in unbacked memory",
                "Connection owned by the same PID"
              ]
            },
            {
              "label": "Check next",
              "points": [
                "Check legitimate just-in-time compilation",
                "Inspect command lines",
                "Correlate with network history"
              ]
            }
          ]
        },
        {
          "id": "memory-check",
          "sourceId": "theory-recap",
          "kind": "question",
          "title": "What would isolation change here?",
          "points": [
            "Identify evidence that could disappear.",
            "Explain what network logs would still preserve."
          ],
          "takeaway": "Preserve evidence when safe; urgent containment may take priority."
        }
      ]
    },
    {
      "id": "investigation",
      "title": "Workshop: reconstruct one compromise",
      "half": "practical",
      "outline": [
        "Prepare the three-layer pack",
        "Test network and memory claims",
        "Build a joined timeline"
      ],
      "beats": [
        {
          "id": "workshop-start",
          "sourceId": "brief",
          "kind": "activity",
          "title": "Use summaries to practise inference",
          "points": [
            "Download the three-layer pack and timeline template.",
            "The pack contains synthetic DNS, traffic and memory output.",
            "Open the DNS log for the longest time window."
          ]
        },
        {
          "id": "task-beacon",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T1 · Establish the beacon",
          "points": [
            "Record destination and connection count.",
            "Calculate mean interval and standard deviation.",
            "Report relative variation; state assumptions before estimating configured jitter."
          ]
        },
        {
          "id": "task-dns",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T2 · Find the earlier DNS warning",
          "points": [
            "Group failed resolutions by host and time.",
            "Identify any successful resolution in the anomalous window.",
            "Measure its lead time before the beacon."
          ]
        },
        {
          "id": "task-memory",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T3 · Locate the code and its connection",
          "points": [
            "Review suspicious regions and PE headers.",
            "Match process IDs between memory and network output.",
            "Read command lines and decode the supplied command."
          ]
        },
        {
          "id": "task-transfer",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T4 · Follow movement and outbound data",
          "points": [
            "Record transfer size, time, destination and Content-Type.",
            "Review internal SMB and RDP traffic.",
            "Place lateral contacts relative to the transfer."
          ]
        }
      ]
    },
    {
      "id": "evidence-review",
      "title": "Make the account defensible",
      "half": "practical",
      "outline": [
        "Synthesize three lanes",
        "Submit supported findings",
        "Debrief the blind spots"
      ],
      "beats": [
        {
          "id": "task-timeline",
          "sourceId": "tasks",
          "kind": "flow",
          "title": "T5 · Assemble one sequence",
          "steps": [
            {
              "label": "Network",
              "note": "Timing, destinations and volume"
            },
            {
              "label": "Memory",
              "note": "Process and connection attribution"
            },
            {
              "label": "Endpoint",
              "note": "Supporting host evidence"
            },
            {
              "label": "Detection gaps",
              "note": "Order opportunities by lead time"
            }
          ]
        },
        {
          "id": "submission",
          "sourceId": "deliverables",
          "kind": "activity",
          "title": "Submit evidence that another analyst can follow",
          "points": [
            "Beacon statistics and DNS lead-time analysis.",
            "Memory attribution and transfer findings.",
            "Three-lane timeline and one formal finding."
          ]
        },
        {
          "id": "quality-bar",
          "sourceId": "assessment",
          "kind": "bullets",
          "title": "Show the reasoning behind each conclusion",
          "points": [
            "Support timing claims with calculations.",
            "Distinguish legitimate runtime memory from suspicious regions using context.",
            "Label confidence and join independent sources."
          ]
        },
        {
          "id": "debrief-layers",
          "sourceId": "debrief",
          "kind": "question",
          "title": "Which missing layer would weaken your account most?",
          "points": [
            "Name the claim you could no longer support.",
            "Choose the earliest detection you would build."
          ]
        },
        {
          "id": "closing",
          "sourceId": "recap",
          "kind": "recap",
          "title": "One layer’s blind spot is another layer’s evidence",
          "points": [
            "Network records communication history.",
            "Memory attributes activity at capture time.",
            "Disk preserves a different part of the sequence."
          ],
          "takeaway": "Join the layers before you call the finding complete."
        }
      ]
    }
  ]
}
