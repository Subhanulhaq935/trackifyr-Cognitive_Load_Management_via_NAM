/**
 * Report JSON for the reports UI. PDFs use `/api/tracking/report-pdf`.
 * @param {'daily'|'weekly'} period
 * @param {{ date?: string, week?: string }} [opts] PKT `YYYY-MM-DD`: daily day, or any day in the target Mon–Sun week
 */
export async function fetchReportPayload(period, opts = {}) {
  const q = new URLSearchParams({ period })
  if (opts.date && period === 'daily') q.set('date', String(opts.date).trim())
  if (opts.week && period === 'weekly') q.set('week', String(opts.week).trim())
  const res = await fetch(`/api/tracking/report?${q.toString()}`, {
    cache: 'no-store',
    credentials: 'same-origin',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || 'Could not load report data')
  }
  return data
}
