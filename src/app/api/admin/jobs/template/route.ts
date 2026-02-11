import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { cookies } from 'next/headers'
import { CATEGORIES, SENIORITY_LEVELS, REGIONS, LOCATION_TYPES, CURRENCIES, INDUSTRIES } from '@/lib/constants'

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === process.env.ADMIN_PASSWORD
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const wb = XLSX.utils.book_new()

  // Main Jobs sheet with headers and one example row
  const headers = [
    'companyName', 'companyWebsite', 'title', 'description', 'category',
    'seniority', 'industry', 'location', 'locationType', 'region',
    'salaryMin', 'salaryMax', 'salaryCurrency', 'applyUrl', 'contactEmail'
  ]

  const exampleRow = [
    'Stripe', 'https://stripe.com', 'Pricing Manager',
    'We are looking for a Pricing Manager to lead our pricing strategy. You will work cross-functionally with product, finance, and sales teams to optimize our pricing models and drive revenue growth. Minimum 100 characters required for the description field.',
    'Pricing', 'Manager', 'Fintech', 'San Francisco, CA', 'Remote', 'US',
    80000, 120000, 'USD', 'https://stripe.com/jobs/123', 'hiring@stripe.com'
  ]

  const wsData = [headers, exampleRow]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  ws['!cols'] = headers.map(h => ({ wch: Math.max(h.length + 5, 20) }))

  XLSX.utils.book_append_sheet(wb, ws, 'Jobs')

  // Reference sheet with valid values for enum fields
  const refHeaders = ['Categories', 'Seniority Levels', 'Regions', 'Location Types', 'Currencies', 'Industries']
  const maxLen = Math.max(
    CATEGORIES.length, SENIORITY_LEVELS.length, REGIONS.length,
    LOCATION_TYPES.length, CURRENCIES.length, INDUSTRIES.length
  )
  const refData: string[][] = [refHeaders]
  for (let i = 0; i < maxLen; i++) {
    refData.push([
      CATEGORIES[i] || '',
      SENIORITY_LEVELS[i] || '',
      REGIONS[i] || '',
      LOCATION_TYPES[i] || '',
      CURRENCIES[i]?.code || '',
      INDUSTRIES[i] || '',
    ])
  }
  const wsRef = XLSX.utils.aoa_to_sheet(refData)
  wsRef['!cols'] = refHeaders.map(() => ({ wch: 25 }))
  XLSX.utils.book_append_sheet(wb, wsRef, 'Valid Values')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="pricedin-job-template.xlsx"',
    },
  })
}
