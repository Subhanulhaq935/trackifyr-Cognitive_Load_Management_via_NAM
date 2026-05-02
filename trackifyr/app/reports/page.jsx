'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ACTIVITY_PERCENT_LABEL, ACTIVITY_SCALE_MAX } from '@/lib/activityMetrics'
import { formatPktIsoDate } from '@/lib/pktTime'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import CognitiveLoadCharts from '@/components/CognitiveLoadCharts'
import ReportVisualizations from '@/components/ReportVisualizations'
import { downloadTrackingReportPdf } from '@/lib/downloadTrackingReportPdf'

function dominantCognitiveLabel(rows) {
  if (!Array.isArray(rows) || !rows.length) return '—'
  const c = {}
  for (const r of rows) {
    const k = r.cognitiveLoad || '—'
    c[k] = (c[k] || 0) + 1
  }
  return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
}

const inputClass =
  'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'

export default function ReportsPage() {
  const router = useRouter()
  const { isAuthenticated, isAuthLoading } = useAuth()
  const [dailyDate, setDailyDate] = useState(() => formatPktIsoDate(new Date()))
  const [weekContainingPkt, setWeekContainingPkt] = useState(() => formatPktIsoDate(new Date()))
  const [chartSeries, setChartSeries] = useState([])
  const [weeklySeries, setWeeklySeries] = useState([])
  const [dailyReport, setDailyReport] = useState(null)
  const [weeklyReport, setWeeklyReport] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [pdfBusy, setPdfBusy] = useState(null)
  const [pdfError, setPdfError] = useState('')

  const loadData = useCallback(async () => {
    setLoadError('')
    try {
      const dq = encodeURIComponent(dailyDate.trim())
      const wq = encodeURIComponent(weekContainingPkt.trim())
      const [dailyRepRes, weekRepRes] = await Promise.all([
        fetch(`/api/tracking/report?period=daily&date=${dq}`, { cache: 'no-store', credentials: 'same-origin' }),
        fetch(`/api/tracking/report?period=weekly&week=${wq}`, { cache: 'no-store', credentials: 'same-origin' }),
      ])
      const dailyRepJson = await dailyRepRes.json().catch(() => ({}))
      const weekRepJson = await weekRepRes.json().catch(() => ({}))
      let err = ''
      if (!dailyRepRes.ok || !dailyRepJson?.ok) {
        setDailyReport(null)
        setChartSeries([])
        err = dailyRepJson?.error || `Could not load daily report (${dailyRepRes.status})`
      } else {
        setDailyReport(dailyRepJson)
        setChartSeries(Array.isArray(dailyRepJson.daily?.chartPoints) ? dailyRepJson.daily.chartPoints : [])
      }
      if (!weekRepRes.ok || !weekRepJson?.ok) {
        setWeeklyReport(null)
        setWeeklySeries([])
        const wmsg = weekRepJson?.error || `Could not load weekly report (${weekRepRes.status})`
        err = err ? `${err} · ${wmsg}` : wmsg
      } else {
        setWeeklyReport(weekRepJson)
        const rows = Array.isArray(weekRepJson.weekly?.rows) ? weekRepJson.weekly.rows : []
        setWeeklySeries(rows)
      }
      setLoadError(err)
    } catch {
      setLoadError('Network error loading reports')
    }
  }, [dailyDate, weekContainingPkt])

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/signin')
    }
  }, [isAuthLoading, isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated) return
    void loadData()
    const id = setInterval(loadData, 11000)
    return () => clearInterval(id)
  }, [isAuthenticated, loadData])

  const onDownloadDaily = async () => {
    setPdfError('')
    setPdfBusy('daily')
    try {
      await downloadTrackingReportPdf('daily', { date: dailyDate })
    } catch (e) {
      setPdfError(e?.message || 'Could not generate PDF')
    } finally {
      setPdfBusy(null)
    }
  }

  const onDownloadWeekly = async () => {
    setPdfError('')
    setPdfBusy('weekly')
    try {
      await downloadTrackingReportPdf('weekly', { week: weekContainingPkt })
    } catch (e) {
      setPdfError(e?.message || 'Could not generate PDF')
    } finally {
      setPdfBusy(null)
    }
  }

  if (isAuthLoading || !isAuthenticated) {
    return null
  }

  const dailyRows = dailyReport?.daily?.rows ?? []
  const summary = dailyReport?.daily?.summary
  const weeklyRows = weeklyReport?.weekly?.rows ?? []
  const weeklyWindows = weeklyRows.reduce((acc, r) => acc + (Number(r.sessions) || 0), 0)
  const dayAvg =
    typeof summary?.dailyAvgActivityPct === 'number' && !Number.isNaN(summary.dailyAvgActivityPct)
      ? `${summary.dailyAvgActivityPct}%`
      : '—'

  const weekCaption = weeklyReport?.weekRangeLabel || ''

  const chartIntradaySubtitle = useMemo(
    () =>
      `${ACTIVITY_PERCENT_LABEL} (5-minute bucket mean, same 0–${ACTIVITY_SCALE_MAX} scale as live) and engagement where ML samples exist — PKT calendar day ${dailyDate}`,
    [dailyDate],
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 lg:pl-64">
        <Header title="Reports & Analytics" />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="mb-6 rounded-2xl border border-indigo-100 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Report period (PKT)</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
              Dates use <strong>Asia/Karachi</strong>. For weekly data, pick any day in the week; the report uses that
              Monday–Sunday.
            </p>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
              <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-slate-300">
                Daily report day
                <input type="date" className={inputClass} value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-slate-300">
                Weekly report — week containing
                <input
                  type="date"
                  className={inputClass}
                  value={weekContainingPkt}
                  onChange={(e) => setWeekContainingPkt(e.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={() => void loadData()}
                className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-900 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-slate-800 dark:text-indigo-200 dark:hover:bg-slate-700"
              >
                Refresh
              </button>
            </div>
            {loadError ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{loadError}</p> : null}
          </div>

          <div className="mb-6 rounded-2xl border border-indigo-100 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Export PDF (PKT)</h2>
            {weekCaption ? <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{weekCaption}</p> : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={pdfBusy !== null}
                onClick={onDownloadDaily}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-50"
              >
                {pdfBusy === 'daily' ? 'Preparing…' : `Download daily PDF (${dailyDate})`}
              </button>
              <button
                type="button"
                disabled={pdfBusy !== null}
                onClick={onDownloadWeekly}
                className="rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-800 shadow-sm hover:bg-indigo-50 disabled:opacity-50 dark:border-indigo-800 dark:bg-slate-800 dark:text-indigo-200 dark:hover:bg-slate-700"
              >
                {pdfBusy === 'weekly' ? 'Preparing…' : 'Download weekly PDF (selected week)'}
              </button>
            </div>
            {pdfError ? <p className="mt-2 text-sm text-red-600">{pdfError}</p> : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="rounded-xl border border-gray-100 bg-white/80 p-6 shadow-md backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/85">
              <p className="mb-2 text-sm font-medium text-gray-600 dark:text-slate-400">
                {ACTIVITY_PERCENT_LABEL} day average (PKT) — {dailyDate}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">{dayAvg}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white/80 p-6 shadow-md backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/85">
              <p className="mb-2 text-sm font-medium text-gray-600 dark:text-slate-400">
                Dominant cognitive load — {dailyDate}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">{dominantCognitiveLabel(dailyRows)}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white/80 p-6 shadow-md backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/85">
              <p className="mb-2 text-sm font-medium text-gray-600 dark:text-slate-400">5-minute windows (selected PKT week)</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">{weeklyWindows}</p>
            </div>
          </div>

          <ReportVisualizations dailyRows={dailyRows} weeklyRows={weeklyRows} chartSeries={chartSeries} />

          <div className="mb-4">
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-slate-100">Charts</h2>
            <CognitiveLoadCharts
              loadSeries={chartSeries}
              dailySeries={weeklySeries}
              hasWeeklyData={weeklySeries.some(
                (d) => (d.sessions ?? 0) > 0 || (typeof d.avgActivity === 'number' && d.avgActivity > 0),
              )}
              intradayTitle="Cognitive load (selected PKT day)"
              intradaySubtitle={chartIntradaySubtitle}
              weeklyTitle="Weekly aggregates (selected PKT week)"
              weeklySubtitle={`Monday–Sunday in Asia/Karachi for the week that contains ${weekContainingPkt}. Mean ${ACTIVITY_PERCENT_LABEL} per day and 5-minute windows with data.`}
              noIntradayMessage={`No 5-minute data for ${dailyDate} (PKT) in this view. Run the desktop app on that day to record buckets.`}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
