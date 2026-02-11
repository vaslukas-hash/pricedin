'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Job } from '@/lib/db/schema'
import { formatSalary, timeAgo } from '@/lib/utils'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'expired'>('pending')
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, expired: 0 })
  const [uploadResult, setUploadResult] = useState<{
    total: number; success: number; failed: number;
    results: { row: number; status: string; slug?: string; errors?: Record<string, string[]> }[]
  } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  
  const fetchJobs = async (statusFilter: string) => {
    try {
      const res = await fetch(`/api/admin/jobs?status=${statusFilter}`)
      if (res.status === 401) {
        setIsAuthenticated(false)
        return
      }
      const data = await res.json()
      setJobs(data.jobs || [])
    } catch (err) {
      console.error('Error fetching jobs:', err)
    }
  }
  
  const fetchStats = async () => {
    const statuses = ['pending', 'approved', 'rejected', 'expired']
    const counts: any = {}
    
    for (const s of statuses) {
      try {
        const res = await fetch(`/api/admin/jobs?status=${s}`)
        if (res.ok) {
          const data = await res.json()
          counts[s] = data.jobs?.length || 0
        }
      } catch {
        counts[s] = 0
      }
    }
    
    setStats(counts)
  }
  
  useEffect(() => {
    // Check if already authenticated by trying to fetch
    fetch('/api/admin/jobs?status=pending')
      .then(res => {
        if (res.ok) {
          setIsAuthenticated(true)
          fetchJobs('pending')
          fetchStats()
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchJobs(status)
    }
  }, [status, isAuthenticated])
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      
      if (res.ok) {
        setIsAuthenticated(true)
        fetchJobs(status)
        fetchStats()
      } else {
        setError('Invalid password')
      }
    } catch {
      setError('Authentication failed')
    }
  }
  
  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    setIsAuthenticated(false)
    setPassword('')
  }
  
  const handleAction = async (jobId: number, action: string, extra?: any) => {
    try {
      await fetch('/api/admin/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action, ...extra }),
      })
      fetchJobs(status)
      fetchStats()
    } catch (err) {
      console.error('Error:', err)
    }
  }
  
  const handleDelete = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    
    try {
      await fetch(`/api/admin/jobs?id=${jobId}`, { method: 'DELETE' })
      fetchJobs(status)
      fetchStats()
    } catch (err) {
      console.error('Error:', err)
    }
  }
  
  const handleDownloadTemplate = () => {
    window.location.href = '/api/admin/jobs/template'
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError('')
    setUploadResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/jobs/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.status === 401) {
        setIsAuthenticated(false)
        return
      }

      const data = await res.json()

      if (!res.ok) {
        setUploadError(data.error || 'Upload failed')
      } else {
        setUploadResult(data)
        fetchJobs(status)
        fetchStats()
      }
    } catch {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <div className="text-brand-600">Loading...</div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
        <div className="card p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-lg bg-brand-900 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">P</span>
            </div>
            <h1 className="text-2xl font-bold text-brand-900">Admin Login</h1>
            <p className="text-brand-600 text-sm mt-1">Enter your admin password</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            
            <button type="submit" className="btn-primary btn-lg w-full">
              Login
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-brand-600 hover:text-brand-800 text-sm">
              ← Back to site
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-brand-50">
      {/* Header */}
      <header className="bg-white border-b border-brand-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-900 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-brand-900">Admin</span>
            </Link>
          </div>
          <button onClick={handleLogout} className="btn-ghost btn-sm">
            Logout
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-brand-600 text-sm">Pending</p>
          </div>
          <div className="card p-4">
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-brand-600 text-sm">Approved</p>
          </div>
          <div className="card p-4">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-brand-600 text-sm">Rejected</p>
          </div>
          <div className="card p-4">
            <p className="text-2xl font-bold text-brand-400">{stats.expired}</p>
            <p className="text-brand-600 text-sm">Expired</p>
          </div>
        </div>

        {/* Bulk Upload Section */}
        <div className="card p-5 mb-8">
          <h3 className="font-semibold text-brand-900 mb-3">Bulk Upload Jobs</h3>
          <p className="text-brand-600 text-sm mb-4">
            Upload an Excel file to create multiple jobs at once. Jobs will be auto-approved.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleDownloadTemplate} className="btn-outline btn-sm">
              Download Template
            </button>
            <label className={`btn-primary btn-sm cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
              {uploading ? 'Uploading...' : 'Upload Excel File'}
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {uploadError && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
              {uploadError}
            </div>
          )}

          {uploadResult && (
            <div className="mt-4">
              <div className="p-3 bg-brand-50 rounded-lg mb-3">
                <p className="text-sm font-medium text-brand-900">
                  Upload Complete: {uploadResult.success} of {uploadResult.total} jobs created
                  {uploadResult.failed > 0 && (
                    <span className="text-red-600"> ({uploadResult.failed} failed)</span>
                  )}
                </p>
              </div>

              {uploadResult.results.filter(r => r.status === 'error').length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-600">Errors:</p>
                  {uploadResult.results
                    .filter(r => r.status === 'error')
                    .map((r, idx) => (
                      <div key={idx} className="p-2 bg-red-50 rounded text-xs text-red-700">
                        <strong>Row {r.row}:</strong>{' '}
                        {Object.entries(r.errors || {}).map(([field, msgs]) =>
                          `${field}: ${(msgs as string[]).join(', ')}`
                        ).join(' | ')}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['pending', 'approved', 'rejected', 'expired'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                status === s 
                  ? 'bg-brand-900 text-white' 
                  : 'bg-white text-brand-600 hover:bg-brand-50'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="ml-1.5 text-xs opacity-70">
                ({stats[s]})
              </span>
            </button>
          ))}
        </div>
        
        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-brand-600">No {status} jobs</p>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="card p-5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-600 font-semibold">
                          {job.companyName.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-brand-900 truncate">{job.title}</h3>
                        <p className="text-brand-600 text-sm">{job.companyName}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="badge-primary text-xs">{job.category}</span>
                          <span className="badge bg-brand-50 text-brand-600 text-xs">{job.seniority}</span>
                          <span className="badge bg-brand-50 text-brand-600 text-xs">{job.locationType}</span>
                          <span className="badge bg-brand-50 text-brand-600 text-xs">{job.region}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-brand-500">
                          <span>{job.location}</span>
                          <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency || 'EUR')}</span>
                          <span>{timeAgo(job.createdAt)}</span>
                          {job.isFeatured && (
                            <span className="text-accent-600 font-medium">★ Featured</span>
                          )}
                        </div>
                        {status === 'approved' && (
                          <div className="flex gap-4 mt-2 text-sm text-brand-500">
                            <span>👁 {job.views} views</span>
                            <span>🖱 {job.clicks} clicks</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
                    {status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(job.id, 'approve')}
                          className="btn bg-green-600 hover:bg-green-700 text-white btn-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(job.id, 'reject')}
                          className="btn bg-red-600 hover:bg-red-700 text-white btn-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {status === 'approved' && (
                      <>
                        <button
                          onClick={() => handleAction(job.id, 'feature', { isFeatured: !job.isFeatured })}
                          className={`btn btn-sm ${
                            job.isFeatured 
                              ? 'bg-accent-100 text-accent-700 hover:bg-accent-200' 
                              : 'btn-outline'
                          }`}
                        >
                          {job.isFeatured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button
                          onClick={() => handleAction(job.id, 'expire')}
                          className="btn-outline btn-sm"
                        >
                          Expire
                        </button>
                      </>
                    )}
                    
                    {status === 'rejected' && (
                      <button
                        onClick={() => handleAction(job.id, 'approve')}
                        className="btn bg-green-600 hover:bg-green-700 text-white btn-sm"
                      >
                        Approve
                      </button>
                    )}
                    
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost btn-sm"
                    >
                      View →
                    </a>
                    
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="btn text-red-600 hover:bg-red-50 btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {/* Description preview */}
                <details className="mt-4">
                  <summary className="text-sm text-brand-600 cursor-pointer hover:text-brand-800">
                    Show description
                  </summary>
                  <div className="mt-2 p-4 bg-brand-50 rounded-lg text-sm text-brand-700 whitespace-pre-wrap">
                    {job.description}
                  </div>
                </details>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
