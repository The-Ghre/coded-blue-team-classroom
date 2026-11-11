import { Link } from 'react-router-dom'
import { sessions } from '@/content'
import { Eyebrow } from '@/components/brand/Brand'
import { useDocumentTitle } from '@/lib/hooks'

export function NotFound() {
  useDocumentTitle('Not found — CODED Blue Team Classroom')
  return (
    <div className="notfound">
      <Eyebrow>404</Eyebrow>
      <h1>That page is not part of this course.</h1>
      <p className="lead">
        The link may be from an earlier version, or a session slug may have been mistyped. Every
        session is listed below.
      </p>

      <ol className="notfound__list">
        {sessions.map((s) => (
          <li key={s.slug}>
            <Link to={`/session/${s.slug}`}>
              <span className="notfound__num">{String(s.number).padStart(2, '0')}</span>
              {s.title}
            </Link>
          </li>
        ))}
      </ol>

      <div className="notfound__actions">
        <Link className="btn btn--primary" to="/">
          Back to the roadmap
        </Link>
        <Link className="btn" to="/search">
          Search the course
        </Link>
      </div>
    </div>
  )
}
