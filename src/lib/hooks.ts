import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * True when the current focus is somewhere a keystroke means text, not a
 * command. Presentation shortcuts consult this so that typing in the slide
 * jump box, a search field or any control never advances the deck.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  if (target.isContentEditable) return true
  // Buttons, links and anything with a role handle their own keys.
  if (target.closest('[data-keys-own]')) return true
  return false
}

export interface ShortcutMap {
  [key: string]: (event: KeyboardEvent) => void
}

/**
 * Global keyboard shortcuts that stand down while the user is typing or
 * interacting with a control, and while any modifier is held so browser
 * and assistive-technology shortcuts are never shadowed.
 */
export function useShortcuts(map: ShortcutMap, enabled = true) {
  const mapRef = useRef(map)
  mapRef.current = map

  useEffect(() => {
    if (!enabled) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTypingTarget(e.target)) return
      const handler = mapRef.current[e.key]
      if (handler) {
        handler(e)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled])
}

/** Fullscreen with the browser API, reporting real state rather than intent. */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== 'undefined' && !!document.fullscreenElement,
  )

  useEffect(() => {
    function onChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      // Denied by the browser or unsupported in this context. The control
      // stays visible and simply does nothing, which is honest.
    }
  }, [])

  const supported =
    typeof document !== 'undefined' && !!document.documentElement.requestFullscreen

  return { isFullscreen, toggle, supported }
}

/** Respects the OS reduced-motion setting, and reacts if it changes. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

/** Sets document.title and restores it on unmount. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}

/** Announces route or slide changes to assistive technology. */
export function useAnnounce() {
  return useCallback((message: string) => {
    const el = document.getElementById('live-region')
    if (el) {
      // Clearing first forces a re-announcement of identical text.
      el.textContent = ''
      window.setTimeout(() => {
        el.textContent = message
      }, 60)
    }
  }, [])
}
