import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'
import { jobFormSchema } from '@/lib/validations'
import { generateSlug, getExpirationDate, sanitizeHtml } from '@/lib/utils'
import { readFirstSheetRows, MAX_UPLOAD_BYTES, MAX_UPLOAD_ROWS, type SheetRow } from '@/lib/excel'

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
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      return NextResponse.json(
        { error: 'Please upload an Excel .xlsx file (re-save older .xls files as .xlsx)' },
        { status: 400 }
      )
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `File is too large (max ${MAX_UPLOAD_BYTES / 1024 / 1024} MB)` },
        { status: 413 }
      )
    }

    let rawRows: SheetRow[]
    try {
      rawRows = await readFirstSheetRows(await file.arrayBuffer())
    } catch {
      return NextResponse.json(
        { error: 'Could not read the file. Make sure it is a valid .xlsx spreadsheet.' },
        { status: 400 }
      )
    }

    if (rawRows.length === 0) {
      return NextResponse.json({ error: 'No data rows found in the spreadsheet' }, { status: 400 })
    }

    if (rawRows.length > MAX_UPLOAD_ROWS) {
      return NextResponse.json(
        { error: `Too many rows (${rawRows.length}). Upload at most ${MAX_UPLOAD_ROWS} jobs at a time.` },
        { status: 400 }
      )
    }

    const results: { row: number; status: 'success' | 'error'; slug?: string; errors?: Record<string, string[]> }[] = []
    let successCount = 0

    for (const { row: rowNum, values: raw } of rawRows) {

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
