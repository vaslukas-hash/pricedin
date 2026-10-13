import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isAnalyticsEnabled } from './analytics'

test('isAnalyticsEnabled: off when the GA id is missing or blank', () => {
  assert.equal(isAnalyticsEnabled(undefined), false)
  assert.equal(isAnalyticsEnabled(''), false)
  assert.equal(isAnalyticsEnabled('   '), false)
})

test('isAnalyticsEnabled: on when a GA id is set', () => {
  assert.equal(isAnalyticsEnabled('G-ABC123'), true)
})
