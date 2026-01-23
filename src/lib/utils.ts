import slugify from 'slugify'
import { CURRENCIES } from './constants'

export function generateSlug(companyName: string, title: string): string {
  const base = slugify(`${companyName} ${title}`, { lower: true, strict: true })
  const random = Math.random().toString(36).substring(2, 6)
  return `${base}-${random}`
}

export function formatSalary(min: number | null, max: number | null, currency: string): string {
  const curr = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0]
  
  if (!min && !max) return 'Competitive'
  
  const formatNum = (n: number) => {
    if (n >= 1000) return `${Math.round(n / 1000)}k`
    return n.toString()
  }
  
  if (min && max) {
    return `${curr.symbol}${formatNum(min)} - ${curr.symbol}${formatNum(max)}`
  }
  if (min) return `From ${curr.symbol}${formatNum(min)}`
  if (max) return `Up to ${curr.symbol}${formatNum(max)}`
  
  return 'Competitive'
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

export function timeAgo(dateString: string | null): string {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function sanitizeHtml(html: string): string {
  // Basic sanitization - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getExpirationDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString()
}
