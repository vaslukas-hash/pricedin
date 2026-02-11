'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header, Footer } from '@/components'
import { CATEGORIES, SENIORITY_LEVELS, REGIONS, LOCATION_TYPES, CURRENCIES, INDUSTRIES } from '@/lib/constants'
import { formatSalary } from '@/lib/utils'

interface FormData {
  companyName: string
  companyWebsite: string
  title: string
  description: string
  category: string
  seniority: string
  industry: string
  location: string
  locationType: string
  region: string
  salaryMin: string
  salaryMax: string
  salaryCurrency: string
  applyUrl: string
  contactEmail: string
}

const initialFormData: FormData = {
  companyName: '',
  companyWebsite: '',
  title: '',
  description: '',
  category: '',
  seniority: '',
  industry: '',
  location: '',
  locationType: '',
  region: '',
  salaryMin: '',
  salaryMax: '',
  salaryCurrency: 'EUR',
  applyUrl: '',
  contactEmail: '',
}

export default function PostJobPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required'
    if (!formData.title.trim()) newErrors.title = 'Job title is required'
    if (formData.description.length < 100) newErrors.description = 'Description must be at least 100 characters'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.seniority) newErrors.seniority = 'Seniority level is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.locationType) newErrors.locationType = 'Location type is required'
    if (!formData.region) newErrors.region = 'Region is required'
    if (!formData.applyUrl.trim()) newErrors.applyUrl = 'Apply URL is required'
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required'
    
    // URL validation
    if (formData.companyWebsite && !isValidUrl(formData.companyWebsite)) {
      newErrors.companyWebsite = 'Invalid URL'
    }
    if (formData.applyUrl && !isValidUrl(formData.applyUrl)) {
      newErrors.applyUrl = 'Invalid URL'
    }
    
    // Email validation
    if (formData.contactEmail && !isValidEmail(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email'
    }
    
    // Salary validation
    if (formData.salaryMin && formData.salaryMax) {
      if (parseInt(formData.salaryMin) > parseInt(formData.salaryMax)) {
        newErrors.salaryMin = 'Minimum cannot exceed maximum'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
  
  const handlePreview = () => {
    if (validate()) {
      setShowPreview(true)
    }
  }
  
  const handleSubmit = async () => {
    if (!validate()) return
    
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        router.push('/post-job/success')
      } else {
        setSubmitError(data.error || 'Something went wrong')
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (showPreview) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="mb-6">
              <button
                onClick={() => setShowPreview(false)}
                className="text-brand-600 hover:text-brand-800 text-sm font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to edit
              </button>
            </div>
            
            <div className="card p-6 sm:p-8 mb-6">
              <div className="mb-6">
                <p className="text-brand-600 mb-1">{formData.companyName}</p>
                <h1 className="text-2xl font-bold text-brand-900">{formData.title}</h1>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge-primary">{formData.category}</span>
                <span className="badge bg-brand-50 text-brand-600">{formData.seniority}</span>
                <span className="badge bg-brand-50 text-brand-600">{formData.locationType}</span>
                <span className="badge bg-brand-50 text-brand-600">{formData.region}</span>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-brand-600 mb-6">
                <span>{formData.location}</span>
                {(formData.salaryMin || formData.salaryMax) && (
                  <span className="font-medium text-brand-800">
                    {formatSalary(
                      formData.salaryMin ? parseInt(formData.salaryMin) : null,
                      formData.salaryMax ? parseInt(formData.salaryMax) : null,
                      formData.salaryCurrency
                    )}
                  </span>
                )}
              </div>
              
              <div className="prose-job">
                <div className="whitespace-pre-wrap">{formData.description}</div>
              </div>
            </div>
            
            <div className="card p-6 bg-amber-50 border-amber-200 mb-6">
              <p className="text-amber-800 text-sm">
                <strong>Note:</strong> Your job will be reviewed by our team before going live. 
                This usually takes less than 24 hours.
              </p>
            </div>
            
            {submitError && (
              <div className="card p-4 bg-red-50 border-red-200 mb-6">
                <p className="text-red-700 text-sm">{submitError}</p>
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowPreview(false)}
                className="btn-outline btn-lg flex-1"
              >
                Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-accent btn-lg flex-1"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Job'}
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-brand-900">Post a Job</h1>
            <p className="text-brand-600 mt-2">
              Reach thousands of pricing analysts, managers, and strategists actively looking for their next role.
            </p>
          </div>
          
          <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handlePreview(); }}>
            {/* Company Information */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-brand-900 mb-4">Company Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="companyName" className="label">Company Name *</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`input ${errors.companyName ? 'border-red-500' : ''}`}
                    placeholder="e.g., Stripe"
                  />
                  {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                </div>
                
                <div>
                  <label htmlFor="companyWebsite" className="label">Company Website</label>
                  <input
                    type="url"
                    id="companyWebsite"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    className={`input ${errors.companyWebsite ? 'border-red-500' : ''}`}
                    placeholder="https://company.com"
                  />
                  {errors.companyWebsite && <p className="text-red-500 text-sm mt-1">{errors.companyWebsite}</p>}
                </div>
              </div>
            </div>
            
            {/* Job Details */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-brand-900 mb-4">Job Details</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="label">Job Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`input ${errors.title ? 'border-red-500' : ''}`}
                    placeholder="e.g., Pricing Manager"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="label">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`select ${errors.category ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="seniority" className="label">Seniority Level *</label>
                    <select
                      id="seniority"
                      name="seniority"
                      value={formData.seniority}
                      onChange={handleChange}
                      className={`select ${errors.seniority ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select level</option>
                      {SENIORITY_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    {errors.seniority && <p className="text-red-500 text-sm mt-1">{errors.seniority}</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="industry" className="label">Industry</label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="select"
                  >
                    <option value="">Select industry (optional)</option>
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="description" className="label">Job Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={12}
                    className={`textarea ${errors.description ? 'border-red-500' : ''}`}
                    placeholder="Describe the role, responsibilities, requirements, and benefits..."
                  />
                  <p className="text-brand-500 text-sm mt-1">
                    {formData.description.length}/100 minimum characters. 
                    Use ## for headings and - for bullet points.
                  </p>
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
            </div>
            
            {/* Location */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-brand-900 mb-4">Location</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location" className="label">Location *</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`input ${errors.location ? 'border-red-500' : ''}`}
                      placeholder="e.g., San Francisco, CA"
                    />
                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="region" className="label">Region *</label>
                    <select
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className={`select ${errors.region ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select region</option>
                      {REGIONS.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                    {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="locationType" className="label">Work Type *</label>
                  <select
                    id="locationType"
                    name="locationType"
                    value={formData.locationType}
                    onChange={handleChange}
                    className={`select ${errors.locationType ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select work type</option>
                    {LOCATION_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.locationType && <p className="text-red-500 text-sm mt-1">{errors.locationType}</p>}
                </div>
              </div>
            </div>
            
            {/* Compensation */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-brand-900 mb-4">Compensation</h2>
              <p className="text-brand-500 text-sm mb-4">
                Adding salary information increases applications by 30%+
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="salaryMin" className="label">Minimum Salary</label>
                  <input
                    type="number"
                    id="salaryMin"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    className={`input ${errors.salaryMin ? 'border-red-500' : ''}`}
                    placeholder="e.g., 80000"
                  />
                  {errors.salaryMin && <p className="text-red-500 text-sm mt-1">{errors.salaryMin}</p>}
                </div>
                
                <div>
                  <label htmlFor="salaryMax" className="label">Maximum Salary</label>
                  <input
                    type="number"
                    id="salaryMax"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., 120000"
                  />
                </div>
                
                <div>
                  <label htmlFor="salaryCurrency" className="label">Currency</label>
                  <select
                    id="salaryCurrency"
                    name="salaryCurrency"
                    value={formData.salaryCurrency}
                    onChange={handleChange}
                    className="select"
                  >
                    {CURRENCIES.map(curr => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} ({curr.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Application */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-brand-900 mb-4">Application</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="applyUrl" className="label">Apply URL *</label>
                  <input
                    type="url"
                    id="applyUrl"
                    name="applyUrl"
                    value={formData.applyUrl}
                    onChange={handleChange}
                    className={`input ${errors.applyUrl ? 'border-red-500' : ''}`}
                    placeholder="https://company.com/careers/job-123"
                  />
                  {errors.applyUrl && <p className="text-red-500 text-sm mt-1">{errors.applyUrl}</p>}
                </div>
                
                <div>
                  <label htmlFor="contactEmail" className="label">Contact Email *</label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className={`input ${errors.contactEmail ? 'border-red-500' : ''}`}
                    placeholder="hiring@company.com"
                  />
                  <p className="text-brand-500 text-sm mt-1">
                    For admin contact only. Not displayed publicly.
                  </p>
                  {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
                </div>
              </div>
            </div>
            
            {/* Submit */}
            <div className="flex gap-4">
              <Link href="/jobs" className="btn-outline btn-lg flex-1 text-center">
                Cancel
              </Link>
              <button type="submit" className="btn-accent btn-lg flex-1">
                Preview Job
              </button>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
