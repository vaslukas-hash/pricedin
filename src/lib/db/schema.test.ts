import { test } from 'node:test'
import assert from 'node:assert/strict'

// Must be set before the db module is imported.
process.env.TURSO_DATABASE_URL = ':memory:'

test('createdAt defaults to an ISO timestamp even if the DB default is the old literal text', async () => {
  const { db } = await import('./index')
  const { subscribers } = await import('./schema')
  const { sql } = await import('drizzle-orm')

  // Recreate the table the way it was originally pushed to production:
  // the DB-level default is the string 'CURRENT_TIMESTAMP'.
  await db.run(sql`CREATE TABLE subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT 'CURRENT_TIMESTAMP'
  )`)

  await db.insert(subscribers).values({ email: 'a@example.com' })
  const [row] = await db.select().from(subscribers)

  assert.notEqual(row.createdAt, 'CURRENT_TIMESTAMP')
  assert.ok(!Number.isNaN(new Date(row.createdAt!).getTime()), `not a date: ${row.createdAt}`)
  assert.match(row.createdAt!, /^\d{4}-\d{2}-\d{2}T/)
})
