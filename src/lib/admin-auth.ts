import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'admin_auth'
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 1 week, in seconds

// Signing key. ADMIN_SESSION_SECRET is preferred so the key can be rotated
// independently of the login password; falls back to ADMIN_PASSWORD.
function getSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

export function checkAdminPassword(input: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || typeof input !== 'string') return false
  // Hash both sides so comparison time doesn't depend on length.
  const hash = (s: string) => createHmac('sha256', 'admin-login').update(s).digest()
  return timingSafeEqual(hash(input), hash(expected))
}

// Token format: "<expiryUnixSeconds>.<hmac>". Never contains the password.
export function createSessionToken(): string | null {
  const secret = getSecret()
  if (!secret) return null
  const expires = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE
  return `${expires}.${sign(String(expires), secret)}`
}

export function verifySessionToken(token: string | undefined): boolean {
  const secret = getSecret()
  if (!secret || !token) return false
  const [expires, signature] = token.split('.')
  if (!expires || !signature) return false
  if (!safeEqual(signature, sign(expires, secret))) return false
  return Number(expires) > Math.floor(Date.now() / 1000)
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value)
}
