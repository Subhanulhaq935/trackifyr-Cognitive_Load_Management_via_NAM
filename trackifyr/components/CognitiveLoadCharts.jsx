/**
 * @fileoverview Cognitive load charts — activity % and engagement tier (today PKT + weekly rollups).
 */

'use client'

import { useMemo } from 'react'
import { ACTIVITY_PERCENT_LABEL, ACTIVITY_SCALE_MAX } from '@/lib/activityMetrics'
import { chartTooltipStyle, getChartPalette } from '@/lib/chartPalette'
import { useTheme } from '@/context/ThemeContext'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts'

const CHART_HEIGHT = 300

const cardShell =
  'rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/85'

function tierIndexToLabel(v) {
  if (v === 1) return 'Low'
  if (v === 2) return 'Medium'
  if (v === 3) return 'High'
  return '—'
}

function EmptyChart({ title, subtitle }) {
  return (
    <div className={cardShell}>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{title}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{subtitle}</p>
      </div>
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 text-center text-sm text-gray-500 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-400"
        style={{ minHeight: CHART_HEIGHT }}
      >
        No data yet
      </div>
    </div>
  )
}

export default function CognitiveLoadCharts({
  loadSeries = [],
  dailySeries = [],
  hasWeeklyData: hasWeeklyDataProp,
  intradayTitle = 'Cognitive load (today)',
  intradaySubtitle = `${ACTIVITY_PERCENT_LABEL} (5-minute bucket mean, same 0–${ACTIVITY_SCALE_MAX} scale as live) and webcam-based engagement (Low → High) where ML samples exist: current PKT day`,
  weeklyTitle = 'Weekly aggregates',
  weeklySubtitle = `Rolling 7 PKT calendar days: mean ${ACTIVITY_PERCENT_LABEL} per day (same 0–${ACTIVITY_SCALE_MAX} samples as session logs) and number of 5-minute windows with data. Updates while you ingest`,
  noIntradayMessage = 'No 5-minute data for today (PKT) yet. Run the desktop app to record activity; past buckets stay visible after you close it',
}) {
  const { resolvedDark } = useTheme()
  const palette = useMemo(() => getChartPalette(resolvedDark), [resolvedDark])
  const tooltipStyle = useMemo(() => chartTooltipStyle(palette), [palette])
  const tick = { fontSize: 11, fill: palette.tickFill }
  const axisLabelStyle = { fill: palette.axisLabel }

  const hasLoad = Array.isArray(loadSeries) && loadSeries.length > 0
  const hasDaily =
    typeof hasWeeklyDataProp === 'boolean'
      ? hasWeeklyDataProp
      : Array.isArray(dailySeries) &&
        dailySeries.length > 0 &&
        dailySeries.some(
          (d) => (d.sessions ?? 0) > 0 || (typeof d.avgActivity === 'number' && d.avgActivity > 0),
        )

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className={cardShell}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{intradayTitle}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{intradaySubtitle}</p>
          </div>
        </div>
        {!hasLoad ? (
          <div
            className="flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 text-center text-sm text-gray-500 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-400"
            style={{ minHeight: CHART_HEIGHT }}
          >
            {noIntradayMessage}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <AreaChart data={loadSeries}>
              <defs>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
              <XAxis dataKey="time" angle={-45} textAnchor="end" height={80} tick={tick} />
              <YAxis
                yAxisId="left"
                label={{
                  value: ACTIVITY_PERCENT_LABEL,
                  angle: -90,
                  position: 'insideLeft',
                  style: axisLabelStyle,
                }}
                tick={tick}
                domain={[0, ACTIVITY_SCALE_MAX]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: 'Engagement', angle: 90, position: 'insideRight', style: axisLabelStyle }}
                tick={tick}
                domain={[0.5, 3.5]}
                ticks={[1, 2, 3]}
                tickFormatter={(x) => tierIndexToLabel(x)}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => {
                  if (name === 'Engagement') {
                    if (value == null || Number.isNaN(Number(value))) return ['—', 'Engagement']
                    return [tierIndexToLabel(value), 'Engagement']
                  }
                  return [value, name]
                }}
              />
              <Legend wrapperStyle={{ color: palette.tooltipColor }} />
              <Area
                yAxisId="left"
                type="stepAfter"
                dataKey="load"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#colorLoad)"
                name={`${ACTIVITY_PERCENT_LABEL} (5-min mean)`}
                dot={{ r: 3, fill: '#6366f1' }}
              />
              <Area
                yAxisId="right"
                type="stepAfter"
                dataKey="engagementTier"
                connectNulls={false}
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#colorEngagement)"
                name="Engagement"
                dot={{ r: 3, fill: '#10b981' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {!hasDaily ? (
        <EmptyChart
          title={weeklyTitle}
          subtitle="Ingest tracking for a few minutes: 5-minute buckets roll up into the selected PKT days here"
        />
      ) : (
        <div className={cardShell}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">{weeklyTitle}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{weeklySubtitle}</p>
          </div>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={dailySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
              <XAxis dataKey="day" tick={tick} />
              <YAxis
                yAxisId="act"
                label={{
                  value: `${ACTIVITY_PERCENT_LABEL} (day mean, 0–${ACTIVITY_SCALE_MAX})`,
                  angle: -90,
                  position: 'insideLeft',
                  style: axisLabelStyle,
                }}
                tick={tick}
                domain={[0, ACTIVITY_SCALE_MAX]}
              />
              <YAxis
                yAxisId="win"
                orientation="right"
                label={{ value: '5-min windows', angle: 90, position: 'insideRight', style: axisLabelStyle }}
                tick={tick}
                allowDecimals={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: palette.tooltipColor }} />
              <Bar
                yAxisId="act"
                dataKey="avgActivity"
                fill="#6366f1"
                name={`${ACTIVITY_PERCENT_LABEL} (day mean)`}
                radius={[8, 8, 0, 0]}
              />
              <Bar
                yAxisId="win"
                dataKey="sessions"
                fill="#10b981"
                name="5-min windows"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
