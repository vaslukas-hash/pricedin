import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'

const dbPath = path.join(process.cwd(), 'pricedin.db')
const sqlite = new Database(dbPath)
const db = drizzle(sqlite, { schema })

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    company_name TEXT NOT NULL,
    company_website TEXT,
    company_logo_url TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    seniority TEXT NOT NULL,
    industry TEXT,
    location TEXT NOT NULL,
    location_type TEXT NOT NULL,
    region TEXT NOT NULL,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT DEFAULT 'EUR',
    apply_url TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    is_featured INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    approved_at TEXT,
    expires_at TEXT
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
  CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
  CREATE INDEX IF NOT EXISTS idx_jobs_region ON jobs(region);
  CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at);
`)

const now = new Date().toISOString()
const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

const seedJobs = [
  {
    slug: 'spotify-pricing-manager-stockholm-a1b2',
    status: 'approved',
    companyName: 'Spotify',
    companyWebsite: 'https://spotify.com',
    companyLogoUrl: 'https://logo.clearbit.com/spotify.com',
    title: 'Pricing Manager',
    description: `## About the Role

We're looking for a Pricing Manager to join our Global Pricing team in Stockholm. You'll be at the heart of Spotify's monetization strategy, working on pricing decisions that impact 600M+ users worldwide.

## What You'll Do

- Lead pricing strategy for Premium subscription tiers across multiple markets
- Conduct competitive analysis and market research to inform pricing decisions
- Build financial models to forecast revenue impact of pricing changes
- Partner with Product, Finance, and Regional teams on go-to-market strategies
- Design and analyze A/B tests for pricing experiments

## What We're Looking For

- 5+ years of experience in pricing, strategy consulting, or revenue management
- Strong analytical skills with proficiency in SQL and Excel/Sheets
- Experience with subscription business models
- Excellent communication skills and ability to influence stakeholders
- MBA or equivalent experience preferred

## Why Spotify

- Competitive salary and equity package
- Flexible work arrangements
- Learning and development budget
- Wellness stipend and comprehensive benefits`,
    category: 'Pricing',
    seniority: 'Manager',
    industry: 'Technology',
    location: 'Stockholm, Sweden',
    locationType: 'Hybrid',
    region: 'Europe',
    salaryMin: 85000,
    salaryMax: 120000,
    salaryCurrency: 'EUR',
    applyUrl: 'https://jobs.spotify.com/pricing-manager',
    contactEmail: 'talent@spotify.com',
    isFeatured: true,
    views: 342,
    clicks: 48,
    createdAt: now,
    approvedAt: now,
    expiresAt,
  },
  {
    slug: 'stripe-monetization-lead-sf-c3d4',
    status: 'approved',
    companyName: 'Stripe',
    companyWebsite: 'https://stripe.com',
    companyLogoUrl: 'https://logo.clearbit.com/stripe.com',
    title: 'Monetization Lead',
    description: `## The Opportunity

Stripe is building the economic infrastructure for the internet. As our Monetization Lead, you'll shape how we price and package our products to maximize value for millions of businesses.

## Responsibilities

- Define monetization strategy for Stripe's product portfolio
- Partner with Product teams to design pricing for new launches
- Develop packaging and bundling strategies across customer segments
- Build pricing analytics infrastructure and dashboards
- Lead cross-functional pricing reviews with executive leadership

## Requirements

- 7+ years in pricing, monetization, or product strategy roles
- Experience in B2B SaaS or payments industry strongly preferred
- Deep understanding of value-based pricing methodologies
- Proven track record of driving revenue growth through pricing
- Strong analytical toolkit (SQL, Python, or similar)

## Benefits

