import type { PresentationPlan } from './types'

export const presentation10: PresentationPlan = {
  "slug": "active-directory-security",
  "title": "Detect the Path. Recover the Domain.",
  "throughline": "Follow identity abuse into domain compromise, then plan a recovery that removes the routes back.",
  "chapters": [
    {
      "id": "domain-scope",
      "title": "Understand what domain compromise changes",
      "half": "theory",
      "outline": [
        "Recall authentication evidence",
        "Read the replication alert",
        "Define the scope question"
      ],
      "beats": [
        {
          "id": "recall",
          "sourceId": "retrieval",
          "kind": "question",
          "title": "What does a network logon tell you?",
          "points": [
            "Recall Event ID 4624 and LogonType 3.",
            "What must be checked before trusting a clean DCSync hunt?"
          ]
        },
        {
          "id": "opening",
          "sourceId": "scenario",
          "kind": "bullets",
          "title": "A workstation invokes directory replication rights",
          "points": [
            "The source is not a domain controller.",
            "The alert changes the credential-compromise scope.",
            "A user password reset alone may be insufficient."
          ]
        },
        {
          "id": "opening-question",
          "sourceId": "scenario",
          "kind": "question",
          "title": "Why might the attacker survive a password reset?",
          "points": [
            "Distinguish user credentials from ticket-signing keys.",
            "Name evidence you still need to investigate."
          ]
        },
        {
          "id": "kerberos-path",
          "sourceId": "kerberos",
          "kind": "flow",
          "title": "Kerberos has two ticket stages",
          "steps": [
            {
              "label": "Logon",
              "note": "The KDC issues a TGT"
            },
            {
              "label": "Service request",
              "note": "The client requests a service ticket"
            },
            {
              "label": "Service access",
              "note": "The target accepts the ticket"
            }
          ]
        },
        {
          "id": "forged-tickets",
          "sourceId": "kerberos",
          "kind": "compare",
          "title": "Forged tickets target different trust boundaries",
          "columns": [
            {
              "label": "Golden Ticket",
              "points": [
                "Uses the KRBTGT key",
                "Forges a ticket-granting ticket",
                "Can impersonate domain identities"
              ]
            },
            {
              "label": "Silver Ticket",
              "points": [
                "Uses a service account key",
                "Forges a service ticket",
                "May bypass a KDC request event"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "authentication-signals",
      "title": "Read combinations, not isolated fields",
      "half": "theory",
      "outline": [
        "Roasting indicators",
        "Pass-the-Hash context",
        "Cross-host correlation"
      ],
      "beats": [
        {
          "id": "roasting-fields",
          "sourceId": "kerberos",
          "kind": "evidence",
          "title": "Read the fields that distinguish two roasting leads",
          "lines": [
            {
              "text": "4769  TicketEncryptionType=0x17",
              "note": "RC4 service ticket: check account and policy"
            },
            {
              "text": "4768  PreAuthType=0",
              "note": "Check accounts without pre-authentication"
            }
          ]
        },
        {
          "id": "kerberos-controls",
          "sourceId": "kerberos",
          "kind": "bullets",
          "title": "Reduce the opportunity as well as detecting it",
          "points": [
            "Prefer AES where supported by service accounts.",
            "Use managed service accounts where appropriate.",
            "Audit accounts with pre-authentication disabled."
          ]
        },
        {
          "id": "pth-combination",
          "sourceId": "pth",
          "kind": "flow",
          "title": "Pass-the-Hash suspicion comes from a combination",
          "steps": [
            {
              "label": "4624",
              "note": "Successful authentication"
            },
            {
              "label": "Type 3",
              "note": "Network logon"
            },
            {
              "label": "NTLM",
              "note": "Authentication package"
            },
            {
              "label": "Source context",
              "note": "Unexpected host or account use"
            }
          ]
        },
        {
          "id": "privileged-ntlm",
          "sourceId": "pth",
          "kind": "bullets",
          "title": "Give privileged NTLM activity immediate attention",
          "points": [
            "Identify the account’s privileges.",
            "Check whether the source and workflow are expected.",
            "Correlate destinations and timing before labelling the technique."
          ]
        },
        {
          "id": "silver-ticket",
          "sourceId": "kerberos",
          "kind": "question",
          "title": "What can one machine’s logs miss?",
          "points": [
            "Consider target authentication without a matching KDC request.",
            "Which two hosts would you need to compare?"
          ]
        }
      ]
    },
    {
      "id": "privilege-path",
      "title": "Follow the path from account to domain control",
      "half": "theory",
      "outline": [
        "ACL relationships",
        "Group membership changes",
        "Replication evidence"
      ],
      "beats": [
        {
          "id": "acl-path",
          "sourceId": "escalation",
          "kind": "flow",
          "title": "Permissions can form an escalation path",
          "steps": [
            {
              "label": "Account",
              "note": "A principal holds delegated rights"
            },
            {
              "label": "Object",
              "note": "The rights permit a security change"
            },
            {
              "label": "Privilege",
              "note": "The change grants stronger access"
            },
            {
              "label": "Audit",
              "note": "Map and remove unnecessary paths"
            }
          ]
        },
        {
          "id": "directory-events",
          "sourceId": "escalation",
          "kind": "bullets",
          "title": "Watch changes to privileged relationships",
          "points": [
            "Review privileged group membership changes.",
            "Monitor directory object modifications such as Event ID 5136.",
            "Inspect AdminSDHolder, sensitive ACLs and GPO objects."
          ]
        },
        {
          "id": "domain-chain-a",
          "sourceId": "demo",
          "kind": "evidence",
          "title": "Follow one account across the event sequence",
          "lines": [
            {
              "text": "03:00  4624  NTLM  svc_backup",
              "note": "Synthetic unexpected workstation source"
            },
            {
              "text": "03:04  4624  NTLM  svc_backup",
              "note": "A second server destination"
            },
            {
              "text": "03:08  4624  NTLM  svc_backup",
              "note": "Now including a domain controller"
            }
          ]
        },
        {
          "id": "domain-chain-b",
          "sourceId": "demo",
          "kind": "evidence",
          "title": "The same account gains privilege, then replicates",
          "lines": [
            {
              "text": "03:12  4769  EncryptionType=0x17",
              "note": "Investigate service and account context"
            },
            {
              "text": "03:18  4728  Added to Domain Admins",
              "note": "A recorded privilege change"
            },
            {
              "text": "03:22  4662  Replication rights",
              "note": "Validate the non-DC source"
            }
          ]
        },
        {
          "id": "chain-limits",
          "sourceId": "demo",
          "kind": "compare",
          "title": "Separate observed actions from remaining questions",
          "columns": [
            {
              "label": "Observed sequence",
              "points": [
                "Unexpected NTLM logons",
                "Privileged group addition",
                "Replication rights from a workstation"
              ]
            },
            {
              "label": "Still investigate",
              "points": [
                "Original credential access",
                "Other compromised hosts",
                "Additional persistence mechanisms"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "persistence-recovery",
      "title": "Recover trust, not just passwords",
      "half": "theory",
      "outline": [
        "Persistence beyond credentials",
        "KRBTGT key history",
        "Verified recovery sequence"
      ],
      "beats": [
        {
          "id": "persistence-types",
          "sourceId": "persistence",
          "kind": "compare",
          "title": "Different backdoors need different removal actions",
          "columns": [
            {
              "label": "Credential and ticket abuse",
              "points": [
                "Forged tickets",
                "Compromised accounts",
                "KRBTGT key exposure"
              ]
            },
            {
              "label": "Configuration and host changes",
              "points": [
                "SID History or ACL changes",
                "Malicious GPOs and tasks",
                "DC process or DSRM changes"
              ]
            }
          ]
        },
        {
          "id": "persistence-events",
          "sourceId": "persistence",
          "kind": "bullets",
          "title": "Review rare changes with administrative context",
          "points": [
            "4794: DSRM password change.",
            "4765: SID History added.",
            "5136: directory object modification."
          ]
        },
        {
          "id": "key-history",
          "sourceId": "krbtgt",
          "kind": "flow",
          "title": "One reset retains a previous signing key",
          "steps": [
            {
              "label": "Before reset",
              "note": "Current and previous keys exist"
            },
            {
              "label": "First reset",
              "note": "Old current becomes previous"
            },
            {
              "label": "Second reset",
              "note": "The compromised key leaves retained history"
            }
          ]
        },
        {
          "id": "verified-reset",
          "sourceId": "krbtgt",
          "kind": "bullets",
          "title": "The double reset is a coordinated recovery procedure",
          "points": [
            "Check domain controller health and replication.",
            "Use the current Microsoft procedure with the AD team.",
            "Verify replication between resets and after completion.",
            "Coordinate timing and authentication impact."
          ]
        },
        {
          "id": "recovery-check",
          "sourceId": "check",
          "kind": "question",
          "title": "What would a password reset leave behind?",
          "points": [
            "Choose one persistence mechanism.",
            "Name the separate verification needed to remove it."
          ]
        }
      ]
    },
    {
      "id": "workshop",
      "title": "Workshop: investigate before writing the recovery plan",
      "half": "practical",
      "outline": [
        "Prepare the incident pack",
        "Trace the chain backwards",
        "Inventory persistence"
      ],
      "beats": [
        {
          "id": "workshop-start",
          "sourceId": "brief",
          "kind": "activity",
          "title": "Plan the recovery; do not change a live domain",
          "points": [
            "Download the synthetic incident pack and recovery template.",
            "Read the current detection inventory.",
            "Reconstruct evidence before proposing remediation."
          ]
        },
        {
          "id": "task-scope",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T1 · Confirm the replication finding and scope",
          "points": [
            "Verify auditing and replication permission events.",
            "Validate the source host’s role and account.",
            "State the credential scope and supporting evidence."
          ]
        },
        {
          "id": "task-chain",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T2 · Trace the escalation chain backwards",
          "points": [
            "Follow the account’s authentication events.",
            "Record privilege changes and ticket requests.",
            "Investigate the earlier source workstation for credential access."
          ]
        },
        {
          "id": "task-persistence",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T3 · Inventory every persistence mechanism",
          "points": [
            "Review DC tasks, group changes and policy objects.",
            "Inspect relevant directory modification events.",
            "Mark whether each mechanism survives a password reset."
          ]
        },
        {
          "id": "task-recovery",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T4 · Sequence actions and verification",
          "points": [
            "Name every compromised host and persistence location.",
            "Show dependencies before credential recovery.",
            "Include coordinated KRBTGT recovery and verification."
          ]
        }
      ]
    },
    {
      "id": "defensible-recovery",
      "title": "Make the plan executable and reviewable",
      "half": "practical",
      "outline": [
        "Rank detection gaps",
        "Submit the recovery evidence",
        "Close the defensive track"
      ],
      "beats": [
        {
          "id": "task-gaps",
          "sourceId": "tasks",
          "kind": "activity",
          "title": "T5 · Rank the missed detection opportunities",
          "points": [
            "Compare each chain stage with the rule inventory.",
            "Order gaps by how much earlier they could detect.",
            "Specify one rule’s data source and condition."
          ]
        },
        {
          "id": "submission",
          "sourceId": "deliverables",
          "kind": "activity",
          "title": "Submit a recovery plan with an evidence trail",
          "points": [
            "Confirmed scope and a timed escalation chain.",
            "Credential origin and persistence inventory.",
            "Sequenced recovery with dependencies and verification.",
            "Detection gaps ordered by lead time."
          ]
        },
        {
          "id": "review-bar",
          "sourceId": "assessment",
          "kind": "bullets",
          "title": "A recovery step needs a named success check",
          "points": [
            "Check the plan covers every compromised host.",
            "Name persistence by mechanism and location.",
            "Make verification specific enough for the AD team to perform."
          ]
        },
        {
          "id": "debrief",
          "sourceId": "debrief",
          "kind": "question",
          "title": "Could another team follow your plan at 04:00?",
          "points": [
            "Which omitted mechanism would bring the attacker back?",
            "Which detection would change the first ten minutes?"
          ]
        },
        {
          "id": "closing",
          "sourceId": "recap",
          "kind": "recap",
          "title": "Connect identity evidence to verified recovery",
          "points": [
            "Read authentication combinations and source context.",
            "Audit the permissions that create escalation paths.",
            "Search for persistence beyond password-based access.",
            "Coordinate recovery and verify each dependency."
          ],
          "takeaway": "The defensive track ends with a plan whose success can be checked."
        }
      ]
    }
  ]
}
