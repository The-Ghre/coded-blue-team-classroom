import { Link, useParams } from 'react-router-dom'
import { getSession, getSlides } from '@/content'
import { Eyebrow, EvidenceLegend, MonoLabel } from '@/components/brand/Brand'
import { useProgress } from '@/lib/progress'
import { useDocumentTitle } from '@/lib/hooks'
import { NotFound } from './NotFound'
import { LessonBackdrop, LessonHero } from '@/lessons/LessonLayers'
import { useReducedMotion } from '@/motion'

export function SessionOverview() {
  const { slug } = useParams()
  const session = slug ? getSession(slug) : undefined
  useDocumentTitle(
    session ? `Session ${session.number}: ${session.title} — CODED Blue Team Classroom` : 'Not found',
  )
  const { forSession, resetSession } = useProgress()
  const reducedMotion = useReducedMotion()

  if (!session) return <NotFound />

  const progress = forSession(session.slug)
  const slides = getSlides(session)
  const resumeIndex = progress.lastBlockId
    ? slides.findIndex((b) => b.id === progress.lastBlockId)
    : -1

  const actionsNode = (
    <div className="overview__actions">
      <Link className="btn btn--primary" to={`/session/${session.slug}/present`}>
        <span aria-hidden="true">▸</span> Present
      </Link>
      <Link className="btn" to={`/session/${session.slug}/study`}>
        Study the theory
      </Link>
      <Link className="btn" to={`/session/${session.slug}/practical`}>
        Open the workshop
      </Link>
      {resumeIndex >= 0 && (
        <Link
          className="btn btn--ghost"
          to={
            progress.lastMode === 'present'
              ? `/session/${session.slug}/present/${resumeIndex}`
              : `/session/${session.slug}/${
                  progress.lastMode === 'practical' ? 'practical' : 'study'
                }#${progress.lastBlockId}`
          }
        >
          Resume: {slides[resumeIndex]?.title}
        </Link>
      )}
    </div>
  )

  return (
    <article className="overview">
      <LessonBackdrop
        surface="overview"
        session={session}
        slideIndex={0}
        slideCount={slides.length}
        half="theory"
        direction={0}
        focusMode={false}
        reducedMotion={reducedMotion}
      />
      <LessonHero
        surface="overview"
        session={session}
        slideIndex={0}
        slideCount={slides.length}
        half="theory"
        direction={0}
        focusMode={false}
        reducedMotion={reducedMotion}
        eyebrow={`Session ${String(session.number).padStart(2, '0')} · ${session.track === 'core' ? 'Core track' : 'Extension session'}`}
        lead={session.abstract}
        actions={actionsNode}
        fallback={
          <header className="overview__head">
            <Eyebrow>
              Session {String(session.number).padStart(2, '0')} ·{' '}
              {session.track === 'core' ? 'Core track' : 'Extension session'}
            </Eyebrow>
            <h1>{session.title}</h1>
            <p className="lead overview__abstract">{session.abstract}</p>
            {actionsNode}
          </header>
        }
      />

      <div className="overview__grid">
        <section className="overview__panel">
          <MonoLabel>Learning outcomes</MonoLabel>
          <ul className="overview__outcomes">
            {session.outcomes.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </section>

        <section className="overview__panel">
          <MonoLabel>Prerequisites</MonoLabel>
          <ul className="overview__prereq">
            {session.prerequisites.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* ---------------- Structure ---------------- */}
      <section className="overview__structure" aria-labelledby="structure-h">
        <h2 id="structure-h">Session structure</h2>
        <p className="lead">
          Three hours. Ninety minutes of theory, then ninety minutes applying it. The timings below
          are the planned budget for each part.
        </p>

        <div className="structure">
          <div className="structure__half">
            <div className="structure__head">
              <MonoLabel>Theory · 90 minutes</MonoLabel>
            </div>
            <ol className="structure__list">
              {session.theory.blocks.map((b, i) => (
                <li key={b.id} className="structure__item">
                  <Link to={`/session/${session.slug}/study#${b.id}`}>
                    <span className="structure__num" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="structure__title">{b.title}</span>
                    {b.minutes ? (
                      <span className="structure__min">{b.minutes}m</span>
                    ) : (
                      <span className="structure__min structure__min--ref">ref</span>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <div className="structure__half">
            <div className="structure__head">
              <MonoLabel>Practical · 90 minutes</MonoLabel>
              <p className="structure__workshop">{session.practical.title}</p>
            </div>
            <ol className="structure__list">
              {session.practical.blocks.map((b, i) => (
                <li key={b.id} className="structure__item">
                  <Link to={`/session/${session.slug}/practical#${b.id}`}>
                    <span className="structure__num" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="structure__title">{b.title}</span>
                    {b.minutes ? (
                      <span className="structure__min">{b.minutes}m</span>
                    ) : (
                      <span className="structure__min structure__min--ref">ref</span>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------------- Source provenance ---------------- */}
      <section className="overview__source" aria-labelledby="source-h">
        <h2 id="source-h">Where this session comes from</h2>
        <div className="overview__source-files">
          <MonoLabel>Built from</MonoLabel>
          <ul>
            {session.sourceFiles.map((f) => (
              <li key={f}>
                <code>{f}</code>
              </li>
            ))}
          </ul>
        </div>

        {session.sourceNotes?.length ? (
          <div className="overview__source-notes">
            <MonoLabel>Notes on the source material</MonoLabel>
            <ul>
              {session.sourceNotes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {session.terms?.length ? (
        <section className="overview__terms" aria-labelledby="terms-h">
          <h2 id="terms-h">Terms introduced here</h2>
          <dl className="glossary">
            {session.terms.map((t) => (
              <div key={t.term} className="glossary__entry">
                <dt>{t.term}</dt>
                <dd>{t.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section className="overview__legend">
        <EvidenceLegend compact />
      </section>

      {progress.completed.length > 0 && (
        <section className="overview__reset">
          <p>
            You have marked {progress.completed.length} of {slides.length} sections complete in this
            session, on this device.
          </p>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              if (
                window.confirm(
                  `Clear your saved progress for Session ${session.number}? This affects this browser only and cannot be undone.`,
                )
              ) {
                resetSession(session.slug)
              }
            }}
          >
            Clear progress for this session
          </button>
        </section>
      )}
    </article>
  )
}
