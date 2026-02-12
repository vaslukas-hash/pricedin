import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'
import { jobFormSchema } from '@/lib/validations'
import { generateSlug, getExpirationDate, sanitizeHtml } from '@/lib/utils'

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === process.env.ADMIN_PASSWORD
}

const COLUMN_MAP: Record<string, string> = {
  companyname: 'companyName',
  companywebsite: 'companyWebsite',
  title: 'title',
  description: 'description',
  category: 'category',
  seniority: 'seniority',
  industry: 'industry',
  location: 'location',
  locationtype: 'locationType',
  region: 'region',
  salarymin: 'salaryMin',
  salarymax: 'salaryMax',
  salarycurrency: 'salaryCurrency',
  applyurl: 'applyUrl',
  contactemail: 'contactEmail',
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json({ error: 'Please upload an Excel file (.xlsx or .xls)' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const wb = XLSX.read(arrayBuffer, { type: 'array' })

    const sheetName = wb.SheetNames[0]
    if (!sheetName) {
      return NextResponse.json({ error: 'Excel file has no sheets' }, { status: 400 })
    }

    const ws = wb.Sheets[sheetName]
    const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws)

    if (rawRows.length === 0) {
      return NextResponse.json({ error: 'No data rows found in the spreadsheet' }, { status: 400 })
    }

    const results: { row: number; status: 'success' | 'error'; slug?: string; errors?: Record<string, string[]> }[] = []
    let successCount = 0

    for (let i = 0; i < rawRows.length; i++) {
      const raw = rawRows[i]
      const rowNum = i + 2 // Row 1 is header, data starts at row 2

      // Normalize keys (case-insensitive mapping)
      const normalized: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(raw)) {
        const mapped = COLUMN_MAP[key.toLowerCase().replace(/[\s_]/g, '')]
        if (mapped) {
          normalized[mapped] = value
        }
      }

      // Convert salary fields to numbers
      if (normalized.salaryMin) normalized.salaryMin = Number(normalized.salaryMin) || undefined
      if (normalized.salaryMax) normalized.salaryMax = Number(normalized.salaryMax) || undefined

      // Convert empty strings to undefined for optional fields
      if (!normalized.companyWebsite) normalized.companyWebsite = undefined
      if (!normalized.industry) normalized.industry = undefined
      if (!normalized.salaryCurrency) normalized.salaryCurrency = 'EUR'

      // Validate with existing Zod schema
      const parseResult = jobFormSchema.safeParse(normalized)

      if (!parseResult.success) {
        results.push({
          row: rowNum,
          status: 'error',
          errors: parseResult.error.flatten().fieldErrors as Record<string, string[]>,
        })
        continue
      }

      const data = parseResult.data

      try {
        const sanitizedDescription = sanitizeHtml(data.description)
        let slug = ''
        let inserted = false

        for (let attempt = 0; attempt < 3; attempt++) {
          slug = generateSlug(data.companyName, data.title)
          try {
            await db.insert(jobs).values({
              slug,
              status: 'approved',
              companyName: data.companyName,
              companyWebsite: data.companyWebsite || null,
              title: data.title,
              description: sanitizedDescription,
              category: data.category,
              seniority: data.seniority,
              industry: data.industry || null,
              location: data.location || '',
              locationType: data.locationType,
              region: data.region,
              salaryMin: data.salaryMin || null,
              salaryMax: data.salaryMax || null,
              salaryCurrency: data.salaryCurrency,
              applyUrl: data.applyUrl,
              contactEmail: data.contactEmail || '',
              isFeatured: false,
              views: 0,
              clicks: 0,
              createdAt: new Date().toISOString(),
              approvedAt: new Date().toISOString(),
              expiresAt: getExpirationDate(),
            })
            inserted = true
            break
          } catch {
            // Retry with a new slug
          }
        }

        if (inserted) {
          results.push({ row: rowNum, status: 'success', slug })
          successCount++
        } else {
          results.push({
            row: rowNum,
            status: 'error',
            errors: { _db: ['Database insert failed after retries.'] },
          })
        }
      } catch {
        results.push({
          row: rowNum,
          status: 'error',
          errors: { _db: ['Database insert failed.'] },
        })
      }
    }

    return NextResponse.json({
      total: rawRows.length,
      success: successCount,
      failed: rawRows.length - successCount,
      results,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 })
  }
}
