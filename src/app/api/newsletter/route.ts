import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { subscribers } from '@/lib/db/schema'
import { newsletterSchema } from '@/lib/validations'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
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
