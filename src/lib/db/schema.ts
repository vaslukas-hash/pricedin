import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const jobs = sqliteTable('jobs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  status: text('status', { enum: ['pending', 'approved', 'rejected', 'expired'] }).default('pending').notNull(),
  
  // Company info
  companyName: text('company_name').notNull(),
  companyWebsite: text('company_website'),
  companyLogoUrl: text('company_logo_url'),
  
  // Job details
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category', { 
    enum: ['Pricing', 'Monetization', 'Revenue Strategy', 'Commercial Strategy'] 
  }).notNull(),
  seniority: text('seniority', { 
    enum: ['Analyst', 'Manager', 'Senior', 'Lead', 'Head/Director', 'VP'] 
  }).notNull(),
  industry: text('industry'),
  
  // Location
  location: text('location').notNull(),
  locationType: text('location_type', { 
    enum: ['Remote', 'Hybrid', 'Onsite'] 
  }).notNull(),
  region: text('region', { 
    enum: ['Europe', 'UK', 'US', 'Canada', 'APAC'] 
  }).notNull(),
  
  // Compensation
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  salaryCurrency: text('salary_currency').default('EUR'),
  
  // Application
  applyUrl: text('apply_url').notNull(),
  contactEmail: text('contact_email').notNull(),
  
  // Metadata
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
  views: integer('views').default(0),
  clicks: integer('clicks').default(0),
  
  // Timestamps
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  approvedAt: text('approved_at'),
  expiresAt: text('expires_at'),
})

export const subscribers = sqliteTable('subscribers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
})

// Type exports
export type Job = typeof jobs.$inferSelect
export type NewJob = typeof jobs.$inferInsert
export type Subscriber = typeof subscribers.$inferSelect
export type NewSubscriber = typeof subscribers.$inferInsert
