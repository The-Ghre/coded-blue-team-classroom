import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
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

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        {/* Presentation mode runs outside the shell: the interface must
            recede entirely when a session is being projected. */}
        <Route path="/session/:slug/present" element={<Navigate to="0" replace />} />
        <Route path="/session/:slug/present/:index" element={<Present />} />

        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/session/:slug" element={<SessionOverview />} />
          <Route path="/session/:slug/study" element={<Study area="theory" />} />
          <Route path="/session/:slug/practical" element={<Study area="practical" />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
