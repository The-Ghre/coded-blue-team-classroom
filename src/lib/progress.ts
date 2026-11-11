/* =========================================================================
   PROGRESS — local, per-browser, no account
   =========================================================================
   Progress is stored in localStorage on this device only. It is never sent
   anywhere, it does not follow the student to another browser or machine,
   and clearing site data removes it. The interface states this plainly
   wherever progress is shown; see ProgressNotice.
   ========================================================================= */

import { useCallback, useEffect, useState } from 'react'

const KEY = 'coded-btc:progress:v1'

export interface SessionProgress {
  /** Block ids the student has marked complete. */
  completed: string[]
  /** Last block id viewed, for the resume control. */
  lastBlockId?: string
  /** Which mode they were last in. */
  lastMode?: 'study' | 'present' | 'practical'
  /** ISO timestamp of the last interaction. */
  updatedAt?: string
}

export type ProgressState = Record<string, SessionProgress>

const EMPTY: SessionProgress = { completed: [] }

/**
 * localStorage can throw — private browsing, blocked site data, embedded
 * webviews. Every access is guarded, and the app renders correctly when
 * storage is unavailable; the student simply has no saved progress.
 */
function read(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as ProgressState
  } catch {
    return {}
  }
}

function write(state: ProgressState): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function isStorageAvailable(): boolean {
  try {
    const probe = '__coded_probe__'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

/* A tiny subscription so every mounted component stays in sync without a
   global state library. */
type Listener = (state: ProgressState) => void
const listeners = new Set<Listener>()
let cache: ProgressState | null = null

function getState(): ProgressState {
  if (cache === null) cache = read()
  return cache
}

function setState(next: ProgressState) {
  cache = next
  write(next)
  listeners.forEach((l) => l(next))
}

export function useProgress() {
  const [state, setLocal] = useState<ProgressState>(getState)

  useEffect(() => {
    const listener: Listener = (s) => setLocal({ ...s })
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  // Keep multiple tabs on the same device consistent.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === KEY) {
        cache = read()
        setLocal({ ...cache })
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const forSession = useCallback(
    (slug: string): SessionProgress => state[slug] ?? EMPTY,
    [state],
  )

  const toggleBlock = useCallback((slug: string, blockId: string) => {
    const current = getState()
    const existing = current[slug] ?? { completed: [] }
    const completed = existing.completed.includes(blockId)
      ? existing.completed.filter((id) => id !== blockId)
      : [...existing.completed, blockId]
    setState({
      ...current,
      [slug]: { ...existing, completed, updatedAt: new Date().toISOString() },
    })
  }, [])

  const markViewed = useCallback(
    (slug: string, blockId: string, mode: SessionProgress['lastMode']) => {
      const current = getState()
      const existing = current[slug] ?? { completed: [] }
      if (existing.lastBlockId === blockId && existing.lastMode === mode) return
      setState({
        ...current,
        [slug]: {
          ...existing,
          lastBlockId: blockId,
          lastMode: mode,
          updatedAt: new Date().toISOString(),
        },
      })
    },
    [],
  )

  const resetSession = useCallback((slug: string) => {
    const current = getState()
    const next = { ...current }
    delete next[slug]
    setState(next)
  }, [])

  const resetAll = useCallback(() => {
    setState({})
  }, [])

  return { state, forSession, toggleBlock, markViewed, resetSession, resetAll }
}
