'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import AboutContent from '@/components/AboutContent'

export default function AboutPage() {
  const { isAuthenticated, isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
        <p className="text-sm text-gray-500 dark:text-slate-400">Loading…</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
          <Header title="About" subtitle="Purpose, team, and how to use trackifyr" />
          <main className="flex-1 overflow-y-auto px-4 py-6 pb-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <AboutContent />
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/signin" className="text-base font-bold text-indigo-700 dark:text-indigo-400">
            trackifyr
          </Link>
          <nav className="flex items-center gap-5 text-sm" aria-label="Account">
            <Link href="/signin" className="font-medium text-gray-600 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
              Sign in
            </Link>
            <Link href="/signup" className="font-medium text-gray-600 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
              Sign up
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-indigo-100/60 bg-white/70 px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">About</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">Cognitive load awareness and digital wellbeing.</p>
        </div>
        <div className="mt-8">
          <AboutContent showPublicFooter />
        </div>
      </main>
    </div>
  )
}
