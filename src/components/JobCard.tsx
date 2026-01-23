import Link from 'next/link'
import Image from 'next/image'
import { Job } from '@/lib/db/schema'
import { formatSalary, timeAgo, cn } from '@/lib/utils'

interface JobCardProps {
  job: Job
  featured?: boolean
}

export function JobCard({ job, featured }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.slug}`}>
      <article 
        className={cn(
          "card-hover p-5 flex gap-4 group",
          featured && "ring-2 ring-accent-200 bg-gradient-to-r from-accent-50/50 to-transparent"
        )}
      >
        {/* Company Logo */}
        <div className="flex-shrink-0">
          {job.companyLogoUrl ? (
            <Image
              src={job.companyLogoUrl}
              alt={`${job.companyName} logo`}
              width={56}
              height={56}
              className="w-14 h-14 rounded-lg object-contain bg-white border border-brand-100"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-brand-100 flex items-center justify-center">
              <span className="text-brand-600 font-semibold text-lg">
                {job.companyName.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {featured && (
                <span className="featured-badge mb-2">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Featured
                </span>
              )}
              <h3 className="font-semibold text-brand-900 group-hover:text-brand-700 transition-colors truncate">
                {job.title}
              </h3>
              <p className="text-brand-600 text-sm mt-0.5">
                {job.companyName}
              </p>
            </div>
            <span className="text-xs text-brand-400 whitespace-nowrap">
              {timeAgo(job.createdAt)}
            </span>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="badge-primary">
              {job.category}
            </span>
            <span className="badge bg-brand-50 text-brand-600">
              {job.seniority}
            </span>
            <span className="badge bg-brand-50 text-brand-600">
              {job.locationType}
            </span>
            <span className="text-sm text-brand-500">
              {job.location}
            </span>
          </div>
          
          {/* Salary */}
          {(job.salaryMin || job.salaryMax) && (
            <p className="text-sm font-medium text-brand-700 mt-2">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency || 'EUR')}
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}
