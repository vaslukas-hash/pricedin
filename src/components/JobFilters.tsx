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
    <div className="space-y-3">
      {/* Search - Full Width */}
      <div>
        <input
          type="text"
          id="search"
          placeholder="Search by title, company, or keyword..."
          className="input text-sm"
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => updateFilter('q', e.target.value)}
        />
      </div>

      {/* Primary Filters - Horizontal Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <select
          id="category"
          className="select text-sm py-2"
          value={searchParams.get('category') || ''}
          onChange={(e) => updateFilter('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          id="seniority"
          className="select text-sm py-2"
          value={searchParams.get('seniority') || ''}
          onChange={(e) => updateFilter('seniority', e.target.value)}
        >
          <option value="">All Levels</option>
          {SENIORITY_LEVELS.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>

        <select
          id="locationType"
          className="select text-sm py-2"
          value={searchParams.get('locationType') || ''}
          onChange={(e) => updateFilter('locationType', e.target.value)}
        >
          <option value="">All Types</option>
          {LOCATION_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select
          id="region"
          className="select text-sm py-2"
          value={searchParams.get('region') || ''}
          onChange={(e) => updateFilter('region', e.target.value)}
        >
          <option value="">All Regions</option>
          {REGIONS.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>

      {/* Secondary Filters - Collapsible */}
      <details className="text-sm">
        <summary className="cursor-pointer text-brand-600 hover:text-brand-800 font-medium py-1">
          More filters
        </summary>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <select
            id="industry"
            className="select text-sm py-2"
            value={searchParams.get('industry') || ''}
            onChange={(e) => updateFilter('industry', e.target.value)}
          >
            <option value="">All Industries</option>
            {INDUSTRIES.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>

          <select
            id="salary"
            className="select text-sm py-2"
            value={searchParams.get('salary') || ''}
            onChange={(e) => updateFilter('salary', e.target.value)}
          >
            <option value="">Any Salary</option>
            {SALARY_RANGES.map((range, i) => (
              <option key={i} value={`${range.min}-${range.max}`}>{range.label}</option>
            ))}
          </select>

          <select
            id="posted"
            className="select text-sm py-2"
            value={searchParams.get('posted') || ''}
            onChange={(e) => updateFilter('posted', e.target.value)}
          >
            <option value="">Any Time</option>
            {POSTING_AGE_OPTIONS.map(opt => (
              <option key={opt.days} value={opt.days.toString()}>{opt.label}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="btn-ghost text-sm py-2 text-brand-500 hover:text-brand-700"
            >
              Clear filters
            </button>
          )}
        </div>
      </details>
    </div>
  )
}
