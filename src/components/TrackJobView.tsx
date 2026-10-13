'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export function TrackJobView({ jobId, company }: { jobId: number; company: string }) {
  useEffect(() => {
    trackEvent({ name: 'job_view', params: { job_id: jobId, company } })
  }, [jobId, company])
  return null
}
