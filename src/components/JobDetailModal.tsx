'use client'

import { Modal } from './Modal'
import { formatSalary, timeAgo, sanitizeHtml } from '@/lib/utils'
import type { Job } from '@/lib/db/schema'

interface JobDetailModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
}

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

function ApplyButton({ job }: { job: Job }) {
  const handleClick = () => {
    // Track click analytics
    fetch('/api/analytics/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id }),
    }).catch(() => {})

    // Open apply URL
    window.open(job.applyUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      className="btn-accent btn-lg w-full sm:w-auto"
    >
      Apply Now
      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </button>
  )
}

export function JobDetailModal({ job, isOpen, onClose }: JobDetailModalProps) {
  if (!job) return null

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency || 'EUR')

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6">
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

        {/* CTA */}
        <div className="mb-6 pb-6 border-b border-brand-100">
          <ApplyButton job={job} />
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-brand-900 mb-4">About this role</h2>
          <div
            className="prose-job"
            dangerouslySetInnerHTML={{ __html: renderDescription(job.description) }}
          />
        </div>

        {/* Bottom CTA */}
        <div className="pt-6 border-t border-brand-100 bg-gradient-to-r from-brand-50 to-brand-100/50 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 px-6 sm:px-8 py-6 rounded-b-2xl">
          <h3 className="text-lg font-semibold text-brand-900 mb-2">Interested in this role?</h3>
          <p className="text-brand-600 mb-4">
            Apply now on {job.companyName}&apos;s website. Great pricing roles fill fast.
          </p>
          <ApplyButton job={job} />
        </div>
      </div>
    </Modal>
  )
}
