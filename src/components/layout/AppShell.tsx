import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Wordmark } from '@/components/brand/Brand'
import { sessions } from '@/content'

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="shell__header">
        <div className="shell__header-inner">
          <Link to="/" className="shell__brand" onClick={() => setNavOpen(false)}>
            <Wordmark />
          </Link>

          <button
            type="button"
            className="shell__nav-toggle btn btn--icon"
            aria-expanded={navOpen}
            aria-controls="shell-nav"
            aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setNavOpen((v) => !v)}
          >
            <span aria-hidden="true">{navOpen ? '✕' : '☰'}</span>
          </button>

          <nav
            id="shell-nav"
            className={`shell__nav${navOpen ? ' is-open' : ''}`}
            aria-label="Primary"
          >
            <NavLink to="/" end onClick={() => setNavOpen(false)}>
              Roadmap
            </NavLink>
            <NavLink to="/search" onClick={() => setNavOpen(false)}>
              Search
            </NavLink>
            <NavLink to="/about" onClick={() => setNavOpen(false)}>
              About this course
            </NavLink>
          </nav>
        </div>

        {/* A thin session rail, so moving between sessions never needs a
            trip back to the roadmap. Hidden on the roadmap itself. */}
        {pathname !== '/' && (
          <div className="shell__rail" aria-label="Sessions">
            <ol className="shell__rail-list">
              {sessions.map((s) => (
                <li key={s.slug}>
                  <NavLink
                    to={`/session/${s.slug}`}
                    className="shell__rail-item"
                    data-track={s.track}
                    title={`Session ${s.number} — ${s.title}`}
                  >
                    <span className="shell__rail-num">
                      {String(s.number).padStart(2, '0')}
                    </span>
                    <span className="shell__rail-title">{s.title}</span>
                  </NavLink>
                </li>
              ))}
            </ol>
          </div>
        )}
      </header>

      <main id="main" className="shell__main">
        <Outlet />
      </main>

      <footer className="shell__footer">
        <div className="shell__footer-inner">
          <div>
            <Wordmark compact />
            <p className="shell__footer-note">
              Built from the CODED Defensive track source material. All logs, alerts, incidents and
              infrastructure shown in these lessons are synthetic and labelled as such.
            </p>
          </div>
          <nav className="shell__footer-nav" aria-label="Footer">
            <Link to="/">Roadmap</Link>
            <Link to="/search">Search</Link>
            <Link to="/about">Source material and design</Link>
          </nav>
        </div>
      </footer>

      <div id="live-region" aria-live="polite" aria-atomic="true" className="sr-only" />
    </div>
  )
}
