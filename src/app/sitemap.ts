export const dynamic = 'force-dynamic'

import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { jobs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  // Get all approved jobs
  const approvedJobs = await db.select({ slug: jobs.slug, createdAt: jobs.createdAt })
    .from(jobs)
    .where(eq(jobs.status, 'approved'))
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/post-job`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]
  
  // Job pages
  const jobPages = approvedJobs.map(job => ({
    url: `${baseUrl}/jobs/${job.slug}`,
    lastModified: job.createdAt ? new Date(job.createdAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  
  return [...staticPages, ...jobPages]
}
