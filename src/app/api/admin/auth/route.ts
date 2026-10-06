import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  checkAdminPassword,
  createSessionToken,
} from '@/lib/admin-auth'
import { getClientIp, hit, peek, reset, retryAfterSeconds } from '@/lib/rate-limit'

// Only failed logins count: 5 per IP per 15 minutes, cleared on success.
const LOGIN_BUCKET = 'admin-login'
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_FAILURES = 5

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)

    // If the limiter itself fails we let the attempt through (the password
    // check still applies) rather than locking the admin out.
    try {
      const state = await peek(LOGIN_BUCKET, ip)
      if (state.count >= LOGIN_MAX_FAILURES) {
        return NextResponse.json(
          { error: 'Too many failed attempts. Try again later.' },
          { status: 429, headers: { 'Retry-After': String(retryAfterSeconds(state)) } }
        )
      }
    } catch (err) {
      console.error('Rate limiter error (failing open):', err)
    }

    const { password } = await request.json()

    if (checkAdminPassword(password)) {
      await reset(LOGIN_BUCKET, ip).catch(() => {})
      const token = createSessionToken()
      if (!token) {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
      }

      // Set HTTP-only cookie holding a signed, expiring session token
      const cookieStore = await cookies()
      cookieStore.set(ADMIN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ADMIN_SESSION_MAX_AGE,
        path: '/',
      })

      return NextResponse.json({ success: true })
    }

    await hit(LOGIN_BUCKET, ip, LOGIN_WINDOW_MS).catch((err) => {
      console.error('Rate limiter error (failing open):', err)
    })
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
  return NextResponse.json({ success: true })
}
