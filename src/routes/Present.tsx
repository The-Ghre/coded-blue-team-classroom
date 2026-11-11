import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getSession, getSlides } from '@/content'
import { BlockView } from '@/components/teaching/blocks'
import { MonoLabel, Wordmark } from '@/components/brand/Brand'
import { useAnnounce, useDocumentTitle, useFullscreen, useShortcuts } from '@/lib/hooks'
import { useProgress } from '@/lib/progress'
import { NotFound } from './NotFound'

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

  const slides = session ? getSlides(session) : []
  const parsed = Number(index)
  const current = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), slides.length - 1) : 0
  const slide = slides[current]

  useDocumentTitle(
    session ? `${current + 1}/${slides.length} · ${session.title}` : 'Not found',
  )

  const go = useCallback(
    (next: number) => {
      if (!session) return
      const clamped = Math.min(Math.max(next, 0), slides.length - 1)
      if (clamped === current) return
      navigate(`/session/${session.slug}/present/${clamped}`)
    },
    [session, slides.length, current, navigate],
  )

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
    markViewed(session.slug, slide.id, 'present')
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
    ArrowRight: () => go(current + 1),
    ArrowLeft: () => go(current - 1),
    ' ': (e) => {
      e.preventDefault()
      go(current + 1)
    },
    PageDown: () => go(current + 1),
    PageUp: () => go(current - 1),
    Home: () => go(0),
    End: () => go(slides.length - 1),
    f: () => void toggleFullscreen(),
    o: () => setOverviewOpen((v) => !v),
    '?': () => setHelpOpen((v) => !v),
    Escape: () => {
      if (helpOpen) setHelpOpen(false)
      else if (overviewOpen) setOverviewOpen(false)
    },
  })

  if (!session || !slide) return <NotFound />

  const isPractical = session.practical.blocks.some((b) => b.id === slide.id)
  const progressPct = ((current + 1) / slides.length) * 100

  return (
    <div className={`present${chromeVisible ? ' chrome-on' : ' chrome-off'}`}>
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
      <main className="present__stage">
        <div className="present__slide" key={slide.id}>
          <BlockView block={slide} mode="slide" />
        </div>
      </main>

      {/* ---------------- Bottom bar ---------------- */}
      <footer className="present__bottom">
        <div className="present__progress" aria-hidden="true">
          <span style={{ width: `${progressPct}%` }} />
        </div>
        <div className="present__controls">
          <button
            type="button"
            className="btn btn--icon"
            onClick={() => go(current - 1)}
            disabled={current === 0}
            aria-label="Previous slide"
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
            onClick={() => go(current + 1)}
            disabled={current === slides.length - 1}
            aria-label="Next slide"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
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
                const practical = session.practical.blocks.some((b) => b.id === s.id)
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
                      {s.minutes ? <span className="present__thumb-min">{s.minutes}m</span> : null}
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
                <dd>Next slide</dd>
              </div>
              <div>
                <dt>
                  <kbd>←</kbd> <kbd>PgUp</kbd>
                </dt>
                <dd>Previous slide</dd>
              </div>
              <div>
                <dt>
                  <kbd>Home</kbd> <kbd>End</kbd>
                </dt>
                <dd>First or last slide</dd>
              </div>
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
  )
}
