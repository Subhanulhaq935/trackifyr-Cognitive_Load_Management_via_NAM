import { setTrackingLive } from '@/lib/trackingStore'

export async function POST(request) {
  try {
    const body = await request.json()
    setTrackingLive(body)
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 400 })
  }
}
