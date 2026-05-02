/**
 * Download a tracking PDF from the server (no jspdf in the browser bundle).
 * @param {'daily'|'weekly'} period
 * @param {{ date?: string, week?: string }} [opts] Same PKT semantics as `/api/tracking/report`
 */
export async function downloadTrackingReportPdf(period, opts = {}) {
  const res = await fetch('/api/tracking/report-pdf', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      period,
      ...(opts.date && period === 'daily' ? { date: opts.date } : {}),
      ...(opts.week && period === 'weekly' ? { week: opts.week } : {}),
    }),
  })

  if (!res.ok) {
    let msg = 'Could not generate PDF'
    try {
      const j = await res.json()
      if (j?.error) msg = j.error
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }

  const cd = res.headers.get('Content-Disposition') || ''
  const m = cd.match(/filename="([^"]+)"/i) || cd.match(/filename=([^;\s]+)/i)
  const filename = m ? m[1].trim() : `trackifyr-${period}.pdf`

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
  } finally {
    URL.revokeObjectURL(url)
  }
}
