import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getSession, getBlock } from '@/content'
import { getPresentation, buildCount } from '@/content/presentations'
import { ProjectionSlide } from '@/components/presentation/ProjectionSlide'
import { MonoLabel, Wordmark } from '@/components/brand/Brand'
import { useAnnounce, useDocumentTitle, useFullscreen, useShortcuts } from '@/lib/hooks'
import { useProgress } from '@/lib/progress'
import { NotFound } from './NotFound'
import { LessonBackdrop } from '@/lessons/LessonLayers'
import { PresentCtx, useReducedMotion } from '@/motion'

/* =========================================================================
   PRESENTATION MODE
   =========================================================================
   Designed to disappear. The chrome fades after a few seconds of stillness
   and returns on any pointer movement or key press, so a projected slide is
   content and nothing else — but the controls are never actually removed
   from the accessibility tree, because a keyboard user must always be able
   to reach them.

   Deep links are real URLs: /session/soc-operations/present/7 is slide 7,
   it survives a refresh, and browser back and forward move through slides
   the way a presenter expects.
   ========================================================================= */

export function Present() {
  const { slug, index } = useParams()
  const navigate = useNavigate()
  const session = slug ? getSession(slug) : undefined
  const announce = useAnnounce()
  const { markViewed } = useProgress()
  const { isFullscreen, toggle: toggleFullscreen, supported: fullscreenSupported } = useFullscreen()

  const [chromeVisible, setChromeVisible] = useState(true)
  const [overviewOpen, setOverviewOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const idleTimer = useRef<number | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const [motionPaused, setMotionPaused] = useState(false)
  const reducedMotion = prefersReducedMotion || motionPaused
  useEffect(() => {
    document.documentElement.dataset.presentationMotion = reducedMotion ? 'off' : 'full'
    return () => { delete document.documentElement.dataset.presentationMotion }
  }, [reducedMotion])
  const pendingTransition = useRef<{ skipTransition: () => void } | null>(null)
  /* The slide most recently asked for. Relative steps read this rather than
     the rendered index, so two presses inside one frame move two slides. */
  const intended = useRef(0)
  /* The last slide this player navigated to itself, so the index-sync effect
     below can tell its own navigations from browser back/forward. */
  const committedByPlayer = useRef<number | null>(null)

  const slides = session ? getPresentation(session) : []
  const parsed = Number(index)
  const current = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), slides.length - 1) : 0
  const slide = slides[current]
  const [buildState, setBuildState] = useState({ index: current, count: 0 })
  const build = buildState.index === current ? buildState.count : 0
  const builds = slide ? buildCount(slide) : 0
  const buildRef = useRef({ index: current, count: 0 })
  if (buildRef.current.index !== current) buildRef.current = { index: current, count: 0 }

  /* Direction of travel, derived from the index rather than from which key
     was pressed, so browser back/forward and the overview animate correctly. */
  const previous = useRef<number | null>(null)
  const [direction, setDirection] = useState<-1 | 0 | 1>(0)
  useEffect(() => {
    if (previous.current !== null && previous.current !== current) {
      setDirection(current > previous.current ? 1 : -1)
    }
    previous.current = current
  }, [current])

  useDocumentTitle(
    session ? `${current + 1}/${slides.length} · ${session.title}` : 'Not found',
  )

  const go = useCallback(
    (next: number) => {
      if (!session) return
      const clamped = Math.min(Math.max(next, 0), slides.length - 1)
      if (clamped === intended.current) return
      const from = intended.current
      intended.current = clamped
      const to = `/session/${session.slug}/present/${clamped}`

      /* View Transitions: the DOM swaps immediately and the outgoing and
         incoming slides animate as snapshots, so a transition never delays
         the next key press. Lesson kits choreograph them in CSS through
         ::view-transition-old(slide) / ::view-transition-new(slide), reading
         :root[data-slide-dir] for direction. */
      const root = document.documentElement
      root.dataset.slideDir = clamped > from ? 'forward' : 'back'
      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => {
          skipTransition: () => void
          updateCallbackDone: Promise<void>
          ready?: Promise<void>
          finished?: Promise<void>
        }
      }

      // A transition already waiting for its frame: finish it instantly and
      // navigate directly, so rapid key presses are never coalesced.
      if (pendingTransition.current) {
        pendingTransition.current.skipTransition()
        pendingTransition.current = null
      }

      if (!doc.startViewTransition || reducedMotion) {
        committedByPlayer.current = clamped
        navigate(to)
        return
      }

      /* The update callback waits for the browser's next rendering frame.
         On a busy main thread or a throttled background tab that frame can
         be late, and navigation must never wait on decoration: if the
         callback has not run within 120ms, navigate anyway and drop the
         animation. `committed` guarantees exactly one history entry. */
      let committed = false
      const commit = () => {
        if (committed) return
        committed = true
        committedByPlayer.current = clamped
        flushSync(() => navigate(to))
      }
      const vt = doc.startViewTransition(commit)
      // Skipping an interrupted snapshot rejects ready; that is expected,
      // and must not surface as an unhandled error during rapid navigation.
      void vt.ready?.catch(() => undefined)
      void vt.finished?.catch(() => undefined)
      // Skipping must commit this navigation synchronously, before the next
      // one, or an older target could land after a newer one.
      const handle = {
        skipTransition: () => {
          commit()
          vt.skipTransition()
        },
      }
      pendingTransition.current = handle
      const safety = window.setTimeout(() => {
        if (!committed) {
          commit()
          vt.skipTransition()
        }
      }, 120)
      void vt.updateCallbackDone.catch(() => undefined).finally(() => window.clearTimeout(safety))
      void (vt.finished ?? vt.updateCallbackDone).catch(() => undefined).finally(() => {
        if (pendingTransition.current === handle) pendingTransition.current = null
      })
    },
    [session, slides.length, navigate, reducedMotion],
  )

  const step = useCallback((delta: number) => {
    if (overviewOpen || helpOpen) return
    const active = slides[intended.current]
    const count = active ? buildCount(active) : 0
    if (buildRef.current.index !== intended.current) buildRef.current = { index: intended.current, count: 0 }
    const value = buildRef.current.count
    if (delta > 0 && value < count) {
      buildRef.current = { index: intended.current, count: value + 1 }
      setBuildState(buildRef.current)
    } else if (delta < 0 && value > 0) {
      buildRef.current = { index: intended.current, count: value - 1 }
      setBuildState(buildRef.current)
    } else go(intended.current + delta)
  }, [go, slides, overviewOpen, helpOpen])

  /* Keep the intended slide honest when the URL changes by other means:
     browser back/forward, the overview, a deep link. */
  useEffect(() => {
    if (current === committedByPlayer.current) {
      committedByPlayer.current = null
      return
    }
    intended.current = current
  }, [current])


  /* Redirect an out-of-range index to a valid one so a stale or hand-typed
     URL lands somewhere real rather than on a blank screen. */
  useEffect(() => {
    if (!session) return
    if (!Number.isFinite(parsed) || parsed !== current) {
      navigate(`/session/${session.slug}/present/${current}`, { replace: true })
    }
  }, [session, parsed, current, navigate])

  useEffect(() => {
    if (!session || !slide) return
    markViewed(session.slug, slide.sourceId, 'present', slide.id)
    announce(`Slide ${current + 1} of ${slides.length}. ${slide.title}`)
  }, [session, slide, current, slides.length, markViewed, announce])

  /* Chrome auto-hide. Any input brings it back. */
  const wake = useCallback(() => {
    setChromeVisible(true)
    if (idleTimer.current) window.clearTimeout(idleTimer.current)
    idleTimer.current = window.setTimeout(() => setChromeVisible(false), 3200)
  }, [])

  useEffect(() => {
    wake()
    window.addEventListener('pointermove', wake)
    window.addEventListener('keydown', wake)
    return () => {
      window.removeEventListener('pointermove', wake)
      window.removeEventListener('keydown', wake)
      if (idleTimer.current) window.clearTimeout(idleTimer.current)
    }
  }, [wake])

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* Clipboard unavailable. The address bar still holds the link. */
    }
  }, [])

  /* Shortcuts stand down while typing or inside a control — see
     isTypingTarget in lib/hooks. */
  useShortcuts({
    ArrowRight: () => step(1),
    ArrowLeft: () => step(-1),
    ' ': (e) => {
      e.preventDefault()
      step(1)
    },
    PageDown: () => step(1),
    PageUp: () => step(-1),
    Home: () => go(0),
    End: () => go(slides.length - 1),
    m: () => setMotionPaused(value => !value),
    a: () => { buildRef.current = { index: current, count: builds }; setBuildState(buildRef.current) },
    f: () => void toggleFullscreen(),
    o: () => setOverviewOpen((v) => !v),
    '?': () => setHelpOpen((v) => !v),
    Escape: () => {
      if (helpOpen) setHelpOpen(false)
      else if (overviewOpen) setOverviewOpen(false)
    },
  })

  if (!session || !slide) return <NotFound />

  const isPractical = slide.half === 'practical'
  const progressPct = ((current + 1) / slides.length) * 100
  const stage = {
    surface: 'present' as const,
    session,
    slideIndex: current,
    slideCount: slides.length,
    block: getBlock(session, slide.sourceId),
    half: isPractical ? ('practical' as const) : ('theory' as const),
    direction,
    focusMode: !chromeVisible,
    reducedMotion,
  }

  return (
    <PresentCtx.Provider
      value={{ presenting: true, slideIndex: current, direction, focusMode: !chromeVisible }}
    >
    <div
      className={`present present--deck${chromeVisible ? ' chrome-on' : ' chrome-off'}`}
      data-half={stage.half}
      data-kind={slide.kind}
    >
      <LessonBackdrop {...stage} />
      {/* ---------------- Top bar ---------------- */}
      <header className="present__top">
        <div className="present__top-left">
          <Link to={`/session/${session.slug}`} className="present__exit">
            <span aria-hidden="true">←</span> Exit
          </Link>
          <span className="present__session">
            <MonoLabel>
              S{String(session.number).padStart(2, '0')} ·{' '}
              {isPractical ? 'Practical' : 'Theory'}
            </MonoLabel>
            <span className="present__session-title">{session.title}</span>
          </span>
        </div>

        <div className="present__top-right">
          <button type="button" className="btn btn--ghost btn--sm" onClick={copyLink}>
            {copied ? 'Link copied' : 'Copy slide link'}
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setOverviewOpen(true)}
            aria-haspopup="dialog"
          >
            Overview <kbd>O</kbd>
          </button>
          <button type="button" className="btn btn--ghost btn--sm" aria-pressed={!reducedMotion}
            onClick={() => setMotionPaused(value => !value)} disabled={prefersReducedMotion}
            title={prefersReducedMotion ? 'Reduced motion follows your device setting' : 'Toggle presentation motion'}>
            Motion {reducedMotion ? 'off' : 'on'} <kbd>M</kbd>
          </button>
          {fullscreenSupported && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => void toggleFullscreen()}>
              {isFullscreen ? 'Exit full screen' : 'Full screen'} <kbd>F</kbd>
            </button>
          )}
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setHelpOpen(true)}
            aria-haspopup="dialog"
            aria-label="Keyboard shortcuts"
          >
            <kbd>?</kbd>
          </button>
        </div>
      </header>

      {/* ---------------- Slide ---------------- */}
      <ProjectionSlide frame={slide} build={build} number={current + 1} total={slides.length} sessionNumber={session.number} motionEnabled={!reducedMotion} />

      {/* ---------------- Bottom bar ---------------- */}
      <footer className="present__bottom">
        <div className="present__progress" aria-hidden="true">
          <span style={{ width: `${progressPct}%` }} />
        </div>
        <div className="present__controls">
          <button
            type="button"
            className="btn btn--icon"
            onClick={() => step(-1)}
            disabled={current === 0 && build === 0}
            aria-label="Previous point or slide"
          >
            <span aria-hidden="true">←</span>
          </button>

          <span className="present__counter" aria-live="off">
            <strong>{current + 1}</strong>
            <span aria-hidden="true"> / </span>
            <span className="sr-only">of</span>
            {slides.length}
          </span>

          <button
            type="button"
            className="btn btn--icon"
            onClick={() => step(1)}
            disabled={current === slides.length - 1 && build === builds}
            aria-label="Next point or slide"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
        <span className="present__build">{builds > 0 ? `Build ${build + 1}/${builds + 1}` : slide.kind === 'section' ? 'Section outline' : 'All points visible'}</span>
        <Link className="btn btn--ghost btn--sm" to={`/session/${session.slug}/${isPractical ? 'practical' : 'study'}#${slide.sourceId}`} target="_blank" rel="noreferrer">{isPractical ? 'Open exercise' : 'Full explanation'}</Link>
        <div className="present__slide-title">{slide.title}</div>
      </footer>

      {/* ---------------- Slide overview ---------------- */}
      {overviewOpen && (
        <div
          className="present__overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Slide overview"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOverviewOpen(false)
          }}
        >
          <div className="present__overview">
            <header className="present__overview-head">
              <div>
                <Wordmark compact />
                <h2>
                  Session {session.number} · {slides.length} slides
                </h2>
              </div>
              <button
                type="button"
                className="btn btn--icon"
                onClick={() => setOverviewOpen(false)}
                aria-label="Close overview"
                autoFocus
              >
                <span aria-hidden="true">✕</span>
              </button>
            </header>

            <ol className="present__overview-grid">
              {slides.map((s, i) => {
                const practical = s.half === 'practical'
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      className="present__thumb"
                      data-current={i === current}
                      data-area={practical ? 'practical' : 'theory'}
                      onClick={() => {
                        go(i)
                        setOverviewOpen(false)
                      }}
                    >
                      <span className="present__thumb-num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="present__thumb-title">{s.title}</span>
                      <span className="present__thumb-kind">{s.kind}</span>

                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      )}

      {/* ---------------- Shortcut help ---------------- */}
      {helpOpen && (
        <div
          className="present__overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
          onClick={(e) => {
            if (e.target === e.currentTarget) setHelpOpen(false)
          }}
        >
          <div className="present__help">
            <header className="present__help-head">
              <h2>Keyboard shortcuts</h2>
              <button
                type="button"
                className="btn btn--icon"
                onClick={() => setHelpOpen(false)}
                aria-label="Close shortcuts"
                autoFocus
              >
                <span aria-hidden="true">✕</span>
              </button>
            </header>
            <dl className="present__help-list">
              <div>
                <dt>
                  <kbd>→</kbd> <kbd>Space</kbd> <kbd>PgDn</kbd>
                </dt>
                <dd>Reveal next point, then next slide</dd>
              </div>
              <div>
                <dt>
                  <kbd>←</kbd> <kbd>PgUp</kbd>
                </dt>
                <dd>Previous point or slide</dd>
              </div>
              <div>
                <dt>
                  <kbd>Home</kbd> <kbd>End</kbd>
                </dt>
                <dd>First or last slide</dd>
              </div>
              <div><dt><kbd>M</kbd></dt><dd>Toggle motion (respects device reduced motion)</dd></div>
              <div><dt><kbd>A</kbd></dt><dd>Reveal all points on this slide</dd></div>
              <div>
                <dt>
                  <kbd>O</kbd>
                </dt>
                <dd>Slide overview</dd>
              </div>
              <div>
                <dt>
                  <kbd>F</kbd>
                </dt>
                <dd>Full screen</dd>
              </div>
              <div>
                <dt>
                  <kbd>?</kbd>
                </dt>
                <dd>This help</dd>
              </div>
              <div>
                <dt>
                  <kbd>Esc</kbd>
                </dt>
                <dd>Close any overlay</dd>
              </div>
            </dl>
            <p className="present__help-note">
              Shortcuts are suspended while you are typing in a field or using a control, so a
              knowledge check or a slide-jump box never advances the deck. The current slide is in
              the address bar — copy it to share this exact slide.
            </p>
          </div>
        </div>
      )}
    </div>
    </PresentCtx.Provider>
  )
}
