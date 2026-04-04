/**
 * Browser → local Electron bridge (same machine as the desktop app).
 * Server-side /api/tracking/filter cannot reach the user's bridge when Next runs remotely.
 */

const DEFAULT_PORT = '47833'

export function getTrackingBridgeOrigin() {
  if (typeof window === 'undefined') return ''
  const port = process.env.NEXT_PUBLIC_TRACKIFYR_BRIDGE_PORT || DEFAULT_PORT
  return `http://127.0.0.1:${String(port)}`
}

/**
 * @param {'combined' | 'activity' | 'webcam'} mode
 * @returns {Promise<boolean>} true if bridge accepted the mode
 */
export async function postTrackingFilterToBridge(mode) {
  const m = mode === 'activity' || mode === 'webcam' ? mode : 'combined'
  try {
    const res = await fetch(`${getTrackingBridgeOrigin()}/bridge/filter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: m }),
    })
    if (!res.ok) return false
    const data = await res.json().catch(() => ({}))
    return Boolean(data.ok !== false && (data.filterMode === m || data.filterMode))
  } catch {
    return false
  }
}
