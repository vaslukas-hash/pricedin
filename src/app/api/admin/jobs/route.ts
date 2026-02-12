import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateSlug, getExpirationDate, sanitizeHtml } from '@/lib/utils'
import { jobFormSchema } from '@/lib/validations'
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

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = jobFormSchema.safeParse(body)

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.')
        if (!fieldErrors[key]) fieldErrors[key] = []
        fieldErrors[key].push(issue.message)
      }
      return NextResponse.json({ error: 'Validation failed', fieldErrors }, { status: 400 })
    }

    const data = parsed.data
    const slug = generateSlug(data.companyName, data.title)
    const now = new Date().toISOString()

    await db.insert(jobs).values({
      slug,
      status: 'approved',
      companyName: data.companyName,
      companyWebsite: data.companyWebsite || null,
      title: data.title,
      description: sanitizeHtml(data.description),
      category: data.category,
      seniority: data.seniority,
      industry: data.industry || null,
      location: data.location || '',
      locationType: data.locationType,
      region: data.region,
      salaryMin: data.salaryMin || null,
      salaryMax: data.salaryMax || null,
      salaryCurrency: data.salaryCurrency || 'EUR',
      applyUrl: data.applyUrl,
      contactEmail: data.contactEmail || '',
      isFeatured: false,
      createdAt: now,
      approvedAt: now,
      expiresAt: getExpirationDate(),
    })

    return NextResponse.json({ success: true, slug })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
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
