import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { useEffect, type ReactNode } from 'react'
import { getSession } from '@/content'
import { LessonProvider } from '@/lessons/LessonContext'
import { AppShell } from '@/components/layout/AppShell'
import { Home } from '@/routes/Home'
import { SessionOverview } from '@/routes/SessionOverview'
import { Study } from '@/routes/Study'
import { Present } from '@/routes/Present'
import { SearchPage } from '@/routes/SearchPage'
import { About } from '@/routes/About'
import { NotFound } from '@/routes/NotFound'

/** Scroll to top on navigation, except when a hash targets an element. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ block: 'start' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

/**
 * Mounts the session's lesson world around any session route, so the
 * overview, study, workshop and presentation surfaces of one lesson share
 * its palette, motifs and motion.
 */
function LessonRoute({ children }: { children: ReactNode }) {
  const { slug } = useParams()
  const session = slug ? getSession(slug) : undefined
  if (!session) return <>{children}</>
  return <LessonProvider slug={session.slug}>{children}</LessonProvider>
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        {/* Presentation mode runs outside the shell: the interface must
            recede entirely when a session is being projected. */}
        <Route path="/session/:slug/present" element={<Navigate to="0" replace />} />
        <Route path="/session/:slug/present/:index" element={<LessonRoute><Present /></LessonRoute>} />

        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/session/:slug" element={<LessonRoute><SessionOverview /></LessonRoute>} />
          <Route path="/session/:slug/study" element={<LessonRoute><Study area="theory" /></LessonRoute>} />
          <Route path="/session/:slug/practical" element={<LessonRoute><Study area="practical" /></LessonRoute>} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
