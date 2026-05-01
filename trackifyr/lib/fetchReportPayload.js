/**
 * Report JSON for PDF export — kept separate from jspdf so the reports page
 * does not statically import the jspdf/canvg chain (avoids broken core-js in some installs).
 */
export async function fetchReportPayload(period) {
  const res = await fetch(`/api/tracking/report?period=${period}`, {
    cache: 'no-store',
    credentials: 'same-origin',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || 'Could not load report data')
  }
  return data
}
