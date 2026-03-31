export async function POST(request) {
  let mode = 'combined'
  try {
    const body = await request.json()
    mode = String(body.mode || 'combined')
  } catch {
    /* ignore */
  }
  const bridgePort = process.env.TRACKIFYR_BRIDGE_PORT || '47833'
  try {
    const r = await fetch(`http://127.0.0.1:${bridgePort}/bridge/filter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    })
    const data = await r.json().catch(() => ({}))
    return Response.json({ ok: r.ok, mode: data.filterMode || mode })
  } catch {
    return Response.json({ ok: false }, { status: 503 })
  }
}
