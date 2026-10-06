import { test } from 'node:test'
import assert from 'node:assert/strict'
import { jobFormSchema, newsletterSchema } from './validations'

const valid = {
  companyName: 'Acme',
  title: 'Pricing Manager',
  description: 'x'.repeat(120),
  category: 'Pricing',
  seniority: 'Manager',
  locationType: 'Remote',
  region: 'Europe',
  applyUrl: 'https://example.com/apply',
}

test('jobFormSchema accepts a minimal valid job and applies defaults', () => {
  const r = jobFormSchema.safeParse(valid)
  assert.ok(r.success)
  assert.equal(r.data.salaryCurrency, 'EUR')
})

test('jobFormSchema treats empty optional strings as missing', () => {
  const r = jobFormSchema.safeParse({ ...valid, companyWebsite: '', industry: '', location: '', contactEmail: '' })
  assert.ok(r.success)
})

test('jobFormSchema rejects bad input', () => {
  assert.ok(!jobFormSchema.safeParse({ ...valid, description: 'too short' }).success)
  assert.ok(!jobFormSchema.safeParse({ ...valid, category: 'Cooking' }).success)
  assert.ok(!jobFormSchema.safeParse({ ...valid, applyUrl: 'not a url' }).success)
  assert.ok(!jobFormSchema.safeParse({ ...valid, salaryMin: 200000, salaryMax: 100000 }).success)
})

test('newsletterSchema validates email', () => {
  assert.ok(newsletterSchema.safeParse({ email: 'a@b.co' }).success)
  assert.ok(!newsletterSchema.safeParse({ email: 'nope' }).success)
})
