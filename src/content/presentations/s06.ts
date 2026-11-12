import type { PresentationPlan } from './types'

export const presentation06: PresentationPlan = {
  "slug": "host-forensics",
  "title": "Find what the cleanup left behind",
  "throughline": "What does each surviving artefact actually prove?",
  "chapters": [
    {
      "id": "method",
      "title": "One method across two platforms",
      "half": "theory",
      "outline": [
        "Recall preservation",
        "Ask five questions",
        "Seek independent support"
      ],
      "beats": [
        {
          "id": "recall",
          "sourceId": "retrieval",
          "kind": "question",
          "title": "What survives a cleared local log?",
          "takeaway": "Recall why multi-source timelines resist cleanup."
        },
        {
          "id": "opening",
          "sourceId": "scenario",
          "kind": "bullets",
          "title": "Two hosts. Deleted tools. Tampered logs.",
          "points": [
            "Linux web server shows unusual outbound activity",
            "Windows finance workstation has EDR disabled",
            "Both hosts have disk and memory captures",
            "A common intrusion is suspected"
          ],
          "takeaway": "Which artefact could establish a link?"
        },
        {
          "id": "five-questions",
          "sourceId": "five-questions",
          "kind": "flow",
          "title": "Ask the same five questions on both hosts",
          "steps": [
            {
              "label": "Execution",
              "note": "What ran?"
            },
            {
              "label": "Persistence",
              "note": "What stayed active?"
            },
            {
              "label": "Access",
              "note": "What was touched?"
            },
            {
              "label": "Privilege and movement",
              "note": "What access was gained?"
            },
            {
              "label": "Cleanup",
              "note": "What was hidden or deleted?"
            }
          ],
          "takeaway": "Only the evidence locations change."
        },
        {
          "id": "corroboration",
          "sourceId": "five-questions",
          "kind": "bullets",
          "title": "A finding needs an evidence boundary",
          "points": [
            "Name what the artefact records",
            "Name what it cannot establish",
            "Find a second independent source",
            "Keep inference separate from observation"
          ]
        }
      ]
    },
    {
      "id": "execution",
      "title": "Prove execution after deletion",
      "half": "theory",
      "outline": [
        "Read Windows traces",
        "Read Linux traces",
        "Separate execution from outcome"
      ],
      "beats": [
        {
          "id": "execution-platforms",
          "sourceId": "execution",
          "kind": "compare",
          "title": "Deleted tools can leave execution records",
          "columns": [
            {
              "label": "Windows",
              "points": [
                "Prefetch records executable runs",
                "UserAssist supports GUI execution"
              ]
            },
            {
              "label": "Linux",
              "points": [
                "Shell history records commands",
                "auditd records execve independently"
              ]
            }
          ],
          "takeaway": "Check collection and logging prerequisites before interpreting absence."
        },
        {
          "id": "prefetch",
          "sourceId": "demo",
          "kind": "evidence",
          "title": "The tool is gone; its run record remains",
          "lines": [
            {
              "text": "MIMIKATZ.EXE-3BA912C2.pf",
              "note": "Synthetic Prefetch entry"
            },
            {
              "text": "Run count: 2",
              "note": "Two recorded executions"
            },
            {
              "text": "Last run: 2026-03-11 04:17",
              "note": "Place execution in the timeline"
            }
          ],
          "takeaway": "Execution does not reveal which credentials were obtained."
        },
        {
          "id": "history-audit",
          "sourceId": "execution",
          "kind": "compare",
          "title": "Shell history and auditd are different witnesses",
          "columns": [
            {
              "label": "Shell history",
              "points": [
                "Can retain earlier sessions",
                "Can be disabled or cleared"
              ]
            },
            {
              "label": "auditd",
              "points": [
                "Independent of the shell history",
                "Requires appropriate auditing beforehand"
              ]
            }
          ],
          "takeaway": "Treat an unexpectedly empty history as a lead, not proof by itself."
        },
        {
          "id": "execution-question",
          "sourceId": "execution",
          "kind": "question",
          "title": "A tool ran. Did its objective succeed?",
          "takeaway": "Name a second artefact you would need to establish the outcome."
        }
      ]
    },
    {
      "id": "persistence",
      "title": "Find every route back in",
      "half": "theory",
      "outline": [
        "Inspect multiple classes",
        "Check key-based access",
        "Read paths and context"
      ],
      "beats": [
        {
          "id": "scheduled",
          "sourceId": "persistence",
          "kind": "compare",
          "title": "Check scheduled and automatic execution",
          "columns": [
            {
              "label": "Windows",
              "points": [
                "Scheduled Tasks and TaskCache",
                "Run keys and Startup folders",
                "Services and WMI subscriptions"
              ]
            },
            {
              "label": "Linux",
              "points": [
                "Cron for every user",
                "System and user systemd services",
                "SSH authorized_keys"
              ]
            }
          ],
          "takeaway": "Finding one mechanism is the start of the audit."
        },
        {
          "id": "windows-persistence",
          "sourceId": "persistence",
          "kind": "bullets",
          "title": "Windows: inspect the whole startup surface",
          "points": [
            "Use Autoruns to survey locations",
            "Review task and service creation evidence",
            "Check unusual paths and creation times",
            "Include less-examined WMI subscriptions"
          ]
        },
        {
          "id": "linux-persistence",
          "sourceId": "persistence",
          "kind": "bullets",
          "title": "Linux: use a fixed persistence checklist",
          "points": [
            "Read every user’s crontab",
            "Inspect system and user services",
            "Review authorized_keys across accounts",
            "Correlate with execution traces"
          ]
        },
        {
          "id": "password-reset",
          "sourceId": "persistence",
          "kind": "compare",
          "title": "A password reset does not remove persistence",
          "columns": [
            {
              "label": "Password authentication",
              "points": [
                "Reset changes the password",
                "It does not erase scheduled execution"
              ]
            },
            {
              "label": "SSH key authentication",
              "points": [
                "authorized_keys is independent",
                "An added public key may still work"
              ]
            }
          ],
          "takeaway": "Audit access mechanisms as well as passwords."
        },
        {
          "id": "persistence-context",
          "sourceId": "persistence",
          "kind": "bullets",
          "title": "A familiar name needs an unfamiliar-path check",
          "points": [
            "Compare names with expected locations",
            "Review temporary and hidden directories",
            "Check the deployment window",
            "Corroborate the command and account context"
          ]
        }
      ]
    },
    {
      "id": "access",
      "title": "State exactly what was accessed",
      "half": "theory",
      "outline": [
        "Distinguish browsing from transfer",
        "Trace privileges",
        "Correlate the pivot"
      ],
      "beats": [
        {
          "id": "navigation-volume",
          "sourceId": "access",
          "kind": "compare",
          "title": "Browsing and copying leave different records",
          "columns": [
            {
              "label": "Navigation",
              "points": [
                "Shellbags record folder navigation",
                "RecentDocs and LNK support file activity"
              ]
            },
            {
              "label": "Transfer volume",
              "points": [
                "SRUM records per-application network bytes",
                "Correlate the transfer window separately"
              ]
            }
          ],
          "takeaway": "Navigation is not a list of copied files."
        },
        {
          "id": "access-excerpt",
          "sourceId": "demo",
          "kind": "evidence",
          "title": "Two records strengthen a hypothesis, with limits",
          "lines": [
            {
              "text": "Shellbag: CFO financial reports folder",
              "note": "Folder navigation recorded"
            },
            {
              "text": "SRUM: robocopy.exe",
              "note": "Application transfer record"
            },
            {
              "text": "Bytes sent: 2,471,829,504",
              "note": "Volume during the intrusion window"
            }
          ],
          "takeaway": "These records do not identify which exact files were transferred."
        },
        {
          "id": "windows-pivot",
          "sourceId": "access",
          "kind": "compare",
          "title": "Correlate lateral movement at both ends",
          "columns": [
            {
              "label": "Source host",
              "points": [
                "Event 4648: explicit credentials",
                "RDP target history"
              ]
            },
            {
              "label": "Destination host",
              "points": [
                "Event 4624 Type 10 for RDP",
                "Match account, source and time"
              ]
            }
          ],
          "takeaway": "A single host’s view leaves the other half untested."
        },
        {
          "id": "linux-pivot",
          "sourceId": "access",
          "kind": "compare",
          "title": "Use SSH records to test the host link",
          "columns": [
            {
              "label": "Source host",
              "points": [
                "known_hosts records host keys",
                "Review command and user context"
              ]
            },
            {
              "label": "Destination host",
              "points": [
                "Look for Accepted publickey records",
                "Correlate account, address and time"
              ]
            }
          ],
          "takeaway": "A known_hosts entry alone does not establish the whole intrusion."
        },
        {
          "id": "privileges",
          "sourceId": "access",
          "kind": "compare",
          "title": "Check how privilege and credential access changed",
          "columns": [
            {
              "label": "Windows",
              "points": [
                "LSASS access and execution traces",
                "SAM, domain credential and replication evidence"
              ]
            },
            {
              "label": "Linux",
              "points": [
                "/etc/shadow access evidence",
                "SUID or SGID misconfiguration",
                "Unexpected UID 0 accounts"
              ]
            }
          ],
          "takeaway": "Record the artefact before attributing the technique."
        },
        {
          "id": "access-question",
          "sourceId": "check",
          "kind": "question",
          "title": "A shellbag names a sensitive folder. What can you claim?",
          "takeaway": "State the observation and the evidence needed for a stronger conclusion."
        }
      ]
    },
    {
      "id": "cleanup",
      "title": "Investigate the cleanup itself",
      "half": "theory",
      "outline": [
        "Verify Linux tools",
        "Recognise log tampering",
        "Find surviving records"
      ],
      "beats": [
        {
          "id": "integrity-excerpt",
          "sourceId": "demo",
          "kind": "evidence",
          "title": "Check tool integrity before trusting live output",
          "lines": [
            {
              "text": "$ rpm -Va",
              "note": "Synthetic verification output"
            },
            {
              "text": "S.5....T. /usr/bin/ps",
              "note": "Hash mismatch flag: 5"
            },
            {
              "text": "S.5....T. /usr/bin/netstat",
              "note": "Connection tool also differs"
            }
          ],
          "takeaway": "Use a trusted examination environment when local tools are compromised."
        },
        {
          "id": "log-clear",
          "sourceId": "antiforensics",
          "kind": "compare",
          "title": "Tampering has different traces on each platform",
          "columns": [
            {
              "label": "Windows",
              "points": [
                "Security log clearing: Event 1102",
                "System log clearing: Event 104"
              ]
            },
            {
              "label": "Linux",
              "points": [
                "Truncation may have no clearing event",
                "Inspect modification times and missing history"
              ]
            }
          ],
          "takeaway": "Check independent evidence before concluding what was removed."
        },
        {
          "id": "survivors",
          "sourceId": "antiforensics",
          "kind": "bullets",
          "title": "Ask what the cleanup did not touch",
          "points": [
            "Previously forwarded logs",
            "Windows Prefetch and registry artefacts",
            "File metadata",
            "Linux execution traces in independent logs"
          ]
        },
        {
          "id": "demo",
          "sourceId": "demo",
          "kind": "activity",
          "title": "Trace a claim back to its strongest surviving artefact",
          "points": [
            "Review the synthetic triage output",
            "Name the source for one finding",
            "State its limit",
            "Find independent corroboration"
          ],
          "takeaway": "Open the forensic triage evidence for guided analysis."
        },
        {
          "id": "before-workshop",
          "sourceId": "theory-recap",
          "kind": "recap",
          "title": "Keep the same discipline on both platforms",
          "points": [
            "Execution is different from success",
            "Navigation is different from copying",
            "One persistence mechanism may hide another",
            "Tool integrity comes before live output"
          ]
        }
      ]
    },
    {
      "id": "cross-platform",
      "title": "Workshop: reconstruct one intrusion",
      "half": "practical",
      "outline": [
        "Establish trust and access",
        "Join both host timelines",
        "Write a bounded finding"
      ],
      "beats": [
        {
          "id": "workshop-start",
          "sourceId": "brief",
          "kind": "activity",
          "title": "Use the parsed artefact pack to reconstruct events",
          "points": [
            "Download the pack and timeline template",
            "Create your cross-platform working folder",
            "Read Linux integrity results first",
            "Work both hosts in parallel"
          ]
        },
        {
          "id": "workshop-order",
          "sourceId": "tasks",
          "kind": "flow",
          "title": "Build the evidence chain across hosts",
          "steps": [
            {
              "label": "Linux",
              "note": "Integrity, initial access and execution"
            },
            {
              "label": "Persistence",
              "note": "Inventory mechanisms on both hosts"
            },
            {
              "label": "Windows",
              "note": "Execution, navigation and transfer"
            },
            {
              "label": "Pivot",
              "note": "Corroborate the link at both ends"
            }
          ],
          "takeaway": "The workshop assesses interpretation, not operating forensic tools."
        },
        {
          "id": "timeline-task",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "Make one timeline with explicit confidence",
          "points": [
            "Sort both hosts chronologically",
            "Name every artefact source",
            "Separate observation, hypothesis and confirmation",
            "Mark cleanup and what survived it"
          ]
        },
        {
          "id": "report-task",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "Write only what the evidence supports",
          "points": [
            "Use Finding, Severity, Impact, Evidence, Remediation",
            "Cite the artefact for every claim",
            "Keep navigation and transfer findings separate",
            "Include missed persistence in remediation"
          ]
        },
        {
          "id": "handover",
          "sourceId": "deliverables",
          "kind": "activity",
          "title": "Submit a case another analyst can follow",
          "points": [
            "Linux integrity assessment",
            "Per-host findings and persistence inventories",
            "Corroborated pivot and merged timeline",
            "Formal finding with evidence limits"
          ]
        },
        {
          "id": "debrief",
          "sourceId": "debrief",
          "kind": "question",
          "title": "Which claim in your report is easiest to challenge?",
          "takeaway": "Identify the missing artefact or narrow the claim."
        },
        {
          "id": "close",
          "sourceId": "recap",
          "kind": "recap",
          "title": "Cleanup changes the evidence, not the method",
          "points": [
            "Ask the same five questions",
            "Check multiple persistence classes",
            "Corroborate across both hosts",
            "Say exactly what each artefact establishes"
          ]
        }
      ]
    }
  ]
}
