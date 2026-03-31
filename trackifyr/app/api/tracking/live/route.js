import { getTrackingLive } from '@/lib/trackingStore'

const EMPTY = {
  activity_load: 0,
  engagement: 'Low',
  final_cognitive_load: 'Low',
  blinks: 0,
  gaze_away: 0,
}

export async function GET() {
  const bridgePort = process.env.TRACKIFYR_BRIDGE_PORT || '47833'
  try {
    const r = await fetch(`http://127.0.0.1:${bridgePort}/bridge/live`, { cache: 'no-store' })
    if (r.ok) {
      const j = await r.json()
      if (j && j.fused && typeof j.fused === 'object') {
        return Response.json(j.fused)
      }
    }
  } catch {
    /* use in-memory store */
  }
  const mem = getTrackingLive()
  if (mem) return Response.json(mem)
  return Response.json(EMPTY)
}
