import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { search } from '@/lib/search'
import { glossary } from '@/content'
import { Eyebrow, MonoLabel } from '@/components/brand/Brand'
import { useDocumentTitle } from '@/lib/hooks'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const initial = params.get('q') ?? ''
  const [query, setQuery] = useState(initial)
  const [debounced, setDebounced] = useState(initial)

  useDocumentTitle(query ? `Search: ${query} — CODED Blue Team Classroom` : 'Search the course')

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebounced(query)
      // Keep the URL shareable without creating a history entry per keystroke.
      setParams(query ? { q: query } : {}, { replace: true })
    }, 180)
    return () => window.clearTimeout(t)
  }, [query, setParams])

  const results = useMemo(() => (debounced.trim() ? search(debounced) : []), [debounced])

  const terms = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    if (!q) return []
    return glossary.filter(
      (g) => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q),
    )
  }, [debounced])

  const hasQuery = debounced.trim().length > 1

  return (
    <div className="search">
      <header className="search__head">
        <Eyebrow>Search</Eyebrow>
        <h1>Find anything in the course</h1>
        <p className="lead">
          Every slide, concept, query, workshop task and glossary term across all ten sessions. The
          index is built into the page, so this works offline once the site has loaded.
        </p>

        <div className="search__field">
          <label htmlFor="search-input" className="sr-only">
            Search the course
          </label>
          <span className="search__icon" aria-hidden="true">
            ⌕
          </span>
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Event ID 4769, beaconing, chain of custody, Prefetch…"
            autoComplete="off"
            autoFocus
          />
          {query && (
            <button
              type="button"
              className="search__clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {!hasQuery && (
          <div className="search__suggestions">
            <MonoLabel>Try</MonoLabel>
            <ul>
              {[
                'Prefetch',
                'beaconing',
                'chain of custody',
                'Sigma',
                'DCSync',
                'false positive',
                'LOLBin',
                'order of volatility',
              ].map((s) => (
                <li key={s}>
                  <button type="button" className="btn btn--sm" onClick={() => setQuery(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {hasQuery && (
        <div className="search__results" aria-live="polite">
          <div className="search__count">
            <MonoLabel>
              {results.length} {results.length === 1 ? 'section' : 'sections'}
              {terms.length > 0 && ` · ${terms.length} glossary ${terms.length === 1 ? 'term' : 'terms'}`}
            </MonoLabel>
          </div>

          {terms.length > 0 && (
            <section className="search__glossary" aria-label="Glossary matches">
              <h2>Glossary</h2>
              <dl>
                {terms.map((t) => (
                  <div key={`${t.term}-${t.session}`} className="search__term">
                    <dt>{t.term}</dt>
                    <dd>
                      {t.definition}
                      <Link to={`/session/${t.slug}`} className="search__term-link">
                        Session {t.session} · {t.sessionTitle}
                      </Link>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {results.length === 0 && terms.length === 0 ? (
            <div className="search__empty">
              <p>
                <strong>Nothing matched “{debounced}”.</strong>
              </p>
              <p>
                Every word must appear somewhere in a section for it to match. Try fewer words, or a
                single distinctive term — an Event ID, a tool name, or a technique.
              </p>
            </div>
          ) : (
            <ol className="search__list">
              {results.map((r) => (
                <li key={`${r.sessionSlug}-${r.blockId}`} className="search__result">
                  <Link
                    to={`/session/${r.sessionSlug}/${r.area === 'theory' ? 'study' : 'practical'}#${r.blockId}`}
                  >
                    <div className="search__result-meta">
                      <span className="search__result-session">
                        S{String(r.sessionNumber).padStart(2, '0')}
                      </span>
                      <span className="search__result-area" data-area={r.area}>
                        {r.area === 'theory' ? 'Theory' : 'Workshop'}
                      </span>
                      <span className="search__result-kind">{r.kind}</span>
                    </div>
                    <h3 className="search__result-title">{r.blockTitle}</h3>
                    <p
                      className="search__result-excerpt"
                      // Excerpt is HTML-escaped before <mark> is inserted — see lib/search.
                      dangerouslySetInnerHTML={{ __html: r.highlighted }}
                    />
                    <span className="search__result-in">in {r.sessionTitle}</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  )
}
