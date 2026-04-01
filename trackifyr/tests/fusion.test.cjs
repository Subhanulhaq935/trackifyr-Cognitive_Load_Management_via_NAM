'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const path = require('path')
const { fuseTracking } = require(path.join(__dirname, '..', 'desktop', 'fusion.js'))

test('high activity + high model => high', () => {
  const o = fuseTracking({
    activity_percentage: 80,
    final_model_load: 'High',
    blinks: 0,
    gaze_away: 0,
    face_detected: true,
  })
  assert.strictEqual(o.final_cognitive_load, 'High')
})

test('no face => engagement low', () => {
  const o = fuseTracking({
    activity_percentage: 50,
    final_model_load: 'High',
    blinks: 0,
    gaze_away: 0,
    face_detected: false,
  })
  assert.strictEqual(o.engagement, 'Low')
  assert.deepStrictEqual(o.engagement_proba_pct, [100, 0, 0])
})

test('synthetic webcam (webcam off): engagement 0% and flat proba triple', () => {
  const o = fuseTracking({
    activity_percentage: 80,
    final_model_load: 'Medium',
    blinks: 0,
    gaze_away: 0,
    face_detected: true,
    synthetic_webcam: true,
  })
  assert.strictEqual(o.engagement_score, 0)
  assert.deepStrictEqual(o.engagement_proba_pct, [0, 0, 0])
})

test('ensemble cognitive_proba => engagement_score and 3 percentage bars', () => {
  const o = fuseTracking({
    activity_percentage: 50,
    final_model_load: 'Medium',
    blinks: 0,
    gaze_away: 0,
    face_detected: true,
    synthetic_webcam: false,
    cognitive_proba: [0.15, 0.55, 0.3],
  })
  assert.strictEqual(o.engagement, 'Medium')
  assert.ok(o.engagement_score > 40 && o.engagement_score < 70, `score ${o.engagement_score} in mid band`)
  assert.deepStrictEqual(o.engagement_proba_pct, [15, 55, 30])

  const hi = fuseTracking({
    activity_percentage: 40,
    final_model_load: 'High',
    blinks: 0,
    gaze_away: 0,
    face_detected: true,
    synthetic_webcam: false,
    cognitive_proba: [0.05, 0.15, 0.8],
  })
  assert.ok(hi.engagement_score >= 72, `high-load proba should lift engagement, got ${hi.engagement_score}`)
  assert.deepStrictEqual(hi.engagement_proba_pct, [5, 15, 80])
})
