# CODED Blue Team Classroom

The CODED Defensive Security track as interactive lessons and practical workshops.
Ten three-hour sessions: 90 minutes of theory paired with a 90-minute workshop that
applies it.

- **[PRODUCT.md](PRODUCT.md)** — the product brief, curriculum and teaching model
- **[DESIGN.md](DESIGN.md)** — the design system and the observed CODED brand values
- **[SOURCE-MAP.md](SOURCE-MAP.md)** — every session traced to its source file

---

## Quick start

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`.

```bash
npm run build     # typecheck + production build to dist/
npm run preview   # serve the production build locally
npm run lint      # typecheck only
```

Requires Node 18 or later.

---

## Project layout

```
src/
  content/
    index.ts              Course assembly, lookups, timing checks, glossary, source map
    sessions/
      s01-soc-operations.ts        ← one file per session. This is the content.
      s02-log-analysis.ts
      ...
  types/content.ts        The typed content model. Start here.
  components/
    brand/                Wordmark, evidence chips, provenance tags, callouts
    teaching/             Block renderers and diagrams
    interactions/         The six signature interactions
    layout/               App shell
  routes/                 Roadmap, session overview, study, presentation, search, about
  lib/                    Progress, search index, hooks
  styles/                 tokens → base → app → teaching → interactions → slides → print
```

**Content is data, not components.** A session is authored once as a tree of typed
blocks; presentation mode, study mode, the workshop page and the search index are
all projections of that same tree. Editing a lesson never means touching the
interface, and slide/study parity is guaranteed by construction rather than by
discipline.

---

## Editing lessons

### Change existing content

Open the session file in `src/content/sessions/`. Find the block by its `title` or
`id` and edit it. The dev server hot-reloads.

Every block supports:

| Field | Purpose |
|---|---|
| `id` | Stable identifier. **Used in slide deep links — do not renumber casually.** |
| `title` | Shown in the slide overview and the study contents |
| `minutes` | Budgeted time. Must total exactly 90 per half — see below |
| `provenance` | `'source'`, `'supplementary'` or `'synthetic'` |
| `sources` | `[{ file, section }]` — cited in study mode |
| `detail` | Study-mode-only paragraphs. Keeps slides sparse without losing depth |

Put extended explanation in `detail`, not in `points`. Slides render `points`;
study mode renders both. This is what keeps slide text concise without shrinking
type.

### The 90/90 rule

Minutes must total exactly 90 for theory and 90 for practical. This is checked
automatically:

- A mismatch warns in the browser console in development
- The **About** page shows a live table of all ten sessions with a pass/fail flag

Blocks with no `minutes` are reference material consulted during the session
(hints, assessment criteria, recap) and are excluded from the total.

### Add a session

1. Copy an existing session file in `src/content/sessions/` as a starting point.
2. Set `number`, `slug`, `title`, `summary`, `abstract`, `track`, `themes`,
   `prerequisites`, `outcomes`, `sourceFiles`.
3. Author `theory.blocks` and `practical.blocks`. Give every block a unique `id`.
4. Register it in `src/content/index.ts`:

```ts
import { session11 } from './sessions/s11-your-session'

export const sessions: Session[] = [ /* … */ session10, session11 ]
```

The roadmap, session rail, search index, glossary, source map and timing table all
pick it up automatically. Nothing else needs changing.

### Add a block type

1. Add the interface to `src/types/content.ts` and to the `Block` union.
2. Add a renderer in `src/components/teaching/blocks.tsx` and a case to `BlockView`.
3. Style it in `src/styles/teaching.css`.

TypeScript's exhaustiveness checking will point at the switch statement if you miss
the second step.

### Add an interaction

1. Build the component in `src/components/interactions/`. Accept `data: unknown` and
   validate it with a type guard — content is authored by hand and a typo should
   degrade gracefully rather than crash the lesson.
2. Register it in `src/components/interactions/Interaction.tsx` and add the name to
   the `component` union in `types/content.ts`.
3. Reference it from a session with an `interaction` block, supplying `teaches` and
   `data`.

Interactions are wrapped in an error boundary, so a failure shows a readable notice
and the rest of the lesson still reads.

---

## Practical resources

Every workshop ships with its data pack and its worksheet — twenty files in
`public/resources/`, roughly 110 KB, reachable as working download links from each
briefing. They are generated, not hand-maintained:

```bash
npm run resources
```

The generator (`scripts/generate-resources.mjs`) is **deterministic**: the same seed
produces the same packs every time, so every student in a room sees identical data
and an instructor can refer to a specific line.

Each pack contains the alert queue, log window, artefact output, enrichment answers
or event data that its workshop needs, plus the worksheet or template students fill
in. Every file opens with a synthetic-data banner, and addresses are defanged.

### Changing a pack

Edit the relevant `sessionNN()` function in `scripts/generate-resources.mjs` and
re-run `npm run resources`.

### Adding a new resource

1. Emit the file from the generator with `write('<session-slug>', '<filename>', body)`.
2. Reference it from the session's `brief` block:

```ts
requires: [
  { item: 'The pack', note: 'What it contains.', file: '00-pack.md' },
],
resourceDir: 'session-slug',
```

A `requires` entry with a `file` renders as a download link; one without renders as
plain text. Items the student brings themselves — a browser, a text editor — have no
`file` and should not get one, because a link to nothing is a dead control.

> Anything placed in `public/` is published and world-readable once deployed.

---

## What is deliberately excluded

**Instructor answer keys, full investigation walkthroughs, solution files and any
sensitive source material are not in this bundle.**

Hiding them behind an interface control would not make them private — anything
shipped to a browser is readable by anyone who opens developer tools. They belong
in a separate, access-controlled distribution.

What ships here is student-facing material only.

---

## Deployment

The same build targets either a site root or a GitHub Pages project path.

### GitHub Pages (automated)

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with
`BASE_PATH=/coded-blue-team-classroom/` and publishes to Pages.

One-time setup: **Settings → Pages → Source → GitHub Actions**.

### Vercel, Netlify, Cloudflare Pages

Build command `npm run build`, output directory `dist`. No `BASE_PATH` needed —
it defaults to `/`. `vercel.json` provides the SPA rewrite; Netlify users should add
a `_redirects` file containing `/*  /index.html  200`.

### Any static host

```bash
npm run build
# serve dist/
```

### Deep links and refreshes

Both are handled:

- The router's basename comes from `import.meta.env.BASE_URL`, so the same build
  works at a root or under a subpath.
- The build copies `index.html` to `404.html`, which is how GitHub Pages serves an
  SPA fallback. A direct hit on `/session/soc-operations/present/7` resolves, and so
  does a browser refresh on it.
- `vercel.json` rewrites all paths to `/index.html` for hosts that use it.

Verify after deploying by loading a deep slide link directly and pressing refresh.

---

## Content integrity

- All logs, alerts, addresses, domains, hashes and host names are **synthetic** and
  labelled as such wherever they appear.
- Blocks marked `provenance: 'source'` derive from the supplied files, with the
  section cited in study mode.
- Blocks marked `'supplementary'` are teaching additions; technical claims beyond
  the source are verified against primary vendor or project documentation, linked
  in each session's recap.
- MITRE technique identifiers are reproduced as written in the source material.
  Confirm them against [attack.mitre.org](https://attack.mitre.org/) before quoting
  them in a report — MITRE revises and deprecates techniques between versions.

---

## Browser support

Modern evergreen browsers. Uses `color-mix()`, CSS nesting-free custom properties,
`clamp()`, container-free fluid layout and the Fullscreen API. Fullscreen degrades
gracefully where unsupported — the control is simply absent.
