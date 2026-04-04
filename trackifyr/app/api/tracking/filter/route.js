export const runtime = 'nodejs'

export async function GET() {
  return Response.json({
    ok: true,
    hint: 'POST JSON { "mode": "combined" | "activity" | "webcam" } to forward to the desktop bridge when it is running.',
  })
}

export async function POST(request) {
  let mode = 'combined'
  try {
    const body = await request.json()
    mode = String(body.mode || 'combined')
  } catch {
    /* ignore */
  }
  if (mode !== 'activity' && mode !== 'webcam' && mode !== 'combined') {
    mode = 'combined'
  }

  const bridgePort = process.env.TRACKIFYR_BRIDGE_PORT || '47833'
  try {
    const r = await fetch(`http://127.0.0.1:${bridgePort}/bridge/filter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
      signal: AbortSignal.timeout(2500),
    })
    const data = await r.json().catch(() => ({}))
    return Response.json({
      ok: r.ok,
      mode: data.filterMode || mode,
      bridge: true,
    })
  } catch {
    return Response.json(
      {
        ok: false,
        mode,
        bridge: false,
        reason: 'bridge_unreachable',
      },
      { status: 200 },
    )
  }
}
