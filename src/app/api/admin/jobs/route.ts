import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getExpirationDate } from '@/lib/utils'
import { cookies } from 'next/headers'

function isAuthenticated(request: NextRequest): boolean {
  const cookieStore = cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === process.env.ADMIN_PASSWORD
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'pending'
  
  try {
    const jobsList = await db.select()
      .from(jobs)
      .where(eq(jobs.status, status as any))
      .orderBy(jobs.createdAt)
    
    return NextResponse.json({ jobs: jobsList })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { jobId, action, isFeatured } = await request.json()
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }
    
    if (action === 'approve') {
      await db.update(jobs)
        .set({
          status: 'approved',
          approvedAt: new Date().toISOString(),
          expiresAt: getExpirationDate(),
        })
        .where(eq(jobs.id, jobId))
    } else if (action === 'reject') {
      await db.update(jobs)
        .set({ status: 'rejected' })
        .where(eq(jobs.id, jobId))
    } else if (action === 'feature') {
      await db.update(jobs)
        .set({ isFeatured })
        .where(eq(jobs.id, jobId))
    } else if (action === 'expire') {
      await db.update(jobs)
        .set({ status: 'expired' })
        .where(eq(jobs.id, jobId))
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('id')
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }
    
    await db.delete(jobs).where(eq(jobs.id, parseInt(jobId)))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}
