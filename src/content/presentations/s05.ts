import type { PresentationPlan } from './types'

export const presentation05: PresentationPlan = {
  "slug": "incident-response",
  "title": "Preserve evidence while stopping the damage",
  "throughline": "Which action must happen before the next one?",
  "chapters": [
    {
      "id": "pressure",
      "title": "The first ten minutes",
      "half": "theory",
      "outline": [
        "Recall what disappears",
        "Assess the live incident",
        "Choose the sequence"
      ],
      "beats": [
        {
          "id": "recall",
          "sourceId": "retrieval",
          "kind": "question",
          "title": "What exists in RAM but nowhere on disk?",
          "takeaway": "Recall two examples before opening your notes."
        },
        {
          "id": "opening",
          "sourceId": "scenario",
          "kind": "bullets",
          "title": "The service owner wants a reboot",
          "points": [
            "A domain controller is still running",
            "An unseen account ran ntdsutil.exe",
            "4.2 GB left ten minutes later",
            "You have ten minutes"
          ],
          "takeaway": "What must you preserve before the machine restarts?"
        },
        {
          "id": "two-goals",
          "sourceId": "objectives",
          "kind": "compare",
          "title": "One response has two simultaneous goals",
          "columns": [
            {
              "label": "Stop damage",
              "points": [
                "Contain the incident",
                "Limit continuing exposure"
              ]
            },
            {
              "label": "Preserve the explanation",
              "points": [
                "Capture volatile evidence",
                "Record actions and custody"
              ]
            }
          ],
          "takeaway": "The order of actions determines what can be investigated."
        }
      ]
    },
    {
      "id": "response",
      "title": "A response has a structure",
      "half": "theory",
      "outline": [
        "Prepare and identify",
        "Contain and eradicate",
        "Recover and learn"
      ],
      "beats": [
        {
          "id": "first-phases",
          "sourceId": "phases",
          "kind": "flow",
          "title": "Preparation shapes the first response",
          "steps": [
            {
              "label": "Prepare",
              "note": "People, runbooks, tools and communications"
            },
            {
              "label": "Identify",
              "note": "Confirm, scope and establish start time"
            },
            {
              "label": "Contain",
              "note": "Freeze the situation and preserve evidence"
            }
          ],
          "takeaway": "Rehearse responsibilities before the incident."
        },
        {
          "id": "later-phases",
          "sourceId": "phases",
          "kind": "flow",
          "title": "Restoring service is not the final phase",
          "steps": [
            {
              "label": "Eradicate",
              "note": "Remove the attacker and persistence"
            },
            {
              "label": "Recover",
              "note": "Restore deliberately with enhanced monitoring"
            },
            {
              "label": "Learn",
              "note": "Fix root cause and detection gaps"
            }
          ],
          "takeaway": "Feed lessons back into preparation."
        },
        {
          "id": "severity-high",
          "sourceId": "severity",
          "kind": "compare",
          "title": "Severity follows the evidence",
          "columns": [
            {
              "label": "P1 · Critical",
              "points": [
                "Active breach, theft or spreading ransomware",
                "Immediate, all hands"
              ]
            },
            {
              "label": "P2 · High",
              "points": [
                "Confirmed compromise, contained",
                "IR lead; response within one hour"
              ]
            }
          ],
          "takeaway": "Reassess severity whenever scope or activity changes."
        },
        {
          "id": "severity-low",
          "sourceId": "severity",
          "kind": "compare",
          "title": "Keep lower priorities explicit",
          "columns": [
            {
              "label": "P3 · Medium",
              "points": [
                "Suspicious activity confirmed",
                "Compromise not yet verified",
                "Tier 2; within four hours"
              ]
            },
            {
              "label": "P4 · Low",
              "points": [
                "Likely false positive or minor violation",
                "Document at Tier 1",
                "Next business day"
              ]
            }
          ],
          "takeaway": "Use the course response targets; record your reasoning."
        },
        {
          "id": "escalation",
          "sourceId": "severity",
          "kind": "bullets",
          "title": "Communicate the incident and its trajectory",
          "points": [
            "What happened, when and to what?",
            "What have you already done?",
            "What do you need next?",
            "What is known, unknown and changing?"
          ],
          "takeaway": "Use the planned out-of-band channel."
        },
        {
          "id": "severity-discuss",
          "sourceId": "severity",
          "kind": "question",
          "title": "P2 and stable. P2 and climbing. Same response?",
          "takeaway": "Explain what new evidence would widen the response."
        }
      ]
    },
    {
      "id": "preserve",
      "title": "Collect what disappears first",
      "half": "theory",
      "outline": [
        "Follow volatility",
        "Choose containment",
        "Avoid irreversible losses"
      ],
      "beats": [
        {
          "id": "volatile",
          "sourceId": "volatility",
          "kind": "flow",
          "title": "Volatility sets collection priority",
          "steps": [
            {
              "label": "CPU state",
              "note": "Usually impractical to collect"
            },
            {
              "label": "RAM",
              "note": "Lost on reboot"
            },
            {
              "label": "Live state",
              "note": "Connections and processes change"
            },
            {
              "label": "Disk",
              "note": "Persistent but overwritable"
            },
            {
              "label": "Remote logs",
              "note": "Stable until retention expires"
            }
          ],
          "takeaway": "Collect the most volatile practical evidence first."
        },
        {
          "id": "memory-disk",
          "sourceId": "volatility",
          "kind": "compare",
          "title": "Memory and disk answer different questions",
          "columns": [
            {
              "label": "Memory",
              "points": [
                "Injected code and running processes",
                "Live credentials, keys and connections"
              ]
            },
            {
              "label": "Disk",
              "points": [
                "Files and historical artefacts",
                "Persistent data and metadata"
              ]
            }
          ],
          "takeaway": "A disk image cannot recreate lost RAM."
        },
        {
          "id": "capture-sequence",
          "sourceId": "volatility",
          "kind": "flow",
          "title": "Rehearse the course collection sequence",
          "steps": [
            {
              "label": "Capture memory",
              "note": "Preserve the running state"
            },
            {
              "label": "Export live evidence",
              "note": "Logs and network state"
            },
            {
              "label": "Isolate",
              "note": "Apply the planned containment"
            }
          ],
          "takeaway": "Record times and the reason for each action."
        },
        {
          "id": "containment-options",
          "sourceId": "containment",
          "kind": "compare",
          "title": "Choose the control that fits the scope",
          "columns": [
            {
              "label": "Host and identity",
              "points": [
                "EDR isolation preserves management access",
                "Disable compromised accounts"
              ]
            },
            {
              "label": "Network",
              "points": [
                "Block or sinkhole the C2 destination",
                "Use VLAN isolation where appropriate"
              ]
            }
          ],
          "takeaway": "Containment freezes the incident; eradication removes the cause."
        },
        {
          "id": "avoid-loss",
          "sourceId": "containment",
          "kind": "bullets",
          "title": "Check what the next action would destroy",
          "points": [
            "A reboot loses RAM",
            "Deleting files removes evidence",
            "Wiping prevents later imaging",
            "Compromised communications may expose your response"
          ]
        },
        {
          "id": "reboot-question",
          "sourceId": "check",
          "kind": "question",
          "title": "Ten minutes until reboot: what is your sequence?",
          "takeaway": "Name the evidence each step preserves."
        }
      ]
    },
    {
      "id": "custody",
      "title": "Make the evidence defensible",
      "half": "theory",
      "outline": [
        "Identify every item",
        "Verify acquisition",
        "Track every handoff"
      ],
      "beats": [
        {
          "id": "custody-excerpt",
          "sourceId": "custody",
          "kind": "evidence",
          "title": "A custody record attaches actions to people",
          "lines": [
            {
              "text": "Case: IR-2026-0314-FINANCE",
              "note": "One case identifier"
            },
            {
              "text": "Item: FINANCE-PC-04 disk image",
              "note": "An unambiguous item"
            },
            {
              "text": "Collector: S. Chen",
              "note": "A named individual"
            },
            {
              "text": "Collected: 2026-03-14 09:47 UTC",
              "note": "A timestamp with timezone"
            }
          ],
          "takeaway": "Synthetic excerpt; the full form remains in Study."
        },
        {
          "id": "acquisition-record",
          "sourceId": "custody",
          "kind": "bullets",
          "title": "Record how the item was collected",
          "points": [
            "Tool name and version",
            "Acquisition method and write blocker",
            "Hash verification at acquisition",
            "Storage location and access record"
          ]
        },
        {
          "id": "verify",
          "sourceId": "custody",
          "kind": "flow",
          "title": "Integrity verification continues after acquisition",
          "steps": [
            {
              "label": "Acquire",
              "note": "Record and verify hashes"
            },
            {
              "label": "Store",
              "note": "Log access and handoffs"
            },
            {
              "label": "Analyse",
              "note": "Recheck before examination"
            },
            {
              "label": "Present",
              "note": "Verify the evidence remains intact"
            }
          ],
          "takeaway": "A hash mismatch is a stop event."
        },
        {
          "id": "hash-boundary",
          "sourceId": "custody",
          "kind": "compare",
          "title": "Integrity does not prove the story",
          "columns": [
            {
              "label": "Matching hashes support",
              "points": [
                "The copy matches the acquired data",
                "The data has not changed since verification"
              ]
            },
            {
              "label": "Still investigate",
              "points": [
                "Was the system clock correct?",
                "Was the source altered before collection?"
              ]
            }
          ],
          "takeaway": "Separate evidence integrity from interpretation."
        },
        {
          "id": "hash-question",
          "sourceId": "check",
          "kind": "question",
          "title": "The analysis hash differs. What happens next?",
          "takeaway": "Explain why continuing would weaken every later conclusion."
        }
      ]
    },
    {
      "id": "timeline",
      "title": "Reconstruct the event across sources",
      "half": "theory",
      "outline": [
        "Build source lanes",
        "Separate fact from inference",
        "Find missed detection points"
      ],
      "beats": [
        {
          "id": "timeline-method",
          "sourceId": "timeline",
          "kind": "flow",
          "title": "Build the timeline before telling the story",
          "steps": [
            {
              "label": "Order",
              "note": "Normalise time and sort events"
            },
            {
              "label": "Attribute",
              "note": "Name the source of each entry"
            },
            {
              "label": "Classify",
              "note": "Observation, hypothesis or confirmed"
            },
            {
              "label": "Corroborate",
              "note": "Look for independent support"
            }
          ],
          "takeaway": "Record clock skew and uncertainty."
        },
        {
          "id": "timeline-lanes",
          "sourceId": "timeline",
          "kind": "compare",
          "title": "No single source sees the whole incident",
          "columns": [
            {
              "label": "Endpoint",
              "points": [
                "Execution and persistence",
                "Memory acquisition and disk imaging"
              ]
            },
            {
              "label": "Network",
              "points": [
                "Downloads and outbound traffic",
                "Isolation and perimeter changes"
              ]
            },
            {
              "label": "Identity",
              "points": [
                "Account activity",
                "Escalation and response decisions"
              ]
            }
          ],
          "takeaway": "Join independent lanes around the same event."
        },
        {
          "id": "timeline-demo",
          "sourceId": "timeline",
          "kind": "activity",
          "title": "Find the gap between activity and alert",
          "points": [
            "Assemble the evidence fragments",
            "Mark the first detectable event",
            "Compare it with the first alert",
            "Name the missing detection opportunity"
          ],
          "takeaway": "Open the timeline exercise for the demonstration."
        },
        {
          "id": "tampering",
          "sourceId": "theory-recap",
          "kind": "bullets",
          "title": "Cleanup belongs in the timeline too",
          "points": [
            "Record evidence of log clearing",
            "Identify independent records that survived",
            "State what you can no longer establish"
          ],
          "takeaway": "A missing local record does not erase every source."
        }
      ]
    },
    {
      "id": "incident-workshop",
      "title": "Workshop: run the incident",
      "half": "practical",
      "outline": [
        "Record timed decisions",
        "Capture and contain",
        "Report what would change"
      ],
      "beats": [
        {
          "id": "workshop-brief",
          "sourceId": "brief",
          "kind": "activity",
          "title": "Work the incident as information arrives",
          "points": [
            "Create the case folder and decision log",
            "Record your start time",
            "Open injects only when scheduled",
            "Record decisions, not simulated tool execution"
          ]
        },
        {
          "id": "workshop-tasks",
          "sourceId": "tasks",
          "kind": "flow",
          "title": "Make the sequence reviewable",
          "steps": [
            {
              "label": "Identify",
              "note": "Confirm, scope and classify"
            },
            {
              "label": "Preserve",
              "note": "Write capture order and custody records"
            },
            {
              "label": "Contain",
              "note": "Timestamp actions and rationale"
            },
            {
              "label": "Reassess",
              "note": "Respond to each timed inject"
            }
          ],
          "takeaway": "Do not read the injects ahead of time."
        },
        {
          "id": "workshop-timeline",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "Build a timeline someone else can challenge",
          "points": [
            "Name a source for every entry",
            "Label confidence explicitly",
            "Mark anti-forensic activity and surviving evidence",
            "Identify missed detection opportunities"
          ]
        },
        {
          "id": "report",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "Turn the incident into specific improvements",
          "points": [
            "State the actual initial access method",
            "Summarise impact and current status",
            "Name techniques and sources in three recommendations",
            "State each recommendation’s limits"
          ]
        },
        {
          "id": "handover",
          "sourceId": "deliverables",
          "kind": "activity",
          "title": "Submit the case, not just the conclusion",
          "points": [
            "Decision log and severity reassessments",
            "Custody records with hash verification",
            "Sourced and classified timeline",
            "Post-incident report and detection recommendations"
          ]
        },
        {
          "id": "debrief",
          "sourceId": "debrief",
          "kind": "question",
          "title": "Would this attack be detected in ten minutes tomorrow?",
          "takeaway": "Name the remaining gap if your answer is no."
        },
        {
          "id": "close",
          "sourceId": "recap",
          "kind": "recap",
          "title": "The sequence is the skill",
          "points": [
            "Capture what will disappear",
            "Contain with evidence consequences in mind",
            "Verify and document every handoff",
            "Use lessons learned to improve detection"
          ]
        }
      ]
    }
  ]
}