- Competitive compensation with equity
- Remote-first culture with office hubs
- $5,000 annual learning stipend
- Comprehensive health coverage
- Generous parental leave`,
    category: 'Monetization',
    seniority: 'Lead',
    industry: 'Fintech',
    location: 'San Francisco, CA',
    locationType: 'Remote',
    region: 'US',
    salaryMin: 180000,
    salaryMax: 250000,
    salaryCurrency: 'USD',
    applyUrl: 'https://stripe.com/jobs/monetization-lead',
    contactEmail: 'recruiting@stripe.com',
    isFeatured: true,
    views: 528,
    clicks: 76,
    createdAt: now,
    approvedAt: now,
    expiresAt,
  },
  {
    slug: 'netflix-revenue-strategy-director-la-e5f6',
    status: 'approved',
    companyName: 'Netflix',
    companyWebsite: 'https://netflix.com',
    companyLogoUrl: 'https://logo.clearbit.com/netflix.com',
    title: 'Director, Revenue Strategy',
    description: `## About Netflix

Netflix is the world's leading streaming entertainment service with 260M+ paid memberships. We're looking for a Director of Revenue Strategy to help shape the future of our business.

## The Role

You'll lead strategic initiatives that drive Netflix's revenue growth across subscriptions, advertising, and new business models. This is a high-visibility role working directly with senior leadership.

## What You'll Do

- Develop multi-year revenue strategies across business lines
- Lead analysis of market opportunities and competitive dynamics
- Build business cases for strategic initiatives and new markets
- Partner with Finance on forecasting and planning
- Present recommendations to C-suite executives

## Qualifications

- 10+ years in strategy, consulting, or corporate development
- Experience in media, entertainment, or subscription businesses
- Exceptional analytical and financial modeling skills
- Strong executive presence and communication abilities
- Track record of driving strategic decisions

## Our Culture

