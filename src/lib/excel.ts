import ExcelJS from 'exceljs'
import { CATEGORIES, SENIORITY_LEVELS, REGIONS, LOCATION_TYPES, CURRENCIES, INDUSTRIES } from './constants'

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 // 2 MB
export const MAX_UPLOAD_ROWS = 500

export const TEMPLATE_HEADERS = [
  'companyName', 'companyWebsite', 'title', 'description', 'category',
  'seniority', 'industry', 'location', 'locationType', 'region',
  'salaryMin', 'salaryMax', 'salaryCurrency', 'applyUrl', 'contactEmail',
]

export interface SheetRow {
  row: number // 1-based spreadsheet row number (header is row 1)
  values: Record<string, unknown> // keyed by the header text, as written
}

// Flatten ExcelJS cell values (hyperlinks, rich text, formulas, dates) to plain values.
function cellValue(v: ExcelJS.CellValue): unknown {
  if (v === null || v === undefined) return undefined
  if (v instanceof Date) return v.toISOString()
  if (typeof v !== 'object') return v
  if ('richText' in v) return v.richText.map(part => part.text).join('')
  if ('result' in v) return cellValue(v.result as ExcelJS.CellValue) // formula
  if ('hyperlink' in v) return typeof v.text === 'string' ? v.text : v.hyperlink
  if ('text' in v) return String((v as { text: unknown }).text)
  return undefined // error values etc.
}

// Read the first sheet: row 1 is the header, later rows become objects.
// Fully blank rows are skipped. Throws if the file is not a readable .xlsx.
export async function readFirstSheetRows(data: ArrayBuffer | Uint8Array): Promise<SheetRow[]> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(data as ArrayBuffer)

  const sheet = workbook.worksheets[0]
  if (!sheet) throw new Error('Excel file has no sheets')

  const headers: string[] = []
  sheet.getRow(1).eachCell({ includeEmpty: false }, (cell, col) => {
    const text = cellValue(cell.value)
    if (text !== undefined && String(text).trim() !== '') headers[col] = String(text).trim()
  })

  const rows: SheetRow[] = []
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return
    // Null prototype: header text such as "__proto__" is then just a normal key.
    const values: Record<string, unknown> = Object.create(null)
    let hasValue = false
    headers.forEach((header, col) => {
      if (!header) return
      const value = cellValue(row.getCell(col).value)
      if (value === undefined || (typeof value === 'string' && value.trim() === '')) return
      values[header] = value
      hasValue = true
    })
    if (hasValue) rows.push({ row: rowNumber, values })
  })
  return rows
}

export async function buildJobTemplate(): Promise<Uint8Array<ArrayBuffer>> {
  const workbook = new ExcelJS.Workbook()

  const jobs = workbook.addWorksheet('Jobs')
  jobs.addRow(TEMPLATE_HEADERS)
  jobs.addRow([
    'Stripe', 'https://stripe.com', 'Pricing Manager',
    'We are looking for a Pricing Manager to lead our pricing strategy. You will work cross-functionally with product, finance, and sales teams to optimize our pricing models and drive revenue growth. Minimum 100 characters required for the description field.',
    'Pricing', 'Manager', 'Fintech', 'San Francisco, CA', 'Remote', 'US',
    80000, 120000, 'USD', 'https://stripe.com/jobs/123', 'hiring@stripe.com',
  ])
  jobs.columns = TEMPLATE_HEADERS.map(h => ({ width: Math.max(h.length + 5, 20) }))

  // Reference sheet with valid values for the enum fields
  const refHeaders = ['Categories', 'Seniority Levels', 'Regions', 'Location Types', 'Currencies', 'Industries']
  const ref = workbook.addWorksheet('Valid Values')
  ref.addRow(refHeaders)
  const maxLen = Math.max(
    CATEGORIES.length, SENIORITY_LEVELS.length, REGIONS.length,
    LOCATION_TYPES.length, CURRENCIES.length, INDUSTRIES.length
  )
  for (let i = 0; i < maxLen; i++) {
    ref.addRow([
      CATEGORIES[i] || '',
      SENIORITY_LEVELS[i] || '',
      REGIONS[i] || '',
      LOCATION_TYPES[i] || '',
      CURRENCIES[i]?.code || '',
      INDUSTRIES[i] || '',
    ])
  }
  ref.columns = refHeaders.map(() => ({ width: 25 }))

  const written = await workbook.xlsx.writeBuffer()
  const bytes = new Uint8Array(new ArrayBuffer(written.byteLength))
  bytes.set(new Uint8Array(written))
  return bytes
}
