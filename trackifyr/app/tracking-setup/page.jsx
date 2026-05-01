'use client'

import Link from 'next/link'

export default function TrackingSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-4 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-indigo-100 bg-white/90 p-8 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90 sm:p-10">
          <h1 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">
            Desktop Tracking Setup
          </h1>
          <p className="mb-8 text-center text-sm text-gray-600 dark:text-slate-400">
            Need the Windows installer first?{' '}
            <Link href="/download?from=tracking-setup" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
              Download desktop app
            </Link>
            .{' '}
            <Link href="/about" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
              About
            </Link>
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="/releases/SETUP.md"
              download
              className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
            >
              Download Setup
            </a>
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:w-auto"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
