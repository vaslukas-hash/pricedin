import { createHash } from 'crypto'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

// Fixed-window rate limiter stored in the Turso database, so it works across
// serverless instances (an in-memory Map does not on Vercel). The table is
// created on first use, so no manual migration is needed.
//
// Keys are sha256(bucket:ip); raw IP addresses are never stored.

let tableReady: Promise<unknown> | null = null

function ensureTable() {
  if (!tableReady) {
    tableReady = db
      .run(sql`CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY,
        count INTEGER NOT NULL,
        reset_at INTEGER NOT NULL
      )`)
      .catch((err) => {
        tableReady = null // retry on the next call
        throw err
      })
  }
  return tableReady
}

function keyFor(bucket: string, ip: string): string {
  return createHash('sha256').update(`${bucket}:${ip}`).digest('hex')
}

export function getClientIp(headers: Headers): string {
  // On Vercel these are set by the platform, not by the client.
  const real = headers.get('x-real-ip')
  if (real) return real.trim()
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

export interface RateLimitState {
  count: number
  resetAt: number // epoch ms
}

type Row = { count: number; reset_at: number }

// Record one hit and return the new count for the current window.
export async function hit(bucket: string, ip: string, windowMs: number): Promise<RateLimitState> {
  await ensureTable()
  const now = Date.now()
  const key = keyFor(bucket, ip)
  const rows = await db.all<Row>(sql`
    INSERT INTO rate_limits (key, count, reset_at) VALUES (${key}, 1, ${now + windowMs})
    ON CONFLICT(key) DO UPDATE SET
      count = CASE WHEN reset_at <= ${now} THEN 1 ELSE count + 1 END,
      reset_at = CASE WHEN reset_at <= ${now} THEN ${now + windowMs} ELSE reset_at END
    RETURNING count, reset_at
  `)
  // Opportunistic cleanup of expired rows.
  if (Math.random() < 0.02) {
    await db.run(sql`DELETE FROM rate_limits WHERE reset_at <= ${now}`).catch(() => {})
  }
  return { count: Number(rows[0].count), resetAt: Number(rows[0].reset_at) }
}

// Current count without recording a hit (0 if the window has expired).
export async function peek(bucket: string, ip: string): Promise<RateLimitState> {
  await ensureTable()
  const now = Date.now()
  const rows = await db.all<Row>(
    sql`SELECT count, reset_at FROM rate_limits WHERE key = ${keyFor(bucket, ip)} AND reset_at > ${now}`
  )
  return rows[0]
    ? { count: Number(rows[0].count), resetAt: Number(rows[0].reset_at) }
    : { count: 0, resetAt: 0 }
}

export async function reset(bucket: string, ip: string): Promise<void> {
  await ensureTable()
  await db.run(sql`DELETE FROM rate_limits WHERE key = ${keyFor(bucket, ip)}`)
}

export function retryAfterSeconds(state: RateLimitState): number {
  return Math.max(1, Math.ceil((state.resetAt - Date.now()) / 1000))
}
