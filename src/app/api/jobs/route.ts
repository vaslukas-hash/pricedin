import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'
import { generateSlug, getExpirationDate, sanitizeHtml } from '@/lib/utils'
import { jobFormSchema } from '@/lib/validations'

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX = 5 // 5 submissions per hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)
  
  if (!entry || now > entry.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }
  
  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      )
    }
    
    const body = await request.json()
    
    // Validate input
    const result = jobFormSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    
    const data = result.data
    
    // Generate slug
    const slug = generateSlug(data.companyName, data.title)
    
    // Sanitize description
    const sanitizedDescription = sanitizeHtml(data.description)
    
    // Insert job
    const newJob = await db.insert(jobs).values({
      slug,
      status: 'pending',
      companyName: data.companyName,
      companyWebsite: data.companyWebsite || null,
      companyLogoUrl: data.companyLogoUrl || null,
      title: data.title,
      description: sanitizedDescription,
      category: data.category,
      seniority: data.seniority,
      industry: data.industry || null,
      location: data.location,
      locationType: data.locationType,
      region: data.region,
      salaryMin: data.salaryMin || null,
      salaryMax: data.salaryMax || null,
      salaryCurrency: data.salaryCurrency,
      applyUrl: data.applyUrl,
      contactEmail: data.contactEmail,
      isFeatured: false,
      views: 0,
      clicks: 0,
      createdAt: new Date().toISOString(),
      approvedAt: null,
      expiresAt: null,
    }).returning()
    
    return NextResponse.json({ success: true, slug }, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}
