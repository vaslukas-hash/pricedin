'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { CATEGORIES, SENIORITY_LEVELS, REGIONS, LOCATION_TYPES, INDUSTRIES, SALARY_RANGES, POSTING_AGE_OPTIONS } from '@/lib/constants'

export function JobFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      // Reset to page 1 when filters change
      params.delete('page')
      return params.toString()
    },
    [searchParams]
  )
  
  const updateFilter = (name: string, value: string) => {
    router.push(`/jobs?${createQueryString(name, value)}`)
  }
  
  const clearFilters = () => {
    router.push('/jobs')
  }
  
  const hasFilters = searchParams.toString().length > 0
  
  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <label htmlFor="search" className="label">Search</label>
        <input
          type="text"
          id="search"
          placeholder="Title, company, or keyword..."
          className="input"
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => updateFilter('q', e.target.value)}
        />
      </div>
      
      {/* Category */}
      <div>
        <label htmlFor="category" className="label">Category</label>
        <select
          id="category"
          className="select"
          value={searchParams.get('category') || ''}
          onChange={(e) => updateFilter('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      {/* Seniority */}
      <div>
        <label htmlFor="seniority" className="label">Seniority</label>
        <select
          id="seniority"
          className="select"
          value={searchParams.get('seniority') || ''}
          onChange={(e) => updateFilter('seniority', e.target.value)}
        >
          <option value="">All Levels</option>
          {SENIORITY_LEVELS.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
      
      {/* Location Type */}
      <div>
        <label htmlFor="locationType" className="label">Work Type</label>
        <select
          id="locationType"
          className="select"
          value={searchParams.get('locationType') || ''}
          onChange={(e) => updateFilter('locationType', e.target.value)}
        >
          <option value="">All Types</option>
          {LOCATION_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      
      {/* Region */}
      <div>
        <label htmlFor="region" className="label">Region</label>
        <select
          id="region"
          className="select"
          value={searchParams.get('region') || ''}
          onChange={(e) => updateFilter('region', e.target.value)}
        >
          <option value="">All Regions</option>
          {REGIONS.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>
      
      {/* Industry */}
      <div>
        <label htmlFor="industry" className="label">Industry</label>
        <select
          id="industry"
          className="select"
          value={searchParams.get('industry') || ''}
          onChange={(e) => updateFilter('industry', e.target.value)}
        >
          <option value="">All Industries</option>
          {INDUSTRIES.map(ind => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>
      
      {/* Salary Range */}
      <div>
        <label htmlFor="salary" className="label">Salary Range</label>
        <select
          id="salary"
          className="select"
          value={searchParams.get('salary') || ''}
          onChange={(e) => updateFilter('salary', e.target.value)}
        >
          <option value="">Any Salary</option>
          {SALARY_RANGES.map((range, i) => (
            <option key={i} value={`${range.min}-${range.max}`}>{range.label}</option>
          ))}
        </select>
      </div>
      
      {/* Posted Within */}
      <div>
        <label htmlFor="posted" className="label">Posted</label>
        <select
          id="posted"
          className="select"
          value={searchParams.get('posted') || ''}
          onChange={(e) => updateFilter('posted', e.target.value)}
        >
          <option value="">Any Time</option>
          {POSTING_AGE_OPTIONS.map(opt => (
            <option key={opt.days} value={opt.days.toString()}>{opt.label}</option>
          ))}
        </select>
      </div>
      
      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="btn-ghost btn-sm w-full text-brand-500"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}
