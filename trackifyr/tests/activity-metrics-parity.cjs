'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const path = require('path')
const { pathToFileURL } = require('url')
const { createRequire } = require('module')

const requireDesk = createRequire(__filename)
const desk = requireDesk(path.join(__dirname, '..', 'desktop', 'activityMetrics.cjs'))

test('desktop/activityMetrics.cjs matches lib/activityMetrics.js', async () => {
  const libPath = path.join(__dirname, '..', 'lib', 'activityMetrics.js')
  const lib = await import(pathToFileURL(libPath).href)
  assert.strictEqual(lib.ACTIVITY_SCALE_MIN, desk.ACTIVITY_SCALE_MIN)
  assert.strictEqual(lib.ACTIVITY_SCALE_MAX, desk.ACTIVITY_SCALE_MAX)
  assert.strictEqual(lib.ACTIVITY_HIGH_THRESHOLD, desk.ACTIVITY_HIGH_THRESHOLD)
  assert.strictEqual(lib.ACTIVITY_LOW_THRESHOLD, desk.ACTIVITY_LOW_THRESHOLD)
  assert.strictEqual(lib.ACTIVITY_VERY_HIGH_MIN, desk.ACTIVITY_VERY_HIGH_MIN)
  assert.strictEqual(lib.ACTIVITY_VERY_LOW_MAX, desk.ACTIVITY_VERY_LOW_MAX)
})
