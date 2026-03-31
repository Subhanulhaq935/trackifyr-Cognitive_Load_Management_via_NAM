export async function POST() {
  const bridgePort = process.env.TRACKIFYR_BRIDGE_PORT || '47833'
  try {
    const r = await fetch(`http://127.0.0.1:${bridgePort}/bridge/stop`, { method: 'POST' })
    const data = await r.json().catch(() => ({}))
    return Response.json({ ok: r.ok, ...data })
  } catch {
    return Response.json({ ok: false, error: 'electron_bridge_unavailable' }, { status: 503 })
  }
}
