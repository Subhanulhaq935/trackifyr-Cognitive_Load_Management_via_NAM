/**
 * @fileoverview Feedback panel — messages with optional height cap (dashboard) and prev/next navigation.
 */

'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatPktDateTimeFull } from '@/lib/pktTime'

const FEEDBACK_CONFIGS = {
  warning: {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-800',
    iconBg: 'bg-yellow-100',
  },
  info: {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-800',
    iconBg: 'bg-blue-100',
  },
  balanced: {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 102 0V6zm-1 7a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
    bg: 'bg-indigo-50',
    border: 'border-indigo-400',
    text: 'text-indigo-900',
    iconBg: 'bg-indigo-100',
  },
  success: {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-800',
    iconBg: 'bg-green-100',
  },
}

const DEFAULT_FEEDBACK_CONFIG = {
  icon: null,
  bg: 'bg-gray-50',
  border: 'border-gray-400',
  text: 'text-gray-800',
  iconBg: 'bg-gray-100',
}

const getFeedbackConfig = (type) => {
  return FEEDBACK_CONFIGS[type] || DEFAULT_FEEDBACK_CONFIG
}

/**
 * @param {object} props
 * @param {unknown[]} [props.messages]
 * @param {number | null} [props.columnMaxHeightPx] — cap panel height to match session logs column (dashboard)
 */
export default function FeedbackPanel({ messages = [], columnMaxHeightPx = null }) {
  const list = useMemo(() => (Array.isArray(messages) ? messages : []), [messages])
  const [index, setIndex] = useState(0)
  const fingerprint = useMemo(() => list.map((m) => String(m?.id ?? '')).join('\0'), [list])

  useEffect(() => {
    setIndex(0)
  }, [fingerprint])

  useEffect(() => {
    setIndex((i) => {
      if (list.length === 0) return 0
      return Math.min(Math.max(0, i), list.length - 1)
    })
  }, [list.length])

  const current = list[index]
  const currentConfig = current ? getFeedbackConfig(current.type) : null
  const outerStyle =
    typeof columnMaxHeightPx === 'number' && columnMaxHeightPx > 0
      ? { maxHeight: columnMaxHeightPx }
      : undefined

  return (
    <div
      className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white/80 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/85"
      style={outerStyle}
    >
      <div className="shrink-0 border-b border-gray-100 px-6 pb-4 pt-6 dark:border-slate-700">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Feedback</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">From your monitoring pipeline when available</p>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="border-t border-dashed border-gray-200 bg-gray-50/50 px-6 py-8 text-center text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
          No feedback yet
        </p>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4" role="region" aria-label="Feedback messages">
            {current && currentConfig ? (
              <div
                key={current.id}
                className={`rounded-xl border-l-4 p-4 transition-all duration-200 hover:shadow-md ${currentConfig.border} ${currentConfig.bg} dark:border-slate-500 dark:bg-slate-800/80`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`shrink-0 rounded-lg p-2 ${currentConfig.iconBg} ${currentConfig.text} dark:bg-slate-700 dark:text-slate-200`}
                  >
                    {currentConfig.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`mb-1 text-sm font-semibold ${currentConfig.text} dark:text-slate-100`}>{current.message}</p>
                    {current.timestamp ? (
                      <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500 dark:text-slate-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatPktDateTimeFull(new Date(current.timestamp))}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col gap-2 border-t border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-gray-500 dark:text-slate-400 sm:text-left">
              {index + 1} of {list.length}
              <span className="hidden text-gray-400 sm:inline dark:text-slate-600"> · newest first</span>
            </p>
            <div className="flex items-center justify-center gap-1 sm:justify-end">
              <button
                type="button"
                disabled={index <= 0}
                aria-label="Newer feedback"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={index >= list.length - 1}
                aria-label="Older feedback"
                onClick={() => setIndex((i) => Math.min(list.length - 1, i + 1))}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
