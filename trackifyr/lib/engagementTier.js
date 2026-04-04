/**
 * Maps fusion `engagement` (Low / Medium / High) to dashboard labels Major / Moderate / Minor.
 */

/** @param {string | null | undefined} engagement */
export function fusionEngagementToTier(engagement) {
  const e = String(engagement || '')
  if (e === 'High') return 'Major'
  if (e === 'Medium') return 'Moderate'
  if (e === 'Low') return 'Minor'
  return null
}

/** Numeric tier for charts (1 = Minor … 3 = Major) */
export function fusionEngagementToTierIndex(engagement) {
  const e = String(engagement || '')
  if (e === 'Low') return 1
  if (e === 'Medium') return 2
  if (e === 'High') return 3
  return null
}
