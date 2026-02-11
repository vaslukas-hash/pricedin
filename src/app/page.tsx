import Link from 'next/link'
import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'
import { eq, desc, and, gt } from 'drizzle-orm'
import { Header, Footer, JobsListWithModal, NewsletterSignup } from '@/components'
import { CATEGORIES } from '@/lib/constants'

export const revalidate = 60 // Revalidate every 60 seconds

async function getAllJobs() {
  return db.select()
    .from(jobs)
    .where(eq(jobs.status, 'approved'))
    .orderBy(desc(jobs.createdAt))
    .limit(10)
}

async function getJobCounts() {
  const allJobs = await db.select()
    .from(jobs)
    .where(eq(jobs.status, 'approved'))
  
  return {
    total: allJobs.length,
    byCategory: CATEGORIES.reduce((acc, cat) => {
      acc[cat] = allJobs.filter(j => j.category === cat).length
      return acc
    }, {} as Record<string, number>)
  }
}

export default async function HomePage() {
  const [allJobs, counts] = await Promise.all([
    getAllJobs(),
    getJobCounts(),
  ])
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-brand-900 via-brand-900 to-brand-800 text-white py-10 sm:py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Where pricing careers
                <span className="text-accent-400"> take off</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-brand-200 leading-relaxed">
                The niche job board for pricing, monetization, revenue strategy, and commercial strategy professionals. Find your next role at industry-leading companies.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/jobs" className="btn-accent btn-lg">
                  Browse {counts.total} Jobs
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="/post-job" className="btn bg-white/10 hover:bg-white/20 text-white btn-lg">
                  Post a Job
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* All Jobs */}
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-brand-900">Latest Opportunities</h2>
              <Link href="/jobs" className="text-brand-600 hover:text-brand-800 text-sm font-medium">
                View all →
              </Link>
            </div>
            <JobsListWithModal jobs={allJobs} />
            <div className="mt-8 text-center">
              <Link href="/jobs" className="btn-primary btn-lg">
                Browse All Jobs
              </Link>
            </div>
          </div>
        </section>
        
        {/* Categories */}
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-brand-900 mb-6">Browse by Category</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CATEGORIES.map(cat => {
                // Category-specific icons
                const getIcon = () => {
                  switch(cat) {
                    case 'Pricing':
                      return (
                        <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      )
                    case 'Monetization':
                      return (
                        <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )
                    case 'Revenue Strategy':
                      return (
                        <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      )
                    case 'Commercial Strategy':
                      return (
                        <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )
                    default:
                      return null
                  }
                }

                return (
                  <Link
                    key={cat}
                    href={`/jobs?category=${encodeURIComponent(cat)}`}
                    className="card-hover p-6 group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center mb-4 group-hover:bg-brand-200 transition-colors">
                      {getIcon()}
                    </div>
                    <h3 className="font-semibold text-brand-900 group-hover:text-brand-700 transition-colors">
                      {cat}
                    </h3>
                    <p className="text-brand-500 text-sm mt-1">
                      {counts.byCategory[cat]} open positions
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
        
        {/* Newsletter */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <NewsletterSignup />
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-br from-brand-800 to-brand-900 rounded-2xl p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Hiring for pricing or revenue roles?
              </h2>
              <p className="text-brand-200 mb-8 max-w-xl mx-auto">
                Reach thousands of specialized pricing and revenue strategy professionals. Post your job for free during our beta period.
              </p>
              <Link href="/post-job" className="btn-accent btn-lg">
                Post a Job — Free
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
