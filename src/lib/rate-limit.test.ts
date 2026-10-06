import { test, before } from 'node:test'
import assert from 'node:assert/strict'

// Must be set before the db module is imported.
process.env.TURSO_DATABASE_URL = ':memory:'

let rl: typeof import('./rate-limit')
before(async () => {
  rl = await import('./rate-limit')
})

test('hit counts up within a window', async () => {
  const a = await rl.hit('t-count', '1.1.1.1', 60_000)
  const b = await rl.hit('t-count', '1.1.1.1', 60_000)
  const c = await rl.hit('t-count', '1.1.1.1', 60_000)
  assert.deepEqual([a.count, b.count, c.count], [1, 2, 3])
  assert.equal(a.resetAt, c.resetAt, 'window end does not move on later hits')
})

test('buckets and IPs are independent', async () => {
  await rl.hit('t-iso', '2.2.2.2', 60_000)
  await rl.hit('t-iso', '2.2.2.2', 60_000)
  assert.equal((await rl.hit('t-iso', '3.3.3.3', 60_000)).count, 1)
  assert.equal((await rl.hit('t-iso-other', '2.2.2.2', 60_000)).count, 1)
})

test('window expiry starts a fresh count', async () => {
  await rl.hit('t-exp', '4.4.4.4', 30)
  await rl.hit('t-exp', '4.4.4.4', 30)
  await new Promise(r => setTimeout(r, 60))
  assert.equal((await rl.peek('t-exp', '4.4.4.4')).count, 0)
  assert.equal((await rl.hit('t-exp', '4.4.4.4', 30)).count, 1)
})

test('peek does not count; reset clears', async () => {
  assert.equal((await rl.peek('t-peek', '5.5.5.5')).count, 0)
  await rl.hit('t-peek', '5.5.5.5', 60_000)
  assert.equal((await rl.peek('t-peek', '5.5.5.5')).count, 1)
  assert.equal((await rl.peek('t-peek', '5.5.5.5')).count, 1)
  await rl.reset('t-peek', '5.5.5.5')
  assert.equal((await rl.peek('t-peek', '5.5.5.5')).count, 0)
})

test('concurrent hits are all counted (atomic upsert)', async () => {
  const results = await Promise.all(
    Array.from({ length: 10 }, () => rl.hit('t-conc', '6.6.6.6', 60_000))
  )
  assert.deepEqual(results.map(r => r.count).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
})

test('raw IPs are never stored', async () => {
  await rl.hit('t-priv', '203.0.113.77', 60_000)
  const { db } = await import('@/lib/db')
  const { sql } = await import('drizzle-orm')
  const rows = await db.all<{ key: string }>(sql`SELECT key FROM rate_limits`)
  assert.ok(rows.length > 0)
  assert.ok(rows.every(r => /^[0-9a-f]{64}$/.test(r.key) && !r.key.includes('203.0.113.77')))
})

test('getClientIp prefers x-real-ip, then first x-forwarded-for', () => {
  assert.equal(rl.getClientIp(new Headers({ 'x-real-ip': '9.9.9.9', 'x-forwarded-for': '1.1.1.1' })), '9.9.9.9')
  assert.equal(rl.getClientIp(new Headers({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' })), '1.1.1.1')
  assert.equal(rl.getClientIp(new Headers()), 'unknown')
})
