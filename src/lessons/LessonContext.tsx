import {
  Component,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react'
import type { LessonKit } from './types'
import { lessonLoaders } from './registry'

/* =========================================================================
   LESSON CONTEXT
   =========================================================================
   Mounts a lesson's world for the duration of a route:

   - sets data-lesson on <html>, so a kit's theme.css (scoped to
     :root[data-lesson="<slug>"]) recolours the entire app, view-transition
     pseudo-elements included;
   - lazy-loads the kit and exposes it to the block renderers and layers.

   Until the kit arrives, and if it ever fails, the lesson renders in the
   base CODED design. A kit can make a lesson more beautiful; it can never
   make a lesson unavailable.
   ========================================================================= */

interface LessonState {
  slug: string | null
  kit: LessonKit | null
}

const LessonCtx = createContext<LessonState>({ slug: null, kit: null })

export function useLesson(): LessonState {
  return useContext(LessonCtx)
}

export function LessonProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const [kit, setKit] = useState<LessonKit | null>(null)

  // Layout effect: the attribute must land before first paint, or the page
  // flashes base tokens before switching worlds.
  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.lesson = slug
    return () => {
      if (root.dataset.lesson === slug) delete root.dataset.lesson
    }
  }, [slug])

  useEffect(() => {
    let alive = true
    setKit(null)
    const load = lessonLoaders[slug]
    if (!load) return
    load()
      .then((mod) => {
        if (alive) setKit(mod.default)
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn(`[lesson] kit for "${slug}" failed to load; using the base design.`, err)
      })
    return () => {
      alive = false
    }
  }, [slug])

  return <LessonCtx.Provider value={{ slug, kit }}>{children}</LessonCtx.Provider>
}

/**
 * Isolates a kit's layers and overrides. When a kit component throws, the
 * fallback renders instead — for a layer that is nothing; for a block
 * override it is the shared renderer — and the lesson carries on.
 */
export class KitBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode; label: string },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.warn(`[lesson] ${this.props.label} failed; falling back.`, error)
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null
    return this.props.children
  }
}
