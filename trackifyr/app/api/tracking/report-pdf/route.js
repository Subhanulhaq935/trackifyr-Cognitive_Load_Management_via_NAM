import { getSessionTokenFromRequest } from '@/lib/auth-session'
import { buildDailyReportPdfBuffer, buildWeeklyReportPdfBuffer } from '@/lib/buildTrackingReportPdf'
import { buildTrackingReportResult } from '@/lib/trackingReportJson'
import { getUserIdFromSessionToken } from '@/lib/trackingLiveDb'

export const runtime = 'nodejs'

function safeFilenamePart(s) {
  return String(s || 'pkt').replace(/[^\w.-]+/g, '_').slice(0, 80)
}

export async function POST(request) {
  const token = await getSessionTokenFromRequest(request)
  if (!token) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  const userId = await getUserIdFromSessionToken(token)
  if (!userId) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  const period = body.period === 'weekly' ? 'weekly' : 'daily'
  const dateParam = body.date != null ? String(body.date) : null
  const weekParam = body.week != null ? String(body.week) : null

  const built = await buildTrackingReportResult(userId, period, { dateParam, weekParam })
  if (!built.ok) {
    return Response.json({ ok: false, error: built.error }, { status: built.status })
  }

  try {
    const pdf =
      period === 'daily'
        ? await buildDailyReportPdfBuffer(built.body)
        : await buildWeeklyReportPdfBuffer(built.body)

    const name =
      period === 'daily'
        ? `trackifyr-daily-report-${safeFilenamePart(built.body.pktDateLabel)}.pdf`
        : `trackifyr-weekly-report-${safeFilenamePart(built.body.weekMondayIso || built.body.pktDateLabel)}.pdf`

    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${name}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    console.error('[report-pdf]', e)
    return Response.json({ ok: false, error: 'PDF generation failed' }, { status: 500 })
  }
}
