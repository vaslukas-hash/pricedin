'use client'

import { useState } from 'react'
import { Job } from '@/lib/db/schema'
import { JobCard } from './JobCard'
import { JobDetailModal } from './JobDetailModal'

interface JobsListWithModalProps {
  jobs: Job[]
}

interface JobWithDetails extends Job {
  id: number
  slug: string
  companyName: string
  companyWebsite: string | null
  title: string
  description: string
  category: string
  seniority: string
  industry: string | null
  location: string
  locationType: string
  region: string
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string | null
  applyUrl: string
  isFeatured: boolean
  createdAt: string
}

export function JobsListWithModal({ jobs }: JobsListWithModalProps) {
  const [selectedJob, setSelectedJob] = useState<JobWithDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleJobClick = async (job: Job) => {
    setIsLoading(true)
    setIsModalOpen(true)

    try {
      // Fetch full job details from API
      const response = await fetch(`/api/jobs/${job.slug}`)
      if (!response.ok) throw new Error('Failed to fetch job details')

      const jobDetails = await response.json()
      setSelectedJob(jobDetails as JobWithDetails)
    } catch (error) {
      console.error('Error fetching job details:', error)
      setIsModalOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedJob(null), 300) // Clear after animation
  }

  return (
    <>
      <div className="space-y-4">
        {jobs.map((job, i) => (
          <div
            key={job.id}
            className="animate-slide-in-up"
            style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
          >
            <JobCard
              job={job}
              featured={job.isFeatured || false}
              onClick={() => handleJobClick(job)}
            />
          </div>
        ))}
      </div>

      {/* Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Loading overlay inside modal */}
      {isLoading && isModalOpen && !selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-3 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-brand-600">Loading job details...</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
