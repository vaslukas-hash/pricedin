import type { Job } from '@/lib/db/schema'
import { renderDescription } from '@/lib/description'
import { parseDate } from '@/lib/utils'

const US_STATES = new Set(
  'AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC'.split(' ')
)
const CA_PROVINCES = new Set('AB BC MB NB NS ON PE QC SK NT NU YT'.split(' '))

// Country names/aliases as they appear after the last comma of a location (lowercase)
const COUNTRIES: Record<string, string> = {
  'uk': 'GB', 'united kingdom': 'GB', 'england': 'GB', 'scotland': 'GB', 'wales': 'GB', 'northern ireland': 'GB',
  'us': 'US', 'usa': 'US', 'united states': 'US', 'united states of america': 'US',
  'canada': 'CA', 'germany': 'DE', 'france': 'FR', 'netherlands': 'NL', 'the netherlands': 'NL',
  'spain': 'ES', 'italy': 'IT', 'sweden': 'SE', 'norway': 'NO', 'denmark': 'DK', 'finland': 'FI',
  'ireland': 'IE', 'switzerland': 'CH', 'belgium': 'BE', 'austria': 'AT', 'poland': 'PL',
  'portugal': 'PT', 'luxembourg': 'LU', 'czechia': 'CZ', 'czech republic': 'CZ', 'estonia': 'EE',
  'lithuania': 'LT', 'latvia': 'LV', 'romania': 'RO', 'hungary': 'HU', 'greece': 'GR',
  'australia': 'AU', 'new zealand': 'NZ', 'singapore': 'SG', 'india': 'IN', 'japan': 'JP',
  'china': 'CN', 'hong kong': 'HK', 'south korea': 'KR', 'malaysia': 'MY', 'thailand': 'TH',
  'philippines': 'PH', 'indonesia': 'ID', 'vietnam': 'VN',
}

// Only the regions that map to a single country can be used as a fallback
const REGION_COUNTRY: Record<string, string> = { UK: 'GB', US: 'US', Canada: 'CA' }

export interface ParsedLocation {
  locality: string
  region?: string
  country?: string
}

// Locations are free text, typically "City, State/Country". Infer what we can;
// leave a field out rather than guess.
export function parseLocation(location: string, region: string): ParsedLocation {
  const parts = location.split(',').map(p => p.trim()).filter(Boolean)
  const locality = parts[0] || location.trim()
  const last = parts.length > 1 ? parts[parts.length - 1] : ''

  if (last) {
    const upper = last.toUpperCase()
    if (US_STATES.has(upper)) return { locality, region: upper, country: 'US' }
    if (CA_PROVINCES.has(upper)) return { locality, region: upper, country: 'CA' }
    const country = COUNTRIES[last.toLowerCase()]
    if (country) return { locality, country }
  }
  return { locality, country: REGION_COUNTRY[region] }
}

function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ) as Partial<T>
}

export function buildJobPostingJsonLd(job: Job, baseUrl: string) {
  const loc = parseLocation(job.location, job.region)
  const isRemote = job.locationType === 'Remote'
  const posted = parseDate(job.approvedAt) ?? parseDate(job.createdAt)

  const jobLocation = loc.country
    ? {
        '@type': 'Place',
        address: compact({
          '@type': 'PostalAddress',
          addressLocality: loc.locality,
          addressRegion: loc.region,
          addressCountry: loc.country,
        }),
      }
    : undefined

  const applicantLocationRequirements = isRemote
    ? loc.country
      ? { '@type': 'Country', name: loc.country }
      : { '@type': 'AdministrativeArea', name: job.region }
    : undefined

  const baseSalary =
    job.salaryMin || job.salaryMax
      ? {
          '@type': 'MonetaryAmount',
          currency: job.salaryCurrency || 'EUR',
          value: compact({
            '@type': 'QuantitativeValue',
            minValue: job.salaryMin ?? undefined,
            maxValue: job.salaryMax ?? undefined,
            unitText: 'YEAR',
          }),
        }
      : undefined

  return compact({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: renderDescription(job.description),
    identifier: { '@type': 'PropertyValue', name: job.companyName, value: job.slug },
    datePosted: posted?.toISOString(),
    validThrough: job.expiresAt ?? undefined,
    employmentType: 'FULL_TIME',
    hiringOrganization: compact({
      '@type': 'Organization',
      name: job.companyName,
      sameAs: job.companyWebsite ?? undefined,
    }),
    jobLocation,
    jobLocationType: isRemote ? 'TELECOMMUTE' : undefined,
    applicantLocationRequirements,
    baseSalary,
    industry: job.industry ?? undefined,
    // Candidates apply on the employer's own site, not on PricedIn
    directApply: false,
    url: `${baseUrl}/jobs/${job.slug}`,
  })
}
