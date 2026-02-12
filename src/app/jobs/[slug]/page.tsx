import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'
import { eq, and, ne, desc } from 'drizzle-orm'
import { Header, Footer, JobCard, NewsletterSignup } from '@/components'
import { formatSalary, formatDate, timeAgo, sanitizeHtml } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface JobPageProps {
  params: Promise<{ slug: string }>
}

async function getJob(slug: string) {
  const result = await db.select()
    .from(jobs)
    .where(and(eq(jobs.slug, slug), eq(jobs.status, 'approved')))
    .limit(1)
  
  return result[0] || null
}

async function getSimilarJobs(job: NonNullable<Awaited<ReturnType<typeof getJob>>>) {
  const similar = await db.select()
    .from(jobs)
    .where(and(
      eq(jobs.status, 'approved'),
      eq(jobs.category, job.category),
      ne(jobs.id, job.id)
    ))
    .orderBy(desc(jobs.createdAt))
    .limit(3)
  
  return similar
}

async function incrementViews(jobId: number) {
  // Track view (fire and forget)
  fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/analytics/view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId }),
  }).catch(() => {})
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params
  const job = await getJob(slug)
  
  if (!job) {
    return { title: 'Job Not Found' }
  }
  
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency || 'EUR')
  
  return {
    title: `${job.title} at ${job.companyName}`,
    description: `${job.title} at ${job.companyName} — ${job.locationType} ${job.category.toLowerCase()} job in ${job.location}. ${salary !== 'Competitive' ? 'Salary: ' + salary + '.' : ''} Apply now on PricedIn.`,
    openGraph: {
      title: `${job.title} at ${job.companyName}`,
      description: `${job.locationType} · ${job.location} · ${job.category}`,
      type: 'article',
      url: `/jobs/${job.slug}`,
    },
    alternates: {
      canonical: `/jobs/${job.slug}`,
    },
  }
}

function JobPostingJsonLd({ job }: { job: NonNullable<Awaited<ReturnType<typeof getJob>>> }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    identifier: {
      '@type': 'PropertyValue',
      name: job.companyName,
      value: job.slug,
    },
    datePosted: job.createdAt,
    validThrough: job.expiresAt,
    employmentType: job.locationType === 'Remote' ? 'FULL_TIME' : 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.companyName,
      sameAs: job.companyWebsite,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressRegion: job.region,
      },
    },
    jobLocationType: job.locationType === 'Remote' ? 'TELECOMMUTE' : undefined,
    baseSalary: job.salaryMin || job.salaryMax ? {
      '@type': 'MonetaryAmount',
      currency: job.salaryCurrency || 'EUR',
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.salaryMin,
        maxValue: job.salaryMax,
        unitText: 'YEAR',
      },
    } : undefined,
    industry: job.industry,
    directApply: true,
    url: `${baseUrl}/jobs/${job.slug}`,
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

function ApplyButton({ job }: { job: NonNullable<Awaited<ReturnType<typeof getJob>>> }) {
  return (
    <a
      href={job.applyUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        fetch('/api/analytics/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: job.id }),
        }).catch(() => {})
      }}
      className="btn-accent btn-lg w-full sm:w-auto"
    >
      Apply Now
      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}

// Simple markdown-like rendering
function renderDescription(description: string) {
  const sanitized = sanitizeHtml(description)
  
  // Convert markdown-style formatting to HTML
  const html = sanitized
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>')
  
  return html
}

export default async function JobPage({ params }: JobPageProps) {
  const { slug } = await params
  const job = await getJob(slug)
  
  if (!job) {
    notFound()
  }
  
  // Increment views (fire and forget on server)
  incrementViews(job.id)
  
  const similarJobs = await getSimilarJobs(job)
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency || 'EUR')
  
  return (
    <div className="min-h-screen flex flex-col">
      <JobPostingJsonLd job={job} />
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-brand-500">
              <li><Link href="/" className="hover:text-brand-700">Home</Link></li>
              <li>/</li>
              <li><Link href="/jobs" className="hover:text-brand-700">Jobs</Link></li>
              <li>/</li>
              <li className="text-brand-700 truncate">{job.title}</li>
            </ol>
          </nav>
          
          {/* Header */}
          <div className="card p-6 sm:p-8 mb-6">
            <div className="flex flex-col gap-6">
              {/* Info */}
              <div className="w-full">
                {job.isFeatured && (
                  <span className="featured-badge mb-3">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold text-brand-900 mb-2">
                  {job.title}
                </h1>
                <p className="text-lg text-brand-600 mb-4">
                  {job.companyWebsite ? (
                    <a 
                      href={job.companyWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-brand-800 hover:underline"
                    >
                      {job.companyName}
                    </a>
                  ) : (
                    job.companyName
                  )}
                </p>
                
                {/* Meta */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="badge-primary">{job.category}</span>
                  <span className="badge bg-brand-50 text-brand-600">{job.seniority}</span>
                  <span className="badge bg-brand-50 text-brand-600">{job.locationType}</span>
                  {job.industry && (
                    <span className="badge bg-brand-50 text-brand-600">{job.industry}</span>
                  )}
                </div>
                
                {/* Details */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-brand-600">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </span>
                  {salary !== 'Competitive' && (
                    <span className="flex items-center gap-1.5 font-medium text-brand-800">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {salary}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Posted {timeAgo(job.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* CTA */}
            <div className="mt-6 pt-6 border-t border-brand-100 flex flex-col sm:flex-row gap-4">
              <ApplyButton job={job} />
              <button
                onClick={() => navigator.share?.({ title: job.title, url: window.location.href })}
                className="btn-outline btn-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
          </div>
          
          {/* Description */}
          <div className="card p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-semibold text-brand-900 mb-4">About this role</h2>
            <div 
              className="prose-job"
              dangerouslySetInnerHTML={{ __html: renderDescription(job.description) }}
            />
          </div>
          
          {/* Apply CTA */}
          <div className="card p-6 sm:p-8 bg-gradient-to-r from-brand-50 to-brand-100/50 mb-8">
            <h3 className="text-lg font-semibold text-brand-900 mb-2">Interested in this role?</h3>
            <p className="text-brand-600 mb-4">
              Apply now on {job.companyName}&apos;s website. Great pricing roles fill fast.
            </p>
            <ApplyButton job={job} />
          </div>
          
          {/* Similar Jobs */}
          {similarJobs.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-brand-900 mb-4">Similar Jobs</h2>
              <div className="space-y-4">
                {similarJobs.map(j => (
                  <JobCard key={j.id} job={j} />
                ))}
              </div>
            </section>
          )}
          
          {/* Newsletter */}
          <div className="mt-12">
            <NewsletterSignup />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
