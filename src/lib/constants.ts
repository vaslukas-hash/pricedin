export const CATEGORIES = [
  'Pricing',
  'Monetization',
  'Revenue Strategy',
  'Commercial Strategy',
] as const

export const SENIORITY_LEVELS = [
  'Analyst',
  'Manager',
  'Senior',
  'Lead',
  'Head/Director',
  'VP',
] as const

export const REGIONS = [
  'Europe',
  'UK',
  'US',
  'Canada',
  'APAC',
] as const

export const LOCATION_TYPES = [
  'Remote',
  'Hybrid',
  'Onsite',
] as const

export const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
] as const

export const INDUSTRIES = [
  'Technology',
  'Fintech',
  'E-commerce',
  'SaaS',
  'Healthcare',
  'Entertainment',
  'Travel',
  'Delivery',
  'Retail',
  'Automotive',
  'Energy',
  'Consulting',
  'Other',
] as const

export const SALARY_RANGES = [
  { min: 0, max: 50000, label: 'Up to €50k' },
  { min: 50000, max: 80000, label: '€50k - €80k' },
  { min: 80000, max: 120000, label: '€80k - €120k' },
  { min: 120000, max: 180000, label: '€120k - €180k' },
  { min: 180000, max: 250000, label: '€180k - €250k' },
  { min: 250000, max: 1000000, label: '€250k+' },
] as const

export const POSTING_AGE_OPTIONS = [
  { days: 7, label: 'Last 7 days' },
  { days: 30, label: 'Last 30 days' },
] as const

export type Category = typeof CATEGORIES[number]
export type Seniority = typeof SENIORITY_LEVELS[number]
export type Region = typeof REGIONS[number]
export type LocationType = typeof LOCATION_TYPES[number]
export type Currency = typeof CURRENCIES[number]
export type Industry = typeof INDUSTRIES[number]
