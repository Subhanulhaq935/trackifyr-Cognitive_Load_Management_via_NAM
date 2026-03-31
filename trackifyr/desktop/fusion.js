'use strict'

/** Frames with gaze_away count at or above this are treated as "high gaze" for engagement. */
const GAZE_AWAY_ENGAGEMENT_LOW = 12

/**
 * @param {object} input
 * @param {number} [input.activity_percentage]
 * @param {number} [input.activity_load]
 * @param {string} input.final_model_load
 * @param {number} input.blinks
 * @param {number} input.gaze_away
 * @param {boolean} input.face_detected
 */
function fuseTracking(input) {
  const activity_load = Number(
    input.activity_percentage != null ? input.activity_percentage : input.activity_load ?? 0,
  )
  const final_model_load = String(input.final_model_load || 'Medium')
  const blinks = Number(input.blinks ?? 0)
  const gaze_away = Number(input.gaze_away ?? 0)
  const face_detected = Boolean(input.face_detected)

  const highAct = activity_load >= 50
  const lowAct = activity_load < 30
  const mHigh = final_model_load === 'High'
  const mLow = final_model_load === 'Low'

  let final_cognitive_load = 'Medium'
  if (highAct && mHigh) final_cognitive_load = 'High'
  else if (highAct && mLow) final_cognitive_load = 'Medium'
  else if (lowAct && mHigh) final_cognitive_load = 'Medium'
  else if (lowAct && mLow) final_cognitive_load = 'Low'
  else {
    if (mHigh) final_cognitive_load = 'Medium'
    else if (mLow) final_cognitive_load = 'Low'
    else final_cognitive_load = 'Medium'
  }

  let engagement = 'Medium'
  if (!face_detected || gaze_away >= GAZE_AWAY_ENGAGEMENT_LOW) {
    engagement = 'Low'
  } else if (final_model_load === 'Low') {
    engagement = 'Medium'
  } else {
    engagement = final_model_load
  }

  return {
    activity_load,
    engagement,
    final_cognitive_load,
    blinks,
    gaze_away,
  }
}

module.exports = { fuseTracking, GAZE_AWAY_ENGAGEMENT_LOW }
