/**
 * @fileoverview When logged out: fixed About + theme controls on public routes (not on authenticated app shell).
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'

const PUBLIC_PREFIXES = ['/signin', '/signup', '/about', '/download', '/tracking-setup']

function isPublicPath(pathname) {
  if (!pathname) return false
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export default function PublicThemeChrome() {
  const pathname = usePathname()
  const { isAuthenticated, isAuthLoading } = useAuth()

  if (isAuthLoading || isAuthenticated || !isPublicPath(pathname)) {
    return null
  }

  const onAbout = pathname === '/about'

  return (
    <div
      className="fixed right-4 top-4 z-[100] flex items-center gap-2 rounded-2xl border border-gray-200/90 bg-white/95 p-1.5 pl-2 shadow-md backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/95"
      role="navigation"
      aria-label="About and theme"
    >
      {!onAbout && (
        <Link
          href="/about"
          className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-800 dark:text-indigo-400 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
        >
          About
        </Link>
      )}
      <ThemeToggle className="!h-9 !w-9 rounded-lg" />
    </div>
  )
}
