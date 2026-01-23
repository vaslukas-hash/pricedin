import { Suspense } from 'react'
import { Metadata } from 'next'
import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'
import { eq, desc, and, like, or, gte, lte } from 'drizzle-orm'
import { Header, Footer, JobCard, JobFilters, NewsletterSignup } from '@/components'

export const metadata: Metadata = {
  title: 'Browse Jobs',
  description: 'Find pricing, monetization, revenue strategy, and commercial strategy jobs at top companies.',
}

export const revalidate = 60

interface SearchParams {
  q?: string
  category?: string
  seniority?: string
  locationType?: string
  region?: string
  industry?: string
  salary?: string
  posted?: string
  page?: string
}

async function getJobs(params: SearchParams) {
  const { q, category, seniority, locationType, region, industry, salary, posted, page = '1' } = params
  
  const pageNum = parseInt(page) || 1
  const perPage = 20
  const offset = (pageNum - 1) * perPage
  
  // Get all approved jobs first, then filter in JS for complex conditions
  let allJobs = await db.select()
    .from(jobs)
    .where(eq(jobs.status, 'approved'))
    .orderBy(desc(jobs.isFeatured), desc(jobs.createdAt))
  
  // Apply filters
  if (q) {
    const query = q.toLowerCase()
    allJobs = allJobs.filter(j => 
      j.title.toLowerCase().includes(query) ||
      j.companyName.toLowerCase().includes(query) ||
      j.description.toLowerCase().includes(query)
    )
  }
  
  if (category) {
    allJobs = allJobs.filter(j => j.category === category)
  }
  
  if (seniority) {
    allJobs = allJobs.filter(j => j.seniority === seniority)
  }
  
  if (locationType) {
    allJobs = allJobs.filter(j => j.locationType === locationType)
  }
  
  if (region) {
    allJobs = allJobs.filter(j => j.region === region)
  }
  
  if (industry) {
    allJobs = allJobs.filter(j => j.industry === industry)
  }
  
  if (salary) {
    const [min, max] = salary.split('-').map(Number)
    allJobs = allJobs.filter(j => {
      if (min && j.salaryMax && j.salaryMax < min) return false
      if (max && j.salaryMin && j.salaryMin > max) return false
      return true
    })
  }
  
  if (posted) {
    const days = parseInt(posted)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    allJobs = allJobs.filter(j => {
      if (!j.createdAt) return false
      return new Date(j.createdAt) >= cutoff
    })
  }
  
  const total = allJobs.length
  const totalPages = Math.ceil(total / perPage)
  const paginatedJobs = allJobs.slice(offset, offset + perPage)
  
  return { jobs: paginatedJobs, total, totalPages, currentPage: pageNum }
}

export default async function JobsPage({ 
  searchParams 
}: { 
  searchParams: Promise<SearchParams> 
}) {
  const params = await searchParams
  const { jobs: jobsList, total, totalPages, currentPage } = await getJobs(params)
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-brand-900">Browse Jobs</h1>
            <p className="text-brand-600 mt-2">
              {total} {total === 1 ? 'position' : 'positions'} available
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="card p-5 sticky top-24">
                <h2 className="font-semibold text-brand-900 mb-4">Filters</h2>
                <Suspense fallback={<div>Loading filters...</div>}>
                  <JobFilters />
                </Suspense>
              </div>
            </aside>
            
            {/* Job List */}
            <div className="flex-1 min-w-0">
              {jobsList.length === 0 ? (
                <div className="card p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-brand-900 mb-2">No jobs found</h3>
                  <p className="text-brand-600 text-sm">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {jobsList.map((job, i) => (
                      <div 
                        key={job.id} 
                        className="animate-slide-in-up"
                        style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
                      >
                        <JobCard job={job} featured={job.isFeatured || false} />
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      {currentPage > 1 && (
                        <a
                          href={`/jobs?${new URLSearchParams({ ...params, page: String(currentPage - 1) }).toString()}`}
                          className="btn-outline btn-sm"
                        >
                          Previous
                        </a>
                      )}
                      
                      <span className="flex items-center px-4 text-sm text-brand-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      {currentPage < totalPages && (
                        <a
                          href={`/jobs?${new URLSearchParams({ ...params, page: String(currentPage + 1) }).toString()}`}
                          className="btn-outline btn-sm"
                        >
                          Next
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
              
              {/* Newsletter */}
              <div className="mt-12">
                <NewsletterSignup />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
