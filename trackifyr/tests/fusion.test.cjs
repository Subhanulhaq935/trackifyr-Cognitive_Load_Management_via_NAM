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
})
