import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getSession } from '@/content'
import { BlockView } from '@/components/teaching/blocks'
import { Eyebrow, MonoLabel } from '@/components/brand/Brand'
import { useProgress } from '@/lib/progress'
import { useDocumentTitle } from '@/lib/hooks'
import { NotFound } from './NotFound'
import { LessonBackdrop, LessonHero } from '@/lessons/LessonLayers'
import { useReducedMotion } from '@/motion'

/**
 * Study and practical are the same reader over different halves of the
 * session, because the only thing that differs is which blocks are shown
 * and which link is highlighted. Keeping them one component means a fix to
 * reading, printing, progress or the contents rail lands in both.
 */
export function Study({ area }: { area: 'theory' | 'practical' }) {
  const { slug } = useParams()
  const { hash } = useLocation()
  const session = slug ? getSession(slug) : undefined
  const { forSession, toggleBlock, markViewed } = useProgress()
  const [activeId, setActiveId] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const reducedMotion = useReducedMotion()
  // Evaluated once at mount: the contents list starts collapsed on a phone
  // and open on a laptop, where it is a persistent sidebar.
  const [isNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 68rem)').matches,
  )

  const blocks = useMemo(
    () => (session ? (area === 'theory' ? session.theory.blocks : session.practical.blocks) : []),
    [session, area],
  )

  useDocumentTitle(
    session
      ? `${area === 'theory' ? 'Study' : 'Workshop'} — Session ${session.number}: ${session.title}`
      : 'Not found',
  )

  /* Track which section is on screen, for the contents rail. */
  useEffect(() => {
    if (!blocks.length) return
    observerRef.current?.disconnect()
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 },
    )
    blocks.forEach((b) => {
      const el = document.getElementById(b.id)
      if (el) observer.observe(el)
    })
    observerRef.current = observer
    return () => observer.disconnect()
  }, [blocks])

  /* Record the resume position. */
  useEffect(() => {
    if (!session || !activeId) return
    markViewed(session.slug, activeId, area === 'theory' ? 'study' : 'practical')
  }, [session, activeId, area, markViewed])

  /* Honour a deep-linked section. */
  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (el) {
      el.scrollIntoView({ block: 'start' })
      setActiveId(hash.slice(1))
    }
  }, [hash, blocks])

  if (!session) return <NotFound />

  const progress = forSession(session.slug)
  const minutes = blocks.reduce((t, b) => t + (b.minutes ?? 0), 0)

  return (
    <div className="study" data-half={area}>
      <LessonBackdrop
        surface="study"
        session={session}
        slideIndex={0}
        slideCount={0}
        half={area}
        direction={0}
        focusMode={false}
        reducedMotion={reducedMotion}
      />
      {/* ---------------- Contents rail ---------------- */}
      <aside className="study__rail" aria-label="Contents">
        <div className="study__rail-inner">
          <Link to={`/session/${session.slug}`} className="study__back">
            <span aria-hidden="true">←</span> Session {session.number}
          </Link>

          <div className="study__mode" role="group" aria-label="Session part">
            <Link
              to={`/session/${session.slug}/study`}
              className="study__mode-btn"
              aria-current={area === 'theory'}
            >
              Theory
            </Link>
            <Link
              to={`/session/${session.slug}/practical`}
              className="study__mode-btn"
              aria-current={area === 'practical'}
            >
              Workshop
            </Link>
          </div>

          <div className="study__rail-meta">
            <MonoLabel>
              {blocks.length} sections · {minutes} min
            </MonoLabel>
          </div>

          {/* On a narrow screen the full contents list pushes the lesson off
              the first screen entirely, so it starts collapsed there and open
              on a laptop, where the rail is a sticky sidebar. */}
          <details className="study__toc-wrap" open={!isNarrow}>
            <summary className="study__toc-summary">
              Contents
              <span className="study__toc-count">{blocks.length}</span>
            </summary>
            <nav className="study__toc" aria-label="Sections">
            <ol>
              {blocks.map((b, i) => {
                const complete = progress.completed.includes(b.id)
                return (
                  <li key={b.id}>
                    <a
                      href={`#${b.id}`}
                      className="study__toc-link"
                      aria-current={activeId === b.id}
                      data-complete={complete}
                    >
                      <span className="study__toc-num" aria-hidden="true">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="study__toc-title">{b.title}</span>
                      {complete && (
                        <span className="study__toc-check" aria-label="marked complete">
                          ✓
                        </span>
                      )}
                    </a>
                  </li>
                )
              })}
            </ol>
            </nav>
          </details>

          <div className="study__rail-actions">
            <Link className="btn btn--sm" to={`/session/${session.slug}/present`}>
              Present this session
            </Link>
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => window.print()}>
              Print / save as PDF
            </button>
          </div>
        </div>
      </aside>

      {/* ---------------- Reading column ---------------- */}
      <div className="study__content">
        <LessonHero
          surface="study"
          session={session}
          slideIndex={0}
          slideCount={0}
          half={area}
          direction={0}
          focusMode={false}
          reducedMotion={reducedMotion}
          eyebrow={`Session ${String(session.number).padStart(2, '0')} · ${
            area === 'theory' ? 'Theory' : session.practical.title
          }`}
          lead={
            area === 'practical'
              ? 'Every resource this workshop references is self-contained and synthetic. There is no live SIEM, no connected EDR and no remote lab — each briefing states exactly what is simulated and what would differ with real tooling.'
              : undefined
          }
          fallback={
            <header className="study__header">
              <Eyebrow>
                Session {String(session.number).padStart(2, '0')} ·{' '}
                {area === 'theory' ? 'Theory' : session.practical.title}
              </Eyebrow>
              <h1>{session.title}</h1>
              {area === 'practical' && (
                <p className="lead">
                  Every resource this workshop references is self-contained and synthetic. There is
                  no live SIEM, no connected EDR and no remote lab — each briefing states exactly
                  what is simulated and what would differ with real tooling.
                </p>
              )}
            </header>
          }
        />

        {blocks.map((block, i) => {
          const complete = progress.completed.includes(block.id)
          return (
            <section key={block.id} id={block.id} className="study__section">
              <div className="study__section-tools">
                <span className="study__section-index" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  className="study__complete"
                  aria-pressed={complete}
                  onClick={() => toggleBlock(session.slug, block.id)}
                >
                  <span aria-hidden="true">{complete ? '✓' : '○'}</span>
                  {complete ? 'Completed' : 'Mark complete'}
                </button>
                <a
                  className="study__permalink"
                  href={`#${block.id}`}
                  title="Link to this section"
                  aria-label={`Link to ${block.title}`}
                >
                  #
                </a>
              </div>

              <BlockView block={block} mode="study" />
            </section>
          )
        })}

        <nav className="study__next" aria-label="Continue">
          {area === 'theory' ? (
            <Link className="btn btn--primary" to={`/session/${session.slug}/practical`}>
              Continue to the workshop <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <>
              {session.number < 10 && (
                <Link
                  className="btn btn--primary"
                  to={`/session/${
                    getSession(session.number + 1)?.slug ?? session.slug
                  }`}
                >
                  Next: Session {session.number + 1} <span aria-hidden="true">→</span>
                </Link>
              )}
              <Link className="btn" to="/">
                Back to the roadmap
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  )
}
