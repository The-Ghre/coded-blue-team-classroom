import { Link } from 'react-router-dom'
import { course, sessions } from '@/content'
import { EvidenceLegend, Eyebrow, MonoLabel } from '@/components/brand/Brand'
import { useProgress, isStorageAvailable } from '@/lib/progress'
import { useDocumentTitle } from '@/lib/hooks'

function ProgressNotice() {
  const available = isStorageAvailable()
  return (
    <aside className="progress-notice">
      <span aria-hidden="true" className="progress-notice__glyph">
        ⓘ
      </span>
      {/* The text is a single flow child so that <strong> stays inline rather
          than becoming a flex item of the surrounding row. */}
      <span className="progress-notice__text">
        {available ? (
          <>
            Progress is saved in <strong>this browser on this device only</strong>. It is never sent
            anywhere, it will not follow you to another computer, and clearing site data removes it.
            No account is needed and none exists.
          </>
        ) : (
          <>
            <strong>Progress cannot be saved in this browser.</strong> Storage is unavailable — this
            usually means private browsing or blocked site data. Everything still works; nothing
            will be remembered between visits.
          </>
        )}
      </span>
    </aside>
  )
}

export function Home() {
  useDocumentTitle('CODED Blue Team Classroom')
  const { forSession } = useProgress()

  const core = sessions.filter((s) => s.track === 'core')
  const extension = sessions.filter((s) => s.track === 'extension')

  const totalHours = sessions.length * 3

  return (
    <div className="home">
      {/* ---------------- Hero ---------------- */}
      <section className="hero">
        <div className="hero__inner">
          <Eyebrow>CODED · Defensive Security Track</Eyebrow>
          <h1 className="hero__h">
            Detection is a <span className="hero__accent">decision</span>,
            <br />
            made from incomplete evidence.
          </h1>
          <p className="hero__lead">{course.description}</p>

          <dl className="hero__stats">
            <div>
              <dt>Sessions</dt>
              <dd>{sessions.length}</dd>
            </div>
            <div>
              <dt>Contact hours</dt>
              <dd>{totalHours}</dd>
            </div>
            <div>
              <dt>Per session</dt>
              <dd>90 + 90 min</dd>
            </div>
            <div>
              <dt>Workshops</dt>
              <dd>{sessions.length}</dd>
            </div>
          </dl>

          <div className="hero__actions">
            <Link className="btn btn--primary" to={`/session/${sessions[0].slug}`}>
              Start Session 01
            </Link>
            <Link className="btn" to="/about">
              How this course was built
            </Link>
          </div>
        </div>

        <div className="hero__aside">
          <EvidenceLegend />
        </div>
      </section>

      {/* ---------------- Roadmap ---------------- */}
      <section className="roadmap" aria-labelledby="roadmap-h">
        <div className="roadmap__head">
          <Eyebrow>The roadmap</Eyebrow>
          <h2 id="roadmap-h">Eight core sessions, two extensions</h2>
          <p className="lead">
            The sequence follows the order established in the source material. Each session assumes
            the one before it, and each practical applies that session&rsquo;s theory rather than
            revisiting an earlier one.
          </p>
          <ProgressNotice />
        </div>

        <TrackGroup label="Core track" sessions={core} forSession={forSession} />
        <TrackGroup
          label="Extension sessions"
          note="Marked optional in the source material. Run them when the cohort has time; they assume the full core track."
          sessions={extension}
          forSession={forSession}
        />
      </section>
    </div>
  )
}

function TrackGroup({
  label,
  note,
  sessions: list,
  forSession,
}: {
  label: string
  note?: string
  sessions: typeof sessions
  forSession: (slug: string) => { completed: string[]; lastBlockId?: string; lastMode?: string }
}) {
  return (
    <div className="track">
      <div className="track__head">
        <MonoLabel>{label}</MonoLabel>
        {note && <p className="track__note">{note}</p>}
      </div>

      <ol className="track__list">
        {list.map((s) => {
          const progress = forSession(s.slug)
          const totalBlocks = s.theory.blocks.length + s.practical.blocks.length
          const done = progress.completed.length
          const pct = totalBlocks ? Math.round((done / totalBlocks) * 100) : 0

          return (
            <li key={s.slug} className="track__item">
              <article className="scard" data-track={s.track}>
                <div className="scard__rail" aria-hidden="true">
                  <span className="scard__num">{String(s.number).padStart(2, '0')}</span>
                </div>

                <div className="scard__body">
                  <header className="scard__head">
                    <h3 className="scard__title">
                      <Link to={`/session/${s.slug}`}>{s.title}</Link>
                    </h3>
                    <ul className="scard__themes">
                      {s.themes.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </header>

                  <p className="scard__summary">{s.summary}</p>

                  <div className="scard__split">
                    <div className="scard__half">
                      <MonoLabel>Theory · 90 min</MonoLabel>
                      <p>{s.theory.blocks.filter((b) => b.kind === 'concept' || b.kind === 'compare').length} concepts, {s.theory.blocks.length} slides</p>
                    </div>
                    <div className="scard__half">
                      <MonoLabel>Practical · 90 min</MonoLabel>
                      <p>{s.practical.title.replace(/^Workshop: /, '')}</p>
                    </div>
                  </div>

                  <details className="scard__outcomes">
                    <summary>
                      {s.outcomes.length} learning outcomes
                      {s.prerequisites.length > 0 && ` · ${s.prerequisites.length} prerequisites`}
                    </summary>
                    <div className="scard__outcomes-body">
                      <MonoLabel>By the end you can</MonoLabel>
                      <ul>
                        {s.outcomes.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                      {s.prerequisites.length > 0 && (
                        <>
                          <MonoLabel>Assumes</MonoLabel>
                          <ul>
                            {s.prerequisites.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </details>

                  <footer className="scard__foot">
                    <div className="scard__actions">
                      <Link className="btn btn--sm" to={`/session/${s.slug}`}>
                        Overview
                      </Link>
                      <Link className="btn btn--sm" to={`/session/${s.slug}/study`}>
                        Study
                      </Link>
                      <Link className="btn btn--sm" to={`/session/${s.slug}/practical`}>
                        Workshop
                      </Link>
                      <Link className="btn btn--sm btn--primary" to={`/session/${s.slug}/present`}>
                        Present
                      </Link>
                    </div>

                    {done > 0 && (
                      <div className="scard__progress">
                        <div
                          className="scard__progress-bar"
                          role="progressbar"
                          aria-valuenow={pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Session ${s.number} progress`}
                        >
                          <span style={{ width: `${pct}%` }} />
                        </div>
                        <span className="scard__progress-text">
                          {done} of {totalBlocks} marked complete
                        </span>
                      </div>
                    )}
                  </footer>
                </div>
              </article>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
