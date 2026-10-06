import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { subscribers } from '@/lib/db/schema'
import { newsletterSchema } from '@/lib/validations'
import { eq } from 'drizzle-orm'
import { getClientIp, hit, retryAfterSeconds } from '@/lib/rate-limit'

// 10 signups per IP per hour
const SIGNUP_WINDOW_MS = 60 * 60 * 1000
const SIGNUP_MAX = 10

export async function POST(request: NextRequest) {
  try {
    try {
      const state = await hit('newsletter', getClientIp(request.headers), SIGNUP_WINDOW_MS)
      if (state.count > SIGNUP_MAX) {
        return NextResponse.json(
          { error: 'Too many attempts. Please try again later.' },
          { status: 429, headers: { 'Retry-After': String(retryAfterSeconds(state)) } }
        )
      }
    } catch (err) {
      console.error('Rate limiter error (failing open):', err)
    }

    const body = await request.json()
    
    // Validate input
    const result = newsletterSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }
    
    const { email } = result.data
    
    // Check if already subscribed
    const existing = await db.select()
      .from(subscribers)
      .where(eq(subscribers.email, email.toLowerCase()))
      .limit(1)
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Already subscribed' },
        { status: 400 }
      )
    }
    
    // Insert subscriber
    await db.insert(subscribers).values({
      email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error subscribing:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
