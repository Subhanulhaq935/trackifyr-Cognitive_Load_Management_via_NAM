/**
 * Unified 0–100 **Activity %** metric (keyboard/mouse input rate as percent):
 * - **Live / Fusion:** `activity_load` on each ingest (`fuseTracking`).
 * - **Session logs (5 min):** mean of those same samples per PKT window (`mergeIngestIntoFiveMinuteBucket` → `avgActivity`).
 * - **Today / week rollups:** means over the same `activity_load` samples (`getTodayAverageActivityPercent`, weekly aggregates).
 *
 * Thresholds below are shared with `desktop/activityMetrics.cjs` (desktop Fusion). Run `node --test tests/activity-metrics-parity.cjs` after edits.
 */

export const ACTIVITY_SCALE_MIN = 0
export const ACTIVITY_SCALE_MAX = 100

/** Fusion: “high activity” band for the base activity × model matrix. */
export const ACTIVITY_HIGH_THRESHOLD = 70
/** Fusion: “low activity” band for the base matrix (exclusive upper bound for lowAct). */
export const ACTIVITY_LOW_THRESHOLD = 40
/** Fusion / cognitive matrix: “very high” activity % (e.g. Medium engagement → High cognitive). */
export const ACTIVITY_VERY_HIGH_MIN = 80
/** Fusion / cognitive matrix: “very low” activity % (e.g. Low cognitive overrides). */
export const ACTIVITY_VERY_LOW_MAX = 15

/** Dashboard + session table column — same scale as live `activity_load`. */
export const ACTIVITY_PERCENT_LABEL = 'Activity %'

/** Stat card: mean Activity % for current PKT calendar day (same samples as buckets). */
export const ACTIVITY_DAY_AVG_LABEL = 'Activity % (today avg)'

/** Session logs subtitle — clarifies same metric as live (insert into Session logs description). */
export const SESSION_LOGS_ACTIVITY_SUBLINE =
  'Activity % is the mean of the same 0–100 per-sample Activity % as the live dashboard card for that window.'
