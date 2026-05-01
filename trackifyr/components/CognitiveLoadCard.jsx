/**
 * @fileoverview Cognitive load card — Activity % (same 0–100 metric as session logs) + engagement (Low / Medium / High).
 */

'use client'

import { ACTIVITY_PERCENT_LABEL, ACTIVITY_SCALE_MAX } from '@/lib/activityMetrics'
import { formatPktTimeShort } from '@/lib/pktTime'

const COGNITIVE_LOAD_LEVELS = {
  Low: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    badge: 'bg-green-100 text-green-800 border-green-300',
    progress: 'bg-green-500',
  },
  Medium: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    progress: 'bg-yellow-500',
  },
  High: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    badge: 'bg-red-100 text-red-800 border-red-300',
    progress: 'bg-red-500',
  },
}

const DEFAULT_CONFIG = {
  bg: 'bg-gray-50',
  border: 'border-gray-500',
  badge: 'bg-gray-100 text-gray-800 border-gray-300',
  progress: 'bg-gray-500',
}

const TIER_STYLES = {
  Low: 'ring-2 ring-orange-400 bg-orange-50 text-orange-900',
  Medium: 'ring-2 ring-purple-400 bg-purple-50 text-purple-900',
  High: 'ring-2 ring-blue-500 bg-blue-50 text-blue-900',
}

const getLevelConfig = (level) => {
  if (level == null || level === '') return DEFAULT_CONFIG
  return COGNITIVE_LOAD_LEVELS[level] || DEFAULT_CONFIG
}

export default function CognitiveLoadCard({
  level,
  value,
  engagementTier = null,
  webcamMlStatus = 'active',
  hasData = false,
  updatedAt = null,
}) {
  const config = getLevelConfig(level)
  const safeValue =
    typeof value === 'number' && !Number.isNaN(value) ? Math.max(0, Math.min(ACTIVITY_SCALE_MAX, value)) : null

  if (!hasData) {
    return (
      <div className="rounded-2xl border-l-4 border-gray-300 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-slate-600 dark:bg-slate-900/85">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Current Cognitive Load</h3>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">From desktop tracking (no data yet)</p>
          </div>
          <span className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
            —
          </span>
        </div>
        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">{ACTIVITY_PERCENT_LABEL}</span>
            <span className="text-3xl font-bold text-gray-400 dark:text-slate-600">—</span>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
              <div className="h-4 rounded-full bg-gray-200 dark:bg-slate-700" style={{ width: '0%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Engagement</span>
            <span className="text-2xl font-bold text-gray-400 dark:text-slate-600">—</span>
            </div>
            <div className="flex gap-2">
              {['Low', 'Medium', 'High'].map((t) => (
                <span
                  key={t}
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-100 py-2 text-center text-xs font-medium text-gray-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 border-t border-gray-200 pt-4 text-sm text-gray-500 dark:border-slate-700 dark:text-slate-400">
          Start tracking in the desktop app to see live metrics.
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border-l-4 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:bg-slate-900/85 ${config.border}`}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Current Cognitive Load</h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">Latest reading from the desktop app (not a day average)</p>
        </div>
        <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${config.badge}`}>
          {level ?? '—'}
        </span>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">{ACTIVITY_PERCENT_LABEL}</span>
            <span className="text-3xl font-bold text-gray-900 dark:text-slate-100">{safeValue != null ? `${Math.round(safeValue)}%` : '—'}</span>
          </div>
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700">
            <div
              className={`h-4 rounded-full ${config.progress} transition-all duration-1000`}
              style={{ width: `${safeValue ?? 0}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Engagement</span>
            <div className="flex items-center gap-2">
              {webcamMlStatus === 'off' ? (
                <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                  Webcam ML off
                </span>
              ) : null}
              {webcamMlStatus === 'waiting' ? (
                <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300">
                  Starting webcam ML…
                </span>
              ) : null}
            </div>
          </div>
          <p className="mb-3 text-xs text-gray-500 dark:text-slate-500">Derived from the webcam ensemble (Low / Medium / High).</p>
          <div className="grid grid-cols-3 gap-2">
            {['Low', 'Medium', 'High'].map((t) => (
              <div
                key={t}
                className={`text-center text-sm font-semibold py-2.5 rounded-lg border transition-colors ${
                  engagementTier === t
                    ? TIER_STYLES[t] || 'bg-indigo-100 text-indigo-900 border-indigo-300'
                    : 'border-gray-200 bg-gray-50 text-gray-400 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-500'
                }`}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-slate-700">
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Last updated (PKT):{' '}
            {updatedAt ? formatPktTimeShort(new Date(updatedAt)) : formatPktTimeShort(new Date())}
          </span>
        </div>
        <div className="flex items-center space-x-1 text-xs font-medium text-green-600 dark:text-green-400">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
          <span>Live</span>
        </div>
      </div>
    </div>
  )
}
