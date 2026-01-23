import { z } from 'zod'
import { CATEGORIES, SENIORITY_LEVELS, REGIONS, LOCATION_TYPES, CURRENCIES } from './constants'

export const jobFormSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  companyWebsite: z.string().url('Invalid URL').optional().or(z.literal('')),
  companyLogoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(100, 'Description must be at least 100 characters').max(10000),
  category: z.enum(CATEGORIES),
  seniority: z.enum(SENIORITY_LEVELS),
  industry: z.string().min(2).max(50).optional().or(z.literal('')),
  location: z.string().min(2, 'Location is required').max(100),
  locationType: z.enum(LOCATION_TYPES),
  region: z.enum(REGIONS),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  salaryCurrency: z.enum(CURRENCIES.map(c => c.code) as [string, ...string[]]).default('EUR'),
  applyUrl: z.string().url('Invalid apply URL'),
  contactEmail: z.string().email('Invalid email'),
}).refine(data => {
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMin <= data.salaryMax
  }
  return true
}, {
  message: 'Minimum salary cannot be greater than maximum',
  path: ['salaryMin'],
})

export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export type JobFormData = z.infer<typeof jobFormSchema>
export type NewsletterFormData = z.infer<typeof newsletterSchema>
