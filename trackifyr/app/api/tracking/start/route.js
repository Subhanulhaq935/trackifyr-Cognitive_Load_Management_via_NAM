export async function POST(request) {
  let webcam = false
  try {
    const body = await request.json()
    webcam = Boolean(body && body.webcam)
  } catch {
    /* default false */
  }
  const bridgePort = process.env.TRACKIFYR_BRIDGE_PORT || '47833'
  try {
    const r = await fetch(`http://127.0.0.1:${bridgePort}/bridge/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webcam }),
    })
    const data = await r.json().catch(() => ({}))
    return Response.json({ ok: r.ok, ...data })
  } catch {
    return Response.json({ ok: false, error: 'electron_bridge_unavailable' }, { status: 503 })
  }
}
