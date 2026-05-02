import { query } from '@/lib/db'
import { ensureUsersTable } from '@/lib/usersSchema'
import {
  formatPktDateTimeFull,
  formatPktIsoDate,
  pktInstantFromYmd,
  pktMondayStartOfWeekContaining,
} from '@/lib/pktTime'
import {
  getTodayAverageActivityPercent,
  listPktDayBucketsAscendingForReport,
  listPktWeekDailyAggregatesForUser,
  listRollingDailyAggregatesForUser,
  listTodayBucketsForChart,
} from '@/lib/trackingSessionsDb'

/**
 * Shared JSON for GET /api/tracking/report and POST /api/tracking/report-pdf.
 * @param {number} userId
 * @param {'daily'|'weekly'} period
 * @param {{ dateParam?: string | null, weekParam?: string | null }} q
 *   `dateParam` = YYYY-MM-DD PKT day for daily. `weekParam` = YYYY-MM-DD any day in week for fixed Mon–Sun weekly; omit for rolling 7 days.
 * @returns {Promise<{ ok: true, body: object } | { ok: false, status: number, error: string }>}
 */
export async function buildTrackingReportResult(userId, period, q = {}) {
  const dateParam = q.dateParam != null ? String(q.dateParam) : ''
  const weekParam = q.weekParam != null ? String(q.weekParam) : ''

  try {
    await ensureUsersTable()
    const ur = await query(`SELECT full_name, email FROM users WHERE id = $1 LIMIT 1`, [userId])
    const urow = ur.rows[0]
    const user = {
      fullName: urow?.full_name || '',
      email: urow?.email || '',
    }
    const generatedAtPkt = formatPktDateTimeFull(new Date())

    if (period === 'daily') {
      let dayRef = new Date()
      let pktDateLabel = formatPktIsoDate(new Date())
      if (dateParam.trim()) {
        const inst = pktInstantFromYmd(dateParam.trim())
        if (!inst) {
          return { ok: false, status: 400, error: 'Invalid date (use YYYY-MM-DD, PKT calendar day)' }
        }
        dayRef = inst
        pktDateLabel = formatPktIsoDate(inst)
      }

      const rows = await listPktDayBucketsAscendingForReport(userId, dayRef)
      const chartPoints = await listTodayBucketsForChart(userId, dayRef)
      const dailyAvg = await getTodayAverageActivityPercent(userId, dayRef)
      return {
        ok: true,
        body: {
          ok: true,
          period: 'daily',
          user,
          generatedAtPkt,
          pktDateLabel,
          daily: {
            rows,
            chartPoints,
            summary: {
              bucketCount: rows.length,
              dailyAvgActivityPct: dailyAvg,
            },
          },
        },
      }
    }

    if (weekParam.trim()) {
      const inst = pktInstantFromYmd(weekParam.trim())
      if (!inst) {
        return { ok: false, status: 400, error: 'Invalid week (use YYYY-MM-DD, any PKT day in the week)' }
      }
      const monday = pktMondayStartOfWeekContaining(inst)
      const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000)
      const monIso = formatPktIsoDate(monday)
      const sunIso = formatPktIsoDate(sunday)
      const pktDateLabel = `${monIso} – ${sunIso}`
      const weekRangeLabel = `PKT week Mon–Sun: ${monIso} to ${sunIso}`
      const weeklyRows = await listPktWeekDailyAggregatesForUser(userId, monday)
      return {
        ok: true,
        body: {
          ok: true,
          period: 'weekly',
          user,
          generatedAtPkt,
          pktDateLabel,
          weekRangeLabel,
          weekMondayIso: monIso,
          weekSundayIso: sunIso,
          weekly: {
            rows: weeklyRows.map((r) => ({
              day: r.day,
              avgActivity: r.avgActivity,
              sessions: r.sessions,
              engagement: r.engagement,
            })),
          },
        },
      }
    }

    const pktDateLabel = formatPktIsoDate(new Date())
    const weeklyRows = await listRollingDailyAggregatesForUser(userId)
    const weekRangeLabel = `Rolling 7 PKT calendar days ending ${pktDateLabel}`
    return {
      ok: true,
      body: {
        ok: true,
        period: 'weekly',
        user,
        generatedAtPkt,
        pktDateLabel,
        weekRangeLabel,
        weekly: {
          rows: weeklyRows.map((r) => ({
            day: r.day,
            avgActivity: r.avgActivity,
            sessions: r.sessions,
            engagement: r.engagement,
          })),
        },
      },
    }
  } catch {
    return { ok: false, status: 500, error: 'Server error' }
  }
}
