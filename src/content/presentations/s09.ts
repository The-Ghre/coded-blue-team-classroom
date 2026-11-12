import type { PresentationPlan } from './types'

export const presentation09: PresentationPlan = {
  "slug": "threat-hunting",
  "title": "Look Where No Alert Is Watching",
  "throughline": "Ask a testable question, verify the telemetry, and make every outcome useful.",
  "chapters": [
    {
      "id": "hunt-question",
      "title": "Begin with a question, not a search box",
      "half": "theory",
      "outline": [
        "Recall coverage gaps",
        "Read indicator-free intelligence",
        "Write a hypothesis"
      ],
      "beats": [
        {
          "id": "recall",
          "sourceId": "retrieval",
          "kind": "question",
          "title": "What does a green coverage map actually prove?",
          "points": [
            "Recall how to test whether a detection works.",
            "Why document a hunt that finds nothing?"
          ]
        },
        {
          "id": "opening",
          "sourceId": "scenario",
          "kind": "bullets",
          "title": "Three techniques. No indicators. No alerts.",
          "points": [
            "Sector intelligence names VPN credentials, WMI and DCSync.",
            "The report supplies no hashes or addresses.",
            "Your current rules do not cover those behaviours."
          ]
        },
        {
          "id": "opening-choice",
          "sourceId": "scenario",
          "kind": "question",
          "title": "What can you hunt without an IOC?",
          "points": [
            "Choose one named behaviour.",
            "Name the evidence you would expect it to leave."
          ]
        },
        {
          "id": "hypothesis-format",
          "sourceId": "hypothesis",
          "kind": "flow",
          "title": "Build the hypothesis from four specific parts",
          "steps": [
            {
              "label": "Behaviour",
              "note": "What may be occurring?"
            },
            {
              "label": "Reason",
              "note": "Why investigate it here?"
            },
            {
              "label": "Evidence",
              "note": "What would you expect to observe?"
            },
            {
              "label": "Data source",
              "note": "Where would that evidence exist?"
            }
          ]
        },
        {
          "id": "hypothesis-test",
          "sourceId": "hypothesis",
          "kind": "bullets",
          "title": "Make both possible answers interpretable",
          "points": [
            "Define what confirmation would look like.",
            "Define what would refute the hypothesis in this window.",
            "Missing telemetry makes the result inconclusive."
          ]
        }
      ]
    },
    {
      "id": "mode-and-baseline",
      "title": "Choose the hunt and establish normal",
      "half": "theory",
      "outline": [
        "IOC versus behaviour",
        "Stack counting",
        "Baseline limits"
      ],
      "beats": [
        {
          "id": "hunt-modes",
          "sourceId": "ioc-vs-behav",
          "kind": "compare",
          "title": "Use the search that matches the question",
          "columns": [
            {
              "label": "IOC-based",
              "points": [
                "Fast sweep for known indicators",
                "Narrow campaign scope",
                "Infrastructure rotation limits coverage"
              ]
            },
            {
              "label": "Behavioural",
              "points": [
                "Starts with an action pattern",
                "Needs context and baselines",
                "Can survive changes in tooling"
              ]
            }
          ]
        },
        {
          "id": "pair-hunts",
          "sourceId": "ioc-vs-behav",
          "kind": "flow",
          "title": "When indicators exist, use both approaches",
          "steps": [
            {
              "label": "IOC sweep",
              "note": "Check the specific known campaign"
            },
            {
              "label": "Behavioural hunt",
              "note": "Check the techniques behind it"
            },
            {
              "label": "Interpret",
              "note": "State each search’s scope and limits"
            }
          ]
        },
        {
          "id": "stack-counting",
          "sourceId": "baseline",
          "kind": "flow",
          "title": "Count the combinations, then inspect the rarest",
          "steps": [
            {
              "label": "Group",
              "note": "Parent-child pairs or another feature"
            },
            {
              "label": "Count",
              "note": "Occurrences in the chosen window"
            },
            {
              "label": "Sort ascending",
              "note": "Bring the long tail into view"
            },
            {
              "label": "Investigate",
              "note": "Rarity is a lead, not a verdict"
            }
          ]
        },
        {
          "id": "rare-pair",
          "sourceId": "baseline",
          "kind": "evidence",
          "title": "Read a tiny parent-child frequency table",
          "lines": [
            {
              "text": "explorer.exe -> notepad.exe       50000",
              "note": "Frequent baseline activity"
            },
            {
              "text": "WINWORD.EXE -> powershell.exe         1",
              "note": "Rare pair worth investigating"
            }
          ]
        },
        {
          "id": "baseline-limits",
          "sourceId": "baseline",
          "kind": "bullets",
          "title": "Abnormal depends on whose normal you measured",
          "points": [
            "Compare working hours, volume and first-seen activity.",
            "Use a relevant per-host or per-account baseline.",
            "Check that the baseline data is representative and clean."
          ]
        }
      ]
    },
    {
      "id": "three-hunts",
      "title": "Turn intelligence into three runnable hunts",
      "half": "theory",
      "outline": [
        "VPN account context",
        "WMI children",
        "Replication auditing"
      ],
      "beats": [
        {
          "id": "vpn-hunt",
          "sourceId": "queries",
          "kind": "flow",
          "title": "A new country is a starting point",
          "steps": [
            {
              "label": "VPN logs",
              "note": "Group by account"
            },
            {
              "label": "Countries",
              "note": "Count distinct source countries"
            },
            {
              "label": "Baseline",
              "note": "Resolve corporate egress explanations"
            },
            {
              "label": "Context",
              "note": "Check device and timing"
            }
          ]
        },
        {
          "id": "wmi-hunt",
          "sourceId": "queries",
          "kind": "bullets",
          "title": "Look for unusual children of WmiPrvSE.exe",
          "points": [
            "Use process creation telemetry.",
            "Compare child processes with known administration.",
            "Read host, account, time and full command line."
          ]
        },
        {
          "id": "replication-hunt",
          "sourceId": "queries",
          "kind": "evidence",
          "title": "Read the replication filter as a question",
          "lines": [
            {
              "text": "Event ID: 4662",
              "note": "Directory service object access"
            },
            {
              "text": "Properties: 1131f6aa / 1131f6ad",
              "note": "Replication permission identifiers"
            },
            {
              "text": "Source: non-domain-controller",
              "note": "Validate source role and account context"
            }
          ]
        },
        {
          "id": "null-result",
          "sourceId": "check",
          "kind": "question",
          "title": "The DCSync query returns zero. What do you know?",
          "points": [
            "Was the required auditing enabled?",
            "Did the query cover the intended time window?"
          ]
        },
        {
          "id": "query-limits",
          "sourceId": "queries",
          "kind": "bullets",
          "title": "Name the blind spots before claiming absence",
          "points": [
            "Geolocation is approximate and egress can mislead.",
            "Child-process hunting misses other WMI mechanisms.",
            "A point-in-time hunt does not provide continuous coverage."
          ]
        }
      ]
    },
    {
      "id": "coverage-pipeline",
      "title": "Make hunting coverage accumulate",
      "half": "theory",
      "outline": [
        "Prioritise huntable gaps",
        "Decide the outcome",
        "Convert findings into detection"
      ],
      "beats": [
        {
          "id": "priority-filter",
          "sourceId": "coverage",
          "kind": "flow",
          "title": "Choose a gap you can investigate now",
          "steps": [
            {
              "label": "Coverage gap",
              "note": "What is not detected?"
            },
            {
              "label": "Threat relevance",
              "note": "What matters to this sector?"
            },
            {
              "label": "Telemetry",
              "note": "Can we observe the behaviour?"
            },
            {
              "label": "Priority",
              "note": "Hunt now or improve collection first"
            }
          ]
        },
        {
          "id": "coverage-activity",
          "sourceId": "coverage",
          "kind": "activity",
          "title": "Choose the first hunt from the coverage map",
          "points": [
            "Identify a relevant uncovered technique.",
            "Verify its evidence is collected.",
            "Explain why it outranks another candidate."
          ]
        },
        {
          "id": "hunt-outcomes",
          "sourceId": "hypothesis",
          "kind": "compare",
          "title": "Every outcome has an operational next step",
          "columns": [
            {
              "label": "Confirmed",
              "points": [
                "Escalate and preserve evidence",
                "Create and test a rule"
              ]
            },
            {
              "label": "Refuted",
              "points": [
                "Record query and parameters",
                "State the searched scope"
              ]
            },
            {
              "label": "Inconclusive",
              "points": [
                "Name missing evidence",
                "Raise a logging improvement ticket"
              ]
            }
          ]
        },
        {
          "id": "pipeline",
          "sourceId": "pipeline",
          "kind": "flow",
          "title": "A manual finding should become durable coverage",
          "steps": [
            {
              "label": "Hunt",
              "note": "Find and investigate behaviour"
            },
            {
              "label": "Rule",
              "note": "Encode the detection logic"
            },
            {
              "label": "Test",
              "note": "Check positives and exclusions"
            },
            {
              "label": "Deploy",
              "note": "Confirm operational coverage"
            }
          ]
        },
        {
          "id": "theory-close",
          "sourceId": "theory-recap",
          "kind": "recap",
          "title": "Write before querying; document after interpreting",
          "points": [
            "Keep the original hypothesis intact.",
            "Verify the data source before interpreting zero results.",
            "Leave a reusable record even when nothing is found."
          ]
        }
      ]
    },
    {
      "id": "workshop",
      "title": "Workshop: run three documented hypotheses",
      "half": "practical",
      "outline": [
        "Prepare baseline and records",
        "Hunt three behaviours",
        "Connect related findings"
      ],
      "beats": [
        {
          "id": "workshop-start",
          "sourceId": "brief",
          "kind": "activity",
          "title": "Use the supplied baseline and thirty-day pack",
          "points": [
            "Download the hunt pack and record template.",
            "Read the environment baseline first.",
            "Write all three hypotheses before querying."
          ]
        },
        {
          "id": "task-hypotheses",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T1 · Write three testable hypotheses",
          "points": [
            "Name behaviour, reason, evidence and data source.",
            "Define confirmed and refuted outcomes.",
            "Verify each source is present."
          ]
        },
        {
          "id": "task-vpn",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T2 · Test the credential-abuse hypothesis",
          "points": [
            "Aggregate countries by account.",
            "Explain known egress patterns using the baseline.",
            "Investigate remaining device and timing anomalies."
          ]
        },
        {
          "id": "task-wmi",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T3 · Test the WMI hypothesis",
          "points": [
            "Filter process creation by parent.",
            "Exclude baseline children with reasons.",
            "Record unusual commands and compare account context."
          ]
        },
        {
          "id": "task-dcsync",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T4 · Test the replication hypothesis",
          "points": [
            "Record auditing status before interpreting results.",
            "Filter the replication permission events.",
            "Validate source hosts and accounts."
          ]
        }
      ]
    },
    {
      "id": "close-the-hunt",
      "title": "Close the loop, not just the browser",
      "half": "practical",
      "outline": [
        "Record every outcome",
        "Produce rules or tickets",
        "Review reusable evidence"
      ],
      "beats": [
        {
          "id": "task-convert",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T5 · Document and convert",
          "points": [
            "Complete one record per hypothesis.",
            "Convert confirmed findings into Sigma rules.",
            "Connect related findings into one timed sequence."
          ]
        },
        {
          "id": "submission",
          "sourceId": "deliverables",
          "kind": "activity",
          "title": "Submit a hunt a colleague can rerun",
          "points": [
            "Three hypotheses and completed hunt records.",
            "Explicit source verification and reusable queries.",
            "Rules, linked chain and logging tickets where applicable."
          ]
        },
        {
          "id": "quality-bar",
          "sourceId": "assessment",
          "kind": "bullets",
          "title": "Interpretation matters as much as a positive hit",
          "points": [
            "Show why a known false positive was eliminated.",
            "State narrow, evidence-supported conclusions.",
            "Make query parameters and time windows reproducible."
          ]
        },
        {
          "id": "debrief",
          "sourceId": "debrief",
          "kind": "question",
          "title": "Would your negative result be useful in six months?",
          "points": [
            "Name what another hunter could repeat.",
            "Explain which new rule would detect the chain earliest."
          ]
        },
        {
          "id": "closing",
          "sourceId": "recap",
          "kind": "recap",
          "title": "Every hunt leaves the next analyst something useful",
          "points": [
            "A rule for confirmed behaviour.",
            "A reusable query for a refuted hypothesis.",
            "A logging ticket for an inconclusive result."
          ],
          "takeaway": "Precision makes a search that finds nothing worth doing."
        }
      ]
    }
  ]
}
