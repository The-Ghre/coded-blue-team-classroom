import type { Session } from '@/types/content'

const FILE = 'defensive_day_3_phishing_investigation_esl.md'

export const session03: Session = {
  number: 3,
  slug: 'phishing-investigation',
  title: 'Phishing Investigation',
  summary:
    'A user reports a suspicious email. You have thirty minutes to find out who else got it, who clicked, and who typed their password.',
  abstract:
    'More than ninety per cent of breaches begin with email. This session teaches the investigation you will run more often than any other: reading headers for the routing truth the From field hides, interpreting SPF, DKIM and DMARC results without over-trusting them, analysing attachments and URLs without detonating them on your own machine, and assessing user impact in the order that minimises damage. The practical is a complete phishing investigation against the clock.',
  track: 'core',
  themes: ['Headers', 'Authentication', 'Blast radius'],
  prerequisites: [
    'Session 1 — triage decisions and escalation',
    'Session 2 — reading Sysmon process chains, which is how attachment execution is confirmed',
    'Basic DNS: what a TXT record is and what it means for a domain to resolve',
  ],
  outcomes: [
    'Extract the true origin of an email from its Received chain and Return-Path, independent of the From display',
    'Interpret combined SPF, DKIM and DMARC results and explain why passing authentication does not mean an email is safe',
    'Analyse attachments and URLs safely using sandboxes and scanners, without executing anything locally',
    'Run a user impact assessment in the correct order and calibrate the response to the confirmed blast radius',
    'Pivot from a single indicator to related attacker infrastructure using passive DNS, WHOIS and certificate transparency',
    'Produce a phishing investigation report with an executive summary and an actionable IOC list',
  ],
  sourceFiles: [FILE],
  sourceNotes: [
    'The source file references Foundation Days 4, 5, 8 and 9 for DNS, session hijacking, password security and file analysis. Those files were not supplied; the specific assumptions are listed as prerequisites instead of being relied on silently.',
  ],

  theory: {
    minutes: 90,
    blocks: [
      {
        kind: 'title',
        id: 'open',
        title: 'Session 3',
        overline: 'Defensive Track · Session 03 of 10',
        lead:
          'You can patch software. You cannot patch the way a person decides under pressure.',
        provenance: 'source',
        sources: [{ file: FILE, section: '2. Introduction' }],
      },

      {
        kind: 'retrieval',
        id: 'retrieval',
        title: 'Recall from Sessions 1 and 2',
        minutes: 6,
        recallPrompt: 'From memory first.',
        questions: [
          'In Session 2 you reconstructed an attack that began with a spreadsheet. What was the first Sysmon event that revealed it?',
          'Which two Sysmon Event IDs would confirm that someone opened a malicious attachment, and what does each prove?',
          'What does the "corroboration" criterion in false positive assessment require?',
          'Why does an alert with no follow-on events not mean nothing happened?',
        ],
        answers: [
          'Event ID 1 — process creation — showing EXCEL.EXE as the parent of powershell.exe. The parent-child relationship, not the command.',
          'Event ID 11 proves a file with the attachment\'s name was written to disk. Event ID 1 proves a process was created from it. The first shows arrival, the second shows execution.',
          'That the same finding is supported by two or more independent sources, so it survives one source being wrong, missing, or tampered with.',
          'Because absence of events and absence of telemetry look identical. Silence is a question, not an answer.',
        ],
        provenance: 'supplementary',
      },

      {
        kind: 'scenario',
        id: 'scenario',
        title: 'Opening scenario: the user who closed the tab',
        minutes: 4,
        synthetic: true,
        setting: 'Your SOC inbox, 11:20 on a Monday.',
        narrative: [
          'An email arrives from a member of staff: "I got a strange email from Microsoft Support saying my account will be deleted in 24 hours unless I verify my details. I clicked the link but then got suspicious and closed it. The page looked exactly like Microsoft. Should I be worried?"',
          'They have not said whether they typed anything. They have forwarded the email normally, which means the original headers are gone.',
          'There is a clock running that you cannot see: if credentials were submitted, the attacker may already be authenticating with them.',
        ],
        drivingQuestion:
          'What is the very first thing you do — and is it investigating the email, or something else entirely?',
        provenance: 'source',
        sources: [{ file: FILE, section: '7. Scenario Walkthrough: Microsoft Spoofing Campaign' }],
        detail: [
          'The answer that the session builds towards: the first action is not analysis. It is finding out whether credentials were submitted, because that determines whether you are investigating an event or racing one. The source material is explicit — if someone submitted credentials, reset them first and investigate second.',
        ],
      },

      {
        kind: 'objectives',
        id: 'objectives',
        title: 'What you will be able to do',
        minutes: 3,
        provenance: 'supplementary',
        objectives: [
          { verb: 'Extract', text: 'the true origin of an email from its Received chain and Return-Path' },
          { verb: 'Interpret', text: 'combined SPF, DKIM and DMARC results, and their limits' },
          { verb: 'Analyse', text: 'attachments and URLs safely, without local execution' },
          { verb: 'Assess', text: 'user impact in the order that minimises damage' },
          { verb: 'Pivot', text: 'from one indicator to related attacker infrastructure' },
          { verb: 'Produce', text: 'an investigation report with an actionable IOC list' },
        ],
      },

      {
        kind: 'concept',
        id: 'lifecycle',
        title: 'How a phishing campaign is actually built',
        minutes: 5,
        lead:
          'Investigating phishing is easier when you know how it was assembled. Each stage leaves different evidence, and some stages leave none at all.',
        points: [
          'Reconnaissance — names, roles and the email format are harvested from public sources. Essentially undetectable by the target.',
          'Infrastructure — a lookalike domain is registered and a mail server configured. Detectable through certificate transparency and brand monitoring, before any email is sent.',
          'Weaponisation — the macro or the credential page is built. This happens entirely on the attacker\'s infrastructure; there is nothing to detect.',
          'Delivery — the email arrives. This is the first point where your controls can act.',
          'Exploitation — the link is clicked or the attachment opened. Proxy, DNS and endpoint telemetry.',
          'Objectives — credentials are used, malware is installed, or an invoice is redirected.',
        ],
        diagram: {
          type: 'ladder',
          alt: 'Six stages of a phishing campaign shown as a ladder. Reconnaissance and weaponisation happen on attacker infrastructure and offer no detection opportunity. Infrastructure setup can be detected through certificate transparency monitoring. Delivery, exploitation and objectives each offer progressively later but more definite detection opportunities, at progressively higher cost.',
          rungs: [
            { label: 'Reconnaissance', note: 'Public sources. No detection opportunity.', tone: 'attack' },
            { label: 'Infrastructure', note: 'Domain registered. Certificate transparency can warn you here — before any email is sent.', tone: 'hypothesis' },
            { label: 'Weaponisation', note: 'Attacker-side only. Nothing to see.', tone: 'attack' },
            { label: 'Delivery', note: 'Gateway: authentication results, attachment type, link age.', tone: 'observation' },
            { label: 'Exploitation', note: 'Proxy and DNS show the click. A POST shows the submission.', tone: 'confirmed' },
            { label: 'Objectives', note: 'Authentication logs show the stolen credential in use. Late and expensive.', tone: 'response' },
          ],
        },
        redView:
          'Infrastructure is deliberately disposable. Register today, campaign tomorrow, abandon in three days. Bulletproof hosting ignores abuse reports, and sending infrastructure rotates ahead of blocklists. At a 0.1% click rate on a hundred thousand recipients, the economics still work.',
        blueView:
          'Technical controls alone will not stop phishing. A reporting culture where users report immediately — including when they have already clicked, and especially then — is worth as much as any gateway setting. A user who is embarrassed and silent costs you the only early warning you had.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.1 The Phishing Attack Lifecycle' }],
        detail: [
          'Lookalike domain techniques from the source, worth being able to recognise on sight: typosquatting replaces a character with a similar one (micros0ft.com); combo-squatting appends trust words (paypal-secure-login.com); subdomain spoofing puts the real brand in front of a fake registrable domain (microsoft.com.verify-account.net); TLD variation changes the suffix (company.net for company.com); and homograph attacks substitute a Unicode character that renders identically (Cyrillic а in аpple.com).',
          'Subdomain spoofing is the one that fools technically competent people, because microsoft.com.verify-account.net genuinely contains microsoft.com. The registrable domain is the last two labels. Read domains right to left.',
        ],
      },

      {
        kind: 'concept',
        id: 'headers',
        title: 'The header is the only part of an email that is hard to fake',
        minutes: 6,
        lead:
          'The From field is cosmetic. Any client can display any name and address. The routing data underneath is the forensic record.',
        points: [
          'From — what the user sees. Freely forged. Never trust it alone.',
          'Reply-To — where replies actually go. A mismatch with From is a strong signal in business email compromise.',
          'Return-Path — where bounces go. Frequently exposes the true sending domain when From does not.',
          'Received — the routing trail, one entry per hop. Read it bottom to top: the bottom entry is the origin.',
          'Authentication-Results — the SPF, DKIM and DMARC verdicts as your gateway computed them.',
          'Message-ID — its format reveals the sending platform. An unusual format suggests a non-standard sending tool.',
        ],
        callout: {
          tone: 'warn',
          text: 'Ask users to forward suspicious emails as attachments, not as ordinary forwards. An ordinary forward strips the original headers and destroys the routing evidence. In Gmail: three dots → Forward as attachment. In Outlook: Forward as Attachment. This single procedural detail decides whether an investigation has data.',
        },
        redView:
          'The From field is display text. Crafting it to read "Microsoft Support <support@microsoft.com>" costs nothing and is what the user actually sees. Header analysis works precisely because it reads the data the user never sees.',
        blueView:
          'If your user reporting guidance does not say "forward as attachment", fix that before your next gateway tuning change. It is the cheapest investigative improvement available to a SOC.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.2 Email Header Analysis' }],
      },

      {
        kind: 'concept',
        id: 'spf',
        title: 'SPF, DKIM and DMARC — what they check, and what they do not',
        minutes: 6,
        lead:
          'Three mechanisms exist to fight spoofing. Understanding them matters most for understanding their limit, which analysts routinely overestimate.',
        points: [
          'SPF asks: was this sent from an address the domain owner authorised? The owner publishes a DNS TXT record listing permitted senders.',
          'DKIM asks: has the content been altered since it was signed? The sender signs with a private key; the receiver verifies with the public key in DNS.',
          'DMARC says what to do when either fails — p=none monitors, p=quarantine sends to spam, p=reject blocks.',
          'Both failing is a strong spoofing indicator. SPF passing with DKIM failing suggests alteration in transit.',
          'A domain publishing p=none has, in effect, announced that it will not enforce. Attackers check this before building a campaign.',
        ],
        callout: {
          tone: 'rule',
          text: 'An attacker who registers micros0ft-support247.com and configures SPF, DKIM and DMARC for it will pass every authentication check — because the checks verify the lookalike domain, which the attacker legitimately controls. Passing authentication is not a safety signal. The question is always which domain passed.',
        },
        redView:
          'Domains with no DMARC policy, or p=none, are preferred spoofing infrastructure, because failures are never blocked. Many organisations\' own older domains and subsidiary brands sit in exactly this state.',
        blueView:
          'Publishing DMARC p=reject on every domain you send from is one of the highest-value anti-phishing controls available — but note precisely what it protects: it stops others spoofing your domain against third parties. It does nothing against a lookalike domain aimed at you.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.3 SPF, DKIM & DMARC' }],
        detail: [
          'The combination table from the source: pass/pass/pass is a legitimate email passing all checks. Fail/fail is a strong spoofing indicator, investigate immediately. Pass/fail suggests content changed after sending. Fail/pass means it was sent from an unauthorised server even though the content is intact — suspicious. And any combination against a domain with p=none means no enforcement happened regardless of the result.',
          'This is the single most common analytical error in phishing triage: reading "SPF pass, DKIM pass, DMARC pass" and concluding the email is safe. The scenario in this session is built specifically to break that habit.',
        ],
      },

      {
        kind: 'evidence',
        id: 'demo',
        title: 'Instructor demonstration: reading a header',
        minutes: 11,
        synthetic: true,
        lead:
          'The header from the opening scenario, trimmed to the lines that carry the finding. Select each line.',
        caption: 'Synthetic email header, as returned by a header analyser',
        source: 'Fabricated for teaching. Structure follows RFC 5322 header conventions.',
        lines: [
          {
            text: 'From: Microsoft Support <support@microsoft.com>',
            note: {
              kind: 'observation',
              label: 'What the user saw, and nothing more',
              body: 'This is display text. It can say anything. It establishes what the user believed, which matters for understanding why they clicked, but it establishes nothing at all about origin.',
            },
          },
          {
            text: 'Reply-To: account-team@micros0ft-support247.com',
            note: {
              kind: 'confirmed',
              label: 'The mismatch',
              body: 'Replies would go to a different domain entirely. Read the domain carefully: micros0ft, with a zero. This is typosquatting plus combo-squatting in one string. A From/Reply-To mismatch across different registrable domains has very few innocent explanations.',
            },
          },
          {
            text: 'Return-Path: <bounce@micros0ft-support247.com>',
            note: {
              kind: 'confirmed',
              label: 'The true sending domain, corroborated',
              body: 'Bounces go to the lookalike domain, which means the sending infrastructure belongs to it. This is now the second independent header field pointing at the same domain. Two fields agreeing is corroboration.',
            },
          },
          {
            text: 'Received: from mail.ourcompany.com (10.0.0.25) by mx1.ourcompany.com; Mon, 11:02:41',
            note: {
              kind: 'observation',
              label: 'Top of the chain — your own infrastructure',
              body: 'The last hop, added by your own mail server. Working upwards through the file means working forwards in time. To find the origin you read downwards, to the bottom.',
            },
          },
          {
            text: 'Received: from smtp-relay-07.bulkmail-svc.net (198.51.100.77) by mail.ourcompany.com; Mon, 11:02:38',
            note: {
              kind: 'observation',
              label: 'An intermediate relay',
              body: 'A bulk mail service in the middle of the chain. Relays are not inherently suspicious — legitimate mail passes through them constantly. What matters is what sits below this line.',
            },
          },
          {
            text: 'Received: from [185.220.101.45] by smtp-relay-07.bulkmail-svc.net; Mon, 11:02:31',
            note: {
              kind: 'confirmed',
              label: 'The bottom entry is the origin',
              body: 'This is where the email entered the mail system. Note it is a bare address with no resolvable hostname — the relay could not identify the sender. This address is your first IOC and the starting point for every pivot you will run later.',
            },
          },
          {
            text: 'Authentication-Results: mx1.ourcompany.com; spf=pass (domain of micros0ft-support247.com designates 185.220.101.45 as permitted sender); dkim=pass header.d=micros0ft-support247.com; dmarc=pass',
            note: {
              kind: 'hypothesis',
              label: 'The line that fools people — read the domain, not the verdict',
              body: 'Three passes. Every check succeeded. And every one of them was evaluated against micros0ft-support247.com, which the attacker owns and has configured correctly. SPF confirms the attacker sent from their own authorised server. It is a true statement about an irrelevant domain. If you take one thing from this session, take this line.',
            },
          },
          {
            text: 'X-Originating-IP: [185.220.101.45]',
            note: {
              kind: 'confirmed',
              label: 'Third agreement',
              body: 'The same address as the bottom Received entry. Three independent header fields now agree on the origin. This is a confirmed finding, and the confidence comes from the agreement rather than from any single field.',
            },
          },
        ],
        proves: [
          'The email originated from 185.220.101.45 and was sent on behalf of micros0ft-support247.com',
          'The From display was forged to read microsoft.com while all routing points elsewhere',
          'All three authentication mechanisms passed — for the attacker-controlled lookalike domain',
        ],
        doesNotProve: [
          'That 185.220.101.45 belongs to the attacker rather than a compromised third party',
          'That anyone opened the email, clicked the link, or submitted anything',
          'That this was the only recipient — the header describes one delivery, not a campaign',
          'How old the lookalike domain is. That needs WHOIS, and domain age is one of your strongest quick signals.',
        ],
        provenance: 'source',
        sources: [
          { file: FILE, section: '4.2 Email Header Analysis' },
          { file: FILE, section: '7. Scenario Walkthrough: Microsoft Spoofing Campaign' },
        ],
        detail: [
          'Teach the Authentication-Results line slowly. Students have been told for two sessions that corroboration raises confidence, and here is a case where three passing checks raise confidence in the wrong proposition. The checks are working perfectly; the inference is the failure.',
        ],
      },

      {
        kind: 'concept',
        id: 'impact',
        title: 'Impact assessment, in the order that minimises damage',
        minutes: 6,
        lead:
          'Analysing the email tells you what it is. Impact assessment tells you what it did — and the order you ask the questions in matters more than the answers.',
        points: [
          'Who received it? Query the gateway by subject, sender domain or attachment hash. Never assume it was one person.',
          'Who opened it? Gateway open events, and tracking pixel loads visible as requests to the attacker domain in proxy logs.',
          'Who clicked? Proxy and DNS logs showing resolution of or connection to the phishing domain.',
          'Who submitted credentials? A POST request to the phishing URL in proxy logs. This is the question that changes everything.',
          'Who ran the attachment? Sysmon Event ID 11 then Event ID 1 — the file arrived, then a process was created from it.',
        ],
        callout: {
          tone: 'rule',
          text: 'If anyone submitted credentials, reset them before you finish investigating anything else. Every minute between submission and reset is a minute the attacker can authenticate, establish persistence, and register their own MFA device.',
        },
        redView:
          'Credential use is monitored in near real time by the attacker. A reset that happens minutes after submission may already be late — session cookies, API tokens and a registered MFA device all survive a password change.',
        blueView:
          'Calibrate the response to confirmed impact. Two submissions out of forty-seven recipients is a different incident from forty-seven recipients and no clicks. Treating every phishing report as critical exhausts the capacity you need for the one that is.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.6 User Impact Assessment' }],
        detail: [
          'Severity tiers from the source: delivered but unopened is Low — block the domain and purge the mailboxes. Opened but no click is Low to Medium — notify and monitor. Clicked but no submission is Medium — block the domain and review everyone who clicked. Credentials submitted is High — force an immediate reset and check for logins from new addresses. Attachment executed is Critical — isolate the host via EDR and activate incident response.',
          'The tiers exist to make calibration defensible rather than instinctive. "I treated this as High because credentials were confirmed submitted in proxy logs" is a position you can hold in a review; "it felt serious" is not.',
        ],
      },

      {
        kind: 'concept',
        id: 'pivot',
        title: 'Pivoting: one indicator becomes a campaign blocklist',
        minutes: 5,
        lead:
          'The domain you just blocked is one domain. The address it resolves to may host the three the attacker plans to use next week.',
        points: [
          'From the domain, find the address it resolves to. Then ask passive DNS what else has resolved there.',
          'From WHOIS, find registration date and registrant. Domains registered within 72 hours of a campaign that impersonate a known brand are almost always malicious.',
          'From the TLS certificate, search certificate transparency logs. Attackers frequently reuse one certificate across several campaign domains.',
          'From the hosting, find the ASN. Other known-malicious addresses in the same range are worth checking.',
          'Add everything you find to the IOC list and block it before it is used.',
        ],
        redView:
          'Sophisticated operators make pivoting hard on purpose: privacy-protected WHOIS, shared hosting where hundreds of unrelated sites share an address, and free instant certificates that generate no useful correlation. Understand the limits of pivoting, not just the technique.',
        blueView:
          'Even limited pivoting pays. Finding two or three additional domains before they are used is a real defensive win, and it costs ten minutes. Every investigation should pivot before it closes.',
        provenance: 'source',
        sources: [
          { file: FILE, section: '4.5 IOC Extraction & Enrichment' },
          { file: FILE, section: '4.7 Threat Actor Infrastructure & Pivoting' },
        ],
        detail: [
          'In the source scenario, pivoting on the origin address through passive DNS revealed three further domains: 0ffice365-verify.com, googIe-accounts-verify.net (a capital I substituted for the lowercase l) and dropbox-secure-login.com. All three were blocked proactively. Without the pivot, each would have arrived as a separate incident.',
          'A clean reputation result on brand-new infrastructure means nobody has seen it yet, not that it is safe. Enrichment tools report history, and fresh infrastructure has none by design.',
        ],
      },

      {
        kind: 'interaction',
        id: 'triage',
        title: 'Guided analysis: four reported emails',
        minutes: 12,
        component: 'triage-console',
        lead:
          'Four reports from one morning. Work the evidence, then decide what each one actually requires.',
        teaches:
          'That the response to a phishing report is determined by confirmed user impact, not by how convincing the email looks — and that the most dangerous report in a queue is often the one with no link and no attachment.',
        provenance: 'source',
        sources: [{ file: FILE, section: '4.6 User Impact Assessment' }],
        data: {
          alerts: [
            {
              id: 'PH-0231',
              rule: 'User report · "Microsoft account verification"',
              severity: 'High',
              summary:
                'Lookalike domain micros0ft-support247.com. Credential harvesting page cloned from the Microsoft sign-in. 23 recipients identified at the gateway.',
              checks: [
                { label: 'Authentication results', result: 'SPF, DKIM and DMARC all pass — for micros0ft-support247.com, which the attacker controls.', weight: 'neutral' },
                { label: 'Domain age (WHOIS)', result: 'Registered 2 days before the campaign. Privacy-protected registrant. Hosted on a VPS in Romania.', weight: 'damning' },
                { label: 'Recipients', result: '23 mailboxes received it. 2 gateway open events recorded.', weight: 'neutral' },
                { label: 'Proxy — clicks', result: '3 hosts connected to the domain, including the reporting user.', weight: 'damning' },
                { label: 'Proxy — POST requests', result: '2 of the 3 connections include a POST to the sign-in path. Credentials were submitted.', weight: 'damning' },
                { label: 'Authentication logs', result: 'No logins from unfamiliar addresses yet. The report arrived 20 minutes after delivery.', weight: 'neutral' },
              ],
              options: [
                {
                  id: 'analyse',
                  label: 'Complete the full technical analysis, then act on the findings',
                  correct: false,
                  feedback:
                    'The analysis is already sufficient on the point that matters: two POST requests mean two sets of credentials are in attacker hands right now. Finishing the sandbox run first spends the only minutes you had.',
                },
                {
                  id: 'reset-first',
                  label: 'Force a password reset on both confirmed submitters immediately, then continue investigating',
                  correct: true,
                  feedback:
                    'Correct, and the ordering is the whole lesson. Reset and revoke active sessions for the two confirmed submitters first — session cookies survive a password change, so the revoke is not optional. Then block the domain, purge all 23 mailboxes, and pivot on the origin address. The source scenario found three further campaign domains at that pivot.',
                },
                {
                  id: 'block-only',
                  label: 'Block the domain at the perimeter and purge the email from all mailboxes',
                  correct: false,
                  feedback:
                    'Necessary and insufficient. Blocking stops further clicks; it does nothing about the two credentials already captured. The attacker does not need your network to use them.',
                },
                {
                  id: 'close',
                  label: 'Close — authentication passed, so the email was legitimately sent',
                  correct: false,
                  feedback:
                    'This is the error the demonstration was built to prevent. The checks passed for the attacker\'s own lookalike domain. Always read which domain passed, never just the verdict.',
                },
              ],
            },
            {
              id: 'PH-0232',
              rule: 'User report · "CEO urgent wire transfer"',
              severity: 'Medium',
              summary:
                'Email from ceo@company-finance.net requesting a $47,000 transfer to a new vendor, outside the normal approval process, marked confidential and time-sensitive. The corporate domain is company.com. No link. No attachment.',
              checks: [
                { label: 'Authentication results', result: 'SPF and DKIM pass for company-finance.net. DMARC pass. Again: for the attacker\'s domain.', weight: 'neutral' },
                { label: 'Domain age (WHOIS)', result: 'company-finance.net registered 6 days ago. Privacy-protected.', weight: 'damning' },
                { label: 'Payload', result: 'No URL. No attachment. Nothing for a sandbox or URL scanner to analyse.', weight: 'neutral' },
                { label: 'Recipients', result: 'One. Sent only to a named member of the finance team who has payment authority.', weight: 'damning' },
                { label: 'Pretext', result: 'Urgency, confidentiality, authority, and an explicit instruction to bypass the approval process.', weight: 'damning' },
                { label: 'Finance check', result: 'No transfer has been initiated. The recipient reported it instead of acting.', weight: 'exculpatory' },
              ],
              options: [
                {
                  id: 'low',
                  label: 'Low severity — no link, no attachment, nothing malicious to analyse',
                  correct: false,
                  feedback:
                    'The absence of a payload is the design, not a mitigation. Business email compromise carries no malware because it does not need any — the payload is the instruction, and the target is a bank transfer.',
                },
                {
                  id: 'bec',
                  label: 'Treat as business email compromise: verify out-of-band, alert finance, block the domain, check for other targets',
                  correct: true,
                  feedback:
                    'Correct. Three things matter here. The single targeted recipient with payment authority tells you reconnaissance was done. The bypass instruction is the signature of the technique. And verification must be out-of-band — a phone call to a known number, never a reply to the email. Then check whether other finance staff received variants, and whether the real CEO\'s mailbox shows signs of compromise.',
                },
                {
                  id: 'user-training',
                  label: 'Refer to security awareness training and close',
                  correct: false,
                  feedback:
                    'The user already did the right thing by reporting it. Closing here leaves a lookalike domain unblocked, other finance staff unchecked, and the possibility of a compromised executive mailbox unexamined.',
                },
              ],
            },
            {
              id: 'PH-0233',
              rule: 'Gateway alert · Macro-enabled attachment quarantined',
              severity: 'Medium',
              summary:
                'Q3_Supplier_Update.xlsm from an external sender, quarantined by attachment policy. 6 recipients. Nobody released it.',
              checks: [
                { label: 'Quarantine status', result: 'Held at the gateway. No recipient received the attachment.', weight: 'exculpatory' },
                { label: 'Hash reputation', result: 'SHA256 shows 0/72 detections. Never submitted before.', weight: 'neutral' },
                { label: 'Static macro analysis', result: 'olevba output: AutoOpen present, Shell call to an encoded PowerShell command, URLDownloadToFile pointing at 91.92.251.103.', weight: 'damning' },
                { label: 'Endpoint telemetry', result: 'No Sysmon Event ID 11 for this filename on any host. Nothing was written to disk anywhere.', weight: 'exculpatory' },
                { label: 'Proxy', result: 'No connections to 91.92.251.103 from any internal host.', weight: 'exculpatory' },
              ],
              options: [
                {
                  id: 'close-quarantined',
                  label: 'Close — it was quarantined, so there is no impact',
                  correct: false,
                  feedback:
                    'The impact is zero and the intelligence is not. You are holding a malware sample with a zero-detection hash and a live C2 address, and nobody else has seen it. Closing discards all of it.',
                },
                {
                  id: 'extract-ioc',
                  label: 'Confirm zero impact, extract and distribute the IOCs, pivot on the C2 address, submit a detection request',
                  correct: true,
                  feedback:
                    'Correct. Note what 0/72 means here: not "probably harmless" but "probably custom", which the olevba output confirms. Block the C2 address, pivot on it for related infrastructure, add the hash to EDR blocklists, and hunt retrospectively for that address across proxy logs — the gateway caught this delivery, not necessarily the first one.',
                },
                {
                  id: 'escalate-ir',
                  label: 'Activate incident response',
                  correct: false,
                  feedback:
                    'Nothing reached an endpoint. Two independent sources confirm it — no file creation events and no C2 connections. IR responds to confirmed incidents; this is a confirmed non-event with useful intelligence attached.',
                },
              ],
            },
            {
              id: 'PH-0234',
              rule: 'User report · "HR benefits enrolment"',
              severity: 'High',
              summary:
                'Impersonates the organisation\'s actual HR platform, using its real branding and correct internal terminology. 47 recipients. Reported 4 hours after delivery.',
              checks: [
                { label: 'Domain age (WHOIS)', result: 'Registered 31 days ago. Just outside a 30-day age rule.', weight: 'damning' },
                { label: 'Content fidelity', result: 'Uses the correct platform name, the real enrolment window dates, and internal terminology.', weight: 'damning' },
                { label: 'Proxy — clicks', result: '12 hosts connected to the phishing domain.', weight: 'damning' },
                { label: 'Proxy — POST requests', result: '8 POST requests to the credential page. Eight sets of credentials submitted.', weight: 'damning' },
                { label: 'Authentication logs', result: '1 successful login for an affected account from an address in a country with no business presence, 90 minutes ago.', weight: 'damning' },
                { label: 'Time elapsed', result: '4 hours between delivery and report.', weight: 'damning' },
              ],
              options: [
                {
                  id: 'reset-eight',
                  label: 'Reset all 8 submitters, revoke sessions, block the domain',
                  correct: false,
                  feedback:
                    'Right for seven of them. One account has already been used from an unfamiliar country ninety minutes ago — that is no longer a phishing response, it is an active intrusion with a ninety-minute head start.',
                },
                {
                  id: 'ir-plus-reset',
                  label: 'Activate incident response for the used account; reset and revoke for all 8; block and pivot',
                  correct: true,
                  feedback:
                    'Correct. The confirmed login converts one of the eight into a compromised-account incident requiring scope assessment: what did that session access, did it create persistence, was an MFA device registered. The other seven are still a containable phishing response. Two different responses, running at once, correctly separated.',
                },
                {
                  id: 'awareness',
                  label: 'Reset all 8 and schedule mandatory awareness training for the 12 who clicked',
                  correct: false,
                  feedback:
                    'Training is a reasonable later action and it is not a response. It also mistakes the lesson: an email using the correct platform name, real dates and internal terminology is not one that better-trained users reliably catch. The four-hour reporting delay is the more addressable failure.',
                },
              ],
            },
          ],
        },
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
            stem: 'An email passes SPF, DKIM and DMARC. What have you learned?',
            options: [
              {
                text: 'That it was sent from a server authorised by whichever domain it claims — which may be a domain the attacker owns',
                correct: true,
                feedback:
                  'Correct. Authentication verifies the relationship between the sending server and the claimed domain. It says nothing about whether that domain should be trusted.',
              },
              {
                text: 'That the email is legitimate and can be released',
                correct: false,
                feedback:
                  'This is the specific error the session is built around. A lookalike domain with correct DNS records passes everything.',
              },
              {
                text: 'That the From address has been verified as genuine',
                correct: false,
                feedback:
                  'SPF checks the envelope sender and DKIM checks the signing domain. Neither necessarily matches the visible From header.',
              },
              {
                text: 'That the content has not been altered and the sender is who they claim',
                correct: false,
                feedback:
                  'The first half is roughly what DKIM establishes. The second does not follow — the sender is who the *domain* claims, and the domain may be hostile.',
              },
            ],
          },
          {
            id: 'q2',
            stem: 'A user reports a phishing email twenty minutes after delivery. Proxy logs show a POST to the phishing URL from their host. What do you do first?',
            options: [
              {
                text: 'Force a password reset and revoke active sessions for that account',
                correct: true,
                feedback:
                  'Correct. A POST to a credential page means the credentials are already gone. Revoking sessions matters as much as the reset, because a captured session cookie survives a password change.',
              },
              {
                text: 'Submit the URL to a sandbox to confirm it is a credential harvesting page',
                correct: false,
                feedback:
                  'Thorough and too slow. The POST is already sufficient evidence to act. Confirmation can run in parallel with the reset, not before it.',
              },
              {
                text: 'Determine the full recipient list so the response covers everyone',
                correct: false,
                feedback:
                  'Important, and second. The confirmed victim is a live exposure; the recipient list is scope work that does not get worse while you do the reset.',
              },
              {
                text: 'Block the phishing domain at the perimeter',
                correct: false,
                feedback:
                  'Prevents further clicks and does nothing about the credential already captured. The attacker is not using your network.',
              },
            ],
          },
          {
            id: 'q3',
            stem: 'You have blocked the phishing domain and reset the affected accounts. Why is the investigation not finished?',
            options: [
              {
                text: 'You have not pivoted to find the related infrastructure the attacker has already registered',
                correct: true,
                feedback:
                  'Correct. The address behind the domain commonly hosts several more. Finding them now means next week\'s wave is blocked before it is sent, instead of arriving as a new incident.',
              },
              {
                text: 'You have not yet identified the individual attacker',
                correct: false,
                feedback: 'Attribution is rarely achievable and almost never required for an operational response.',
              },
              {
                text: 'You have not run the attachment in a sandbox',
                correct: false,
                feedback: 'This scenario is credential phishing — there is no attachment.',
              },
              {
                text: 'You have not notified law enforcement',
                correct: false,
                feedback:
                  'Possibly required depending on jurisdiction and impact, and a legal decision rather than an investigative step. The investigative gap is the pivot.',
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
          'Read the Received chain bottom to top and check Return-Path. The From field is display text.',
          'Passing authentication tells you which domain was verified, not whether to trust it.',
          'If credentials were submitted, reset first and investigate second.',
          'Calibrate the response to confirmed impact, using the severity tiers.',
          'Always pivot before closing. One domain is rarely one domain.',
        ],
        furtherStudy: [
          { label: 'MXToolbox header analyser', note: 'Parses a pasted header into a readable hop-by-hop breakdown.', href: 'https://mxtoolbox.com/EmailHeaders.aspx' },
          { label: 'URLScan.io', note: 'Visits a URL in a sandboxed browser and records the page, DNS and network activity. Never click directly.', href: 'https://urlscan.io/' },
          { label: 'crt.sh — certificate transparency search', note: 'Finds other domains sharing a certificate. The highest-yield pivot available.', href: 'https://crt.sh/' },
          { label: 'DMARC specification (RFC 7489)', note: 'The primary source, for when a vendor summary and reality disagree.', href: 'https://datatracker.ietf.org/doc/html/rfc7489' },
        ],
      },
    ],
  },

  practical: {
    minutes: 90,
    title: 'Workshop: A phishing investigation against the clock',
    blocks: [
      {
        kind: 'brief',
        id: 'brief',
        title: 'Briefing',
        minutes: 10,
        synthetic: true,
        resourceDir: 'phishing-investigation',
        scenario:
          'At 09:14 a user reports an email. You have the original message with headers intact, the mail gateway delivery log, four hours of proxy log, and the authentication log for the affected window. The handover meeting is in ninety minutes and will ask you one question: is anyone still exposed?',
        objectives: [
          'Determine the true origin of the email and the domain it was actually sent from',
          'Interpret the authentication results correctly, including what they do not establish',
          'Establish the complete blast radius: received, opened, clicked, submitted',
          'Take the containment actions in the order that minimises exposure, and justify the order',
          'Pivot from the primary indicator to at least two further pieces of attacker infrastructure',
          'Produce a report whose executive summary is readable by someone non-technical',
        ],
        requires: [
          { item: 'The investigation pack (downloadable from this page)', note: 'Raw email with headers, gateway delivery log, proxy log, authentication log, and a prepared enrichment file standing in for live lookups.', file: '00-investigation-pack.md' },
          { item: 'The IOC worksheet and report template (downloadable)', note: 'Structured so the IOC list is machine-readable when you finish.', file: '01-ioc-worksheet-and-report.md' },
          { item: 'A text editor with search', note: 'The proxy log is roughly 600 lines. You will filter by hand.' },
          { item: 'A browser', note: 'For the ATT&CK matrix. Do not visit any domain or address from the pack.' },
        ],
        setup: [
          'Download the investigation pack, the IOC worksheet and the report template.',
          'Create a working folder named phish-<ticket-id>-<your-name>.',
          'Open the enrichment file first and read its header, which explains which lookups it stands in for.',
          'Start a clock. Note the time you begin, and timestamp every containment action you decide on. The sequence is assessed.',
        ],
        realism:
          'Every lookup that would hit a live service — VirusTotal, WHOIS, passive DNS, certificate transparency, URLScan — is pre-answered in the enrichment file, and each answer states which tool it represents. No domain or address in this pack is real or should be visited. The judgement being assessed is investigative sequencing and inference, which is the part that transfers; operating any particular enrichment tool is not, and is a ten-minute exercise you can do on your own with the links in the recap.',
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Phishing Investigation Workflow' }],
      },

      {
        kind: 'tasks',
        id: 'tasks',
        title: 'Your tasks',
        minutes: 55,
        lead:
          'The timings reflect the real shape of this work: impact assessment runs in parallel with technical analysis, and containment begins the moment a finding justifies it rather than at the end.',
        tasks: [
          {
            ref: 'T1',
            minutes: 10,
            title: 'Header analysis',
            steps: [
              'Read the Received chain bottom to top and record the originating address.',
              'Record From, Reply-To and Return-Path, and note every mismatch.',
              'Record the authentication results and write one sentence stating what they actually establish.',
              'Look up the sending domain in the enrichment file. Record its registration age.',
            ],
            produces: 'Header findings: origin address, true sending domain, authentication interpretation, domain age.',
          },
          {
            ref: 'T2',
            minutes: 15,
            title: 'Impact assessment — and act the moment you can',
            steps: [
              'Query the gateway log for all recipients of this campaign. Record the count.',
              'Search the proxy log for connections to the phishing domain. Record which hosts.',
              'Search for POST requests to the phishing URL. These are confirmed credential submissions.',
              'The moment you confirm a submission, write down the containment action and the time. Do not wait until the end.',
              'Check the authentication log for logins from unfamiliar locations after delivery.',
            ],
            produces: 'An impact table — received, opened, clicked, submitted — and a timestamped action log.',
          },
          {
            ref: 'T3',
            minutes: 12,
            title: 'Payload analysis',
            steps: [
              'Record the phishing URL and what the enrichment file reports about the page it serves.',
              'If an attachment is present, record its hash and the reported static analysis output.',
              'Note any zero-detection results and write one sentence on what that does and does not mean.',
              'Check endpoint telemetry for evidence of execution on any host.',
            ],
            produces: 'Payload findings with hashes, URLs and an explicit execution determination.',
          },
          {
            ref: 'T4',
            minutes: 10,
            title: 'Pivot',
            steps: [
              'From the origin address, use the enrichment file\'s passive DNS section to find other domains that have resolved there.',
              'From the phishing domain, use the certificate transparency section to find domains sharing its certificate.',
              'Check the registration dates of anything you find. Clustered registrations indicate one campaign.',
              'Add every discovered indicator to the IOC list, marked as discovered-by-pivot rather than observed.',
            ],
            produces: 'At least two additional pieces of infrastructure, with the pivot path that found each.',
          },
          {
            ref: 'T5',
            minutes: 8,
            title: 'Report',
            steps: [
              'Write the executive summary in three sentences: what happened, how many affected, current status.',
              'Write it for a reader who does not know what SPF is. If it contains an unexplained acronym, rewrite it.',
              'Complete the IOC list in the worksheet format.',
              'Write one detection recommendation that would have caught this earlier, and state what it would not catch.',
            ],
            produces: 'A complete investigation report with an executive summary, IOC list and detection recommendation.',
          },
        ],
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Phishing Investigation Workflow' }],
      },

      {
        kind: 'hints',
        id: 'hints',
        title: 'Progressive hints',
        hints: [
          {
            forTask: 'T1',
            tiers: [
              'Received headers stack with the newest at the top. The origin is the bottom one.',
              'Compare the registrable domain — the last two labels — across From, Reply-To and Return-Path. Subdomains are designed to mislead you here.',
              'For the authentication sentence, complete: "These checks confirm that ___ authorised ___ to send on its behalf, which tells us nothing about whether ___."',
            ],
          },
          {
            forTask: 'T2',
            tiers: [
              'Search the gateway log by sending domain rather than by subject — subject lines are varied within a single campaign.',
              'In the proxy log, the method column distinguishes a click from a submission. GET is a visit. POST is a form.',
              'If you have found a POST and have not yet written down a containment action, stop reading and write it down now. That ordering is 20% of the assessment.',
            ],
          },
          {
            forTask: 'T3',
            tiers: [
              'For a zero-detection hash during an active investigation, reread the Session 3 triage console feedback on alert PH-0233.',
              'Execution is confirmed by endpoint telemetry, not by the presence of the file at the gateway.',
              'If there is no endpoint evidence of execution, say so explicitly as a finding. "No evidence of execution on any host, confirmed by absence of file creation events" is a result.',
            ],
          },
          {
            forTask: 'T4',
            tiers: [
              'Two pivot paths are available: address-to-domains via passive DNS, and certificate-to-domains via transparency logs.',
              'Look at registration dates on whatever you find. Several domains registered within the same few days is one campaign being staged.',
              'Mark pivoted indicators differently from observed ones in your IOC list. A blocklist entry nobody has seen in traffic carries different confidence, and the person who acts on it needs to know.',
            ],
          },
          {
            forTask: 'T5',
            tiers: [
              'Write the executive summary last and read it aloud. If you run out of breath, it is too long.',
              'The model from the source is three sentences: what arrived and to how many; what users did; what has been done and what is still open.',
              'For the detection recommendation, a domain-age check on inbound links would have caught this one — now state its limit. What does an attacker do to defeat it?',
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
          { ref: 'D1', text: 'Header analysis findings including the authentication interpretation sentence', required: true },
          { ref: 'D2', text: 'Impact table — received, opened, clicked, submitted, with counts and hosts', required: true },
          { ref: 'D3', text: 'Timestamped action log showing when each containment decision was taken', required: true },
          { ref: 'D4', text: 'IOC list in the worksheet format, distinguishing observed from pivoted indicators', required: true },
          { ref: 'D5', text: 'Investigation report with a three-sentence non-technical executive summary', required: true },
          { ref: 'D6', text: 'One detection recommendation with its limitation stated', required: true },
        ],
        structure: `phish-<ticket-id>-<your-name>/
  00-headers.md           → T1: origin, mismatches, authentication interpretation
  01-impact.md            → T2: the blast radius table
  02-actions.md           → T2: timestamped containment decisions
  03-payload.md           → T3: URLs, hashes, execution determination
  04-pivot.md             → T4: additional infrastructure and the path that found it
  05-iocs.md              → the structured IOC list
  06-report.md            → the full report, executive summary first`,
        provenance: 'source',
        sources: [{ file: FILE, section: '9. Tools / Workflow — Investigation Report Template' }],
      },

      {
        kind: 'assessment',
        id: 'assessment',
        title: 'How this is assessed',
        lead:
          'Note the weight on sequencing. In a credential phishing incident, the order of your actions is the difference between an incident and a breach.',
        criteria: [
          {
            band: 'Containment sequencing',
            weight: '25%',
            descriptor:
              'Credential resets are initiated on confirmation of submission, before the remaining analysis. Session revocation accompanies the reset. The action log shows the ordering, with times.',
          },
          {
            band: 'Impact accuracy',
            weight: '20%',
            descriptor:
              'The blast radius is complete and correct at every level, and each count is supported by a named log source rather than asserted.',
          },
          {
            band: 'Authentication interpretation',
            weight: '15%',
            descriptor:
              'The report states which domain the checks verified and does not treat passing as a safety signal.',
          },
          {
            band: 'Pivot yield',
            weight: '15%',
            descriptor:
              'At least two additional indicators found, with the pivot path documented and pivoted indicators distinguished from observed ones.',
          },
          {
            band: 'Report quality',
            weight: '15%',
            descriptor:
              'The executive summary is genuinely readable by a non-technical reader. The IOC list is structured and usable without editing.',
          },
          {
            band: 'Evidence discipline',
            weight: '10%',
            descriptor:
              'Observations, hypotheses and confirmed findings are distinguished. Nothing is asserted beyond what the pack supports.',
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
          'At what point did you take your first containment action? Compare times across the room — the spread is usually large and it is the most important number in the exercise.',
          'Did anyone treat the passing authentication results as reassuring at any point in their reasoning, even briefly?',
          'How many additional indicators did the room find by pivoting? What was the highest-yield pivot path?',
          'Read two executive summaries aloud. Which would a finance director understand without stopping?',
          'What did your detection recommendation miss? Every recommendation has a bypass — name yours.',
          'The user forwarded the email correctly, with headers. What would this investigation have looked like if they had not, and what should change in your user guidance as a result?',
        ],
        landingPoint:
          'A phishing investigation is a race whose clock started before you were told about it — which is why impact assessment runs first, containment begins mid-investigation, and the thoroughness that is a virtue everywhere else is a liability in the first ten minutes.',
        provenance: 'supplementary',
      },

      {
        kind: 'recap',
        id: 'recap',
        title: 'Recap and further study',
        provenance: 'source',
        sources: [{ file: FILE, section: '13. Summary' }],
        takeaways: [
          'Headers carry the routing truth. From is display text; Received bottom-up and Return-Path are the evidence.',
          'SPF, DKIM and DMARC verify a relationship to a claimed domain, and a lookalike domain can satisfy all three.',
          'Never open attachments or visit URLs directly. Sandboxes and scanners exist for this.',
          'Impact assessment has an order, and credential submission is the finding that interrupts everything else.',
          'Domain registration age is one of the strongest quick indicators available.',
          'Pivot before closing. The address behind one domain usually hosts more.',
        ],
        furtherStudy: [
          { label: 'Any.run', note: 'Interactive sandbox. Its interactive mode matters for maldocs that require a user to click Enable Content.', href: 'https://any.run/' },
          { label: 'SPF (RFC 7208) and DKIM (RFC 6376)', note: 'The primary specifications. Worth reading the abstract of each at minimum.', href: 'https://datatracker.ietf.org/doc/html/rfc7208' },
          { label: 'Next: Session 4 — Detection Engineering', note: 'You have now investigated three attacks by hand. Next: writing the rules that catch them without you.' },
        ],
      },
    ],
  },

  terms: [
    { term: 'SPF', definition: 'Sender Policy Framework. A DNS record listing which servers may send mail for a domain.' },
    { term: 'DKIM', definition: 'DomainKeys Identified Mail. A cryptographic signature proving content has not been altered since signing.' },
    { term: 'DMARC', definition: 'Policy layer telling receivers what to do when SPF or DKIM fail: none, quarantine, or reject.' },
    { term: 'Return-Path', definition: 'The header giving the bounce address. Frequently reveals the true sending domain when From does not.' },
    { term: 'IOC', definition: 'Indicator of Compromise — an address, domain, hash or artefact that can be searched for or blocked.' },
    { term: 'Pivoting', definition: 'Using one indicator to discover related attacker infrastructure via passive DNS, WHOIS or certificate transparency.' },
    { term: 'BEC', definition: 'Business Email Compromise. Phishing with no malicious payload, where the instruction itself is the attack.' },
    { term: 'Typosquatting', definition: 'Registering a domain visually similar to a real one, such as micros0ft.com with a zero.' },
  ],
}
