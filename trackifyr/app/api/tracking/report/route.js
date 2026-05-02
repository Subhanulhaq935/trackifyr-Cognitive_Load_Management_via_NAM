import { getSessionTokenFromRequest } from '@/lib/auth-session'
import { buildTrackingReportResult } from '@/lib/trackingReportJson'
import { getUserIdFromSessionToken } from '@/lib/trackingLiveDb'

export const runtime = 'nodejs'

export async function GET(request) {
  const token = await getSessionTokenFromRequest(request)
  if (!token) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  const userId = await getUserIdFromSessionToken(token)
  if (!userId) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const period = url.searchParams.get('period') === 'weekly' ? 'weekly' : 'daily'
  const dateParam = url.searchParams.get('date')
  const weekParam = url.searchParams.get('week')

  const built = await buildTrackingReportResult(userId, period, { dateParam, weekParam })
  if (!built.ok) {
    return Response.json({ ok: false, error: built.error }, { status: built.status })
  }
  return Response.json(built.body)
}
