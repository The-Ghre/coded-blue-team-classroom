import { Link } from 'react-router-dom'
import { course, checkTimings, glossary, sourceMap } from '@/content'
import { EvidenceLegend, Eyebrow, MonoLabel } from '@/components/brand/Brand'
import { useProgress, isStorageAvailable } from '@/lib/progress'
import { useDocumentTitle } from '@/lib/hooks'

/* Observed CODED brand values, reproduced here so an instructor can verify
   the palette against the reference without reading the source. */
const PALETTE = [
  { token: '--coded-ink', value: '#00081C', role: 'Page ground (observed body background)' },
  { token: '--coded-navy-deep', value: '#00112F', role: 'Raised ground, code surfaces' },
  { token: '--coded-navy', value: '#14243F', role: 'Primary surface' },
  { token: '--coded-navy-2', value: '#16294A', role: 'Surface, one step up' },
  { token: '--coded-navy-3', value: '#1B3055', role: 'Surface, two steps up' },
  { token: '--coded-panel', value: '#12294F', role: 'Panel' },
  { token: '--coded-blue', value: '#004AA3', role: 'Primary action' },
  { token: '--coded-blue-bright', value: '#2F74D6', role: 'Accent, response actions' },
  { token: '--coded-blue-soft', value: '#6F9CE8', role: 'Links, observations' },
  { token: '--coded-white', value: '#FFFFFF', role: 'Primary text' },
  { token: '--coded-muted', value: '#9FB2D4', role: 'Secondary text' },
  { token: '--coded-muted-2', value: '#6F83A8', role: 'Tertiary text, labels' },
  { token: '--coded-gold', value: '#C89A45', role: 'Hypotheses, identity telemetry' },
  { token: '--coded-ok', value: '#5AD0A0', role: 'Confirmed findings' },
  { token: '--coded-green', value: '#37A06A', role: 'Cloud telemetry' },
  { token: '--coded-mauve', value: '#A85A66', role: 'Stated uncertainty' },
  { token: '--coded-red', value: '#F84B4B', role: 'Adversary actions' },
  { token: '--coded-indigo', value: '#3E50DD', role: 'Network telemetry' },
]