We believe in freedom and responsibility. You'll have the autonomy to make impactful decisions while being accountable for results.`,
    category: 'Revenue Strategy',
    seniority: 'Head/Director',
    industry: 'Entertainment',
    location: 'Los Angeles, CA',
    locationType: 'Onsite',
    region: 'US',
    salaryMin: 250000,
    salaryMax: 350000,
    salaryCurrency: 'USD',
    applyUrl: 'https://jobs.netflix.com/revenue-strategy',
    contactEmail: 'careers@netflix.com',
    isFeatured: true,
    views: 412,
    clicks: 52,
    createdAt: now,
    approvedAt: now,
    expiresAt,
  },
  {
    slug: 'wise-commercial-strategy-analyst-london-g7h8',
    status: 'approved',
    companyName: 'Wise',
    companyWebsite: 'https://wise.com',
    companyLogoUrl: 'https://logo.clearbit.com/wise.com',
    title: 'Commercial Strategy Analyst',
    description: `## Our Mission

Money without borders. We're building the best way to move and manage money around the world.

## The Role

Join our Commercial Strategy team to help Wise grow sustainably while keeping our mission-first approach. You'll work on critical business decisions across pricing, partnerships, and market expansion.

## Day to Day

- Analyze market trends and competitive dynamics
- Build models to evaluate commercial opportunities
- Support pricing decisions for new corridors and products
- Prepare materials for leadership reviews
- Collaborate with Product and Regional teams

## About You

- 2-4 years in consulting, investment banking, or strategy roles
- Strong quantitative skills and attention to detail
- Proficiency in SQL and data visualization tools
- Excellent written and verbal communication
- Passion for our mission and financial inclusion

## Perks

- Stock options in a growing company
- Remote-friendly with London hub
- £1,000 annual learning budget
- Sabbatical after 4 years
- RSUs that actually vest`,
    category: 'Commercial Strategy',
    seniority: 'Analyst',
    industry: 'Fintech',
    location: 'London, UK',
    locationType: 'Hybrid',
    region: 'UK',
    salaryMin: 55000,
    salaryMax: 75000,
    salaryCurrency: 'GBP',
    applyUrl: 'https://wise.com/careers/commercial-strategy',
    contactEmail: 'talent@wise.com',
    isFeatured: false,
    views: 186,
    clicks: 24,
    createdAt: now,
    approvedAt: now,
    expiresAt,
  },
  {
    slug: 'shopify-pricing-operations-manager-toronto-i9j0',
    status: 'approved',
    companyName: 'Shopify',
    companyWebsite: 'https://shopify.com',
    companyLogoUrl: 'https://logo.clearbit.com/shopify.com',
    title: 'Pricing Operations Manager',
    description: `## About Shopify

Shopify powers millions of businesses worldwide. We're looking for a Pricing Operations Manager to ensure flawless execution of our pricing strategy.

## What You'll Own

- Manage end-to-end pricing operations across all products
- Coordinate pricing changes with Engineering and Product teams
- Maintain pricing databases and documentation
- Handle escalations and edge cases from Support teams
- Drive process improvements and automation

## Requirements

- 4-6 years in pricing operations, revenue operations, or similar
- Strong project management and cross-functional collaboration skills
- Experience with Salesforce, billing systems, or pricing tools
- Detail-oriented with excellent organizational skills
- Comfortable with ambiguity in a fast-paced environment

## What We Offer

- Competitive salary and equity
- Digital by default (work from anywhere)
- Flexible vacation policy
- $5,000 annual lifestyle spending account
- Home office setup budget`,
    category: 'Pricing',
    seniority: 'Manager',
    industry: 'E-commerce',
    location: 'Toronto, Canada',
    locationType: 'Remote',
    region: 'Canada',
    salaryMin: 100000,
    salaryMax: 140000,
    salaryCurrency: 'CAD',
    applyUrl: 'https://shopify.com/careers/pricing-ops',
    contactEmail: 'hiring@shopify.com',
    isFeatured: false,
    views: 203,
    clicks: 31,
    createdAt: now,
    approvedAt: now,
    expiresAt,
  },
  {
    slug: 'klarna-vp-pricing-stockholm-k1l2',
    status: 'approved',
    companyName: 'Klarna',
    companyWebsite: 'https://klarna.com',
    companyLogoUrl: 'https://logo.clearbit.com/klarna.com',
    title: 'VP of Pricing',
    description: `## Shape the Future of Shopping

Klarna is the leading global payments network. We're seeking a VP of Pricing to lead our global pricing function and drive profitable growth.

## Your Mission

Lead a team of pricing professionals to optimize Klarna's pricing across merchants, consumers, and financial products. Report directly to the CFO.

## Responsibilities

- Set global pricing strategy across all business lines
- Build and lead a high-performing pricing team
- Drive pricing governance and approval processes
- Partner with Product on value-based pricing for new features
- Represent pricing in executive and board discussions

## Your Profile

- 12+ years in pricing leadership, consulting, or strategic finance
- Experience in payments, fintech, or financial services
- Track record of building pricing teams and capabilities
- Strong executive presence and stakeholder management
- Data-driven decision maker with business acumen

## Why Klarna

- Shape the future of commerce
- Lead a critical business function
- Competitive package with significant equity
- Work with talented teams across the globe`,
    category: 'Pricing',
    seniority: 'VP',
    industry: 'Fintech',
    location: 'Stockholm, Sweden',
    locationType: 'Hybrid',
    region: 'Europe',
    salaryMin: 200000,
    salaryMax: 280000,
    salaryCurrency: 'EUR',
    applyUrl: 'https://klarna.com/careers/vp-pricing',
    contactEmail: 'executive-search@klarna.com',
    isFeatured: true,
    views: 298,
    clicks: 38,
    createdAt: now,
    approvedAt: now,
    expiresAt,
  },
  {
    slug: 'revolut-senior-pricing-analyst-london-m3n4',
    status: 'approved',
    companyName: 'Revolut',
    companyWebsite: 'https://revolut.com',
    companyLogoUrl: 'https://logo.clearbit.com/revolut.com',
    title: 'Senior Pricing Analyst',
    description: `## Get Ready to Revolutionize Finance

Revolut is building the world's first truly global financial super app. Join our Pricing team to help us monetize at scale.

## What You'll Do

- Analyze pricing performance and recommend optimizations
- Build dashboards to monitor KPIs and competitive positioning
- Support A/B testing and experimentation for pricing
- Create financial models for new product pricing
- Present insights to leadership and stakeholders

## What You Bring

- 3-5 years in pricing analytics, consulting, or product analytics
- Expert-level SQL and data analysis skills
- Experience with BI tools (Looker, Tableau, or similar)
- Strong communication and presentation skills
- Ability to simplify complex analysis for non-technical audiences

## Revolut Perks

- Competitive compensation package
- Stock options with real upside
- Flexible remote work
- Learning budget and career growth
- Team events and socials`,
    category: 'Pricing',
    seniority: 'Senior',
    industry: 'Fintech',
    location: 'London, UK',
    locationType: 'Hybrid',
    region: 'UK',
    salaryMin: 70000,
    salaryMax: 95000,
    salaryCurrency: 'GBP',
    applyUrl: 'https://revolut.com/careers/pricing-analyst',
    contactEmail: 'careers@revolut.com',
    isFeatured: false,
    views: 267,
    clicks: 42,
    createdAt: now,
    approvedAt: now,
    expiresAt,
  },
  {
    slug: 'booking-head-revenue-strategy-amsterdam-o5p6',
    status: 'approved',
    companyName: 'Booking.com',
    companyWebsite: 'https://booking.com',
    companyLogoUrl: 'https://logo.clearbit.com/booking.com',
    title: 'Head of Revenue Strategy',
    description: `## Connect People with Incredible Experiences

Booking.com helps millions of people experience the world. We're looking for a Head of Revenue Strategy to drive our next phase of growth.

## The Opportunity

Lead revenue strategy across our accommodation, flights, and experiences verticals. You'll shape how we capture value while delivering for customers and partners.

## Key Responsibilities

- Define revenue strategy across business verticals
- Lead pricing and commission optimization initiatives
- Partner with Product on monetization roadmap
- Build business cases for strategic investments
- Mentor and develop the revenue strategy team

## What We're Looking For

- 10+ years in strategy, pricing, or revenue leadership
- Travel, marketplace, or e-commerce experience preferred
- Strong analytical foundation with strategic thinking
- Experience leading and developing teams
- Executive communication and influence skills

## Our Offer

- Competitive base + bonus + equity
- Amsterdam-based with flexibility
- Annual travel credit
- Professional development programs
- Diverse, international team environment`,
    category: 'Revenue Strategy',
    seniority: 'Head/Director',
    industry: 'Travel',
    location: 'Amsterdam, Netherlands',
    locationType: 'Hybrid',
    region: 'Europe',
    salaryMin: 150000,
    salaryMax: 200000,
    salaryCurrency: 'EUR',
    applyUrl: 'https://careers.booking.com/revenue-strategy',
    contactEmail: 'talent@booking.com',
    isFeatured: false,
    views: 189,
    clicks: 28,
    createdAt: now,
    approvedAt: now,
    expiresAt,
  },
  {
    slug: 'deliveryhero-monetization-manager-berlin-q7r8',
    status: 'approved',
    companyName: 'Delivery Hero',
    companyWebsite: 'https://deliveryhero.com',
    companyLogoUrl: 'https://logo.clearbit.com/deliveryhero.com',
    title: 'Monetization Manager',
    description: `## Delivering Amazing Experiences

Delivery Hero operates in 70+ countries, connecting millions of customers with the food they love. Join us as a Monetization Manager to optimize our revenue streams.

## Your Role

Own monetization strategy for one of our key markets or product verticals. You'll balance growth with profitability while ensuring great experiences.

## What You'll Do

- Design and implement monetization strategies
- Optimize commission structures and service fees
- Analyze unit economics and recommend improvements
- Partner with local teams on market-specific pricing
- Track KPIs and report to leadership

## Requirements

- 4-6 years in monetization, pricing, or product management
- Experience with marketplace or platform business models
- Strong SQL skills and data-driven mindset
- Excellent stakeholder management abilities
- Comfortable working across cultures and time zones

## Benefits

- Competitive salary + stock options
- Berlin HQ with remote flexibility
- Meal vouchers and delivery credits
- Learning and conference budget
- International team environment`,
    category: 'Monetization',
    seniority: 'Manager',
    industry: 'Delivery',
    location: 'Berlin, Germany',
    locationType: 'Hybrid',
    region: 'Europe',
    salaryMin: 75000,
    salaryMax: 100000,
    salaryCurrency: 'EUR',
    applyUrl: 'https://careers.deliveryhero.com/monetization',
    contactEmail: 'recruiting@deliveryhero.com',
    isFeatured: false,
    views: 145,
    clicks: 19,
    createdAt: now,
    approvedAt: now,
    expiresAt,
  },
  {
    slug: 'n26-commercial-strategy-lead-berlin-s9t0',
    status: 'approved',
    companyName: 'N26',
    companyWebsite: 'https://n26.com',
    companyLogoUrl: 'https://logo.clearbit.com/n26.com',
    title: 'Commercial Strategy Lead',
    description: `## Banking, Redesigned

N26 is building the bank the world loves to use. We're looking for a Commercial Strategy Lead to drive key growth initiatives.

## About the Role

Lead strategic initiatives that shape N26's commercial success across European markets. Work closely with C-level executives on high-impact projects.

## Responsibilities

- Drive strategic planning and commercial initiatives
- Lead cross-functional projects from analysis to execution
- Develop business cases for new markets and products
- Partner with Finance on commercial planning
- Support M&A and partnership evaluations

## Your Background

- 6-8 years in strategy consulting, corporate strategy, or similar
- Experience in financial services or fintech preferred
- Strong analytical and problem-solving skills
- Excellent project management and stakeholder skills
- Fluent English; German is a plus

## What We Offer

- Make banking history
- Competitive package with equity
- Hybrid work model
- Personal development budget
- Mental health support`,
    category: 'Commercial Strategy',
    seniority: 'Lead',
    industry: 'Fintech',
    location: 'Berlin, Germany',
    locationType: 'Hybrid',
    region: 'Europe',
    salaryMin: 90000,
    salaryMax: 130000,
    salaryCurrency: 'EUR',
    applyUrl: 'https://n26.com/careers/commercial-strategy',
    contactEmail: 'talent@n26.com',
    isFeatured: false,
    views: 176,
    clicks: 23,
    createdAt: now,
    approvedAt: now,
    expiresAt,
  },
]

