import type { PresentationPlan } from './types'

export const presentation08: PresentationPlan = {
  "slug": "malware-analysis",
  "title": "From One File to a Campaign",
  "throughline": "Deliver the urgent answer first, then turn the sample into validated defensive intelligence.",
  "chapters": [
    {
      "id": "urgent-answer",
      "title": "Ask the useful question first",
      "half": "theory",
      "outline": [
        "Recall fileless evidence",
        "Meet the sample",
        "Set the analysis order"
      ],
      "beats": [
        {
          "id": "recall",
          "sourceId": "retrieval",
          "kind": "question",
          "title": "What can one indicator help you find?",
          "points": [
            "Recall two infrastructure pivot paths.",
            "What did memory and network evidence establish together?"
          ]
        },
        {
          "id": "opening",
          "sourceId": "scenario",
          "kind": "bullets",
          "title": "One document. Three audiences. Forty-five minutes.",
          "points": [
            "IR needs containment advice.",
            "Detection engineering needs usable behaviours.",
            "The CISO needs a plain-language conclusion."
          ]
        },
        {
          "id": "first-question",
          "sourceId": "scenario",
          "kind": "question",
          "title": "What is the first useful answer?",
          "points": [
            "Put file type, behaviour and campaign scope in order.",
            "Explain which answer can arrive without execution."
          ]
        },
        {
          "id": "analysis-order",
          "sourceId": "priority",
          "kind": "flow",
          "title": "Move from sample to immediate defensive action",
          "steps": [
            {
              "label": "Triage",
              "note": "Identify and assess the file"
            },
            {
              "label": "Behaviour",
              "note": "Understand the execution chain"
            },
            {
              "label": "Infrastructure",
              "note": "Extract and validate indicators"
            },
            {
              "label": "Defend",
              "note": "Block, detect and report"
            }
          ]
        },
        {
          "id": "analysis-boundary",
          "sourceId": "priority",
          "kind": "bullets",
          "title": "Use an authorised analysis environment",
          "points": [
            "Never execute a sample on a production machine.",
            "Keep sample execution inside a controlled isolated environment.",
            "Run host forensics in parallel with sample analysis."
          ]
        }
      ]
    },
    {
      "id": "static-first",
      "title": "Learn what the file reveals without execution",
      "half": "theory",
      "outline": [
        "Verify the format",
        "Record the identifier",
        "Interpret reputation"
      ],
      "beats": [
        {
          "id": "static-order",
          "sourceId": "static",
          "kind": "flow",
          "title": "Spend the first minutes on static triage",
          "steps": [
            {
              "label": "Type",
              "note": "Check magic bytes"
            },
            {
              "label": "Hash",
              "note": "Record the sample identifier"
            },
            {
              "label": "Reputation",
              "note": "Read history and detections"
            },
            {
              "label": "Strings and imports",
              "note": "Extract leads and possible capabilities"
            }
          ]
        },
        {
          "id": "magic-bytes",
          "sourceId": "static",
          "kind": "evidence",
          "title": "The extension is a label; the bytes identify format",
          "lines": [
            {
              "text": "4D 5A             MZ",
              "note": "Windows PE executable"
            },
            {
              "text": "50 4B 03 04       PK",
              "note": "ZIP container; includes modern Office"
            },
            {
              "text": "25 50 44 46       %PDF",
              "note": "PDF header"
            },
            {
              "text": "D0 CF 11 E0",
              "note": "Legacy Office OLE2 container"
            }
          ]
        },
        {
          "id": "strings-imports",
          "sourceId": "static",
          "kind": "bullets",
          "title": "Strings and imports point to the next questions",
          "points": [
            "Look for addresses, paths and registry keys.",
            "Imports suggest capabilities to investigate.",
            "Packing and obfuscation can hide useful strings."
          ]
        },
        {
          "id": "reputation-context",
          "sourceId": "reputation",
          "kind": "compare",
          "title": "Reputation measures recognition, not innocence",
          "columns": [
            {
              "label": "Recognised sample",
              "points": [
                "Read detection names",
                "Check first-seen history",
                "Collect related indicators"
              ]
            },
            {
              "label": "Unrecognised sample",
              "points": [
                "No signature match is limited evidence",
                "Consider incident context",
                "Continue analysis"
              ]
            }
          ]
        },
        {
          "id": "privacy-question",
          "sourceId": "check",
          "kind": "question",
          "title": "The incident is confidential. What can you submit?",
          "points": [
            "Distinguish a hash lookup from a public sample upload.",
            "Explain what a public report could disclose."
          ]
        }
      ]
    },
    {
      "id": "document-chain",
      "title": "Read the document’s execution story",
      "half": "theory",
      "outline": [
        "Inspect macro flags",
        "Decode commands",
        "State the limits"
      ],
      "beats": [
        {
          "id": "macro-flags",
          "sourceId": "olevba",
          "kind": "evidence",
          "title": "Two macro flags describe an execution path",
          "lines": [
            {
              "text": "AutoExec | AutoOpen",
              "note": "Runs on open when macros are enabled"
            },
            {
              "text": "Suspicious | Shell",
              "note": "Can launch a system command"
            },
            {
              "text": "Suspicious | Chr",
              "note": "May assemble strings at runtime"
            }
          ]
        },
        {
          "id": "macro-chain",
          "sourceId": "olevba",
          "kind": "flow",
          "title": "Follow the document into the next stage",
          "steps": [
            {
              "label": "Document opens",
              "note": "Macro execution depends on settings"
            },
            {
              "label": "Macro runs",
              "note": "Shell starts a command"
            },
            {
              "label": "PowerShell",
              "note": "Hidden or encoded arguments"
            },
            {
              "label": "Download",
              "note": "A second-stage file is requested"
            }
          ]
        },
        {
          "id": "decode-command",
          "sourceId": "olevba",
          "kind": "activity",
          "title": "Decode before describing the command",
          "points": [
            "Preserve the encoded form.",
            "Record the decoded form beside it.",
            "Extract the URL and map the observed behaviour."
          ]
        },
        {
          "id": "static-limits",
          "sourceId": "olevba",
          "kind": "compare",
          "title": "A file’s capabilities do not prove host execution",
          "columns": [
            {
              "label": "Static evidence",
              "points": [
                "Macro can launch commands",
                "A download URL is present",
                "Obfuscation limits extraction"
              ]
            },
            {
              "label": "Still unknown",
              "points": [
                "Did the download succeed?",
                "What does the next-stage file do?",
                "Which hosts executed the chain?"
              ]
            }
          ]
        },
        {
          "id": "document-check",
          "sourceId": "check",
          "kind": "question",
          "title": "A file says PDF; its header says PE. What now?",
          "points": [
            "Describe the format mismatch.",
            "State one finding you can make before a sandbox run."
          ]
        }
      ]
    },
    {
      "id": "sandbox-pivot",
      "title": "Expand from behaviour to infrastructure",
      "half": "theory",
      "outline": [
        "Read the process tree",
        "Inspect persistence",
        "Validate pivot leads"
      ],
      "beats": [
        {
          "id": "sandbox-order",
          "sourceId": "sandbox",
          "kind": "flow",
          "title": "Read a sandbox report in priority order",
          "steps": [
            {
              "label": "Process tree",
              "note": "Execution chain"
            },
            {
              "label": "Network",
              "note": "Destinations and domains"
            },
            {
              "label": "Dropped files",
              "note": "Paths and hashes"
            },
            {
              "label": "Persistence",
              "note": "What survives reboot"
            },
            {
              "label": "Mapping",
              "note": "Behaviours for detection engineering"
            }
          ]
        },
        {
          "id": "sandbox-limits",
          "sourceId": "sandbox",
          "kind": "bullets",
          "title": "A quiet sandbox run may be incomplete",
          "points": [
            "Some documents require a user interaction.",
            "Anti-analysis checks can suppress behaviour.",
            "Compare runtime findings with static clues."
          ]
        },
        {
          "id": "pivot-paths",
          "sourceId": "pivot",
          "kind": "flow",
          "title": "One destination opens several investigation paths",
          "steps": [
            {
              "label": "Address",
              "note": "Historical domains and related samples"
            },
            {
              "label": "Domain",
              "note": "Registration and resolution history"
            },
            {
              "label": "Certificate",
              "note": "Other names sharing the certificate"
            },
            {
              "label": "Validation",
              "note": "Assess each candidate before action"
            }
          ]
        },
        {
          "id": "pivot-validation",
          "sourceId": "pivot",
          "kind": "compare",
          "title": "A shared certificate is a lead",
          "columns": [
            {
              "label": "Supports a campaign link",
              "points": [
                "Related sample behaviour",
                "Consistent resolution history",
                "Clustered registration dates"
              ]
            },
            {
              "label": "Needs more validation",
              "points": [
                "Shared hosting",
                "Wildcard certificates",
                "Established legitimate service"
              ]
            }
          ]
        },
        {
          "id": "theory-close",
          "sourceId": "theory-recap",
          "kind": "recap",
          "title": "Send useful intelligence while analysis continues",
          "points": [
            "Verify the true file type.",
            "Extract indicators before execution when possible.",
            "Validate infrastructure before recommending a block."
          ]
        }
      ]
    },
    {
      "id": "workshop",
      "title": "Workshop: interpret the supplied analysis",
      "half": "practical",
      "outline": [
        "Prepare the synthetic pack",
        "Complete static and macro analysis",
        "Read runtime evidence"
      ],
      "beats": [
        {
          "id": "workshop-start",
          "sourceId": "brief",
          "kind": "activity",
          "title": "The exercise distributes output, not live malware",
          "points": [
            "Download the sample pack and report template.",
            "Read which tool produced each section.",
            "Do not visit addresses in the pack."
          ]
        },
        {
          "id": "task-static",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T1 · Make the static triage record",
          "points": [
            "Record true type, hashes and format mismatch.",
            "Interpret the reputation result in context.",
            "Extract addresses, paths and registry indicators."
          ]
        },
        {
          "id": "task-macro",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T2 · Explain the document’s macro behaviour",
          "points": [
            "Interpret each flagged keyword.",
            "Decode all supplied encoded commands.",
            "Record indicators and ATT&CK mappings."
          ]
        },
        {
          "id": "task-behaviour",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T3 · Reconstruct the execution chain",
          "points": [
            "Read processes, network, dropped files and persistence.",
            "Capture paths and separate payload hashes.",
            "Explain what runtime evidence adds to static analysis."
          ]
        },
        {
          "id": "task-pivot",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T4 · Validate every infrastructure candidate",
          "points": [
            "Use both address and domain enrichment.",
            "Record history and legitimate-service context.",
            "Assign confidence with a reason for each entry."
          ]
        }
      ]
    },
    {
      "id": "deliver-intelligence",
      "title": "Turn analysis into decisions",
      "half": "practical",
      "outline": [
        "Write for three audiences",
        "Package indicators",
        "Review the earliest detection"
      ],
      "beats": [
        {
          "id": "task-report",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T5 · Complete the seven-section report",
          "points": [
            "Write a plain-language executive summary.",
            "Keep findings linked to supporting evidence.",
            "Recommend detection at each attack stage."
          ]
        },
        {
          "id": "report-audiences",
          "sourceId": "deliverables",
          "kind": "compare",
          "title": "Different teams need different outputs",
          "columns": [
            {
              "label": "Response",
              "points": [
                "Validated IOC list",
                "Persistence locations"
              ]
            },
            {
              "label": "Detection",
              "points": [
                "Observed behaviour",
                "Data source and rule condition"
              ]
            },
            {
              "label": "Leadership",
              "points": [
                "What happened",
                "Impact and recommended action"
              ]
            }
          ]
        },
        {
          "id": "submission",
          "sourceId": "deliverables",
          "kind": "activity",
          "title": "Submit an investigation others can act on",
          "points": [
            "Static, macro and behavioural analysis records.",
            "Validated infrastructure list and distributable indicators.",
            "Seven-section report and five stage-specific detection rules."
          ]
        },
        {
          "id": "debrief",
          "sourceId": "debrief",
          "kind": "question",
          "title": "Which answer arrived first, and who could use it?",
          "points": [
            "Compare static and sandbox findings.",
            "Explain one pivot candidate you would withhold from blocking."
          ]
        },
        {
          "id": "closing",
          "sourceId": "recap",
          "kind": "recap",
          "title": "Triage cheaply, describe precisely, validate before blocking",
          "points": [
            "The true format comes from the file itself.",
            "Behaviour explains what the sample can do.",
            "Pivoting expands the defensive value of one investigation."
          ],
          "takeaway": "The core track closes with intelligence that response teams can use."
        }
      ]
    }
  ]
}
