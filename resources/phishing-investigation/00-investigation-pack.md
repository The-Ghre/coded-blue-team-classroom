# Session 3 — Phishing investigation pack

> **SYNTHETIC TEACHING DATA — CODED Blue Team Classroom**
> Every host, account, address, domain and hash below is fabricated for this
> workshop. No real environment produced this data. Do not visit any address or
> domain shown. Addresses are written defanged (hxxp://, 185[.]220[.]101[.]45)
> where they would otherwise be clickable.
>
> One reported email with headers intact, plus the gateway, proxy and authentication logs for the window.

## The report

At 09:40 a user forwarded this message to the SOC inbox, correctly, as an
attachment — so the original headers are preserved.

> "I got a strange email from Microsoft Support saying my account will be
> deleted in 24 hours unless I verify my details. I clicked the link but then
> got suspicious and closed it. The page looked exactly like Microsoft. Should
> I be worried?"

The user has not said whether they typed anything.

---

## 1. The email, with headers

```
Return-Path: <bounce@micros0ft-support247[.]com>
Received: from mail.ourcompany.com (10.0.0.25)
        by mx1.ourcompany.com with ESMTPS; Thu, 12 Mar 2026 09:02:41 +0300
Received: from smtp-relay-07.bulkmail-svc[.]net (198[.]51[.]100[.]77)
        by mail.ourcompany.com with ESMTP; Thu, 12 Mar 2026 09:02:38 +0300
Received: from [185[.]220[.]101[.]45]
        by smtp-relay-07.bulkmail-svc[.]net with SMTP; Thu, 12 Mar 2026 09:02:31 +0300
Authentication-Results: mx1.ourcompany.com;
        spf=pass (domain of micros0ft-support247[.]com designates
             198[.]51[.]100[.]77 as permitted sender);
        dkim=pass header.d=micros0ft-support247[.]com;
        dmarc=pass
X-Originating-IP: [185[.]220[.]101[.]45]
Message-ID: <a71f2c99-bulk-0442@micros0ft-support247[.]com>
From: Microsoft Support <support@micros0ft-support247[.]com>
Reply-To: account-team@micros0ft-support247[.]com
To: s.alqattan@ourcompany.com
Subject: Action required: your account will be deleted in 24 hours
Date: Thu, 12 Mar 2026 09:02:28 +0300
Content-Type: text/html; charset=UTF-8

--- body (rendered text) ---
Your Microsoft account has been flagged for deletion due to unverified
security information. Verify now to keep your account active.

[ Verify my account ]  ->  hxxps://login[.]micros0ft-support247[.]com/verify

Microsoft Account Team
```

---

### Evidence boundary for this synthetic message

The gateway trusts its internal relay mail.ourcompany.com and its own
Authentication-Results record. The internal relay records external peer
198[.]51[.]100[.]77. The earlier claimed origin 185[.]220[.]101[.]45 and
X-Originating-IP are unverified until a trusted relay record corroborates them.
Use the claimed address as a labelled pivot lead, not a verified attribution.
The visible From address uses the lookalike domain, allowing its aligned
SPF/DKIM authentication to produce DMARC pass.

## 2. Mail gateway delivery log

```
SUBJECT MATCH: "Action required: your account will be deleted in 24 hours"
SENDER DOMAIN: micros0ft-support247[.]com

09:02:41  DELIVERED  s.alqattan@ourcompany.com
09:02:41  DELIVERED  m.alotaibi@ourcompany.com
09:02:42  DELIVERED  a.hassan@ourcompany.com
09:02:42  DELIVERED  f.alsalem@ourcompany.com
09:02:43  DELIVERED  n.aldosari@ourcompany.com
09:02:43  DELIVERED  y.almutairi@ourcompany.com
... (40 further DELIVERED entries omitted for length)
09:03:12  DELIVERED  r.alenezi@ourcompany.com

TOTAL DELIVERED: 47
OPEN SIGNALS RECORDED: 9  (tracking signals, not proof of nine human opens)
```

---

## 3. Proxy log (09:00–11:59, filtered to external HTTP/HTTPS)

```
09:01:57  10.0.5.14  GET   https://outlook.office.com/  200  text/html
09:02:15  10.0.4.18  GET   https://teams.microsoft.com/  200  text/html
09:04:49  10.0.4.31  GET   https://www.google.com/  200  text/html
09:07:39  10.0.5.14  GET   https://www.google.com/  200  text/html
09:17:59  10.0.4.18  GET   https://cdn.jsdelivr.net/  200  text/html
09:19:27  10.0.5.14  GET   https://cdn.jsdelivr.net/  200  text/html
09:21:05  10.0.5.14  GET   https://teams.microsoft.com/  200  text/html
09:21:47  10.0.4.22  GET   https://outlook.office.com/  200  text/html
09:22:23  10.0.5.07  GET   https://cdn.jsdelivr.net/  200  text/html
09:25:16  10.0.5.07  GET   https://outlook.office.com/  200  text/html
09:25:43  10.0.4.22  GET   https://outlook.office.com/  200  text/html
09:28:32  10.0.5.07  GET   https://www.google.com/  200  text/html
09:29:17  10.0.4.22  GET   https://teams.microsoft.com/  200  text/html
09:30:37  10.0.5.14  GET   https://outlook.office.com/  200  text/html
09:31:44  10.0.4.18  GET   hxxps://login[.]micros0ft-support247[.]com/verify  200  text/html
09:32:02  10.0.4.18  POST  hxxps://login[.]micros0ft-support247[.]com/verify  302  application/x-www-form-urlencoded  len=184
09:33:02  10.0.4.18  GET   https://outlook.office.com/  200  text/html
09:35:06  10.0.5.07  GET   https://teams.microsoft.com/  200  text/html
09:35:45  10.0.4.22  GET   https://outlook.office.com/  200  text/html
09:37:58  10.0.4.22  GET   https://www.google.com/  200  text/html
09:38:03  10.0.4.18  GET   https://outlook.office.com/  200  text/html
09:38:11  10.0.4.31  GET   hxxps://login[.]micros0ft-support247[.]com/verify  200  text/html
09:38:50  10.0.4.31  POST  hxxps://login[.]micros0ft-support247[.]com/verify  302  application/x-www-form-urlencoded  len=191
09:40:05  10.0.4.11  GET   https://www.google.com/  200  text/html
09:44:19  10.0.5.07  GET   hxxps://login[.]micros0ft-support247[.]com/verify  200  text/html
09:47:23  10.0.5.14  GET   https://cdn.jsdelivr.net/  200  text/html
09:49:07  10.0.4.11  GET   https://www.google.com/  200  text/html
10:00:51  10.0.4.11  GET   https://www.microsoft.com/  200  text/html
10:01:45  10.0.4.22  GET   https://www.microsoft.com/  200  text/html
10:03:02  10.0.4.18  GET   https://www.google.com/  200  text/html
10:04:26  10.0.5.07  GET   https://cdn.jsdelivr.net/  200  text/html
10:06:22  10.0.4.18  GET   https://cdn.jsdelivr.net/  200  text/html
10:07:33  10.0.5.07  GET   https://teams.microsoft.com/  200  text/html
10:07:53  10.0.4.22  GET   https://cdn.jsdelivr.net/  200  text/html
10:08:27  10.0.4.18  GET   https://teams.microsoft.com/  200  text/html
10:08:39  10.0.4.31  GET   https://cdn.jsdelivr.net/  200  text/html
10:09:31  10.0.4.18  GET   https://cdn.jsdelivr.net/  200  text/html
10:12:21  10.0.5.14  GET   https://teams.microsoft.com/  200  text/html
10:14:54  10.0.4.11  GET   https://www.microsoft.com/  200  text/html
10:15:14  10.0.5.14  GET   https://www.microsoft.com/  200  text/html
10:15:59  10.0.4.18  GET   https://www.google.com/  200  text/html
10:16:38  10.0.5.07  GET   https://outlook.office.com/  200  text/html
10:20:33  10.0.5.14  GET   https://cdn.jsdelivr.net/  200  text/html
10:21:31  10.0.5.07  GET   https://www.google.com/  200  text/html
10:23:56  10.0.4.22  GET   https://www.google.com/  200  text/html
10:26:43  10.0.5.07  GET   https://www.microsoft.com/  200  text/html
10:30:44  10.0.4.18  GET   https://www.microsoft.com/  200  text/html
10:31:03  10.0.4.11  GET   https://www.microsoft.com/  200  text/html
10:34:40  10.0.4.18  GET   https://www.microsoft.com/  200  text/html
10:39:52  10.0.4.22  GET   https://teams.microsoft.com/  200  text/html
10:40:54  10.0.4.18  GET   https://outlook.office.com/  200  text/html
10:42:17  10.0.5.14  GET   https://www.microsoft.com/  200  text/html
10:42:43  10.0.4.11  GET   https://www.microsoft.com/  200  text/html
10:50:59  10.0.4.11  GET   https://www.google.com/  200  text/html
10:52:32  10.0.4.11  GET   https://outlook.office.com/  200  text/html
10:54:12  10.0.4.11  GET   https://outlook.office.com/  200  text/html
10:54:29  10.0.5.14  GET   https://teams.microsoft.com/  200  text/html
10:54:36  10.0.5.14  GET   https://www.google.com/  200  text/html
10:55:51  10.0.5.14  GET   https://www.google.com/  200  text/html
10:57:00  10.0.4.31  GET   https://www.google.com/  200  text/html
10:57:02  10.0.4.18  GET   https://teams.microsoft.com/  200  text/html
11:01:18  10.0.4.11  GET   https://cdn.jsdelivr.net/  200  text/html
11:01:44  10.0.4.22  GET   https://teams.microsoft.com/  200  text/html
11:04:20  10.0.4.18  GET   https://outlook.office.com/  200  text/html
11:06:20  10.0.4.31  GET   https://cdn.jsdelivr.net/  200  text/html
11:07:57  10.0.4.31  GET   https://cdn.jsdelivr.net/  200  text/html
11:08:26  10.0.4.31  GET   https://teams.microsoft.com/  200  text/html
11:11:31  10.0.4.31  GET   https://cdn.jsdelivr.net/  200  text/html
11:18:46  10.0.5.14  GET   https://www.google.com/  200  text/html
11:22:34  10.0.5.14  GET   https://www.microsoft.com/  200  text/html
11:22:48  10.0.4.31  GET   https://www.microsoft.com/  200  text/html
11:26:58  10.0.5.14  GET   https://cdn.jsdelivr.net/  200  text/html
11:28:01  10.0.4.18  GET   https://cdn.jsdelivr.net/  200  text/html
11:28:27  10.0.4.22  GET   https://cdn.jsdelivr.net/  200  text/html
11:29:56  10.0.5.14  GET   https://outlook.office.com/  200  text/html
11:30:07  10.0.5.14  GET   https://outlook.office.com/  200  text/html
11:32:41  10.0.4.18  GET   https://www.microsoft.com/  200  text/html
11:34:20  10.0.4.11  GET   https://www.microsoft.com/  200  text/html
11:37:18  10.0.4.22  GET   https://cdn.jsdelivr.net/  200  text/html
11:37:43  10.0.5.14  GET   https://www.google.com/  200  text/html
11:39:21  10.0.4.18  GET   https://cdn.jsdelivr.net/  200  text/html
11:41:59  10.0.5.07  GET   https://www.microsoft.com/  200  text/html
11:43:16  10.0.4.18  GET   https://teams.microsoft.com/  200  text/html
11:45:41  10.0.5.07  GET   https://www.google.com/  200  text/html
11:47:04  10.0.5.07  GET   https://teams.microsoft.com/  200  text/html
11:47:27  10.0.4.31  GET   https://outlook.office.com/  200  text/html
11:47:30  10.0.4.18  GET   https://outlook.office.com/  200  text/html
11:49:12  10.0.4.31  GET   https://teams.microsoft.com/  200  text/html
11:51:20  10.0.5.07  GET   https://www.microsoft.com/  200  text/html
11:51:40  10.0.4.18  GET   https://www.microsoft.com/  200  text/html
11:52:05  10.0.5.14  GET   https://teams.microsoft.com/  200  text/html
11:55:23  10.0.4.18  GET   https://www.microsoft.com/  200  text/html
11:55:52  10.0.5.07  GET   https://teams.microsoft.com/  200  text/html
11:58:33  10.0.4.31  GET   https://cdn.jsdelivr.net/  200  text/html
11:59:57  10.0.5.07  GET   https://teams.microsoft.com/  200  text/html
```

---

### Asset/account mapping supplied for this exercise

| Host | Assigned user account |
|---|---|
| 10.0.4.18 | s.alqattan |
| 10.0.4.31 | m.alotaibi |
| 10.0.5.07 | a.hassan |

The page analysis below identifies a credential form. Requests to that form
justify prompt precautionary containment of mapped accounts. The proxy log
contains request metadata, not passwords or a captured request body. Distinguish
likely credential exposure from a proven statement about the submitted values.
DNS queries, tracking pixels and automated URL fetches do not prove a human click.

## 4. Authentication log (09:00–13:00, external sources only)

```
09:18:04  SUCCESS  a.hassan      source=94[.]203[.]12[.]9    country=KW  device=managed-4417  mfa=satisfied
10:02:51  SUCCESS  f.alsalem     source=94[.]203[.]12[.]9    country=KW  device=managed-3302  mfa=satisfied
11:47:22  SUCCESS  s.alqattan    source=45[.]142[.]214[.]88  country=RO  device=UNKNOWN      mfa=satisfied
12:31:09  SUCCESS  n.aldosari    source=94[.]203[.]12[.]9    country=KW  device=managed-5120  mfa=satisfied
```

---

## 5. Enrichment file

Every lookup below would, in a live investigation, hit a third-party service.
They are pre-answered here so the exercise is the inference rather than the
tooling. The tool each answer represents is named.

### WHOIS — micros0ft-support247[.]com
```
Registered     : 2026-03-10  (2 days before the campaign)
Registrar      : (privacy-protected)
Registrant     : REDACTED FOR PRIVACY
Name servers   : ns1.bulletproof-dns[.]ru, ns2.bulletproof-dns[.]ru
Hosting        : VPS, Bucharest, RO
```

### URLScan.io — hxxps://login[.]micros0ft-support247[.]com/verify
```
Final URL     : same (no redirect chain)
Page          : pixel-accurate clone of the Microsoft sign-in page
Form action   : POST to /verify, fields: loginfmt, passwd
TLS           : valid certificate, Let's Encrypt, issued 2026-03-10
Verdict       : no prior reputation — first submission
```

### Passive DNS — 185[.]220[.]101[.]45
```
Domains historically resolving to this address:
  micros0ft-support247[.]com    first seen 2026-03-10
  0ffice365-verify[.]com        first seen 2026-03-09
  googIe-accounts-verify[.]net  first seen 2026-03-09   (capital I, not lowercase l)
  dropbox-secure-login[.]com    first seen 2026-03-11
```

### Certificate transparency (crt.sh) — certificate fingerprint of the phishing site
```
Domains sharing this certificate:
  login.micros0ft-support247[.]com
  mail.micros0ft-support247[.]com
  sso.micros0ft-support247[.]com
```

### Threat intel — 45[.]142[.]214[.]88
```
AbuseIPDB     : 31 reports in 90 days, categories: brute force, web spam
Geolocation   : Bucharest, RO
ASN           : hosting provider, same ASN as 185[.]220[.]101[.]45
```

---

## What is NOT in this pack

No EDR telemetry and no endpoint process events. If your conclusion about
whether anything executed on an endpoint is "cannot be established from this
evidence", that is correct — and naming the evidence source that would resolve
it is part of the exercise.

