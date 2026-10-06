import { test } from 'node:test'
import assert from 'node:assert/strict'
import ExcelJS from 'exceljs'
import { buildJobTemplate, readFirstSheetRows, TEMPLATE_HEADERS } from './excel'
import { jobFormSchema } from './validations'

async function workbookBuffer(fill: (ws: ExcelJS.Worksheet) => void): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook()
  fill(wb.addWorksheet('Jobs'))
  return new Uint8Array(await wb.xlsx.writeBuffer())
}

test('the generated template reads back as one valid job row', async () => {
  const rows = await readFirstSheetRows(await buildJobTemplate())
  assert.equal(rows.length, 1)
  assert.equal(rows[0].row, 2)
  assert.deepEqual(Object.keys(rows[0].values), TEMPLATE_HEADERS)
  assert.equal(rows[0].values.companyName, 'Stripe')
  assert.equal(rows[0].values.salaryMin, 80000)
  // and the example row passes the same validation the upload route applies
  assert.ok(jobFormSchema.safeParse(rows[0].values).success)
})

test('template has the reference sheet too', async () => {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load((await buildJobTemplate()) as unknown as ArrayBuffer)
  assert.deepEqual(wb.worksheets.map(w => w.name), ['Jobs', 'Valid Values'])
})

test('hyperlinks, formulas, rich text and dates are flattened to plain values', async () => {
  const buf = await workbookBuffer(ws => {
    ws.addRow(['link', 'formula', 'rich', 'date'])
    const r = ws.addRow([])
    r.getCell(1).value = { text: 'Apply here', hyperlink: 'https://example.com/apply' }
    r.getCell(2).value = { formula: '1+2', result: 3 }
    r.getCell(3).value = { richText: [{ text: 'Hello ' }, { text: 'world' }] }
    r.getCell(4).value = new Date('2026-02-12T00:00:00.000Z')
  })
  const [row] = await readFirstSheetRows(buf)
  assert.equal(row.values.link, 'Apply here')
  assert.equal(row.values.formula, 3)
  assert.equal(row.values.rich, 'Hello world')
  assert.equal(row.values.date, '2026-02-12T00:00:00.000Z')
})

test('blank rows are skipped and real row numbers are kept', async () => {
  const buf = await workbookBuffer(ws => {
    ws.addRow(['title'])
    ws.addRow(['first'])
    ws.addRow([])
    ws.addRow(['  '])
    ws.addRow(['second'])
  })
  const rows = await readFirstSheetRows(buf)
  assert.deepEqual(rows.map(r => [r.row, r.values.title]), [[2, 'first'], [5, 'second']])
})

test('a __proto__ header is just a key and cannot pollute prototypes', async () => {
  const buf = await workbookBuffer(ws => {
    ws.addRow(['__proto__', 'constructor', 'title'])
    ws.addRow(['polluted', 'x', 'ok'])
  })
  const [row] = await readFirstSheetRows(buf)
  assert.equal(row.values.title, 'ok')
  assert.equal(Object.getPrototypeOf(row.values), null)
  assert.equal(({} as Record<string, unknown>).polluted, undefined)
  assert.equal(Object.prototype.hasOwnProperty.call(Object.prototype, 'polluted'), false)
})

test('invalid or non-xlsx input is rejected', async () => {
  await assert.rejects(readFirstSheetRows(Buffer.from('this is not a spreadsheet')))
  await assert.rejects(readFirstSheetRows(Buffer.alloc(0)))
})

test('a sheet with only a header yields no rows', async () => {
  const buf = await workbookBuffer(ws => { ws.addRow(['title', 'company']) })
  assert.deepEqual(await readFirstSheetRows(buf), [])
})
