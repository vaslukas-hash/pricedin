import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildJobPostingJsonLd, parseLocation } from './job-posting'
import type { Job } from '@/lib/db/schema'

const base: Job = {
  id: 1, slug: 'acme-pricing-manager-abc', status: 'approved',
  companyName: 'Acme', companyWebsite: 'https://acme.com',
  title: 'Pricing Manager', description: '## Role\n\n- Own pricing',
  category: 'Pricing', seniority: 'Manager', industry: 'SaaS',
  location: 'London, UK', locationType: 'Hybrid', region: 'UK',
  salaryMin: 80000, salaryMax: 100000, salaryCurrency: 'GBP',
  applyUrl: 'https://acme.com/apply', contactEmail: 'a@acme.com',
  isFeatured: false, views: 0, clicks: 0,
  createdAt: '2026-10-01T10:00:00.000Z', approvedAt: '2026-10-02T10:00:00.000Z',
  expiresAt: '2026-11-01T10:00:00.000Z',
}

test('parseLocation: US state, Canadian province, country names and region fallback', () => {
  assert.deepEqual(parseLocation('Indianapolis, IN', 'US'), { locality: 'Indianapolis', region: 'IN', country: 'US' })
  assert.deepEqual(parseLocation('San Francisco, CA', 'US'), { locality: 'San Francisco', region: 'CA', country: 'US' })
  assert.deepEqual(parseLocation('Toronto, ON', 'Canada'), { locality: 'Toronto', region: 'ON', country: 'CA' })
  assert.deepEqual(parseLocation('Stockholm, Sweden', 'Europe'), { locality: 'Stockholm', country: 'SE' })
  assert.deepEqual(parseLocation('London, UK', 'UK'), { locality: 'London', country: 'GB' })
  assert.deepEqual(parseLocation('London', 'UK'), { locality: 'London', country: 'GB' })
})

test('parseLocation: unknown country is left out rather than guessed', () => {
  assert.equal(parseLocation('Somewhere, Atlantis', 'Europe').country, undefined)
  assert.equal(parseLocation('Paris', 'Europe').country, undefined)
})

test('buildJobPostingJsonLd: required Google fields and sensible values', () => {
  const ld = buildJobPostingJsonLd(base, 'https://pricedin.co') as Record<string, any>
  assert.equal(ld['@type'], 'JobPosting')
  assert.equal(ld.url, 'https://pricedin.co/jobs/acme-pricing-manager-abc')
  assert.equal(ld.datePosted, '2026-10-02T10:00:00.000Z')
  assert.equal(ld.validThrough, '2026-11-01T10:00:00.000Z')
  assert.equal(ld.directApply, false)
  assert.equal(ld.jobLocation.address.addressCountry, 'GB')
  assert.match(ld.description, /<h2>Role<\/h2>/)
  assert.equal(ld.baseSalary.value.minValue, 80000)
  assert.equal(ld.jobLocationType, undefined)
})

test('buildJobPostingJsonLd: omits null fields instead of emitting null', () => {
  const ld = buildJobPostingJsonLd(
    { ...base, companyWebsite: null, expiresAt: null, salaryMin: null, salaryMax: null, industry: null },
    'https://pricedin.co'
  )
  const json = JSON.stringify(ld)
  assert.ok(!json.includes('null'))
  assert.equal((ld as any).baseSalary, undefined)
  assert.equal((ld as any).validThrough, undefined)
})

test('buildJobPostingJsonLd: remote roles declare applicant location', () => {
  const ld = buildJobPostingJsonLd({ ...base, locationType: 'Remote', location: 'Toronto, Canada', region: 'Canada' }, 'https://pricedin.co') as Record<string, any>
  assert.equal(ld.jobLocationType, 'TELECOMMUTE')
  assert.deepEqual(ld.applicantLocationRequirements, { '@type': 'Country', name: 'CA' })
  const eu = buildJobPostingJsonLd({ ...base, locationType: 'Remote', location: 'Remote', region: 'Europe' }, 'https://pricedin.co') as Record<string, any>
  assert.deepEqual(eu.applicantLocationRequirements, { '@type': 'AdministrativeArea', name: 'Europe' })
})
