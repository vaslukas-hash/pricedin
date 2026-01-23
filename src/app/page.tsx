import Link from 'next/link'
import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'
import { eq, desc, and, gt } from 'drizzle-orm'
import { Header, Footer, JobCard, NewsletterSignup } from '@/components'
import { CATEGORIES } from '@/lib/constants'

export const revalidate = 60 // Revalidate every 60 seconds

async function getFeaturedJobs() {
  return db.select()
    .from(jobs)
    .where(and(
      eq(jobs.status, 'approved'),
      eq(jobs.isFeatured, true)
    ))
    .orderBy(desc(jobs.createdAt))
    .limit(4)
}

async function getRecentJobs() {
  return db.select()
    .from(jobs)
    .where(eq(jobs.status, 'approved'))
    .orderBy(desc(jobs.createdAt))
    .limit(6)
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
  const [featuredJobs, recentJobs, counts] = await Promise.all([
    getFeaturedJobs(),
    getRecentJobs(),
    getJobCounts(),
  ])
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-brand-900 via-brand-900 to-brand-800 text-white py-16 sm:py-24">
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
            
            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {CATEGORIES.map(cat => (
                <div key={cat} className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{counts.byCategory[cat]}</p>
                  <p className="text-brand-300 text-sm mt-1">{cat}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Featured Jobs */}
        {featuredJobs.length > 0 && (
          <section className="py-12 sm:py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-brand-900">Featured Jobs</h2>
                <Link href="/jobs?featured=true" className="text-brand-600 hover:text-brand-800 text-sm font-medium">
                  View all →
                </Link>
              </div>
              <div className="grid gap-4">
                {featuredJobs.map((job, i) => (
                  <div key={job.id} className="animate-slide-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <JobCard job={job} featured />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* Recent Jobs */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-brand-900">Latest Opportunities</h2>
              <Link href="/jobs" className="text-brand-600 hover:text-brand-800 text-sm font-medium">
                View all →
              </Link>
            </div>
            <div className="grid gap-4">
              {recentJobs.map((job, i) => (
                <div key={job.id} className="animate-slide-in-up" style={{ animationDelay: `${i * 75}ms` }}>
                  <JobCard job={job} />
                </div>
              ))}
            </div>
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
              {CATEGORIES.map(cat => (
                <Link 
                  key={cat}
                  href={`/jobs?category=${encodeURIComponent(cat)}`}
                  className="card-hover p-6 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center mb-4 group-hover:bg-brand-200 transition-colors">
                    <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-brand-900 group-hover:text-brand-700 transition-colors">
                    {cat}
                  </h3>
                  <p className="text-brand-500 text-sm mt-1">
                    {counts.byCategory[cat]} open positions
                  </p>
                </Link>
              ))}
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
