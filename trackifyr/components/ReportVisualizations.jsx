'use client'

import { useMemo } from 'react'
import { ACTIVITY_PERCENT_LABEL, ACTIVITY_SCALE_MAX } from '@/lib/activityMetrics'
import { chartTooltipStyle, getChartPalette } from '@/lib/chartPalette'
import { useTheme } from '@/context/ThemeContext'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const COG_COLORS = { High: '#dc2626', Medium: '#ca8a04', Low: '#16a34a', '—': '#9ca3af' }

const cardClass =
  'rounded-2xl border border-gray-100 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/90'

function parseActivityPct(s) {
  if (s == null) return null
  const n = Number(String(s).replace(/%/g, '').trim())
  return Number.isFinite(n) ? Math.max(0, Math.min(ACTIVITY_SCALE_MAX, n)) : null
}

function shortTimeLabel(timeWindow) {
  if (!timeWindow || typeof timeWindow !== 'string') return ''
  const part = timeWindow.split('–')[0]?.trim() || timeWindow
  return part.length > 14 ? `${part.slice(0, 12)}…` : part
}

export default function ReportVisualizations({ dailyRows = [], weeklyRows = [], chartSeries = [] }) {
  const { resolvedDark } = useTheme()
  const palette = useMemo(() => getChartPalette(resolvedDark), [resolvedDark])
  const tooltipStyle = useMemo(() => chartTooltipStyle(palette), [palette])
  const tickSm = { fontSize: 9, fill: palette.tickFill }
  const tickMd = { fontSize: 11, fill: palette.tickFill }

  const cognitiveCounts = { High: 0, Medium: 0, Low: 0 }
  for (const r of dailyRows) {
    const k = String(r.cognitiveLoad || '').trim()
    if (k === 'High' || k === 'Medium' || k === 'Low') cognitiveCounts[k] += 1
  }
  const pieData = Object.entries(cognitiveCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))

  const activityBars = dailyRows
    .map((r, i) => ({
      slot: shortTimeLabel(r.time) || `Slot ${i + 1}`,
      activity: parseActivityPct(r.avgActivity),
    }))
    .filter((x) => x.activity != null)
    .slice(0, 48)

  const activityTrend = Array.isArray(chartSeries)
    ? chartSeries.map((p, i) => ({
        t: p.time || `${i + 1}`,
        load: typeof p.load === 'number' ? p.load : null,
      }))
    : []

  const weeklyTrend = Array.isArray(weeklyRows)
    ? weeklyRows.map((r) => ({
        day: r.day || '—',
        avgActivity: typeof r.avgActivity === 'number' ? r.avgActivity : 0,
        windows: typeof r.sessions === 'number' ? r.sessions : 0,
      }))
    : []

  const hasPie = pieData.length > 0
  const hasActivityBars = activityBars.length > 0
  const hasTrend = activityTrend.some((p) => p.load != null)
  const hasWeekly = weeklyTrend.some((r) => r.avgActivity > 0 || r.windows > 0)

  if (!hasPie && !hasActivityBars && !hasTrend && !hasWeekly) {
    return (
      <div className="mb-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-8 text-center text-sm text-gray-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
        No data
      </div>
    )
  }

  return (
    <div className="mb-8 space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {hasPie ? (
          <div className={cardClass}>
            <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-slate-200">Cognitive load</h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={COG_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: palette.tooltipColor }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}

        {hasActivityBars ? (
          <div className={cardClass}>
            <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-slate-200">
              {ACTIVITY_PERCENT_LABEL} by 5-min window
            </h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityBars} margin={{ top: 8, right: 8, left: 0, bottom: 64 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
                  <XAxis dataKey="slot" angle={-45} textAnchor="end" height={70} tick={tickSm} />
                  <YAxis
                    domain={[0, ACTIVITY_SCALE_MAX]}
                    tick={tickMd}
                    label={{
                      value: ACTIVITY_PERCENT_LABEL,
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: palette.axisLabel },
                    }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="activity"
                    fill="#6366f1"
                    name={`${ACTIVITY_PERCENT_LABEL} (window mean)`}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}

        {hasTrend ? (
          <div className={`${cardClass} xl:col-span-2`}>
            <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-slate-200">
              {ACTIVITY_PERCENT_LABEL} (PKT day, 5-min means)
            </h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityTrend} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
                  <XAxis dataKey="t" angle={-35} textAnchor="end" height={60} tick={{ fontSize: 10, fill: palette.tickFill }} />
                  <YAxis domain={[0, ACTIVITY_SCALE_MAX]} tick={tickMd} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: palette.tooltipColor }} />
                  <Line
                    type="monotone"
                    dataKey="load"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    name={`${ACTIVITY_PERCENT_LABEL} (bucket mean)`}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}

        {hasWeekly ? (
          <div className={`${cardClass} xl:col-span-2`}>
            <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-slate-200">7 days</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={weeklyTrend} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
                  <XAxis dataKey="day" tick={tickMd} />
                  <YAxis yAxisId="act" orientation="left" domain={[0, ACTIVITY_SCALE_MAX]} tick={tickMd} />
                  <YAxis yAxisId="win" orientation="right" allowDecimals={false} tick={tickMd} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: palette.tooltipColor }} />
                  <Bar yAxisId="win" dataKey="windows" fill="#10b981" name="5-min windows" radius={[6, 6, 0, 0]} />
                  <Line
                    yAxisId="act"
                    type="monotone"
                    dataKey="avgActivity"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    name={`${ACTIVITY_PERCENT_LABEL} (day mean)`}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