export function About() {
  useDocumentTitle('About this course — CODED Blue Team Classroom')
  const { resetAll, state } = useProgress()
  const timings = checkTimings()
  const sessionsWithProgress = Object.keys(state).length

  return (
    <div className="about">
      <header className="about__head">
        <Eyebrow>About</Eyebrow>
        <h1>How this course was built</h1>
        <p className="lead">
          Everything here derives from the supplied CODED Defensive track files. This page records
          exactly what came from where, what the source material does not cover, and the brand
          values the interface was built from.
        </p>
      </header>

      {/* ---------------- Source map ---------------- */}
      <section className="about__section" aria-labelledby="map-h">
        <h2 id="map-h">Source material mapping</h2>
        <p className="lead">
          Ten files were supplied. Each became one session, preserving the sequence the files
          themselves establish.
        </p>
        <ol className="sourcemap">
          {sourceMap.map((entry) => (
            <li key={entry.file} className="sourcemap__row">
              <code className="sourcemap__file">{entry.file}</code>
              <span className="sourcemap__arrow" aria-hidden="true">
                →
              </span>
              <span className="sourcemap__sessions">
                {entry.sessions.map((s) => (
                  <Link key={s.number} to={`/session/${course.sessions.find((c) => c.number === s.number)?.slug}`}>
                    Session {String(s.number).padStart(2, '0')} · {s.title}
                    {s.track === 'extension' && <em> (extension)</em>}
                  </Link>
                ))}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- Known gaps ---------------- */}
      <section className="about__section" aria-labelledby="gaps-h">
        <h2 id="gaps-h">What the source material does not contain</h2>
        <p className="lead">
          These are recorded rather than quietly worked around, because an instructor needs to know
          where the course is making a judgement call on their behalf.
        </p>
        <ol className="gaps">
          {course.knownGaps.map((gap, i) => (
            <li key={i} className="gaps__item">
              <div className="gaps__num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="gaps__body">
                <h3>{gap.title}</h3>
                <p>{gap.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- Timetable check ---------------- */}
      <section className="about__section" aria-labelledby="timing-h">
        <h2 id="timing-h">Timetable</h2>
        <p className="lead">
          The brief requires exactly ninety minutes of theory and ninety of practical in every
          session. This table is computed from the content itself, not written by hand — if an edit
          breaks the budget, it shows up here.
        </p>
        <div className="timing">
          <table className="timing__table">
            <thead>
              <tr>
                <th scope="col">Session</th>
                <th scope="col">Theory</th>
                <th scope="col">Practical</th>
                <th scope="col">Total</th>
                <th scope="col">
                  <span className="sr-only">Status</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {timings.map((t) => (
                <tr key={t.session} data-ok={t.ok}>
                  <th scope="row">
                    {String(t.session).padStart(2, '0')} · {t.title}
                  </th>
                  <td>{t.theoryMinutes} min</td>
                  <td>{t.practicalMinutes} min</td>
                  <td>{((t.theoryMinutes + t.practicalMinutes) / 60).toFixed(1)} h</td>
                  <td>
                    <span className="timing__flag" data-ok={t.ok}>
                      {t.ok ? '✓' : '✕'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Total contact time</th>
                <td colSpan={3}>
                  {timings.reduce((a, t) => a + t.theoryMinutes + t.practicalMinutes, 0) / 60} hours
                  across {timings.length} sessions
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* ---------------- Evidence vocabulary ---------------- */}
      <section className="about__section" aria-labelledby="ev-h">
        <h2 id="ev-h">The evidence vocabulary</h2>
        <p className="lead">
          The design system is built around a single idea: every statement in defensive work is one
          of six kinds, and saying which is the whole discipline. Each kind carries a colour, a
          shape, a glyph and a word, so none of the meaning rests on colour alone.
        </p>
        <EvidenceLegend />
      </section>

      {/* ---------------- Brand ---------------- */}
      <section className="about__section" aria-labelledby="brand-h">
        <h2 id="brand-h">Brand values</h2>
        <p className="lead">
          Colour and typography were read directly from the rendered CODED reference at{' '}
          <a href="https://coded-reels-playbook.vercel.app/" target="_blank" rel="noopener noreferrer">
            coded-reels-playbook.vercel.app
          </a>{' '}
          — its declared custom properties and computed type specimens. Nothing below was sampled
          from anywhere else, and nothing was guessed. Layout, navigation, the slide language and
          every interaction are original to this course.
        </p>

        <div className="brandref">
          <div className="brandref__group">
            <MonoLabel>Colour</MonoLabel>
            <ul className="swatches">
              {PALETTE.map((c) => (
                <li key={c.token} className="swatch">
                  <span className="swatch__chip" style={{ background: c.value }} aria-hidden="true" />
                  <span className="swatch__meta">
                    <code>{c.value}</code>
                    <span className="swatch__token">{c.token}</span>
                    <span className="swatch__role">{c.role}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="brandref__group">
            <MonoLabel>Typography</MonoLabel>
            <ul className="typeref">
              <li>
                <span className="typeref__sample" style={{ fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.025em' }}>
                  IBM Plex Sans
                </span>
                <span className="typeref__note">
                  400 / 500 / 600 / 700. Headings and body. Observed h1: 61.44px, weight 700,
                  letter-spacing −0.025em, line-height 1.04.
                </span>
              </li>
              <li>
                <span className="typeref__sample" style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 600 }}>
                  IBM Plex Mono
                </span>
                <span className="typeref__note">
                  500 / 600. Labels, counters, log excerpts and code. Observed mono label: 10–11px,
                  weight 600, uppercase, letter-spacing 0.24em.
                </span>
              </li>
              <li>
                <span className="eyebrow">Eyebrow treatment</span>
                <span className="typeref__note">
                  13px, weight 700, uppercase, letter-spacing 0.32em. The reference&rsquo;s most
                  distinctive typographic signature, reused here for section labels.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------- Glossary ---------------- */}
      <section className="about__section" aria-labelledby="gloss-h">
        <h2 id="gloss-h">Glossary</h2>
        <p className="lead">{glossary.length} terms, each linked to the session that introduces it.</p>
        <dl className="glossary glossary--full">
          {glossary.map((g) => (
            <div key={`${g.term}-${g.session}`} className="glossary__entry">
              <dt>{g.term}</dt>
              <dd>
                {g.definition}
                <Link to={`/session/${g.slug}`} className="glossary__link">
                  S{String(g.session).padStart(2, '0')}
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------------- Data and privacy ---------------- */}
      <section className="about__section" aria-labelledby="data-h">
        <h2 id="data-h">Your data</h2>
        <div className="prose">
          <p>
            This site has no accounts, no sign-in and no server. Nothing you do here is transmitted
            anywhere.
          </p>
          <p>
            Progress — which sections you mark complete and where you left off — is stored in this
            browser&rsquo;s local storage, <strong>on this device only</strong>. It will not follow
            you to another computer or another browser, and clearing site data removes it. Answers
            to knowledge checks and interactive exercises are held in memory for the current page
            only and are never saved at all.
          </p>
          <p>
            {isStorageAvailable()
              ? `Storage is working in this browser. You currently have saved progress for ${sessionsWithProgress} ${
                  sessionsWithProgress === 1 ? 'session' : 'sessions'
                }.`
              : 'Storage is unavailable in this browser, so nothing is being saved. Everything still works; nothing will be remembered.'}
          </p>
        </div>
        {sessionsWithProgress > 0 && (
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              if (
                window.confirm(
                  'Clear all saved progress for every session? This affects this browser only and cannot be undone.',
                )
              ) {
                resetAll()
              }
            }}
          >
            Clear all progress
          </button>
        )}
      </section>

      {/* ---------------- Integrity ---------------- */}
      <section className="about__section" aria-labelledby="integrity-h">
        <h2 id="integrity-h">Content integrity</h2>
        <div className="prose">
          <p>
            Every log line, alert, incident, address, domain, hash and host name in this course is
            synthetic and labelled as such wherever it appears. No real environment produced any of
            it, and no address or domain shown should be visited.
          </p>
          <p>
            Technical content derived from the supplied files is marked <strong>From source</strong>{' '}
            with the specific section cited. Content added for teaching is marked{' '}
            <strong>Supplementary</strong>; where it makes a technical claim beyond the source, it
            was checked against primary vendor or project documentation, and the recap of each
            session links those sources.
          </p>
          <p>
            Technique identifiers are reproduced as written in the source material. MITRE revises,
            renames and deprecates techniques between framework versions — confirm any identifier
            against{' '}
            <a href="https://attack.mitre.org/" target="_blank" rel="noopener noreferrer">
              attack.mitre.org
            </a>{' '}
            before quoting it in a report.
          </p>
          <p>
            Instructor answer keys, full investigation walkthroughs and solution files are
            deliberately <strong>not</strong> part of this bundle. Hiding them behind an interface
            control would not make them private — anything shipped to a browser is readable — so
            they are distributed separately. What is published here is the student-facing material
            only.
          </p>
        </div>
      </section>
    </div>
  )
}
