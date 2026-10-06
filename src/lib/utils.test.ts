import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatSalary, generateSlug, timeAgo, getExpirationDate, parseDate, formatDate } from './utils'

test('formatSalary: ranges, open-ended and missing values', () => {
  assert.equal(formatSalary(80000, 120000, 'EUR'), '€80k - €120k')
  assert.equal(formatSalary(90000, null, 'USD'), 'From $90k')
  assert.equal(formatSalary(null, 150000, 'GBP'), 'Up to £150k')
  assert.equal(formatSalary(null, null, 'EUR'), 'Competitive')
})

test('formatSalary: unknown currency falls back to EUR', () => {
  assert.equal(formatSalary(50000, 60000, 'XXX'), '€50k - €60k')
})

test('generateSlug: url-safe, lowercase, unique per call', () => {
  const a = generateSlug('Acme & Co.', 'Senior Pricing Manager')
  const b = generateSlug('Acme & Co.', 'Senior Pricing Manager')
  assert.match(a, /^acme-and-co-senior-pricing-manager-[a-z0-9]+$/)
  assert.notEqual(a, b)
})

test('timeAgo: buckets by age', () => {
  const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString()
  assert.equal(timeAgo(null), '')
  assert.equal(timeAgo(daysAgo(0)), 'Today')
  assert.equal(timeAgo(daysAgo(1)), 'Yesterday')
  assert.equal(timeAgo(daysAgo(3)), '3 days ago')
  assert.equal(timeAgo(daysAgo(14)), '2 weeks ago')
  assert.equal(timeAgo(daysAgo(60)), '2 months ago')
})

test('getExpirationDate is about 30 days out', () => {
  const days = (new Date(getExpirationDate()).getTime() - Date.now()) / 86_400_000
  assert.ok(days > 29.9 && days < 30.1, `got ${days}`)
})

test('parseDate returns null for missing or invalid values', () => {
  assert.equal(parseDate(null), null)
  assert.equal(parseDate(''), null)
  assert.equal(parseDate('CURRENT_TIMESTAMP'), null)
  assert.equal(parseDate('2026-02-12T20:27:04.000Z')?.getUTCFullYear(), 2026)
})

test('timeAgo and formatDate tolerate legacy CURRENT_TIMESTAMP values', () => {
  assert.equal(timeAgo('CURRENT_TIMESTAMP'), '')
  assert.equal(formatDate('CURRENT_TIMESTAMP'), '')
})
