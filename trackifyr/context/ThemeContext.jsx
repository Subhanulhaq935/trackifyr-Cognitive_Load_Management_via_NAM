/**
 * @fileoverview Theme preference: class on <html>, localStorage persistence, system default when unset.
 */

'use client'

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'trackifyr-theme'

const ThemeContext = createContext(null)

function readStored() {
  if (typeof window === 'undefined') return null
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
    return null
  } catch {
    return null
  }
}

function systemPrefersDark() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function initialStored() {
  if (typeof window === 'undefined') return null
  return readStored()
}

export function ThemeProvider({ children }) {
  const [stored, setStored] = useState(initialStored)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const resolvedDark = useMemo(() => {
    if (stored === 'dark') return true
    if (stored === 'light') return false
    return systemPrefersDark()
  }, [stored])

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedDark)
  }, [resolvedDark])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (stored != null) return
      document.documentElement.classList.toggle('dark', mq.matches)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [stored])

  const setTheme = useCallback((mode) => {
    const next = mode === 'dark' ? 'dark' : 'light'
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
    setStored(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedDark ? 'light' : 'dark')
  }, [resolvedDark, setTheme])

  const value = useMemo(
    () => ({
      /** Explicit light/dark from storage, or null when following system */
      stored,
      resolvedDark,
      /** True when user has not pinned light/dark in localStorage */
      followsSystem: stored == null,
      setTheme,
      toggleTheme,
      mounted,
    }),
    [stored, resolvedDark, setTheme, toggleTheme, mounted],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
