import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json()
    
    if (!jobId || typeof jobId !== 'number') {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })
    }
    
    // Increment click count
    await db.update(jobs)
      .set({ clicks: sql`${jobs.clicks} + 1` })
      .where(eq(jobs.id, jobId))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking click:', error)
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 })
  }
}
