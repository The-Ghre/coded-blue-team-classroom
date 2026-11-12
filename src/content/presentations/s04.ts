import type { PresentationPlan } from './types'

export const presentation04: PresentationPlan = {
  "slug": "detection-engineering",
  "title": "Build detections people can trust",
  "throughline": "What turns a rule on paper into a detection that works?",
  "chapters": [
    {
      "id": "purpose",
      "title": "Start with the missed attack",
      "half": "theory",
      "outline": [
        "Recall the signal",
        "Read the attack path",
        "Define a useful rule"
      ],
      "beats": [
        {
          "id": "recall",
          "sourceId": "retrieval",
          "kind": "question",
          "title": "When does alert volume become a vulnerability?",
          "takeaway": "Recall two limitations of your Office-to-shell query."
        },
        {
          "id": "six-gaps",
          "sourceId": "scenario",
          "kind": "bullets",
          "title": "Six techniques. Zero detections.",
          "points": [
            "23 hosts reached",
            "14 days of lateral movement",
            "Six techniques went undetected"
          ],
          "takeaway": "Which part of the attack path would you cover first?"
        },
        {
          "id": "rule-parts",
          "sourceId": "anatomy",
          "kind": "flow",
          "title": "A rule needs three ingredients",
          "steps": [
            {
              "label": "Data source",
              "note": "Which events can you see?"
            },
            {
              "label": "Conditions",
              "note": "Which activity matters?"
            },
            {
              "label": "Threshold",
              "note": "How many, within what window?"
            }
          ],
          "takeaway": "Document why the rule exists."
        },
        {
          "id": "rule-review",
          "sourceId": "anatomy",
          "kind": "bullets",
          "title": "Review the rule before trusting it",
          "points": [
            "Does it catch the attack?",
            "What legitimate activity also matches?",
            "Is the reasoning documented?",
            "Which technique does it cover?"
          ]
        },
        {
          "id": "two-layers",
          "sourceId": "sig-vs-behav",
          "kind": "compare",
          "title": "Layer signatures and behaviour",
          "columns": [
            {
              "label": "Signature",
              "points": [
                "Matches a known hash or string",
                "Fast to build",
                "A changed variant may evade it"
              ]
            },
            {
              "label": "Behaviour",
              "points": [
                "Matches an activity pattern",
                "Needs environmental tuning",
                "Can outlast a particular tool"
              ]
            }
          ],
          "takeaway": "Choose the layer for the detection goal."
        }
      ]
    },
    {
      "id": "correlate",
      "title": "Join the right events",
      "half": "theory",
      "outline": [
        "Count activity",
        "Follow sequences",
        "Check visibility"
      ],
      "beats": [
        {
          "id": "count-patterns",
          "sourceId": "correlation",
          "kind": "compare",
          "title": "Counting events is not one pattern",
          "columns": [
            {
              "label": "Threshold",
              "points": [
                "Count events in a time window",
                "Example: repeated failed logons"
              ]
            },
            {
              "label": "Aggregation",
              "points": [
                "Count across many targets",
                "Example: one source, many accounts"
              ]
            }
          ],
          "takeaway": "Choose the grouping before choosing the number."
        },
        {
          "id": "time-patterns",
          "sourceId": "correlation",
          "kind": "compare",
          "title": "Order and baseline answer different questions",
          "columns": [
            {
              "label": "Sequence",
              "points": [
                "Event A, then event B",
                "Example: account created, then used"
              ]
            },
            {
              "label": "Anomaly",
              "points": [
                "Unusual for this entity",
                "Example: an unfamiliar logon location"
              ]
            }
          ],
          "takeaway": "Write down the time window or baseline assumption."
        },
        {
          "id": "multi-source",
          "sourceId": "correlation",
          "kind": "flow",
          "title": "Follow one host across independent sources",
          "steps": [
            {
              "label": "Email",
              "note": "Message delivered"
            },
            {
              "label": "Proxy",
              "note": "Link visited"
            },
            {
              "label": "Endpoint",
              "note": "PowerShell starts"
            },
            {
              "label": "Network",
              "note": "Outbound connection"
            }
          ],
          "takeaway": "A missing source can break the whole correlation."
        },
        {
          "id": "correlation-limits",
          "sourceId": "correlation",
          "kind": "bullets",
          "title": "A silent rule may be blind",
          "points": [
            "Check every required source is forwarding",
            "Confirm timestamps and fields align",
            "Test activity outside the time window"
          ]
        }
      ]
    },
    {
      "id": "tune",
      "title": "Tune without losing the attack",
      "half": "theory",
      "outline": [
        "Measure both sides",
        "Test an exclusion",
        "Recheck the trade"
      ],
      "beats": [
        {
          "id": "metrics",
          "sourceId": "builder",
          "kind": "compare",
          "title": "Precision and recall measure different losses",
          "columns": [
            {
              "label": "Precision",
              "points": [
                "Of fired alerts, how many are real?",
                "Protects analyst attention"
              ]
            },
            {
              "label": "Recall",
              "points": [
                "Of real attacks, how many are caught?",
                "Protects detection value"
              ]
            }
          ],
          "takeaway": "A quiet queue can still miss the attack."
        },
        {
          "id": "builder-demo",
          "sourceId": "builder",
          "kind": "activity",
          "title": "Predict before changing the rule",
          "points": [
            "Select one additional condition",
            "Predict false positives and missed attacks",
            "Run the labelled corpus",
            "Compare the result with your prediction"
          ],
          "takeaway": "Open the rule builder for the live demonstration."
        },
        {
          "id": "exclusion",
          "sourceId": "builder",
          "kind": "compare",
          "title": "Make the exclusion match the verified context",
          "columns": [
            {
              "label": "Too broad",
              "points": [
                "Exclude an entire account",
                "Compromise inherits the blind spot"
              ]
            },
            {
              "label": "Narrower",
              "points": [
                "Verified account and host group",
                "Document the legitimate activity"
              ]
            }
          ],
          "takeaway": "Every exclusion is an explicit coverage trade."
        },
        {
          "id": "tuning-loop",
          "sourceId": "builder",
          "kind": "flow",
          "title": "Tune, observe, then retest",
          "steps": [
            {
              "label": "Observe",
              "note": "Review analyst dispositions"
            },
            {
              "label": "Explain",
              "note": "Verify legitimate activity"
            },
            {
              "label": "Constrain",
              "note": "Add a narrow exclusion"
            },
            {
              "label": "Retest",
              "note": "Known attacks and normal traffic"
            }
          ],
          "takeaway": "Keep the technique covered as noise falls."
        }
      ]
    },
    {
      "id": "sigma",
      "title": "Make the rule portable",
      "half": "theory",
      "outline": [
        "Read the structure",
        "Verify the schema",
        "Document its limits"
      ],
      "beats": [
        {
          "id": "sigma-excerpt",
          "sourceId": "sigma",
          "kind": "evidence",
          "title": "Sigma separates source from selection",
          "lines": [
            {
              "text": "logsource:",
              "note": "Declare the available telemetry"
            },
            {
              "text": "  category: process_creation",
              "note": "Process creation events"
            },
            {
              "text": "  product: windows",
              "note": "Windows field assumptions"
            },
            {
              "text": "detection:",
              "note": "Named selections and condition"
            }
          ],
          "takeaway": "Focused excerpt; inspect the complete rule in Study."
        },
        {
          "id": "sigma-logic",
          "sourceId": "sigma",
          "kind": "flow",
          "title": "Combine selections, then constrain the exception",
          "steps": [
            {
              "label": "Parent",
              "note": "Office application"
            },
            {
              "label": "Child",
              "note": "Shell or script interpreter"
            },
            {
              "label": "Filter",
              "note": "Verified licensing activity"
            },
            {
              "label": "Condition",
              "note": "Parent AND child AND NOT filter"
            }
          ],
          "takeaway": "The filter combines account, parent and script context."
        },
        {
          "id": "sigma-docs",
          "sourceId": "sigma",
          "kind": "bullets",
          "title": "Write for the receiving analyst",
          "points": [
            "Give the rule a stable ID",
            "Name the technique and data source",
            "Document plausible false positives",
            "Set maturity honestly"
          ]
        },
        {
          "id": "conversion",
          "sourceId": "sigma",
          "kind": "compare",
          "title": "Conversion changes syntax, not your data",
          "columns": [
            {
              "label": "Portable rule",
              "points": [
                "Sigma describes the logic",
                "A backend emits SIEM syntax"
              ]
            },
            {
              "label": "Local validation",
              "points": [
                "Check actual field names",
                "Verify command-line logging exists"
              ]
            }
          ],
          "takeaway": "A valid query returning zero is not proof of safety."
        },
        {
          "id": "silent-query",
          "sourceId": "check",
          "kind": "question",
          "title": "The converted rule returns zero results. Why?",
          "takeaway": "Name a test that separates no attack from no visibility."
        }
      ]
    },
    {
      "id": "coverage",
      "title": "Find the gap behind the green",
      "half": "theory",
      "outline": [
        "Inspect the map",
        "Audit the sources",
        "Test the technique"
      ],
      "beats": [
        {
          "id": "green",
          "sourceId": "coverage",
          "kind": "compare",
          "title": "A green square records intent",
          "columns": [
            {
              "label": "Rule exists",
              "points": [
                "The technique has a rule",
                "The map can show coverage"
              ]
            },
            {
              "label": "Detection works",
              "points": [
                "Required logs arrive",
                "A test produces the expected alert"
              ]
            }
          ],
          "takeaway": "Verify capability beyond the coverage map."
        },
        {
          "id": "four-methods",
          "sourceId": "coverage",
          "kind": "bullets",
          "title": "Use four views of the gap",
          "points": [
            "Heatmap: what has no rule?",
            "Threat intelligence: which gaps matter here?",
            "Log audit: what cannot fire?",
            "Purple team: what actually fired?"
          ]
        },
        {
          "id": "map-demo",
          "sourceId": "coverage",
          "kind": "activity",
          "title": "Challenge one green square",
          "points": [
            "Select a covered technique",
            "Identify its required data source",
            "Explain how you would verify it"
          ],
          "takeaway": "Open the coverage map for guided analysis."
        },
        {
          "id": "gap-types",
          "sourceId": "coverage",
          "kind": "compare",
          "title": "Route different gaps to different work",
          "columns": [
            {
              "label": "Rule gap",
              "points": [
                "The source is available",
                "Build and validate detection logic"
              ]
            },
            {
              "label": "Log source gap",
              "points": [
                "Required telemetry is missing",
                "Fix collection before rule development"
              ]
            }
          ],
          "takeaway": "Rank threat relevance, data availability and business impact together."
        },
        {
          "id": "pre-workshop",
          "sourceId": "theory-recap",
          "kind": "recap",
          "title": "A rule is still a hypothesis until tested",
          "points": [
            "Validate known attack data",
            "Measure legitimate production noise",
            "Record exclusions and limitations"
          ]
        }
      ]
    },
    {
      "id": "rebuild",
      "title": "Workshop: rebuild the library",
      "half": "practical",
      "outline": [
        "Map and prioritise",
        "Write three rules",
        "Defend the validation plan"
      ],
      "beats": [
        {
          "id": "workshop-start",
          "sourceId": "brief",
          "kind": "activity",
          "title": "Your deliverable is an engineering decision",
          "points": [
            "Read the rebuild pack and source audit",
            "Create a rules folder",
            "Use the Sigma template",
            "Adapt community rules with explanation"
          ]
        },
        {
          "id": "work-order",
          "sourceId": "tasks",
          "kind": "flow",
          "title": "Audit before writing",
          "steps": [
            {
              "label": "Map",
              "note": "Tag inventory and incident techniques"
            },
            {
              "label": "Audit",
              "note": "Identify false greens"
            },
            {
              "label": "Rank",
              "note": "Justify the backlog"
            },
            {
              "label": "Build",
              "note": "Write three supported Sigma rules"
            }
          ],
          "takeaway": "Separate logging projects from rules you can build now."
        },
        {
          "id": "rule-checklist",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "Three rules, each ready for review",
          "points": [
            "Include source, selection and condition",
            "Use honest status and technique tags",
            "Document genuine false positives",
            "Make at least one exclusion narrow"
          ]
        },
        {
          "id": "validation-plan",
          "sourceId": "tasks",
          "kind": "compare",
          "title": "Prove both detection and usability",
          "columns": [
            {
              "label": "Attack test",
              "points": [
                "Name known-bad data or simulation",
                "State the expected alert"
              ]
            },
            {
              "label": "Noise test",
              "points": [
                "Name normal production data",
                "Measure the false positive rate"
              ]
            }
          ],
          "takeaway": "These are plans; the workshop does not deploy live rules."
        },
        {
          "id": "submission",
          "sourceId": "deliverables",
          "kind": "activity",
          "title": "Hand over the whole decision",
          "points": [
            "Coverage map and justified backlog",
            "Three rules with documented exclusions",
            "Validation plans for each rule",
            "Three-sentence executive summary"
          ]
        },
        {
          "id": "debrief",
          "sourceId": "debrief",
          "kind": "question",
          "title": "Where would the returning attacker first be detected?",
          "takeaway": "Defend the rule, its data source and the point in the attack path."
        },
        {
          "id": "close",
          "sourceId": "recap",
          "kind": "recap",
          "title": "Build early warning, then keep testing it",
          "points": [
            "Layer signatures and behaviours",
            "Keep the queue worth reading",
            "Audit sources behind green coverage",
            "Retest when rules or environments change"
          ]
        }
      ]
    }
  ]
}