// Insert seed data
console.log('🌱 Seeding database...')

for (const job of seedJobs) {
  db.insert(schema.jobs).values({
    slug: job.slug,
    status: job.status as 'pending' | 'approved' | 'rejected' | 'expired',
    companyName: job.companyName,
    companyWebsite: job.companyWebsite,
    companyLogoUrl: job.companyLogoUrl,
    title: job.title,
    description: job.description,
    category: job.category as 'Pricing' | 'Monetization' | 'Revenue Strategy' | 'Commercial Strategy',
    seniority: job.seniority as 'Analyst' | 'Manager' | 'Senior' | 'Lead' | 'Head/Director' | 'VP',
    industry: job.industry,
    location: job.location,
    locationType: job.locationType as 'Remote' | 'Hybrid' | 'Onsite',
    region: job.region as 'Europe' | 'UK' | 'US' | 'Canada' | 'APAC',
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    applyUrl: job.applyUrl,
    contactEmail: job.contactEmail,
    isFeatured: job.isFeatured,
    views: job.views,
    clicks: job.clicks,
    createdAt: job.createdAt,
    approvedAt: job.approvedAt,
    expiresAt: job.expiresAt,
  }).run()
}

console.log(`✅ Seeded ${seedJobs.length} jobs`)
console.log('🎉 Database ready!')
